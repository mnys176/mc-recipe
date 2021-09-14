/******************************************************
 * Title:       multer.js                             *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/13/2021                            *
 * Description:                                       *
 *     Configures Multer middleware to parse          *
 *     an incoming request.                           *
 ******************************************************/

const path = require('path')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
        const name = `${Date.now()}${path.extname(file.originalname)}`
        cb(null, name)
    }
})
const media = multer({ storage })

module.exports = media