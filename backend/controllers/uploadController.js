const { success, error } = require('../utils/apiResponse');
const logger = require('../utils/logger');

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json(error('No image file provided'));
  }
  const isCloudEphemeral = process.env.NODE_ENV === 'production' && !process.env.STORAGE_PERSISTENT;
  return res.json(success('File uploaded successfully', {
    url: '/uploads/' + req.file.filename,
    filename: req.file.filename,
    storageType: isCloudEphemeral ? 'ephemeral-local' : 'local-disk',
    note: isCloudEphemeral ? 'Notice: Running on ephemeral cloud storage. Files may not persist across service redeployments.' : undefined
  }));
};
