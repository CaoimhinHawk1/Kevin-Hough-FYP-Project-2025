const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Customer = require('./customerModel');
const Item = require('./itemModel');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'  // Map to column name in database
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name'  // Map to column name in database
  },
  customerId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'customer'  // Map to column name in database
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'  // Map to column name in database
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'startDate'  // Map to column name in database
  },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'endDate'  // Map to column name in database
    },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'location'  // Map to column name in database
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'createdAt'  // Map to column name in database
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updatedAt'  // Map to column name in database
  },
  marqueeIds: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'marqueeIds'  // Map to column name in database
  },
  trailerIds: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'trailerIds'  // Map to column name in database
  },
  portalooIds: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'portalooIds'  // Map to column name in database
  },
  task: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'tasks'  // Map to column name in database
  },
}, {
  tableName: 'Event',  // Explicitly set table name
  timestamps: false  // Disable automatic timestamp fields if not in schema
});
// Define associations


module.exports = Event;
