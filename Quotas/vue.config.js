const { defineConfig } = require('@vue/cli-service')
const { VuetifyPlugin } = require('webpack-plugin-vuetify')

module.exports = defineConfig({
  publicPath: './',
  lintOnSave: false,
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    devtool: 'source-map',
    optimization: {
      splitChunks: false,
    },
    output: {
      filename: 'product.js', // Nombre del bundle final
      library: 'widget',      // Nombre del objeto global en window
      libraryTarget: 'window',
      libraryExport: 'default',
    },
    plugins: [
      new VuetifyPlugin()
    ]
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "vuetify/styles";`,
      },
    },
  },
})
