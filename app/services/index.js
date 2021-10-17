/******************************************************
 * Title:       index.js                              *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     10/17/2021                            *
 * Description: Indexes services.                     *
 ******************************************************/

module.exports = {
    recipeService: require('./recipe'),
    userService: require('./user'),
    mediaService: require('./media')
}