require('./lib/db')
const express = require('express')
const router = require('./routes/router')
const cors = require('cors')
const { APIError } = require('./errors/base')
const { UnhandledError } = require('./errors/api')

const PORT = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(express.json())

app.use(router)

app.use((err, req, res, next) => {
	if (err instanceof UnhandledError) {
		console.log(err)
	}
	if (err instanceof APIError) {
		res.status(err.statusCode).json({ name: err.name, details: err.err, msg: err.message })
	} else {
		console.log(err)
		res.status(500).json({ err, msg: "Ocorreu um erro interno" })
	}
})

app.listen(PORT, err => {
	if (err) {
		console.log(`Ocorreu um erro: ${err}`);
	} else {
		console.log(`Servidor iniciado na porta ${PORT}`);
	}
})