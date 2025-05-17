const supabase = require('../services/supabaseClientservice');

class DocService {
    async getDocumentTypes() {
        const { data, error } = await supabase
            .from('document_types')
            .select('id, name');
        if (error) throw new Error(error.message);
        return data;
    }

    async createDocumentWithMedia({
        user_id,
        type_id,
        name,
        date,
        keywords,
        notes,
        files
    }) {

        if (typeof keywords === 'string') {
            try {
                keywords = JSON.parse(keywords);
            } catch (e) {

                keywords = keywords.split(',').map(k => k.trim());
            }
        }

        const { data: docData, error: docError } = await supabase
            .from('documents')
            .insert([{ user_id, type_id, name, date, keywords, notes }])
            .select('id')
            .single();

        if (docError) throw new Error(docError.message);

        for (const file of files) {
            const fileName = `${Date.now()}_${file.originalname}`;
            const { error: storageError } = await supabase.storage
                .from('documents')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                });
            if (storageError) throw new Error(storageError.message);

            const { data: publicUrlData } = supabase
                .storage
                .from('documents')
                .getPublicUrl(fileName);

            const file_url = publicUrlData.publicUrl;

            const { error: mediaError } = await supabase
                .from('document_media')
                .insert([{ document_id: docData.id, user_id, type_id, file_url }]);
            if (mediaError) throw new Error(mediaError.message);
        }

        return { message: 'Document and all media saved successfully.' };
    }
}

module.exports = DocService;