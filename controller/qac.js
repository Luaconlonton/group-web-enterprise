const idea = require('../models/ideas');
const comment = require('../models/comments');
const staff = require('../models/staff');
const fs = require("fs");
const Account = require('../models/user');
const bcrypt = require('bcryptjs');
const QAC = require('../models/QAcoordinator');



// View Lastest Comments //
exports.getQAC = async(req, res) => {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        res.render('qac/index', { loginName: req.session.email });
    }

}

// View Change Password //
exports.changePassword = async(req, res) => {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        res.render('qac/changePassword', { loginName: req.session.email });
    }
}

// Change Password //
exports.doChangePassword = async(req, res) => {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        let user = await Account.findOne({ email: req.session.email });
        let current = req.body.current;
        let newpw = req.body.new;
        let confirm = req.body.confirm;
        let errors = {};
        let flag = true;
        console.log(1);
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
                res.render('qac/changePassword', { errors: errors, loginName: req.session.email })
            } else {
                await bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newpw, salt, (err, hash) => {
                        if (err) throw err;
                        user.password = hash;
                        user = user.save();
                        req.session.user = user;
                        res.redirect('/qac')
                    })
                })

            }
        } catch (err) {
            console.log(err);
        }
    }
}

// View Lastest Comments //
exports.viewLastestComment = async(req, res) => {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        try {
            let listComments = await comment.find();
            let len_comments = listComments.length;
            let distance5_comments = [];
            let temp_len_comments = len_comments;
            let k = 1;
            while (temp_len_comments > 5) {
                distance5_comments.push(5 * k);
                k++;
                temp_len_comments -= 5;
            }
            if (k > 1) {
                distance5_comments.push(distance5_comments[k - 2] + temp_len_comments);
            }
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
                let objAuthor = await staff.findOne({ _id: comment.author });
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
            res.render('qac/viewLastestComment', { distance5_comments: distance5_comments, lastComments_detail: lastComments_detail, loginName: req.session.email });
        } catch (err) {
            console.log(err);
            res.render('qac/viewLastestComment', { distance5_comments: distance5_comments, lastComments_detail: lastComments_detail, loginName: req.session.email });
        }
    }
}

// Filter Lastest Comments //
exports.filterLastestComment = async(req, res) => {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        try {
            let n_last = Number(req.body.last);
            let listComments = await comment.find();
            let len_comments = listComments.length;
            let distance5_comments = [];
            let temp_len_comments = len_comments;
            let k = 1;
            while (temp_len_comments > 5) {
                distance5_comments.push(5 * k);
                k++;
                temp_len_comments -= 5;
            }
            if (k > 1) {
                distance5_comments.push(distance5_comments[k - 2] + temp_len_comments);
            }
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
            res.render('qac/viewLastestComment', { distance5_comments: distance5_comments, lastComments_detail: lastComments_detail, loginName: req.session.email })
        } catch (err) {
            console.log(err);
            res.render('qac/viewLastestComment', { distance5_comments: distance5_comments, lastComments_detail: lastComments_detail, loginName: req.session.email })
        }
    }
}

// Most View Ideas //
exports.mostViewIdeas = async(req, res) => {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        try {
            let listIdeas = await idea.find().populate({ path: 'comments', populate: { path: 'author' } }).populate('author');
            let n_ideas = listIdeas.length;
            let distance5_ideas = [];
            let temp_len_ideas = n_ideas;
            let k = 1;
            while (temp_len_ideas > 5) {
                distance5_ideas.push(5 * k);
                k++;
                temp_len_ideas -= 5;
            }
            if (k > 1) {
                distance5_ideas.push(distance5_ideas[k - 2] + temp_len_ideas);
            }
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
            res.render('qac/mostViewedIdeas', { distance5_ideas: distance5_ideas, mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        } catch (e) {
            console.log(e);
            res.render('qac/mostViewedIdeas', { distance5_ideas: distance5_ideas, mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        }
    }
}

//  Filter Most View Ideas //
exports.filterMostViewIdeas = async function(req, res) {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        try {
            let listIdeas = await idea.find().populate({ path: 'comments', populate: { path: 'author' } }).populate('author');
            let n_ideas = listIdeas.length;
            let distance5_ideas = [];
            let temp_len_ideas = n_ideas;
            let k = 1;
            while (temp_len_ideas > 5) {
                distance5_ideas.push(5 * k);
                k++;
                temp_len_ideas -= 5;
            }
            if (k > 1) {
                distance5_ideas.push(distance5_ideas[k - 2] + temp_len_ideas);
            }
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
            res.render('qac/mostViewedIdeas', { distance5_ideas: distance5_ideas, mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        } catch (error) {
            console.log(error);
            res.render('qac/mostViewedIdeas', { distance5_ideas: distance5_ideas, mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        }
    }
}

//  Most Comments in Idea //
exports.viewMostComments = async(req, res) => {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        try {
            let listIdeas = await idea.find().populate('comments');
            let n_ideas = listIdeas.length;
            let distance5_ideas = [];
            let temp_len_ideas = n_ideas;
            let k = 1;
            while (temp_len_ideas > 5) {
                distance5_ideas.push(5 * k);
                k++;
                temp_len_ideas -= 5;
            }
            if (k > 1) {
                distance5_ideas.push(distance5_ideas[k - 2] + temp_len_ideas);
            }
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
            res.render('qac/mostComments', { distance5_ideas: distance5_ideas, mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        } catch (e) {
            console.error(e);
            res.render('qac/mostComments', { distance5_ideas: distance5_ideas, mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        }
    }
}

// Filter Most Comments in Idea //
exports.filterMostComments = async function(req, res) {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        try {
            let listIdeas = await idea.find().populate('comments');
            let n_ideas = listIdeas.length;
            let distance5_ideas = [];
            let temp_len_ideas = n_ideas;
            let k = 1;
            while (temp_len_ideas > 5) {
                distance5_ideas.push(5 * k);
                k++;
                temp_len_ideas -= 5;
            }
            if (k > 1) {
                distance5_ideas.push(distance5_ideas[k - 2] + temp_len_ideas);
            }
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
            res.render('qac/mostComments', { distance5_ideas: distance5_ideas, mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        } catch (e) {
            console.error(e);
            res.render('qac/mostComments', { distance5_ideas: distance5_ideas, mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
        }
    }
}

// View Lastest Ideas //
exports.viewLastestIdeas = async(req, res) => {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        try {
            let listIdeas = await idea.find().populate({ path: 'comments', populate: { path: 'author' } }).populate('author');
            let len_ideas = listIdeas.length;
            let distance5_ideas = [];
            let temp_len_ideas = len_ideas;
            let k = 1;
            while (temp_len_ideas > 5) {
                distance5_ideas.push(5 * k);
                k++;
                temp_len_ideas -= 5;
            }
            if (k > 1) {
                distance5_ideas.push(distance5_ideas[k - 2] + temp_len_ideas);
            }
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
                    console.log('a')
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
            res.render('qac/viewLastestIdeas', { distance5_ideas: distance5_ideas, lastestIdeas: lastestIdeas, loginName: req.session.email });
        } catch (e) {
            console.log(e);
            res.render('qac/viewLastestIdeas', { distance5_ideas: distance5_ideas, lastestIdeas: lastestIdeas, loginName: req.session.email });
        }
    }
}

// Filter Lastest Ideas //
exports.filterLastestIdeas = async(req, res) => {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        try {
            let listIdeas = await idea.find().populate({ path: 'comments', populate: { path: 'author' } }).populate('author');
            let len_ideas = listIdeas.length;
            let distance5_ideas = [];
            let temp_len_ideas = len_ideas;
            let k = 1;
            while (temp_len_ideas > 5) {
                distance5_ideas.push(5 * k);
                k++;
                temp_len_ideas -= 5;
            }
            if (k > 1) {
                distance5_ideas.push(distance5_ideas[k - 2] + temp_len_ideas);
            }
            let n_last = Number(req.body.last);
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
                console.log('b')
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
                    console.log('a')
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
            res.render('qac/viewLastestIdeas', { distance5_ideas: distance5_ideas, lastestIdeas: lastestIdeas, loginName: req.session.email });
        } catch (err) {
            console.error(err);
            res.render('qac/viewLastestIdeas', { distance5_ideas: distance5_ideas, lastestIdeas: lastestIdeas, loginName: req.session.email });
        }
    }
}