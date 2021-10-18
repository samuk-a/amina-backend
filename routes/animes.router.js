const express = require('express')
const slugify = require('slugify')
const Anime = require('../models/Anime')
const Auth = require('../middlewares/Auth')
const router = express.Router()

router.get('/', (req, res) => {
	Anime.find().then(result => {
		res.json(result)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao listar animes" })
	})
})

router.post('/', Auth, (req, res) => {
	const animeObj = req.body
	animeObj.slug = slugify(animeObj.title, {
		strict: true,
		lower: true
	})
	const anime = new Anime(animeObj)
	anime.save().then(result => {
		res.json({ result, msg: "Anime salvo com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao salvar o anime" })
	})
})

router.delete('/:id', Auth, (req, res) => {
	const id = req.params.id
	Anime.findOneAndDelete({ _id: id }).then(result => {
		if (!result)
			return res.status(404).json({ msg: "Anime não encontrado" })
		res.json({ result, msg: "Anime deletado com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao deletar o anime" })
	})
})

router.get('/:slug', (req, res) => {
	const slug = req.params.slug
	Anime.findOne({ slug: slug }).then(result => {
		if (!result)
			return res.status(404).json({ msg: "Anime não encontrado" })
		res.json(result)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao buscar o anime" })
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
	Anime.findOneAndUpdate({ _id }, req.body).then(result => {
		if (!result)
			return res.status(404).json({ msg: "Anime não encontrado" })
		res.json({ result, msg: "Anime editado com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao editar o anime" })
	})
})

module.exports = router