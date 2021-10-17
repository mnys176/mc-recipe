/************************************************************
 * Title:       recipe.js                                   *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     09/15/2021                                  *
 * Description: Controls the dataflow of recipe API routes. *
 ************************************************************/

const { recipeService } = require('../services')

const getAllRecipes = async (req, res) => {
    const { status, data } = await recipeService.fetch()
    return res.status(status).json(data)
}

const getRecipeById = async (req, res) => {
    const { status, data } = await recipeService.fetchById(req.params.id)
    return res.status(status).json(data)
}

const postRecipe = async (req, res) => {
    const { status, data } = await recipeService.create(req.body)
    return res.status(status).json(data)
}

const putRecipe = async (req, res) => {
    const { status, data } = await recipeService.change(req.params.id, req.body)
    return res.status(status).json(data)
}

const deleteRecipe = async (req, res) => {
    const { status, data } = await recipeService.discard(req.params.id)
    return res.status(status).json(data)
}

const getRecipeMedia = async (req, res) => {
    const { id, filename } = req.params
    const { status, data } = await recipeService.fetchMedia(id, filename)

    if (status === 404) return res.status(status).json(data)
    const file = data.context
    const type = filename.split('.')[1] === 'png' ? 'png' : 'jpeg'
    return res.set('Content-Type', `image/${type}`)
              .status(status)
              .send(file)
}

const postRecipeMedia = async (req, res) => {
    const { status, data } = await recipeService.setMedia(req.params.id, req.files)
    return res.status(status).json(data)
}

const putRecipeMedia = async (req, res) => {
    const { status, data } = await recipeService.resetMedia(req.params.id, req.files)
    return res.status(status).json(data)
}

const deleteRecipeMedia = async (req, res) => {
    const { status, data } = await recipeService.unsetMedia(req.params.id)
    return res.status(status).json(data)
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    postRecipe,
    putRecipe,
    deleteRecipe,
    getRecipeMedia,
    postRecipeMedia,
    putRecipeMedia,
    deleteRecipeMedia
}