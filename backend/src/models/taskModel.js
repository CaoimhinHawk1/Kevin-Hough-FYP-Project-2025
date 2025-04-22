// backend/src/models/taskModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Determine if we're using SQLite (for mock data) or PostgreSQL
const isSQLite = sequelize.options.dialect === 'sqlite';

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    type: {
        // Use ENUM for PostgreSQL, STRING for SQLite
        type: isSQLite
            ? DataTypes.STRING
            : DataTypes.ENUM('marquee', 'toilet', 'equipment', 'vehicle', 'general'),
        defaultValue: 'general',
        allowNull: false,
    },
    status: {
        // Use ENUM for PostgreSQL, STRING for SQLite
        type: isSQLite
            ? DataTypes.STRING
            : DataTypes.ENUM('pending', 'in_progress', 'completed', 'delayed'),
        defaultValue: 'pending',
        allowNull: false,
    },
    priority: {
        // Use ENUM for PostgreSQL, STRING for SQLite
        type: isSQLite
            ? DataTypes.STRING
            : DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
        allowNull: false,
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    // For array fields, store as JSON string in SQLite and as ARRAY in PostgreSQL
    assignedTo: {
        type: isSQLite
            ? DataTypes.TEXT  // Will store JSON string
            : DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: isSQLite ? '[]' : [],
        get() {
            const value = this.getDataValue('assignedTo');
            // Parse the JSON string if SQLite
            return isSQLite && value ? JSON.parse(value) : value;
        },
        set(val) {
            // Stringify the array if SQLite
            this.setDataValue('assignedTo', isSQLite ? JSON.stringify(val) : val);
        }
    },
    relatedItems: {
        type: isSQLite
            ? DataTypes.TEXT  // Will store JSON string
            : DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: isSQLite ? '[]' : [],
        get() {
            const value = this.getDataValue('relatedItems');
            // Parse the JSON string if SQLite
            return isSQLite && value ? JSON.parse(value) : value;
        },
        set(val) {
            // Stringify the array if SQLite
            this.setDataValue('relatedItems', isSQLite ? JSON.stringify(val) : val);
        }
    },
    eventName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    completedBy: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

module.exports = Task;