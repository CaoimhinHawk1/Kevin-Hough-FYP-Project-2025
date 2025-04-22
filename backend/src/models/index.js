// backend/src/models/index.js
const Customer = require('./customerModel');
const Event = require('./eventModel');
const Item = require('./itemModel');
const InventoryItem = require('./inventoryItemModel');
const User = require('./userModel');
const Task = require('./taskModel');

// Set up associations
Event.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Event, { foreignKey: 'customerId', as: 'events' });

Event.belongsToMany(InventoryItem, { through: 'EventItem' });
InventoryItem.belongsToMany(Event, { through: 'EventItems' });

Task.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(Task, { foreignKey: 'eventId', as: 'tasks' });

module.exports = {
  Customer,
  Event,
  InventoryItem,
  User,
  Task
};