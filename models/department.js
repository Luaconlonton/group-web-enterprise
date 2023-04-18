const mongoose = require('../db/db');

const department = new mongoose.Schema({
    departmentId: {
        type: mongoose.Schema.Types.ObjectId, 
        require : true
    }, 
    departmentName: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('department', department);