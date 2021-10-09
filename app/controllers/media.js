/********************************************************
 * Title:       media.js                                *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)   *
 * Created:     09/19/2021                              *
 * Description: Manages media associated with entities. *
 ********************************************************/

const path = require('path')
const { readFile, rm, mkdir } = require('fs/promises')
const quickResponse = require('../util/quick-response')

const mediaDir = process.env.MEDIA_ROOT

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
 * Updates and sanitizes a media directory for an
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
        const { cleared, rejected } = files
        const dir = cleared.length > 0 || rejected.length > 0 ?
                    process.env.MEDIA_ROOT :
                    undefined

        // check if no media was given to upload
        if (dir === undefined) {
            const message = 'No media to upload for entity with ID of' +
                            ` "${id}", nothing to do.`
            return quickResponse(204, message)
        }
        let message = 'Some of the selected media was unable to be uploaded.'
        let status = 201

        // check if all files were rejected by the sanitizer
        if (cleared.length === 0) {
            message = 'The selected media was unable to be uploaded,' +
                      ' nothing to do.'
            status = 204
        } else if (rejected.length === 0) {
            message = 'The media for entity with ID of' +
                      ` "${id}" was successfully uploaded.`
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
        return quickResponse(200, message)
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

module.exports = { set, unset, fetch, createDir, removeDir }