/********************************************************
 * Title:       media-multer.js                         *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)   *
 * Created:     09/13/2021                              *
 * Description:                                         *
 *     Configures media middleware to parse an incoming *
 *     request.                                         *
 ********************************************************/

const crypto = require('crypto')
const path = require('path')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(process.env.MEDIA_ROOT, req.params.id)
        return cb(null, dest)
    },
    filename: (req, file, cb) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) throw err
            const hex = buf.toString('hex')
            const ext = path.extname(file.originalname)
            return cb(null, `${hex}${ext}`)
        })
    }
})

const mediaMulterEngine = multer({ storage })

module.exports = { mediaMulterEngine }