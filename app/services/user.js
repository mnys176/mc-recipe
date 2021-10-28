/******************************************************
 * Title:       user.js                               *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/29/2021                            *
 * Description:                                       *
 *       Set of functions that interact with the      *
 *       user Mongoose model.                         *
 ******************************************************/

const path = require('path')
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
 * @param {object} builder - Builder object.
 * 
 * @returns {object} Premature user as a `Promise`.
 */
const buildUser = builder => {
    // useless method kept for extension
    return new Promise((resolve, reject) => resolve(builder))
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
 * @param {object} name     - User name.
 * @param {string} username - User username.
 * @param {string} password - User password (hashed).
 * @param {string} email    - User E-mail.
 * 
 * @returns {object} The results of the operation.
 */
const create = async (name, username, password, email) => {
    const badRequestMessage = 'The user could not be created.'
    const createdMessage = 'The user with ID of "<>"' +
                           ' was successfully created.'
    try {
        const builder = { name, username, password, email }
        const newUser = new User(await buildUser(builder))
        await newUser.save()
        return quickResponse(201, createdMessage.replace('<>', newUser._id))
    } catch (err) {
        return quickResponse(400, badRequestMessage, err.message)
    }
}

/**
 * Modifies a user in the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id       - The ID of the user.
 * @param {object} name     - User name.
 * @param {string} username - User username.
 * @param {string} password - User password (hashed).
 * @param {string} email    - User E-mail.
 * 
 * @returns {object} The results of the operation.
 */
const change = async (id, name, username, password, email) => {
    const notFoundMessage = `The user with ID of "${id}"` +
                            ' could not be retrieved.'
    const badRequestMessage = `The user with ID of "${id}"` +
                              ' could not be updated.'
    const okMessage = `The user with ID of "${id}"` +
                      ' was successfully updated.'
    try {
        if (!objectIdIsValid(id)) {
            return quickResponse(404, notFoundMessage)
        }

        // use method that already handles '404 Not Found'
        const temp = await fetchById(id)
        const currUser = temp.data.message

        const builder = { name, username, password, email }
        const newUser = new User(await buildUser(builder))

        // map new properties to user model
        currUser.name = newUser.name
        currUser.username = newUser.username
        currUser.email = newUser.email
        currUser.password = newUser.password ?? currUser.password
        await currUser.save()

        return quickResponse(200, okMessage)
    } catch (err) {
        return quickResponse(400, badRequestMessage, err.message)
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
    const okMessage = `The user with ID of "${id}"` +
                      ' was successfully deleted.'
    try {
        if (!objectIdIsValid(id)) {
            return quickResponse(404, notFoundMessage)
        }
        const data = await User.findByIdAndDelete(id)
        if (!data) return quickResponse(404, notFoundMessage)
        return quickResponse(200, okMessage)
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
    const notFoundMessage = `The user with ID of "${id}"` +
                            ' does not exist.'
    const badRequestMessage = `The media for the user with ID of "${id}"` +
                              ' could not be created, already exists.'
    const okMessage = `The user with ID of "${id}"` +
                      ' was successfully linked to the new media.'

    // ensure user exists before continuing
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
        return quickResponse(400, badRequestMessage)
    }

    // save filenames to user model
    if (files.cleared.length > 0) {
        user.media = files.cleared[0].unique
        user.save()
    }
    return quickResponse(200, okMessage)
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
    const notFoundMessage = `The user with ID of "${id}"` +
                            ' does not exist.'
    const okMessage = `The user with ID of "${id}"` +
                      ' was successfully updated to the new media.'

    // ensure user exists before continuing
    const userExists = await exists(id)
    if (!userExists) return quickResponse(404, notFoundMessage)

    const temp = await fetchById(id)
    const user = temp.data.message

    // update filenames in user model
    if (files.cleared.length > 0) {
        user.media = files.cleared[0].unique
        user.save()
    }
    return quickResponse(200, okMessage)
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
    const notFoundMessage = `The user with ID of "${id}"` +
                            ' does not exist.'
    const okMessage = `The user with ID of "${id}"` +
                      ' was successfully updated with no media.'

    // ensure user exists before continuing
    const userExists = await exists(id)
    if (!userExists) return quickResponse(404, notFoundMessage)

    const temp = await fetchById(id)
    const user = temp.data.message

    // remove filenames from user model
    user.media = ''
    user.save()

    return quickResponse(200, okMessage)
}

/**
 * Signs the user with the given username
 * into the application.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} username - User username.
 * 
 * @returns {object} The results of the operation.
 */
const signIn = async username => {
    const notFoundMessage = `The user with username of "${username}"` +
                            ' does not exist.'
    const badRequestMessage = `The user with username of "${username}"` +
                              ' is already signed in.'
    const okMessage = `The user with username of "${username}"` +
                      ' was signed into the application.'
    try {
        const user = await User.findOne({ username })
        if (!user) return quickResponse(404, notFoundMessage)

        // check if user is already signed in
        if (user.active) return quickResponse(400, badRequestMessage)

        user.active = true
        user.save()

        return quickResponse(200, okMessage)
    } catch (err) {
        return quickResponse(500)
    }
}

/**
 * Signs the user with the given username
 * out of the application.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} username - User username.
 * 
 * @returns {object} The results of the operation.
 */
const signOut = async username => {
    const notFoundMessage = `The user with username of "${username}"` +
                            ' does not exist.'
    const badRequestMessage = `The user with username of "${username}"` +
                              ' is already signed out.'
    const okMessage = `The user with username of "${username}"` +
                      ' was signed out of the application.'
    try {
        const user = await User.findOne({ username })
        if (!user) return quickResponse(404, notFoundMessage)

        // check if user is already signed out
        if (!user.active) return quickResponse(400, badRequestMessage)

        user.active = false
        user.save()

        return quickResponse(200, okMessage)
    } catch (err) {
        return quickResponse(500)
    }
}

module.exports = {
    fetch,
    fetchById,
    create,
    change,
    discard,
    setMedia,
    resetMedia,
    unsetMedia,
    signIn,
    signOut
}