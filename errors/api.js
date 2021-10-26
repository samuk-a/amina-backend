const { UserError } = require('./base')

class BadRequestError extends UserError {
	constructor(message, options = {}) {
		super(message)

		for (const [key, val] of Object.entries(options)) {
			this[key] = val
		}
	}

	get statusCode() {
		return 400
	}
}

class UnauthorizedError extends UserError {
	constructor(message, options = {}) {
		super(message)

		for (const [key, val] of Object.entries(options)) {
			this[key] = val
		}
	}

	get statusCode() {
		return 401
	}
}

module.exports = {
	BadRequestError,
	UnauthorizedError
}