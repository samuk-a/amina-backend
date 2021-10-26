const express = require('express')
const List = require('../models/List')
const { UnhandledError, NotFoundError, BadRequestError } = require('../errors/api')
const { APIError } = require('../errors/base')
const router = express.Router()

router.get('/', async (req, res, next) => {
	try {
		result = await List.findOne({ _id: req.token.list })
		res.json(result)
	} catch (error) {
		error = new UnhandledError("Ocorreu um erro ao resgatar a lista")
		return next(error)
	}
})

router.post('/', async (req, res, next) => {
	try {
		const obj = req.body
		const list = new List(obj)
		const result = await list.save()
		res.json({ result, msg: "Lista salva com sucesso!" })
	} catch (error) {
		error = new UnhandledError("Ocorreu um erro ao salvar a lista")
		return next(error)
	}
})

router.post('/anime', async (req, res, next) => {
	try {
		const id = req.token.list
		if (!req.body.anime)
			throw new BadRequestError("Anime não definido")
		const list = await List.findOne({ _id: id })
		list.animes.push(req.body.anime)
		list.updatedAt = Date.now()
		const result = await list.save()
		res.json({ result, msg: "Anime adicionado com sucesso à sua lista!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao adicionar um anime à sua lista")
		return next(error)
	}
})

router.delete('/anime', async (req, res, next) => {
	try {
		const id = req.token.list
		if (!req.body.anime)
			throw new BadRequestError("Anime não definido")
		const list = await List.findOne({ _id: id })
		let index = list.animes.indexOf(req.body.anime)
		if (index === -1)
			throw new NotFoundError("Anime não encontrado na sua lista")

		list.animes.splice(index, 1)
		list.updatedAt = Date.now()
		const result = await list.save()
		res.json({ result, msg: "Anime removido da sua lista com sucesso!" })
	} catch (error) {
		if (error instanceof APIError)
			return next(error)
		error = new UnhandledError("Ocorreu um erro ao adicionar um anime à sua lista")
		return next(error)
	}
})

module.exports = router