const { Customer } = require('../models/');

exports.getAllCustomers = async (req, res) => {
  try {
    const Customers = await Customer.findAll();
    res.status(200).json(Customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const Customer = await Customer.findByPk(req.params.id);
    res.status(200).json(Customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const Customer = await Customer.create(req.body);
    res.status(201).json(Customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const Customer = await Customer.findByPk(req.params.id);
    if (!Customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    await Customer.update(req.body);
    res.status(200).json(Customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const Customer = await Customer.findByPk(req.params.id);
    if (!Customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    await Customer.destroy();
    res.status(200).json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
