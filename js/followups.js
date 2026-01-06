// Followups Module - CRUD Operations for Follow-ups

const FollowupsModule = {
    // Fetch all followups with lead info
    async fetchAll() {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        const { data, error } = await supabase
            .from('followups')
            .select(`
                *,
                leads (id, name, email, phone, status)
            `)
            .order('followup_date', { ascending: true });

        return { data: data || [], error };
    },

    // Fetch followups for a specific lead
    async fetchByLeadId(leadId) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        const { data, error } = await supabase
            .from('followups')
            .select('*')
            .eq('lead_id', leadId)
            .order('followup_date', { ascending: true });

        return { data: data || [], error };
    },

    // Add a new followup (created_at is set automatically)
    async add(followupData) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        const now = new Date().toISOString();
        const newFollowup = {
            ...followupData,
            status: followupData.status || 'Pending',
            created_at: now,
            updated_at: now
        };

        const { data, error } = await supabase
            .from('followups')
            .insert([newFollowup])
            .select()
            .single();

        return { data, error };
    },

    // Update a followup
    async update(id, followupData) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        const updatedFollowup = {
            ...followupData,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('followups')
            .update(updatedFollowup)
            .eq('id', id)
            .select()
            .single();

        return { data, error };
    },

    // Mark followup as complete (completed_at is set automatically)
    async markComplete(id) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('followups')
            .update({
                status: 'Completed',
                completed_at: now,
                updated_at: now
            })
            .eq('id', id)
            .select()
            .single();

        return { data, error };
    },

    // Cancel a followup
    async cancel(id) {
        return this.update(id, { status: 'Cancelled' });
    },

    // Delete a followup
    async delete(id) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { error: 'Supabase not initialized' };

        const { error } = await supabase
            .from('followups')
            .delete()
            .eq('id', id);

        return { error };
    },

    // Get today's followups (including reminders based on reminder_days)
    async getTodaysReminders() {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // Get all pending followups
        const { data, error } = await supabase
            .from('followups')
            .select(`
                *,
                leads (id, name, email, phone, status)
            `)
            .eq('status', 'Pending')
            .order('followup_date', { ascending: true });

        if (error) return { data: [], error };

        // Filter for today's reminders
        const reminders = (data || []).filter(f => {
            const followupDate = new Date(f.followup_date);
            followupDate.setHours(0, 0, 0, 0);
            const reminderDays = f.reminder_days || 0;

            // Calculate reminder date
            const reminderDate = new Date(followupDate);
            reminderDate.setDate(reminderDate.getDate() - reminderDays);

            // Check if today is between reminder date and followup date
            return today >= reminderDate && today <= followupDate;
        });

        return { data: reminders, error: null };
    },

    // Get upcoming followups for next X days
    async getUpcoming(days = 7) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + days);
        const futureStr = futureDate.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('followups')
            .select(`
                *,
                leads (id, name, email, phone, status)
            `)
            .eq('status', 'Pending')
            .gte('followup_date', todayStr)
            .lte('followup_date', futureStr)
            .order('followup_date', { ascending: true });

        return { data: data || [], error };
    },

    // Get followups by priority
    async getByPriority(priority) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        let query = supabase
            .from('followups')
            .select(`
                *,
                leads (id, name, email, phone, status)
            `)
            .eq('status', 'Pending')
            .order('followup_date', { ascending: true });

        if (priority && priority !== 'all') {
            query = query.eq('priority', priority);
        }

        const { data, error } = await query;
        return { data: data || [], error };
    },

    // Get overdue followups
    async getOverdue() {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('followups')
            .select(`
                *,
                leads (id, name, email, phone, status)
            `)
            .eq('status', 'Pending')
            .lt('followup_date', todayStr)
            .order('followup_date', { ascending: true });

        return { data: data || [], error };
    },

    // Get stats for dashboard
    async getStats() {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) return { data: {}, error: 'Supabase not initialized' };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const { data: allFollowups, error } = await supabase
            .from('followups')
            .select('*');

        if (error) return { data: {}, error };

        const stats = {
            total: allFollowups.length,
            pending: 0,
            todayCount: 0,
            highPriority: 0,
            overdue: 0
        };

        allFollowups.forEach(f => {
            if (f.status === 'Pending') {
                stats.pending++;

                const fDate = f.followup_date.split('T')[0];
                if (fDate === todayStr) {
                    stats.todayCount++;
                }
                if (fDate < todayStr) {
                    stats.overdue++;
                }
                if (f.priority === 'High') {
                    stats.highPriority++;
                }
            }
        });

        return { data: stats, error: null };
    }
};

// Export for global access
window.FollowupsModule = FollowupsModule;
