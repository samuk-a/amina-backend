const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	secondaryTitles: [String],
	studio: {
		type: String,
		required: true
	},
	slug: {
		type: String,
		required: true,
		unique: true
	},
	releaseDate: Date,
	genders: {
		type: [String],
		required: true
	},
	synopsis: {
		type: String,
		required: true
	},
	cover: String,
	status: {
		type: String,
		required: true
	},
	trailerLink: String,
	createdAt: {
		type: Date,
		default: Date.now()
	},
	updatedAt: {
		type: Date,
		default: Date.now()
	}
})

const Anime = mongoose.model('Anime', schema)

module.exports = Anime