/**
 * @author Anthony Altieri on 9/20/16.
 */

const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack-plugin');

exports.devServer = function(options) {
  return {
    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      stats: 'errors-only',
      host: options.host,
      port: options.port,
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin({
        multiStep: true,
      })
    ]
  }
};

exports.setupCSS = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
        },
        {
          test: /\.scss$/,
          loaders: ['style', 'css', 'sass'],
          include: paths,
        },
        {
          test: /\.less$/,
          loaders: ['style', 'css', 'less'],
        },
      ]
    }
  }
};

exports.setupMp3 = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.mp3$/,
          loader: process.env.NODE_ENV === 'production'
          ? 'file?name=[name].[hash].[ext]':'file',
        }
      ]
    }
  }
};

exports.minify = function() {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        comments: false,
        compress: {
          warnings: false,
          drop_console: true,
        },
        mangle: {
          except: ['$', 'webpackJsonp'],
          screw_ie8: true,
          keep_fnames: true,
        }
      })
    ]
  };
};

exports.setFreeVariable = function(key, value) {
  const env = {};
  env[key] = JSON.stringify(value);
  return {
    plugins: [
      new webpack.DefinePlugin(env)
    ]
  }
};

exports.setupImg = function() {
  return {
    module: {
      loaders: [
        {
          test: /\.svg$/,
          loader: process.env.NODE_ENV === 'production'
            ? 'file?name=[name].[hash].[ext]'
            : 'file',
        },
        {
          test: /\.(jpg|png)$/,
          loader: process.env.NODE_ENV === 'production'
            ? 'file?name=[name].[hash].[ext]'
            : 'file',
        },
      ]
    }
  }
};

exports.setupFonts = function() {
  return {
    module: {
      loaders: [
        // the url-loader uses DataUrls.
        // the file-loader emits files.
        { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
        { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
      ]
    }
  }
};

exports.setupBabel = function(path) {
  return {
    module: {
      loaders: [
        {
          test: /(\.js$|\.jsx$)/,
          exclude: /node_modules/,
          loader: 'babel',
          query: {
            cacheDirectory: true,
            presets: ['react', 'es2015']
          },
          include: path,
        },
      ]
    }
  }
};

exports.extractBundle = function(options) {
  const entry = {};
  entry[options.name] = options.entries;
  return {
    entry: entry,
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, 'manifest'],
      })
    ]
  };
};

exports.setupJSON = function() {
  return {
    module: {
      loaders: [
        {
          test: /\.json$/,
          loaders: ['json']
        }
      ]
    }
  }
};

exports.clean = function(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        root: process.cwd()
      })
    ]
  };
};

exports.extractCSS = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract(
            "style",
            "css!sass!postcss"
          ),
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract(
            "style",
            "css"
          ),
        },
        {
          test: /\.less$/,
          loaders: ['style', 'css', 'less'],
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin('[name].[chunkhash].css')
    ]
  }
};

exports.purifyCSS = function(paths) {
  return {
    plugins: [
      new PurifyCSSPlugin({
        basePath: process.cwd(),
        paths: paths
      }),
    ]
  }
}
