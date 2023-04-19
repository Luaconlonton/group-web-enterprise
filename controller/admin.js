const Account = require('../models/user');
const Staff = require('../models/staff');
const QAcoordinator = require('../models/QAcoordinator');
const QAmanager = require('../models/QAmanager');
const category = require('../models/category');
const Comments = require('../models/comments');
const idea = require('../models/ideas');
const validation = require('./validation');
const bcrypt = require('bcryptjs');
const fs = require("fs")

exports.getAdmin = async(req, res) => {
    res.render('admin/admin', { loginName: req.session.email })
}
exports.changePassword = async(req, res) => {
    res.render('admin/changePassword', { loginName: req.session.email })
}
exports.doChangePassword = async(req, res) => {
        let user = await Account.findOne({ email: req.session.email });
        let current = req.body.current;
        let newpw = req.body.new;
        let confirm = req.body.confirm;
        let errors = {};
        let flag = true;
        try {
            await bcrypt.compare(current, user.password)
                .then((doMatch) => {
                    if (doMatch) {
                        if (newpw.length < 8) {
                            flag = false;
                            Object.assign(errors, { length: "Password must contain 8 characters or more!" });
                        } else if (newpw != confirm) {
                            flag = false;
                            Object.assign(errors, { check: "New Password and Confirm Password do not match!" });
                        }
                    } else {
                        flag = false;
                        Object.assign(errors, { current: "Old password is incorrect!" });
                    }
                });
            if (!flag) {
                res.render('admin/changePassword', { errors: errors, loginName: req.session.email })
            } else {
                await bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newpw, salt, (err, hash) => {
                        if (err) throw err;
                        user.password = hash;
                        user = user.save();
                        req.session.user = user;
                        res.redirect('/admin')
                    })
                })

            }
        } catch (err) {
            console.log(err);
        }
    }
    //QAmanager
exports.viewQAmanager = async(req, res) => {
    let listQAmanager = await QAmanager.find();
    console.log(listQAmanager);
    res.render('admin/viewQAmanager', { listQAmanager: listQAmanager, loginName: req.session.email })
}
exports.addQAmanager = async(req, res) => {
    res.render('admin/addQAmanager', { loginName: req.session.email });
}
exports.doAddQAmanager = async(req, res) => {
    console.log(12345)

    try {
        let newQAmanager;
        const countQAmanager = await QAmanager.find({ email: req.body.email })
        if (countQAmanager.length <= 0) {
            if (req.file) {
                newQAmanager = new QAmanager({
                    name: req.body.name,
                    email: req.body.email,
                    dateOfBirth: new Date(req.body.date),
                    address: req.body.address,
                    img: req.file.filename,
                    department: req.body.department
                })
            } else {
                newQAmanager = new QAmanager({
                    name: req.body.name,
                    email: req.body.email,
                    dateOfBirth: new Date(req.body.date),
                    address: req.body.address,
                    department: req.body.department
                })
            }
            let newAccount = new Account({
                email: req.body.email,
                password: "12345678",
                role: "QAmanager"
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newAccount.password, salt, (err, hash) => {
                    if (err) throw err;
                    newAccount.password = hash;
                    newAccount = newAccount.save();
                });
            });
            newQAmanager = await newQAmanager.save();
            res.redirect('/admin/viewQualityAssuranceManager');
        } else { res.render('admin/addQAmanager', { error: true }); }
    } catch (error) {
        console.log(error);
        // return 0;
        res.redirect('/admin/viewQualityAssuranceManager', { error: true });
    }
}
exports.editQAmanager = async(req, res) => {
    let id = req.query.id;
    let aQAmanager = await QAmanager.findById(id);

    res.render('admin/editQAmanager', { aQAmanager: aQAmanager, loginName: req.session.email });
}
exports.doEditQAmanager = async(req, res) => {
    let id = req.body.id;
    let aQAmanager = await QAmanager.findById(id);
    // console.log(aQAmanager);

    try {
        if (req.file) {
            aQAmanager.img = req.file.filename;
        }
        aQAmanager.name = req.body.name;
        aQAmanager.dateOfBirth = new Date(req.body.date);
        aQAmanager.address = req.body.address;
        aQAmanager = await aQAmanager.save();
        res.redirect('/admin/viewQualityAssuranceManager');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/viewQualityAssuranceManager');
    }
}
exports.deleteQAmanager = async(req, res) => {
    let id = req.query.id;
    let aQAmanager = await QAmanager.findById(id);
    let email = aQAmanager.email;
    console.log(email);
    Account.deleteOne({ 'email': email }, (err) => {
        if (err)
            throw err;
        else
            console.log('Account is deleted');
    })
    await QAmanager.findByIdAndRemove(id).then(data = {});

    res.redirect('/admin/viewQualityAssuranceManager');
}
exports.searchQAmanager = async(req, res) => {
        const searchText = req.body.keyword;
        //console.log(req.body.keyword);
        let listQAmanager;
        let checkAlphaName = validation.checkAlphabet(searchText);
        let checkEmpty = validation.checkEmpty(searchText);
        const searchCondition = new RegExp(searchText, 'i');

        //console.log(checkEmpty);
        if (!checkEmpty) {
            res.redirect('/admin/viewQualityAssuranceManager');
        } else if (checkAlphaName) {
            listQAmanager = await QAmanager.find({ name: searchCondition });
        }
        res.render('admin/viewQAmanager', { listQAmanager: listQAmanager, loginName: req.session.email });
    }
    //QAcoordinator
exports.viewQAcoordinator = async(req, res) => {
    let listQAcoordinator = await QAcoordinator.find();
    res.render('admin/viewQAcoordinator', { listQAcoordinator: listQAcoordinator, loginName: req.session.email })
}
exports.addQAcoordinator = async(req, res) => {
    res.render('admin/addQAcoordinator', { loginName: req.session.email });
}
exports.doAddQAcoordinator = async(req, res) => {
    let newQAcoordinator;
    console.log(req.body)
    if (req.file) {
        newQAcoordinator = new QAcoordinator({
            name: req.body.name,
            email: req.body.email,
            dateOfBirth: new Date(req.body.date),
            address: req.body.address,
            img: req.file.filename,
            department: req.body.department
        })
    } else {
        newQAcoordinator = new QAcoordinator({
            name: req.body.name,
            email: req.body.email,
            dateOfBirth: new Date(req.body.date),
            address: req.body.address,
            department: req.body.department
        })
    }
    let newAccount = new Account({
        email: req.body.email,
        password: "12345678",
        role: "QAcoordinator"
    })
    try {
        await bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newAccount.password, salt, (err, hash) => {
                if (err) throw err;
                newAccount.password = hash;
                newAccount = newAccount.save();
            });
        });
        newQAcoordinator = await newQAcoordinator.save();
        //console.log(newTrainee);
        res.redirect('/admin/viewQualityAssuranceCoordinator');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/viewQualityAssuranceCoordinator');
    }
}
exports.editQAcoordinator = async(req, res) => {
    let id = req.query.id;
    let aQAcoordinator = await QAcoordinator.findById(id);

    res.render('admin/editQAcoordinator', { aQAcoordinator: aQAcoordinator, loginName: req.session.email });
}
exports.doEditQAcoordinator = async(req, res) => {
    let id = req.body.id;
    let aQAcoordinator = await QAcoordinator.findById(id);

    try {
        if (req.file) {
            aQAcoordinator.img = req.file.filename;
        }
        aQAcoordinator.name = req.body.name;
        aQAcoordinator.dateOfBirth = new Date(req.body.date);
        aQAcoordinator.address = req.body.address;
        aQAcoordinator = await aQAcoordinator.save();
        res.redirect('/admin/viewQualityAssuranceCoordinator');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/viewQualityAssuranceCoordinator');
    }
}
exports.deleteQAcoordinator = async(req, res) => {
    let id = req.query.id;
    let aQAcoordinator = await QAcoordinator.findById(id);
    let email = aQAcoordinator.email;

    try {
        await Account.deleteOne({ 'email': email });
        await QAcoordinator.findByIdAndRemove(id);
        console.log('QA coordinator is deleted');
        res.redirect('/admin/viewQualityAssuranceCoordinator');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

exports.searchQAcoordinator = async(req, res) => {
    const searchText = req.body.keyword;
    //console.log(req.body.keyword);
    let listQAcoordinator;
    let checkAlphaName = validation.checkAlphabet(searchText);
    let checkEmpty = validation.checkEmpty(searchText);
    const searchCondition = new RegExp(searchText, 'i');

    //console.log(checkEmpty);
    if (!checkEmpty) {
        res.redirect('/admin/viewQualityAssuranceCoordinator');
    } else if (checkAlphaName) {
        listQAcoordinator = await QAcoordinator.find({ name: searchCondition });
    }
    res.render('admin/viewQAcoordinator', { listQAcoordinator: listQAcoordinator, loginName: req.session.email });
}

//Staff
exports.viewStaff = async(req, res) => {
    let listStaff = await Staff.find();
    res.render('admin/viewStaff', { listStaff: listStaff, loginName: req.session.email })
}
exports.addStaff = async(req, res) => {
    res.render('admin/addStaff', { loginName: req.session.email });
}
exports.doAddStaff = async(req, res) => {
    let newStaff;
    if (req.file) {
        newStaff = new Staff({
            name: req.body.name,
            email: req.body.email,
            dateOfBirth: new Date(req.body.date),
            address: req.body.address,
            img: req.file.filename,
            type: req.body.department,
            department: req.body.department
        })
    } else {
        newStaff = new Staff({
            name: req.body.name,
            email: req.body.email,
            dateOfBirth: new Date(req.body.date),
            address: req.body.address,
            type: req.body.department,
            department: req.body.department
        })
    }
    let newAccount = new Account({
        email: req.body.email,
        password: "12345678",
        role: "Staff"
    })
    try {
        await bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newAccount.password, salt, (err, hash) => {
                if (err) throw err;
                newAccount.password = hash;
                newAccount = newAccount.save();
            });
        });
        newStaff = await newStaff.save();
        res.redirect('/admin/viewStaff');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/viewStaff');
    }
}
exports.editStaff = async(req, res) => {
    let id = req.query.id;
    let aStaff = await Staff.findById(id);

    res.render('admin/editStaff', { aStaff: aStaff, loginName: req.session.email });
}
exports.doEditStaff = async(req, res) => {
    let id = req.body.id;
    let aStaff = await Staff.findById(id);

    try {
        if (req.file) {
            aStaff.img = req.file.filename;
        }
        aStaff.name = req.body.name;
        aStaff.dateOfBirth = new Date(req.body.date);
        aStaff.address = req.body.address;
        aStaff.type = req.body.department
        aStaff.type = req.body.department
        aStaff = await aStaff.save();
        res.redirect('/admin/viewStaff');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/viewStaff');
    }
}
exports.deleteStaff = async(req, res) => {
    let id = req.query.id;
    let aStaff = await Staff.findById(id);
    let email = aStaff.email;
    console.log(email);
    Account.deleteOne({ 'email': email }, (err) => {
        if (err)
            throw err;
        else
            console.log('Account is deleted');
    })
    await idea.deleteMany({ 'author': aStaff.id });
    await Comments.deleteMany({ 'author': aStaff.id });
    await Staff.findByIdAndRemove(id).then(data = {});
    res.redirect('/admin/viewStaff');
}
exports.searchStaff = async(req, res) => {
        const searchText = req.body.keyword;
        console.log(req.body);
        let listStaff;
        let checkAlphaName = validation.checkAlphabet(searchText);
        let checkEmpty = validation.checkEmpty(searchText);
        const searchCondition = new RegExp(searchText, 'i');

        //console.log(checkEmpty);
        if (!checkEmpty) {
            res.redirect('/admin/viewStaff');
        } else if (checkAlphaName) {
            listStaff = await Staff.find({ name: searchCondition });
        }
        res.render('admin/viewStaff', { listStaff: listStaff, loginName: req.session.email });
    }
    //Edit date
exports.viewCategory = async(req, res) => {
    let listCategory = await category.find();
    res.render('admin/viewCategory', { listCategory: listCategory, loginName: req.session.email })
}
exports.searchCategory = async(req, res) => {
    const searchText = req.body.keyword;
    let listCategory;
    let checkEmpty = validation.checkEmpty(searchText);
    const searchCondition = new RegExp(searchText, 'i');

    if (!checkEmpty) {
        res.redirect('/admin/viewCategory');
    } else {
        listCategory = await category.find({ name: searchCondition });
    }
    res.render('admin/viewCategory', { listCategory: listCategory, loginName: req.session.email });
}
exports.editDate = async(req, res) => {
    let id = req.query.id;
    let aCategory = await category.findById(id);
    res.render('admin/editDate', { aCategory: aCategory, loginName: req.session.email })
}
exports.doEditDate = async(req, res) => {
    console.log(req.body)
    let id = req.body.id;

    let aCategory = await category.findById(id);
    console.log(req.body.dateStart)
    console.log(req.body.dateEnd)
    let errors
    try {
        if (req.body.dateStart < req.body.dateEnd) {
            aCategory.dateStart = new Date(req.body.dateStart);
            aCategory.dateEnd = new Date(req.body.dateEnd);
            aCategory = await aCategory.save();
            res.redirect('/admin/viewCategory');
        } else {
            errors = 'End date must be greater than start date';
            res.render('admin/editDate', { errors: errors, aCategory: aCategory, loginName: req.session.email })
        }
    } catch (error) {
        console.log(error);
        res.redirect('/admin/viewCategory');
    }
}

//view

exports.viewSubmittedIdeas = async(req, res) => {
    let listCategory = await category.find();
    res.render('admin/viewSubmittedIdeas', { listCategory: listCategory, loginName: req.session.email })
}
exports.viewCategoryDetail = async(req, res) => {
    let id;
    let noPage;
    //console.log(req.body.idCategory);
    let page = 1;
    if (req.body.noPage != undefined) {
        page = req.body.noPage;
    }
    if (req.query.id === undefined) {
        id = req.body.idCategory;
    } else {
        id = req.query.id;
    }
    if (req.body.sortBy != undefined) {
        req.session.sort = req.body.sortBy;
    }
    let sortBy = req.session.sort;
    // let id = req.query.id;
    let listFiles = [];
    try {
        let listIdeas = await idea.find({ categoryID: id }).populate({ path: 'comments', populate: { path: 'author' } }).populate('author');
        let aCategory = await category.findById(id);
        let tempDate = new Date();
        let compare = tempDate > aCategory.dateEnd;
        const fs = require("fs");
        var counter = 0;

        function callBack() {
            if (listIdeas.length === counter) {
                if (sortBy === 'like') {
                    listFiles.sort((a, b) => {
                        if (b.idea.like < a.idea.like) {
                            return -1;
                        } else if (b.idea.like > a.idea.like) {
                            return 1;
                        } else {
                            if (a.idea._id < b.idea._id) {
                                return -1;
                            }
                            if (a.idea._id > b.idea._id) {
                                return 1;
                            }
                        };
                    });
                    // console.log('like');
                } else if (sortBy === 'comment') {
                    listFiles.sort((a, b) => {
                        if (b.idea.comments.length < a.idea.comments.length) {
                            return -1;
                        } else if (b.idea.comments.length > a.idea.comments.length) {
                            return 1;
                        } else {
                            if (a.idea._id < b.idea._id) {
                                return -1;
                            }
                            if (a.idea._id > b.idea._id) {
                                return 1;
                            }
                        };
                    });
                    // console.log('comment');
                } else if (sortBy === 'time') {
                    listFiles.sort((a, b) => {
                        const A = new Date(a.idea.time)
                        const B = new Date(b.idea.time)
                        if (A < B) {
                            return 1;
                        } else if (A > B) {
                            return -1;
                        } else {
                            if (a.idea._id < b.idea._id) {
                                return -1;
                            }
                            if (a.idea._id > b.idea._id) {
                                return 1;
                            }
                        };
                    });
                    // console.log('time');
                } else {
                    listFiles.sort((a, b) => {
                        if (a.idea._id < b.idea._id) {
                            return -1;
                        }
                        if (a.idea._id > b.idea._id) {
                            return 1;
                        }
                    });
                    //console.log('id');
                }
                noPage = Math.floor(listIdeas.length / 5);
                console.log(noPage);
                if (listIdeas.length % 5 != 0) {
                    noPage += 1
                }
                console.log(noPage);
                let s = (page - 1) * 5;
                console.log(s + " nnn " + (s + 5));
                listFiles = listFiles.slice(s, s + 5);
                console.log(noPage);
                console.log(listFiles.length);
                //res.render('admin/viewCategoryDetail', { idCategory: id, listFiles: listFiles, nameIdea: nameIdea, listComment: listComment, compare: compare, loginName: req.session.email });
                res.render('admin/viewCategoryDetail', { idCategory: id, listFiles: listFiles, compare: compare, sortBy: sortBy, noPage: noPage, page: page, loginName: req.session.email });
            };
        };
        console.log(listIdeas);
        if (listIdeas.length != 0) {
            listIdeas.forEach(async(i) => {
                fs.readdir(i.url, (err, files) => {
                    listFiles.push({
                        counter: counter,
                        value: files,
                        linkValue: i.url.slice(7),
                        idea: i
                    });
                    counter = counter + 1;
                    callBack();
                });
            })
        } else {
            res.render('admin/viewCategoryDetail', { idCategory: id, listFiles: listFiles, sortBy: sortBy, noPage: noPage, page: page, loginName: req.session.email });
        }
    } catch (e) {
        // console.log(e);
        res.render('admin/viewCategoryDetail', { idCategory: id, listFiles: listFiles, sortBy: sortBy, noPage: noPage, page: page, loginName: req.session.email });
    }
}
const asyncHandler = require('express-async-handler');
const { request } = require('http');
exports.getCategory = asyncHandler(async(req, res) => {
    const lCategories = await category.find({})
    return res.status(200).json(lCategories)
})

exports.viewLastestIdeas = async(req, res) => {

    let n_last = Number(req.body.last);
    let listIdeas = await idea.find().populate('comments');
    let len_ideas = listIdeas.length;
    if (len_ideas < n_last) {
        n_last = len_ideas;
    }
    let last_ideas = [];
    if (len_ideas == 0) {
        last_ideas = [];
    } else if (len_ideas < 5) {
        last_ideas = listIdeas.reverse();
    } else {
        last_ideas = listIdeas.slice(-n_last, len_ideas).reverse();
    }
    let lastestIdeas = [];
    last_ideas.forEach(async(i) => {
        fs.readdir(i.url, (err, files) => {
            lastestIdeas.push({
                idea: i,
                id: i._id,
                value: files,
                linkValue: i.url.slice(7),
                name: i.name,
                comment: i.comment,
                idCategory: i.categoryID,
                n_likes: i.like,
                n_dislikes: i.dislike,
                time: i.time.toString().slice(0, -25)
            });
        });
    });
    res.render('admin/viewLastestIdeas', { lastestIdeas: lastestIdeas, loginName: req.session.email });
}


exports.doAddCategory = async(req, res) => {
    const fs = require("fs");
    let date = new Date();
    let newDate = new Date();
    if (date.getMonth() == '1' || '3' || '5' || '7' || '8' || '10' || '12') {
        if (date.getDate() + 14 > 31) {
            let tempDate = 14 - (31 - date.getDate() + 1);
            let tempMonth = date.getMonth() + 1;
            newDate.setDate(tempDate);
            newDate.setMonth(tempMonth);
        } else {
            newDate.setDate(date.getDate() + 14)
        }
    } else if (date.getMonth() == '4' || '6' || '9' || '11') {
        if (date.getDate() + 14 > 30) {
            let tempDate = 14 - (30 - date.getDate() + 1);
            let tempMonth = date.getMonth() + 1;
            newDate.setDate(tempDate);
            newDate.setMonth(tempMonth);
        } else {
            newDate.setDate(date.getDate() + 14)
        }
    } else if (date.getMonth() == '2') {
        if (date.getDate() + 14 > 28) {
            let tempDate = 14 - (28 - date.getDate() + 1);
            let tempMonth = date.getMonth() + 1;
            newDate.setDate(tempDate);
            newDate.setMonth(tempMonth);
        } else {
            newDate.setDate(date.getDate() + 14)
        }
    }
    console.log(req.body.name)
    fs.access('public/folder/' + req.body.name, (error) => {
        // To check if the given directory
        // already exists or not
        if (error) {
            // If current directory does not exist
            // then create it
            fs.mkdir('public/folder/' + req.body.name, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("New Directory created successfully !!");
                }
            });
        } else {
            console.log("Given Directory already exists !!");
        }
    });
    await category.create({
        name: req.body.name,
        description: req.body.description,
        department: req.body.department,
        dateStart: date,
        dateEnd: newDate,
        url: 'public/folder/' + req.body.name
    });
    res.redirect('/admin/viewCategory');
}
