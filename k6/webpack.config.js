const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    'scenarios/smoke': './scenarios/smoke.ts',
    'scenarios/load': './scenarios/load.ts',
    'scenarios/stress': './scenarios/stress.ts',
    'scenarios/spike': './scenarios/spike.ts',
    'tests/auth': './tests/auth.ts',
    'tests/portfolios': './tests/portfolios.ts',
    'tests/assets': './tests/assets.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { node: '16' } }],
              '@babel/preset-typescript',
            ],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  target: 'web',
  externals: /^(k6|https?:\/\/)(\/.*)?/,
  stats: {
    colors: true,
  },
  plugins: [new CleanWebpackPlugin()],
  optimization: {
    minimize: false,
  },
};
