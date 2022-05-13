module.exports = {
    mode: "development",
    entry: ['./src/index.spec.ts', './src/transports/nodejs/process'],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
}