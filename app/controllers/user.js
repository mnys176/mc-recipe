/******************************************************
 * Title:       user.js                               *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/29/2021                            *
 * Description:                                       *
 *     Set of functions that interact with the        *
 *     user Mongoose model.                           *
 ******************************************************/

const path = require('path')
const bcrypt = require('bcrypt')
const media = require('./media')
const User = require('../models/User')
const quickResponse = require('../util/quick-response')

/**
 * Confirms that the provided ID is a MongoDB
 * ObjectID.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id Provided ObjectID.
 * 
 * @returns {boolean} True if valid, false if not.
 */
const objectIdIsValid = id => id.match(/^[a-f\d]{24}$/i)

/**
 * Extracts a user object from the request
 * body to be handled by Mongoose.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {object}  body   Request body object.
 * @param {boolean} rehash Rehash the password with
 *                         BCrypt.
 * 
 * @returns {object} Premature user as a `Promise`.
 */
const extractUser = (body, rehash) => {
    return new Promise((resolve, reject) => {
        // bring literal data into user
        const userBuilder = { ...body }

        // skip encryption if desired
        if (!rehash) return resolve(userBuilder)

        // encrypt password
        bcrypt.hash(body.password, 14, (err, hash) => {
            if (err) {
                // make BCrypt error message look like Mongoose error
                err.message = 'User validation failed: password:' +
                              ' Path `password` is required.'
                return reject(err)
            }
            userBuilder.password = hash
            return resolve(userBuilder)
        })
    })
}

/**
 * Fetches all users and returns the results
 * to the routes to be parsed.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @returns {object} The results of the query.
 */
const fetch = async () => {
    try {
        const data = await User.find()
        return quickResponse(200, data)
    } catch (err) {
        // this should never happen
        return quickResponse(500)
    }
}

/**
 * Fetches a single user and returns the result
 * to the routes to be parsed.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The ID of the user.
 * 
 * @returns {object} The results of the query.
 */
const fetchById = async id => {
    const notFoundMessage = `The user with ID of "${id}"` +
                            ' could not be retrieved.'
    try {
        const data = await User.findById(id)
        if (data) return quickResponse(200, data)
        return quickResponse(404, notFoundMessage)
    } catch (err) {
        // handle invalid IDs as 'Not Found'
        return quickResponse(404, notFoundMessage)
    }
}

/**
 * Creates a user and adds it to the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {object} json A JSON object with the bones
 *                      of a user.
 * 
 * @returns {object} The results of the operation.
 */
const create = async json => {
    try {
        const newUser = new User(await extractUser(json, true))
        await newUser.save()
        const message = `The user with ID of "${newUser._id}"` +
                        ' was successfully created.'
        return quickResponse(201, message)
    } catch (err) {
        const message = 'The user could not be created.'
        return quickResponse(400, message, err.message)
    }
}

/**
 * Modifies a user in the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id   The ID of the user.
 * @param {object} json A JSON object with the bones
 *                      of a user.
 * 
 * @returns {object} The results of the operation.
 */
const change = async (id, json) => {
    try {
        if (!objectIdIsValid(id)) {
            const message = `The user with ID of "${id}"` +
                            ' could not be retrieved.'
            return quickResponse(404, message)
        }

        // use method that already handles '404 Not Found'
        const temp = await fetchById(id)
        const currUser = temp.data.message

        // determine whether or not to change (rehash) a password
        const makeNewPassword = json.hasOwnProperty('password')
        const newUser = new User(await extractUser(json, makeNewPassword))

        // map new properties to user model
        currUser.name = newUser.name
        currUser.username = newUser.username
        currUser.email = newUser.email
        currUser.password = newUser.password ?? currUser.password

        await currUser.save()

        const message = `The user with ID of "${id}"` +
                        ' was successfully updated.'
        return quickResponse(200, message)
    } catch (err) {
        const message = `The user with ID of "${id}"` +
                        ' could not be updated.'
        return quickResponse(400, message, err.message)
    }
}

/**
 * Discards a user from the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The ID of the user.
 * 
 * @returns {object} The results of the operation.
 */
const discard = async id => {
    const notFoundMessage = `The user with ID of "${id}"` +
                            ' could not be retrieved.'
    try {
        if (!objectIdIsValid(id)) return quickResponse(404, notFoundMessage)
        const data = await User.findByIdAndDelete(id)
        if (!data) return quickResponse(404, notFoundMessage)

        const message = `The user with ID of "${id}"` +
                        ' was successfully deleted.'
        return quickResponse(200, message)
    } catch (err) {
        // handle invalid IDs as 'Not Found'
        return quickResponse(404, notFoundMessage)
    }
}

/**
 * Checks if a user exists in the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The ID of the user.
 * 
 * @returns {boolean} True if it does exist,
 *                    false otherwise.
 */
// const exists = async id => {
//     try {
//         return await User.exists({ _id: id })
//     } catch (err) {
//         return false
//     }
// }

/**
 * Middleware that prepares media directories based
 * on request.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {object}   req  The request.
 * @param {object}   res  The response.
 * @param {function} next Next middleware in line.
 */
// const prepareMedia = async (req, res, next) => {
//     const { id } = req.params
//     const notFoundMessage = `The user with ID of "${id}"` +
//                             ' does not exist.'
//     const userExists = await exists(id)

//     // skip multer entirely if user does not exist
//     if (!userExists) {
//         const { status, data } = quickResponse(404, notFoundMessage)
//         return res.status(status).json(data) && next('route')
//     }

//     if (req.method === 'POST') {
//         await media.createDir(id)
//     } else if (req.method === 'PUT') {
//         await media.removeDir(id)
//         await media.createDir(id)
//     } else if (req.method === 'DELETE') {
//         await media.removeDir(id)
//     }
//     return next()
// }

/**
 * Stages a media directory for the user.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string}   id    ID of the user.
 * @param {[object]} files File array created by Multer.
 * 
 * @returns {object} The results of the operation.
 */
// const setMedia = async (id, files) => {
//     const results = await media.set(id, files)

//     // save filenames to user model
//     const { context } = results.data
//     if (context) {
//         const temp = await fetchById(id)
//         const currUser = temp.data.message
//         currUser.media = context.cleared
//         currUser.save()
//     }
//     return results
// }

/**
 * Stages a media directory for the user.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id ID of the user.
 * 
 * @returns {object} The results of the operation.
 */
// const unsetMedia = async id => {
//     const results = await media.unset(id)
//     const temp = await fetchById(id)
//     const currUser = temp.data.message
//     currUser.media = []
//     currUser.save()
//     return results
// }

/**
 * Fetches media for the user.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id   ID of the user.
 * @param {string} name Name of the file.
 * 
 * @returns {object} The results of the operation.
 */
// const fetchMedia = async (id, name) => await media.fetch(id, name)

module.exports = {
    fetch,
    fetchById,
    create,
    change,
    discard
    // prepareMedia,
    // setMedia,
    // unsetMedia,
    // fetchMedia
}