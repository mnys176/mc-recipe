/******************************************************
 * Title:       User.js                               *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/28/2021                            *
 * Description: Models a user using Mongoose schemas. *
 ******************************************************/

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const nameSchema = new Schema({
    first: { type: String, required: true, match: /^[A-Z'](\.|[A-z\-']*)$/ },
    middle: { type: String, default: '', match: /^[A-Z']?(\.|[A-z\-']*)$/ },
    last: { type: String, required: true, match: /^[A-Z'](\.|[A-z\-']*)$/ }
}, { _id: false })

const userSchema = new Schema({
    name: { type: nameSchema, required: true },
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 6,
        maxLength: 128,
        match: /^\w{6,128}$/
    },
    password: {
        type: String,
        required: true,
        match: /^\$2[ayb]\$.{56}$/
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxLength: 128,
        match: /^[\w\.]+@\w+(\.\w+)+$/
    },
    media: { type: String, default: '' },
    registered: { type: Number, default: Date.now() }
})

module.exports = mongoose.model('User', userSchema)