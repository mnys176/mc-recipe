/******************************************************
 * Title:       recipe.js                             *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/15/2021                            *
 * Description:                                       *
 *     Set of functions that interact with the        *
 *     recipe Mongoose model.                         *
 ******************************************************/

const path = require('path')
const mediaService = require('./media')
const { Recipe } = require('../models')
const Quantifiable = require('../util/quantify')
const quickResponse = require('../util/quick-response')

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
 * @param {object} body Request body object.
 * 
 * @returns {object} Premature recipe as a `Promise`.
 */
const extractRecipe = body => {
    return new Promise((resolve, reject) => {
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
        return resolve(recipeBuilder)
    })
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
        return quickResponse(200, data)
    } catch (err) {
        // this should never happen
        return quickResponse(500)
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
    const notFoundMessage = `The recipe with ID of "${id}"` +
                            ' could not be retrieved.'
    try {
        const data = await Recipe.findById(id)
        if (data) return quickResponse(200, data)
        return quickResponse(404, notFoundMessage)
    } catch (err) {
        // handle invalid IDs as 'Not Found'
        return quickResponse(404, notFoundMessage)
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
    try {
        const newRecipe = new Recipe(await extractRecipe(json))
        await newRecipe.save()
        const message = `The recipe with ID of "${newRecipe._id}"` +
                        ' was successfully created.'
        return quickResponse(201, message)
    } catch (err) {
        const message = 'The recipe could not be created.'
        return quickResponse(400, message, err.message)
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
        if (!objectIdIsValid(id)) {
            const message = `The recipe with ID of "${id}"` +
                            ' could not be retrieved.'
            return quickResponse(404, message)
        }

        // use method that already handles '404 Not Found'
        const temp = await fetchById(id)

        const currRecipe = temp.data.message
        const newRecipe = new Recipe(await extractRecipe(json))

        // map new properties to recipe model
        currRecipe.title = newRecipe.title
        currRecipe.about = newRecipe.about
        currRecipe.category = newRecipe.category
        currRecipe.modifiedOn = Date.now()
        currRecipe.prepTime = newRecipe.prepTime
        currRecipe.ingredients = newRecipe.ingredients
        currRecipe.instructions = newRecipe.instructions

        await currRecipe.save()

        const message = `The recipe with ID of "${id}"` +
                        ' was successfully updated.'
        return quickResponse(200, message)
    } catch (err) {
        const message = `The recipe with ID of "${id}"` +
                        ' could not be updated.'
        return quickResponse(400, message, err.message)
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
    const notFoundMessage = `The recipe with ID of "${id}"` +
                            ' could not be retrieved.'
    try {
        if (!objectIdIsValid(id)) return quickResponse(404, notFoundMessage)
        const data = await Recipe.findByIdAndDelete(id)
        if (!data) return quickResponse(404, notFoundMessage)

        const message = `The recipe with ID of "${id}"` +
                        ' was successfully deleted.'
        return quickResponse(200, message)
    } catch (err) {
        // handle invalid IDs as 'Not Found'
        return quickResponse(404, notFoundMessage)
    }
}

/**
 * Checks if a recipe exists in the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id The ID of the recipe.
 * 
 * @returns {boolean} True if it does exist,
 *                    false otherwise.
 */
const exists = async id => {
    try {
        return await Recipe.exists({ _id: id })
    } catch (err) {
        return false
    }
}

/**
 * Adds a link to a media file to a recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id    ID of the recipe.
 * @param {object} files File information provided
 *                       by Bouncer.
 * 
 * @returns {object} The results of the operation.
 */
const setMedia = async (id, files) => {
    // ensure recipe exists before continuing
    const notFoundMessage = `The recipe with ID of "${id}"` +
                            ' does not exist.'
    const recipeExists = await exists(id)
    if (!recipeExists) return quickResponse(404, notFoundMessage)

    const temp = await fetchById(id)
    const recipe = temp.data.message

    // save filenames to recipe model
    if (files.cleared.length > 0) {
        // not an update, do not overwrite
        const uniqueMedia = new Set([
            ...recipe.media,
            ...files.cleared.map(m => m.unique)
        ])
        recipe.media = Array.from(uniqueMedia)
        recipe.save()
    }
    const successMessage = `The recipe with ID of "${id}"` +
                           ' was successfully linked to the new media.'
    return quickResponse(200, successMessage)
}

/**
 * Overwrites media names in a recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id    ID of the recipe.
 * @param {object} files File information provided
 *                       by Bouncer.
 * 
 * @returns {object} The results of the operation.
 */
const resetMedia = async (id, files) => {
    // ensure recipe exists before continuing
    const notFoundMessage = `The recipe with ID of "${id}"` +
                            ' does not exist.'
    const recipeExists = await exists(id)
    if (!recipeExists) return quickResponse(404, notFoundMessage)

    const temp = await fetchById(id)
    const recipe = temp.data.message

    // update filenames in recipe model
    if (files.cleared.length > 0) {
        // ensure no duplicates exist (similar to `setMedia`)
        const uniqueMedia = new Set(files.cleared.map(m => m.unique))
        recipe.media = Array.from(uniqueMedia)
        recipe.save()
    }
    const successMessage = `The recipe with ID of "${id}"` +
                           ' was successfully updated to the new media.'
    return quickResponse(200, successMessage)
}

/**
 * Unlinks media names from a recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id ID of the recipe.
 * 
 * @returns {object} The results of the operation.
 */
const unsetMedia = async id => {
    // ensure recipe exists before continuing
    const notFoundMessage = `The recipe with ID of "${id}"` +
                            ' does not exist.'
    const recipeExists = await exists(id)
    if (!recipeExists) return quickResponse(404, notFoundMessage)

    const temp = await fetchById(id)
    const recipe = temp.data.message

    // remove filenames from recipe model
    // const results = await mediaService.unset(id)
    recipe.media = []
    recipe.save()

    const successMessage = `The recipe with ID of "${id}"` +
                           ' was successfully updated with no media.'
    return quickResponse(200, successMessage)
}

module.exports = {
    fetch,
    fetchById,
    create,
    change,
    discard,
    setMedia,
    unsetMedia,
    resetMedia
}