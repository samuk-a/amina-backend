const express = require('express')
const slugify = require('slugify')
const Group = require('../models/Group')
const { UnhandledError, NotFoundError } = require('../errors/api')
const { APIError } = require('../errors/base')
const router = express.Router()

router.get('/', async (req, res, next) => {
	try {
		result = await Group.find()
		res.json(result)
	} catch (error) {
		error = new UnhandledError("Ocorreu um erro ao listar grupos")
		return next(error)
	}
})

router.get('/:slug', async (req, res, next) => {
	try {
		const slug = req.params.slug
		const result = await Group.findOne({ slug })
		if (!result)
			throw new NotFoundError("Grupo não encontrado")
		res.json(result)
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao resgatar o grupo")
		return next(error)
	}
})

router.post('/', async (req, res, next) => {
	try {
		const obj = req.body
		obj.slug = slugify(obj.name, {
			strict: true,
			lower: true
		})
		const group = new Group(obj)
		const result = await group.save()
		res.json({ result, msg: "Grupo salvo com sucesso!" })
	} catch (error) {
		error = new UnhandledError("Ocorreu um erro ao salvar o grupo")
		return next(error)
	}
})

router.delete('/:id', async (req, res, next) => {
	try {
		const id = req.params.id
		const result = await Group.findOneAndDelete({ _id: id })
		if (!result)
			throw new NotFoundError("Grupo não encontrado")
		res.json({ result, msg: "Grupo deletado com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao deletar o grupo")
		return next(error)
	}
})

router.patch('/:id', async (req, res, next) => {
	try {
		const id = req.params.id
		if (!req.body.slug && req.body.name)
			req.body.slug = slugify(req.body.name, {
				strict: true,
				lower: true
			})
		req.body.updatedAt = Date.now()
		const result = await Group.findOneAndUpdate({ _id: id }, req.body)
		if (!result)
			throw new NotFoundError("Grupo não encontrado")
		res.json({ result, msg: "Grupo editado com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao editar o grupo")
		return next(error)
	}
})

module.exports = router