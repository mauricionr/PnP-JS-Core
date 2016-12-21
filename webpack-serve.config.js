var path = require("path"),
    webpack = require('webpack');

module.exports = {
    // serve config
    cache: true,
    entry: './src/pnp.ts',
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "/assets/",
        filename: "pnp.js",
        libraryTarget: "umd",
        library: "$pnp"
    },
    debug: true,
    devtool: "source-map",
    resolve: {
        extensions: ['', '.ts']
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/\.\/nodefetchclient/, "./nodefetchclientbrowser"),
    ],
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'babel-loader?presets[]=es2015!ts-loader' },
        ]
    }
};
