import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface DeleteConfirmationProps {
  type?: "customer" | "address";
  customerId?: number;
  addressId?: number;
  onClose: () => void;
  onConfirm?: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmation({ 
  type = "customer", 
  customerId, 
  addressId, 
  onClose, 
  onConfirm,
  isLoading: externalLoading = false
}: DeleteConfirmationProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const deleteCustomerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/customers/${customerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Success", description: "Customer deleted successfully" });
      setLocation("/customers");
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete customer", 
        variant: "destructive" 
      });
    },
  });

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else if (type === "customer" && customerId) {
      deleteCustomerMutation.mutate();
    }
  };

  const isLoading = externalLoading || deleteCustomerMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-foreground">Confirm Deletion</h3>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-muted-foreground">
              {type === "customer" 
                ? "Are you sure you want to delete this customer? This action cannot be undone and will also remove all associated addresses."
                : "Are you sure you want to delete this address? This action cannot be undone."
              }
            </p>
          </div>
          <div className="flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              data-testid="button-cancel-delete"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
              data-testid="button-confirm-delete"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isLoading ? "Deleting..." : `Delete ${type === "customer" ? "Customer" : "Address"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
