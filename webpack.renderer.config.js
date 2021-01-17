const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');

module.exports = {
    target: 'electron-renderer',
    mode: 'production',
    devtool: 'inline-source-map',
    entry: path.resolve(__dirname, 'src', 'renderer', 'index.ts'),
    output: {
        path: path.resolve(__dirname, 'build', 'renderer'),
        filename: 'index.js'
    },
    resolve: {
        extensions: [ '.js', '.ts', '.vue' ],
        alias: {
            "@Launcher": path.resolve(__dirname, 'src/renderer/index.ts'),
            "@runtime": path.resolve(__dirname, 'src/renderer/runtime'),
            "@scripts": path.resolve(__dirname, 'src/renderer/scripts')
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                options: { appendTsSuffixTo: [/\.vue$/] }
            },
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: (ctx) => {
                                if (ctx.resourceQuery.includes('sass')) {
                                    return { indentedSyntax: true }
                                }
                            }
                        }
                    }
                ],
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ],
            },
            {
                test: /\.(styl(us)?)$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'stylus-loader'
                ],
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                loader: 'file-loader'
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                './src/renderer/index.html',
                './src/renderer/runtime/assets/images/logo.png',
                './src/renderer/runtime/assets/js/skinview3d/steve.png',
                {from: './src/package.json', to: '..'}
            ]
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new HtmlMinimizerPlugin(),
        ]
    }
}