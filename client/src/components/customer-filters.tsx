import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from "lucide-react";

interface CustomerFiltersProps {
  filters: {
    search: string;
    city: string;
    state: string;
    pinCode: string;
  };
  onFilterChange: (filters: Partial<CustomerFiltersProps['filters']>) => void;
  onClearFilters: () => void;
}

export default function CustomerFilters({ filters, onFilterChange, onClearFilters }: CustomerFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label htmlFor="search" className="block text-sm font-medium text-foreground mb-2">
              Search Customers
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="search"
                data-testid="input-search"
                placeholder="Search by name, phone, city, state, or pincode..."
                value={filters.search}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="city-filter" className="block text-sm font-medium text-foreground mb-2">
              City
            </Label>
            <Input
              id="city-filter"
              data-testid="input-city"
              placeholder="Filter by city..."
              value={filters.city}
              onChange={(e) => onFilterChange({ city: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="state-filter" className="block text-sm font-medium text-foreground mb-2">
              State
            </Label>
            <Input
              id="state-filter"
              data-testid="input-state"
              placeholder="Filter by state..."
              value={filters.state}
              onChange={(e) => onFilterChange({ state: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="pincode-filter" className="block text-sm font-medium text-foreground mb-2">
              Pincode
            </Label>
            <Input
              id="pincode-filter"
              data-testid="input-pincode"
              placeholder="Filter by pincode..."
              value={filters.pinCode}
              onChange={(e) => onFilterChange({ pinCode: e.target.value })}
            />
          </div>
          
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={onClearFilters} data-testid="button-clear-filters">
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
