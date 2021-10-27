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
        const user = await User.findOne({ username })
        if (!user) return quickResponse(401, 'Username is incorrect.')

        const hashed = user.password
        if (await bcrypt.compare(password, hashed)) {
            return quickResponse(200, 'Sign-in was successful.')
        }
        return quickResponse(401, 'Password is incorrect.')
    } catch (err) {
        return quickResponse(500)
    }
}

/**
 * Generates a hashed version of the given password.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} password - Password in plaintext.
 * 
 * @returns {object} The results of the operation.
 */
const hashPassword = async plain => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(plain, 14, (err, hash) => {
            let message = ''
            if (err) {
                // make `bcrypt` error message look like Mongoose error
                err.message = 'User validation failed: password:' +
                              ' Path `password` is required.'
                message = 'Password creation was unsuccessful.'
                return reject(quickResponse(400, message, err.message))
            }
            message = 'Password creation was successful.'
            return resolve(quickResponse(200, message, hash))
        })
    })
}

module.exports = { authenticate, hashPassword }