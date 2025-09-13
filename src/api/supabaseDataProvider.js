import { supabase } from "@/integrations/supabase/client";

export const supabaseDataProvider = {
  // Admin functions
  getAdminSettings: async () => {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*');
    
    if (error) throw new Error(error.message);
    
    const settings = {};
    data.forEach(setting => {
      settings[setting.setting_key] = setting.setting_value;
    });
    return settings;
  },

  updateAdminSetting: async (key, value) => {
    const { error } = await supabase
      .from('admin_settings')
      .upsert([{
        setting_key: key,
        setting_value: value
      }]);
    
    if (error) throw new Error(error.message);
    return { success: true };
  },

  getAllUsers: async () => {
    const { data: users, error: usersError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        created_at
      `);
    
    if (usersError) throw new Error(usersError.message);
    
    // Transform data to include email from auth metadata
    return users.map(user => ({
      id: user.user_id,
      role: user.role,
      created_at: user.created_at,
      email: `user-${user.user_id.slice(0, 8)}@example.com` // Mock email since we can't access auth.users
    }));
  },

  updateUserRole: async (userId, role) => {
    const { error } = await supabase
      .from('user_roles')
      .upsert([{
        user_id: userId,
        role: role
      }]);
    
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // Customers
  getCustomers: async (page = 1, limit = 10, search = '', filters = {}) => {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' });

    // Apply search
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }
    
    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);
    
    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  getCustomer: async (id) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },

  createCustomer: async (customerData) => {
    // Transform data to match database schema
    const dbData = {
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      company: customerData.company,
      industry: customerData.industry,
      status: customerData.status || 'Prospect',
      value: customerData.value || 0,
      address: customerData.address,
      tags: customerData.tags || []
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([dbData])
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Transform back to frontend format
    return transformCustomerFromDb(data);
  },

  updateCustomer: async (id, customerData) => {
    // Transform data to match database schema
    const dbData = {
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      company: customerData.company,
      industry: customerData.industry,
      status: customerData.status,
      value: customerData.value,
      address: customerData.address,
      tags: customerData.tags,
      last_contact: customerData.lastContact
    };

    const { data, error } = await supabase
      .from('customers')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return transformCustomerFromDb(data);
  },

  deleteCustomer: async (id) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  },

  // Interactions
  getInteractions: async (customerId = null, page = 1, limit = 10) => {
    let query = supabase
      .from('interactions')
      .select(`
        *,
        customers (
          first_name,
          last_name,
          company
        )
      `, { count: 'exact' });

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    
    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);
    
    // Order by date desc
    query = query.order('date', { ascending: false });

    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(error.message);
    }

    return {
      data: (data || []).map(transformInteractionFromDb),
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  createInteraction: async (interactionData) => {
    const dbData = {
      customer_id: interactionData.customerId,
      type: interactionData.type,
      channel: interactionData.channel,
      subject: interactionData.subject,
      notes: interactionData.notes,
      duration: interactionData.duration,
      outcome: interactionData.outcome,
      next_action: interactionData.nextAction
    };

    const { data, error } = await supabase
      .from('interactions')
      .insert([dbData])
      .select(`
        *,
        customers (
          first_name,
          last_name,
          company
        )
      `)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return transformInteractionFromDb(data);
  },

  // Support Tickets
  getTickets: async (page = 1, limit = 10, filters = {}) => {
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        customers (
          first_name,
          last_name,
          company
        )
      `, { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }
    
    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);
    
    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(error.message);
    }

    return {
      data: (data || []).map(transformTicketFromDb),
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  getTicket: async (id) => {
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        customers (
          first_name,
          last_name,
          company
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }

    // Get ticket responses
    const { data: responses, error: responsesError } = await supabase
      .from('ticket_responses')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (responsesError) {
      throw new Error(responsesError.message);
    }

    return {
      ...transformTicketFromDb(ticket),
      responses: responses || []
    };
  },

  updateTicket: async (id, ticketData) => {
    const dbData = {
      title: ticketData.title,
      description: ticketData.description,
      priority: ticketData.priority,
      status: ticketData.status,
      category: ticketData.category,
      assigned_to: ticketData.assignedTo
    };

    const { data, error } = await supabase
      .from('support_tickets')
      .update(dbData)
      .eq('id', id)
      .select(`
        *,
        customers (
          first_name,
          last_name,
          company
        )
      `)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return transformTicketFromDb(data);
  },

  // Statistics
  getStats: async () => {
    // Get total customers
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // Get active customers
    const { count: activeCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active');

    // Get total interactions
    const { count: totalInteractions } = await supabase
      .from('interactions')
      .select('*', { count: 'exact', head: true });

    // Get open tickets
    const { count: openTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Open');

    // Get total revenue
    const { data: revenueData } = await supabase
      .from('customers')
      .select('value');

    const totalRevenue = (revenueData || []).reduce((sum, customer) => sum + (customer.value || 0), 0);
    const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    return {
      totalCustomers: totalCustomers || 0,
      activeCustomers: activeCustomers || 0,
      totalInteractions: totalInteractions || 0,
      openTickets: openTickets || 0,
      totalRevenue,
      avgCustomerValue
    };
  }
};

// Helper functions to transform data between frontend and database formats
function transformCustomerFromDb(dbCustomer) {
  return {
    id: dbCustomer.id,
    firstName: dbCustomer.first_name,
    lastName: dbCustomer.last_name,
    email: dbCustomer.email,
    phone: dbCustomer.phone,
    company: dbCustomer.company,
    industry: dbCustomer.industry,
    status: dbCustomer.status,
    value: dbCustomer.value,
    createdAt: dbCustomer.created_at,
    updatedAt: dbCustomer.updated_at,
    lastContact: dbCustomer.last_contact,
    address: dbCustomer.address,
    tags: dbCustomer.tags
  };
}

function transformInteractionFromDb(dbInteraction) {
  return {
    id: dbInteraction.id,
    customerId: dbInteraction.customer_id,
    customerName: dbInteraction.customers ? 
      `${dbInteraction.customers.first_name} ${dbInteraction.customers.last_name}` : 
      'Unknown',
    customerCompany: dbInteraction.customers?.company,
    type: dbInteraction.type,
    channel: dbInteraction.channel,
    subject: dbInteraction.subject,
    notes: dbInteraction.notes,
    date: dbInteraction.date,
    duration: dbInteraction.duration,
    outcome: dbInteraction.outcome,
    nextAction: dbInteraction.next_action,
    createdAt: dbInteraction.created_at
  };
}

function transformTicketFromDb(dbTicket) {
  return {
    id: dbTicket.id,
    customerId: dbTicket.customer_id,
    customerName: dbTicket.customers ? 
      `${dbTicket.customers.first_name} ${dbTicket.customers.last_name}` : 
      'Unknown',
    customerCompany: dbTicket.customers?.company,
    title: dbTicket.title,
    description: dbTicket.description,
    priority: dbTicket.priority,
    status: dbTicket.status,
    category: dbTicket.category,
    assignedTo: dbTicket.assigned_to,
    createdAt: dbTicket.created_at,
    updatedAt: dbTicket.updated_at
  };
}