// Pipeline Stages Module - CRUD Operations for Stages

const StagesModule = {
    // Shared cache for stages to reduce DB reads
    _stages: null,

    // Fetch all stages
    async fetchAll(forceRefresh = false) {
        if (this._stages && !forceRefresh) {
            return { data: this._stages, error: null };
        }

        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        const { data, error } = await supabase
            .from('pipeline_stages')
            .select('*')
            .order('list_order', { ascending: true });

        if (!error && data) {
            this._stages = data;
        }

        return { data: data || [], error };
    },

    // Fetch a single stage by ID
    async fetchById(id) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        const { data, error } = await supabase
            .from('pipeline_stages')
            .select('*')
            .eq('id', id)
            .single();

        return { data, error };
    },

    // Add a new stage
    async add(stageData) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        const { data, error } = await supabase
            .from('pipeline_stages')
            .insert([stageData])
            .select()
            .single();

        if (!error) {
            this._stages = null; // Invalidate cache
        }
        return { data, error };
    },

    // Update an existing stage
    async update(id, stageData) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        const { data, error } = await supabase
            .from('pipeline_stages')
            .update(stageData)
            .eq('id', id)
            .select()
            .single();

        if (!error) {
            this._stages = null; // Invalidate cache
        }
        return { data, error };
    },

    // Delete a stage
    async delete(id) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { error: 'Supabase not initialized' };

        const { error } = await supabase
            .from('pipeline_stages')
            .delete()
            .eq('id', id);

        if (!error) {
            this._stages = null; // Invalidate cache
        }
        return { error };
    },

    // Update the list_order of multiple stages for sorting
    async reorder(orderedIds) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { error: 'Supabase not initialized' };

        let hasError = false;

        // Use Promise.all to run them concurrently for speed
        const updates = orderedIds.map((id, index) => {
            return supabase
                .from('pipeline_stages')
                .update({ list_order: index })
                .eq('id', id);
        });

        const results = await Promise.all(updates);

        for (const res of results) {
            if (res.error) {
                console.error('Error updating order:', res.error);
                hasError = true;
            }
        }

        this._stages = null; // Invalidate cache
        return { error: hasError ? 'Error updating order' : null };
    }
};

// Export for global access
window.StagesModule = StagesModule;
