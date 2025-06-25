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
            .eq('id', document_id)
            .eq('user_id', user_id);

        if (docError) throw new Error(docError.message);


        if (files && files.length > 0) {
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
                    .insert([{ document_id, user_id, type_id, file_url }]);
                if (mediaError) throw new Error(mediaError.message);
            }
        }

        return { message: 'Document and media updated successfully.' };
    }

    async getDocumentById(document_id, user_id) {
        const { data, error } = await supabase
            .from('documents')
            .select('*, document_media(*)')
            .eq('id', document_id)
            .eq('user_id', user_id)
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async softDeleteDocument(document_id, user_id) {

        const { error: docError } = await supabase
            .from('documents')
            .update({ is_deleted: true, updated_at: new Date().toISOString() })
            .eq('id', document_id)
            .eq('user_id', user_id);

        if (docError) throw new Error(docError.message);


        const { data: mediaFiles, error: mediaError } = await supabase
            .from('document_media')
            .select('*')
            .eq('document_id', document_id);

        if (mediaError) throw new Error(mediaError.message);


        for (const media of mediaFiles) {

            const fileName = media.file_url.split('/').pop();
            await supabase.storage.from('documents').remove([fileName]);
        }

        await supabase.from('document_media').delete().eq('document_id', document_id);

        return { message: 'Document marked as deleted and associated media removed.' };
    }

    async getLedger(user_id) {
        const { data, error } = await supabase
            .from('documents')
            .select('id, name, is_deleted, updated_at')
            .eq('user_id', user_id);

        if (error) throw new Error(error.message);

        return data.map(doc => ({
            id: doc.id,
            name: doc.name,
            status: doc.is_deleted ? 'deleted' : 'updated',
            time: doc.updated_at
        }));
    }

    async getUserProfile(user_id) {
        console.log("I AM HERE BRO +++++++++")
        const { data, error } = await supabase
            .from('users')
            .select('first_name, last_name, dob, blood_group, username, phone, gender').eq('id', user_id)
            .single();

        if (error) throw new Error(error.message);


        let age = null;
        if (data.dob) {
            const birthDate = new Date(data.dob);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

        return {
            name: `${data.first_name} ${data.last_name}`,
            age,
            blood_group: data.blood_group,
            username: data.username,
	    email: data.email,
	    phone: data.phone,
	    dob: data.dob,
	    gender : data.gender

        };
    }

    async searchDocumentsByName(query, userId) {
        const { data, error } = await supabase
            .from('documents')
            .select('id, name')
            .ilike('name', `%${query}%`)
            .eq('user_id', userId)
	    .eq('is_deleted',false);

        if (error) throw new Error(error.message);
        return data;
    }
}

module.exports = DocService;
