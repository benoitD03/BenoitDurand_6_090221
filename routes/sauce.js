const express =  require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const sauceController = require('../controllers/sauce');

router.post('/', auth, sauceController.createSauce);
router.get('/', auth, sauceController.getAllSauces);

module.exports = router;