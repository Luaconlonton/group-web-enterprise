const mongoose = require('../db/db');

const accSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role:{
        type: String,
        required: true
    }
});


module.exports = mongoose.model('User', accSchema);