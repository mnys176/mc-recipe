/************************************************************
 * Title:       mongo.js                                    *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     08/27/2021                                  *
 * Description:                                             *
 *     Establishes a connection to MongoDB. This connection *
 *     is used to execute statements and queries on the     *
 *     database.                                            *
 ************************************************************/

(async () => {
    const mongoose = require('mongoose')
    try {
        const { connection } = await mongoose.connect(process.env.MONGODB_URI)
        const mongoDomain = `${connection.host}:${connection.port}`
        console.log(`Connection to MongoDB at ${mongoDomain} succeeded!`)
    } catch (err) {
        throw err
    }
})()