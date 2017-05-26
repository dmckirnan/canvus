const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  user: {type: String, required: true},
  notes: {type: String}
});

module.exports = mongoose.model('User', userSchema);
