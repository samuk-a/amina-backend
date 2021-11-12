const express = require('express')
const slugify = require('slugify')
const Group = require('../models/Group')
const { UnhandledError, NotFoundError } = require('../errors/api')
const { APIError } = require('../errors/base')
const router = express.Router()

router.get('/', async (req, res, next) => {
	let page = Math.max(1, req.query.page || 0)
	const items = Math.max(1, req.query.itemsPerPage || 30)
	try {
		if (!req.token.permissions.groups?.includes('list')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		const totalResults = await Group.count()
		const totalPages = Math.ceil(totalResults / items)
		page = Math.min(page, totalPages)

		result = await Group.find({}, { permissions: 0, __v: 0 }).skip((page - 1) * items).limit(items)
		res.json({
			result,
			pagination: {
				curPage: page,
				nextPage: page < totalPages ? page + 1 : null,
				totalPages
			}
		})
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao listar grupos")
		return next(error)
	}
})

router.get('/:slug', async (req, res, next) => {
	try {
		if (!req.token.permissions.groups?.includes('list')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
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
		if (!req.token.permissions.groups?.includes('add')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		const obj = req.body
		obj.slug = slugify(obj.name, {
			strict: true,
			lower: true
		})
		const group = new Group(obj)
		const result = await group.save()
		res.json({ result, msg: "Grupo salvo com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao salvar o grupo")
		return next(error)
	}
})

router.delete('/:id', async (req, res, next) => {
	try {
		if (!req.token.permissions.groups?.includes('delete')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
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
		if (!req.token.permissions.groups?.includes('edit')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
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