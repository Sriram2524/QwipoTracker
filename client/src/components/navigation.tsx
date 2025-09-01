import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl font-bold text-primary">Customer Management</h1>
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="/customers">
                <span
                  className={`border-b-2 py-2 px-1 text-sm font-medium cursor-pointer ${
                    location === "/customers" || location === "/"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  Customers
                </span>
              </Link>
              <Link href="/reports">
                <span className="border-transparent text-muted-foreground hover:border-border hover:text-foreground border-b-2 py-2 px-1 text-sm font-medium cursor-pointer">
                  Reports
                </span>
              </Link>
              <Link href="/settings">
                <span className="border-transparent text-muted-foreground hover:border-border hover:text-foreground border-b-2 py-2 px-1 text-sm font-medium cursor-pointer">
                  Settings
                </span>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link href="/customers/new">
              <Button data-testid="button-add-customer">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
