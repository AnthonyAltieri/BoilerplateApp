/**
 * @author Anthony Altieri on 9/6/16.
 */

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
const PORT = 3000;

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  headers: { 'Access-Control-Allow-Origin': '*' },
}).listen(PORT, 'localhost', function (err, result) {
  if (err) {
    return console.log(err);
  }
  console.log(`Listening at http://localhost:${PORT}`);
});