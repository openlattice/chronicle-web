/* eslint-disable import/extensions */

const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_PATHS = require('../app/paths.config.js');
const baseWebpackConfig = require('./webpack.config.base.js');

module.exports = (env) => {

  const baseConfig = baseWebpackConfig(env);

  const output = Object.assign({}, baseConfig.output, {
    filename: `${APP_PATHS.REL.STATIC_JS}/app.[contenthash].js`,
    chunkFilename: `${APP_PATHS.REL.STATIC_JS}/app.chunk.[id].[chunkhash].js`,
  });

  const plugins = [
    new HtmlWebpackPlugin({
      favicon: `${APP_PATHS.ABS.SOURCE_ASSETS_IMAGES}/ol_favicon.png`,
      template: `${APP_PATHS.ABS.SOURCE}/index.html`,
    }),
    ...baseConfig.plugins
  ];

  return Object.assign({}, baseConfig, {
    output,
    plugins,
    devtool: false,
  });
};
