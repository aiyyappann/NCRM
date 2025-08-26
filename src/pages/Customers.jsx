import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../App";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import FilterPanel from "../components/FilterPanel";
import CustomersTable from "../components/CustomersTable";
import CustomerCard from "../components/CustomerCard";

const Customers = () => {
  const { dataProvider, settings } = useAppContext();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await dataProvider.getCustomers(
        currentPage,
        settings.pageSize,
        searchTerm,
        filters
      );
      setCustomers(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [dataProvider, currentPage, settings.pageSize, searchTerm, filters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await dataProvider.deleteCustomer(customerId);
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const filterOptions = {
    status: ['Active', 'Inactive', 'Prospect', 'Qualified'],
    industry: ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Real Estate', 'Media']
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Customers</h1>
          <p className="text-muted mb-0">Manage your customer database</p>
        </div>
        <Link to="/customers/new" className="btn btn-primary">
          ➕ Add Customer
        </Link>
      </div>

      {/* Controls */}
      <div className="row mb-4">
        <div className="col-md-4">
          <SearchInput
            placeholder="Search customers..."
            onSearch={handleSearch}
            value={searchTerm}
          />
        </div>
        <div className="col-md-6">
          <FilterPanel
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
          />
        </div>
        <div className="col-md-2">
          <div className="btn-group w-100" role="group">
            <button
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('table')}
            >
              📋
            </button>
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('grid')}
            >
              ⊞
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted">
          Showing {customers.length} of {total} customers
        </small>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary">
            📤 Export
          </button>
          <button className="btn btn-sm btn-outline-secondary">
            📥 Import
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center p-5">
          <div className="mb-3" style={{ fontSize: "4rem" }}>👥</div>
          <h4>No customers found</h4>
          <p className="text-muted mb-4">
            {searchTerm || Object.keys(filters).length > 0 
              ? "Try adjusting your search or filters" 
              : "Start by adding your first customer"
            }
          </p>
          <Link to="/customers/new" className="btn btn-primary">
            Add Customer
          </Link>
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <CustomersTable 
              customers={customers} 
              onDelete={handleDeleteCustomer}
            />
          ) : (
            <div className="row">
              {customers.map(customer => (
                <div key={customer.id} className="col-md-6 col-lg-4 mb-3">
                  <CustomerCard 
                    customer={customer} 
                    onDelete={handleDeleteCustomer}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="d-flex justify-content-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Customers;