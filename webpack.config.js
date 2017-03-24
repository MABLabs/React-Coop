module.exports = {
  entry: './src/index.js',
  output: {
        path: './public/',
        filename: 'bundle.js'
    },
  resolve:{
        modulesDirectories: ['src', 'node_modules'],
    },
  devServer: {

     // dont include boolean equivalent of these commandline switches, it will not work here
     // these are in the package.json where the following is executed
     //  webpack-dev-server --devtool eval-source --progress --colors --hot --inline --history-api-fallback

     port: 8080,
     contentBase: './public/',

     // allow NodeJS to run side-by-side with webpack-dev-server
     proxy: {  '/api/*': 'http://localhost:8081/' }   // <- backend
  },
  module: {
    loaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                      presets: ['es2015', 'react']
                   },
          },

          {
              test: /\.css$/,
              loaders: ['style', 'css']
          },

          // "file" loader for svg
          {
            test: /\.svg|.png$/,
            loader: 'file',
            query: {
              name: 'static/media/[name].[hash:8].[ext]'
            }
          },

          {
              test: /\.json$/,
              loader: 'json'
          }

    ]
  }
}
