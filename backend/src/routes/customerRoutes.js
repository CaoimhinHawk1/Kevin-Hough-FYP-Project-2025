const express = require('express');
const attendeeController = require('../controllers/customerController');

const router = express.Router();

router.get('/', attendeeController.getAllCustomers);
router.get('/:id', attendeeController.getCustomer);
router.post('/', attendeeController.createCustomer);
router.put('/:id', attendeeController.updateCustomer);
router.delete('/:id', attendeeController.deleteCustomer);

module.exports = router;
