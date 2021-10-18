const express = require('express')
const slugify = require('slugify')
const Episode = require('../models/Episode')
const router = express.Router()

router.get('/', (req, res) => {
	Episode.find().then(result => {
		res.json(result)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao listar episódios" })
	})
})

router.get('/:slug', (req, res) => {
	const slug = req.params.slug
	Episode.findOne({ slug }).then(result => {
		if (!result)
			return res.status(404).json({ msg: "Episódio não encontrado" })
		res.json(result)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao resgatar o episódio" })
	})
})

router.post('/', (req, res) => {
	const obj = req.body
	obj.slug = slugify(obj.name, {
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

router.delete('/:id', (req, res) => {
	const id = req.params.id
	Episode.findOneAndDelete({ _id: id }).then(result => {
		if (!result)
			return res.status(404).json({ msg: "Episódio não encontrado" })
		res.json({ result, msg: "Episódio deletado com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao deletar o episódio" })
	})
})

router.patch('/:id', (req, res) => {
	const _id = req.params.id
	if (!req.body.slug && req.body.name)
		req.body.slug = slugify(req.body.name, {
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