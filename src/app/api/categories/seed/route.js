import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import { Category } from '../../../../models/ledger_models';

// POST /api/categories/seed - Seed categories data
export async function POST(request) {
  try {
    await connectDB();

    // Check if categories already exist
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      return NextResponse.json({
        success: false,
        message: 'Categories already exist. Cannot seed data.'
      }, { status: 400 });
    }

    // Define seed categories
    const seedCategories = [
      // Income Categories
      { name: 'Sales Revenue', description: 'Revenue from sales transactions' },
      { name: 'Service Revenue', description: 'Revenue from service provisions' },
      { name: 'Interest Income', description: 'Interest earned from investments' },
      { name: 'Other Income', description: 'Miscellaneous income' },

      // Expense Categories
      { name: 'Office Supplies', description: 'Office supplies and stationery' },
      { name: 'Utilities', description: 'Electricity, water, internet, phone' },
      { name: 'Rent & Lease', description: 'Office rent and equipment lease' },
      { name: 'Travel & Transportation', description: 'Business travel and transportation costs' },
      { name: 'Marketing & Advertising', description: 'Marketing campaigns and advertisements' },
      { name: 'Professional Services', description: 'Legal, accounting, consulting services' },
      { name: 'Insurance', description: 'Business insurance premiums' },
      { name: 'Software & Subscriptions', description: 'Software licenses and subscriptions' },
      { name: 'Equipment & Maintenance', description: 'Equipment purchases and maintenance' },
      { name: 'Bank Charges', description: 'Bank fees and transaction charges' },
      { name: 'Taxes & Licenses', description: 'Business taxes and license fees' },

      // Asset Categories
      { name: 'Cash & Bank', description: 'Cash and bank account transactions' },
      { name: 'Accounts Receivable', description: 'Money owed by customers' },
      { name: 'Inventory', description: 'Goods held for sale' },
      { name: 'Fixed Assets', description: 'Long-term assets like equipment, furniture' },

      // Liability Categories
      { name: 'Accounts Payable', description: 'Money owed to suppliers' },
      { name: 'Loans & Borrowings', description: 'Bank loans and other borrowings' },
      { name: 'Accrued Expenses', description: 'Expenses incurred but not yet paid' },

      // Equity Categories
      { name: 'Owner\'s Equity', description: 'Owner\'s investment in the business' },
      { name: 'Retained Earnings', description: 'Accumulated profits retained in business' }
    ];

    // Insert categories
    const createdCategories = await Category.insertMany(
      seedCategories.map(category => ({
        name: category.name,
        is_active: true
      }))
    );

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdCategories.length} categories`,
      categoriesCreated: createdCategories.length
    }, { status: 201 });

  } catch (error) {
    console.error('Error seeding categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to seed categories', error: error.message },
      { status: 500 }
    );
  }
}