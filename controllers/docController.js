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

    async getDocumentsByTypeId(req, res) {
        try {
            const user_id = req.user.id;
            const type_id = req.params.type_id;
            const documents = await this.docService.getDocumentsByTypeId(type_id, user_id);
            res.status(200).json(documents);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteDocument(req, res) {
        try {
            const document_id = req.params.id;
            const user_id = req.user.id;
            const result = await this.docService.softDeleteDocument(document_id, user_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getLedger(req, res) {
        try {
            const user_id = req.user.id;
            const ledger = await this.docService.getLedger(user_id);
            res.status(200).json(ledger);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getUserProfile(req, res) {
        try {
            const user_id = req.user.id;
            const profile = await this.docService.getUserProfile(user_id);
            if (!profile) {
                return res.status(404).json({ message: 'User not found.' });
            }
            res.status(200).json(profile);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async searchDocuments(req, res) {
        try {
            const { q } = req.query; 
            if (!q) return res.status(400).json({ success: false, message: "Query is required" });

            const results = await this.docService.searchDocumentsByName(q, req.user.id);
            res.json({ success: true, documents: results });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = DocController;