const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/amina'

mongoose.connect(MONGO_URL)