const { success, error, paginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');
exports.uploadImage = async (req, res) => { if (!req.file) return res.status(400).json(error('No image')); return res.json(success('Uploaded', { url: '/uploads/' + req.file.filename, filename: req.file.filename })); };
