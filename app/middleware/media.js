/********************************************************
 * Title:       media.js                                *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)   *
 * Created:     09/13/2021                              *
 * Description:                                         *
 *     Configures media middleware to parse an incoming *
 *     request.                                         *
 ********************************************************/

const path = require('path')
const { readdir, readFile, rm, chmod } = require('fs/promises')
const multer = require('multer')
const getStream = require('get-stream')
const FileType = require('file-type')

const sanitize = async dest => {
    try {
        const files = await readdir(dest)
        files.forEach(async name => {
            const filePath = path.join(dest, name)
            const data = await readFile(filePath)
            const fileType = await FileType.fromBuffer(data)

            // if files are neither PNG or JPG, delete them
            if (!fileType || !fileType.mime.match(/image\/(png|jpeg)/)) {
                await rm(filePath, { force: true })
            } else {
                await chmod(filePath, 0o644)
            }
        })
    } catch (err) {
        throw err
    }
}

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const dest = path.join('media', req.params.id)
        cb(null, dest)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const media = multer({ storage })

module.exports = { media, sanitize }