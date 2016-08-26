var webpack = require('webpack');

module.exports = {
    resolve: {
        extensions: ['', '.ts', '.js']
    },

    target: 'node',
    entry: './server/src/main.ts',
    output: {
        path: __dirname + "/dist/server/",
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
                loader: 'ts-loader?configFileName=tsconfig.server.json'
            },
        ]
    },

};