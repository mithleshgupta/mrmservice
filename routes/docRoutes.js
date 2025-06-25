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
<<<<<<< HEAD
	'/documents/search',
	authMiddleware,
	docController.searchDocument.bind(docController)
);


=======
    '/documents/search',
    authMiddleware,
    docController.searchDocuments.bind(docController)
);

>>>>>>> 4881459abe1866c105671070aca3782292521dd0
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

<<<<<<< HEAD
=======

>>>>>>> 4881459abe1866c105671070aca3782292521dd0


module.exports = docrouter;
