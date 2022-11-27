var mongoose = require('mongoose');

var HomeSchema = new mongoose.Schema({
    name: {type: String, required: true},
    members: [String], // user ids
    address: String,
    landlord: String,
    landlordPhoneNumber: String,
    leaseLink: String
});

module.exports = mongoose.model('Home', HomeSchema);