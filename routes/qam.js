const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const qamController = require('../controller/qam');
const { isQAM } = require("../middleware/auth");

// router.get('/qam_index', isQAM, qamController.getQAM);
router.get('/qam_index', isQAM, qamController.getQAM);
router.get('/qam/qamAddCategory', isQAM, qamController.getAddCategory);
router.post('/qam/doAddCategory', qamController.doAddCategory);
router.get('/qam/qamViewCategory', isQAM, qamController.getViewCategory);
router.get('/qam/qamViewCategoryDetail', isQAM, qamController.getCategoryDetail);
router.post('/qam/qamViewCategoryDetail', isQAM, qamController.getCategoryDetail);
router.get('/qam/qamDeleteCategory', isQAM, qamController.deleteCategory);

router.get('/qam/viewLastestIdeas', isQAM, qamController.viewLastestIdeas);
router.post('/qam/viewLastestIdeas', isQAM, qamController.viewLastestIdeas);
router.get('/qam/qamEditCategory', isQAM, qamController.editCategory);
router.post('/qam/doEditCategory', isQAM, qamController.updateCategory);
router.get('/qam/viewMostViewed', isQAM, qamController.getMostViewed);
router.post('/qam/viewMostViewed', isQAM, qamController.getMostViewed);
router.get('/qam/downloadZip', isQAM, qamController.downloadZip);
router.get('/qam/downloadCSV', isQAM, qamController.downloadCSV);

router.get('/qam/numberOfIdeasByYear', isQAM, qamController.numberOfIdeasByYear);
router.post('/qam/numberOfIdeasByYear', isQAM, qamController.numberOfIdeasByYear);
router.get('/qam/numberOfIdeasByYear2', isQAM, qamController.numberOfIdeasByYear2);
router.post('/qam/numberOfIdeasByYear2', isQAM, qamController.numberOfIdeasByYear2);
router.get('/qam/numberOfPeople', isQAM, qamController.numberOfPeople);

router.get('/qam/changePassword', isQAM, qamController.changePassword)
router.post('/qam/doChangePassword', isQAM, qamController.doChangePassword)

router.post('/qam/qamSearchCategory', isQAM, qamController.searchCategory);
module.exports = router;