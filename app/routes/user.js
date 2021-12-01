/**********************************************************
 * Title:       user.js                                   *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)     *
 * Created:     09/29/2021                                *
 * Description: Set of API routes that pertain to a user. *
 **********************************************************/

const express = require('express')
const { userController } = require('../controllers')
const { bounce, authFw } = require('../middleware')

// user routes have nested media routes
const userRouter = express.Router()
const mediaRouter = express.Router({ mergeParams: true })

// configure authentication firewall
const authConfig = {
    unauthorized: { check: (req, res) => req.session.isAuth === undefined },
    forbidden: {
        check: async (req, res) => {
            const { id } = req.params
            const { username } = req.session
            const isUsernameStatus = await userController.checkUsername(id, username)
            return isUsernameStatus === 1
        }
    }
}

userRouter.get('/', userController.getAllUsers)
userRouter.get('/:id', userController.getUserById)
userRouter.post('/register', userController.postUser)
userRouter.post('/signin', userController.signIn)
userRouter.post('/signout', userController.signOut)
userRouter.put('/:id', authFw(authConfig), userController.putUser)
userRouter.delete('/:id', authFw(authConfig), userController.deleteUser)

// include media routes
userRouter.use('/:id/media', mediaRouter)

mediaRouter.get('/:filename', userController.getUserMedia)
mediaRouter.post('/', authFw(authConfig), bounce(/image\/(jpeg|png)/), userController.postUserMedia)
mediaRouter.put('/', authFw(authConfig), bounce(/image\/(jpeg|png)/), userController.putUserMedia)
mediaRouter.delete('/', authFw(authConfig), userController.deleteUserMedia)

module.exports = userRouter