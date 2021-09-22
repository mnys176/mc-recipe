/********************************************************
 * Title:       media-multer.js                         *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)   *
 * Created:     09/13/2021                              *
 * Description:                                         *
 *     Configures media middleware to parse an incoming *
 *     request.                                         *
 ********************************************************/

const path = require('path')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // hide media directory when invalid ID
        const dest = path.join(
            req.notFound ? '' : process.env.MEDIA_ROOT,
            req.params.id
        )

        // declutter request object
        delete req.notFound

        return cb(null, dest)
    },
    filename: (req, file, cb) => cb(null, file.originalname)
})

const mediaMulterEngine = multer({ storage })

module.exports = { mediaMulterEngine }