const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	animes: {
		type: [mongoose.Types.ObjectId],
		default: []
	},
	createdAt: {
		type: Date,
		default: Date.now()
	},
	updatedAt: {
		type: Date,
		default: Date.now()
	}
})

module.exports = mongoose.model('List', schema)