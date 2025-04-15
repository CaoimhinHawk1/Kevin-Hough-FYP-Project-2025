// backend/src/models/index.js
const Customer = require('./customerModel');
const Event = require('./eventModel');
const Item = require('./itemModel');
const User = require('./userModel');

// Set up associations
Event.belongsTo(Customer);
Customer.hasMany(Event);

Event.belongsToMany(Item, { through: 'EventItems' });
Item.belongsToMany(Event, { through: 'EventItems' });

module.exports = {
  Customer,
  Event,
  Item,
  User
};