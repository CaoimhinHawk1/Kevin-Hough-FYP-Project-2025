// backend/src/models/inventoryItemModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InventoryItem = sequelize.define('InventoryItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 0
        }
    },
    available: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 0
        }
    },
    condition: {
        type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'needs-repair'),
        allowNull: false,
        defaultValue: 'good'
    },
    lastMaintenance: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    nextMaintenance: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
    hooks: {
        beforeValidate: (item) => {
            // Ensure available items doesn't exceed total quantity
            if (item.available > item.quantity) {
                item.available = item.quantity;
            }
        }
    }
});

module.exports = InventoryItem;