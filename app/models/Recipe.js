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
        match: /^\d+[\/\.]?\d+[A-z]+$/,
    },
    numeric: Number,
    unit: String
})

const recipeSchema = new Schema({
    title: { type: String, required: true },
    about: {
        type: String,
        default: 'A recipe created by me.'
    },
    prepTime: quantifiableSchema,
    ingredients: {
        type: [{
            name: { type: String, required: true },
            amount: quantifiableSchema
        }],
        required: true
    },
    instructions: { type: [String], required: true }
})

module.exports = mongoose.model('Recipe', recipeSchema)