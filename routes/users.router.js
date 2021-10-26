const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const router = express.Router()

router.get('/', (req, res) => {
	User.find().then(users => {
		res.json(users)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao listar usuários" })
	})
})

router.get('/:id', (req, res) => {
	const _id = req.params.id
	User.findById(_id).then(user => {
		if (!user)
			return res.status(404).json({ msg: "Usuário não encontrado" })

		res.json(user)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao buscar o usuário" })
	})
})

router.post('/', (req, res) => {
	const userObj = req.body
	const salt = bcrypt.genSaltSync(10)
	userObj.password = bcrypt.hashSync(userObj.password, salt)

	const user = new User(userObj)
	user.save().then(user => {
		res.json({ user, msg: "Usuário salvo com sucesso!" })
	}).catch(err => {
		if (err.code === 11000) { // Duplicate key
			return res.status(400).json({ err, msg: "E-mail já cadastrado" })
		}
		res.status(500).json({ err, msg: "Ocorreu um erro ao cadastrar o usuário" })
	})
})

router.delete('/:id', (req, res) => {
	const _id = req.params.id
	User.findOneAndDelete({ _id }).then(user => {
		if (!user)
			return res.status(404).json({ msg: "Usuário não encontrado" })
		res.json({ user, msg: "Usuário deletado com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao deletar o usuário" })
	})
})

router.patch('/:id', (req, res) => {
	const _id = req.params.id
	req.body.updatedAt = Date.now()
	User.findOneAndUpdate({ _id }, req.body).then(user => {
		if (!user)
			return res.status(404).json({ msg: "Usuário não encontrado" })
		res.json({ user, msg: "Usuário editado com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao editar o usuário" })
	})
})

module.exports = router