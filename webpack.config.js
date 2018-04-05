const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV;

const setPath = function(folderName) {
  return path.join(__dirname, folderName);
}

const buildingForLocal = () => {
  return (NODE_ENV === 'development');
};

const extractCSS = new ExtractTextPlugin({
  filename: 'styles.[hash].css', //'[name].[contenthash].css',
  disable: buildingForLocal()
});


module.exports = {
  devtool: 'inline-source-map',
  output: {
    devtoolModuleFilenameTemplate: info =>
      'file:///' + path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    filename: buildingForLocal() ? '[name].js' : '[name].[hash].js',
    publicPath: '/',
  },

  optimization:{
    runtimeChunk: false,
    splitChunks: {
      chunks: 'all', // Taken from https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693
    }
  },
  resolveLoader: {
    modules: [setPath('node_modules')]
  },
  // resolve: {
  //   alias: {
  //     'vue$': 'vue/dist/vue.esm.js'
  //   }
  // },
  mode: buildingForLocal() ? 'development' : 'production',
  devServer: {
    historyApiFallback: true,
    noInfo: false
  },
  plugins: [
    extractCSS,
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: setPath('/src/index.html'),
      environment: process.env.NODE_ENV,
      isLocalBuild: buildingForLocal(),
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"'+NODE_ENV+'"'
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [{
          loader: 'babel-loader',
          options: { presets: ['es2015'] }
        }]
      },
      {
        test: /\.css$/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: [{
            //because remove style-loader, my css can't work
            loader: "css-loader", options: { importLoaders: 1 } // translates CSS into CommonJS
          }, {
            loader: "postcss-loader"
          }]
        })
      },
      {
        test: /\.(svg|png|jpg|gif|webm|otf|ttf|woff|eot|pdf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      }
    ]
  },
};
