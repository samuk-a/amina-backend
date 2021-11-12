const mongoose = require('mongoose')

const idSchema = new mongoose.Schema({
	_id: {
		required: false
	},
	episode: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Episode',
		required: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
})

const schema = new mongoose.Schema({
	_id: {
		type: idSchema
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
}, { collection: 'episodeHistory' })

module.exports = mongoose.model('EpisodeHistory', schema)