var LiveReloadPlugin = require('webpack-livereload-plugin');
var webpack = require('webpack');

module.exports = {
    resolve: {
        extensions: ['', '.ts', '.js']
    },

    plugins: [
        new LiveReloadPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],

    entry: './src/main.ts',
    output: {
        path: __dirname + "/dist",
        publicPath: 'dist/',
        filename: "game.js"
    },

    devtool: 'source-map',

    module: {
        loaders: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
            }
        ]
    },

    devServer: {
        historyApiFallback: true,
        hot: true
    }
};