const mongoose = require('../db/db');

const QAcoordinatorSchema = new mongoose.Schema({
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
    department: {
        type: String, 
        default: ""
    }
});

module.exports = mongoose.model('Quality Assurance Coordinator', QAcoordinatorSchema);