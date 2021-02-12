const express =  require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const sauceController = require('../controllers/sauce');
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, sauceController.createSauce);
router.get('/', auth, sauceController.getAllSauces);
router.get('/:id', auth, sauceController.getOneSauce);
router.put('/:id', auth, sauceController.modifySauce);
router.delete('/:id', auth, sauceController.deleteSauce);

module.exports = router;