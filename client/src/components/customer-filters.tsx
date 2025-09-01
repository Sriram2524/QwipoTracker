import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";

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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                placeholder="Search by name or phone..."
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
            <Select value={filters.city} onValueChange={(value) => onFilterChange({ city: value })}>
              <SelectTrigger data-testid="select-city">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Cities">All Cities</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="state-filter" className="block text-sm font-medium text-foreground mb-2">
              State
            </Label>
            <Select value={filters.state} onValueChange={(value) => onFilterChange({ state: value })}>
              <SelectTrigger data-testid="select-state">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All States">All States</SelectItem>
                <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Karnataka">Karnataka</SelectItem>
                <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <div className="space-x-2">
              <Button variant="secondary" data-testid="button-apply-filters">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
              <Button variant="ghost" onClick={onClearFilters} data-testid="button-clear-filters">
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
