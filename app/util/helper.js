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

module.exports = { extractRecipe }