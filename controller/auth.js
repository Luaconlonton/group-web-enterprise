const expressAsyncHandler = require('express-async-handler');
const Account = require('../models/user');
const bcrypt = require('bcryptjs');

exports.handleLogin = async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // console.log(username)
    try {
        let user = await Account.findOne({ email: username });
        if (!user) {
            return res.render('index', { errors: 'Username or password is incorrect' });
        };
        // console.log(user)
        await bcrypt.compare(password, user.password).then((doMatch) => {
            if (doMatch) {
                if (user.role == 'admin') {
                    req.session.user = user;
                    req.session.email = username;
                    req.session.admin = true;
                    res.redirect('/admin');
                } else if (user.role == 'Staff') {
                    req.session.user = user;
                    req.session.email = username;
                    req.session.staff = true;
                    res.redirect('/staff');
                } else if (user.role == 'QAmanager') {
                    req.session.user = user;
                    req.session.email = username;
                    req.session.qam = true;
                    res.redirect('/qam_index');
                } else {
                    req.session.user = user;
                    req.session.email = username;
                    req.session.QAcoordinator = true;
                    res.redirect('/qac');
                }
            } else {
                return res.render('index', { errors: 'Username or password is incorrect' })
            }
        })
    } catch (error) {
        console.log(error);
        return res.render('index', { errors: 'Username or password is incorrect' });
    }
};

exports.handleLogout = async(req, res) => {
    req.session.destroy();
    res.redirect('/');
}

exports.login= expressAsyncHandler(async (req, res)=> {
    const username = req.body.username;
    const password = req.body.password;
    // console.log(username)
    try {
        let user = await Account.findOne({ email: username });
        if (!user) {
            return res.render('index', { errors: 'Username or password is incorrect' });
        };
        // console.log(user)
        await bcrypt.compare(password, user.password).then((doMatch) => {
            if (doMatch) {
                return res.status(200).json({email: email, login: true})
            } else {
                return res.status(200).json('index', { errors: 'Username or password is incorrect' })
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(200).json({ errors: 'Username or password is incorrect'});
    }
})