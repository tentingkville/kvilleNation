const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema;

const kvilleProfileSchema = new Schema({
    netID: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, 
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email address');
      }
    } },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true }
},{ collection: "kvilleProfiles" });

module.exports = mongoose.model('kvilleProfiles', kvilleProfileSchema);
