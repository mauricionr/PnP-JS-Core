var path = require("path"),
    webpack = require('webpack'),
    config = require('./gulptasks/@configuration.js');

module.exports = [{
    // core file + sourcemap -> dist
    cache: true,
    entry: './lib/pnp.js',
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "/assets/",
        filename: "pnp.js",
        libraryTarget: "umd",
        library: "$pnp"
    },
    devtool: "source-map",
    resolve: {
        extensions: ['', '.js']
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/\.\.\/net\/nodefetchclient/, "../net/nodefetchclientbrowser"),
        new webpack.BannerPlugin(config.header, { entryOnly: true, raw: true })
    ],
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader?presets[]=es2015' }
        ]
    }
},
{
    // minified core file + sourcemap -> dist
    cache: true,
    entry: './lib/pnp.js',
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "/assets/",
        filename: "pnp.min.js",
        libraryTarget: "umd",
        library: "$pnp"
    },
    devtool: "source-map",
    resolve: {
        extensions: ['', '.js']
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/\.\.\/net\/nodefetchclient/, "../net/nodefetchclientbrowser"),
        new webpack.BannerPlugin(config.header, { entryOnly: true, raw: true }),
        new webpack.DefinePlugin({
            "process.env": {
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ],
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader?presets[]=es2015' },
        ]
    }
}];
