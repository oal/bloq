var path = require('path');
var webpack = require('webpack');

module.exports = {
    resolve: {
        extensions: ['', '.ts', '.js'],
		// alias: { src: path.resolve(__dirname, '../shared/'), common: path.resolve(__dirname, 'src/shared/') },
		// modules: [
		// 	path.resolve(__dirname, 'node_modules'),
		// ],
		root: [path.resolve(__dirname, 'node_modules')]
    },

	resolveLoader: {
		root: [path.resolve(__dirname, 'node_modules')]
	},


    entry: './src/main.ts',
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
                loader: 'ts-loader'
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