// Creates demo accounts so you can log in right away.
// Run once from the server folder:  npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const upsert = async (data) => {
    let user = await User.findOne({ email: data.email });
    if (!user) user = await User.create(data);
    return user;
  };

  const hr = await upsert({
    name: 'Hannah HR', email: 'hr@staffsync.com', password: 'hr1234', role: 'hr',
    department: 'Human Resources', position: 'HR Lead',
  });
  const manager = await upsert({
    name: 'Mike Manager', email: 'manager@staffsync.com', password: 'manager1234', role: 'manager',
    department: 'Engineering', position: 'Engineering Manager',
  });
  await upsert({
    name: 'Emma Employee', email: 'employee@staffsync.com', password: 'employee1234', role: 'employee',
    department: 'Engineering', position: 'Developer', manager: manager._id,
  });

  console.log('Seeded. Log in with:');
  console.log('  HR        hr@staffsync.com        / hr1234');
  console.log('  Manager   manager@staffsync.com   / manager1234');
  console.log('  Employee  employee@staffsync.com  / employee1234');
  console.log('HR id:', String(hr._id));
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
