const mongoose = require('mongoose');
const { Schema } = mongoose;

const tentSchema = new Schema({
    captainNetID: { type: String, required: true },
    order: { type: Number, required: true },
    dateOfRegistration: { type: Date, required: true },
    captainName: { type: String, required: true },
    members: { type: Map, of: String, required: true }, // Assuming members are a map with netID as key and memberName as value
    nameOfTent: String, 
    typeOfTent: { type: String, required: true },
    numberOfMisses: { type: Number, required: true },
    startDate: { type: Date, required: true },
    lastCheck: String,
    dateOfLastCheck: Date,
    dateOfLastMiss: Date,
    buddyTent: String
}, {collection: "tents"});

module.exports = mongoose.model('Tent',tentSchema);
