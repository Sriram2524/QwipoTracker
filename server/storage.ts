import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, or, like, desc, asc, count, inArray } from "drizzle-orm";
import { customers, addresses, type Customer, type InsertCustomer, type UpdateCustomer, type Address, type InsertAddress, type UpdateAddress, type CustomerWithAddresses } from "@shared/schema";

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

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export class PostgreSQLStorage implements IStorage {
  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
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
    
    // Build where conditions
    const conditions = [];
    
    if (search) {
      const searchTerm = `%${search}%`;
      // Search in customer fields and address fields
      const customerMatches = await db.select({ id: customers.id })
        .from(customers)
        .where(
          or(
            like(customers.firstName, searchTerm),
            like(customers.lastName, searchTerm),
            like(customers.phoneNumber, searchTerm)
          )
        );
      
      const addressMatches = await db.select({ customerId: addresses.customerId })
        .from(addresses)
        .where(
          or(
            like(addresses.city, searchTerm),
            like(addresses.state, searchTerm),
            like(addresses.pinCode, searchTerm)
          )
        );
      
      const allMatchingCustomerIds = new Set([
        ...customerMatches.map(c => c.id),
        ...addressMatches.map(a => a.customerId)
      ]);
      
      if (allMatchingCustomerIds.size > 0) {
        conditions.push(inArray(customers.id, Array.from(allMatchingCustomerIds)));
      } else {
        // No matches found, return empty result
        return { customers: [], total: 0 };
      }
    }

    // Build the complete query
    const orderDirection = sortOrder === 'desc' ? desc : asc;
    let orderByColumn;
    switch (sortBy) {
      case 'lastName':
        orderByColumn = orderDirection(customers.lastName);
        break;
      case 'phoneNumber':
        orderByColumn = orderDirection(customers.phoneNumber);
        break;
      default:
        orderByColumn = orderDirection(customers.firstName);
    }

    // Get total count for customers matching the search criteria
    let totalCount;
    if (search) {
      // Use the same search logic for count
      const searchTerm = `%${search}%`;
      const customerMatches = await db.select({ id: customers.id })
        .from(customers)
        .where(
          or(
            like(customers.firstName, searchTerm),
            like(customers.lastName, searchTerm),
            like(customers.phoneNumber, searchTerm)
          )
        );
      
      const addressMatches = await db.select({ customerId: addresses.customerId })
        .from(addresses)
        .where(
          or(
            like(addresses.city, searchTerm),
            like(addresses.state, searchTerm),
            like(addresses.pinCode, searchTerm)
          )
        );
      
      const allMatchingCustomerIds = new Set([
        ...customerMatches.map(c => c.id),
        ...addressMatches.map(a => a.customerId)
      ]);
      
      totalCount = allMatchingCustomerIds.size;
    } else {
      const totalResult = await db.select({ count: count() }).from(customers);
      totalCount = totalResult[0]?.count || 0;
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    
    let customerResults;
    if (conditions.length > 0) {
      customerResults = await db.select().from(customers)
        .where(and(...conditions))
        .orderBy(orderByColumn)
        .limit(limit)
        .offset(offset);
    } else {
      customerResults = await db.select().from(customers)
        .orderBy(orderByColumn)
        .limit(limit)
        .offset(offset);
    }

    // Get addresses for each customer
    const customersWithAddresses: CustomerWithAddresses[] = [];
    for (const customer of customerResults) {
      let customerAddresses = await db.select().from(addresses).where(eq(addresses.customerId, customer.id));
      
      // Filter addresses by location filters (partial matches)
      if (city && city.trim()) {
        customerAddresses = customerAddresses.filter(addr => 
          addr.city.toLowerCase().includes(city.toLowerCase().trim())
        );
      }
      if (state && state.trim()) {
        customerAddresses = customerAddresses.filter(addr => 
          addr.state.toLowerCase().includes(state.toLowerCase().trim())
        );
      }
      if (pinCode && pinCode.trim()) {
        customerAddresses = customerAddresses.filter(addr => 
          addr.pinCode.includes(pinCode.trim())
        );
      }

      // Only include customer if they have matching addresses (when location filters are applied)
      if ((city && city.trim()) || (state && state.trim()) || (pinCode && pinCode.trim())) {
        if (customerAddresses.length > 0) {
          customersWithAddresses.push({ ...customer, addresses: customerAddresses });
        }
      } else {
        customersWithAddresses.push({ ...customer, addresses: customerAddresses });
      }
    }

    return { customers: customersWithAddresses, total: totalCount };
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(customer).returning();
    return result[0];
  }

  async updateCustomer(id: number, customer: UpdateCustomer): Promise<Customer | undefined> {
    const result = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return result[0];
  }

  async deleteCustomer(id: number): Promise<boolean> {
    // Delete associated addresses first due to foreign key constraints
    await db.delete(addresses).where(eq(addresses.customerId, id));
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.rowCount > 0;
  }

  async getAddress(id: number): Promise<Address | undefined> {
    const result = await db.select().from(addresses).where(eq(addresses.id, id));
    return result[0];
  }

  async getCustomerAddresses(customerId: number): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.customerId, customerId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const result = await db.insert(addresses).values(address).returning();
    return result[0];
  }

  async updateAddress(id: number, address: UpdateAddress): Promise<Address | undefined> {
    const result = await db.update(addresses).set(address).where(eq(addresses.id, id)).returning();
    return result[0];
  }

  async deleteAddress(id: number): Promise<boolean> {
    const result = await db.delete(addresses).where(eq(addresses.id, id));
    return result.rowCount > 0;
  }
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

// Create PostgreSQL storage instance
const postgresStorage = new PostgreSQLStorage();

// Seed sample data if database is empty
async function seedDatabase() {
  try {
    const { customers: existingCustomers } = await postgresStorage.getCustomers({ limit: 1 });
    
    if (existingCustomers.length === 0) {
      console.log("Seeding database with sample data...");
      
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

      for (let i = 0; i < sampleCustomers.length; i++) {
        const customer = await postgresStorage.createCustomer(sampleCustomers[i]);
        
        if (sampleAddresses[i]) {
          for (const addressData of sampleAddresses[i]) {
            await postgresStorage.createAddress({
              ...addressData,
              customerId: customer.id
            });
          }
        }
      }
      
      console.log("Database seeded successfully!");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Initialize and seed database
seedDatabase();

export const storage = postgresStorage;
