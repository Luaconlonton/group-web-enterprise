const validation = require('./validation');
const Account = require('../models/user');
const bcrypt = require('bcryptjs');
const fs = require("fs");
const idea = require('../models/ideas');
const category = require('../models/category');
const comment = require('../models/comments');
const multer = require('multer');
const { redirect } = require('express/lib/response');
const likes = require('../models/likes');
const dislikes = require('../models/dislikes');
const Staff = require('../models/staff');
const nodemailer = require('nodemailer');
const QAC = require('../models/QAcoordinator');

exports.getStaff = async(req, res) => {
    res.render('staff/staff', { loginName: req.session.email })
}

exports.viewStaff = async(req, res) => {
    let listStaff = await Staff.find();
    res.render('staff/viewStaff', { listStaff: listStaff, loginName: req.session.email })
}

exports.searchStaff = async(req, res) => {
    const searchText = req.body.keyword;
    console.log(req.body);
    let listStaff;
    let checkEmpty = validation.checkEmpty(searchText);
    const searchCondition = new RegExp(searchText, 'i');

    //console.log(checkEmpty);
    if (!checkEmpty) {
        res.redirect('/staff/viewStaff');
    } else {
        listStaff = await Staff.find({ name: searchCondition });
    }
    res.render('staff/viewStaff', { listStaff: listStaff, loginName: req.session.email });
}

exports.addIdea = async(req, res) => {
    var id = req.query.id;
    res.render('staff/addIdeas', { idCategory: id, loginName: req.session.email })
}

exports.doAddIdea = async(req, res) => {
    const fs = require("fs");
    let aStaff = await Staff.findOne({ email: req.session.email });
    let ideaName = req.body.name;
    req.body.name = req.body.name.replaceAll(" ", "_");
    var idCategory = req.body.idCategory;
    let aCategory = await category.findById(idCategory);
    let path = aCategory.url + '/' + req.body.name;

    let allQacs = await QAC.find();
    let qac_emails = [];
    for (let qac of allQacs) {
        qac_emails.push(qac.email);
    }
    console.log(qac_emails);
    let count = 0;

    function loop() {
        console.log(path);
        fs.access(path, (error) => {
            if (error) {
                fs.mkdir(path, (error) => {
                    if (error) {
                        console.log(error);
                    } else {
                        let newIdea;
                        let checkAnnonymously = false;
                        if (req.body.annonymously != undefined) {
                            checkAnnonymously = true;
                            newIdea = new idea({
                                categoryID: aCategory,
                                name: req.body.name,
                                author: aStaff,
                                url: path,
                                like: 0,
                                dislike: 0,
                                annonymously: true
                            })
                        } else {
                            newIdea = new idea({
                                categoryID: aCategory,
                                name: req.body.name,
                                author: aStaff,
                                url: path,
                                like: 0,
                                dislike: 0,
                            })
                        }

                        let transporter = nodemailer.createTransport({
                            service: "gmail",
                            auth: {
                                user: "meolua99@gmail.com",
                                pass: "qvxgxhaojpyajsia"
                            }
                        });
                        let content = '';
                        content += `
                            <div style="padding: 10px; background-color: #003375">
                                <div style="padding: 10px; background-color: white;">    
                        `;
                        content += '<h4 style="color: #0085ff"> From: ' + aStaff ? .email ? .toString() + '</h4> <hr>';
                        content += '<span style="color: black"> Idea name: ' + ideaName.toString() + '</span><br>';
                        content += '<span style="color: black"> Category name: ' + aCategory.name.toString() + '</span><br>';
                        if (!checkAnnonymously) {
                            content += '<span style="color: black"> Staff name: ' + aStaff ? .name.toString() + '</span>';
                        } else {
                            content += '<span style="color: black"> Staff name: Annonymously </span>';
                        }
                        content += '</div> </div>';
                        let mainOptions = {
                            from: 'meolua99@gmail.com',
                            to: qac_emails,
                            subject: 'New submitted idea' + (Math.round(Math.random() * 10000)).toString(),
                            text: 'abc',
                            html: content
                        }

                        transporter.sendMail(mainOptions, function(err, info) {
                            if (err) console.error('Error: ', err);
                            else console.log('Message sent: ', info.response);
                        });
                        newIdea = newIdea.save();
                        console.log("New Directory created successfully !!");
                    }
                });
                res.render('staff/addIdeas', { idCategory: idCategory, path: path, loginName: req.session.email });
            } else {
                console.log("Given Directory already exists !!");
                count += 1;
                path = path + "_(" + count + ")";
                req.body.name = req.body.name + "_(" + count + ")";
                loop();
            }
        });
    };
    await loop();
}
exports.doAddFile = async(req, res) => {
    let id = req.body.idCategory;
    res.redirect('viewCategoryDetail?id=' + id)
}

exports.searchCategory = async(req, res) => {
    const searchText = req.body.keyword;
    let listCategory;
    let checkEmpty = validation.checkEmpty(searchText);
    const searchCondition = new RegExp(searchText, 'i');

    if (!checkEmpty) {
        res.redirect('/staff/viewSubmittedIdeas');
    } else {
        listCategory = await category.find({ name: searchCondition });
    }
    res.render('staff/viewSubmittedIdeas', { listCategory: listCategory, loginName: req.session.email });
}

exports.viewLastestIdeas = async(req, res) => {
    let listIdeas = await idea.find();
    let len_ideas = listIdeas.length;
    let last_ideas = [];
    if (len_ideas == 0) {
        last_ideas = [];
    } else if (len_ideas < 5) {
        last_ideas = listIdeas.reverse();
    } else {
        last_ideas = listIdeas.slice(-5, len_ideas).reverse();
    }
    res.render('staff/viewLastestIdeas', { listIdeas: last_ideas });
}

exports.viewSubmittedIdeas = async(req, res) => {
    let listCategory = await category.find();
    res.render('staff/viewSubmittedIdeas', { listCategory: listCategory, loginName: req.session.email })
}

exports.viewCategoryDetail = async(req, res) => {
    let id;
    let noPage;
    let page = 1;
    let sortBy = req.query.sort;
    if (req.body, noPage != undefined) {
        page = req.body.noPage;
    }
    if (req.query.id === undefined) {
        id = req.body.idCategory;
        sortBy = req.body.sortBy;
    } else {
        id = req.query.id;
    }
    if (sortBy === undefined) {
        req.session.sort = req.body.sortBy;
    }

    let listFiles = [];
    try {
        let listIdeas = await idea.find({ categoryID: id }).populate({ path: 'comments', populate: { path: 'author' } }).populate('author');

        let email = req.session.email;
        let staff = await Staff.findOne({ email: email });

        let listLikes = await likes.find({ staffID: { $all: staff._id } });
        let listDislikes = await dislikes.find({ staffID: { $all: staff._id } });;

        let likedIDs = [];
        for (let like of listLikes) {
            likedIDs.push(like.ideaID);
        }

        let dislikeIDs = [];
        for (let dislike of listDislikes) {
            dislikeIDs.push(dislike.ideaID);
        }

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
                    console.log('like');
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
                    console.log('comment');
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
                    console.log('time');
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
                res.render('staff/viewCategoryDetail', { idCategory: id, listFiles: listFiles, compare: compare, noPage: noPage, loginName: req.session.email })
            };
        };
        console.log(listIdeas);
        if (listIdeas.length != 0) {
            listIdeas.forEach(async(i) => {
                fs.readdir(i.url, (err, files) => {
                    listFiles.push({
                        value: files,
                        linkValue: i.url.slice(7),
                        idea: i,
                        idLikeds: likedIDs,
                        idDislikes: dislikeIDs,
                    });
                    counter = counter + 1;
                    callBack();
                });
            })
        } else {
            res.render('staff/viewCategoryDetail', { idCategory: id, listFiles: listFiles, compare: compare, sortBy: sortBy, noPage: noPage, page: page, loginName: req.session.email });
        }
    } catch (e) {
        console.log(e);
        res.render('staff/viewCategoryDetail', { idCategory: id, listFiles: listFiles, compare: compare, loginName: req.session.email });
    }
}

exports.doComment = async(req, res) => {
    let id = req.body.idCategory;
    let aIdea = await idea.findById(req.body.idIdea);
    let aStaff = await Staff.findOne({ email: req.session.email });
    let aCategory = await category.findById(id);
    let allStaffs = await Staff.find();
    let staffEmails = [];
    for (let staff of allStaffs) {
        if (staff.email != aStaff.email) staffEmails.push(staff.email);
    }
    console.log(staffEmails);
    let checkAnnonymously = false;
    if (req.body.annonymously != undefined) {
        checkAnnonymously = true;
        newComment = new comment({
            ideaID: aIdea,
            author: aStaff,
            comment: req.body.comment,
            annonymously: true
        });
    } else {
        newComment = new comment({
            ideaID: req.body.idIdea,
            author: aStaff,
            comment: req.body.comment,
        });
    }


    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "meolua99@gmail.com",
            pass: "qvxgxhaojpyajsia"
        }
    });
    let content = '';
    content += `
        <div style="padding: 10px; background-color: #003375">
            <div style="padding: 10px; background-color: white;">    
    `;
    content += '<h4 style="color: #0085ff"> From: ' + aStaff.email.toString() + '</h4> <hr>';
    content += '<span style="color: black"> Category name: ' + aCategory.name.toString() + '</span><br>';
    content += '<span style="color: black"> Comment to Idea: ' + aIdea.name.toString() + '</span><br>';
    content += '<span style="color: black"> Comment: ' + req.body.comment.toString() + '</span><br>';
    if (!checkAnnonymously) {
        content += '<span style="color: black"> Staff name: ' + aStaff.name.toString() + '</span>';
    } else {
        content += '<span style="color: black"> Staff name: Annonymously </span>';
    }
    content += '</div> </div>';
    let mainOptions = {
        from: 'meolua99@gmail.com',
        to: qac_emails,
        subject: 'New submitted idea' + (Math.round(Math.random() * 10000)).toString(),
        text: 'abc',
        html: content
    }
    transporter.sendMail(mainOptions, function(err, info) {
        if (err) {
            console.error(err);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
    let tempDate = new Date();
    let compare = tempDate > aCategory.dateEnd;
    if (compare) {
        console.log('Final closure date had ended')
        res.redirect('../viewCategoryDetail?id=' + id)
    } else {
        newComment = await newComment.save();
        aIdea.comments.push(newComment);
        aIdea = await aIdea.save();
        //console.log(newComment.comment);
        res.redirect('../viewCategoryDetail?id=' + id);
    }
}


exports.addLike = async(req, res) => {
    let id = req.body.idCategory;
    let ideaID = req.body.ideaID;
    let email = req.session.email;
    let staff = await Staff.findOne({ email: email });
    let n_staffs = 0;
    try {
        let staffID = staff._id;
        let checkExistedStaff = false;
        await likes.findOne({ ideaID: ideaID }).then(data => {
            if (data) {
                n_staffs = data.staffID.length;
                try {
                    let idxRemove = -1;
                    for (let i = 0; i < data.staffID.length; i++) {
                        if (staffID.equals(data.staffID[i])) {
                            idxRemove = i;
                            checkExistedStaff = true;
                            break;
                        }
                    }
                    if (checkExistedStaff) {
                        data.staffID.splice(idxRemove, 1);
                        console.log('Removed existed staff liked idea');
                        n_staffs -= 1;
                        data.save();
                    } else {
                        data.staffID.push(staffID);
                        n_staffs += 1;
                        data.save();
                        console.log('Add a new staff to existed like idea');
                    }
                } catch (e) {
                    console.log(e);
                }
            } else {
                newLike = new likes({
                    ideaID: ideaID,
                    staffID: staffID
                })
                newLike.save();
                n_staffs += 1;
                console.log('Add new staff to new like idea');
            }
        });
    } catch (e) {
        console.log(e);
    }
    let objIdea = await idea.findById(ideaID);
    objIdea.like = n_staffs;
    await objIdea.save();
    res.redirect('viewCategoryDetail?id=' + id);
}

exports.addDislike = async(req, res) => {
    let id = req.body.idCategory;
    let ideaID = req.body.ideaID;
    let email = req.session.email;
    let staff = await Staff.findOne({ email: email });

    let n_staffs = 0;
    try {
        let staffID = staff._id;
        console.log(staffID);
        let checkExistedStaff = false;
        await dislikes.findOne({ ideaID: ideaID }).then(data => {
            if (data) {
                n_staffs = data.staffID.length;
                try {
                    let idxRemove = -1;
                    for (let i = 0; i < data.staffID.length; i++) {
                        if (staffID.equals(data.staffID[i])) {
                            idxRemove = i;
                            checkExistedStaff = true;
                            break;
                        }
                    }
                    if (checkExistedStaff) {
                        data.staffID.splice(idxRemove, 1);
                        n_staffs -= 1;
                        console.log('Removed existed staff disliked idea');
                        data.save();

                    } else {
                        data.staffID.push(staffID);
                        data.save();
                        n_staffs += 1;
                        console.log('Add a new staff to existed dislike idea');
                    }
                } catch (e) {
                    console.log(e);
                }
            } else {
                newDislike = new dislikes({
                    ideaID: ideaID,
                    staffID: staffID
                })
                newDislike.save();
                n_staffs += 1;
                console.log('Add new staff to new dislike idea');
            }
        });
    } catch (e) {
        console.log(e);
    }
    let objIdea = await idea.findOne({ _id: ideaID });
    objIdea.dislike = n_staffs;
    await objIdea.save();
    res.redirect('viewCategoryDetail?id=' + id);
}

exports.viewLastestIdeas = async(req, res) => {
    if (req.session.email === undefined) {
        res.redirect('/');
    } else {
        try {
            let listIdeas = await idea.find().populate({ path: 'comments', populate: { path: 'author' } }).populate('author');
            let len_ideas = listIdeas.length;
            let last_ideas = [];
            if (len_ideas == 0) {
                last_ideas = [];
            } else if (len_ideas < 5) {
                last_ideas = listIdeas.reverse();
            } else {
                last_ideas = listIdeas.slice(-5, len_ideas).reverse();
            }
            let lastestIdeas = [];
            let counter = 0;

            function callBack() {
                if (last_ideas.length === counter) {
                    lastestIdeas.sort((a, b) => {
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
                }
            }
            last_ideas.forEach(async(i) => {
                fs.readdir(i.url, (err, files) => {
                    lastestIdeas.push({
                        idea: i,
                        id: i._id,
                        value: files,
                        linkValue: i.url.slice(7),
                        name: i.name,
                        comment: i.comments.length,
                        idCategory: i.categoryID,
                        n_likes: i.like,
                        n_dislikes: i.dislike,
                        time: i.time.toString().slice(0, -25)
                    });
                    counter += 1;
                    callBack();
                });

            });
            res.render('staff/viewLastestIdeas', { lastestIdeas: lastestIdeas, loginName: req.session.email });
        } catch (e) {
            console.log(e);
            res.render('staff/viewLastestIdeas', { lastestIdeas: lastestIdeas, loginName: req.session.email });
        }
    }
}

exports.filterLastestIdeas = async(req, res) => {
    if (req.session.email === undefined) {
        res.redirect('/');
    } else {
        try {
            let n_last = Number(req.body.last);
            let listIdeas = await idea.find().populate({ path: 'comments', populate: { path: 'author' } }).populate('author');
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
            let counter = 0;

            function callBack() {
                if (last_ideas.length === counter) {
                    lastestIdeas.sort((a, b) => {
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
                }
            }
            await last_ideas.forEach(async(i) => {
                fs.readdir(i.url, (err, files) => {
                    lastestIdeas.push({
                        idea: i,
                        id: i._id,
                        value: files,
                        linkValue: i.url.slice(7),
                        name: i.name,
                        comment: i.comments.length,
                        idCategory: i.categoryID,
                        n_likes: i.like,
                        n_dislikes: i.dislike,
                        time: i.time.toString().slice(0, -25)
                    });
                    counter += 1;
                    callBack();
                });
            });
            res.render('staff/viewLastestIdeas', { lastestIdeas: lastestIdeas, loginName: req.session.email });
        } catch (err) {
            console.error(err);
            res.render('staff/viewLastestIdeas', { lastestIdeas: lastestIdeas, loginName: req.session.email });
        }
    }
}

exports.viewMostComments = async(req, res) => {
    if (req.session.email === undefined) {
        res.redirect('/');
    } else {
        try {
            let listIdeas = await idea.find().populate('comments');
            let n_ideas = listIdeas.length;
            let default_ideas = 5;
            if (n_ideas < default_ideas) default_ideas = n_ideas;
            // check if idea was added
            let visited_max = [];
            for (let m = 0; m < n_ideas; m++) {
                visited_max.push(0);
            }
            // count total 'view = like+dis_like+comment'
            let countViews = [];
            for (let idea of listIdeas) {
                countViews.push(idea.comments.length);
            }
            let topViews = [];
            let i = 0;
            while (i < default_ideas) {
                let fake_max = -1;
                let idx_max = -1;
                let j = 0;
                while (j < n_ideas) {
                    if (visited_max[j] == 0 && countViews[j] >= fake_max) {
                        fake_max = countViews[j];
                        idx_max = j;
                    }
                    j++;
                }
                visited_max[idx_max] = 1;
                topViews.push(listIdeas[idx_max]);
                i++;
            }
            let mostViewedIdeas = [];
            let counter = 0;

            function callBack() {
                if (topViews.length === counter) {
                    mostViewedIdeas.sort((a, b) => {
                        let A = a.comment;
                        let B = b.comment;
                        if (A < B) {
                            return 1;
                        } else if (A > B) {
                            return -1;
                        } else {
                            if (a._id < b._id) {
                                return -1;
                            }
                            if (a._id > b._id) {
                                return 1;
                            }
                        };
                    });
                }
            }
            for (let j = 0; j < topViews.length; j++) {
                let i = topViews[j];
                fs.readdir(i.url, (err, files) => {
                    mostViewedIdeas.push({
                        idea: i,
                        id: i._id,
                        value: files,
                        linkValue: i.url.slice(7),
                        name: i.name,
                        comment: i.comments.length,
                        idCategory: i.categoryID,
                        n_likes: i.like,
                        n_dislikes: i.dislike,
                        time: i.time.toString().slice(0, -25),
                    });
                    counter += 1;
                    callBack();
                });

            };
            res.render('staff/viewMostComments', { mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        } catch (e) {
            console.error(e);
            res.render('staff/viewMostComments', { mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        }
    }
}

exports.filterMostComments = async function(req, res) {
    if (req.session.email === undefined) {
        res.redirect('/');
    } else {
        try {
            let listIdeas = await idea.find().populate('comments');
            let n_ideas = listIdeas.length;
            let n_last = Number(req.body.last);
            let n_times = n_last;
            if (n_last > n_ideas) {
                n_times = n_ideas;
            }
            let visited_max = [];
            for (let m = 0; m < n_ideas; m++) {
                visited_max.push(0);
            }
            let countViews = [];
            for (let idea of listIdeas) {
                countViews.push(idea.comments.length);
            }
            let topViews = [];
            let i = 0;
            while (i < n_times) {
                let fake_max = -1;
                let idx_max = -1;
                let j = 0;
                while (j < n_ideas) {
                    if (visited_max[j] == 0 && countViews[j] >= fake_max) {
                        fake_max = countViews[j];
                        idx_max = j;
                    }
                    j++;
                }
                visited_max[idx_max] = 1;
                topViews.push(listIdeas[idx_max]);
                i++;
            }

            let mostViewedIdeas = [];
            let counter = 0;

            function callBack() {
                if (topViews.length === counter) {
                    mostViewedIdeas.sort((a, b) => {
                        let A = a.comment;
                        let B = b.comment;
                        if (A < B) {
                            return 1;
                        } else if (A > B) {
                            return -1;
                        } else {
                            if (a._id < b._id) {
                                return -1;
                            }
                            if (a._id > b._id) {
                                return 1;
                            }
                        };
                    });
                }
            }
            await topViews.forEach(async(i) => {
                fs.readdir(i.url, (err, files) => {
                    mostViewedIdeas.push({
                        idea: i,
                        id: i._id,
                        value: files,
                        linkValue: i.url.slice(7),
                        name: i.name,
                        comment: i.comments.length,
                        idCategory: i.categoryID,
                        n_likes: i.like,
                        n_dislikes: i.dislike,
                        time: i.time.toString().slice(0, -25)
                    });
                    counter += 1;
                    callBack();
                });
            });
            res.render('staff/viewMostComments', { mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        } catch (e) {
            console.error(e);
            res.render('staff/viewMostComments', { mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        }
    }
}

exports.viewLatestComments = async(req, res) => {
    if (req.session.email === undefined) {
        res.redirect('/');
    } else {
        try {
            let listComments = await comment.find();
            let len_comments = listComments.length;
            let last_comments = [];
            if (len_comments == 0) {
                last_comments = [];
            } else if (len_comments < 5) {
                last_comments = listComments.reverse();
            } else {
                last_comments = listComments.slice(-5, len_comments).reverse();
            }
            let lastComments_detail = [];
            let counter = 0;

            function callBack() {
                if (last_comments.length === counter) {
                    lastComments_detail.sort((a, b) => {
                        const A = new Date(a.time)
                        const B = new Date(b.time)
                        if (A < B) {
                            return 1;
                        } else if (A > B) {
                            return -1;
                        } else {
                            if (a._id < b._id) {
                                return -1;
                            }
                            if (a._id > b._id) {
                                return 1;
                            }
                        };
                    });
                }
            }
            for (let comment of last_comments) {
                let objIdea = await idea.findOne({ _id: comment.ideaID });
                let objAuthor = await Staff.findOne({ _id: comment.author });
                if (objIdea === null || objAuthor === null) {
                    if (objIdea === null)
                        console.log('Idea lost: ', comment.ideaID);
                    else if (objAuthor === null)
                        console.log('Author lost: ', comment.author);
                    continue;
                }
                fs.readdir(objIdea.url, (err, files) => {
                    lastComments_detail.push({
                        idea: objIdea,
                        value: files,
                        linkValue: objIdea.url.slice(7),
                        name: objIdea.name,
                        comment_len: objIdea.comments.length,
                        comment_content: comment.comment,
                        n_likes: objIdea.like,
                        n_dislikes: objIdea.dislike,
                        author: objAuthor,
                        time: comment.time.toString().slice(0, -25)
                    });
                    counter += 1;
                    callBack();
                });
            }
            res.render('staff/viewLatestComments', { lastComments_detail: lastComments_detail, loginName: req.session.email });
        } catch (err) {
            console.log(err);
            res.render('staff/viewLatestComments', { lastComments_detail: lastComments_detail, loginName: req.session.email });
        }
    }
}

exports.filterLatestComment = async(req, res) => {
    if (req.session.email === undefined) {
        res.redirect('/');
    } else {
        try {
            let n_last = Number(req.body.last);
            let listComments = await comment.find();
            let len_comments = listComments.length;
            let last_comments = [];
            if (len_comments < n_last) n_last = len_comments;
            if (len_comments == 0) {
                last_comments = [];
            } else if (len_comments < 5) {
                last_comments = listComments.reverse();
            } else {
                last_comments = listComments.slice(-n_last, len_comments).reverse();
            }
            let lastComments_detail = [];
            let counter = 0;

            function callBack() {
                if (last_comments.length === counter) {
                    lastComments_detail.sort((a, b) => {
                        const A = new Date(a.time)
                        const B = new Date(b.time)
                        if (A < B) {
                            return 1;
                        } else if (A > B) {
                            return -1;
                        } else {
                            if (a._id < b._id) {
                                return -1;
                            }
                            if (a._id > b._id) {
                                return 1;
                            }
                        };
                    });
                }
            }
            for (let comment of last_comments) {
                let objIdea = await idea.findOne({ _id: comment.ideaID });
                let objAuthor = await staff.findOne({ _id: comment.author });
                if (objIdea === null || objAuthor === null) {
                    console.log(comment.ideaID);
                    continue;
                }
                fs.readdir(objIdea.url, (err, files) => {
                    lastComments_detail.push({
                        idea: objIdea,
                        value: files,
                        linkValue: objIdea.url.slice(7),
                        name: objIdea.name,
                        comment_len: objIdea.comments.length,
                        comment_content: comment.comment,
                        n_likes: objIdea.like,
                        n_dislikes: objIdea.dislike,
                        author: objAuthor,
                        time: comment.time.toString().slice(0, -25)
                    });
                    counter += 1;
                    callBack();
                });
            }
            res.render('qac/viewLastestComment', { lastComments_detail: lastComments_detail, loginName: req.session.email })
        } catch (err) {
            console.log(err);
            res.render('qac/viewLastestComment', { lastComments_detail: lastComments_detail, loginName: req.session.email })
        }
    }
}

exports.viewMostViewedIdeas = async(req, res) => {
    if (req.session.email === undefined) {
        res.redirect('/');
    } else {
        try {
            let listIdeas = await idea.find().populate({ path: 'comments', populate: { path: 'author' } }).populate('author');
            let n_ideas = listIdeas.length;
            let default_ideas = 5;
            if (n_ideas < default_ideas) default_ideas = n_ideas;
            // check if idea was added
            let visited_max = [];
            for (let m = 0; m < n_ideas; m++) {
                visited_max.push(0);
            }
            // count total 'view = like+dis_like+comment'
            let countViews = [];
            for (let idea of listIdeas) {
                countViews.push(idea.like + idea.dislike + idea.comments.length);
            }
            // Find most viewed ideas by default
            let topViews = [];
            let i = 0;
            while (i < default_ideas) {
                let fake_max = -1;
                let idx_max = -1;
                let j = 0;
                while (j < n_ideas) {
                    if (visited_max[j] == 0 && countViews[j] >= fake_max) {
                        fake_max = countViews[j];
                        idx_max = j;
                    }
                    j++;
                }
                visited_max[idx_max] = 1;
                topViews.push(listIdeas[idx_max]);
                i++;
            }
            // From topViews, get detail information
            let counter = 0;

            function callBack() {
                if (topViews.length === counter) {
                    mostViewedIdeas.sort((a, b) => {
                        let A = a.n_likes + a.n_dislikes + a.comment;
                        let B = b.n_likes + b.n_dislikes + b.comment;
                        if (A < B) {
                            return 1;
                        } else if (A > B) {
                            return -1;
                        } else {
                            if (a._id < b._id) {
                                return -1;
                            }
                            if (a._id > b._id) {
                                return 1;
                            }
                        };
                    });
                }
            }
            let mostViewedIdeas = [];
            for (let i of topViews) {
                fs.readdir(i.url, (err, files) => {
                    mostViewedIdeas.push({
                        idea: i,
                        id: i._id,
                        value: files,
                        linkValue: i.url.slice(7),
                        name: i.name,
                        comment: i.comments.length,
                        idCategory: i.categoryID,
                        n_likes: i.like,
                        n_dislikes: i.dislike,
                        time: i.time.toString().slice(0, -25)
                    });
                    counter += 1;
                    callBack();
                });
            };
            res.render('staff/viewMostViewedIdeas', { mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        } catch (e) {
            console.log(e);
            res.render('staff/viewMostViewedIdeas', { mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        }
    }
}

exports.filterMostViewIdeas = async function(req, res) {
    let listIdeas = await idea.find().populate('comments');
    let n_ideas = listIdeas.length;

    let n_last = Number(req.body.last);
    let n_times = n_last;
    if (n_last > n_ideas) {
        n_times = n_ideas;
    }
    let visited_max = [];
    for (let m = 0; m < n_ideas; m++) {
        visited_max.push(0);
    }
    let countViews = [];
    for (let idea of listIdeas) {
        countViews.push(idea.like + idea.dislike + idea.comments.length);
    }
    let topViews = [];
    let i = 0;
    while (i < n_times) {
        let fake_max = -1;
        let idx_max = -1;
        let j = 0;
        while (j < n_ideas) {
            if (visited_max[j] == 0 && countViews[j] >= fake_max) {
                fake_max = countViews[j];
                idx_max = j;
            }
            j++;
        }
        visited_max[idx_max] = 1;
        topViews.push(listIdeas[idx_max]);
        i++;
    }

    let mostViewedIdeas = [];
    topViews.forEach(async(i) => {
        fs.readdir(i.url, (err, files) => {
            mostViewedIdeas.push({
                idea: i,
                id: i._id,
                value: files,
                linkValue: i.url.slice(7),
                name: i.name,
                comment: i.comments.length,
                idCategory: i.categoryID,
                n_likes: i.like,
                n_dislikes: i.dislike,
                time: i.time.toString().slice(0, -25)
            });
        });
    });
    res.render('staff/viewMostViewedIdeas', { mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
}

exports.paginations = async(req, res) => {
    const pageSize = 5;
    var page = req.query.page;
    if (page) {
        page = parseInt(page)
        if (page < 1) {
            page = 1;
        }
        skip = (page - 1) * pageSize;
        let listCategory = await category.find({}).skip(skip).limit(pageSize).then(data => {
                res.json(data);
            })
            .catch((err) => {
                res.status(500).json('loi');
            });
        res.render('staff/testPagination', { listCategory: listCategory, loginName: req.session.email })
    } else {
        let listCategory = await category.find({});
        res.render('staff/testPagination', { listCategory: listCategory, loginName: req.session.email })
    }
}

exports.changePassword = async(req, res) => {
    res.render('staff/changePassword', { loginName: req.session.email })
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
            res.render('staff/changePassword', { errors: errors, loginName: req.session.email })
        } else {
            await bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newpw, salt, (err, hash) => {
                    if (err) throw err;
                    user.password = hash;
                    user = user.save();
                    req.session.user = user;
                    res.redirect('/staff')
                })
            })

        }
    } catch (err) {
        console.log(err);
    }
}