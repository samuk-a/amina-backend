const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	episode: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Episode',
		required: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	watchedSeconds: {
		type: Number,
		default: 0
	},
	totalSeconds: {
		type: Number,
		default: 1320
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

module.exports = mongoose.model('EpisodeHistory', schema)