const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const distDir = `${__dirname}/dist`;

const isProduction = process.env.NODE_ENV == 'production' || process.argv.indexOf('-p') !== -1;

let optionalPlugins = [];

if (isProduction) {
    optionalPlugins.push(new webpack.optimize.UglifyJsPlugin({comments: false}));
}

module.exports = {
    context: `${__dirname}/src`,
    entry: './script.js',
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
                        presets: [["es2015"]]
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'style-loader'
                    },{
                        loader: 'css-loader',
                        options: {
                            minimize: isProduction,
                            modules: true,
                            importLoaders: 2,
                            localIdentName: isProduction ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]'
                        }
                    }, {
                        loader: 'autoprefixer-loader',
                        options: {
                            browsers: 'last 2 version'
                        }
                    }, {
                        loader: 'sass-loader'
                    }
                ]
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: './manifest.json', to: distDir },
            { from: './_locales/**', to: distDir }
        ]),
        new webpack.ProvidePlugin({
            Promise: 'bluebird'
        }),
        ...optionalPlugins
    ]
};