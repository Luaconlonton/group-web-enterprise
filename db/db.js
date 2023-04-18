const mongoose = require('mongoose');

try {
    const client = mongoose.connect('mongodb+srv://huypqgch18673:huy12345@cluster0.s5jscjd.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
        // useFindAndModify: true
    })
    console.log("connected")
} catch (e) {
    console.log(e)
}


module.exports = mongoose