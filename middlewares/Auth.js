const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
	let token = req.headers.authorization
	token = token.replace(/^Bearer\s+/, "")

	if (!token)
		return res.status(403).json({ msg: "Token inválido!" })
	jwt.verify(token, process.env.SECRET, (err, data) => {
		if (err)
			return res.status(403).json({ msg: "Token inválido!" })
		next();
	})
}