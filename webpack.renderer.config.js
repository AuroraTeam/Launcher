const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    target: 'electron-renderer',
    mode: 'production',
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src', 'renderer', 'index.ts'),
    output: {
        path: path.resolve(__dirname, 'build', 'renderer'),
        filename: 'index.js'
    },
    resolve: {
        extensions: ['.ts', '.vue'],
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
                    'less-loader',
                ],
            },
            {
                test: /\.(styl(us)?)$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'stylus-loader',
                ],
            },
            { // TODO Под вопросом
                test: /\.html$/i,
                loader: 'html-loader',
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                loader: 'file-loader',
                options: {
                    outputPath: 'images', // кхъ
                    // name: '[name].[ext]', // кхъ
                },
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ]
}