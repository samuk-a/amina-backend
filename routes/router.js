const express = require('express')
const animesRouter = require('./animes.router')
const router = express.Router()

router.use('/animes', animesRouter)

module.exports = router