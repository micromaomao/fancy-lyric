const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const dev = process.env.NODE_ENV !== 'production'

baseConfig = {
  module: {
    rules: [
      { test: /\.sass$/, use: ['css-loader', 'sass-loader'] },
      {
        test: /\.jsx$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-react-jsx']
            }
          }
        ]
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      },
      {
        test: /\.png$/,
        use: 'file-loader'
      },
      {
        test: /\.pug$/,
        use: 'pug-loader'
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
      publicPath: '/resources/',
      filename: '[name]-[hash].js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.pug',
        minify: {removeComments: true, useShortDoctype: true, sortClassName: true, sortAttributes: true},
        inject: false
      })
    ]
  })
]
