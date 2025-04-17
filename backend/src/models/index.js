// backend/src/models/index.js
const Customer = require('./customerModel');
const Event = require('./eventModel');
const Item = require('./itemModel');
const User = require('./userModel');
const Task = require('./taskModel');

// Set up associations
Event.belongsTo(Customer);
Customer.hasMany(Event);

Event.belongsToMany(Item, { through: 'EventItems' });
Item.belongsToMany(Event, { through: 'EventItems' });

Task.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(Task, { foreignKey: 'eventId', as: 'tasks' });

module.exports = {
  Customer,
  Event,
  Item,
  User,
  Task
};