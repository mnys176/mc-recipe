/****************************************************************
 * Title:       auth.js                                         *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)           *
 * Created:     10/23/2021                                      *
 * Description: Handles authentication and password generation. *
 ****************************************************************/

const bcrypt = require('bcrypt')
const quickResponse = require('../util/quick-response')

const authenticate = async (plain, hashed) => {
    try {
        if (await bcrypt.compare(plain, hashed)) {
            return quickResponse(200, 'Sign-in was successful.')
        }
        return quickResponse(401, 'Password is incorrect.')
    } catch (err) {
        return quickResponse(500)
    }
}

module.exports = { authenticate }