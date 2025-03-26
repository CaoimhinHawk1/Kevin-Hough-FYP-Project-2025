const express = require('express');
const resourceController = require('../controllers/itemController');

const router = express.Router();

router.get('/', resourceController.getAllItems);
router.get('/:id', resourceController.getItem);
router.post('/', resourceController.createItem);
router.put('/:id', resourceController.updateItem);
router.delete('/:id', resourceController.deleteItem);

module.exports = router;
