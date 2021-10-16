/***************************************************************
 * Title:       user-media.js.                                 *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)          *
 * Created:     10/16/2021                                     *
 * Description: Set of API routes that pertains to user media. *
 ***************************************************************/

const express = require('express')
const user = require('../controllers/user')
const { bounce } = require('../middleware/bouncer')

// include parameters from user routes
const router = express.Router({ mergeParams: true })

// get media for a user
router.get('/:filename', async (req, res) => {
    const { id, filename } = req.params
    const { status, data } = await user.fetchMedia(id, filename)

    if (status === 404) return res.status(status).json(data)
    const file = data.context
    const type = filename.split('.')[1] === 'png' ? 'png' : 'jpeg'
    return res.set('Content-Type', `image/${type}`)
              .status(status)
              .send(file)
})

// create media for a user
router.post('/', bounce(/image\/(jpeg|png)/), async (req, res) => {
    const { status, data } = await user.setMedia(req.params.id, req.files)
    return res.status(status).json(data)
})

// update media for a user
router.put('/', bounce(/image\/(jpeg|png)/), async (req, res) => {
    const { status, data } = await user.resetMedia(req.params.id, req.files)
    return res.status(status).json(data)
})

// delete media for a user
router.delete('/', async (req, res) => {
    const { status, data } = await user.unsetMedia(req.params.id)
    return res.status(status).json(data)
})

module.exports = router