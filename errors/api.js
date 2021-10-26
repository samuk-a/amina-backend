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

class UnhandledError extends UserError {
	constructor(message, options = {}) {
		super(message)

		for (const [key, val] of Object.entries(options)) {
			this[key] = val
		}
	}

	get statusCode() {
		return 500
	}
}

class NotFoundError extends UserError {
	constructor(message, options = {}) {
		super(message)

		for (const [key, val] of Object.entries(options)) {
			this[key] = val
		}
	}

	get statusCode() {
		return 404
	}
}

module.exports = {
	BadRequestError,
	UnauthorizedError,
	UnhandledError,
	NotFoundError
}