const path = require('path');

module.exports = {
  entry: './gui/presenter.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  "context": __dirname,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          "loader": "ts-loader",
          "options": {           
            "transpileOnly": false
          }
        },
        exclude: /node_modules/,
      },
    ],
  }, 
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '../gui/bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};