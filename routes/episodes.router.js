const express = require('express')
const slugify = require('slugify')
const Episode = require('../models/Episode')
const Auth = require('../middlewares/Auth')
const { UnhandledError, NotFoundError } = require('../errors/api')
const { APIError } = require('../errors/base')
const router = express.Router()

router.get('/', async (req, res, next) => {
	try {
		result = await Episode.find()
		res.json(result)
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao listar episódios")
		return next(error)
	}
})

router.get('/:anime', async (req, res, next) => {
	try {
		const anime = req.params.anime
		const pipeline = [
			{
				$lookup: {
					from: 'animes',
					localField: 'anime',
					foreignField: '_id',
					as: 'anime'
				}
			},
			{
				$match: {
					"anime.slug": anime
				}
			},
			{
				$project: {
					anime: 0
				}
			}
		]
		const result = await Episode.aggregate(pipeline)
		if (result.length == 0)
			throw new NotFoundError("Este anime não possui episódios")
		res.json(result)
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao resgatar os episódios do anime")
		return next(error)
	}
})

router.get('/:anime/:slug', async (req, res, next) => {
	try {
		const slug = req.params.slug
		const anime = req.params.anime
		const pipeline = [
			{
				$lookup: {
					from: 'animes',
					localField: 'anime',
					foreignField: '_id',
					as: 'anime'
				}
			},
			{
				$unwind: {
					path: "$anime",
					preserveNullAndEmptyArrays: false
				}
			},
			{
				$match: {
					"anime.slug": anime,
					"slug": slug
				}
			},
			{
				$project: {
					anime: 0
				}
			}
		]
		const result = await Episode.aggregate(pipeline)
		if (!result)
			throw new NotFoundError("Episódio não encontrado")
		res.json(result)
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao resgatar o episódio")
		return next(error)
	}
})

router.post('/', Auth, async (req, res, next) => {
	try {
		if (!req.token.permissions.episode?.includes('add')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		const obj = req.body
		if (!obj.slug)
			obj.slug = slugify(obj.title, {
				strict: true,
				lower: true
			})
		const episode = new Episode(obj)
		const result = await episode.save()
		res.json({ result, msg: "Episódio salvo com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao salvar o episódio")
		return next(error)
	}
})

router.delete('/:id', Auth, async (req, res, next) => {
	try {
		if (!req.token.permissions.episode?.includes('delete')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		const id = req.params.id
		const result = await Episode.findOneAndDelete({ _id: id })
		if (!result)
			throw new NotFoundError("Episódio não encontrado")
		res.json({ result, msg: "Episódio deletado com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao deletar o episódio")
		return next(error)
	}
})

router.patch('/:id', Auth, async (req, res, next) => {
	try {
		if (!req.token.permissions.episode?.includes('edit')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		const id = req.params.id
		if (!req.body.slug && req.body.title)
			req.body.slug = slugify(req.body.title, {
				strict: true,
				lower: true
			})
		req.body.updatedAt = Date.now()
		const result = await Episode.findOneAndUpdate({ _id: id }, req.body)
		if (!result)
			throw new NotFoundError("Episódio não encontrado")
		res.json({ result, msg: "Episódio editado com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao editar o episódio")
		return next(error)
	}
})

module.exports = router