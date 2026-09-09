
const Notification = require('../models/Notification');

class NotificationService {
    async create(userId, { type, title, message, data, link }) {
        return await Notification.create({ user: userId, type, title, message, data, link });
    }

    async getUserNotifications(userId, query) {
        const filter = { user: userId };
        if (query.isRead !== undefined) filter.isRead = query.isRead;
        
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const data = await Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Notification.countDocuments(filter);
        return { data, total, page, limit };
    }

    async markAsRead(notificationId, userId) {
        return await Notification.findOneAndUpdate({ _id: notificationId, user: userId }, { isRead: true }, { new: true });
    }

    async markAllAsRead(userId) {
        return await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    }

    async getUnreadCount(userId) {
        return await Notification.countDocuments({ user: userId, isRead: false });
    }

    async createBulkForRegion(notificationData, state, district) {
        const User = require('../models/User');
        const farmers = await User.find({ state, district, role: 'farmer' });
        const ops = farmers.map(f => ({
            insertOne: {
                document: {
                    user: f._id,
                    ...notificationData
                }
            }
        }));
        if (ops.length > 0) {
            await Notification.bulkWrite(ops);
        }
    }
}
module.exports = new NotificationService();
