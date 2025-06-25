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
docrouter.get(
    '/user-documents',
    authMiddleware,
    docController.getUserDocuments.bind(docController)
);
docrouter.put(
    '/documents/:id',
    authMiddleware,
    upload.array('files'),
    docController.updateDocument.bind(docController)
);

docrouter.get(
    '/documents/search',
    authMiddleware,
    docController.searchDocuments.bind(docController)
);

docrouter.get(
    '/documents/:id',
    authMiddleware,
    docController.getDocumentById.bind(docController)
);
docrouter.get(
    '/documents/type/:type_id',
    authMiddleware,
    docController.getDocumentsByTypeId.bind(docController)
);
docrouter.delete(
    '/documents/:id',
    authMiddleware,
    docController.deleteDocument.bind(docController)
);
docrouter.get(
    '/ledger',
    authMiddleware,
    docController.getLedger.bind(docController)
);
docrouter.get(
    '/user/profile',
    authMiddleware,
    docController.getUserProfile.bind(docController)
);



module.exports = docrouter;