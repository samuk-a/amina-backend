const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const animesRouter = require('./animes.router')
const usersRouter = require('./users.router')
const User = require('../models/User')

const router = express.Router()

router.use('/animes', animesRouter)
router.use('/users', usersRouter)

router.post('/login', (req, res) => {
	const { email, password } = req.body

	User.findOne({ email }).then(user => {
		if (!user || !bcrypt.compareSync(password, user.password))
			return res.status(401).json({ msg: "Email e/ou senha não coincidem" })

		const token = jwt.sign({ data: { email } }, process.env.SECRET, { expiresIn: '48h' })
		res.json({ msg: "Logado com sucesso!", token })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao tentar realizar o login" })
	})
})

module.exports = router