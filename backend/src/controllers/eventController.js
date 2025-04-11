const { Event, Customer, Item } = require('../models/');
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
    const { startDate, endDate, status } = req.query;

    // Build query options
    const options = {
      include: [Customer, Item],
      order: [['date', 'ASC']]
    };

    // Add filters if provided
    if (startDate || endDate) {
      options.where = options.where || {};
      options.where.date = {};

      if (startDate) {
        options.where.date.$gte = new Date(startDate);
      }

      if (endDate) {
        options.where.date.$lte = new Date(endDate);
      }
    }

    if (status) {
      options.where = options.where || {};
      options.where.status = status;
    }

    const events = await Event.findAll(options);
    res.status(200).json(events);
  } catch (error) {
    next(error);
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
      // Remove associations first
      await event.setCustomers([], { transaction });
      await event.setItems([], { transaction });

      // Delete the event
      await event.destroy({ transaction });
    });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};