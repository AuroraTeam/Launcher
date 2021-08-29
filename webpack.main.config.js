const path = require('path');

module.exports = {
    target: 'electron-main',
    mode: 'development',
    devtool: 'inline-source-map',
    entry: path.resolve(__dirname, 'src', 'main', 'index.ts'),
    output: {
        path: path.resolve(__dirname, 'build', 'main'),
        filename: 'index.js'
    },
    resolve: {
        extensions: [ '.js', '.ts' ],
        alias: {
            "@config": path.resolve(__dirname, 'config.json')
        }
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