/* eslint-disable no-underscore-dangle, import/extensions */

const path = require('path');
const Webpack = require('webpack');

const APP_CONFIG = require('../app/app.config.js');
const APP_PATHS = require('../app/paths.config.js');
const PACKAGE = require('../../package.json');
const {
  AUTH0_CLIENT_ID_DEV,
  AUTH0_CLIENT_ID_PROD,
  AUTH0_DOMAIN,
} = require('../auth/auth0.config.js');

module.exports = (env) => {

  /*
   * constants
   */

  const BABEL_CONFIG = path.resolve(__dirname, '../babel/babel.config.js');
  const BASE_PATH = `/${env.basePath || 'chronicle'}/`;
  const ENV_DEV = 'development';
  const ENV_PROD = 'production';

  /*
   * loaders
   */

  const BABEL_LOADER = {
    test: /\.js$/,
    exclude: /node_modules/,
    include: [
      APP_PATHS.ABS.SOURCE,
    ],
    use: {
      loader: 'babel-loader',
      options: {
        configFile: BABEL_CONFIG,
      },
    },
  };

  /*
   * plugins
   */

  const BANNER_PLUGIN = new Webpack.BannerPlugin({
    banner: APP_CONFIG.BANNER,
    entryOnly: true,
  });

  const DEFINE_PLUGIN = new Webpack.DefinePlugin({
    __AUTH0_CLIENT_ID__: JSON.stringify(env.production ? AUTH0_CLIENT_ID_PROD : AUTH0_CLIENT_ID_DEV),
    __AUTH0_DOMAIN__: JSON.stringify(AUTH0_DOMAIN),
    __BASE_PATH__: JSON.stringify(BASE_PATH),
    __ENV_DEV__: JSON.stringify(!!env.development),
    __ENV_PROD__: JSON.stringify(!!env.production),
    __PACKAGE__: JSON.stringify(PACKAGE.name),
    __VERSION__: JSON.stringify(`v${PACKAGE.version}`),
  });

  // https://github.com/moment/moment/issues/2373
  // https://stackoverflow.com/a/25426019/196921
  // https://github.com/facebookincubator/create-react-app/pull/2187
  const IGNORE_MOMENT_LOCALES = new Webpack.IgnorePlugin(/^\.\/locale$/, /moment$/);

  /*
   * base webpack config
   */

  return {
    bail: true,
    entry: [
      APP_PATHS.ABS.APP,
    ],
    mode: env.production ? ENV_PROD : ENV_DEV,
    module: {
      rules: [
        BABEL_LOADER,
        {
          test: /translation\.json$/,
          type: 'javascript/auto',
          use: [{
            loader: 'file-loader',
            options: {
              name: (filePath) => {
                // filePath = "/path/to/src/core/i18n/en/translation.json"
                const [language] = filePath.split('i18n/')[1].split('/');
                return `static/i18n/${language}/[name].[contenthash].json`;
              },
            },
          }],
        },
        {
          generator: {
            filename: (
              env.production
                ? `${APP_PATHS.REL.STATIC_ASSETS}/[name].[contenthash].[ext]`
                : `${APP_PATHS.REL.STATIC_ASSETS}/[name].[ext]`
            )
          },
          test: /\.(gif|ico|jpg|jpeg|png|svg|webp)(\?.*)?$/,
          type: 'asset/resource',
        },
      ],
    },
    optimization: {
      minimize: !!env.production,
    },
    output: {
      path: APP_PATHS.ABS.BUILD,
      publicPath: BASE_PATH,
    },
    performance: {
      hints: false, // disable performance hints for now
    },
    plugins: [
      DEFINE_PLUGIN,
      BANNER_PLUGIN,
      IGNORE_MOMENT_LOCALES,
    ],
    resolve: {
      alias: {
        // NOTE: rjsf still depends on core-js@2, should be able to remove with rjsf v3
        // core-js-pure is the core-js@3 equivalent of core-js/library from core-js@2
        // https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md
        'core-js/library/fn/array/fill': path.resolve(APP_PATHS.ABS.NODE, 'core-js-pure/features/array/fill'),
        'core-js/library/fn/array/includes': path.resolve(APP_PATHS.ABS.NODE, 'core-js-pure/features/array/includes'),
      },
      extensions: ['.js', '.css'],
      modules: [
        APP_PATHS.ABS.SOURCE,
        APP_PATHS.ABS.NODE,
      ],
      fallback: {
        http: false,
        zlib: false,
        https: false,
        stream: false
      }
    },
  };
};
