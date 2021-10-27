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
const Group = require('../models/Group')
const Auth = require('../middlewares/Auth')
const { UnauthorizedError, UnhandledError, BadRequestError } = require('../errors/api')

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
		const permissions = await Group.findById(user.group)
		const token = jwt.sign({ data: { id: user.id, name: user.name, email, group: user.group, list: user.list, permissions: permissions.permissions } }, process.env.SECRET, { expiresIn: '48h' })
		res.json({ msg: "Logado com sucesso!", token })
	} catch (error) {
		return next(error)
	}
})

router.post('/signup', async (req, res, next) => {
	const userObj = req.body
	const salt = bcrypt.genSaltSync(10)
	userObj.password = await bcrypt.hash(userObj.password, salt)

	try {
		let list = new List()
		list = await list.save()
		userObj.list = list._id
	} catch (error) {
		error = new UnhandledError("Ocorreu um erro ao se cadastrar")
		return next(error)
	}

	try {
		let user = new User(userObj)
		user = await user.save()
		const permissions = await Group.findById(user.group)
		const token = jwt.sign({ data: { id: user.id, name: user.name, email: user.email, group: user.group, list: user.list, permissions: permissions.permissions } }, process.env.SECRET, { expiresIn: '48h' })
		res.json({ msg: "Cadastro realizado com sucesso!", token })
	} catch (error) {
		await List.findOneAndDelete({ _id: userObj.list })
		if (error.code === 11000) { // Duplicate key
			error = new BadRequestError("E-mail já cadastrado")
			return next(error)
		}
		error = new UnhandledError("Ocorreu um erro ao se cadastrar")
		return next(error)
	}
})

module.exports = router