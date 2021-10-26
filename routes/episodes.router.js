const express = require('express')
const slugify = require('slugify')
const Episode = require('../models/Episode')
const Auth = require('../middlewares/Auth')
const router = express.Router()

router.get('/', (req, res) => {
	Episode.find().then(result => {
		res.json(result)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao listar episódios" })
	})
})

router.get('/:anime', (req, res) => {
	const anime = req.params.anime
	Episode.aggregate([
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
	]).then(result => {
		if (result.length == 0)
			return res.status(404).json({ msg: "Este anime não possui episódios" })
		res.json(result)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao resgatar os episódios do anime" })
	})
})

router.get('/:anime/:slug', (req, res) => {
	const slug = req.params.slug
	const anime = req.params.anime
	Episode.aggregate([
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
	]).then(result => {
		if (!result)
			return res.status(404).json({ msg: "Episódio não encontrado" })
		res.json(result)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao resgatar o episódio" })
	})
})

router.post('/', Auth, (req, res) => {
	const obj = req.body
	if (!obj.slug)
		obj.slug = slugify(obj.title, {
			strict: true,
			lower: true
		})
	const episode = new Episode(obj)
	episode.save().then(result => {
		res.json({ result, msg: "Episódio salvo com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao salvar o episódio" })
	})
})

router.delete('/:id', Auth, (req, res) => {
	const id = req.params.id
	Episode.findOneAndDelete({ _id: id }).then(result => {
		if (!result)
			return res.status(404).json({ msg: "Episódio não encontrado" })
		res.json({ result, msg: "Episódio deletado com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao deletar o episódio" })
	})
})

router.patch('/:id', Auth, (req, res) => {
	const _id = req.params.id
	if (!req.body.slug && req.body.title)
		req.body.slug = slugify(req.body.title, {
			strict: true,
			lower: true
		})
	req.body.updatedAt = Date.now()
	Episode.findOneAndUpdate({ _id }, req.body).then(result => {
		if (!result)
			return res.status(404).json({ msg: "Episódio não encontrado" })
		res.json({ result, msg: "Episódio editado com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao editar o episódio" })
	})
})

module.exports = router