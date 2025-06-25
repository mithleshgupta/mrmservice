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

        let docData;
        try {
            const { data, error } = await supabase
                .from('documents')
                .insert([{ user_id, type_id, name, date, keywords, notes }])
                .select('id')
                .single();

            if (error) throw new Error(error.message);
            docData = data;
        } catch (err) {
            throw new Error(`Error uploading document: ${err.message}`);
        }

        for (const file of files) {
            try {
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
            } catch (err) {
                throw new Error(`Error uploading media file "${file.originalname}": ${err.message}`);
            }
        }

        return { message: 'Document and all media saved successfully.' };
    }

    async getDocumentsByUserId(user_id) {
        console.log('Fetching documents for user IN SERVICES:', user_id);
        if (!user_id) {
            throw new Error('User ID is required to fetch documents.');
        }
        const { data, error } = await supabase
            .from('documents')
            .select('*, document_media(*)')
            .eq('user_id', user_id)
            .eq('is_deleted', false);

        if (error) throw new Error(error.message);
        return data;
    }

    async getDocumentsByTypeId(type_id, user_id) {
        const { data, error } = await supabase
            .from('documents')
            .select('*, document_media(*)')
            .eq('type_id', type_id)
            .eq('user_id', user_id)
            .eq('is_deleted', false);
        if (error) throw new Error(error.message);
        return data;
    }

    async updateDocumentWithMedia({
        document_id,
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


        const { error: docError } = await supabase
            .from('documents')
            .update({
                type_id,
                name,
                date,
                keywords,
                notes,
                updated_at: new Date().toISOString()
            })
