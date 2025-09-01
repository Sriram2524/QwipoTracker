import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import DeleteConfirmation from "./delete-confirmation";
import type { CustomerWithAddresses } from "@shared/schema";

interface CustomerListProps {
  customers: CustomerWithAddresses[];
  total: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: any;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export default function CustomerList({
  customers,
  total,
  currentPage,
  pageSize,
  isLoading,
  error,
  onPageChange,
  onSortChange,
}: CustomerListProps) {
  const [deleteCustomerId, setDeleteCustomerId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("firstName");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder as 'asc' | 'desc');
    onSortChange(newSortBy, newSortOrder as 'asc' | 'desc');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const getAddressDisplay = (addresses: any[]) => {
    if (addresses.length === 0) return "No Address";
    if (addresses.length === 1) return "Only One Address";
    return `${addresses.length} Addresses`;
  };

  const getPrimaryLocation = (addresses: any[]) => {
    if (addresses.length === 0) return { city: "N/A", state: "N/A", pinCode: "N/A" };
    const primary = addresses[0];
    return {
      city: primary.city,
      state: primary.state,
      pinCode: primary.pinCode,
    };
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Failed to load customers. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground">Customer List</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firstName-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="firstName-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="phoneNumber-asc">Phone Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Phone Number</TableHead>
                <TableHead className="text-muted-foreground">Addresses</TableHead>
                <TableHead className="text-muted-foreground">Location</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-4 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No customers found. Try adjusting your filters or add a new customer.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => {
                  const location = getPrimaryLocation(customer.addresses);
                  return (
                    <TableRow key={customer.id} className="hover:bg-muted/50" data-testid={`row-customer-${customer.id}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-foreground">
                                {getInitials(customer.firstName, customer.lastName)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground" data-testid={`text-customer-name-${customer.id}`}>
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground" data-testid={`text-customer-id-${customer.id}`}>
                              ID: #{customer.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground font-mono" data-testid={`text-phone-${customer.id}`}>
                          {customer.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={customer.addresses.length === 1 ? "secondary" : "default"}
                          data-testid={`badge-address-count-${customer.id}`}
                        >
                          {getAddressDisplay(customer.addresses)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground" data-testid={`text-location-${customer.id}`}>
                          {location.city}, {location.state}
                        </div>
                        <div className="text-sm text-muted-foreground" data-testid={`text-pincode-${customer.id}`}>
                          {location.pinCode}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/customers/${customer.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`button-view-${customer.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/customers/${customer.id}/edit`}>
                            <Button variant="ghost" size="sm" data-testid={`button-edit-${customer.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteCustomerId(customer.id)}
                            data-testid={`button-delete-${customer.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="bg-card px-6 py-3 flex items-center justify-between border-t border-border">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                data-testid="button-prev-mobile"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                data-testid="button-next-mobile"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                  Showing <span className="font-medium">{startIndex}</span> to{" "}
                  <span className="font-medium">{endIndex}</span> of{" "}
                  <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    data-testid="button-prev"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                        data-testid={`button-page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    data-testid="button-next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>

      {deleteCustomerId && (
        <DeleteConfirmation
          customerId={deleteCustomerId}
          onClose={() => setDeleteCustomerId(null)}
        />
      )}
    </>
  );
}
