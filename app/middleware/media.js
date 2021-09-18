/********************************************************
 * Title:       media.js                                *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)   *
 * Created:     09/13/2021                              *
 * Description:                                         *
 *     Configures media middleware to parse an incoming *
 *     request.                                         *
 ********************************************************/

const path = require('path')
const multer = require('multer')
const { readdir, readFile, rm, chmod } = require('fs/promises')
const FileType = require('file-type')

/**
 * Leverages the `file-type` module to sanitize
 * a directory. This analyses the actual file
 * contents as opposed to just the extension.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} dir    Path to the directory to be
 *                        sanitized.
 * @param {object} filter Regular expression for the
 *                        acceptable MIME types.
 * 
 * @returns {[string]} Filenames of the rejected files.
 */
const sanitize = async (dir, filter = /INVALID/) => {
    try {
        if (dir) {
            const rejects = []
            const files = await readdir(dir)
            for (let i = 0; i < files.length; i++) {
                const name = files[i]
                const filePath = path.join(dir, name)
                const data = await readFile(filePath)
                const fileType = await FileType.fromBuffer(data)

                // if file is not legitimate, delete it
                if (!fileType || !fileType.mime.match(filter)) {
                    await rm(filePath, { force: true })
                    rejects.push(name)
                } else {
                    // force permissions (just in case)
                    await chmod(filePath, 0o644)
                }
            }
            return rejects
        }
        return []
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