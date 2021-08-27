/************************************************************
 * Title:       mongo.js                                    *
 * Author:      Mike Nystoriak (mnystoriak@gmail.com)       *
 * Created:     08/27/2021                                  *
 * Description:                                             *
 *     Establishes a connection to MongoDB. This connection *
 *     is used to execute statements and queries on the     *
 *     database.                                            *
 ************************************************************/

const mongoose = require('mongoose')
const dotenv = require('dotenv').config().parsed

const connectToMongoDB = async () => {
    const connParams = {
        host: 'localhost',
        port: 3001,
        user: dotenv.MONGODB_USERNAME,
        password: dotenv.MONGODB_PASSWORD,
        database: 'development'
    }
    const uri = `mongodb://${connParams.user}:${connParams.password}` +
                `@${connParams.host}:${connParams.port}` +
                `/${connParams.database}?authSource=admin`

    try {
        await mongoose.connect(uri)
        console.log(`Connection to MongoDB on ${connParams.host}:${connParams.port} succeeded!`)
    } catch (err) {
        throw err;
    }
}

module.exports = connectToMongoDB