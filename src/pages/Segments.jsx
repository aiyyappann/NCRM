import { useState } from "react";
import { useToast } from "../components/Toast";

const Segments = () => {
  const { addToast } = useToast();
  const [segments, setSegments] = useState([
    {
      id: 1,
      name: "VIP Customers",
      rules: [{ field: "value", operator: "gt", value: "50000" }, { field: "status", operator: "eq", value: "Active" }],
      count: 12,
      created: new Date().toISOString()
    },
    {
      id: 2,
      name: "Technology Prospects",
      rules: [{ field: "industry", operator: "eq", value: "Technology" }, { field: "status", operator: "eq", value: "Prospect" }],
      count: 8,
      created: new Date().toISOString()
    }
  ]);
  
  const [showBuilder, setShowBuilder] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: "",
    rules: [{ field: "status", operator: "eq", value: "" }]
  });

  const fieldOptions = [
    { value: "status", label: "Status" },
    { value: "industry", label: "Industry" },
    { value: "value", label: "Customer Value" },
    { value: "createdAt", label: "Created Date" }
  ];

  const operatorOptions = [
    { value: "eq", label: "equals" },
    { value: "ne", label: "not equals" },
    { value: "gt", label: "greater than" },
    { value: "lt", label: "less than" },
    { value: "contains", label: "contains" }
  ];

  const addRule = () => {
    setNewSegment(prev => ({
      ...prev,
      rules: [...prev.rules, { field: "status", operator: "eq", value: "" }]
    }));
  };

  const removeRule = (index) => {
    setNewSegment(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const updateRule = (index, field, value) => {
    setNewSegment(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => 
        i === index ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const saveSegment = () => {
    if (!newSegment.name.trim()) return;
    
    const segment = {
      id: segments.length + 1,
      name: newSegment.name,
      rules: newSegment.rules,
      count: Math.floor(Math.random() * 20) + 1, // Mock count
      created: new Date().toISOString()
    };
    
    setSegments(prev => [...prev, segment]);
    setNewSegment({ name: "", rules: [{ field: "status", operator: "eq", value: "" }] });
    setShowBuilder(false);
    addToast('Segment created successfully', 'success');
  };

  const deleteSegment = (id) => {
    if (window.confirm('Are you sure you want to delete this segment?')) {
      setSegments(prev => prev.filter(s => s.id !== id));
      addToast('Segment deleted successfully', 'success');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Customer Segments</h1>
          <p className="text-muted mb-0">Create and manage customer segments</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowBuilder(true)}
        >
          ➕ Create Segment
        </button>
      </div>

      {/* Segment Builder Modal */}
      {showBuilder && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Segment</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowBuilder(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Segment Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newSegment.name}
                    onChange={(e) => setNewSegment(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter segment name"
                  />
                </div>

                <h6 className="mb-3">Rules</h6>
                {newSegment.rules.map((rule, index) => (
                  <div key={index} className="row mb-3 align-items-center">
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={rule.field}
                        onChange={(e) => updateRule(index, 'field', e.target.value)}
                      >
                        {fieldOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={rule.operator}
                        onChange={(e) => updateRule(index, 'operator', e.target.value)}
                      >
                        {operatorOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        value={rule.value}
                        onChange={(e) => updateRule(index, 'value', e.target.value)}
                        placeholder="Value"
                      />
                    </div>
                    <div className="col-md-2">
                      {newSegment.rules.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeRule(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm mb-3"
                  onClick={addRule}
                >
                  ➕ Add Rule
                </button>

                <div className="alert alert-info">
                  <strong>Preview:</strong> This segment will include customers where {newSegment.rules.length > 1 ? 'all of these conditions are met' : 'this condition is met'}.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowBuilder(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={saveSegment}
                  disabled={!newSegment.name.trim()}
                >
                  Create Segment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Segments List */}
      {segments.length === 0 ? (
        <div className="text-center p-5">
          <div className="mb-3" style={{ fontSize: "4rem" }}>🎯</div>
          <h4>No segments created yet</h4>
          <p className="text-muted mb-4">Create your first customer segment to organize your customer base</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowBuilder(true)}
          >
            Create First Segment
          </button>
        </div>
      ) : (
        <div className="row">
          {segments.map(segment => (
            <div key={segment.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title">{segment.name}</h5>
                    <div className="dropdown">
                      <button 
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        ⋮
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button className="dropdown-item" onClick={() => deleteSegment(segment.id)}>
                            🗑️ Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-primary fw-bold h3">{segment.count}</div>
                    <small className="text-muted">customers match this segment</small>
                  </div>

                  <div className="mb-3">
                    <h6 className="small text-muted mb-2">RULES</h6>
                    {segment.rules.map((rule, index) => (
                      <div key={index} className="small mb-1">
                        <span className="badge bg-light text-dark">
                          {fieldOptions.find(f => f.value === rule.field)?.label} {' '}
                          {operatorOptions.find(o => o.value === rule.operator)?.label} {' '}
                          "{rule.value}"
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <small className="text-muted">
                      Created {new Date(segment.created).toLocaleDateString()}
                    </small>
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <button className="btn btn-outline-primary btn-sm w-100">
                    📤 Export Customers
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Segments;