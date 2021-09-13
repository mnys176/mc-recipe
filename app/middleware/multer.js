/******************************************************
 * Title:       multer.js                             *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/13/2021                            *
 * Description:                                       *
 *     Configures Multer middleware to parse          *
 *     an incoming request.                           *
 ******************************************************/

const multer = require('multer')
const media = multer({ dest: 'media' })

module.exports = media