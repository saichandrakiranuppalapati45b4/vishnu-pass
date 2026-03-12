import { supabase } from '../lib/supabase';

/**
 * Standard utility for logging administrative actions to the system audit trail.
 * 
 * @param {Object} params
 * @param {string} params.action - Short description of the action (e.g., 'Registered Student')
 * @param {string} params.resource - The ID or name of the affected resource (e.g., student ID)
 * @param {Object} [params.details] - Optional JSON object with additional context
 */
export const logAuditAction = async ({ action, resource, details = {} }) => {
    try {
        // Get the current user session to identify the admin
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            console.warn('Audit Log: No active session found. Skipping log.');
            return;
        }

        // Fetch the admin's name from the admins table
        const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('name')
            .eq('id', session.user.id)
            .single();

        if (adminError) {
            console.error('Audit Log: Error fetching admin name:', adminError);
        }

        const logEntry = {
            admin_id: session.user.id,
            admin_name: adminData?.name || session.user.email || 'Anonymous Admin',
            action: action,
            resource: resource,
            details: details,
            ip_address: 'Logged via Portal', // In a real edge function, we'd get the actual IP
            created_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('audit_logs')
            .insert(logEntry);

        if (error) throw error;

    } catch (error) {
        console.error('Audit Log Error:', error.message);
    }
};
