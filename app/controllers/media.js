/*******************************************************
 * Title:       media.js                               *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)  *
 * Created:     09/19/2021                             *
 * Description: Manages media associated with recipes. *
 *******************************************************/

const path = require('path')
const {
    readdir,
    readFile,
    rm,
    mkdir,
    rmdir,
    chmod
} = require('fs/promises')
const FileType = require('file-type')
const quickResponse = require('../util/quick-response')

const mediaDir = path.join(__dirname, '..', 'media')

/**
 * Creates a media directory.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The recipe ObjectID.
 */
const createDir = async id => {
    try {
        const dir = path.join(mediaDir, id)
        await mkdir(dir)
    } catch (err) {
        // ignore for now
    }
}

/**
 * Removes a media directory.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The recipe ObjectID.
 */
const removeDir = async id => {
    try {
        const dir = path.join(mediaDir, id)
        await rm(dir, { recursive: true, force: true })
    } catch (err) {
        // ignore for now
    }
}

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
 * @returns {object} Filenames of the cleared and
 *                   rejected files in arrays.
 */
const sanitize = async (dir, filter = /INVALID/) => {
    try {
        if (dir) {
            const cleared = []
            const rejected = []
            const files = await readdir(dir)
            for (let i = 0; i < files.length; i++) {
                const name = files[i]
                const filePath = path.join(dir, name)
                const data = await readFile(filePath)
                const fileType = await FileType.fromBuffer(data)

                // if file is not legitimate, delete it
                if (!fileType || !fileType.mime.match(filter)) {
                    await rm(filePath, { force: true })
                    rejected.push(name)
                } else {
                    // force permissions (just in case)
                    await chmod(filePath, 0o644)
                    cleared.push(name)
                }
            }
            return { cleared, rejected }
        }
        return []
    } catch (err) {
        throw err
    }
}

/**
 * Updates and sanitizes a media directory for a
 * recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string}   id    ID of the recipe.
 * @param {[object]} files File array created by Multer.
 * 
 * @returns {object} The results of the operation.
 */
const set = async (id, files = []) => {
    try {
        const dir = files.length > 0 ? files[0].destination : undefined

        // check if no media was given to upload
        if (dir === undefined) {
            const message = 'No media to upload for recipe with ID of' +
                            ` "${id}", nothing to do.`
            return quickResponse(204, message)
        }

        // clean out suspicious files and store names of rejects
        const mimeFilter = /image\/(jpeg|png)/
        const { cleared, rejected } = await sanitize(dir, mimeFilter)

        // check if all files were rejected by the sanitizer
        if (rejected.length === files.length) {
            const message = 'The selected media was unable to be uploaded,' +
                            ' nothing to do.'
            return quickResponse(204, message, rejected)
        }

        // check if all files were cleared by the sanitizer
        if (rejected.length === 0) {
            const message = 'The media for recipe with ID of' +
                            ` "${id}" was successfully uploaded.`
            return quickResponse(201, message, cleared)
        }
        const message = 'Some of the selected media was unable to be uploaded.'
        return quickResponse(201, message, { cleared, rejected })
    } catch (err) {
        const { status, data } = quickResponse(500)
        return res.status(status).json(data)
    }
}

/**
 * Removes a media directory from a recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id ID of the recipe.
 * 
 * @returns {object} The results of the operation.
 */
const unset = async id => {
    try {
        const message = `The media for recipe with ID of "${id}" was successfully deleted.`
        return quickResponse(200, message)
    } catch (err) {
        return quickResponse(500)
    }
}

module.exports = { set, unset, createDir, removeDir }