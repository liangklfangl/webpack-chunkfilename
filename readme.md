#### 问题1:path.resolve和require.resolve的区别

path.resolve: 如果两者都是绝对路径，那么直接返回第二个绝对路径；否则后续参数相对于前面参数叠加，直到取出绝对路径为止

```js
path.resolve('/foo/bar', './baz')
// Returns: '/foo/bar/baz'

path.resolve('/foo/bar', '/tmp/file/')
// Returns: '/tmp/file'

path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif')
// if the current working directory is /home/myself/node,
// this returns '/home/myself/node/wwwroot/static_files/gif/image.gif'
```

require.resolve: 可以使用require.resolve函数来查询某个模块文件的带有完整绝对路径的文件名，代码如下所示:
  
  ```js
  require.resolve('./testModule.js');//得到带有完整路径+文件名形式
  ```

在这行代码中，我们使用require.resolve函数来查询当前目录下testModule.js模块文件的带有完整绝对路径的模块文件名。
 注意：使用require.resolve函数查询模块文件名时并不会加载该模块。同时require.resolve用于加载wcf中的plugin:

```js
require.resolve('postcss-loader')
```

如果只有一个参数的情况下，如下的path.resolve得到同样的结果，其都是相对于项目路径的:

```js
    const path = require("path");
   console.log(path.resolve("./index.html"));
   // 和
   const path = require("path");
   console.log(path.resolve("index.html"));
```

都输出:

C:\Users\Administrator\Desktop\webpack-chunkfilename\index.html。其中webpack-chunkfilename是项目路径。`如果resolve一个node_modules中的模块，那么会一直到如index的文件的路径`

下面是一个稍微复杂的点的例子(来源于html-webpack-plugin):

```js
 var publicPath = typeof compilation.options.output.publicPath !== 'undefined'
    // If a hard coded public path exists use it
    ? compilation.mainTemplate.getPublicPath({hash: webpackStatsJson.hash})
    // If no public path was set get a relative url path
    // 这个publicPath是可以使用hash的
    : path.relative(path.resolve(compilation.options.output.path, path.dirname(self.childCompilationOutputName)), compilation.options.output.path)
      .split(path.sep).join('/');
```

注意：require和require.resolve加载一个模块的时候和package.json也有关系:
 
```js
var phantomSource = require('phantomjs-prebuilt').path
 require.resolve('phantomjs-prebuilt');
```

当我们的phantomjs-prebuilt中没有index文件的时候就会查找package.json中的main字段:

```js
  "main": "lib/phantomjs",
```

最后得到的路径就是如下的:

```js
 C:\Users\Administrator\Desktop\yo-react\node_modules\phantomjs-prebuilt\lib\phantomjs.js
```

但是path.resolve得到的结果和package.json无关：

```js
 C:\Users\Administrator\Desktop\yo-react\phantomjs-prebuilt
```


#### 问题2:如何判断用户传入的是绝对路径

  这个if只有在用户配置了绝对路径才有用。也就是说如果用户配置了filename为绝对路径那么将filename设置为相对于输出路径的相对路径。

```js
  if (path.resolve(filename) === path.normalize(filename)) {
    this.options.filename = path.relative(compiler.options.output.path, filename);//relative表示第二个参数相对于第一个参数取相对路径
  }
```

normalize表示路径中的".或者.."都会被解析了,对于normalize方法下面也是返回相同:
  
```js
   const path = require("path");
    console.log(path.normalize("./index.html"));
    //和
     const path = require("path");
    console.log(path.normalize("index.html"));
```

都是返回index.html,它只是将路径中的符号解析掉，而这里没有路径。

下面是一个问题1和问题2的两个综合例子:

例子1：

```js
   const path = require("path");
   console.log(path.resolve("./bin/index.html"));
   console.log(path.normalize("./bin/index.html"));
```

输出结果为：

 C:\Users\Administrator\Desktop\webpack-chunkfilename\bin\index.html
  bin\index.html

例子2：HtmlWebpackPlugin的例子

```js
HtmlWebpackPlugin.prototype.getFullTemplatePath = function (template, context) {
  // If the template doesn't use a loader use the lodash template loader
  if (template.indexOf('!') === -1) {
    template = require.resolve('./lib/loader.js') + '!' + path.resolve(context, template);
    //对于我们的这个ejs文件，我们使用特定的loader加载
  }
  // Resolve template path
  return template.replace(
    /([!])([^/\\][^!?]+|[^/\\!?])($|\?[^!?\n]+$)/,
    function (match, prefix, filepath, postfix) {
      return prefix + path.resolve(filepath) + postfix;
    });
};
```

这个例子中的template是我们配置的模板html的位置，这个位置是相对于项目根目录的,如果用户本身配置的就是绝对路径那么直接使用用户配置的绝对路径，否则路径是相对于项目根目录的。

#### 问题3:Path.dirname的特殊形式

```js
const path = require("path");
console.log(path.dirname("index.html"));//结果是"."，和"./index.html"一致
```

下面是path.basename的特殊情况:

```js
 const path = require('path');
 console.log(path.basename("C:\\Users\\Administrator\\Desktop\\generator-kissy-gallery"));//结果为generator-kissy-gallery
```


#### 问题4:遍历得到一个文件夹下所有的文件

```js
function findMDFile(source){
  //R.chain will combine our arrays in array
 return R.pipe(
    R.filter(R.either(isDirectory, isMDFile)),
    R.chain((filename) => {
      if (isDirectory(filename)) {
        const subFiles = fs.readdirSync(filename)
                .map((subFile) => path.join(filename, subFile));
        return findMDFile(subFiles);
      }
      return [filename];
    })
  )(source);
}
```

#### 问题5：如何判断一个路径是绝对路径或者相对路径
方法二：

```js
"use strict";
const path = require("path");
const matchRelativePath = /^\.\.?[/\\]/;
function isAbsolutePath(str) {
  return path.posix.isAbsolute(str) || path.win32.isAbsolute(str);
}
function isRelativePath(str) {
  return matchRelativePath.test(str);
}
//调用loaderUtils.stringifyRequest(this, "!!" + remainingRequest)
function stringifyRequest(loaderContext, request) {
  const splitted = request.split("!");
   console.log("loaderContext",loaderContext);
  /*
 [ '',
  '',
  'C:\\Users\\Administrator\\Desktop\\style-loader-source\\node_modules\\css-loa
der\\index.js',
  'C:\\Users\\Administrator\\Desktop\\style-loader-source\\index.css' ]
   */
  const context = loaderContext.context || (loaderContext.options && loaderContext.options.context);
  return JSON.stringify(splitted.map(part => {
    // First, separate singlePath from query, because the query might contain paths again
    const splittedPart = part.match(/^(.*?)(\?.*)/);
    let singlePath = splittedPart ? splittedPart[1] : part;
    const query = splittedPart ? splittedPart[2] : "";
    if(isAbsolutePath(singlePath) && context) {
      singlePath = path.relative(context, singlePath);
      if(isAbsolutePath(singlePath)) {
        // If singlePath still matches an absolute path, singlePath was on a different drive than context.
        // In this case, we leave the path platform-specific without replacing any separators.
        // @see https://github.com/webpack/loader-utils/pull/14
        return singlePath + query;
      }
      if(isRelativePath(singlePath) === false) {
        // Ensure that the relative path starts at least with ./ otherwise it would be a request into the modules directory (like node_modules).
        singlePath = "./" + singlePath;
      }
    }
    return singlePath.replace(/\\/g, "/") + query;
  }).join("!"));
}

module.exports = stringifyRequest;
```

或者[查看这个库](https://github.com/liangklfang/path-is-absolute)

#### 6.如何使用本地node_modules中版本替换全局命令

```js
//其中这段代码在webpack-dev-server/bin下并进行了全局安装
try {
  const localWebpackDevServer = require.resolve(path.join(process.cwd(), "node_modules", "webpack-dev-server", "bin", "webpack-dev-server.js"));
  if(__filename !== localWebpackDevServer) {
    return require(localWebpackDevServer);
  }
} catch(e) {}
```


#### 7.如何将日志分级输出

```js
function colorInfo(useColor, msg) {
  if(useColor)
    // Make text blue and bold, so it *pops*
    return `\u001b[1m\u001b[34m${msg}\u001b[39m\u001b[22m`;
  return msg;
}

function colorError(useColor, msg) {
  if(useColor)
    // Make text red and bold, so it *pops*
    return `\u001b[1m\u001b[31m${msg}\u001b[39m\u001b[22m`;
  return msg;
}
```


#### 8.如何对一个复杂的对象进行字符串化

```js
function stringify(node, depth = 0) {
  const indent = '  '.repeat(depth);
  if (Array.isArray(node)) {
    return `[\n` +
      node.map(item => `${indent}  ${stringify(item, depth + 1)}`).join(',\n') +
      `\n${indent}]`;
  }
  if (
    typeof node === 'object' &&
      node !== null &&
      !(node instanceof Date)
  ) {
    // if (node.__BISHENG_EMBEDED_CODE) {
    //   return node.code;
    // }
    return `{\n` +
      Object.keys(node).map((key) => {
        const value = node[key];
        return `${indent}  "${key}": ${stringify(value, depth + 1)}`;
      }).join(',\n') +
      `\n${indent}}`;
  }
  return JSON.stringify(node, null, 2);
}

```

#### 9.为某一个特定的文件添加一个loader

```js
 webpackConfig.module.rules.push({
    test(filename) {
      return filename === path.join(__dirname,"..", 'utils', 'data.js') ||
        filename === path.join(__dirname,"..", 'utils', 'ssr-data.js');
    },
    loader: `${path.join(__dirname,"..", "loaders",'bisheng-data-loader')}` +
      `?config=${configFile}`,
  });
```


####10.如何导出一个loader

```js
  return 'var Promise = require(\'bluebird\');\n' +
    'module.exports = {' +
    `\n  markdown: ${markdownData.stringify(markdown, config.lazyLoad, isSSR)},` +
    `\n  plugins: [\n${pluginsString}\n],` +
    `\n  picked: ${JSON.stringify(picked, null, 2)},` +
    `\n};`;
```
