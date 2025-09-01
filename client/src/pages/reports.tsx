import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Users, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch('/api/customers?limit=1000');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    },
  });

  const customers = data?.data || [];
  const totalCustomers = customers.length;
  const totalAddresses = customers.reduce((acc: number, customer: any) => acc + customer.addresses.length, 0);
  const uniqueCities = new Set(customers.flatMap((customer: any) => customer.addresses.map((addr: any) => addr.city))).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/customers">
          <Button variant="ghost" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl">
          Reports & Analytics
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          View customer statistics and insights
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{totalCustomers}</div>
            )}
            <p className="text-xs text-muted-foreground">Active customer records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{totalAddresses}</div>
            )}
            <p className="text-xs text-muted-foreground">Registered addresses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">City Distribution</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{uniqueCities}</div>
            )}
            <p className="text-xs text-muted-foreground">Different cities</p>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card className="mt-8">
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Advanced Analytics Coming Soon</h3>
          <p className="text-muted-foreground">
            Detailed reports, charts, and customer insights will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}