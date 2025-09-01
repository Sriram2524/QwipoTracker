import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import type { Address } from "@shared/schema";

interface AddressListProps {
  addresses: Address[];
  onEditAddress: (address: Address) => void;
  onDeleteAddress: (addressId: number) => void;
}

export default function AddressList({ addresses, onEditAddress, onDeleteAddress }: AddressListProps) {
  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No addresses found for this customer.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address, index) => (
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
                  onClick={() => onEditAddress(address)}
                  data-testid={`button-edit-address-${address.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteAddress(address.id)}
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
  );
}
