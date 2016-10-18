var path = require('path');
var webpack = require('webpack');

module.exports = {
    resolve: {
        extensions: ['', '.ts', '.js'],
        root: [path.resolve(__dirname, 'node_modules')]
    },

    resolveLoader: {
        root: [path.resolve(__dirname, 'node_modules')]
    },


    entry: './src/main.ts',
    output: {
        path: __dirname + '/dist/',
        publicPath: '/',
        filename: 'game.js'
    },

    devtool: 'source-map',

    module: {
        loaders: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
            },
            {
                test: /\.glsl$/,
                loader: 'raw'
            },
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass']
            },
            {
                test: /\.(png|jpg|json)$/,
                loaders: ['file']
            }
        ]
    },

    devServer: {
        historyApiFallback: true,
        hot: true,
        host: '0.0.0.0',
        contentBase: './dist'
    }
};