const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	group: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Group',
		required: true,
		default: "616efdb9608d429f48526eeb"
	},
	list: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'List',
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

module.exports = mongoose.model('User', schema)