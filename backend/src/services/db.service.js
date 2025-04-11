const { Customer, Event, Item } = require('../models');
const { ApiError } = require('../middleware/error-handler');
const sequelize = require('../config/db');

/**
 * Database service with common operations
 */
class DbService {
    /**
     * Execute a database transaction
     * @param {Function} callback - Function to execute within transaction
     * @returns {Promise<any>} - Result of the callback
     */
    static async transaction(callback) {
        const t = await sequelize.transaction();

        try {
            const result = await callback(t);
            await t.commit();
            return result;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * Find a record by ID or throw a not found error
     * @param {Object} model - Sequelize model
     * @param {string} id - Record ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Found record
     */
    static async findByIdOrFail(model, id, options = {}) {
        const record = await model.findByPk(id, options);

        if (!record) {
            throw ApiError.notFound(`${model.name} with ID ${id} not found`);
        }

        return record;
    }

    /**
     * Create a new event with related customers and items
     * @param {Object} eventData - Event data
     * @param {Array<string>} customerIds - Customer IDs to associate
     * @param {Array<string>} itemIds - Item IDs to associate
     * @returns {Promise<Object>} - Created event with associations
     */
    static async createEventWithRelations(eventData, customerIds = [], itemIds = []) {
        return this.transaction(async (transaction) => {
            // Create the event
            const event = await Event.create(eventData, { transaction });

            // Associate customers if provided
            if (customerIds && customerIds.length > 0) {
                const customers = await Customer.findAll({
                    where: { id: customerIds },
                    transaction
                });

                if (customers.length !== customerIds.length) {
                    throw ApiError.badRequest('One or more customers not found');
                }

                await event.addCustomers(customers, { transaction });
            }

            // Associate items if provided
            if (itemIds && itemIds.length > 0) {
                const items = await Item.findAll({
                    where: { id: itemIds },
                    transaction
                });

                if (items.length !== itemIds.length) {
                    throw ApiError.badRequest('One or more items not found');
                }

                await event.addItems(items, { transaction });
            }

            // Fetch the event with its associations
            return Event.findByPk(event.id, {
                include: [Customer, Item],
                transaction
            });
        });
    }

    /**
     * Update an event with related customers and items
     * @param {string} id - Event ID
     * @param {Object} eventData - Updated event data
     * @param {Array<string>} customerIds - Customer IDs to associate
     * @param {Array<string>} itemIds - Item IDs to associate
     * @returns {Promise<Object>} - Updated event with associations
     */
    static async updateEventWithRelations(id, eventData, customerIds, itemIds) {
        return this.transaction(async (transaction) => {
            // Find the event
            const event = await this.findByIdOrFail(Event, id, { transaction });

            // Update event data
            await event.update(eventData, { transaction });

            // Update customer associations if provided
            if (customerIds) {
                const customers = await Customer.findAll({
                    where: { id: customerIds },
                    transaction
                });

                if (customers.length !== customerIds.length) {
                    throw ApiError.badRequest('One or more customers not found');
                }

                await event.setCustomers(customers, { transaction });
            }

            // Update item associations if provided
            if (itemIds) {
                const items = await Item.findAll({
                    where: { id: itemIds },
                    transaction
                });

                if (items.length !== itemIds.length) {
                    throw ApiError.badRequest('One or more items not found');
                }

                await event.setItems(items, { transaction });
            }

            // Fetch the updated event with its associations
            return Event.findByPk(event.id, {
                include: [Customer, Item],
                transaction
            });
        });
    }
}

module.exports = DbService;