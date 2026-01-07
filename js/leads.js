// Leads Module - CRUD Operations for Leads

const LeadsModule = {
    // Fetch all leads
    async fetchAll() {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        return { data: data || [], error };
    },

    // Fetch a single lead by ID
    async fetchById(id) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('id', id)
            .single();

        return { data, error };
    },

    // Add a new lead (created_at is set automatically)
    async add(leadData) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        const now = new Date().toISOString();
        const newLead = {
            ...leadData,
            created_at: now,
            updated_at: now
        };

        const { data, error } = await supabase
            .from('leads')
            .insert([newLead])
            .select()
            .single();

        return { data, error };
    },

    // Update an existing lead (updated_at is set automatically)
    async update(id, leadData) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        const updatedLead = {
            ...leadData,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('leads')
            .update(updatedLead)
            .eq('id', id)
            .select()
            .single();

        return { data, error };
    },

    // Delete a lead
    async delete(id) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { error: 'Supabase not initialized' };

        // First delete associated followups
        await supabase
            .from('followups')
            .delete()
            .eq('lead_id', id);

        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        return { error };
    },

    // Update lead status
    async updateStatus(id, status) {
        return this.update(id, { status });
    },

    // Search leads by name, email, or phone
    async search(query) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        return { data: data || [], error };
    },

    // Filter leads by status
    async filterByStatus(status) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        let query = supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        return { data: data || [], error };
    },

    // Get lead count by status
    async getCountsByStatus() {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: {}, error: 'Supabase not initialized' };

        const { data, error } = await supabase
            .from('leads')
            .select('status');

        if (error) return { data: {}, error };

        const counts = {
            total: data.length,
            new: 0,
            contacted: 0,
            'follow up': 0,
            interested: 0,
            qualified: 0,
            converted: 0,
            lost: 0
        };

        data.forEach(lead => {
            const status = (lead.status || 'new').toLowerCase();
            if (counts.hasOwnProperty(status)) {
                counts[status]++;
            }
        });

        return { data: counts, error: null };
    }
};

// Export for global access
window.LeadsModule = LeadsModule;
