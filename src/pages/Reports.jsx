import { useState, useEffect } from "react";
import { useAppContext } from "../App";
import { useToast } from "../components/Toast";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement, ArcElement, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const Reports = () => {
  const { dataProvider } = useAppContext();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await dataProvider.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        addToast('Failed to load report data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dataProvider, dateRange]);

  const exportData = (format) => {
    // Mock export functionality
    const data = `Customer Report - ${new Date().toLocaleDateString()}\n\nTotal Customers: ${stats?.totalCustomers || 0}\nActive Customers: ${stats?.activeCustomers || 0}\nTotal Revenue: $${stats?.totalRevenue?.toLocaleString() || '0'}`;
    
    if (format === 'csv') {
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (format === 'pdf') {
      // Mock PDF export
      alert('PDF export functionality would be implemented here');
    }
  };

  const customerStatusData = {
    labels: ['Active', 'Inactive', 'Prospect', 'Qualified'],
    datasets: [
      {
        data: [25, 8, 12, 5],
        backgroundColor: [
          'rgba(70, 123, 244, 0.8)',
          'rgba(108, 117, 125, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(13, 202, 240, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [65000, 75000, 80000, 85000, 90000, 95000],
        borderColor: 'rgb(70, 123, 244)',
        backgroundColor: 'rgba(70, 123, 244, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const interactionData = {
    labels: ['Email', 'Phone', 'Meeting', 'Chat', 'Social'],
    datasets: [
      {
        label: 'Interactions',
        data: [20, 15, 8, 12, 5],
        backgroundColor: 'rgba(70, 123, 244, 0.8)',
        borderColor: 'rgb(70, 123, 244)',
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Reports & Analytics</h1>
          <p className="text-muted mb-0">View comprehensive CRM analytics and export data</p>
        </div>
        <div className="d-flex gap-2">
          <select 
            className="form-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <div className="dropdown">
            <button 
              className="btn btn-primary dropdown-toggle" 
              type="button" 
              data-bs-toggle="dropdown"
            >
              📤 Export
            </button>
            <ul className="dropdown-menu">
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => exportData('csv')}
                >
                  Export CSV
                </button>
              </li>
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => exportData('pdf')}
                >
                  📋 Export PDF
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="text-primary mb-2" style={{ fontSize: "2.5rem" }}>👥</div>
              <h3 className="text-primary">{stats?.totalCustomers || 0}</h3>
              <p className="text-muted mb-0">Total Customers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="text-success mb-2" style={{ fontSize: "2.5rem" }}>💰</div>
              <h3 className="text-success">${stats?.totalRevenue?.toLocaleString() || '0'}</h3>
              <p className="text-muted mb-0">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-info">{stats?.totalInteractions || 0}</h3>
              <p className="text-muted mb-0">Interactions</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="text-warning mb-2" style={{ fontSize: "2.5rem" }}>🎧</div>
              <h3 className="text-warning">{stats?.openTickets || 0}</h3>
              <p className="text-muted mb-0">Open Tickets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Revenue Trend</h5>
            </div>
            <div className="card-body">
              <Line 
                data={revenueData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }} 
                height={300} 
              />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Customer Status</h5>
            </div>
            <div className="card-body">
              <Doughnut 
                data={customerStatusData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
                height={300} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Interaction Types</h5>
            </div>
            <div className="card-body">
              <Bar 
                data={interactionData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
                height={250} 
              />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Export Options</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <button 
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  onClick={() => exportData('csv')}
                >
                  <div>
                    <div className="fw-semibold">Customer Data (CSV)</div>
                    <small className="text-muted">All customer records with contact info</small>
                  </div>
                </button>
                <button 
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  onClick={() => exportData('pdf')}
                >
                  <div>
                    <div className="fw-semibold">Analytics Report (PDF)</div>
                    <small className="text-muted">Comprehensive analytics report</small>
                  </div>
                  <span>📋</span>
                </button>
                <button 
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  onClick={() => exportData('csv')}
                >
                  <div>
                    <div className="fw-semibold">Interaction History (CSV)</div>
                    <small className="text-muted">All customer interactions</small>
                  </div>
                </button>
                <button 
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  onClick={() => exportData('csv')}
                >
                  <div>
                    <div className="fw-semibold">Support Tickets (CSV)</div>
                    <small className="text-muted">Support ticket data</small>
                  </div>
                  <span>🎧</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;