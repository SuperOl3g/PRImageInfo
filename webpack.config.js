const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const srcDir = `${__dirname}/src`;
const distDir = `${__dirname}/dist`;

const isProduction = process.env.NODE_ENV == 'production' || process.argv.indexOf('-p') !== -1;

let optionalPlugins = [];

if (isProduction) {
    optionalPlugins.push(new webpack.optimize.UglifyJsPlugin({comments: false}));
}

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
                            importLoaders: 1,
                            localIdentName: isProduction ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]'
                        }
                    }, {
                        loader: 'autoprefixer-loader',
                        options: {
                            browsers: 'last 2 version'
                        }
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([{ from: `${srcDir}/manifest.json`, to: distDir }]),
        ...optionalPlugins
    ]
};