const express = require('express');
const mongoose = require('./db/db');
const bodyParser = require('body-parser');
session = require('express-session')
const app = express();
app.set('view engine', 'hbs');
var hbs = require('hbs');

hbs.registerHelper("json", function(context) {
    return JSON.stringify(context)
})
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}));

app.use(bodyParser.urlencoded({ extended: true }));
// register path to partials
hbs.registerPartials(__dirname + '/views/partials/');
hbs.registerHelper('dateFormat', require('handlebars-dateformat'));
hbs.registerHelper('ifCond', function(v1, v2, options) {
    for (let item of v1) {
        if (item.equals(v2)) {
            return options.fn(this);
        }
    }
    return options.inverse(this);
});
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('times', function(n, block) {
    var accum = '';
    for (var i = 1; i <= n; ++i)
        accum += block.fn(i);
    return accum;
});
hbs.registerHelper('minus', function(arg1, arg2, options) {
    return arg1 - arg2
});
hbs.registerHelper('plus', function(arg1, arg2, options) {
    return Number(arg1) + Number(arg2);
});
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.render('index')
});

const authRoute = require("./routes/auth")
var adminRoute = require('./routes/admin');
var qamRoute = require('./routes/qam');
var staffRoute = require('./routes/staff');
const qacRoute = require('./routes/qac');

app.use("/", authRoute);
app.use('/', adminRoute);
app.use('/', qamRoute);
app.use('/', staffRoute);
app.use('/', qacRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT);
console.log('listening on port' + PORT);