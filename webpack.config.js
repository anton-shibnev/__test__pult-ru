const path = require('path')
const fs = require('fs')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin')

const PATHS = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
  configs: path.join(__dirname, 'configs'),
  pages: path.join(__dirname, 'src/pages'),
  static: path.join(__dirname, 'src/assets'),
  assets: 'assets',
}

const PAGES_DIR = `${ PATHS.pages }`
const PAGES = fs.readdirSync(PAGES_DIR).filter((fileName) => fileName.endsWith('.pug'))

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all',
    }
  }

  if (isProd) {
    config.minimizer = [
      new OptimizeCSSAssetsWebpackPlugin(),
      new TerserWebpackPlugin(),
    ]
  }

  return config
}

const filename = ext => isDev ? `[name].${ ext }` : `[name].[hash].${ ext }`

const cssLoader = extra => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: '',
      },
    },
    'css-loader',
  ]

  if (extra) {
    loaders.push(extra)
  }

  return loaders
}

const babelOptions = preset => {
  const opts = {
    presets: ['@babel/preset-env'],
  }

  if (preset) {
    opts.presets.push(preset)
  }

}

const jsLoaders = () => {
  const loaders = [
    {
      loader: 'babel-loader',
      options: babelOptions(),
    }
  ]

  if (isDev) {
    loaders.push('eslint-loader')
  }

  return loaders
}

module.exports = {
  mode: 'development',
  entry: {
    main: [
      './src/index.js',
    ],
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@models': path.resolve(__dirname, 'src/models'),
      '@': path.resolve(__dirname, 'src'),
      'svg': path.join(__dirname, 'src/assets/svg')
    },
  },
  optimization: optimization(),
  devServer: {
    port: 3000,
    hot: isDev,
  },
  devtool: isDev ? 'source-map' : 'inline-cheap-module-source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin(
      {
        patterns: [
          {
            from: path.resolve(__dirname, 'src/favicon.ico'),
            to: path.resolve(__dirname, 'dist'),
          },
          {
            from: path.resolve(__dirname, 'src/assets/images'),
            to: path.resolve(__dirname, 'dist/assets/images'),
          },
          {
            from: path.resolve(__dirname, 'src/assets/svg'),
            to: path.resolve(__dirname, 'dist/assets/svg'),
          },
        ]
      }
    ),
    new MiniCssExtractPlugin({
      filename: filename('css'),
    }),

    ...PAGES.map(
      (page) =>
        new HTMLWebpackPlugin({
          minify: {
            collapseWhitespace: isProd,
            removeComments: isProd,
            removeRedundantAttributes: isProd,
            removeScriptTypeAttributes: isProd,
            removeStyleLinkTypeAttributes: isProd,
            useShortDoctype: isProd
          },
          template: `${ PAGES_DIR }/${ page }`,
          filename: `./${ page.replace(/\.pug/, '.html') }`,
        })
    ),
    new HtmlWebpackInlineSVGPlugin({
      runPreEmit: true,
      inlineAll: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: cssLoader(),
      },
      {
        test: /\.styl$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '',
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'stylus-loader',
            options: {
              sourceMap: true,
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: cssLoader('sass-loader'),
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/images/[folder]/[name].[ext]',
        }
      },

      {
        test: /\.svg$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/svg/[name].[ext]',
            }
          },
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: 'assets/fonts/[folder]/[name].[ext]',
        }
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'pug-loader',
            options: {
              pretty: true,
            },
          },
          {
            loader: 'pug-bem-plain-loader',
            options: {
              pretty: true,
              b: 'b_',
            },
          },
        ],
      },
    ]
  }
}
