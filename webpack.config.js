const path = require('path')
const webpack = require('webpack')
const dev = process.env.NODE_ENV !== 'production'

baseConfig = {
  module: {
    loaders: [
      { test: /\.sass$/, loaders: ['style-loader', 'css-loader', 'sass-loader'] },
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-react-jsx']
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
        }
      },
      {
        test: /\.png$/,
        loader: 'file-loader'
      }
    ]
  },
  devtool: 'source-map'
}

module.exports = [
  Object.assign({}, baseConfig, {
    entry: {
      'bundle': './main.jsx',
    },
    output: {
      path: path.join(__dirname, './dist'),
      publicPath: '/dist/',
      filename: '[name].js'
    }
  })
]
