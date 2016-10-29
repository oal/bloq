var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    resolve: {
        extensions: ['', '.ts', '.js'],
        root: [path.resolve(__dirname, 'node_modules')],
        alias: {
            modernizr$: path.resolve(__dirname, "./.modernizrrc")
        }
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
                test: /\.css$/,
                loaders: ['style', 'css']
            },
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass']
            },
            {
                test: /\.(png|jpg|json|svg)$/,
                loaders: ['file']
            },
            {
                test: /\.modernizrrc$/,
                loader: 'modernizr'
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Bloq',
            filename: 'index.html',
            template: './assets/index.html',
            inject: false,
        })
    ],

    devServer: {
        historyApiFallback: true,
        hot: true,
        host: '0.0.0.0',
        contentBase: './dist'
    }
};