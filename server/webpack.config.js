var webpack = require('webpack');

module.exports = {
    resolve: {
        extensions: ['', '.ts', '.js']
    },

    target: 'node',
    entry: './src/main.ts',
    output: {
        filename: "server.js"
    },

    module: {
        noParse: ['ws'],
        preLoaders: [
            {test: /\.json$/, loader: 'json'},
        ],
        loaders: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
            },
        ]
    },

};