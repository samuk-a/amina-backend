class APIError extends Error {
	get name() {
		return this.constructor.name
	}
}

class DatabaseError extends APIError { }
class UserError extends APIError { }

module.exports = {
	APIError,
	DatabaseError,
	UserError
}