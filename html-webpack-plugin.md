#### 1.html-webpack-plugin提供的emit阶段修改chunk的时机

```js
    chunks = compilation.applyPluginsWaterfall('html-webpack-plugin-alter-chunks', chunks, { plugin: self });

```

```js
  return applyPluginsAsyncWaterfall('html-webpack-plugin-before-html-generation', false, {
          assets: assets,//包括favicon的内容
          outputName: self.childCompilationOutputName,//文件名
          plugin: self//html-webpack-plugin实例对象this
        })
```
