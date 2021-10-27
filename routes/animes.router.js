const express = require('express')
const slugify = require('slugify')
const Anime = require('../models/Anime')
const Auth = require('../middlewares/Auth')
const { UnhandledError, NotFoundError, UnauthorizedError } = require('../errors/api')
const { APIError } = require('../errors/base')
const router = express.Router()

router.get('/', async (req, res, next) => {
	try {
		result = await Anime.find()
		res.json(result)
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao listar animes")
		return next(error)
	}
})

router.post('/', Auth, async (req, res, next) => {
	try {
		if (!req.token.permissions.anime?.includes('add')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		const animeObj = req.body
		animeObj.slug = slugify(animeObj.title, {
			strict: true,
			lower: true
		})
		const anime = new Anime(animeObj)
		const result = await anime.save()
		res.json({ result, msg: "Anime salvo com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao salvar o anime")
		return next(error)
	}
})

router.delete('/:id', Auth, async (req, res, next) => {
	try {
		if (!req.token.permissions.anime?.includes('delete')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		const id = req.params.id
		const result = await Anime.findOneAndDelete({ _id: id })
		if (!result)
			throw new NotFoundError("Anime não encontrado")
		res.json({ result, msg: "Anime deletado com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao deletar o anime")
		return next(error)
	}
})

router.get('/:slug', async (req, res, next) => {
	try {
		const slug = req.params.slug
		const result = await Anime.findOne({ slug: slug })
		if (!result)
			throw new NotFoundError("Anime não encontrado")
		res.json(result)
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao buscar o anime")
		return next(error)
	}
})

router.patch('/:id', Auth, async (req, res, next) => {
	try {
		if (!req.token.permissions.anime?.includes('edit')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		const id = req.params.id
		if (!req.body.slug && req.body.title)
			req.body.slug = slugify(req.body.title, {
				strict: true,
				lower: true
			})
		req.body.updatedAt = Date.now()
		const result = await Anime.findOneAndUpdate({ _id: id }, req.body)
		if (!result)
			throw new NotFoundError("Anime não encontrado")
		res.json({ result, msg: "Anime editado com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao editar o anime")
		return next(error)
	}
})

module.exports = router