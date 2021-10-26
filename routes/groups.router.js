const express = require('express')
const slugify = require('slugify')
const Group = require('../models/Group')
const router = express.Router()

router.get('/', (req, res) => {
	Group.find().then(result => {
		res.json(result)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao listar grupos" })
	})
})

router.get('/:slug', (req, res) => {
	const slug = req.params.slug
	Group.findOne({ slug }).then(result => {
		if (!result)
			return res.status(404).json({ msg: "Grupo não encontrado" })
		res.json(result)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao resgatar o grupo" })
	})
})

router.post('/', (req, res) => {
	const obj = req.body
	obj.slug = slugify(obj.name, {
		strict: true,
		lower: true
	})
	const group = new Group(obj)
	group.save().then(result => {
		res.json({ result, msg: "Grupo salvo com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao salvar o grupo" })
	})
})

router.delete('/:id', (req, res) => {
	const id = req.params.id
	Group.findOneAndDelete({ _id: id }).then(result => {
		if (!result)
			return res.status(404).json({ msg: "Grupo não encontrado" })
		res.json({ result, msg: "Grupo deletado com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao deletar o grupo" })
	})
})

router.patch('/:id', (req, res) => {
	const _id = req.params.id
	if (!req.body.slug && req.body.title)
		req.body.slug = slugify(req.body.name, {
			strict: true,
			lower: true
		})
	req.body.updatedAt = Date.now()
	Group.findOneAndUpdate({ _id }, req.body).then(result => {
		if (!result)
			return res.status(404).json({ msg: "Grupo não encontrado" })
		res.json({ result, msg: "Grupo editado com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao editar o grupo" })
	})
})

module.exports = router