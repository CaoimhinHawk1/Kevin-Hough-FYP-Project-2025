const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Customer = require('./customerModel');
const Item = require('./itemModel');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define associations
Event.belongsToMany(Customer, { through: 'EventCustomers' });
Event.belongsToMany(Item, { through: 'EventItem' });

module.exports = Event;
