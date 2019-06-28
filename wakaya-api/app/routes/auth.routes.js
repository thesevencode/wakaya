const express = require('express')
const bcrypt = require('bcryptjs')
const { error, response } = require('../../../handlers')
const jwt = require('jsonwebtoken')
const guard = require('express-jwt-permissions')()

const { auth } = require('../config')

const { authentication } = require('../middlewares')

const router = express.Router()


module.exports = async(DB) => {

    const { User } = await DB()
    const errors = error()


    router.post('/login', async(req, res) => {

        const body = req.body
        let user

        const resp = response(res)

        try {
            user = await User.findByEmailSelectPassword(body.email)
        } catch (e) {
            return resp.resp500()
        }


        if (!user) {
            return resp.resp404(message = "El usuario no existe")
        }

        if (!bcrypt.compareSync(body.password, user.password)) {
            return resp.resp404(message = "El password no existe")
        }

        user = await User.findById(user._id)

        const payload = {
            user: user,
            permissions: []
        }
        if (user.type == 'client') {
            payload.permissions = [
                "user:read"
            ]
        } else if (user.type == 'producer') {
            payload.permissions = [
                "user:write",
                "user:read"
            ]
        }


        const token = jwt.sign(payload, auth.SEED, { expiresIn: 14400 }) // 4 horas

        userData = {
            user: user,
            token: token
        }

        resp.resp200(userData)



    })

    router.post('/register', async(req, res) => {

        const resp = response(res)
        let body = req.body

        body.password = bcrypt.hashSync(body.password, 10)

        let user = null

        user = await User.findByEmail(body.email)

        if (user) {
            return resp.resp500(message = "El usuario ya existe").catch(errors.handleFatalError)
        }

        user = await User.createOrUpdate(body).catch(errors.handleFatalError)

        if (!user) {
            return resp.resp404().catch(errors.handleFatalError)
        } else {
            user.password = ''

            userData = {
                payload: payload,
                token: token
            }

            resp.resp201(userData).catch(errors.handleFatalError)
        }


    })


    router.get('', async(req, res) => {

        users = await User.findAll()
        res.send(users);

    })

    return router
}