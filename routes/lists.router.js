const express = require('express')
const List = require('../models/List')
const router = express.Router()

router.get('/', (req, res) => {
	List.findOne({ _id: req.token.list }).then(result => {
		res.json(result)
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao resgatar a lista" })
	})
})

router.post('/', (req, res) => {
	const obj = req.body
	const list = new List(obj)
	list.save().then(result => {
		res.json({ result, msg: "Lista salva com sucesso!" })
	}).catch(err => {
		res.status(500).json({ err, msg: "Ocorreu um erro ao salvar a lista" })
	})
})

router.post('/:anime', (req, res) => {

})

module.exports = router