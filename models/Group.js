const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	permissions: {
		type: Object,
		default: {
			general: [],
			anime: ["list", "viewDetails", "addToList"],
			episode: ["list", "watch"],
			personal: ["view", "edit"]
		}
	},
	slug: {
		type: String,
		unique: true,
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

module.exports = mongoose.model('Group', schema)