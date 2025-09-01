import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CustomerList from "@/components/customer-list";
import CustomerFilters from "@/components/customer-filters";

export default function CustomersPage() {
  const [filters, setFilters] = useState({
    search: "",
    city: "",
    state: "",
    pinCode: "",
    page: 1,
    limit: 10,
    sortBy: "firstName",
    sortOrder: "asc" as "asc" | "desc",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/customers", filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'All Cities' && value !== 'All States') {
          queryParams.append(key, value.toString());
        }
      });
      
      const url = `/api/customers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    },
    enabled: true,
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      city: "",
      state: "",
      pinCode: "",
      page: 1,
      limit: 10,
      sortBy: "firstName",
      sortOrder: "asc",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <a href="#" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
              <i className="fas fa-home mr-2"></i>
              Home
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <i className="fas fa-chevron-right text-muted-foreground mx-2"></i>
              <span className="text-sm font-medium text-foreground">Customers</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl sm:truncate">
            Customer Management
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your customer database and their associated addresses
          </p>
        </div>
      </div>

      {/* Filters */}
      <CustomerFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Customer List */}
      <CustomerList
        customers={data?.data || []}
        total={data?.total || 0}
        currentPage={filters.page}
        pageSize={filters.limit}
        isLoading={isLoading}
        error={error}
        onPageChange={handlePageChange}
        onSortChange={(sortBy, sortOrder) => setFilters(prev => ({ ...prev, sortBy, sortOrder }))}
      />
    </div>
  );
}
