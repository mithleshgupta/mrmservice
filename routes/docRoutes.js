const express = require('express');
const DocController = require('../controllers/docController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../utils/docmulter'); 
const docController = new DocController();

const docrouter = express.Router();

docrouter.get('/document-types', authMiddleware, docController.getDocumentTypes.bind(docController));
docrouter.post(
    '/documents',
    authMiddleware,
    upload.array('files'),
    docController.createDocument.bind(docController)
);

module.exports = docrouter;