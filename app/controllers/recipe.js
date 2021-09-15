/******************************************************
 * Title:       recipe.js                             *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/15/2021                            *
 * Description:                                       *
 *     Set of functions that interact with the        *
 *     recipe Mongoose model.                         *
 ******************************************************/

const Recipe = require('../models/Recipe')
const Quantifiable = require('../util/quantify')

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
 * @param {object} Request body object.
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
 * @param {string} id ID of a requested recipe.
 * 
 * @return {object} An object describing the error.
 */
const handleNotFound = id => {
    const status = 404
    const message = `No recipes returned with ID of "${id}".`
    const reason = 'Not found.'
    return { status, data: { status, message, reason } }
}

/**
 * Handles a '400 Bad Request' error when the client
 * provides insufficient data to manipulate a recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {string} id     ID of a requested recipe.
 * @param {string} reason The reason the recipe could
 *                        not be created.
 * 
 * @return {object} An object describing the error.
 */
const handleBadRequest = (id, reason) => {
    const status = 400
    const message = `The recipe with ObjectID of "${id}" could not be modified.`
    return { status, data: { status, message, reason } }
}

/**
 * Handles an error that occures when handling a
 * recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @return {object} An object describing the error.
 */
const handleServerError = () => {
    const status = 500
    const message = 'Something went wrong...'
    const reason = 'Unknown server error.'
    return { status, data: { status, message, reason } }
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

/**
 * Fetches all recipes and returns the results
 * to the routes to be parsed.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @returns {object} The results of the query.
 */
const fetch = async () => {
    try {
        const data = await Recipe.find()
        return { status: 200, data }
    } catch (err) {
        // this should never happen
        return handleServerError()
    }
}

/**
 * Fetches a single recipe and returns the result
 * to the routes to be parsed.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The ID of the recipe.
 * 
 * @returns {object} The results of the query.
 */
const fetchById = async id => {
    try {
        const data = await Recipe.findById(id)
        if (!data) return handleNotFound(id)
        return { status: 200, data }
    } catch (err) {
        // handle invalid IDs as 'Not Found'
        return handleNotFound(id)
    }
}

/**
 * Creates a recipe and adds it to the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {object} json A JSON object with the bones
 *                      of a recipe.
 * 
 * @returns {object} The results of the operation.
 */
const create = async json => {
    const newRecipe = new Recipe(extractRecipe(json))
    try {
        await newRecipe.save()
        const status = 201
        const message = 'The recipe with ObjectID of' +
                        ` "${newRecipe._id}" was successfully created.`
        return { status, data: { status, message } }
    } catch (err) {
        return handleBadRequest(newRecipe._id, err.message)
    }
}

/**
 * Modifies a recipe in the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id   The ID of the recipe.
 * @param {object} json A JSON object with the bones
 *                      of a recipe.
 * 
 * @returns {object} The results of the operation.
 */
const change = async (id, json) => {
    try {
        if (!objectIdIsValid(id)) return handleNotFound(id)

        // use method that already handles 404 Not Found
        const temp = await fetchById(id)

        const currRecipe = temp.data
        const newRecipe = new Recipe(extractRecipe(json))

        // map new properties to recipe model
        currRecipe.title = newRecipe.title
        currRecipe.about = newRecipe.about
        currRecipe.category = newRecipe.category
        currRecipe.modifiedOn = Date.now()
        currRecipe.prepTime = newRecipe.prepTime
        currRecipe.ingredients = newRecipe.ingredients
        currRecipe.instructions = newRecipe.instructions

        await currRecipe.save()

        const status = 200
        const message = 'The recipe with ObjectID of' +
                        ` "${id}" was successfully updated.`
        return { status, data: { status, message } }
    } catch (err) {
        return handleBadRequest(id, err.message)
    }

}

/**
 * Discards a recipe from the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The ID of the recipe.
 * 
 * @returns {object} The results of the operation.
 */
const discard = async id => {
    try {
        if (!objectIdIsValid(id)) return handleNotFound(id)
        const data = await Recipe.findByIdAndDelete(id)
        if (!data) return handleNotFound(id)

        const status = 200
        const message = 'The recipe with ObjectID of' +
                        ` "${id}" was successfully deleted.`
        return { status, data: { status, message } }
    } catch (err) {
        // handle invalid IDs as 'Not Found'
        return handleNotFound(id)
    }
}

module.exports = {
    fetch,
    fetchById,
    create,
    change,
    discard
}