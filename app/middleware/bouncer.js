/******************************************************
 * Title:       bouncer.js                            *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     10/09/2021                            *
 * Description:                                       *
 *     Middleware to scan files uploaded by the user  *
 *     and filter them out by filetype. This goes     *
 *     beyond just checking the extension to cross    *
 *     check the actual file signature in its bytes.  *
 ******************************************************/

const crypto = require('crypto')
const path = require('path')
const FileType = require('file-type')

/**
 * Parses the raw HTTP multipart body.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} raw      The raw, unparsed body as
 *                          a hex string.
 * @param {object} boundary The multipart boundary.
 * 
 * @returns {[object]} An array with the file
 *                     information.
 */
const parseMultipartFormData = (raw, boundary) => {
    // convert boundary to a hex string
    boundary = Buffer.from(boundary).toString('hex')
    const boundaryPattern = new RegExp(`(2d){2}${boundary}(2d2d)?0d0a`, 'g')
    return raw.replace(boundaryPattern, '|')
              .split('|')
              .map(rb => rb.split('0d0a0d0a'))
              .filter(rb => rb[0] !== '')
              .map(rb => {
                   // match is equivalent to /(?<=filename=")[a-f\d]+(?=")/ in hex encoding
                   const filenamePattern = /(?<=66696c656e616d653d22)[a-f\d]+(?=22)/

                   const output = {}
                   const matches = rb[0].match(filenamePattern)

                   if (matches) {
                       output.name = Buffer.from(matches[0], 'hex').toString()
                       output.bytes = Buffer.from(rb[1].substr(0, rb[1].length - 4), 'hex')
                   }
                   return output
               })
}

/**
 * Checks file's bytes and flags it if necessary.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {object} file        File information that was
 *                             discovered.
 * @param {object} mimePattern A regular expression that
 *                             explicitly describes the
 *                             allowed MIME types.
 * 
 * @returns {boolean} True if the file is valid, false
 *                    otherwise.
 */
const clearFile = async (file, pattern) => {
    try {
        const fileType = await FileType.fromBuffer(file.bytes)
        return fileType !== undefined && fileType.mime.match(pattern).length > 0
    } catch (err) {
        return false
    }
}

/**
 * "Promise-ified" version of the `crypto` module's
 * `randomBytes` method.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {number} length The number of hexadecimal
 *                        bytes in the string.
 * 
 * @returns {string} The resulting byte string.
 */
const randomBytes = async (length = 8) => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(length, (err, buf) => {
            if (err) return reject(err)
            return resolve(buf.toString('hex'))
        })
    })
}

/**
 * Sanitizes an array of file buffers using the
 * `file-type` module. This functionality was desired
 * because it goes beyond simply checking the file
 * extension and verifies the internal bytes of the file.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {[object]} files       An array of objects
 *                               containing the raw bytes
 *                               of each file and original
 *                               name.
 * @param {object}   mimePattern A regular expression that
 *                               explicitly describes the
 *                               allowed MIME types.
 * 
 * @returns {object} An object containing the names and bytes
 *                   of the cleared files as well as the
 *                   names of any files that had an invalid
 *                   MIME type.
 */
const sanitize = async (files, mimePattern = /^$/) => {
    const cleared = []
    const rejected = []
    const filteredFiles = []

    // scan submitted files in parallel
    await Promise.all(files.map(async file => {
        const ok = await clearFile(file, mimePattern)
        if (ok) {
            const { name, ext } = path.parse(file.name)
            const scramble = await randomBytes(8)
            const unique = `${name}-${scramble}${ext}`
            cleared.push({ original: file.name, unique })
            filteredFiles.push({ unique, ...file})
        } else if (file.name) {
            rejected.push(file.name)
        }
    }))
    return { cleared, rejected, filteredFiles }
}

/**
 * Generates middleware for intercepting multipart form
 * data submitted by the user and vets the contents of each
 * file to give sort out any suspicious files that are
 * faking a file extension.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {object} mimePattern A regular expression that matches
 *                             the acceptable MIME types.
 * 
 * @returns {object} Middleware for the sanitizing process.
 */
const bounce = mimePattern => async (req, res, next) => {
    if (!mimePattern || mimePattern.constructor.name !== 'RegExp') return next()
    if (req.headers['content-length'] === '0') return next()

    // holds raw bytes of multipart body
    let data = ''
    req.setEncoding('hex')

    req.on('data', chunk => data += chunk)
    req.on('end', async () => {
        // remove excess boundaries and whitespace
        const boundary = req.headers['content-type'].match(/(?<=boundary=).*$/)[0]
        const allFiles = parseMultipartFormData(data, boundary)
        req.files = await sanitize(allFiles, mimePattern)
        return next()
    })
}

module.exports = bounce