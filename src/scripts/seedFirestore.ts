import { doc, writeBatch, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

const now = Timestamp.now()

async function seedFirestore() {
  const batch = writeBatch(db)

  // Companies
  const companies = [
    {
      id: 'company-auction-001',
      name: 'Copart Auction',
      type: 'Auction',
      phone_number: '+1 555 111 2222',
      address: 'Dallas, TX',
      email: 'info@copart.com',
      notes: 'Main auction place',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'company-shipping-001',
      name: 'Fast Auto Shipping',
      type: 'Shipping',
      phone_number: '+1 555 333 4444',
      address: 'Houston, TX',
      email: 'shipping@example.com',
      notes: 'Shipping provider',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'company-repair-001',
      name: 'Elite Repair Shop',
      type: 'Repair Shop',
      phone_number: '+1 555 777 8888',
      address: 'Ohio, USA',
      email: 'repair@example.com',
      notes: 'Repair workshop',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'company-inspection-001',
      name: 'Ohio Inspection Center',
      type: 'Inspection Center',
      phone_number: '+1 555 999 0000',
      address: 'Columbus, OH',
      email: 'inspection@example.com',
      notes: 'Inspection center',
      created_at: now,
      updated_at: now,
    },
  ]

  companies.forEach((company) => {
    batch.set(doc(db, 'companies', company.id), company)
  })

  // Cars
  const cars = [
    {
      id: 'car-001',
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: 'TESTVIN001',
      lot_number: 'LOT-1001',
      status: 'purchased',
      title_type: 'Salvage',
      current_title_type: 'Salvage',
      title_last_updated_at: '2026-06-01',
      title_updated_by: 'Admin',
      purchase_date: '2026-05-20',
      purchase_price: 5000,
      selling_price: 8500,
      purchase_place_id: 'company-auction-001',
      carfax_type: 'link',
      carfax_link: 'https://example.com/carfax/toyota-camry',
      carfax_pdf_name: null,
      carfax_pdf_url: null,
      notes: 'Purchased from auction',
      photo_url: '/images/car-placeholder.svg',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'car-002',
      brand: 'Honda',
      model: 'Accord',
      year: 2019,
      vin: 'TESTVIN002',
      lot_number: 'LOT-1002',
      status: 'repairing',
      title_type: 'Clean',
      current_title_type: 'Clean',
      title_last_updated_at: '2026-06-05',
      title_updated_by: 'Admin',
      purchase_date: '2026-05-25',
      purchase_price: 6500,
      selling_price: 10500,
      purchase_place_id: 'company-auction-001',
      carfax_type: 'pdf',
      carfax_link: null,
      carfax_pdf_name: 'accord-carfax.pdf',
      carfax_pdf_url: '',
      notes: 'Needs bumper repair',
      photo_url: '/images/car-placeholder.svg',
      created_at: now,
      updated_at: now,
    },
  ]

  cars.forEach((car) => {
    batch.set(doc(db, 'cars', car.id), car)
  })

  // Car Title History
  const carTitleHistory = [
    {
      id: 'title-history-001',
      car_id: 'car-001',
      previous_title_type: 'Salvage',
      new_title_type: 'Rebuilt',
      change_date: '2026-06-10',
      updated_by: 'Admin',
      notes: 'Title converted after inspection',
      created_at: now,
    },
  ]

  carTitleHistory.forEach((item) => {
    batch.set(doc(db, 'car_title_history', item.id), item)
  })

  // Partners
  const partners = [
    {
      id: 'partner-001',
      name: 'Ahmed Ali',
      email: 'ahmed@example.com',
      phone: '+218 91 000 0000',
      status: 'Active',
      notes: 'Main investor',
      investment_percentage: 50,
      total_contribution: 5000,
      total_profit: 0,
      total_loss: 0,
      final_balance: 5000,
      created_at: now,
    },
    {
      id: 'partner-002',
      name: 'Mohamed Salem',
      email: 'mohamed@example.com',
      phone: '+218 92 000 0000',
      status: 'Active',
      notes: 'Second investor',
      investment_percentage: 50,
      total_contribution: 5000,
      total_profit: 0,
      total_loss: 0,
      final_balance: 5000,
      created_at: now,
    },
  ]

  partners.forEach((partner) => {
    batch.set(doc(db, 'partners', partner.id), partner)
  })

  // Partner Contributions
  const partnerContributions = [
    {
      id: 'contribution-001',
      partner_id: 'partner-001',
      car_id: 'car-001',
      car_name: 'Toyota Camry 2020',
      contribution_amount: 2500,
      investment_percentage: 50,
      contribution_date: '2026-05-20',
      payment_method: 'Cash',
      notes: 'Initial contribution',
      created_at: now,
    },
    {
      id: 'contribution-002',
      partner_id: 'partner-002',
      car_id: 'car-001',
      car_name: 'Toyota Camry 2020',
      contribution_amount: 2500,
      investment_percentage: 50,
      contribution_date: '2026-05-20',
      payment_method: 'Zelle',
      notes: 'Initial contribution',
      created_at: now,
    },
  ]

  partnerContributions.forEach((item) => {
    batch.set(doc(db, 'partner_contributions', item.id), item)
  })

  // Expenses
  const expenses = [
    {
      id: 'expense-001',
      car_id: 'car-001',
      expense_type: 'Purchase',
      amount: 5000,
      paid_by: 'Ahmed Ali',
      payment_method: 'Cash',
      date: '2026-05-20',
      notes: 'Purchase price',
      invoice_name: null,
      invoice_url: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'expense-002',
      car_id: 'car-001',
      expense_type: 'Shipping',
      amount: 700,
      paid_by: 'Company Account',
      payment_method: 'Zelle',
      date: '2026-05-23',
      notes: 'Shipping cost',
      invoice_name: 'shipping-invoice.pdf',
      invoice_url: '',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'expense-003',
      car_id: 'car-002',
      expense_type: 'Repair',
      amount: 900,
      paid_by: 'Company Account',
      payment_method: 'Card',
      date: '2026-06-01',
      notes: 'Body repair',
      invoice_name: 'repair-invoice.pdf',
      invoice_url: '',
      created_at: now,
      updated_at: now,
    },
  ]

  expenses.forEach((expense) => {
    batch.set(doc(db, 'expenses', expense.id), expense)
  })

  // Parts
  const parts = [
    {
      id: 'part-001',
      part_name: 'Front Bumper',
      price: 350,
      supplier_id: 'company-repair-001',
      supplier_name: 'Elite Repair Shop',
      purchase_date: '2026-06-02',
      installed: false,
      related_car_id: 'car-002',
      related_car_name: 'Honda Accord 2019',
      invoice_name: null,
      invoice_url: null,
      notes: 'Needed for repair',
      created_at: now,
      updated_at: now,
    },
  ]

  parts.forEach((part) => {
    batch.set(doc(db, 'parts', part.id), part)
  })

  // Inspections
  const inspections = [
    {
      id: 'inspection-001',
      car_id: 'car-001',
      place_id: 'company-inspection-001',
      date: '2026-06-12',
      time: '10:30',
      status: 'Pending',
      notes: 'Inspection appointment',
      reminder_sent: false,
      created_at: now,
      updated_at: now,
    },
  ]

  inspections.forEach((inspection) => {
    batch.set(doc(db, 'inspections', inspection.id), inspection)
  })

  // Notifications
  const notifications = [
    {
      id: 'notification-001',
      title: 'Inspection Reminder',
      message: 'Toyota Camry 2020 has an upcoming inspection.',
      type: 'Inspection',
      severity: 'Medium',
      status: 'Unread',
      related_car_id: 'car-001',
      related_car_name: 'Toyota Camry 2020',
      created_at: now,
      due_date: '2026-06-12',
      action_url: '/inspections',
      created_by: 'system',
    },
  ]

  notifications.forEach((notification) => {
    batch.set(doc(db, 'notifications', notification.id), notification)
  })

  // Activity Logs
  const activityLogs = [
    {
      id: 'activity-001',
      user_id: 'admin-default',
      user_name: 'Admin',
      user_role: 'SUPER_ADMIN',
      action: 'Create',
      module: 'Cars',
      entity_type: 'car',
      entity_name: 'Toyota Camry 2020',
      description: 'Created Toyota Camry 2020 car record',
      changed_fields: null,
      date: '2026-06-10',
      time: '09:30',
      created_at: now,
      ip_address: '127.0.0.1',
    },
  ]

  activityLogs.forEach((log) => {
    batch.set(doc(db, 'activity_logs', log.id), log)
  })

  // Managed Users
  const managedUsers = [
    {
      id: 'admin-default',
      full_name: 'Admin',
      email: 'car.d.d.admin@gmail.com',
      phone: '+218 91 111 1111',
      role: 'SUPER_ADMIN',
      status: 'Active',
      is_protected: true,
      // Firebase Auth password for this protected account should be set to CarLotE@2026!Adm1n.
      // The password itself lives in Firebase Authentication, not in Firestore seed data.
      created_at: now,
      last_login: null,
    },
    {
      id: 'user-002',
      full_name: 'Sales User',
      email: 'sales@example.com',
      phone: '+218 92 222 2222',
      role: 'USER',
      status: 'Active',
      is_protected: false,
      created_at: now,
      last_login: null,
    },
  ]

  managedUsers.forEach((user) => {
    batch.set(doc(db, 'managed_users', user.id), user)
  })

  await batch.commit()

  // eslint-disable-next-line no-console
  console.log('Firestore seeded successfully')
}

seedFirestore().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Error seeding Firestore:', error)
})
