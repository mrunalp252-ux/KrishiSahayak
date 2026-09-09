const { success, error, paginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');
exports.getAll = async (req, res) => { try { const data = await notificationService.getUserNotifications(req.user._id, req.query); return res.json(success('Notifications', { data })); } catch (err) { return res.status(500).json(error(err.message)); } };
exports.getUnreadCount = async (req, res) => { try { const count = await notificationService.getUnreadCount(req.user._id); return res.json(success('Unread count', { count })); } catch (err) { return res.status(500).json(error(err.message)); } };
exports.markAsRead = async (req, res) => { try { await notificationService.markAsRead(req.params.id, req.user._id); return res.json(success('Marked as read')); } catch (err) { return res.status(500).json(error(err.message)); } };
exports.markAllAsRead = async (req, res) => { try { await notificationService.markAllAsRead(req.user._id); return res.json(success('All marked as read')); } catch (err) { return res.status(500).json(error(err.message)); } };
exports.delete = async (req, res) => { try { const Notification = require('../models/Notification'); await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id }); return res.json(success('Deleted')); } catch (err) { return res.status(500).json(error(err.message)); } };
