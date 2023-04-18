const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const adminController = require('../controller/admin');
const { isAdmin } = require("../middleware/auth");
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json();

router.get('/admin', isAdmin, adminController.getAdmin);
router.get('/admin/changePassword', isAdmin, adminController.changePassword)
router.post('/admin/doChangePassword', isAdmin, adminController.doChangePassword)

//QAmanager
const storageQAmanager = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'public/uploads/QAmanager');
        console.log(req.body)
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

router.get('/admin/viewQualityAssuranceManager', isAdmin, adminController.viewQAmanager);
router.get('/admin/addQualityAssuranceManager', isAdmin, adminController.addQAmanager);
router.post('/admin/doAddQualityAssuranceManager', isAdmin, uploadQAmanager.single('picture'), adminController.doAddQAmanager);
router.get('/admin/deleteQualityAssuranceManager', isAdmin, adminController.deleteQAmanager);
router.get('/admin/editQualityAssuranceManager', isAdmin, adminController.editQAmanager);
router.post('/admin/doEditQualityAssuranceManager', isAdmin, uploadQAmanager.single('picture'), adminController.doEditQAmanager);
router.post('/admin/searchQualityAssuranceManager', isAdmin, adminController.searchQAmanager);



//QAcoordinator
const storageQAcoordinator = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'public/uploads/QAcoordinator');
    },
    //add back the extension
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
})

const uploadQAcoordinator = multer({
    storage: storageQAcoordinator,
    limits: {
        fieldSize: 1024 * 1024 * 3
    },
})
router.get('/admin/viewQualityAssuranceCoordinator', isAdmin, adminController.viewQAcoordinator);
router.get('/admin/addQualityAssuranceCoordinator', isAdmin, adminController.addQAcoordinator);
router.post('/admin/doAddQualityAssuranceCoordinator', isAdmin, uploadQAcoordinator.single('picture'), adminController.doAddQAcoordinator);
router.get('/admin/editQualityAssuranceCoordinator', isAdmin, adminController.editQAcoordinator);
router.post('/admin/doEditQualityAssuranceCoordinator', isAdmin, uploadQAcoordinator.single('picture'), adminController.doEditQAcoordinator);
router.get('/admin/deleteQualityAssuranceCoordinator', isAdmin, adminController.deleteQAcoordinator);
router.post('/admin/searchQualityAssuranceCoordinator', isAdmin, adminController.searchQAcoordinator);

//Staff
const storageStaff = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'public/uploads/staff');
    },
    //add back the extension
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
});

const uploadStaff = multer({
    storage: storageStaff,
    limits: {
        fieldSize: 1024 * 1024 * 3
    },
});
router.get('/admin/viewStaff', isAdmin, adminController.viewStaff);
router.get('/admin/addStaff', isAdmin, adminController.addStaff);
router.post('/admin/doAddStaff', isAdmin, uploadStaff.single('picture'), adminController.doAddStaff);
router.get('/admin/editStaff', isAdmin, adminController.editStaff);
router.post('/admin/doEditStaff', isAdmin, uploadStaff.single('picture'), adminController.doEditStaff);
router.get('/admin/deleteStaff', isAdmin, adminController.deleteStaff);
router.post('/admin/searchStaff', isAdmin, adminController.searchStaff);

router.get('/admin/viewCategory', isAdmin, adminController.viewCategory);
router.post('/admin/searchCategory', isAdmin, adminController.searchCategory);
router.get('/admin/category/edit', isAdmin, adminController.editDate);
router.post('/admin/doEditCategory', isAdmin, adminController.doEditDate);

router.get('/admin/viewSubmittedIdeas', isAdmin, adminController.viewSubmittedIdeas);
router.get('/admin/viewCategoryDetail', isAdmin, adminController.viewCategoryDetail);
router.post('/admin/viewCategoryDetail', isAdmin, adminController.viewCategoryDetail);
router.get("/admin/viewLastestIdeas", isAdmin, adminController.viewLastestIdeas)
router.get("/admin/getCategory", adminController.getCategory)

module.exports = router;