import { useState, useEffect } from "react";
import { useAppContext } from "../App";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";

const Interactions = () => {
  const { dataProvider } = useAppContext();
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    channel: '',
    outcome: ''
  });

  useEffect(() => {
    const fetchInteractions = async () => {
      setLoading(true);
      try {
        const response = await dataProvider.getInteractions(null, currentPage, 10);
        setInteractions(response.data);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Error fetching interactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [dataProvider, currentPage]);

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
        <button className="btn btn-primary">
          ➕ Add Interaction
        </button>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <select 
            className="form-select"
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="Meeting">Meeting</option>
            <option value="Chat">Chat</option>
            <option value="Social">Social</option>
          </select>
        </div>
        <div className="col-md-3">
          <select 
            className="form-select"
            value={filters.channel}
            onChange={(e) => setFilters(prev => ({ ...prev, channel: e.target.value }))}
          >
            <option value="">All Channels</option>
            <option value="Website">Website</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Email Campaign">Email Campaign</option>
            <option value="Phone Call">Phone Call</option>
            <option value="In-Person">In-Person</option>
          </select>
        </div>
        <div className="col-md-3">
          <select 
            className="form-select"
            value={filters.outcome}
            onChange={(e) => setFilters(prev => ({ ...prev, outcome: e.target.value }))}
          >
            <option value="">All Outcomes</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
        <div className="col-md-3">
          <button 
            className="btn btn-outline-secondary w-100"
            onClick={() => setFilters({ type: '', channel: '', outcome: '' })}
          >
            Clear Filters
          </button>
        </div>
      </div>

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
          <button className="btn btn-primary">Add First Interaction</button>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="interaction-timeline">
              {interactions.map(interaction => (
                <div key={interaction.id} className="interaction-item">
                  <div className="row align-items-start">
                    <div className="col-md-8">
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-2" style={{ fontSize: "1.2rem" }}>
                          {getTypeIcon(interaction.type)}
                        </span>
                        <div>
                          <strong>{interaction.subject}</strong>
                          <div className="text-muted small">
                            {interaction.type} via {interaction.channel}
                          </div>
                        </div>
                      </div>
                      <p className="text-muted mb-2">{interaction.notes}</p>
                      <div className="d-flex align-items-center gap-3">
                        {getOutcomeBadge(interaction.outcome)}
                        <small className="text-muted">
                          Duration: {interaction.duration} minutes
                        </small>
                        {interaction.nextAction && (
                          <small className="text-primary">
                            Next: {interaction.nextAction}
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
                        <button className="btn btn-sm btn-outline-primary me-2">
                          View
                        </button>
                        <button className="btn btn-sm btn-outline-secondary">
                          Edit
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