// backend/src/repositories/inventory.repository.js
const prisma = require('../services/prisma.service');

class InventoryRepository {
    /**
     * Get all inventory items with optional filters
     * @param {Object} filters - Query filters
     */
    async findAll(filters = {}) {
        console.log('InventoryRepository.findAll called with filters:', filters);

        try {
            // Build query options
            const where = {};

            // Apply type filter
            if (filters.type && filters.type !== 'all') {
                where.type = filters.type;
            }

            // Apply condition filter
            if (filters.condition && filters.condition !== 'all') {
                where.condition = filters.condition;
            }

            // Apply search filter
            if (filters.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { location: { contains: filters.search, mode: 'insensitive' } },
                    { notes: { contains: filters.search, mode: 'insensitive' } }
                ];
            }

            // Apply maintenance filter
            if (filters.maintenance === 'upcoming') {
                const today = new Date();
                const thirtyDaysLater = new Date();
                thirtyDaysLater.setDate(today.getDate() + 30);

                where.OR = [
                    {
                        nextMaintenance: {
                            gte: today,
                            lte: thirtyDaysLater
                        }
                    }
                ];
            } else if (filters.maintenance === 'overdue') {
                const today = new Date();
                where.nextMaintenance = {
                    lt: today
                };
            } else if (filters.maintenance === 'needs-repair') {
                where.condition = 'needs-repair';
            }

            console.log('Executing Prisma query with where:', where);

            // Execute query with pagination if provided
            const items = await prisma.inventoryItem.findMany({
                where,
                orderBy: filters.orderBy ? { [filters.orderBy]: filters.orderDirection || 'asc' } : { updatedAt: 'desc' },
                skip: filters.skip || undefined,
                take: filters.take || undefined
            });

            console.log(`Retrieved ${items.length} inventory items`);
            return items;
        } catch (error) {
            console.error('Error in InventoryRepository.findAll:', error);
            throw error;
        }
    }

    /**
     * Get inventory item by ID
     * @param {string} id - Item ID
     */
    async findById(id) {
        console.log(`InventoryRepository.findById called with id: ${id}`);

        try {
            const item = await prisma.inventoryItem.findUnique({
                where: { id }
            });

            if (!item) {
                console.log(`No inventory item found with id: ${id}`);
                return null;
            }

            console.log(`Found inventory item with id: ${id}`);
            return item;
        } catch (error) {
            console.error(`Error in InventoryRepository.findById for id ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create a new inventory item
     * @param {Object} data - Item data
     */
    async create(data) {
        console.log('InventoryRepository.create called with data:', JSON.stringify(data, null, 2));

        try {
            // Enforce available <= quantity
            if (data.available > data.quantity) {
                data.available = data.quantity;
            }

            // Convert date strings to Date objects if they exist
            if (data.lastMaintenance) {
                data.lastMaintenance = new Date(data.lastMaintenance);
            }

            if (data.nextMaintenance) {
                data.nextMaintenance = new Date(data.nextMaintenance);
            }

            const item = await prisma.inventoryItem.create({
                data: {
                    name: data.name,
                    type: data.type,
                    quantity: data.quantity || 1,
                    available: data.available || data.quantity || 1,
                    condition: data.condition || 'good',
                    lastMaintenance: data.lastMaintenance || null,
                    nextMaintenance: data.nextMaintenance || null,
                    location: data.location || null,
                    notes: data.notes || null,
                    imageUrl: data.imageUrl || null
                }
            });

            console.log(`Created inventory item with id: ${item.id}`);
            return item;
        } catch (error) {
            console.error('Error in InventoryRepository.create:', error);
            throw error;
        }
    }

    /**
     * Update an inventory item
     * @param {string} id - Item ID
     * @param {Object} data - Updated item data
     */
    async update(id, data) {
        console.log(`InventoryRepository.update called for item ${id} with data:`, JSON.stringify(data, null, 2));

        try {
            // Enforce available <= quantity
            if (data.available > data.quantity) {
                data.available = data.quantity;
            }

            // Convert date strings to Date objects if they exist
            if (data.lastMaintenance) {
                data.lastMaintenance = new Date(data.lastMaintenance);
            }

            if (data.nextMaintenance) {
                data.nextMaintenance = new Date(data.nextMaintenance);
            }

            const item = await prisma.inventoryItem.update({
                where: { id },
                data: {
                    name: data.name,
                    type: data.type,
                    quantity: data.quantity,
                    available: data.available,
                    condition: data.condition,
                    lastMaintenance: data.lastMaintenance,
                    nextMaintenance: data.nextMaintenance,
                    location: data.location,
                    notes: data.notes,
                    imageUrl: data.imageUrl
                }
            });

            console.log(`Updated inventory item with id: ${item.id}`);
            return item;
        } catch (error) {
            console.error(`Error in InventoryRepository.update for item ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete an inventory item
     * @param {string} id - Item ID
     */
    async delete(id) {
        console.log(`InventoryRepository.delete called for item ${id}`);

        try {
            const item = await prisma.inventoryItem.delete({
                where: { id }
            });

            console.log(`Deleted inventory item with id: ${id}`);
            return item;
        } catch (error) {
            console.error(`Error in InventoryRepository.delete for item ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get inventory statistics
     */
    async getStats() {
        console.log('InventoryRepository.getStats called');

        try {
            // Get total counts by type
            const typeCounts = await prisma.$queryRaw`
        SELECT type, 
          SUM(quantity) as total_quantity, 
          SUM(available) as total_available
        FROM "InventoryItem"
        GROUP BY type
      `;

            // Count items needing maintenance
            const today = new Date();
            const thirtyDaysLater = new Date();
            thirtyDaysLater.setDate(today.getDate() + 30);

            const maintenanceCount = await prisma.inventoryItem.count({
                where: {
                    OR: [
                        { condition: 'needs-repair' },
                        { condition: 'poor' },
                        {
                            nextMaintenance: {
                                not: null,
                                lte: thirtyDaysLater
                            }
                        }
                    ]
                }
            });

            // Find next maintenance date
            const nextMaintenance = await prisma.inventoryItem.findFirst({
                where: {
                    nextMaintenance: {
                        not: null,
                        gte: today
                    }
                },
                orderBy: {
                    nextMaintenance: 'asc'
                },
                select: {
                    nextMaintenance: true
                }
            });

            // Calculate utilization rate
            const totals = await prisma.inventoryItem.aggregate({
                _sum: {
                    quantity: true,
                    available: true
                }
            });

            const totalQuantity = totals._sum.quantity || 0;
            const totalAvailable = totals._sum.available || 0;
            const utilizationRate = totalQuantity > 0
                ? Math.round(((totalQuantity - totalAvailable) / totalQuantity) * 100)
                : 0;

            // Format type counts
            const formattedTypeCounts = {};
            typeCounts.forEach(type => {
                formattedTypeCounts[type.type] = {
                    total: Number(type.total_quantity),
                    available: Number(type.total_available)
                };
            });

            console.log('Inventory stats retrieved successfully');

            return {
                byType: formattedTypeCounts,
                maintenanceCount,
                nextMaintenanceDate: nextMaintenance?.nextMaintenance || null,
                utilizationRate
            };
        } catch (error) {
            console.error('Error in InventoryRepository.getStats:', error);
            throw error;
        }
    }
}

module.exports = new InventoryRepository();