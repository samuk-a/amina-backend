const express = require('express')
const slugify = require('slugify')
const Anime = require('../models/Anime')
const router = express.Router()

router.get('/', (req, res) => {
	Anime.find().then(animes => {
		res.json(animes)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao listar animes" })
	})
})

router.post('/', (req, res) => {
	const animeObj = req.body
	animeObj.slug = slugify(animeObj.title, {
		strict: true,
		lower: true
	})
	const anime = new Anime(animeObj)
	anime.save().then(anime => {
		res.json({ anime, msg: "Anime salvo com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao salvar o anime" })
	})
})

router.delete('/:id', (req, res) => {
	const id = req.params.id
	Anime.findOneAndDelete({ _id: id }).then(anime => {
		if (!anime)
			return res.status(404).json({ msg: "Anime não encontrado" })
		res.json({ anime, msg: "Anime deletado com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao deletar o anime" })
	})
})

router.get('/:slug', (req, res) => {
	const slug = req.params.slug
	Anime.findOne({ slug: slug }).then(anime => {
		if (!anime)
			return res.status(404).json({ msg: "Anime não encontrado" })
		res.json(anime)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao buscar o anime" })
	})
})

router.patch('/:id', (req, res) => {
	const _id = req.params.id
	if (!req.body.slug && req.body.title)
		req.body.slug = slugify(req.body.title, {
			strict: true,
			lower: true
		})
	req.body.updatedAt = Date.now()
	Anime.findOneAndUpdate({ _id }, req.body).then(anime => {
		if (!anime)
			return res.status(404).json({ msg: "Anime não encontrado" })
		res.json({ anime, msg: "Anime editado com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao editar o anime" })
	})
})

module.exports = router