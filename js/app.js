// Main Application Module - Shared utilities and helpers

const App = {
    // Format date for display
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    },

    // Format time for display
    formatTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    },

    // Format datetime for display
    formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Get relative time (e.g., "2 days ago", "in 3 days")
    getRelativeTime(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays > 0) return `In ${diffDays} days`;
        return `${Math.abs(diffDays)} days ago`;
    },

    // Get current date in YYYY-MM-DD format
    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    },

    // Get current time in HH:MM format
    getCurrentTime() {
        const now = new Date();
        return now.toTimeString().slice(0, 5);
    },

    // Show toast notification
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    },

    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠'
        };
        return icons[type] || icons.success;
    },

    // Open modal
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // Close modal when clicking outside
    setupModalClose(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modalId);
                }
            });
        }
    },

    // Generate badge HTML for priority
    getPriorityBadge(priority) {
        const p = (priority || 'Medium').toLowerCase();
        return `<span class="badge badge-${p}">${priority || 'Medium'}</span>`;
    },

    // Generate badge HTML for status
    getStatusBadge(status) {
        const s = (status || 'New').toLowerCase();
        return `<span class="badge badge-${s}">${status || 'New'}</span>`;
    },

    // Debounce function for search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Initialize Supabase and check configuration
    async init() {
        // Check if Supabase is configured
        if (!window.SupabaseConfig.isConfigured()) {
            console.warn('Supabase is not configured. Please update js/supabase.js with your credentials.');
            this.showConfigWarning();
            return false;
        }

        window.SupabaseConfig.init();
        return true;
    },

    // Show configuration warning
    showConfigWarning() {
        const warning = document.createElement('div');
        warning.className = 'config-warning';
        warning.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <strong style="color: #f87171;">⚠️ Supabase Not Configured</strong>
                <p style="color: var(--text-secondary); margin-top: 8px; font-size: 14px;">
                    Please update <code>js/supabase.js</code> with your Supabase URL and ANON KEY to connect to your database.
                </p>
            </div>
        `;

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(warning, mainContent.firstChild);
        }
    },

    // Update current date display
    updateCurrentDateDisplay() {
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            const now = new Date();
            dateEl.textContent = now.toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    },

    // Lead sources options
    leadSources: ['Facebook', 'Instagram', 'WhatsApp', 'Website', 'Referral', 'Walk-in', 'Phone Call', 'Other'],

    // Lead status options
    leadStatuses: ['New', 'Contacted', 'Follow Up', 'Interested', 'Qualified', 'Converted', 'Lost'],

    // Priority options
    priorities: ['High', 'Medium', 'Low'],

    // Reminder days options
    reminderDays: [
        { value: 0, label: 'On the day' },
        { value: 1, label: '1 day before' },
        { value: 2, label: '2 days before' },
        { value: 3, label: '3 days before' },
        { value: 7, label: '1 week before' }
    ]
};

// Export for global access
window.App = App;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    App.updateCurrentDateDisplay();
});
