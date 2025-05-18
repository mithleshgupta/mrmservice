const DocService = require('../services/docServices');
const docService = new DocService();

class DocController {
    constructor() {
        this.docService = docService;
    }

    async getDocumentTypes(req, res) {
        try {
            const result = await this.docService.getDocumentTypes();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createDocument(req, res) {
        try {
            const user_id = req.user.id;
            const result = await this.docService.createDocumentWithMedia({
                ...req.body,
                user_id,
                files: req.files
            });
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getUserDocuments(req, res) {
        try {
            const user_id = req.user.id;
            console.log(`Fetching documents for user ID: ${user_id}`);
            if (!user_id) {
                return res.status(400).json({ message: 'User ID is required.' });
            }
            const documents = await this.docService.getDocumentsByUserId(user_id);
            res.status(200).json(documents);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateDocument(req, res) {
        try {
            const document_id = req.params.id;
            const user_id = req.user.id;
            const result = await this.docService.updateDocumentWithMedia({
                document_id,
                user_id,
                ...req.body,
                files: req.files
            });
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getDocumentById(req, res) {
        try {
            const document_id = req.params.id;
            const user_id = req.user.id;
            const document = await this.docService.getDocumentById(document_id, user_id);
            if (!document) {
                return res.status(404).json({ message: 'Document not found.' });
            }
            res.status(200).json(document);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = DocController;