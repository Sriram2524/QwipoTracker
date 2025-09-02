import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-lg sm:text-xl font-bold text-primary">Customer Management</h1>
              </Link>
            </div>
            {/* Desktop Navigation */}
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
          
          <div className="flex items-center space-x-2">
            {/* Add Customer Button */}
            <Link href="/customers/new">
              <Button data-testid="button-add-customer" size="sm" className="hidden sm:flex">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
              <Button data-testid="button-add-customer-mobile" size="sm" className="sm:hidden">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/customers">
                <div
                  className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                    location === "/customers" || location === "/"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Customers
                </div>
              </Link>
              <Link href="/reports">
                <div
                  className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Reports
                </div>
              </Link>
              <Link href="/settings">
                <div
                  className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
