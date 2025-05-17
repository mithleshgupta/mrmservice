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
            const result = await this.docService.createDocumentWithMedia({
                ...req.body,
                files: req.files
            });
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = DocController;