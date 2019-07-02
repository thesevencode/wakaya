'use strict'
const jwt = require('jsonwebtoken')

const { auth } = require('../config')
const { response } = require('../../../handlers')

const middlewares = {

    isLogged: function(req, res, next) {
        const token = req.query.token;

        const resp = response(res)

        jwt.verify(token, auth.SEED, (err, decoded) => {

            if (err) {
                return resp.resp401()
            }

            req.user = {
                user: decoded.user,
                permissions: decoded.permissions
            }

            next();


        });
    },
    verfyEmail: function(req, res, next) {
        const token = req.query.token;
        const resp = response(res)

        jwt.verify(token, auth.SEED, (err, decoded) => {

            if (err) {
                return resp.resp401(message = 'Imposible validar para este usuario')
            }
            console.log(decoded.user)
            req.user = decoded.user

            next();


        });
    }

}

module.exports = middlewares