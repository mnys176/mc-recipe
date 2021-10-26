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
 * Coerces a starter object into a user. The final
 * result should meet the requirements for the `User`
 * model handled by the `mongoose` module.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {object}  builder - Request body object.
 * @param {boolean} rehash  - Rehash the password with
 *                            the `bcrypt` module.
 * 
 * @returns {object} Premature user as a `Promise`.
 */
const buildUser = (builder, rehash) => {
    return new Promise((resolve, reject) => {
        // skip encryption if desired
        if (!rehash) return resolve(builder)

        // TODO: Encrypt the password in `auth.js`.

        // encrypt password
        bcrypt.hash(builder.password, 14, (err, hash) => {
            if (err) {
                // make `bcrypt` error message look like Mongoose error
                err.message = 'User validation failed: password:' +
                              ' Path `password` is required.'
                return reject(err)
            }
            builder.password = hash
            return resolve(builder)
        })
    })
}

/**
 * Fetches all users and returns the results
 * to the controller to be parsed.
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
 * Fetches a single user by its ID and returns the result
 * to the controller to be parsed.
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

/**
 * Creates a user and adds it to the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {object} builder - A JSON object with the bones
 *                           of a user.
 * 
 * @returns {object} The results of the operation.
 */
const create = async builder => {
    try {
        const newUser = new User(await buildUser(builder, true))
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
 * @param {string} id      - The ID of the user.
 * @param {object} builder - A JSON object with the bones
 *                           of a user.
 * 
 * @returns {object} The results of the operation.
 */
const change = async (id, builder) => {
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
        const makeNewPassword = builder.hasOwnProperty('password')
        const newUser = new User(await extractUser(builder, makeNewPassword))

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
    create,
    change,
    discard,
    setMedia,
    resetMedia,
    unsetMedia
}