/********************************************************
 * Title:       media.js                                *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)   *
 * Created:     09/19/2021                              *
 * Description: Manages media associated with entities. *
 ********************************************************/

const path = require('path')
const { readFile, writeFile, rm, mkdir } = require('fs/promises')
const quickResponse = require('../util/quick-response')

const mediaDir = process.env.MEDIA_ROOT ?? path.join(__dirname, 'media')

/**
 * Creates a media directory.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id ID of the entity.
 */
const createDir = async id => {
    try {
        const dir = path.join(mediaDir, id)
        await mkdir(dir, { recursive: true })
    } catch (err) {
        // ignore for now
    }
}

/**
 * Removes a media directory.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The entity ObjectID.
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
 * Writes files to the media root.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id    ID of the entity.
 * @param {object} files File information provided
 *                       by Bouncer.
 */
const writeToDisk = async (id, files) => {
    // write files to disk in parallel
    return await Promise.all(files.map(async file => {
        try {
            const extension = path.extname(file.name)
            const mediaFile = path.join(mediaDir, id, file.unique)
            return await writeFile(mediaFile, file.bytes)
        } catch (err) {
            // ignore for now
        }
    }))
}

/**
 * Sets and populates a media directory for an
 * entity.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id    ID of the entity.
 * @param {object} files File information provided
 *                       by Bouncer.
 * 
 * @returns {object} The results of the operation.
 */
const set = async (id, files) => {
    try {
        // check if no media was given to upload
        if (files.cleared.length === 0 && files.rejected.length === 0) {
            const message = 'No media to upload for entity with ID of' +
                            ` "${id}", nothing to do.`
            return quickResponse(204, message)
        }
        const { cleared, rejected, filteredFiles } = files

        // default control variables based on success
        let message = 'Some of the selected media was unable to be uploaded.'
        let status = 201
        let writeMedia = true

        const nothingWasCleared = cleared.length === 0
        const nothingWasRejected = rejected.length === 0
        if (nothingWasCleared) {
            message = 'The selected media was unable to be uploaded,' +
                      ' nothing to do.'
            status = 204
            writeMedia = false
        } else if (nothingWasRejected) {
            message = 'The media for entity with ID of' +
                      ` "${id}" was successfully uploaded.`
        }

        // don't write media if there is nothing to upload
        if (writeMedia) {
            await createDir(id)
            await writeToDisk(id, filteredFiles)
        }
        return quickResponse(status, message, { cleared, rejected })
    } catch (err) {
        return quickResponse(500)
    }
}

/**
 * Removes a media directory from an entity.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id ID of the entity.
 * 
 * @returns {object} The results of the operation.
 */
const unset = async id => {
    try {
        const message = 'The media for entity with ID of' +
                        ` "${id}" was successfully deleted.`
        await removeDir(id)
        return quickResponse(200, message)
    } catch (err) {
        return quickResponse(500)
    }
}

/**
 * Resets and populates a media directory for an
 * entity.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id    ID of the entity.
 * @param {object} files File information provided
 *                       by Bouncer.
 * 
 * @returns {object} The results of the operation.
 */
const reset = async (id, files) => {
    try {
        // check if no media was given to upload
        if (files.cleared.length === 0 && files.rejected.length === 0) {
            const message = 'No media to upload for entity with ID of' +
                            ` "${id}", nothing to do.`
            return quickResponse(204, message)
        }
        const { cleared, rejected, filteredFiles } = files

        // default control variables based on success
        let message = 'Some of the selected media was unable to be uploaded.'
        let status = 201
        let writeMedia = true

        const nothingWasCleared = cleared.length === 0
        const nothingWasRejected = rejected.length === 0
        if (nothingWasCleared) {
            message = 'The selected media was unable to be uploaded,' +
                      ' nothing to do.'
            status = 204
            writeMedia = false
        } else if (nothingWasRejected) {
            message = 'The media for entity with ID of' +
                      ` "${id}" was successfully uploaded.`
        }

        // don't write media if there is nothing to upload
        if (writeMedia) {
            await removeDir(id)
            await createDir(id)
            await writeToDisk(id, filteredFiles)
        }
        return quickResponse(status, message, { cleared, rejected })
    } catch (err) {
        return quickResponse(500)
    }
}

/**
 * Fetches media related to the entity.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id   ID of the entity.
 * @param {string} name Name of the file.
 * 
 * @returns {object} The results of the operation.
 */
const fetch = async (id, name) => {
    try {
        const resultPath = path.join(mediaDir, id, name)
        const message = `The media with name of "${name}"` +
                        ` for the entity with ID of "${id}"` +
                        ' was successfully retrieved.'
        const result = await readFile(resultPath)
        return quickResponse(200, message, result)
    } catch (err) {
        const message = `The media with name of "${name}"` +
                        ` for the entity with ID of "${id}"` +
                        ' could not be retrieved.'
        return quickResponse(404, message)
    }
}

module.exports = { set, unset, reset, fetch }