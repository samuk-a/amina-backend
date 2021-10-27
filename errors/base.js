class APIError extends Error {
	constructor(message) {
		super(message)
		this._err = { name: super.name, message: super.message }
	}

	get name() {
		return this.constructor.name
	}

	get err() {
		return this._err
	}

	set err(val) {
		this._err = { name: val.name, message: val.message }
	}
}

class DatabaseError extends APIError { }
class UserError extends APIError { }

module.exports = {
	APIError,
	DatabaseError,
	UserError
}