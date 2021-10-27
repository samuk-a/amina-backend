const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { UnhandledError, NotFoundError } = require('../errors/api')
const { APIError } = require('../errors/base')
const router = express.Router()

router.get('/', async (req, res, next) => {
	try {
		if (!req.token.permissions.users?.includes('list')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		result = await User.find({}, { password: 0 })
		res.json(result)
	} catch (error) {
		error = new UnhandledError("Ocorreu um erro ao listar usuários")
		return next(error)
	}
})

router.get('/:id', async (req, res, next) => {
	try {
		if (!req.token.permissions.users?.includes('list')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		const id = req.params.id
		const result = await User.findById(id, { password: 0 }).populate('group').populate('list')
		if (!result)
			throw new NotFoundError("Usuário não encontrado")
		res.json(result)
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao buscar o usuário")
		return next(error)
	}
})

router.delete('/:id', async (req, res, next) => {
	try {
		if (!req.token.permissions.users?.includes('delete')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		const id = req.params.id
		const result = await User.findOneAndDelete({ _id: id })
		if (!result)
			throw new NotFoundError("Usuário não encontrado")
		res.json({ result, msg: "Usuário deletado com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao deletar o usuário")
		return next(error)
	}
})

router.patch('/:id', async (req, res, next) => {
	try {
		if (!req.token.permissions.users?.includes('edit')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		const id = req.params.id
		req.body.updatedAt = Date.now()
		const result = await User.findOneAndUpdate({ _id: id }, req.body)
		if (!result)
			throw new NotFoundError("Usuário não encontrado")
		res.json({ result, msg: "Usuário editado com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao editar o usuário")
		return next(error)
	}
})

module.exports = router