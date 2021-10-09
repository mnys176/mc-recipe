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

const FileType = require('file-type')

/**
 * 
 */
const parseMultipartFormData = raw => {
    return raw.replace(/(2d2d)?(2d){28}[a-f\d]{48}(2d2d)?0d0a/g, '|')
              .split('|')
              .map(rb => rb.split('0d0a0d0a'))
              .filter(rb => rb[0] !== '')
              .map(rb => {
                   // match is equivalent to /(?<=filename=")[a-f\d+](?=")/ in hex encoding
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
 * 
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
 * 
 */
const sanitize = async (files, mimePattern = /^$/) => {
    const cleared = []
    const rejected = []
    const filteredFiles = []

    // scan submitted files in parallel
    await Promise.all(files.map(async file => {
        const ok = await clearFile(file, mimePattern)
        if (ok) {
            cleared.push(file.name)
            filteredFiles.push(file)
        } else if (file.name) {
            rejected.push(file.name)
        }
    }))

    
    return { cleared, rejected }
}

/**
 * 
 */
const bounce = mimePattern => async (req, res, next) => {
    if (!mimePattern || mimePattern.constructor.name !== 'RegExp') return next()
    const boundaryPattern = /(?<=boundary=).*$/
    const boundary = `${req.headers['content-type'].match(boundaryPattern)[0]}\r\n`
    let data = ''

    req.setEncoding('hex')
    req.on('data', chunk => data += chunk)
    req.on('end', async () => {
        // remove excess boundaries and whitespace
        const allFiles = parseMultipartFormData(data)
        req.files = await sanitize(allFiles, mimePattern)
    })
    return next()
}

module.exports = { bounce }