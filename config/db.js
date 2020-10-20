const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');
mongoose.set('useUnifiedTopology', true);

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log('Database connected.');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
