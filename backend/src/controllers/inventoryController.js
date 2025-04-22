// backend/src/controllers/inventoryController.js
const inventoryRepository = require('../repository/inventoryRepository');
const { ApiError } = require('../middleware/error-handler');

/**
 * Get all inventory items with filtering options
 */
exports.getAllItems = async (req, res, next) => {
  console.log('InventoryController.getAllItems called with query:', req.query);

  try {
    // Build filter object from query parameters
    const filters = {
      type: req.query.type,
      condition: req.query.condition,
      search: req.query.search,
      maintenance: req.query.maintenance,
      orderBy: req.query.orderBy,
      orderDirection: req.query.orderDirection,
      skip: req.query.skip ? parseInt(req.query.skip) : undefined,
      take: req.query.take ? parseInt(req.query.take) : undefined
    };

    const items = await inventoryRepository.findAll(filters);
    console.log(`Retrieved ${items.length} inventory items successfully`);

    res.status(200).json(items);
  } catch (err) {
    console.error('Error in InventoryController.getAllItems:', err);
    next(err);
  }
};

/**
 * Get a single inventory item by ID
 */
exports.getItemById = async (req, res, next) => {
  const itemId = req.params.id;
  console.log(`InventoryController.getItemById called for item ID: ${itemId}`);

  try {
    const item = await inventoryRepository.findById(itemId);

    if (!item) {
      console.log(`Inventory item with ID ${itemId} not found`);
      return next(ApiError.notFound(`Inventory item with ID ${itemId} not found`));
    }

    console.log(`Inventory item ${itemId} retrieved successfully`);
    res.status(200).json(item);
  } catch (err) {
    console.error(`Error in InventoryController.getItemById for item ${itemId}:`, err);
    next(err);
  }
};

/**
 * Create a new inventory item
 */
exports.createItem = async (req, res, next) => {
  console.log('InventoryController.createItem called with body:', JSON.stringify(req.body, null, 2));

  try {
    // Validate required fields
    if (!req.body.name || !req.body.type) {
      console.log('Missing required fields: name and type must be provided');
      return next(ApiError.badRequest('Name and type are required fields'));
    }

    // Create the item
    const item = await inventoryRepository.create(req.body);

    console.log(`Inventory item created successfully with ID: ${item.id}`);
    res.status(201).json(item);
  } catch (err) {
    console.error('Error in InventoryController.createItem:', err);
    next(err);
  }
};

/**
 * Update an existing inventory item
 */
exports.updateItem = async (req, res, next) => {
  const itemId = req.params.id;
  console.log(`InventoryController.updateItem called for item ID: ${itemId}`);
  console.log('Update data:', JSON.stringify(req.body, null, 2));

  try {
    // Check if item exists
    const existingItem = await inventoryRepository.findById(itemId);

    if (!existingItem) {
      console.log(`Inventory item with ID ${itemId} not found`);
      return next(ApiError.notFound(`Inventory item with ID ${itemId} not found`));
    }

    // Update the item
    const updatedItem = await inventoryRepository.update(itemId, req.body);

    console.log(`Inventory item ${itemId} updated successfully`);
    res.status(200).json(updatedItem);
  } catch (err) {
    console.error(`Error in InventoryController.updateItem for item ${itemId}:`, err);
    next(err);
  }
};

/**
 * Delete an inventory item
 */
exports.deleteItem = async (req, res, next) => {
  const itemId = req.params.id;
  console.log(`InventoryController.deleteItem called for item ID: ${itemId}`);

  try {
    // Check if item exists
    const existingItem = await inventoryRepository.findById(itemId);

    if (!existingItem) {
      console.log(`Inventory item with ID ${itemId} not found`);
      return next(ApiError.notFound(`Inventory item with ID ${itemId} not found`));
    }

    // Delete the item
    await inventoryRepository.delete(itemId);

    console.log(`Inventory item ${itemId} deleted successfully`);
    res.status(204).send();
  } catch (err) {
    console.error(`Error in InventoryController.deleteItem for item ${itemId}:`, err);
    next(err);
  }
};

/**
 * Get inventory statistics
 */
exports.getInventoryStats = async (req, res, next) => {
  console.log('InventoryController.getInventoryStats called');

  try {
    const stats = await inventoryRepository.getStats();
    console.log('Inventory statistics retrieved successfully');
    res.status(200).json(stats);
  } catch (err) {
    console.error('Error in InventoryController.getInventoryStats:', err);
    next(err);
  }
};