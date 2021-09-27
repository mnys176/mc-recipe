/********************************************************
 * Title:       index.js                                *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)   *
 * Created:     08/27/2021                              *
 * Description:                                         *
 *     An API that communicates with a MongoDB instance *
 *     to manage a recipe book for meals discovered and *
 *     created throughout the years.                    *
 ********************************************************/

const path = require('path')
const express = require('express')
const dotenv = require('dotenv').config()

// make connection to MongoDB asynchronously
require('./util/mongo')

// create media directory root
require('./util/check-media')

const app = express()
const port = process.env.PORT || 8080
const webapp = path.join(__dirname, 'webapp', 'dist')

// accept JSON data
app.use(express.json())

// set static routes
app.use('/', express.static(webapp))

// include recipe API routes
app.use('/api/recipes', require('./routes/recipes'))

app.listen(port, () => console.log(`Running on port: ${port}`))