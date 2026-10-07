const bcrypt = require('bcryptjs');
const db = require('./database');

async function seed(force = false) {
  console.log('--- Seeding Realistic Academic Library Database ---');

  if (force) {
    db.exec(`
      DELETE FROM issues;
      DELETE FROM books;
      DELETE FROM users;
      DELETE FROM sqlite_sequence WHERE name IN ('issues', 'books', 'users');
    `);
    console.log('Cleared existing records.');
  } else {
    const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (existingUsers && existingUsers.count > 0) {
      console.log(`Database has existing records. Skipping automatic reseed.`);
      return;
    }
  }

  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  const libPassword = await bcrypt.hash('lib123', saltRounds);
  const studentPassword = await bcrypt.hash('student123', saltRounds);

  // Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, department, studentId, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Admin
  insertUser.run('Prof. Rajeshwari Sen', 'admin@library.com', adminPassword, 'admin', 'University Administration', 'ADM-001', '+91 98101 23450');

  // Librarians
  insertUser.run('Dr. Savitri Venkataraman', 'savitri.librarian@library.com', libPassword, 'librarian', 'Chief Librarian', 'LIB-101', '+91 98450 11223');
  insertUser.run('Karthik Ramanathan', 'karthik.librarian@library.com', libPassword, 'librarian', 'Circulation & Reference', 'LIB-102', '+91 98450 44556');

  // Indian Students
  const students = [
    { name: 'Aarav Sharma', email: 'aarav.sharma@university.edu', dept: 'Computer Science', id: 'STU-2024-001', phone: '+91 98200 11001' },
    { name: 'Priya Patel', email: 'priya.patel@university.edu', dept: 'Electrical & Electronics', id: 'STU-2024-002', phone: '+91 98200 11002' },
    { name: 'Rohan Iyer', email: 'rohan.iyer@university.edu', dept: 'Mechanical Engineering', id: 'STU-2024-003', phone: '+91 98200 11003' },
    { name: 'Ananya Deshmukh', email: 'ananya.deshmukh@university.edu', dept: 'Economics & Management', id: 'STU-2024-004', phone: '+91 98200 11004' },
    { name: 'Aditya Verma', email: 'aditya.verma@university.edu', dept: 'Mathematics & Computing', id: 'STU-2024-005', phone: '+91 98200 11005' },
    { name: 'Kavita Nair', email: 'kavita.nair@university.edu', dept: 'Civil Engineering', id: 'STU-2024-006', phone: '+91 98200 11006' },
    { name: 'Meera Sundaram', email: 'meera.sundaram@university.edu', dept: 'Literature & Philosophy', id: 'STU-2024-007', phone: '+91 98200 11007' },
  ];

  for (const s of students) {
    insertUser.run(s.name, s.email, studentPassword, 'student', s.dept, s.id, s.phone);
  }

  console.log('Seeded Users with Indian Scholars & Staff.');

  // Insert Academic Books
  const insertBook = db.prepare(`
    INSERT INTO books (title, author, isbn, price, department, totalCopies, availableCopies, shelfLocation, publishedYear, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const booksData = [
    {
      title: 'Introduction to Algorithms (4th Edition)',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
      isbn: '978-0262046305',
      price: 89.50,
      department: 'Computer Science',
      totalCopies: 6,
      availableCopies: 4,
      shelfLocation: 'Stack CS-01-A',
      publishedYear: 2022,
      description: 'Comprehensive graduate-level text on algorithms, data structures, graph theory, and dynamic programming.',
      status: 'available'
    },
    {
      title: 'Operating Systems: Three Easy Pieces',
      author: 'Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau',
      isbn: '978-1985086593',
      price: 45.00,
      department: 'Computer Science',
      totalCopies: 4,
      availableCopies: 0,
      shelfLocation: 'Stack CS-02-C',
      publishedYear: 2018,
      description: 'In-depth exploration of virtualization (CPU and memory), concurrency, and persistence.',
      status: 'issued'
    },
    {
      title: 'Compilers: Principles, Techniques, and Tools',
      author: 'Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman',
      isbn: '978-0321486813',
      price: 78.00,
      department: 'Computer Science',
      totalCopies: 4,
      availableCopies: 3,
      shelfLocation: 'Stack CS-03-B',
      publishedYear: 2006,
      description: 'Classic dragon book on syntax analysis, code generation, intermediate representations, and register allocation.',
      status: 'available'
    },
    {
      title: 'Database System Concepts (7th Edition)',
      author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
      isbn: '978-0078022159',
      price: 68.00,
      department: 'Computer Science',
      totalCopies: 5,
      availableCopies: 3,
      shelfLocation: 'Stack CS-04-A',
      publishedYear: 2020,
      description: 'Comprehensive treatment of relational data models, SQL, transactions, concurrency, and distributed storage.',
      status: 'available'
    },
    {
      title: 'Signals and Systems (2nd Edition)',
      author: 'Alan V. Oppenheim, Alan S. Willsky',
      isbn: '978-0138147570',
      price: 82.50,
      department: 'Electrical & Electronics',
      totalCopies: 5,
      availableCopies: 3,
      shelfLocation: 'Stack EE-01-D',
      publishedYear: 1997,
      description: 'Foundational text covering continuous-time and discrete-time signals, Fourier series, and Laplace transforms.',
      status: 'available'
    },
    {
      title: 'Modern Control Engineering (5th Edition)',
      author: 'Katsuhiko Ogata',
      isbn: '978-0136156734',
      price: 94.00,
      department: 'Electrical & Electronics',
      totalCopies: 3,
      availableCopies: 1,
      shelfLocation: 'Stack EE-02-B',
      publishedYear: 2009,
      description: 'Classical and modern control theory covering root-locus techniques, frequency-response analysis, and state-space models.',
      status: 'available'
    },
    {
      title: 'Microelectronic Circuits (8th Edition)',
      author: 'Adel S. Sedra, Kenneth C. Smith',
      isbn: '978-0190853464',
      price: 98.00,
      department: 'Electrical & Electronics',
      totalCopies: 4,
      availableCopies: 3,
      shelfLocation: 'Stack EE-03-A',
      publishedYear: 2020,
      description: 'Standard reference on operational amplifiers, semiconductor physics, MOSFETs, and analog IC design.',
      status: 'available'
    },
    {
      title: 'Engineering Mechanics: Statics & Dynamics',
      author: 'J.L. Meriam, L.G. Kraige, J.N. Bolton',
      isbn: '978-1118807330',
      price: 85.00,
      department: 'Mechanical Engineering',
      totalCopies: 4,
      availableCopies: 2,
      shelfLocation: 'Stack ME-01-A',
      publishedYear: 2015,
      description: 'Fundamental principles of equilibrium, planar kinematics, work-energy theorem, and kinetics of particles.',
      status: 'available'
    },
    {
      title: 'Fundamentals of Classical Thermodynamics',
      author: 'Gordon J. Van Wylen, Richard E. Sonntag',
      isbn: '978-0471861737',
      price: 76.00,
      department: 'Mechanical Engineering',
      totalCopies: 3,
      availableCopies: 1,
      shelfLocation: 'Stack ME-02-C',
      publishedYear: 1985,
      description: 'Core concepts of energy, entropy, thermodynamic properties of pure substances, and cycle analysis.',
      status: 'available'
    },
    {
      title: 'Soil Mechanics and Foundations',
      author: 'Dr. B.C. Punmia, Ashok Kumar Jain, Arun Kumar Jain',
      isbn: '978-8170087915',
      price: 52.00,
      department: 'Civil Engineering',
      totalCopies: 4,
      availableCopies: 3,
      shelfLocation: 'Stack CE-01-A',
      publishedYear: 2017,
      description: 'Geotechnical engineering covering soil permeability, shear strength, bearing capacity, and foundation design.',
      status: 'available'
    },
    {
      title: 'Design of Reinforced Concrete Structures',
      author: 'N. Subramanian',
      isbn: '978-0198086949',
      price: 64.00,
      department: 'Civil Engineering',
      totalCopies: 3,
      availableCopies: 2,
      shelfLocation: 'Stack CE-02-B',
      publishedYear: 2013,
      description: 'Detailed analysis and limit state design of reinforced concrete beams, columns, and slabs per IS 456.',
      status: 'available'
    },
    {
      title: 'Principles of Economics (9th Edition)',
      author: 'N. Gregory Mankiw',
      isbn: '978-0357038314',
      price: 72.00,
      department: 'Economics & Management',
      totalCopies: 5,
      availableCopies: 3,
      shelfLocation: 'Stack EM-01-D',
      publishedYear: 2020,
      description: 'Standard textbook in microeconomics and macroeconomics, market efficiency, and monetary policy.',
      status: 'available'
    },
    {
      title: 'Financial Management: Theory and Practice',
      author: 'Prasanna Chandra',
      isbn: '978-9353166526',
      price: 58.00,
      department: 'Economics & Management',
      totalCopies: 4,
      availableCopies: 2,
      shelfLocation: 'Stack EM-02-A',
      publishedYear: 2019,
      description: 'Corporate valuation, capital structure, portfolio theory, and Indian financial markets.',
      status: 'available'
    },
    {
      title: 'Higher Engineering Mathematics (44th Edition)',
      author: 'Dr. B.S. Grewal',
      isbn: '978-8193328491',
      price: 62.00,
      department: 'Mathematics & Computing',
      totalCopies: 6,
      availableCopies: 4,
      shelfLocation: 'Stack MC-01-C',
      publishedYear: 2021,
      description: 'Definitive Indian university engineering text on differential equations, vector calculus, and Fourier series.',
      status: 'available'
    },
    {
      title: 'Linear Algebra and Its Applications (5th Edition)',
      author: 'Gilbert Strang',
      isbn: '978-0030105678',
      price: 70.00,
      department: 'Mathematics & Computing',
      totalCopies: 5,
      availableCopies: 3,
      shelfLocation: 'Stack MC-02-B',
      publishedYear: 2016,
      description: 'Matrix decompositions, orthogonal projections, positive definite matrices, and numerical linear algebra.',
      status: 'available'
    },
    {
      title: 'The Discovery of India',
      author: 'Jawaharlal Nehru',
      isbn: '978-0143031031',
      price: 24.50,
      department: 'Literature & Philosophy',
      totalCopies: 5,
      availableCopies: 3,
      shelfLocation: 'Stack LP-01-A',
      publishedYear: 1946,
      description: 'Historical and philosophical treatise tracing India from the Indus Valley Civilization through the colonial era.',
      status: 'available'
    },
    {
      title: 'An Introduction to Indian Philosophy',
      author: 'Satischandra Chatterjee, Dhirendramohan Datta',
      isbn: '978-8129111951',
      price: 28.00,
      department: 'Literature & Philosophy',
      totalCopies: 4,
      availableCopies: 3,
      shelfLocation: 'Stack LP-02-B',
      publishedYear: 2007,
      description: 'Systematic examination of orthodox (Nyaya, Vaisheshika, Samkhya, Yoga, Mimamsa, Vedanta) and heterodox systems.',
      status: 'available'
    },
    {
      title: 'Malgudi Days',
      author: 'R.K. Narayan',
      isbn: '978-0143039655',
      price: 18.00,
      department: 'Literature & Philosophy',
      totalCopies: 4,
      availableCopies: 3,
      shelfLocation: 'Stack LP-03-A',
      publishedYear: 1982,
      description: 'Celebrated anthology of thirty-two short stories capturing human nuance in the fictional town of Malgudi.',
      status: 'available'
    }
  ];

  for (const book of booksData) {
    insertBook.run(
      book.title,
      book.author,
      book.isbn,
      book.price,
      book.department,
      book.totalCopies,
      book.availableCopies,
      book.shelfLocation,
      book.publishedYear,
      book.description,
      book.status
    );
  }

  console.log('Seeded Academic Books.');

  // Dates helper
  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];
  const daysAgo = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return formatDate(d);
  };
  const daysAhead = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return formatDate(d);
  };

  const insertIssue = db.prepare(`
    INSERT INTO issues (bookId, studentId, issuedById, issueDate, dueDate, returnDate, status, fine, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const savitri = db.prepare('SELECT id FROM users WHERE email = ?').get('savitri.librarian@library.com');
  const karthik = db.prepare('SELECT id FROM users WHERE email = ?').get('karthik.librarian@library.com');

  const aarav = db.prepare('SELECT id FROM users WHERE email = ?').get('aarav.sharma@university.edu');
  const priya = db.prepare('SELECT id FROM users WHERE email = ?').get('priya.patel@university.edu');
  const rohan = db.prepare('SELECT id FROM users WHERE email = ?').get('rohan.iyer@university.edu');
  const ananya = db.prepare('SELECT id FROM users WHERE email = ?').get('ananya.deshmukh@university.edu');
  const aditya = db.prepare('SELECT id FROM users WHERE email = ?').get('aditya.verma@university.edu');

  // OVERDUE ISSUES (In past dates, highlighting red)
  // 1. Aarav Sharma: Book 2 (Operating Systems: Three Easy Pieces) overdue by 9 days
  insertIssue.run(2, aarav.id, savitri.id, daysAgo(23), daysAgo(9), null, 'issued', 9.0, 'BTech 7th Semester Project Reference; Notice Dispatched');

  // 2. Rohan Iyer: Book 9 (Fundamentals of Classical Thermodynamics) overdue by 5 days
  insertIssue.run(9, rohan.id, karthik.id, daysAgo(19), daysAgo(5), null, 'issued', 5.0, 'Thermal Systems Laboratory reference');

  // ACTIVE ISSUES (Due this week & next week)
  // 3. Aarav Sharma: Book 1 (CLRS) due in 4 days (Due This Week)
  insertIssue.run(1, aarav.id, savitri.id, daysAgo(10), daysAhead(4), null, 'issued', 0.0, 'Advanced Algorithms coursework');

  // 4. Priya Patel: Book 6 (Ogata Control Engineering) due in 3 days (Due This Week)
  insertIssue.run(6, priya.id, karthik.id, daysAgo(11), daysAhead(3), null, 'issued', 0.0, 'Control Systems Laboratory prep');

  // 5. Ananya Deshmukh: Book 13 (Prasanna Chandra Financial Management) due in 10 days
  insertIssue.run(13, ananya.id, savitri.id, daysAgo(4), daysAhead(10), null, 'issued', 0.0, 'Corporate Valuation case study');

  // 6. Aditya Verma: Book 15 (Gilbert Strang Linear Algebra) due in 6 days (Due This Week)
  insertIssue.run(15, aditya.id, karthik.id, daysAgo(8), daysAhead(6), null, 'issued', 0.0, 'Computational mathematics module');

  // RETURNED HISTORY
  // 7. Priya Patel returned Signals & Systems
  insertIssue.run(5, priya.id, savitri.id, daysAgo(30), daysAgo(16), daysAgo(17), 'returned', 0.0, 'Returned on time in pristine condition');

  // 8. Aarav Sharma returned Higher Engineering Mathematics
  insertIssue.run(14, aarav.id, karthik.id, daysAgo(40), daysAgo(20), daysAgo(21), 'returned', 0.0, 'Returned on schedule');

  console.log('Seeded Issues with overdue and due-this-week loans.');
}

if (require.main === module) {
  seed(true).then(() => {
    console.log('Reseed completed successfully.');
    process.exit(0);
  }).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seed;
