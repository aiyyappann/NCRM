import { useState, useEffect } from "react";
import { useToast } from "../components/Toast";
import { supabase } from "../integrations/supabase/client";
import Pagination from "../components/Pagination";

const Interactions = () => {
  const { addToast } = useToast();
  const [interactions, setInteractions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    type: 'Email',
    channel: 'Email',
    subject: '',
    notes: '',
    outcome: '',
    duration: '',
    next_action: ''
  });
  
  useEffect(() => {
    fetchInteractions();
    fetchCustomers();
  }, [currentPage]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name, company')
        .order('first_name');
      
      if (error) throw error;
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const limit = 10;
      const offset = (currentPage - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('interactions')
        .select(`
          *,
          customers!inner(first_name, last_name, company)
        `, { count: 'exact' })
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      setInteractions(data);
      setTotalPages(Math.ceil(count / limit));
    } catch (error) {
      console.error('Error fetching interactions:', error);
      addToast('Failed to load interactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedInteraction) {
        const { error } = await supabase
          .from('interactions')
          .update({
            customer_id: formData.customer_id,
            type: formData.type,
            channel: formData.channel,
            subject: formData.subject,
            notes: formData.notes,
            outcome: formData.outcome,
            duration: formData.duration ? parseInt(formData.duration) : null,
            next_action: formData.next_action
          })
          .eq('id', selectedInteraction.id);
        
        if (error) throw error;
        
        addToast('Interaction updated successfully', 'success');
        fetchInteractions();
      } else {
        const { error } = await supabase
          .from('interactions')
          .insert([{
            customer_id: formData.customer_id,
            type: formData.type,
            channel: formData.channel,
            subject: formData.subject,
            notes: formData.notes,
            outcome: formData.outcome,
            duration: formData.duration ? parseInt(formData.duration) : null,
            next_action: formData.next_action
          }]);
        
        if (error) throw error;
        
        addToast('Interaction created successfully', 'success');
        fetchInteractions();
      }
      
      setShowForm(false);
      setSelectedInteraction(null);
      setFormData({
        customer_id: '',
        type: 'Email',
        channel: 'Email',
        subject: '',
        notes: '',
        outcome: '',
        duration: '',
        next_action: ''
      });
    } catch (error) {
      console.error('Error saving interaction:', error);
      addToast('Failed to save interaction', 'error');
    }
  };

  const handleEdit = (interaction) => {
    setSelectedInteraction(interaction);
    setFormData({
      customer_id: interaction.customer_id,
      type: interaction.type,
      channel: interaction.channel,
      subject: interaction.subject,
      notes: interaction.notes,
      outcome: interaction.outcome,
      duration: interaction.duration?.toString() || '',
      next_action: interaction.next_action
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      try {
        const { error } = await supabase
          .from('interactions')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setInteractions(prev => prev.filter(int => int.id !== id));
        addToast('Interaction deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting interaction:', error);
        addToast('Failed to delete interaction', 'error');
      }
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Email': '📧',
      'Phone': '📞',
      'Meeting': '🤝',
      'Chat': '💬',
      'Social': '📱'
    };
    return icons[type] || '💬';
  };

  const getOutcomeBadge = (outcome) => {
    const classes = {
      'Positive': 'bg-success',
      'Neutral': 'bg-secondary',
      'Negative': 'bg-danger'
    };
    return (
      <span className={`badge ${classes[outcome] || 'bg-secondary'}`}>
        {outcome}
      </span>
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Customer Interactions</h1>
          <p className="text-muted mb-0">Track all customer touchpoints and communications</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Add Interaction
        </button>
      </div>

      {/* Interaction Form Modal */}
      {showForm && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedInteraction ? 'Edit Interaction' : 'Add New Interaction'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedInteraction(null);
                    setFormData({
                      customer_id: '',
                      type: 'Email',
                      channel: 'Email',
                      subject: '',
                      notes: '',
                      outcome: '',
                      duration: '',
                      next_action: ''
                    });
                  }}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Customer</label>
                        <select
                          className="form-select"
                          value={formData.customer_id}
                          onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                          required
                        >
                          <option value="">Select Customer</option>
                          {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                              {customer.first_name} {customer.last_name} - {customer.company}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Type</label>
                        <select
                          className="form-select"
                          value={formData.type}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        >
                          <option value="Email">Email</option>
                          <option value="Phone">Phone</option>
                          <option value="Meeting">Meeting</option>
                          <option value="Chat">Chat</option>
                          <option value="Social">Social</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Channel</label>
                        <select
                          className="form-select"
                          value={formData.channel}
                          onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value }))}
                        >
                          <option value="Email">Email</option>
                          <option value="Phone">Phone</option>
                          <option value="In-Person">In-Person</option>
                          <option value="Video Call">Video Call</option>
                          <option value="Website">Website</option>
                          <option value="LinkedIn">LinkedIn</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Subject of the interaction"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Detailed notes about the interaction"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Outcome</label>
                        <select
                          className="form-select"
                          value={formData.outcome}
                          onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                        >
                          <option value="">Select Outcome</option>
                          <option value="Positive">Positive</option>
                          <option value="Neutral">Neutral</option>
                          <option value="Negative">Negative</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Duration (minutes)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="Duration in minutes"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Next Action</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.next_action}
                          onChange={(e) => setFormData(prev => ({ ...prev, next_action: e.target.value }))}
                          placeholder="Next action required"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedInteraction(null);
                      setFormData({
                        customer_id: '',
                        type: 'Email',
                        channel: 'Email',
                        subject: '',
                        notes: '',
                        outcome: '',
                        duration: '',
                        next_action: ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedInteraction ? 'Update Interaction' : 'Create Interaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Interactions Timeline */}
      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : interactions.length === 0 ? (
        <div className="text-center p-5">
          <div className="mb-3" style={{ fontSize: "4rem" }}>💬</div>
          <h4>No interactions found</h4>
          <p className="text-muted mb-4">Start tracking customer interactions to build better relationships</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add First Interaction
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="interaction-timeline">
              {interactions.map(interaction => (
                <div key={interaction.id} className="interaction-item border-bottom pb-3 mb-3">
                  <div className="row align-items-start">
                    <div className="col-md-8">
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-2" style={{ fontSize: "1.2rem" }}>
                          {getTypeIcon(interaction.type)}
                        </span>
                        <div>
                          <strong>{interaction.subject}</strong>
                          <div className="text-muted small">
                            Customer: {interaction.customers?.first_name} {interaction.customers?.last_name} • {interaction.type} via {interaction.channel}
                          </div>
                        </div>
                      </div>
                      <p className="text-muted mb-2">{interaction.notes}</p>
                      <div className="d-flex align-items-center gap-3">
                        {interaction.outcome && getOutcomeBadge(interaction.outcome)}
                        {interaction.duration && (
                          <small className="text-muted">
                            Duration: {interaction.duration} minutes
                          </small>
                        )}
                        {interaction.next_action && (
                          <small className="text-primary">
                            Next: {interaction.next_action}
                          </small>
                        )}
                      </div>
                    </div>
                    <div className="col-md-4 text-end">
                      <div className="text-muted small">
                        {new Date(interaction.date).toLocaleDateString()} at{' '}
                        {new Date(interaction.date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="mt-2">
                        <button 
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(interaction)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(interaction.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default Interactions;