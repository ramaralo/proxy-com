const path = require("path");
const commonConfig = require("./webpack.common.config");

const nodeConfig = {
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist/"),
    filename: `proxycom-commonjs-${process.env.npm_package_version}.js`,
    libraryTarget: "umd", // TODO: verify this
    libraryExport: "default",
  },
};

module.exports = Object.assign(commonConfig, nodeConfig);
