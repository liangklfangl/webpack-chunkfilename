var webpack = require('webpack');

module.exports = {
    entry:  './src',
    output: {
        path:     'builds',
        filename: 'bundle.js',
        publicPath: 'builds/',
    },
    plugins: [
        // new webpack.optimize.CommonsChunkPlugin({
        //     // async: true,
        //     name:      'main', // Move dependencies to our main file
        //     children:  true, // Look for common dependencies in all children,
        //     minChunks: 2, // How many times a dependency must come up before being extracted
        // }),
         new webpack.optimize.CommonsChunkPlugin({
                // async: true,
                filename:'vendor.bundle.js',
                name:      'vendor', // Move dependencies to our main file
                // children:  true, // Look for common dependencies in all children,
                minChunks: 2, // How many times a dependency must come up before being extracted
            }),

    ],
    module: {
         loaders: [
         {
            test: /\.js$/,
             enforce: "pre",
             loader: "eslint-loader"
          },
           {
                test:    /\.js/,
                loader:  'babel-loader',
                include: __dirname + '/src',
            },
            {
                test:   /\.scss/,
                loader: 'style-loader!css-loader!sass-loader',
                // Or
               // loaders: ['style', 'css', 'sass'],
               //这里必须是loader后缀
            },
            {
                test:   /\.html/,
                loader: 'html-loader',
            }
        ],
    }
};