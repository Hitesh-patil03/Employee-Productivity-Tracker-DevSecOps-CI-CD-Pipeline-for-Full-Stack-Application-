/**
 * PRODUX DATABASE SEEDER
 *
 * STEP 1: Open this file and paste your MongoDB URI on the line below.
 * STEP 2: Run:  node seed.js
 *
 * Get a free URI at: https://www.mongodb.com/atlas
 * Or use local:      mongodb://localhost:27017/produx
 */

const MONGODB_URI = process.env.MONGODB_URI || ;

// ── Validate URI before doing anything ──
if (!MONGODB_URI || MONGODB_URI === 'PASTE_YOUR_MONGODB_URI_HERE') {
  console.log('\n❌  No MongoDB URI found!\n');
  console.log('   Fix option 1 — Edit this file (seed.js) and set MONGODB_URI on line 12:');
  console.log('   const MONGODB_URI = "mongodb+srv://user:pass@cluster.mongodb.net/produx";\n');
  console.log('   Fix option 2 — Create backend/.env file with:');
  console.log('   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/produx\n');
  console.log('   Get a free MongoDB Atlas URI at: https://www.mongodb.com/atlas\n');
  process.exit(1);
}

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Inline Models (no import issues) ──

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  plainPassword: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

const employeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  department: String,
  role: String,
  productivityScore: { type: Number, default: 75 },
  hoursPerMonth: { type: Number, default: 160 },
  joinDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  loginEmail: String,
  loginPassword: String,
  credentialsShared: { type: Boolean, default: false },
  credentialsSharedAt: { type: Date, default: null },
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, default: 'Feature Dev' },
  priority: { type: String, default: 'med' },
  status: { type: String, default: 'pending' },
  dueDate: Date,
  allocatedHours: { type: Number, default: 0 },
  elapsedSeconds: { type: Number, default: 0 },
  timerRunning: { type: Boolean, default: false },
  timerStartedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

const User     = mongoose.models.User     || mongoose.model('User',     userSchema);
const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
const Task     = mongoose.models.Task     || mongoose.model('Task',     taskSchema);

// ── Seed Data ──
const EMPLOYEES = [
  { name: 'Alex Kim',      email: 'alex.kim@produx.io',      department: 'Engineering', role: 'Senior Developer',  productivityScore: 87, hoursPerMonth: 168 },
  { name: 'Sarah Chen',    email: 'sarah.chen@produx.io',    department: 'Design',      role: 'UI/UX Designer',    productivityScore: 91, hoursPerMonth: 160 },
  { name: 'Marcus Lee',    email: 'marcus.lee@produx.io',    department: 'Engineering', role: 'Backend Engineer',  productivityScore: 78, hoursPerMonth: 172 },
  { name: 'Priya Patel',   email: 'priya.patel@produx.io',   department: 'Marketing',   role: 'Marketing Lead',    productivityScore: 85, hoursPerMonth: 155 },
  { name: 'James Wilson',  email: 'james.wilson@produx.io',  department: 'Sales',       role: 'Sales Manager',     productivityScore: 73, hoursPerMonth: 165 },
  { name: 'Aisha Diallo',  email: 'aisha.diallo@produx.io',  department: 'HR',          role: 'HR Specialist',     productivityScore: 88, hoursPerMonth: 158 },
];

const PASSWORDS = ['Alpha782!', 'Delta391@', 'Nova654#', 'Sigma218$', 'Prime437!', 'Apex865@'];

const TASKS = [
  { title: 'Build authentication module',    description: 'Implement JWT-based login and registration. Include refresh tokens, password hashing with bcrypt, and rate limiting on the auth endpoints.', category: 'Feature Dev',   priority: 'high', allocatedHours: 8  },
  { title: 'Fix login redirect bug',         description: 'After OAuth login, users are redirected to /home instead of the originally requested page. Check returnUrl handling in middleware.',          category: 'Bug Fix',       priority: 'high', allocatedHours: 2  },
  { title: 'Redesign onboarding flow',       description: 'Update the 3-step onboarding to match new Figma designs. Ensure mobile responsiveness and add micro-animations.',                           category: 'Feature Dev',   priority: 'med',  allocatedHours: 12 },
  { title: 'Write unit tests for REST API',  description: 'Achieve 80% coverage on /api/v2 endpoints using Jest + Supertest. Focus on edge cases for payments and users modules.',                     category: 'Testing',       priority: 'med',  allocatedHours: 6  },
  { title: 'Q1 performance analysis report', description: 'Pull data from analytics dashboard, create summary charts, and write the executive summary for the board deck.',                             category: 'Research',      priority: 'high', allocatedHours: 5  },
  { title: 'Update component library docs',  description: 'Document all 24 new components added in v3.2. Include props tables, usage examples and accessibility notes.',                                category: 'Documentation', priority: 'low',  allocatedHours: 4  },
];

async function seed() {
  console.log('\n🌱  Produx Database Seeder\n');
  console.log(`📡  Connecting to MongoDB...`);

  await mongoose.connect(MONGODB_URI);
  console.log(`✅  Connected: ${mongoose.connection.host}\n`);

  // Clear existing
  await Promise.all([User.deleteMany({}), Employee.deleteMany({}), Task.deleteMany({})]);
  console.log('🗑   Cleared existing data\n');

  // ── Admin ──
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const admin = await User.create({
    name: 'Admin User', email: 'admin@produx.io',
    password: adminHash, role: 'admin',
  });
  console.log('👑  Admin account created');
  console.log('    Email:    admin@produx.io');
  console.log('    Password: Admin@123\n');

  // ── Employees ──
  const createdEmployees = [];
  console.log('👥  Creating employee accounts...');
  for (let i = 0; i < EMPLOYEES.length; i++) {
    const data  = EMPLOYEES[i];
    const plain = PASSWORDS[i];
    const hash  = await bcrypt.hash(plain, 12);

    const employee = await Employee.create({
      ...data,
      loginEmail: data.email,
      loginPassword: plain,
      credentialsShared: false,
    });

    const user = await User.create({
      name: data.name, email: data.email,
      password: hash, role: 'employee',
      employeeId: employee._id,
      plainPassword: plain,
      createdBy: admin._id,
    });

    employee.userId = user._id;
    await employee.save();
    createdEmployees.push(employee);

    console.log(`    ✓ ${data.name.padEnd(15)}  ${data.email.padEnd(30)}  ${plain}`);
  }

  // ── Tasks ──
  console.log('\n📋  Creating sample tasks...');
  for (let i = 0; i < TASKS.length; i++) {
    const emp     = createdEmployees[i % createdEmployees.length];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (i % 2 === 0 ? 7 : -2));

    await Task.create({
      ...TASKS[i],
      assignedTo: emp._id,
      assignedBy: admin._id,
      dueDate,
      status:         i === 1 ? 'overdue' : i === 4 ? 'inprogress' : 'pending',
      elapsedSeconds: i === 4 ? 3600 : 0,
    });
    console.log(`    ✓ "${TASKS[i].title}" → ${emp.name}`);
  }

  console.log('\n🎉  Seeding complete!\n');
  console.log('━'.repeat(60));
  console.log('  LOGIN CREDENTIALS');
  console.log('━'.repeat(60));
  console.log('  Role      Email                          Password');
  console.log('  ────      ─────                          ────────');
  console.log(`  Admin     admin@produx.io                Admin@123`);
  EMPLOYEES.forEach((e, i) =>
    console.log(`  Employee  ${e.email.padEnd(35)} ${PASSWORDS[i]}`)
  );
  console.log('━'.repeat(60));
  console.log('\n  Admin can share these via the 🔑 Credentials button in the app.');
  console.log('  Start the servers: cd backend && npm run dev\n');

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  if (err.message.includes('ECONNREFUSED')) {
    console.log('\n   Local MongoDB is not running. Start it with:');
    console.log('   Mac:   brew services start mongodb-community');
    console.log('   Linux: sudo systemctl start mongod\n');
  }
  if (err.message.includes('bad auth') || err.message.includes('Authentication')) {
    console.log('\n   Wrong MongoDB username or password in your URI.\n');
  }
  process.exit(1);
});
