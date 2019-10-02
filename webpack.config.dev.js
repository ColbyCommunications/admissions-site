const path = require('path');
const fs = require('fs');
const glob = require('glob');
const webpack = require('webpack');
const _remove = require('lodash/remove');
const _isEmpty = require('lodash/isEmpty');
const _includes = require('lodash/includes');
const autoprefixer = require('autoprefixer');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const WebpackNotifierPlugin = require('webpack-notifier');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const portFinderSync = require('portfinder-sync');
const isDevServer = process.argv.find(v => _includes(v, 'webpack-dev-server'));

const currentDir = path.resolve(process.cwd());

const postcssLoader = {
    loader: 'postcss-loader',
    options: {
        plugins: () => [autoprefixer()],
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
    mode: 'development',
    entry: {
        app: getColbyDependencyEntries(),
    },
    output: {
        path: currentDir + '/web/wp/build',
        filename: 'app.[hash].bundle.js',
        chunkFilename: '[id].app.[chunkhash].bundle.js',
    },
    stats: {
        all: false,
        timings: true,
        assets: true,
        excludeAssets: name => /\.map$/.test(name),
        errors: true,
        warnings: true,
    },
    module: {
        rules: [
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
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            modules: {
                                context: currentDir,
                                localIdentName: '[local]__[hash:base64:5]',
                            },
                        },
                    },
                    'sass-loader',
                    postcssLoader,
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader'],
            },
        ],
    },
    plugins: [
        // Clean build folder
        new CleanWebpackPlugin(),
        new WebpackNotifierPlugin(),

        // Let modules know about your environment
        new webpack.DefinePlugin({
            ...(isDevServer && {
                'process.env.WEBPACK_PUBLIC_PATH': `"https://0.0.0.0:9000/"`,
            }),
        }),

        // Save app bundle filename in temp file
        // eslint-disable-next-line func-names, space-before-function-paren
        function() {
            this.plugin('done', stats => {
                var jsBundleFilename = stats.toJson({
                    all: false,
                    assets: true,
                }).assetsByChunkName.app;

                if (typeof jsBundleFilename !== 'string') {
                    jsBundleFilename = jsBundleFilename[0];
                }

                if (isDevServer) {
                    jsBundleFilename = `https://0.0.0.0:9000/${jsBundleFilename}`;
                }

                // Write JS bundle
                const jsFilename = path.join(
                    currentDir,
                    'web',
                    'build',
                    'js.bundle.filename'
                );

                const fileExists = fs.existsSync(jsFilename);

                fs.writeFileSync(jsFilename, jsBundleFilename);
                if (!fileExists) {
                    fs.chmodSync(jsFilename, 0o777);
                }

                // Remove CSS bundle. We'll handle it from JS
                const cssFilename = path.join(
                    currentDir,
                    'web',
                    'build',
                    'css.bundle.filename'
                );
                if (fs.existsSync(cssFilename)) {
                    fs.unlinkSync(cssFilename);
                }
            });
        },
    ],
    devServer: {
        host: '0.0.0.0',
        contentBase: false,
        port: 9000,
        clientLogLevel: 'none',
        disableHostCheck: true,
        watchOptions: {
            poll: true,
        },
        hot: false,
        overlay: true,
        https: true,
        stats: {
            all: false,
            timings: true,
            assets: true,
            excludeAssets: name => !/\.bundle\.js$/.test(name),
            errors: true,
            warnings: true,
        },
        historyApiFallback: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
};

module.exports = config;
