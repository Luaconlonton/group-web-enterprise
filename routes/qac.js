const express = require('express');
const router = express.Router();
const qacController = require('../controller/qac');

router.get('/qac', qacController.getQAC);
router.get('/qac/viewLastestComment', qacController.viewLastestComment);
router.get('/qac/mostViewedIdeas', qacController.mostViewIdeas);
router.get('/qac/viewMostComments', qacController.viewMostComments);
router.get('/qac/viewLastestIdeas', qacController.viewLastestIdeas);

router.post('/qac/viewLastestIdeas', qacController.filterLastestIdeas);
router.post('/qac/mostViewedIdeas', qacController.filterMostViewIdeas);
router.post('/qac/viewLastestComment', qacController.filterLastestComment);
router.post('/qac/viewMostComments', qacController.filterMostComments);

router.get('/qac/changePassword', qacController.changePassword);
router.post('/qac/doChangePassword', qacController.doChangePassword);
module.exports = router;