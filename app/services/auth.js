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
 * Authenticates a user into the application using
 * the `bcrypt` module.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} username - Username of the user.
 * @param {string} password - Password of the user.
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

module.exports = { authenticate }