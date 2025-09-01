import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AddressForm from "@/components/address-form";
import DeleteConfirmation from "@/components/delete-confirmation";
import type { CustomerWithAddresses, Address } from "@shared/schema";

export default function CustomerDetailPage() {
  const [, params] = useRoute("/customers/:id");
  const customerId = parseInt(params?.id || "0");
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: customer, isLoading, error } = useQuery<CustomerWithAddresses>({
    queryKey: ["/api/customers", customerId.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!customerId && !isNaN(customerId),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: number) => {
      return apiRequest("DELETE", `/api/addresses/${addressId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customerId.toString()] });
      toast({ title: "Success", description: "Address deleted successfully" });
      setDeleteAddressId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete address", variant: "destructive" });
    },
  });

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  if (isNaN(customerId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Invalid customer ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-muted p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Customer not found</p>
            <Link href="/customers">
              <Button className="mt-4">Back to Customers</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/">
              <a className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <i className="fas fa-home mr-2"></i>
                Home
              </a>
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <i className="fas fa-chevron-right text-muted-foreground mx-2"></i>
              <Link href="/customers">
                <a className="text-sm font-medium text-muted-foreground hover:text-primary">Customers</a>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <i className="fas fa-chevron-right text-muted-foreground mx-2"></i>
              <span className="text-sm font-medium text-foreground">
                {customer.firstName} {customer.lastName}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Back Button */}
      <div className="mb-6">
        <Link href="/customers">
          <Button variant="ghost" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </Link>
      </div>

      {/* Customer Details */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-muted p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mr-4">
                    <span className="text-xl font-medium text-primary-foreground">
                      {getInitials(customer.firstName, customer.lastName)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium text-foreground" data-testid="text-customer-full-name">
                      {customer.firstName} {customer.lastName}
                    </h4>
                    <p className="text-muted-foreground" data-testid="text-customer-id">
                      Customer ID: #{customer.id}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="text-foreground font-mono" data-testid="text-phone-number">
                      {customer.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Addresses</label>
                    <p className="text-foreground" data-testid="text-total-addresses">
                      {customer.addresses.length} Address{customer.addresses.length !== 1 ? 'es' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-3">
                <Link href={`/customers/${customer.id}/edit`}>
                  <Button className="w-full" data-testid="button-edit-customer">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Customer
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowAddressForm(true)}
                  data-testid="button-add-address"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div>
            <h5 className="text-lg font-medium text-foreground mb-4">Addresses</h5>
            {customer.addresses.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">No addresses found for this customer.</p>
                  <Button onClick={() => setShowAddressForm(true)} data-testid="button-add-first-address">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Address
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {customer.addresses.map((address, index) => (
                  <Card key={address.id} data-testid={`card-address-${address.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              {index === 0 ? "Primary" : `Address ${index + 1}`}
                            </Badge>
                            <span className="text-sm text-muted-foreground ml-2" data-testid={`text-address-id-${address.id}`}>
                              Address #{address.id}
                            </span>
                          </div>
                          <p className="text-foreground mb-1" data-testid={`text-address-details-${address.id}`}>
                            {address.addressDetails}
                          </p>
                          <p className="text-muted-foreground text-sm" data-testid={`text-address-location-${address.id}`}>
                            {address.city}, {address.state} - {address.pinCode}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingAddress(address)}
                            data-testid={`button-edit-address-${address.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteAddressId(address.id)}
                            data-testid={`button-delete-address-${address.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address Form Modal */}
      {(showAddressForm || editingAddress) && (
        <AddressForm
          customerId={customer.id}
          address={editingAddress}
          onClose={() => {
            setShowAddressForm(false);
            setEditingAddress(null);
          }}
        />
      )}

      {/* Delete Address Confirmation */}
      {deleteAddressId && (
        <DeleteConfirmation
          type="address"
          addressId={deleteAddressId}
          onClose={() => setDeleteAddressId(null)}
          onConfirm={() => deleteAddressMutation.mutate(deleteAddressId)}
          isLoading={deleteAddressMutation.isPending}
        />
      )}
    </div>
  );
}
