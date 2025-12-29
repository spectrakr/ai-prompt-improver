const { resolve } = require("node:path");

module.exports = {
    mode: "none",
    entry: {
        index: "./src/index.ts",
        popup: "./src/js/popup.ts",
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
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
};
