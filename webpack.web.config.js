const path = require('path');
const commonConfig = require("./webpack.common.config");

const webConfig = {
    target: "web",
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            crypto: false,
        }
    },
    output: {
        path: path.resolve(__dirname, 'dist/bundles/umd'),
        filename: `proxycom-${process.env.npm_package_version}.js`,
        libraryTarget: 'umd',
        globalObject: 'this',
        libraryExport: 'default',
        umdNamedDefine: true,
        library: 'ProxyCom',
    },
}

module.exports = Object.assign(commonConfig, webConfig);