import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, updateCustomerSchema, insertAddressSchema, updateAddressSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment monitoring
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Customer routes
  
  // GET /api/customers - Get all customers with optional filters and pagination
  app.get("/api/customers", async (req, res) => {
    try {
      const { search, city, state, pinCode, page, limit, sortBy, sortOrder } = req.query;
      
      const options = {
        search: search as string,
        city: city as string,
        state: state as string,
        pinCode: pinCode as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
      };
      
      const result = await storage.getCustomers(options);
      res.json({ success: true, data: result.customers, total: result.total });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch customers" });
    }
  });

  // GET /api/customers/:id - Get single customer with addresses
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid customer ID" });
      }

      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const addresses = await storage.getCustomerAddresses(id);
      res.json({ success: true, data: { ...customer, addresses } });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch customer" });
    }
  });

  // POST /api/customers - Create new customer
  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to create customer" });
    }
  });

  // PUT /api/customers/:id - Update customer
  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid customer ID" });
      }

      const validatedData = updateCustomerSchema.parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      res.json({ success: true, data: customer });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to update customer" });
    }
  });

  // DELETE /api/customers/:id - Delete customer
  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid customer ID" });
      }

      const success = await storage.deleteCustomer(id);
      if (!success) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      res.json({ success: true, message: "Customer deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to delete customer" });
    }
  });

  // Address routes

  // GET /api/customers/:id/addresses - Get all addresses for a customer
  app.get("/api/customers/:id/addresses", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      if (isNaN(customerId)) {
        return res.status(400).json({ success: false, message: "Invalid customer ID" });
      }

      const addresses = await storage.getCustomerAddresses(customerId);
      res.json({ success: true, data: addresses });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch addresses" });
    }
  });

  // POST /api/customers/:id/addresses - Create new address for customer
  app.post("/api/customers/:id/addresses", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      if (isNaN(customerId)) {
        return res.status(400).json({ success: false, message: "Invalid customer ID" });
      }

      // Check if customer exists
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const validatedData = insertAddressSchema.parse({ ...req.body, customerId });
      const address = await storage.createAddress(validatedData);
      res.status(201).json({ success: true, data: address });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to create address" });
    }
  });

  // PUT /api/addresses/:id - Update address
  app.put("/api/addresses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid address ID" });
      }

      const validatedData = updateAddressSchema.parse(req.body);
      const address = await storage.updateAddress(id, validatedData);
      
      if (!address) {
        return res.status(404).json({ success: false, message: "Address not found" });
      }

      res.json({ success: true, data: address });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to update address" });
    }
  });

  // DELETE /api/addresses/:id - Delete address
  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid address ID" });
      }

      const success = await storage.deleteAddress(id);
      if (!success) {
        return res.status(404).json({ success: false, message: "Address not found" });
      }

      res.json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to delete address" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
