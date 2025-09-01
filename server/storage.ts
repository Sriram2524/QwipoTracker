import { type Customer, type InsertCustomer, type UpdateCustomer, type Address, type InsertAddress, type UpdateAddress, type CustomerWithAddresses } from "@shared/schema";

export interface IStorage {
  // Customer CRUD operations
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomers(options?: {
    search?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ customers: CustomerWithAddresses[]; total: number }>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: UpdateCustomer): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Address CRUD operations
  getAddress(id: number): Promise<Address | undefined>;
  getCustomerAddresses(customerId: number): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: UpdateAddress): Promise<Address | undefined>;
  deleteAddress(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private customers: Map<number, Customer>;
  private addresses: Map<number, Address>;
  private nextCustomerId: number;
  private nextAddressId: number;

  constructor() {
    this.customers = new Map();
    this.addresses = new Map();
    this.nextCustomerId = 1;
    this.nextAddressId = 1;
    this.seedSampleData();
  }

  private seedSampleData() {
    // Add sample customers
    const sampleCustomers = [
      { firstName: "John", lastName: "Doe", phoneNumber: "+91 98765 43210" },
      { firstName: "Jane", lastName: "Smith", phoneNumber: "+91 87654 32109" },
      { firstName: "Raj", lastName: "Patel", phoneNumber: "+91 76543 21098" },
      { firstName: "Priya", lastName: "Sharma", phoneNumber: "+91 65432 10987" },
      { firstName: "Michael", lastName: "Johnson", phoneNumber: "+91 54321 09876" },
    ];

    const sampleAddresses = [
      [{ addressDetails: "123 Main Street, Andheri West", city: "Mumbai", state: "Maharashtra", pinCode: "400058" }],
      [{ addressDetails: "456 Park Avenue, Connaught Place", city: "Delhi", state: "Delhi", pinCode: "110001" },
       { addressDetails: "789 Shopping Complex, Karol Bagh", city: "Delhi", state: "Delhi", pinCode: "110005" }],
      [{ addressDetails: "321 Tech Hub, Electronic City", city: "Bangalore", state: "Karnataka", pinCode: "560100" }],
      [{ addressDetails: "654 Residency Road, T Nagar", city: "Chennai", state: "Tamil Nadu", pinCode: "600017" },
       { addressDetails: "987 Beach Road, Marina", city: "Chennai", state: "Tamil Nadu", pinCode: "600013" },
       { addressDetails: "147 IT Park, Velachery", city: "Chennai", state: "Tamil Nadu", pinCode: "600042" }],
      [{ addressDetails: "258 Business District, Bandra", city: "Mumbai", state: "Maharashtra", pinCode: "400050" }],
    ];

    sampleCustomers.forEach((customerData, index) => {
      const customer: Customer = { ...customerData, id: this.nextCustomerId++ };
      this.customers.set(customer.id, customer);
      
      // Add addresses for this customer
      sampleAddresses[index]?.forEach(addressData => {
        const address: Address = { 
          ...addressData, 
          id: this.nextAddressId++, 
          customerId: customer.id 
        };
        this.addresses.set(address.id, address);
      });
    });
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomers(options?: {
    search?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ customers: CustomerWithAddresses[]; total: number }> {
    const { search, city, state, pinCode, page = 1, limit = 10, sortBy = 'firstName', sortOrder = 'asc' } = options || {};
    
    let customersWithAddresses = Array.from(this.customers.values()).map(customer => {
      const customerAddresses = Array.from(this.addresses.values()).filter(
        address => address.customerId === customer.id
      );
      return { ...customer, addresses: customerAddresses };
    });

    // Filter by search term (case-insensitive)
    if (search) {
      const searchLower = search.toLowerCase();
      customersWithAddresses = customersWithAddresses.filter(customer =>
        customer.firstName.toLowerCase().includes(searchLower) ||
        customer.lastName.toLowerCase().includes(searchLower) ||
        customer.phoneNumber.toLowerCase().includes(searchLower) ||
        customer.addresses.some(address => 
          address.city.toLowerCase().includes(searchLower) ||
          address.state.toLowerCase().includes(searchLower) ||
          address.pinCode.includes(search)
        )
      );
    }

    // Filter by city (case-insensitive)
    if (city && city !== 'All Cities') {
      customersWithAddresses = customersWithAddresses.filter(customer =>
        customer.addresses.some(address => address.city.toLowerCase() === city.toLowerCase())
      );
    }

    // Filter by state (case-insensitive)
    if (state && state !== 'All States') {
      customersWithAddresses = customersWithAddresses.filter(customer =>
        customer.addresses.some(address => address.state.toLowerCase() === state.toLowerCase())
      );
    }

    // Filter by pinCode
    if (pinCode) {
      customersWithAddresses = customersWithAddresses.filter(customer =>
        customer.addresses.some(address => address.pinCode.includes(pinCode))
      );
    }

    // Sort
    customersWithAddresses.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'firstName':
          aValue = a.firstName;
          bValue = b.firstName;
          break;
        case 'lastName':
          aValue = a.lastName;
          bValue = b.lastName;
          break;
        case 'phoneNumber':
          aValue = a.phoneNumber;
          bValue = b.phoneNumber;
          break;
        default:
          aValue = a.firstName;
          bValue = b.firstName;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    const total = customersWithAddresses.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCustomers = customersWithAddresses.slice(startIndex, endIndex);

    return { customers: paginatedCustomers, total };
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.nextCustomerId++;
    const customer: Customer = { ...insertCustomer, id };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updateCustomer: UpdateCustomer): Promise<Customer | undefined> {
    const existing = this.customers.get(id);
    if (!existing) return undefined;
    
    const updated: Customer = { ...existing, ...updateCustomer };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    // Delete associated addresses first
    const addressesToDelete = Array.from(this.addresses.values()).filter(
      address => address.customerId === id
    );
    
    addressesToDelete.forEach(address => {
      this.addresses.delete(address.id);
    });
    
    return this.customers.delete(id);
  }

  async getAddress(id: number): Promise<Address | undefined> {
    return this.addresses.get(id);
  }

  async getCustomerAddresses(customerId: number): Promise<Address[]> {
    return Array.from(this.addresses.values()).filter(
      address => address.customerId === customerId
    );
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const id = this.nextAddressId++;
    const address: Address = { ...insertAddress, id };
    this.addresses.set(id, address);
    return address;
  }

  async updateAddress(id: number, updateAddress: UpdateAddress): Promise<Address | undefined> {
    const existing = this.addresses.get(id);
    if (!existing) return undefined;
    
    const updated: Address = { ...existing, ...updateAddress };
    this.addresses.set(id, updated);
    return updated;
  }

  async deleteAddress(id: number): Promise<boolean> {
    return this.addresses.delete(id);
  }
}

export const storage = new MemStorage();
