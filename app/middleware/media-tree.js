const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const parentPath = path.join('media')

/**
 * Creates a media directory.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The recipe ObjectID.
 */
const createDir = id => {
    try {
        const dir = path.join(parentPath, id)
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
        const dir = path.join(parentPath, id)
        fs.rmSync(dir, { recursive: true })
    } catch (err) {
        // ignore for now
    }
}

/**
 * Middleware that prepares media directories based
 * on request for Multer.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {object}   req  The request.
 * @param {object}   res  The response.
 * @param {function} next Next middleware in line.
 */
const injectMedia = (req, res, next) => {
    createDir(req.params.id)
    next()
}

/**
 * Middleware that prepares media directories based
 * on request for Multer.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {object}   req  The request.
 * @param {object}   res  The response.
 * @param {function} next Next middleware in line.
 */
const alterMedia = (req, res, next) => {
    removeDir(req.params.id)
    createDir(req.params.id)
    next()
}

/**
 * Middleware that prepares media directories based
 * on request for Multer.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {object}   req  The request.
 * @param {object}   res  The response.
 * @param {function} next Next middleware in line.
 */
const purgeMedia = (req, res, next) => {
    removeDir(req.params.id)
    next()
}

/**
 * Middleware that prepares media directories based
 * on request for Multer.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {object}   req  The request.
 * @param {object}   res  The response.
 * @param {function} next Next middleware in line.
 */
const setMediaTree = (req, res, next) => {
    if (req.method === 'POST') {
        
    }
}

module.exports = { injectMedia, alterMedia, purgeMedia }