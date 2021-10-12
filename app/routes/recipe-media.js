/**********************************************************
 * Title:       recipe-media.js                           *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)     *
 * Created:     09/27/2021                                *
 * Description: Set of API routes that pertains to media. *
 **********************************************************/

const express = require('express')
const recipe = require('../controllers/recipe')
const { bounce } = require('../middleware/bouncer')

// include parameters from recipe routes
const router = express.Router({ mergeParams: true })

// get media for a recipe
router.get('/:filename', async (req, res) => {
    const { id, filename } = req.params
    const { status, data } = await recipe.fetchMedia(id, filename)

    if (status === 404) return res.status(status).json(data)
    const file = data.context
    const type = filename.split('.')[1] === 'png' ? 'png' : 'jpeg'
    return res.set('Content-Type', `image/${type}`)
              .status(status)
              .send(file)
})

// create media for a recipe
router.post('/', bounce(/image\/(jpeg|png)/), async (req, res) => {
    const { status, data } = await recipe.setMedia(req.params.id, req.files)
    return res.status(status).json(data)
})

// update media for a recipe
router.put('/', bounce(/image\/(jpeg|png)/), async (req, res) => {
    const { status, data } = await recipe.resetMedia(req.params.id, req.files)
    return res.status(status).json(data)
})

// delete media for a recipe
router.delete('/', async (req, res) => {
    const { status, data } = await recipe.unsetMedia(req.params.id)
    return res.status(status).json(data)
})

module.exports = router