/******************************************************
 * Title:       index.js                              *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     10/17/2021                            *
 * Description: Indexes middlewares.                  *
 ******************************************************/

module.exports = {
    bounce: require('./bouncer'),
    authFw: require('./auth-firewall')
}