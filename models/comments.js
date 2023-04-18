const mongoose = require('../db/db');

const comments = new mongoose.Schema({
    ideaID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ideas',
        require : true
    }, 
    comment: {
        type: String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Staff',
        require : true
    },
    time:{
        type: Date,
        default: Date.now
    },
    annonymously: {
        type: Boolean,
        require : false,
        default: false
    },
});

module.exports = mongoose.model('comments', comments);