const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoStore = () => {
  try {
    const connectionString = process.env.MONGODB_URI;
    mongoose.connect(connectionString, {useNewUrlParser: true});
    mongoose.connection.once('open', () => {
      // eslint-disable-next-line no-console
      console.log('connected to mongodb');
    });
  } catch (error) {
    console.log(error);
  }
};


module.exports = mongoStore;
