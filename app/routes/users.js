/**********************************************************
 * Title:       users.js                                  *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)     *
 * Created:     09/29/2021                                *
 * Description: Set of API routes that pertain to a user. *
 **********************************************************/

const express = require('express')
const user = require('../controllers/user')

const router = express.Router()

// include media routes
// router.use('/:id/media', require('./user-media'))

// get all recipes
router.get('/', async (req, res) => {
    const { status, data } = await user.fetch()
    return res.status(status).json(data)
})

// get user by ID
router.get('/:id', async (req, res) => {
    const { status, data } = await user.fetchById(req.params.id)
    return res.status(status).json(data)
})

// create a user
router.post('/', async (req, res) => {
    const { status, data } = await user.create(req.body)
    return res.status(status).json(data)
})

// update a user
router.put('/:id', async (req, res) => {
    const { status, data } = await user.change(req.params.id, req.body)
    return res.status(status).json(data)
})

// delete a user
router.delete('/:id', async (req, res) => {
    const { status, data } = await user.discard(req.params.id)
    return res.status(status).json(data)
})

module.exports = router