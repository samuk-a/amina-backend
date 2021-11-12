const express = require('express')
const slugify = require('slugify')
const Episode = require('../models/Episode')
const History = require('../models/EpisodeHistory')
const Auth = require('../middlewares/Auth')
const { UnhandledError, NotFoundError } = require('../errors/api')
const { APIError } = require('../errors/base')
const router = express.Router()

router.get('/', async (req, res, next) => {
	let page = Math.max(1, req.query.page || 0)
	const items = Math.max(1, req.query.itemsPerPage || 30)
	try {
		const totalResults = await Episode.count()
		const totalPages = Math.ceil(totalResults / items)
		page = Math.min(page, totalPages)

		const result = await Episode.aggregate([
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
					path: '$anime',
					preserveNullAndEmptyArrays: false
				}
			},
			{
				$project: {
					title: 1,
					cover: 1,
					episodeNumber: 1,
					seasonNumber: 1,
					slug: 1,
					anime: {
						title: 1,
						slug: 1
					}
				}
			}
		]).skip((page - 1) * items).limit(items)

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
		error = new UnhandledError("Ocorreu um erro ao listar episódios")
		return next(error)
	}
})

router.get('/:anime', async (req, res, next) => {
	let page = Math.max(1, req.query.page || 0)
	const items = Math.max(1, req.query.itemsPerPage || 30)
	try {
		let totalResults = await Episode.aggregate([
			{
				$count: 'total'
			}
		])
		totalResults = totalResults[0].total
		if (totalResults == 0)
			throw new NotFoundError("Este anime não possui episódios")

		const totalPages = Math.ceil(totalResults / items)
		page = Math.min(page, totalPages)

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
			},
			{ $skip: (page - 1) * items },
			{ $limit: items }
		]
		const result = await Episode.aggregate(pipeline)
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

router.post('/:id/history', Auth, async (req, res, next) => {
	try {
		if (!req.token.permissions.episode?.includes('watch')) {
			throw new UnauthorizedError("Você não tem permissão para acessar essa página")
		}
		const episodeId = req.params.id
		const userId = req.token.id
		const id = {
			episode: episodeId,
			user: userId
		}
		const episode = await Episode.findById(episodeId)
		if (!episode)
			throw new NotFoundError("Episódio não encontrado")

		const payload = {
			_id: id,
			watchedSeconds: req.body.watchedSeconds,
			totalSeconds: req.body.totalSeconds,
			updatedAt: Date.now()
		}

		let result = await History.findOneAndUpdate({ _id: id }, payload)
		if (!result) {
			const history = new History(payload)
			result = await history.save()
		}
		res.json({ result, msg: "Progresso salvo com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao salvar o progresso", { err: error })
		return next(error)
	}
})

module.exports = router