const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	links: {
		type: [String],
		validate: [mustSetLink, "Precisa ser inserido pelo menos um link de episódio"],
		required: true
	},
	anime: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Anime',
		required: true
	},
	synopsis: {
		type: String
	},
	cover: {
		type: String
	},
	episodeNumber: {
		type: Number,
		required: true
	},
	seasonNumber: {
		type: Number,
		required: true
	},
	slug: {
		type: String,
		required: true
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
schema.index({ slug: 1, anime: 1 }, { unique: true })

function mustSetLink(val) {
	return val.length >= 1
}

module.exports = mongoose.model('Episode', schema)