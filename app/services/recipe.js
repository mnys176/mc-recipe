/******************************************************
 * Title:       recipe.js                             *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/15/2021                            *
 * Description:                                       *
 *       Set of functions that interact with the      *
 *       recipe Mongoose model.                       *
 ******************************************************/

const path = require('path')
const { Recipe } = require('../models')
const Quantifiable = require('../util/quantify')
const quickResponse = require('../util/quick-response')

/**
 * Parses a quantifiable object from the frontend to
 * the backend.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {object} input - Frontend quantifiable.
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
 * Coerces a starter object into a recipe. The final
 * result should meet the requirements for the `Recipe`
 * model handled by the `mongoose` module.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {object} builder - Builder object.
 * 
 * @returns {object} Premature recipe as a `Promise`.
 */
const buildRecipe = builder => {
    return new Promise((resolve, reject) => {
        // build preparation time if it exists
        builder.prepTime = mapQuantifiable(builder.prepTime)

        // build ingredients if they exist
        if (builder.ingredients) {
            builder.ingredients = builder.ingredients.map(i => {
                return {
                    name: i.name,
                    amount: mapQuantifiable(i.amount)
                }
            })
        }
        return resolve(builder)
    })
}

/**
 * Confirms that the provided ID is a MongoDB
 * ObjectID.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id - Provided ObjectID.
 * 
 * @returns {boolean} True if valid, false if not.
 */
const objectIdIsValid = id => id.match(/^[a-f\d]{24}$/i)

/**
 * Fetches all recipes and returns the results
 * to the controller to be parsed.
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
 * Fetches a single recipe by its ID and returns the result
 * to the controller to be parsed.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id - The ID of the recipe.
 * 
 * @returns {object} The results of the query.
 */
const fetchById = async id => {
    const notFoundMessage = `The recipe with ID of "${id}"` +
                            ' could not be retrieved.'
    try {
        // const data = await Recipe.findById(id)
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
 * @param {string}   title        - Recipe title.
 * @param {string}   about        - Recipe description.
 * @param {string}   uploader     - Username of the user that
 *                                  uploaded the recipe.
 * @param {object}   prepTime     - Recipe preparation time
 *                                  as a `Quantifiable`.
 * @param {string}   category     - Recipe category, either
 *                                  'breakfast', 'lunch',
 *                                  'dinner', 'appetizer', or
 *                                  'dessert'.
 * @param {object[]} ingredients  - Recipe ingredients with each
 *                                  ingredient having a
 *                                  `Quantifiable` and name.
 * @param {string[]} instructions - Recipe instruction steps.
 * 
 * @returns {object} The results of the operation.
 */
const create = async (
    title,
    about,
    uploader,
    prepTime,
    category,
    ingredients,
    instructions
) => {
    const badRequestMessage = 'The recipe could not be created.'
    const createdMessage = 'The recipe with ID of "<>"' +
                           ' was successfully created.'
    try {
        const builder = {
            title,
            about,
            uploader,
            prepTime,
            category,
            ingredients,
            instructions
        }
        const newRecipe = new Recipe(await buildRecipe(builder))
        await newRecipe.save()
        return quickResponse(201, createdMessage.replace('<>', newRecipe._id))
    } catch (err) {
        return quickResponse(400, badRequestMessage, err.message)
    }
}

/**
 * Modifies a recipe in the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string}   id           - Recipe ID.
 * @param {string}   title        - Recipe title.
 * @param {string}   about        - Recipe description.
 * @param {string}   uploader     - Username of the user that
 *                                  uploaded the recipe.
 * @param {object}   prepTime     - Recipe preparation time
 *                                  as a `Quantifiable`.
 * @param {string}   category     - Recipe category, either
 *                                  'breakfast', 'lunch',
 *                                  'dinner', 'appetizer', or
 *                                  'dessert'.
 * @param {object[]} ingredients  - Recipe ingredients with each
 *                                  ingredient having a
 *                                  `Quantifiable` and name.
 * @param {string[]} instructions - Recipe instruction steps.
 * 
 * @returns {object} The results of the operation.
 */
const change = async (
    id,
    title,
    about,
    uploader,
    prepTime,
    category,
    ingredients,
    instructions
) => {
    const notFoundMessage = `The recipe with ID of "${id}"` +
                            ' could not be retrieved.'
    const badRequestMessage = `The recipe with ID of "${id}"` +
                              ' could not be updated.'
    const okMessage = `The recipe with ID of "${id}"` +
                      ' was successfully updated.'
    try {
        if (!objectIdIsValid(id)) {
            return quickResponse(404, notFoundMessage)
        }

        // use method that already handles '404 Not Found'
        const temp = await fetchById(id)
        const currRecipe = temp.data.message

        const builder = {
            title,
            about,
            uploader,
            prepTime,
            category,
            ingredients,
            instructions
        }
        const newRecipe = new Recipe(await buildRecipe(builder))

        // map new properties to recipe model
        currRecipe.title = newRecipe.title
        currRecipe.about = newRecipe.about
        currRecipe.category = newRecipe.category
        currRecipe.modifiedOn = Date.now()
        currRecipe.prepTime = newRecipe.prepTime
        currRecipe.ingredients = newRecipe.ingredients
        currRecipe.instructions = newRecipe.instructions
        await currRecipe.save()

        return quickResponse(200, okMessage)
    } catch (err) {
        return quickResponse(400, badRequestMessage, err.message)
    }
}

/**
 * Discards a recipe from the database.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id - The ID of the recipe.
 * 
 * @returns {object} The results of the operation.
 */
const discard = async id => {
    const notFoundMessage = `The recipe with ID of "${id}"` +
                            ' could not be retrieved.'
    const okMessage = `The recipe with ID of "${id}"` +
                      ' was successfully deleted.'
    try {
        if (!objectIdIsValid(id)) {
            return quickResponse(404, notFoundMessage)
        }
        const data = await Recipe.findByIdAndDelete(id)
        if (!data) return quickResponse(404, notFoundMessage)
        return quickResponse(200, okMessage)
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
 * @param {string} id - The ID of the recipe.
 * 
 * @returns {boolean} True if it does exist,
 *                      false otherwise.
 */
const exists = async id => {
    try {
        return await Recipe.exists({ _id: id })
    } catch (err) {
        return false
    }
}

/**
 * Adds links to media files to a recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string}   id        - ID of the recipe.
 * @param {string[]} filenames - Filenames of the
 *                               cleared media.
 * 
 * @returns {object} The results of the operation.
 */
const setMedia = async (id, filenames) => {
    const notFoundMessage = `The recipe with ID of "${id}"` +
                            ' does not exist.'
    const okMessage = `The recipe with ID of "${id}"` +
                      ' was successfully linked to the new media.'

    // ensure recipe exists before continuing
    const recipeExists = await exists(id)
    if (!recipeExists) return quickResponse(404, notFoundMessage)

    const temp = await fetchById(id)
    const recipe = temp.data.message

    // save filenames to recipe model
    if (filenames.length > 0) {
        // not an update, do not overwrite
        const uniqueMedia = new Set([
            ...recipe.media,
            ...filenames.map(m => m.unique)
        ])
        recipe.media = Array.from(uniqueMedia)
        recipe.save()
    }
    return quickResponse(200, okMessage)
}

/**
 * Overwrites media names in a recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string}   id        - ID of the recipe.
 * @param {string[]} filenames - Filenames of the
 *                               cleared media.
 * 
 * @returns {object} The results of the operation.
 */
const resetMedia = async (id, filenames) => {
    const notFoundMessage = `The recipe with ID of "${id}"` +
                            ' does not exist.'
    const okMessage = `The recipe with ID of "${id}"` +
                      ' was successfully updated to the new media.'

    // ensure recipe exists before continuing
    const recipeExists = await exists(id)
    if (!recipeExists) return quickResponse(404, notFoundMessage)

    const temp = await fetchById(id)
    const recipe = temp.data.message

    // update filenames in recipe model
    if (filenames.length > 0) {
        // ensure no duplicates exist (similar to `setMedia`)
        const uniqueMedia = new Set(filenames.map(m => m.unique))
        recipe.media = Array.from(uniqueMedia)
        recipe.save()
    }
    return quickResponse(200, okMessage)
}

/**
 * Unlinks media names from a recipe.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {string} id - ID of the recipe.
 * 
 * @returns {object} The results of the operation.
 */
const unsetMedia = async id => {
    const notFoundMessage = `The recipe with ID of "${id}"` +
                            ' does not exist.'
    const okMessage = `The recipe with ID of "${id}"` +
                      ' was successfully updated with no media.'

    // ensure recipe exists before continuing
    const recipeExists = await exists(id)
    if (!recipeExists) return quickResponse(404, notFoundMessage)

    const temp = await fetchById(id)
    const recipe = temp.data.message

    // remove filenames from recipe model
    recipe.media = []
    recipe.save()

    return quickResponse(200, okMessage)
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