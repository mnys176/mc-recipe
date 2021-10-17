/************************************************************
 * Title:       recipe.js                                   *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     08/30/2021                                  *
 * Description: Set of API routes that pertain to a recipe. *
 ************************************************************/

const express = require('express')
const { recipeController } = require('../controllers')
const { bounce } = require('../middleware')

// recipe routes have nested media routes
const recipeRouter = express.Router()
const mediaRouter = express.Router({ mergeParams: true })

recipeRouter.get('/', recipeController.getAllRecipes)
recipeRouter.get('/:id', recipeController.getRecipeById)
recipeRouter.post('/', recipeController.postRecipe)
recipeRouter.put('/:id', recipeController.putRecipe)
recipeRouter.delete('/:id', recipeController.deleteRecipe)

// include media routes
recipeRouter.use('/:id/media', mediaRouter)

mediaRouter.get('/:filename', recipeController.getRecipeMedia)
mediaRouter.post('/', bounce(/image\/(jpeg|png)/), recipeController.postRecipeMedia)
mediaRouter.put('/', bounce(/image\/(jpeg|png)/), recipeController.putRecipeMedia)
mediaRouter.delete('/', recipeController.deleteRecipeMedia)

module.exports = recipeRouter