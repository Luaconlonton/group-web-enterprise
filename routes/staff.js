const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const staffController = require('../controller/staff');
const { isStaff } = require("../middleware/auth");

const storageQAmanager = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, req.body.path);
        // console.log(req.body)
    },
    //add back the extension
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
})

const uploadQAmanager = multer({
    storage: storageQAmanager,
    limits: {
        fieldSize: 1024 * 1024 * 3
    },
})
router.get('/staff', staffController.getStaff);
router.get('/staff/viewStaff', staffController.viewStaff);

router.get('/staff/addIdea', isStaff, staffController.addIdea);
router.post('/staff/doAddIdea', isStaff, staffController.doAddIdea);
router.post('/staff/doAddFile', isStaff, uploadQAmanager.any('ideas'), staffController.doAddFile);
router.post('/staff/searchStaff', isStaff, staffController.searchStaff);

router.get('/staff/viewLastestIdeas', isStaff, staffController.viewLastestIdeas);
router.get('/staff/viewMostViewedIdeas', isStaff, staffController.viewMostViewedIdeas)

router.get('/staff/viewSubmittedIdeas', isStaff, staffController.viewSubmittedIdeas);
router.get('/staff/viewCategoryDetail', isStaff, staffController.viewCategoryDetail);

router.post('/staff/viewCategoryDetail', isStaff, staffController.viewCategoryDetail);
router.post('/staff/viewCategoryDetail/Comment', isStaff, staffController.doComment);
router.post('/staff/searchCategory', isStaff, staffController.searchCategory);

router.post('/staff/addLike', staffController.addLike);
router.post('/staff/addDislike', staffController.addDislike);

router.get('/staff/viewLatestComments', isStaff, staffController.viewLatestComments);
router.get('/staff/viewMostViewedIdeas', isStaff, staffController.viewMostViewedIdeas)
router.get('staff/testPagination', isStaff, staffController.paginations)
router.get('/staff/viewMostComments', isStaff, staffController.viewMostComments);

router.post('/staff/viewLastestIdeas', isStaff, staffController.filterLastestIdeas);
router.post('/staff/mostViewedIdeas', isStaff, staffController.filterMostViewIdeas);
router.post('/staff/viewLatestComments', isStaff, staffController.filterLatestComment);
router.post('/staff/viewMostComments', isStaff, staffController.filterMostComments);

router.get('/staff/changePassword', isStaff, staffController.changePassword)
router.post('/staff/doChangePassword', isStaff, staffController.doChangePassword)

module.exports = router;