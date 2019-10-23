const path = require('path');
const autoprefixer = require('autoprefixer');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: ['./src/index.js'],
  output: {
    path: path.join(__dirname, 'public', 'assets'),
    filename: 'main.js',
    publicPath: '/assets/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                autoprefixer({
                  browsers: ['ie >= 10', 'last 4 versions'],
                }),
              ],
              sourceMap: true,
            },
          }],
      },
    ],
  },
  plugins: [],
};
