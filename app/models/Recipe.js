/********************************************************
 * Title:       Recipe.js                               *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)   *
 * Created:     08/30/2021                              *
 * Description: Models a recipe using Mongoose schemas. *
 ********************************************************/

const mongoose = require('mongoose')
const Schema = mongoose.Schema

// anything with units (amounts and durations)
const quantifiableSchema = new Schema({
    readable: {
        type: String,
        required: true,
        match: /^\d+[\/\.]?\d*[A-z]+$/,
    },
    numeric: Number,
    unit: String
})

const recipeSchema = new Schema({
    title: { type: String, required: true },
    uploader: { type: String, default: 'Anon Y. Mous' },
    about: {
        type: String,
        default: 'A recipe created by Anon Y. Mous'
    },
    prepTime: { type: quantifiableSchema, required: true },
    ingredients: {
        type: [{
            name: { type: String, required: true },
            amount: quantifiableSchema
        }],
        validate: v => Array.isArray(v) && v.length > 0
    },
    instructions: {
        type: [String],
        validate: v => Array.isArray(v) && v.length > 0
    }
})

module.exports = mongoose.model('Recipe', recipeSchema)