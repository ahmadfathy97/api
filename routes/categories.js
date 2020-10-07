// انا نعسان وزهقت من الشغل عليه
// لما نيجي نرجع الصور المفروض نرجعها بالطريقة دي
// req.hostname + port category_pic

// ياه ذكريات والله ♥♥♥
// ♥♥♥♥♥  ☺☺☺ ♥♥♥♥♥

const express = require('express');
const router = express.Router();

const verify = require('../middlewares/verifyToken');
const uploadImages = require('../middlewares/uploadFile');
let categoriesController = require('../controllers/categoriesController');

router.get('/', verify, categoriesController.AllCategories);

router.get('/:name', verify, categoriesController.SpecificCategory);

router.post('/', verify, uploadImages.single('pic'), categoriesController.AddCategory);

router.put('/:id', verify, categoriesController.EditCategoty);

router.delete('/:id', verify, categoriesController.DeletCategory);

module.exports = router;
