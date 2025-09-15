import { useState, useEffect } from "react";
import { useAppContext } from "../App";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const { dataProvider } = useAppContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dataProvider.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dataProvider]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Customers',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: 'rgba(70, 123, 244, 0.5)',
        borderColor: 'rgb(70, 123, 244)',
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000],
        fill: false,
        borderColor: 'rgb(70, 123, 244)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Dashboard Overview</h1>
        <button className="btn btn-primary">
          Generate Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card kpi-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total Customers</h6>
                  <div className="kpi-value">{stats?.totalCustomers || 0}</div>
                </div>
                <div className="align-self-center">
                  <span style={{ fontSize: "2rem" }}>👥</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card kpi-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Active Customers</h6>
                  <div className="kpi-value">{stats?.activeCustomers || 0}</div>
                </div>
                <div className="align-self-center">
                  <span style={{ fontSize: "2rem" }}>✅</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card kpi-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Open Tickets</h6>
                  <div className="kpi-value">{stats?.openTickets || 0}</div>
                </div>
                <div className="align-self-center">
                  <span style={{ fontSize: "2rem" }}>🎧</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card kpi-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total Revenue</h6>
                  <div className="kpi-value">${stats?.totalRevenue?.toLocaleString() || '0'}</div>
                </div>
                <div className="align-self-center">
                  <span style={{ fontSize: "2rem" }}>💰</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Monthly Customer Growth</h5>
            </div>
            <div className="card-body">
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Weekly Revenue Trend</h5>
            </div>
            <div className="card-body">
              <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Recent Activity</h5>
        </div>
        <div className="card-body">
          <div className="list-group list-group-flush">
            <div className="list-group-item border-0 px-0">
              <div className="d-flex align-items-center">
                <div className="customer-avatar me-3">JD</div>
                <div className="flex-grow-1">
                  <div className="fw-semibold">New customer registered</div>
                  <small className="text-muted">John Doe joined 2 hours ago</small>
                </div>
                <small className="text-muted">2h ago</small>
              </div>
            </div>
            <div className="list-group-item border-0 px-0">
              <div className="d-flex align-items-center">
                <div className="customer-avatar me-3">SM</div>
                <div className="flex-grow-1">
                  <div className="fw-semibold">Support ticket resolved</div>
                  <small className="text-muted">Sarah Miller's issue was resolved</small>
                </div>
                <small className="text-muted">4h ago</small>
              </div>
            </div>
            <div className="list-group-item border-0 px-0">
              <div className="d-flex align-items-center">
                <div className="customer-avatar me-3">RJ</div>
                <div className="flex-grow-1">
                  <div className="fw-semibold">Meeting scheduled</div>
                  <small className="text-muted">Follow-up meeting with Robert Johnson</small>
                </div>
                <small className="text-muted">6h ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;