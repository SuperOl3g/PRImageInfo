const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const srcDir = `${__dirname}/src`;
const distDir = `${__dirname}/dist`;

module.exports = {
    entry: `${srcDir}/script.js`,
    output: {
        path: distDir,
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [["es2015", {"modules": false }]]

                    }
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([{ from: `${srcDir}/manifest.json`, to: distDir }]),
        new webpack.optimize.UglifyJsPlugin({comments: false})
    ]
};