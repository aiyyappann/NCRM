import { useState, useEffect } from "react";
import { useToast } from "../components/Toast";
import { supabase } from "../integrations/supabase/client";
import Pagination from "../components/Pagination";

const Support = () => {
  const { addToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });

  useEffect(() => {
    fetchTickets();
  }, [currentPage, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const limit = 10;
      const offset = (currentPage - 1) * limit;
      
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          customers!inner(first_name, last_name, company)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.priority) query = query.eq('priority', filters.priority);
      if (filters.category) query = query.eq('category', filters.category);
      
      const { data, error, count } = await query.range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      setTickets(data);
      setTotalPages(Math.ceil(count / limit));
      
      // Fetch responses for selected ticket if it exists
      if (selectedTicket) {
        await fetchTicketResponses(selectedTicket.id);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      addToast('Failed to load support tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketResponses = async (ticketId) => {
    try {
      const { data, error } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setSelectedTicket(prev => ({ ...prev, responses: data }));
    } catch (error) {
      console.error('Error fetching ticket responses:', error);
    }
  };

  const getPriorityBadge = (priority) => {
    const classes = {
      'Critical': 'bg-danger',
      'High': 'bg-warning text-dark',
      'Medium': 'bg-info',
      'Low': 'bg-secondary'
    };
    return (
      <span className={`badge ${classes[priority] || 'bg-secondary'}`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const classes = {
      'Open': 'bg-danger',
      'In Progress': 'bg-warning text-dark',
      'Resolved': 'bg-success',
      'Closed': 'bg-secondary'
    };
    return (
      <span className={`badge ${classes[status] || 'bg-secondary'}`}>
        {status}
      </span>
    );
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);
      
      if (error) throw error;
      
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      ));
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
      addToast('Ticket status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating ticket:', error);
      addToast('Failed to update ticket status', 'error');
    }
  };

  const handleTicketSelect = async (ticket) => {
    setSelectedTicket(ticket);
    await fetchTicketResponses(ticket.id);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    
    try {
      const { error } = await supabase
        .from('ticket_responses')
        .insert([{
          ticket_id: selectedTicket.id,
          author: 'Support Agent',
          message: replyText
        }]);
      
      if (error) throw error;
      
      // Refresh ticket responses
      await fetchTicketResponses(selectedTicket.id);
      setReplyText('');
      addToast('Reply sent successfully', 'success');
    } catch (error) {
      console.error('Error sending reply:', error);
      addToast('Failed to send reply', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Support Tickets</h1>
          <p className="text-muted mb-0">Manage customer support requests and issues</p>
        </div>
        <button className="btn btn-primary">
          New Ticket
        </button>
      </div>

      <div className="row">
        {/* Tickets List */}
        <div className="col-lg-6">
          {/* Filters */}
          <div className="row mb-3">
            <div className="col-4">
              <select 
                className="form-select form-select-sm"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="col-4">
              <select 
                className="form-select form-select-sm"
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="col-4">
              <select 
                className="form-select form-select-sm"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
                <option value="General">General</option>
                <option value="Feature Request">Feature Request</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-5">
              <div className="mb-3" style={{ fontSize: "4rem" }}>🎧</div>
              <h4>No tickets found</h4>
              <p className="text-muted mb-4">All caught up! No support tickets match your filters.</p>
            </div>
          ) : (
            <div className="card">
              <div className="list-group list-group-flush">
                {tickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    className={`list-group-item list-group-item-action ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                    onClick={() => handleTicketSelect(ticket)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{ticket.title}</h6>
                        <p className="mb-1 text-truncate" style={{ maxWidth: '300px' }}>
                          {ticket.description}
                        </p>
                        <small className="text-muted">
                          {ticket.customers?.first_name} {ticket.customers?.last_name} • {ticket.assigned_to}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="mb-1">
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <div className="mb-1">
                          {getStatusBadge(ticket.status)}
                        </div>
                        <small className="text-muted">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showInfo={false}
              />
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        <div className="col-lg-6">
          {selectedTicket ? (
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Ticket #{selectedTicket.id}</h5>
                  <div className="d-flex gap-2">
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </div>
              </div>
              <div className="card-body">
                <h6 className="mb-3">{selectedTicket.title}</h6>
                <p className="text-muted mb-4">{selectedTicket.description}</p>

                <div className="row mb-4">
                  <div className="col-6">
                    <div className="small text-muted">Category</div>
                    <div>{selectedTicket.category}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-muted">Assigned To</div>
                    <div>{selectedTicket.assigned_to}</div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-6">
                    <div className="small text-muted">Created</div>
                    <div>{new Date(selectedTicket.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-muted">Last Updated</div>
                    <div>{new Date(selectedTicket.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Conversation */}
                <h6 className="mb-3">Conversation</h6>
                <div className="border rounded p-3 mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedTicket.responses?.map(response => (
                    <div key={response.id} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className={response.author === 'Customer' ? 'text-primary' : 'text-success'}>
                          {response.author}
                        </strong>
                        <small className="text-muted">
                          {new Date(response.created_at).toLocaleString()}
                        </small>
                      </div>
                      <p className="mb-0">{response.message}</p>
                    </div>
                  )) || <p className="text-muted">No responses yet</p>}
                </div>

                {/* Reply Form */}
                <div className="mb-3">
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Type your response..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-between">
                  <div className="dropdown">
                    <button 
                      className="btn btn-outline-primary dropdown-toggle" 
                      type="button" 
                      data-bs-toggle="dropdown"
                    >
                      Change Status
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => updateTicketStatus(selectedTicket.id, 'Open')}
                        >
                          Open
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => updateTicketStatus(selectedTicket.id, 'In Progress')}
                        >
                          In Progress
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => updateTicketStatus(selectedTicket.id, 'Resolved')}
                        >
                          Resolved
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => updateTicketStatus(selectedTicket.id, 'Closed')}
                        >
                          Closed
                        </button>
                      </li>
                    </ul>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="mb-3" style={{ fontSize: "3rem" }}>🎧</div>
                <h5>Select a ticket</h5>
                <p className="text-muted mb-0">Choose a ticket from the list to view details and manage the conversation.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;