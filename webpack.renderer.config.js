const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    target: 'electron-renderer',
    mode: 'production',
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src', 'renderer', 'index.ts'),
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'renderer.js'
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
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            },
            {
                test: /\.less$/,
                loader: 'less-loader', // compiles Less to CSS
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                loader: 'file-loader',
            },
            {
                test: /\.styl$/,
                loader: 'stylus-loader', // compiles Styl to CSS
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ]
}