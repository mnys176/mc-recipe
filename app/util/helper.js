/*******************************************************
 * Title:       helper.js                              *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)  *
 * Created:     09/02/2021                             *
 * Description:                                        *
 *     Set of helper functions to abstract away common *
 *     logic from routes.                              *
 *******************************************************/

const Quantifiable = require('./quantify')

/**
 * Parses a quantifiable object from the frontend to
 * the backend.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {object} input Frontend quantifiable.
 * 
 * @returns {object} Backend quantifiable.
 */
const mapQuantifiable = input => {
    if (input && input.quantity && input.unit) {
        // leverage the unit classes for dynamic interpretation
        const quantifiable = Quantifiable.build(input.quantity, input.unit)
        return {
            readable: quantifiable.readable,
            numeric: quantifiable.normalized,
            unit: quantifiable.units
        }
    }
}

/**
 * Extracts a recipe object from the request
 * body to be handled by Mongoose.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {object} body Request body.
 * 
 * @returns {object} Premature recipe.
 */
const extractRecipe = body => {
    // bring literal data into recipe
    const recipeBuilder = { ...body }

    // build preparation time if it exists
    recipeBuilder.prepTime = mapQuantifiable(body.prepTime)

    // build ingredients if they exist
    if (body.ingredients) {
        recipeBuilder.ingredients = body.ingredients.map(i => {
            return {
                name: i.name,
                amount: mapQuantifiable(i.amount)
            }
        })
    }
    return recipeBuilder
}

/**
 * Handles a '404 Not Found' error when the client
 * requests a nonexistent ID.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {string} id      ID of a requested recipe.
 * 
 * @return {object} An object describing the error.
 */
const handleNotFound = (id) => {
    const message = `No recipes returned with ID of "${id}".`
    const reason = 'Not found.'
    return { status: 404, message, reason }
}

/**
 * Confirms that the provided ID is a MongoDB
 * ObjectID.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id Provided ObjectID.
 * 
 * @returns {boolean} True if valid, false if not.
 */
const objectIdIsValid = id => id.match(/^[a-f\d]{24}$/i)

module.exports = { extractRecipe, handleNotFound, objectIdIsValid }