const File = require('../models/File');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// File upload
exports.uploadFile = async (req, res) => {
  const { userId } = req.user;  // From JWT middleware
  const file = req.file;

  const encrypted_url = crypto.createHash('sha256').update(file.filename).digest('hex');
  const newFile = new File({
    file_name: file.originalname,
    file_type: file.mimetype,
    uploaded_by: userId,
    encrypted_url
  });

  await newFile.save();
  res.json({ message: 'File uploaded successfully', file: newFile });
};

// List uploaded files
exports.listFiles = async (req, res) => {
  const { userId } = req.user;  // From JWT middleware
  const files = await File.find({ uploaded_by: userId });
  res.json({ files });
};

// Download file
exports.downloadFile = async (req, res) => {
  const { file_id } = req.params;
  const file = await File.findById(file_id);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  const filePath = path.join(__dirname, '../uploads', file.file_name);
  res.download(filePath);
};
