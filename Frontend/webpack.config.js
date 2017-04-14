var path = require('path');
var webpack = require('webpack');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var parts = require('./libs/parts');
var pkg = require('./package.json');
var DashboardPlugin = require('webpack-dashboard/plugin');

var PATHS = {
  app: path.join(__dirname, 'src/index.js'),
  dist: path.join(__dirname, 'dist'),
  style: path.join(__dirname, 'src/style/style.scss'),
  img: path.join(__dirname, 'src/img'),
  outputCss: path.join(__dirname, 'dist', '[name]-[contenthash].css')
};

var common = {
  entry: {
    style: PATHS.style,
    app: [
      'babel-polyfill',
      PATHS.app
    ],
  },
  output: {
    path: PATHS.dist,
    publicPath: '/static/',
    // filename: 'app.bundle.js',
  },
  node: {
    fs: "empty"
  },
  module: {
    loaders: [
      {
        test: /(\.js$|\.jsx$)/,
        exclude: /node_modules/,
        // loader: 'babel',
        // query: {
        //   cacheDirectory: true,
        //   presets: ['react', 'es2015']
        // },
        // include: PATHS.app,
        loaders: ['babel'],
        include: path.join(__dirname, 'src'),
      }
    ]
  }
};

var config;
console.log('process.env.npm_lifecycle_event', process.env.npm_lifecycle_event);
console.log('process.env.NODE_ENV', process.env.NODE_ENV);
switch (process.env.npm_lifecycle_event) {
  case 'build':
    console.log('case `build`');
    config = merge(
      common,
      {
        devtool: 'cheap-eval-source-map',
        plugins: [
          new HtmlWebpackPlugin({
            title: 'Scholar',
            filename: 'index.html',
            template: 'template.ejs'
          }),
          new webpack.DefinePlugin({
            'process.env': {
              'NODE_ENV': JSON.stringify('production')
            }
          }),
        ],
        output: {
          path: PATHS.dist,
          filename: '[name].[hash].js',
          chunkFilename: '[chunkhash].js',
        }
      },
      parts.clean(PATHS.dist),
      // parts.setupBabel(PATHS.app),
      parts.setupImg(PATHS.img),
      parts.setupFonts(),
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
      parts.setupJSON(),
      parts.setupMp3(),
      parts.extractBundle({
        name: 'vendor',
        entries: Object.keys(pkg.dependencies)
      }),
      parts.extractCSS(PATHS.outputCss)
      //parts.minify()
    );
    break;

  default:
    console.log('case `default`');
    config = merge(
      common,
      {
        entry: [
          'babel-polyfill',
          'webpack-dev-server/client?http://localhost:3000',
          'webpack/hot/only-dev-server',
          PATHS.app
        ],
        plugins: [
          new HtmlWebpackPlugin({
            title: 'Scholar',
            filename: 'index.html',
            template: 'template.ejs'
          }),
          new webpack.DefinePlugin({
            'process.env': {
              'NODE_ENV': JSON.stringify('development')
            }
          }),
          new DashboardPlugin(),
          new webpack.HotModuleReplacementPlugin()
        ],
        devtool: 'eval-source-map',
        output: {
          path: PATHS.dist,
          filename: 'app.bundle.js',
          // chunkFilename: '[chunkhash].js',
        }
      },
      parts.setupFonts(),
      parts.devServer({
        host: process.env.HOST,
        port: process.env.PORT || 3000,
      }),
      parts.setupCSS(PATHS.style),
      parts.setupMp3(),
      parts.setupImg(),
      parts.setupJSON()
    );
    break;
}

module.exports = validate(config, {
  quiet: false
});

