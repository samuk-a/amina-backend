require('./lib/db')
const express = require('express')
const router = require('./routes/router')
const cors = require('cors')

const PORT = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(express.json())

app.use(router)

app.listen(PORT, err => {
	if (err) {
		console.log(`Ocorreu um erro: ${err}`);
	} else {
		console.log(`Servidor iniciado na porta ${PORT}`);
	}
})