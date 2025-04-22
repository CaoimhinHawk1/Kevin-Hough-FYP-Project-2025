const { Event, Customer, InventoryItem } = require('../models/');
const DbService = require('../services/db.service');
const { ApiError } = require('../middleware/error-handler');

/**
 * Get all events with optional filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllEvents = async (req, res, next) => {
  try {
    const events ={
      include: [Customer, InventoryItem],
      order: [['startDate', 'ASC']]  // or whatever your date field is
    };

    res.status(200).json(events);
  } catch (err) {
    console.error('Error in getAllEvents:', err);
    next(err);
  }
};

/**
 * Get a single event by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getEvent = async (req, res, next) => {
  try {
    const event = await DbService.findByIdOrFail(Event, req.params.id, {
      include: [Customer, Item]
    });

    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createEvent = async (req, res, next) => {
  try {
    const { customerIds, itemIds, ...eventData } = req.body;

    // Validate required fields
    if (!eventData.name || !eventData.date || !eventData.location) {
      throw ApiError.badRequest('Name, date, and location are required fields');
    }

    // Create event with associations
    const event = await DbService.createEventWithRelations(
        eventData,
        customerIds,
        itemIds
    );

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customerIds, itemIds, ...eventData } = req.body;

    // Update event with associations
    const event = await DbService.updateEventWithRelations(
        id,
        eventData,
        customerIds,
        itemIds
    );

    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await DbService.findByIdOrFail(Event, req.params.id);

    await DbService.transaction(async (transaction) => {

      await event.destroy({ transaction });
    });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};