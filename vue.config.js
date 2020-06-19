'use strict';
const webpack = require('webpack');
const path = require('path');

module.exports = {
  assetsDir: 'static',
  productionSourceMap: false,
  devServer: {
    host: 'localhost',
    port: 3000,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '/pty': {
        target: 'http://localhost:8032/pty',
        changeOrigin: true,
        pathRewrite: {
          '^/pty': ''
        }
      },
      '/static-resource': {
        target: 'http://59.110.141.230:30007/static-resource',
        changeOrigin: true,
        pathRewrite: {
          '^/static-resource': ''
        }
      },
      '/WebReport': {
        target: 'http://59.110.141.230:30007/WebReport',
        changeOrigin: true,
        pathRewrite: {
          '^/WebReport': ''
        }
      }
    }
  },
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.json', '.png'],
      alias: {
        '@': path.join(__dirname, 'src'),
        lodash: 'lodash'
      }
    },
    externals: {
      jquery: 'window.$',
      viewerjs: 'window.Viewer'
    },
    plugins: [
      new webpack.ProvidePlugin({
        lodash: 'lodash',
        _: 'lodash',
        'window.lodash': 'lodash'
      })
    ]
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true;
        return options;
      });
    config.when(process.env.NODE_ENV === 'development', config =>
      config.devtool('cheap-source-map')
    );
  }
};
