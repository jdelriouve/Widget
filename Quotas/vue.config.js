const { defineConfig } = require('@vue/cli-service')
const { VuetifyPlugin } = require('webpack-plugin-vuetify')

module.exports = defineConfig({
  publicPath: './',
  lintOnSave: false,
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    devtool: 'source-map', // Habilitar mapas de fuente para depuración
    optimization: {
      splitChunks: false, // Deshabilitar la división de chunks
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