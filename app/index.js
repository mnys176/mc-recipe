/********************************************************
 * Title:       index.js                                *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)   *
 * Created:     08/27/2021                              *
 * Description:                                         *
 *     An API that communicates with a MongoDB instance *
 *     to manage a recipe book for meals discovered and *
 *     created throughout the years.                    *
 ********************************************************/

const express = require('express')
const dotenv = require('dotenv').config().parsed
const connectToMongoDB = require('./mongo')

const app = express()
const port = process.env.PORT || dotenv.PORT || 8080

// make the connection to MongoDB
connectToMongoDB()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.listen(port, () => console.log(`Running on port: ${port}`))