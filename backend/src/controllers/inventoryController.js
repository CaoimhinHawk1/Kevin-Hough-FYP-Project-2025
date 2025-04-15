// backend/src/controllers/inventoryController.js
const { InventoryItem } = require('../models');
const { ApiError } = require('../middleware/error-handler');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Controller for handling inventory item operations
 */
class InventoryController {
  /**
   * Get all inventory items with filtering options
   */
  async getAllItems(req, res, next) {
    try {
      const { type, condition, search } = req.query;

      // Build query options
      const queryOptions = {
        where: {},
        order: [['updatedAt', 'DESC']]
      };

      // Apply type filter
      if (type && type !== 'all') {
        queryOptions.where.type = type;
      }

      // Apply condition filter
      if (condition && condition !== 'all') {
        queryOptions.where.condition = condition;
      }

      // Apply search filter
      if (search) {
        queryOptions.where = {
          ...queryOptions.where,
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { location: { [Op.iLike]: `%${search}%` } },
            { notes: { [Op.iLike]: `%${search}%` } }
          ]
        };
      }

      const items = await InventoryItem.findAll(queryOptions);
      return res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single inventory item by ID
   */
  async getItemById(req, res, next) {
    try {
      const item = await InventoryItem.findByPk(req.params.id);

      if (!item) {
        throw ApiError.notFound(`Inventory item with ID ${req.params.id} not found`);
      }

      return res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new inventory item
   */
  async createItem(req, res, next) {
    try {
      const {
        name,
        type,
        quantity,
        available,
        condition,
        lastMaintenance,
        nextMaintenance,
        location,
        notes,
        imageUrl
      } = req.body;

      // Validate required fields
      if (!name || !type) {
        throw ApiError.badRequest('Name and type are required fields');
      }

      // Create the item
      const item = await InventoryItem.create({
        name,
        type,
        quantity: quantity || 1,
        available: available !== undefined ? available : quantity || 1,
        condition: condition || 'good',
        lastMaintenance: lastMaintenance || null,
        nextMaintenance: nextMaintenance || null,
        location: location || null,
        notes: notes || null,
        imageUrl: imageUrl || null
      });

      return res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing inventory item
   */
  async updateItem(req, res, next) {
    try {
      const item = await InventoryItem.findByPk(req.params.id);

      if (!item) {
        throw ApiError.notFound(`Inventory item with ID ${req.params.id} not found`);
      }

      const {
        name,
        type,
        quantity,
        available,
        condition,
        lastMaintenance,
        nextMaintenance,
        location,
        notes,
        imageUrl
      } = req.body;

      // Update the item
      await item.update({
        name: name !== undefined ? name : item.name,
        type: type !== undefined ? type : item.type,
        quantity: quantity !== undefined ? quantity : item.quantity,
        available: available !== undefined ? available : item.available,
        condition: condition !== undefined ? condition : item.condition,
        lastMaintenance: lastMaintenance !== undefined ? lastMaintenance : item.lastMaintenance,
        nextMaintenance: nextMaintenance !== undefined ? nextMaintenance : item.nextMaintenance,
        location: location !== undefined ? location : item.location,
        notes: notes !== undefined ? notes : item.notes,
        imageUrl: imageUrl !== undefined ? imageUrl : item.imageUrl
      });

      // Fetch the updated item
      const updatedItem = await InventoryItem.findByPk(req.params.id);
      return res.status(200).json(updatedItem);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an inventory item
   */
  async deleteItem(req, res, next) {
    try {
      const item = await InventoryItem.findByPk(req.params.id);

      if (!item) {
        throw ApiError.notFound(`Inventory item with ID ${req.params.id} not found`);
      }

      await item.destroy();
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats(req, res, next) {
    try {
      // Total items by type
      const itemsByType = await InventoryItem.findAll({
        attributes: [
          'type',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
          [sequelize.fn('SUM', sequelize.col('available')), 'totalAvailable']
        ],
        group: ['type']
      });

      // Items needing maintenance
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);

      const maintenanceItems = await InventoryItem.count({
        where: {
          [Op.or]: [
            { condition: 'needs-repair' },
            { condition: 'poor' },
            {
              nextMaintenance: {
                [Op.and]: [
                  { [Op.ne]: null },
                  { [Op.lte]: thirtyDaysLater }
                ]
              }
            }
          ]
        }
      });

      // Next upcoming maintenance
      const nextMaintenance = await InventoryItem.findOne({
        where: {
          nextMaintenance: {
            [Op.and]: [
              { [Op.ne]: null },
              { [Op.gte]: today }
            ]
          }
        },
        order: [['nextMaintenance', 'ASC']],
        attributes: ['nextMaintenance']
      });

      // Calculate utilization rate
      const totalItems = await InventoryItem.sum('quantity');
      const availableItems = await InventoryItem.sum('available');
      const utilizationRate = totalItems > 0
          ? Math.round(((totalItems - availableItems) / totalItems) * 100)
          : 0;

      return res.status(200).json({
        itemsByType,
        maintenanceCount: maintenanceItems,
        nextMaintenanceDate: nextMaintenance ? nextMaintenance.nextMaintenance : null,
        utilizationRate
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();