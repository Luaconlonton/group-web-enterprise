const mongoose = require('../db/db');

const staffSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    dateOfBirth:{
        type: Date,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    img: {
        type: String,
        default: "user.png"
    },
    type: {
        type: String,
        required: true
    },
    department: {
        type: String, 
        default: ""
    }
});

module.exports = mongoose.model('Staff', staffSchema);