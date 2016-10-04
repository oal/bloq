var LiveReloadPlugin = require('webpack-livereload-plugin');
var webpack = require('webpack');
console.log(__dirname);
module.exports = {
    resolve: {
        extensions: ['', '.ts', '.js']
    },

    plugins: [
        new LiveReloadPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],

    entry: './client/src/main.ts',
    output: {
        path: __dirname + "/dist/client/",
        publicPath: "dist/client/",
        filename: "game.js"
    },

    devtool: 'source-map',

    module: {
        loaders: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader?configFileName=tsconfig.client.json'
            },
            { test: /\.glsl$/, loader: 'raw' },
        ]
    },

    devServer: {
        historyApiFallback: true,
        hot: true,
        host: '0.0.0.0'
    }
};