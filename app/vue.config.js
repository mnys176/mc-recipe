const path = require('path')
const webapp = path.join(__dirname, 'webapp')

module.exports = {
    outputDir: path.join(webapp, 'dist'),
    assetsDir: 'assets',
    chainWebpack: config => {
        // remove old entry point
        config.entry('app').clear()

        // add new one
        const newEntry = path.join(
            webapp,
            'src',
            'assets',
            'js',
            'main.js'
        )
        config.entry('app').add(newEntry)
    }
}