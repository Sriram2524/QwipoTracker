import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";
import { insertCustomerSchema, insertAddressSchema } from "@shared/schema";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CustomerWithAddresses } from "@shared/schema";

const customerFormSchema = insertCustomerSchema.extend({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name must be less than 50 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters").max(20, "Phone number must be less than 20 characters"),
  // Primary address fields
  addressDetails: z.string().min(10, "Address details must be at least 10 characters").max(200, "Address details must be less than 200 characters"),
  city: z.string().min(2, "City name must be at least 2 characters").max(50, "City name must be less than 50 characters"),
  state: z.string().min(2, "State name must be at least 2 characters").max(50, "State name must be less than 50 characters"),
  pinCode: z.string().regex(/^\d{6}$/, "PIN code must be exactly 6 digits"),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

export default function CustomerFormPage() {
  const [, editParams] = useRoute("/customers/:id/edit");
  const [, newParams] = useRoute("/customers/new");
  const [, setLocation] = useLocation();
  
  const customerId = editParams?.id ? parseInt(editParams.id) : null;
  const isEdit = !!customerId && !isNaN(customerId);
  const isNew = !!newParams;
  const { toast } = useToast();

  const { data: customer, isLoading } = useQuery<CustomerWithAddresses>({
    queryKey: ["/api/customers", customerId?.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      const result = await response.json();
      return result.data;
    },
    enabled: isEdit && !!customerId,
  });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      addressDetails: "",
      city: "",
      state: "",
      pinCode: "",
    },
  });

  // Update form values when customer data is loaded
  if (isEdit && customer && !form.formState.isDirty && !isNew) {
    const primaryAddress = customer.addresses[0];
    form.reset({
      firstName: customer.firstName,
      lastName: customer.lastName,
      phoneNumber: customer.phoneNumber,
      addressDetails: primaryAddress?.addressDetails || "",
      city: primaryAddress?.city || "",
      state: primaryAddress?.state || "",
      pinCode: primaryAddress?.pinCode || "",
    });
  }

  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const customerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      };
      
      const customerResponse = await apiRequest("POST", "/api/customers", customerData);
      const newCustomer = await customerResponse.json();
      
      if (newCustomer.success) {
        const addressData = {
          addressDetails: data.addressDetails,
          city: data.city,
          state: data.state,
          pinCode: data.pinCode,
        };
        
        await apiRequest("POST", `/api/customers/${newCustomer.data.id}/addresses`, addressData);
      }
      
      return newCustomer;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Success", description: "Customer created successfully" });
      setLocation(`/customers/${result.data.id}`);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create customer", 
        variant: "destructive" 
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const customerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      };
      
      await apiRequest("PUT", `/api/customers/${customerId}`, customerData);
      
      // Update primary address if it exists
      if (customer?.addresses[0]) {
        const addressData = {
          addressDetails: data.addressDetails,
          city: data.city,
          state: data.state,
          pinCode: data.pinCode,
        };
        
        await apiRequest("PUT", `/api/addresses/${customer.addresses[0].id}`, addressData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customerId?.toString()] });
      toast({ title: "Success", description: "Customer updated successfully" });
      setLocation(`/customers/${customerId}`);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update customer", 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    if (isEdit) {
      updateCustomerMutation.mutate(data);
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  if (isEdit && isLoading && !isNew) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
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
            <a href="#" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
              <i className="fas fa-home mr-2"></i>
              Home
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <i className="fas fa-chevron-right text-muted-foreground mx-2"></i>
              <a href="/customers" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Customers
              </a>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <i className="fas fa-chevron-right text-muted-foreground mx-2"></i>
              <span className="text-sm font-medium text-foreground">
                {isEdit ? "Edit Customer" : "Add Customer"}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation(isEdit ? `/customers/${customerId}` : "/customers")} data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Customer" : "Add New Customer"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Information */}
              <div>
                <h4 className="text-md font-medium text-foreground mb-4">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          First Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Last Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Phone Number <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+91 XXXXX XXXXX" data-testid="input-phone-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Primary Address Information */}
              <div>
                <h4 className="text-md font-medium text-foreground mb-4">
                  {isEdit ? "Primary Address" : "Primary Address"}
                </h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="addressDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Address Details <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Enter full address including building, street, area..."
                            data-testid="textarea-address-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            City <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            State <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pinCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            PIN Code <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="000000" data-testid="input-pin-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(isEdit ? `/customers/${customerId}` : "/customers")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                  data-testid="button-save-customer"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? "Update Customer" : "Save Customer"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
