require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Income = require('./models/Income');

const EMAIL = process.env.SEED_USER_EMAIL || 'kaviya@gmail.com';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: EMAIL });
    if (!user) {
      console.error(`User not found by email: ${EMAIL}`);
      const anyUser = await User.findOne();
      if (!anyUser) {
        console.error('No users found in DB. Aborting.');
        process.exit(1);
      }
      console.log('Using first user in DB:', anyUser._id.toString());
      await assignUserId(anyUser._id);
      process.exit(0);
    }

    console.log('Found user:', user._id.toString(), user.email);
    await assignUserId(user._id);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

async function assignUserId(userId) {
  const expFilter = { $or: [{ userId: { $exists: false } }, { userId: null }] };
  const incFilter = { $or: [{ userId: { $exists: false } }, { userId: null }] };

  const expResult = await Expense.updateMany(expFilter, { $set: { userId } });
  const incResult = await Income.updateMany(incFilter, { $set: { userId } });

  console.log(`Expenses modified: ${expResult.matchedCount || expResult.nModified || expResult.modifiedCount || 0}`);
  console.log(`Incomes modified: ${incResult.matchedCount || incResult.nModified || incResult.modifiedCount || 0}`);

  const expCount = await Expense.countDocuments({ userId });
  const incCount = await Income.countDocuments({ userId });

  console.log(`Total expenses for user ${userId}: ${expCount}`);
  console.log(`Total incomes for user ${userId}: ${incCount}`);
}

run();
