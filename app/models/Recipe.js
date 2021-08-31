/********************************************************
 * Title:       Recipe.js                               *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)   *
 * Created:     08/30/2021                              *
 * Description: Models a recipe using Mongoose schemas. *
 ********************************************************/

const mongoose = require('mongoose')
const units = require('../util/enum')
const Schema = mongoose.Schema

/**
 * Aggregates all possible units into an array and
 * checks that the provided unit is registered as
 * an enumeration.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param  {string} unit Provided unit.
 * 
 * @return {boolean}     Flag indicating whether or
 *                       not the unit is valid.
 */
const validateUnit = unit => {
    const validUnits = []
    Object.values(units).forEach(unitType => {
        validUnits.push(Object.values(unitType))
    })
    return validUnits.flat().includes(unit)
}

// anything with units (amounts and durations)
const quantifiableSchema = new Schema({
    readable: {
        type: String,
        required: true
    },
    numeric: Number,
    unit: {
        type: String,
        validate: validateUnit
    }
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