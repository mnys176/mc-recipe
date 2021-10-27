/**********************************************************
 * Title:       user.js                                   *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)     *
 * Created:     09/29/2021                                *
 * Description: Set of API routes that pertain to a user. *
 **********************************************************/

const express = require('express')
const { userController } = require('../controllers')
const { bounce } = require('../middleware')

// user routes have nested media routes
const userRouter = express.Router()
const mediaRouter = express.Router({ mergeParams: true })

userRouter.get('/', userController.getAllUsers)
userRouter.get('/:id', userController.getUserById)
userRouter.post('/register', userController.postUser)
userRouter.post('/signin', userController.signIn)
userRouter.post('/signout', userController.signOut)
userRouter.put('/:id', userController.putUser)
userRouter.delete('/:id', userController.deleteUser)

// include media routes
userRouter.use('/:id/media', mediaRouter)

mediaRouter.get('/:filename', userController.getUserMedia)
mediaRouter.post('/', bounce(/image\/(jpeg|png)/), userController.postUserMedia)
mediaRouter.put('/', bounce(/image\/(jpeg|png)/), userController.putUserMedia)
mediaRouter.delete('/', userController.deleteUserMedia)

module.exports = userRouter