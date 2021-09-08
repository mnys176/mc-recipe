/******************************************************
 * Title:       vue.config.js                         *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/08/2021                            *
 * Description: Configures VueJS Webpack usage.       *
 ******************************************************/

const path = require('path')
const webapp = path.join(__dirname, 'webapp')

module.exports = {
    outputDir: path.join(webapp, 'dist'),
    assetsDir: 'assets',
    chainWebpack: config => {
        // remove old entry point
        config.entry('app').clear()

        // add new entry point
        const newEntry = path.join(webapp, 'src', 'main.js')
        config.entry('app').add(newEntry)

        config.plugin('html').tap(args => {
            args[0].favicon = path.join(webapp, 'public', 'favicon.ico')
            args[0].template = path.join(webapp, 'public', 'index.html')
            args[0].title = 'MC Recipe'
            return args
        })
    }
}