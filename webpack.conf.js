const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

module.exports = {
    entry: {
        'vendor': [
            'babylonjs'
        ],
        'app': [
            './src/app.ts'
        ],
        'spec': [
            './src/spec.ts'
        ]
    },

    output: {
        path: './dist',
        filename: '[name].js'
    },

    resolve: {
        extensions: ['.js', '.ts']
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            }
        ]
    },

    devtool: 'source-map',

    plugins: [
        new HtmlWebpackPlugin({
            template: './index.ejs',
            excludeChunks: ['spec']
        }),
        new CommonsChunkPlugin({
            name: 'vendor'
        })
    ]
};
