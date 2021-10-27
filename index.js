require('./lib/db')
const express = require('express')
const router = require('./routes/router')
const cors = require('cors')
const socket = require('socket.io')
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
		res.status(err.statusCode).json({ err, msg: err.message })
	} else {
		console.log(err)
		res.status(500).json({ err, msg: "Ocorreu um erro interno" })
	}
})

const server = app.listen(PORT, err => {
	if (err) {
		console.log(`Ocorreu um erro: ${err}`);
	} else {
		console.log(`Servidor iniciado na porta ${PORT}`);
	}
})

const io = socket(server);
io.on("connection", socket => {
	console.log("Made socket connection");

	socket.on("disconnect", () => {
		console.log(socket)
	})
});