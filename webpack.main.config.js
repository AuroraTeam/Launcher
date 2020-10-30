const path = require('path');

module.exports = {
    target: 'electron-main',
    mode: 'production',
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src', 'main', 'index.ts'),
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'main.js'
    },
    resolve: {
        extensions: [ '.ts' ],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader"
            }
        ]
    }
}