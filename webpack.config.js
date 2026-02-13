const { resolve } = require("node:path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "none",
    entry: {
        index: "./src/index.ts",
        popup: "./src/js/popup.ts",
        options: "./src/js/options.ts",
    },
    output: {
        filename: "[name].js",
        path: resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.svg$/,
                type: "asset/source",
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/view", to: "view" },
                { from: "src/css", to: "css" },
                { from: "src/manifest.json", to: "manifest.json" },
            ],
        }),
    ],
};
