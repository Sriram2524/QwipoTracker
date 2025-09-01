import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { insertAddressSchema, updateAddressSchema } from "@shared/schema";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Address } from "@shared/schema";

const addressFormSchema = insertAddressSchema.omit({ customerId: true });

type AddressFormData = z.infer<typeof addressFormSchema>;

interface AddressFormProps {
  customerId: number;
  address?: Address | null;
  onClose: () => void;
}

export default function AddressForm({ customerId, address, onClose }: AddressFormProps) {
  const isEdit = !!address;
  const { toast } = useToast();

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      addressDetails: address?.addressDetails || "",
      city: address?.city || "",
      state: address?.state || "",
      pinCode: address?.pinCode || "",
    },
  });

  const createAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const response = await apiRequest("POST", `/api/customers/${customerId}/addresses`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Success", description: "Address added successfully" });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add address", 
        variant: "destructive" 
      });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const response = await apiRequest("PUT", `/api/addresses/${address!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Success", description: "Address updated successfully" });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update address", 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: AddressFormData) => {
    if (isEdit) {
      updateAddressMutation.mutate(data);
    } else {
      createAddressMutation.mutate(data);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Address" : "Add New Address"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Input {...field} data-testid="input-address-city" />
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
                      <Input {...field} data-testid="input-address-state" />
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
                      <Input {...field} placeholder="000000" data-testid="input-address-pin-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-address">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                data-testid="button-save-address"
              >
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? "Update Address" : "Add Address"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
