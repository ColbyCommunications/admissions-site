const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const autoprefixer = require('autoprefixer');
const _remove = require('lodash/remove');
const _isEmpty = require('lodash/isEmpty');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const currentDir = path.resolve(process.cwd());

const postcssLoader = {
    loader: 'postcss-loader',
    options: {
        ident: 'postcss',
        plugins: loader => [
            autoprefixer({
                browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'],
            }),
        ],
    },
};

const getColbyDependencyEntries = () => {
    let colbyPlugins = fs
        .readdirSync('./web/wp-content/plugins')
        .filter(dir => dir.includes('colby-'))
        .map(dir => {
            return './web/wp-content/plugins/' + dir + '/src/index.js';
        });

    let colbyThemes = fs
        .readdirSync('./web/wp-content/themes')
        .filter(dir => dir.includes('colby-'))
        .map(dir => {
            return './web/wp-content/themes/' + dir + '/src/index.js';
        });

    let finalColbyDependencyList = colbyPlugins.concat(colbyThemes);
    return _remove(finalColbyDependencyList, dep => {
        return !_isEmpty(glob.sync(dep));
    });
};

const config = {
    mode: 'production',
    entry: {
        app: getColbyDependencyEntries(),
    },
    output: {
        path: currentDir + '/web/wp/build',
        filename: 'app.[hash].bundle.js',
        chunkFilename: '[id].app.[chunkhash].bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader', options: { minimize: true } },
                    postcssLoader,
                    'less-loader',
                ],
            },
            {
                test: /\.(jpg|png|gif|svg)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 5000,
                        name: '[name]-[hash].[ext]',
                    },
                },
            },
            {
                test: /\.(ttf|eot|woff|woff2|mp3)$/,
                use: ['file-loader'],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            babelrc: false,
                            presets: [require.resolve('babel-preset-colby')],
                        },
                    },
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            context: currentDir,
                            modules: true,
                            importLoaders: 2,
                            localIdentName: '[local]__[hash:base64:5]',
                            minimize: true,
                        },
                    },
                    postcssLoader,
                    'sass-loader',
                ],
            },
        ],
    },
    plugins: [
        // Clean build folder
        new CleanWebpackPlugin(),

        new MiniCssExtractPlugin({
            filename: 'app.[contenthash].bundle.css',
        }),

        new webpack.optimize.MinChunkSizePlugin({
            minChunkSize: 50000,
        }),

        // Save app bundle filename in temp file
        // eslint-disable-next-line func-names, space-before-function-paren
        function() {
            this.plugin('done', stats => {
                const chunks = stats.toJson({ all: false, assets: true })
                    .assetsByChunkName.app;
                const jsBundleFilename = chunks.find(file =>
                    /^app.*\.js$/.test(file)
                );

                const cssBundleFilename = chunks.find(file =>
                    /^app.*\.css$/.test(file)
                );

                // Write js bundle
                (() => {
                    const filename = path.join(
                        currentDir,
                        'web',
                        'build',
                        'js.bundle.filename'
                    );
                    const fileExists = fs.existsSync(filename);
                    fs.writeFileSync(filename, jsBundleFilename);
                    if (!fileExists) {
                        fs.chmodSync(filename, 0o777);
                    }
                })();

                // Write css bundle
                (() => {
                    const filename = path.join(
                        currentDir,
                        'web',
                        'build',
                        'css.bundle.filename'
                    );
                    const fileExists = fs.existsSync(filename);
                    fs.writeFileSync(filename, cssBundleFilename);
                    if (!fileExists) {
                        fs.chmodSync(filename, 0o777);
                    }
                })();
            });
        },
    ],
    devtool: process.env.ANALYZE_BUNDLE ? false : 'source-map',
    optimization: {
        noEmitOnErrors: true,
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
                uglifyOptions: {
                    mangle: { keep_fnames: true },
                },
            }),
            new OptimizeCSSAssetsPlugin({}),
        ],
    },
    stats: {
        all: false,
        timings: true,
        assets: true,
        excludeAssets: name => /\.map$/.test(name),
        errors: true,
        warnings: true,
    },
};

if (process.env.ANALYZE_BUNDLE) {
    config.plugins.push(new BundleAnalyzerPlugin({ defaultSizes: 'gzip' }));
}

module.exports = config;
