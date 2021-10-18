const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const animesRouter = require('./animes.router')
const usersRouter = require('./users.router')
const groupsRouter = require('./groups.router')
const User = require('../models/User')
const Auth = require('../middlewares/Auth')

const router = express.Router()

router.use('/animes', animesRouter)
router.use('/users', Auth, usersRouter)
router.use('/groups', Auth, groupsRouter)

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

router.post('/signup', (req, res) => {
	const userObj = req.body
	const salt = bcrypt.genSaltSync(10)
	userObj.password = bcrypt.hashSync(userObj.password, salt)
	userObj.group = "6169d58f4fdc733c76f50027"

	const user = new User(userObj)
	user.save().then(user => {
		res.json({ user, msg: "Cadastro realizado com sucesso!" })
	}).catch(err => {
		if (err.code === 11000) { // Duplicate key
			return res.status(400).json({ err, msg: "E-mail já cadastrado" })
		}
		res.status(500).json({ err, msg: "Ocorreu um erro ao se cadastrar" })
	})
})

module.exports = router