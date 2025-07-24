import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Customer from '../../../../models/customers';
import User from '../../../../models/user_models';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await connectDB();
    
    // Check if customers already exist
    const existingCount = await Customer.countDocuments();
    
    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already has ${existingCount} customers`,
        existingCount
      });
    }

    // Hash password for seed data
    const defaultPassword = 'password123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // Create sample customers
    const sampleCustomers = [
      {
        company_name: 'Tech Solutions Inc.',
        contact_email: 'contact@techsolutions.com',
        contact_phone: '+1-555-0101',
        password: hashedPassword,
        address: '123 Business District, Tech City, TC 12345',
        subscription_status: 'active',
        permissions: ['read_invoices', 'write_invoices', 'read_reports']
      },
      {
        company_name: 'Global Marketing Ltd.',
        contact_email: 'info@globalmarketing.com',
        contact_phone: '+1-555-0102',
        password: hashedPassword,
        address: '456 Commerce Ave, Marketing Town, MT 67890',
        subscription_status: 'active',
        permissions: ['read_invoices', 'billing_management', 'profile_management']
      },
      {
        company_name: 'Innovation Hub',
        contact_email: 'hello@innovationhub.com',
        contact_phone: '+1-555-0103',
        password: hashedPassword,
        address: '789 Innovation Street, Future City, FC 11111',
        subscription_status: 'suspended',
        permissions: ['read_invoices']
      },
      {
        company_name: 'Digital Dynamics',
        contact_email: 'support@digitaldynamics.com',
        contact_phone: '+1-555-0104',
        password: hashedPassword,
        address: '321 Digital Plaza, Code Valley, CV 22222',
        subscription_status: 'active',
        permissions: ['read_invoices', 'write_invoices', 'delete_invoices', 'read_reports', 'write_reports']
      },
      {
        company_name: 'Creative Studios',
        contact_email: 'creative@creativestudios.com',
        contact_phone: '+1-555-0105',
        password: hashedPassword,
        address: '654 Art District, Design City, DC 33333',
        subscription_status: 'cancelled',
        permissions: []
      }
    ];

    const createdCustomers = await Customer.insertMany(sampleCustomers);

    // Create corresponding user records for each customer
    const userPromises = createdCustomers.map(async (customer) => {
      const companyWords = customer.company_name.trim().split(' ');
      const firstName = companyWords[0] || 'Customer';
      const lastName = companyWords.length > 1 ? companyWords.slice(1).join(' ') : 'User';

      try {
        const newUser = new User({
          email: customer.contact_email,
          password_hash: hashedPassword,
          client_id: customer._id,
          first_name: firstName,
          last_name: lastName,
          role: 'customers',
          permissions: customer.permissions || [],
          is_active: customer.subscription_status === 'active',
        });

        return await newUser.save();
      } catch (error) {
        console.error(`Failed to create user for ${customer.contact_email}:`, error);
        return null;
      }
    });

    const createdUsers = await Promise.all(userPromises);
    const successfulUsers = createdUsers.filter(user => user !== null);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdCustomers.length} sample customers and ${successfulUsers.length} user accounts`,
      details: {
        customers: createdCustomers.length,
        users: successfulUsers.length,
        defaultPassword: defaultPassword
      },
      customers: createdCustomers.map(c => ({
        id: c._id.toString(),
        company_name: c.company_name,
        contact_email: c.contact_email,
        subscription_status: c.subscription_status
      }))
    });

  } catch (error) {
    console.error('Error seeding customers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to seed customers', error: error.message },
      { status: 500 }
    );
  }
}