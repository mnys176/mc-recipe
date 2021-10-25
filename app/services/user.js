/******************************************************
 * Title:       user.js                               *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/29/2021                            *
 * Description:                                       *
 *       Set of functions that interact with the        *
 *       user Mongoose model.                           *
 ******************************************************/

const path = require('path')
const bcrypt = require('bcrypt')
const mediaService = require('./media')
const authService = require('./auth')
const { User } = require('../models')
const quickResponse = require('../util/quick-response')

/**
 * Confirms that the provided ID is a MongoDB
 * ObjectID.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id - Provided ObjectID.
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
 * @param {object}  body   - Request body object.
 * @param {boolean} rehash - Rehash the password with
 *                           the `bcrypt` module.
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
                // make `bcrypt` error message look like Mongoose error
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
 * @param {string} id - The ID of the user.
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

const signin = async (username, password) => {
    try {
        const data = await User.findOne({ username })
        if (data) {
            const hashed = data.password
            return await authService.authenticate(password, hashed)
        }
        return quickResponse(401, 'Username is incorrect.')
    } catch (err) {
        return quickResponse(500)
    }
}

/**
 * Creates a user and adds it to the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {object} json - A JSON object with the bones
 *                        of a user.
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
 * @param {string} id   - The ID of the user.
 * @param {object} json - A JSON object with the bones
 *                        of a user.
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
 * @param {string} id - The ID of the user.
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
 * @param {string} id - The ID of the user.
 * 
 * @returns {boolean} True if it does exist,
 *                      false otherwise.
 */
const exists = async id => {
    try {
        return await User.exists({ _id: id })
    } catch (err) {
        return false
    }
}

/**
 * Adds a link to a media file to a recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id    - ID of the user.
 * @param {object} files - File information provided
 *                         by Bouncer.
 * 
 * @returns {object} The results of the operation.
 */
const setMedia = async (id, files) => {
    // ensure user exists before continuing
    const notFoundMessage = `The user with ID of "${id}"` +
                            ' does not exist.'
    const userExists = await exists(id)
    if (!userExists) return quickResponse(404, notFoundMessage)

    const temp = await fetchById(id)
    const user = temp.data.message

    // make sure the '204 No Content' response doesn't apply first
    let noContentResponseNotNeeded = false
    if (files) {
        const mediaIncluded = Object.values(files).some(a => a.length > 0)
        const somethingWasCleared = files.cleared.length > 0
        noContentResponseNotNeeded = mediaIncluded && somethingWasCleared
    }

    // not an update, do not change media if it already exists
    if (user.media && noContentResponseNotNeeded) {
        const message = `The media for the user with ID of "${id}"` +
                        ' could not be created, already exists.'
        return quickResponse(400, message)
    }

    // save filenames to user model
    if (files.cleared.length > 0) {
        user.media = files.cleared[0].unique
        user.save()
    }
    const successMessage = `The user with ID of "${id}"` +
                           ' was successfully linked to the new media.'
    return quickResponse(200, successMessage)
}

/**
 * Overwrites media names in a user.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id    - ID of the user.
 * @param {object} files - File information provided
 *                         by Bouncer.
 * 
 * @returns {object} The results of the operation.
 */
const resetMedia = async (id, files) => {
    // ensure user exists before continuing
    const notFoundMessage = `The user with ID of "${id}"` +
                            ' does not exist.'
    const userExists = await exists(id)
    if (!userExists) return quickResponse(404, notFoundMessage)

    const temp = await fetchById(id)
    const user = temp.data.message

    // update filenames in user model
    if (files.cleared.length > 0) {
        user.media = files.cleared[0].unique
        user.save()
    }
    const successMessage = `The user with ID of "${id}"` +
                           ' was successfully updated to the new media.'
    return quickResponse(200, successMessage)
}

/**
 * Unlinks media names from a user.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {string} id - ID of the user.
 * 
 * @returns {object} The results of the operation.
 */
const unsetMedia = async id => {
    // ensure user exists before continuing
    const notFoundMessage = `The user with ID of "${id}"` +
                            ' does not exist.'
    const userExists = await exists(id)
    if (!userExists) return quickResponse(404, notFoundMessage)

    const temp = await fetchById(id)
    const user = temp.data.message

    // remove filenames from user model
    user.media = ''
    user.save()

    const successMessage = `The user with ID of "${id}"` +
                           ' was successfully updated with no media.'
    return quickResponse(200, successMessage)
}

module.exports = {
    fetch,
    fetchById,
    signin,
    create,
    change,
    discard,
    setMedia,
    resetMedia,
    unsetMedia
}