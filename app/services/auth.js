/****************************************************************
 * Title:       auth.js                                         *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)           *
 * Created:     10/23/2021                                      *
 * Description: Handles authentication and password generation. *
 ****************************************************************/

const bcrypt = require('bcrypt')
const quickResponse = require('../util/quick-response')
const { User } = require('../models')

/**
 * Generates a hashed version of the given plaintext.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} plain - Plaintext to be hashed with
 *                         the `bcrypt` module.
 * 
 * @returns {string} Hashed password.
 */
const hash = async plain => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(plain, 14, (err, hash) => {
            if (err) return reject(err)
            return resolve(hash)
        })
    })
}

/**
 * Authenticates a user into the application.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} username - Username of the user.
 * @param {string} password - Password of the user.
 * 
 * @returns {object} The results of the operation.
 */
const authenticate = async (username, password) => {
    try {
        if (!username) return quickResponse(400, 'Username is required.')
        if (!password) return quickResponse(400, 'Password is required.')

        const user = await User.findOne({ username })
        if (!user) return quickResponse(401, 'Username is incorrect.')

        const hashed = user.password
        if (password && await bcrypt.compare(password, hashed)) {
            return quickResponse(200, 'Sign-in was successful.')
        }
        return quickResponse(401, 'Password is incorrect.')
    } catch (err) {
        return quickResponse(500)
    }
}

/**
 * Hashes a plaintext password.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} plaintext - Plaintext password.
 * 
 * @returns {object} The results of the operation.
 */
const hashPassword = async plaintext => {
    try {
        const message = 'Password generation was successful.'
        return quickResponse(200, message, await hash(plaintext))
    } catch (err) {
        // make `bcrypt` error message look like Mongoose error
        const message = 'The user could not be created.'
        err.message = 'User validation failed: password:' +
                      ' Path `password` is required.'
        return quickResponse(400, message, err.message)
    }
}

/**
 * Returns a response that catches an unauthenticated
 * user.
 * 
 * @returns {object} The response.
 */
const notAuthenticated = () => {
    const message = 'Please sign in to perform this action.'
    return quickResponse(401, message)
}

/**
 * Returns a response that catches an action on a resource
 * not owned by a user.
 * 
 * @returns {object} The response.
 */
const forbiddenAction = () => {
    const message = 'You are not permitted to perform this action.'
    return quickResponse(403, message)
}

module.exports = {
    authenticate,
    hashPassword,
    notAuthenticated,
    forbiddenAction
}