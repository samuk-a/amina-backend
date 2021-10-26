const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const animesRouter = require('./animes.router')
const usersRouter = require('./users.router')
const groupsRouter = require('./groups.router')
const episodesRouter = require('./episodes.router')
const listsRouter = require('./lists.router')
const User = require('../models/User')
const List = require('../models/List')
const Auth = require('../middlewares/Auth')
const { UnauthorizedError } = require('../errors/api')

const router = express.Router()

router.use('/animes', animesRouter)
router.use('/episodes', episodesRouter)
router.use('/users', Auth, usersRouter)
router.use('/lists', Auth, listsRouter)
router.use('/groups', Auth, groupsRouter)

router.post('/login', async (req, res, next) => {
	const { email, password } = req.body

	try {
		let user = await User.findOne({ email })
		let compare = await bcrypt.compare(password, user.password)
		if (!user || !compare)
			throw new UnauthorizedError("Email e/ou senha não coincidem")
		const token = jwt.sign({ data: { id: user.id, name: user.name, email, group: user.group, list: user.list } }, process.env.SECRET, { expiresIn: '48h' })
		res.json({ msg: "Logado com sucesso!", token })
	} catch (error) {
		return next(error)
	}
})

router.post('/signup', (req, res) => {
	const userObj = req.body
	const salt = bcrypt.genSaltSync(10)
	userObj.password = bcrypt.hashSync(userObj.password, salt)
	const list = new List()

	list.save().then(list => {
		userObj.list = list._id
	}).then(() => {
		const user = new User(userObj)

		user.save().then(user => {
			const token = jwt.sign({ data: { id: user.id, name: user.name, email, group: user.group, list: user.list } }, process.env.SECRET, { expiresIn: '48h' })
			console.log(token)
			return res.json({ msg: "Cadastro realizado com sucesso!", token })
		}).catch(err => {
			console.log('Erro aqui')
			if (err.code === 11000) { // Duplicate key
				return res.status(400).json({ err, msg: "E-mail já cadastrado" })
			}
			res.status(500).json({ err, msg: "Ocorreu um erro ao se cadastrar" })
		})

	}).catch(err => {
		console.log('Erro na lista')
		res.status(500).json({ err, msg: "Ocorreu um erro ao se cadastrar" })
	})
})

module.exports = router