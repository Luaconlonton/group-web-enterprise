const Account = require('../models/user');
const bcrypt = require('bcryptjs');
const Category = require('../models/category');
const idea = require('../models/ideas');
const User = require('../models/user');
const validation = require('./validation');
const Comment = require('../models/comments');
const AdmZip = require('adm-zip');
var mongoose = require('mongoose');
const fs = require("fs");
const fsPromises = fs.promises;
const zipFolder = require('zip-folder');
const ideas = require('../models/ideas');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.getQAM = async(req, res) => {
    res.render('qam/qam_index', { loginName: req.session.email })
}

exports.changePassword = async(req, res) => {
    res.render('qam/changePassword', { loginName: req.session.email })
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
            res.render('qam/changePassword', { errors: errors, loginName: req.session.email })
        } else {
            await bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newpw, salt, (err, hash) => {
                    if (err) throw err;
                    user.password = hash;
                    user = user.save();
                    req.session.user = user;
                    res.redirect('/qam_index')
                })
            })

        }
    } catch (err) {
        console.log(err);
    }
}

exports.getAddCategory = async(req, res) => {
    res.render('qam/qamAddCategory', { loginName: req.session.email })
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
    await Category.create({
        name: req.body.name,
        description: req.body.description,
        dateStart: date,
        dateEnd: newDate,
        url: 'public/folder/' + req.body.name
    });
    res.redirect('/qam_index');
}

exports.getViewCategory = async(req, res) => {
    let listCategory = await Category.find();
    let tempDate = new Date();
    let listCompare = [];
    listCategory.forEach(element => {
            listCompare.push({
                compare: tempDate > element.dateEnd,
                category: element
            });
        })
        // console.log(listCompare)
        // let compare = tempDate > aCategory.dateEnd;
    res.render('qam/qamViewCategory', { listCompare: listCompare, loginName: req.session.email })
}

exports.getCategoryDetail = async(req, res) => {
    console.log('1')
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
        let aCategory = await Category.findById(id);
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
                res.render('qam/qamViewCategoryDetail', { idCategory: id, listFiles: listFiles, sortBy: sortBy, noPage: noPage, page: page, loginName: req.session.email });
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
            res.render('qam/qamViewCategoryDetail', { idCategory: id, listFiles: listFiles, sortBy: sortBy, noPage: noPage, page: page, loginName: req.session.email });
        }
    } catch (e) {
        // console.log(e);
        res.render('qam/qamViewCategoryDetail', { idCategory: id, listFiles: listFiles, sortBy: sortBy, noPage: noPage, page: page, loginName: req.session.email });
    }
}


exports.deleteCategory = async(req, res) => {
    let id = req.query.id;
    let dir = await Category.findById(id);
    Category.findByIdAndRemove(id).then(data = {});
    const path = 'public/folder/' + dir.name
        // include node fs module
    const fs = require('fs');
    fs.rm(path, { recursive: true }, () => console.log('delete done'));
    res.redirect('/qam/qamViewCategory');
}

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
    res.render('qam/viewLastestIdeas', { lastestIdeas: lastestIdeas, loginName: req.session.email });
}

exports.editCategory = async(req, res) => {
    let id = req.query.id;
    let aCategory = await Category.findById(id);
    res.render('qam/qamEditCategory', { aCategory: aCategory, loginName: req.session.email })
}

exports.updateCategory = async(req, res) => {
    let id = req.body.id;
    let aCategory = await Category.findById(id);
    console.log(aCategory)
    aCategory.name = req.body.name;
    aCategory.description = req.body.description;
    console.log(req.body.name)
    console.log(req.body.description)
    try {
        aCategory = await aCategory.save();
        res.redirect('/qam/qamViewCategory');
    } catch (error) {
        console.log(error);
        res.redirect('/qam/qamViewCategory');
    }
}

exports.getMostViewed = async(req, res) => {
    let listIdeas = await idea.find().populate('comments');
    let n_ideas = listIdeas.length;
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
    let top5Views = [];
    let i = 0;
    while (i < 5) {
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
        top5Views.push(listIdeas[idx_max]);
        i++;
    }
    let mostViewedIdeas = [];
    let counter = 0;
    for (let i of top5Views) {
        if (i && i.url) {
            fs.readdir(i.url, (err, files) => {
                mostViewedIdeas.push({
                    idea: i,
                    id: i._id,
                    value: files,
                    linkValue: i.url.slice(7),
                    name: i.name,
                    comment: i.comments.length,
                    // comment_content: comments_contents,
                    idCategory: i.categoryID,
                    n_likes: i.like,
                    n_dislikes: i.dislike,
                    // authors: authors_name,
                    time: i.time.toString().slice(0, -25),
                    // time_comment: time_comments
                });
            });
        };
        counter = counter + 1;
    };
    res.render('qam/qamMostViewed', { mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
}

exports.downloadZip = async(req, res) => {
    let id = req.query.id;
    let aCategory = await Category.findById(id);
    fs.writeFileSync("./file.txt", JSON.stringify(aCategory), (err)=> {
        if(err) {
            console.error(err)
            return
        }
        console.log('Data written to file successfully!');
    })
    const zipPath = './my-folder.zip';
    zipFolder("file.txt", zipPath, function(err) {
        if (err) {
          console.log('Lỗi khi nén tệp: ', err);
        } else {
          console.log('Đã nén tệp thành công!');
          // Thiết lập header để tải xuống tệp zip
          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Disposition', 'attachment; filename=my-folder.zip');
          // Tải xuống tệp zip
        }
        return res.download(zipPath)
      });
}

exports.downloadCSV = async(req, res) => {
    let id = req.query.id;
    let aCategory = await Category.findById(id);
    let path = aCategory.name + '.csv'
    const csvWriter = createCsvWriter({
        path: path,
        header: [
            { id: '_id', title: 'ID' },
            { id: 'category', title: 'Category Name' },
            { id: 'name', title: 'Name' },
            { id: 'url', title: 'URL' },
            { id: 'author', title: 'Author' },
            { id: 'time', title: 'Time' },
            { id: 'like', title: 'Like' },
            { id: 'dislike', title: 'Dislike' },
            { id: 'comment', title: 'Comments' },
            { id: '__v', title: '__v' }
        ]
    });
    let listIdeas = await idea.find({ categoryID: id }).populate({ path: 'comments', populate: { path: 'author' } }).populate('author').populate('categoryID')
    let CSVAttribute = [];
    listIdeas.forEach(element => {
        let listComment = []
        element.comments.forEach(i => {
            listComment.push(i.comment)
        })
        CSVAttribute.push({
            _id: element._id,
            category: element.categoryID.name,
            name: element.name,
            url: element.url,
            author: element.author.name,
            time: element.time,
            like: element.like,
            dislike: element.dislike,
            comment: listComment
        })
    })
    const data = CSVAttribute;
    csvWriter
        .writeRecords(data)
        .then(() => res.download(path));
}

exports.numberOfIdeasByYear = async(req, res) => {
    
        let noIdeas = await idea.find({});
        res.render('qam/numberOfIdeasByYear', { listYear: JSON.stringify(noIdeas), loginName: req.session.email })  
}

exports.numberOfIdeasByYear2 = async(req, res) => {
    const idea= await ideas.find()
    .populate("categoryID", "department")
    res.render('qam/numberOfIdeasByYear2', { data: JSON.stringify(idea), loginName: req.session.email })
}

exports.numberOfPeople = async(req, res) => {
    let role = ['QAmanager', 'QAcoordinator', 'Staff'];
    let data = [];
    let counter = 0;
    role.forEach(async(i) => {
        let noPeople = await Account.find({ "role": i }).count();
        data.push({
            x: i,
            value: noPeople
        });
        counter += 1;
        if (counter === 3) {
            console.log(data);
            res.render('qam/numberOfPeoPle', { data: JSON.stringify(data), loginName: req.session.email })
        }
    });
}

exports.searchCategory = async(req, res) => {

    const searchText = req.body.keyword;
    console.log(req.body);
    let listCategory;
    let listCompare = [];
    let checkEmpty = validation.checkEmpty(searchText);
    const searchCondition = new RegExp(searchText, 'i');
    if (!checkEmpty) {
        res.redirect('/qam/qamViewCategory');
    } else {
        listCategory = await Category.find({ name: searchCondition });
        let tempDate = new Date();
        let listCompare = [];
        listCategory.forEach(element => {
            listCompare.push({
                compare: tempDate > element.dateEnd,
                category: element
            });
        })
        console.log(listCompare)
        res.render('qam/qamViewCategory', { listCompare: listCompare, loginName: req.session.email });
    }
}