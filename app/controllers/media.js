/*******************************************************
 * Title:       media.js                               *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)  *
 * Created:     09/19/2021                             *
 * Description: Manages media associated with recipes. *
 *******************************************************/

const path = require('path')

const media = '../media'

/**
 * Creates a media directory.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The recipe ObjectID.
 */
const createDir = id => {
    try {
        const dir = path.join(media, id)
        fs.mkdirSync(dir, { recursive: true })
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
const removeDir = id => {
    try {
        const dir = path.join(media, id)
        fs.rmSync(dir, { recursive: true })
    } catch (err) {
        // ignore for now
    }
}

/**
 * Checks if a recipe exists in the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The ID of the recipe.
 * 
 * @returns {boolean} True if it does exist,
 *                    false otherwise.
 */
const exists = async id => {
    try {
        return await Recipe.exists({ _id: id })
    } catch (err) {
        return false
    }
}

/**
 * Creates a media directory for a recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The ID of the recipe.
 */
const addMedia = async id => {
    // if the recipe is valid only
    const recipeExists = await exists(id)
    if (recipeExists) return createDir(id)
}

/**
 * Removes a media directory for a recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The ID of the recipe.
 */
const removeMedia = async id => {
    // if the recipe is valid only
    const recipeExists = await exists(id)
    if (recipeExists) return removeDir(id)
}

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

module.exports = { addMedia, removeMedia, sanitize }