var mongoose = require('mongoose');

var HomeSchema = new mongoose.Schema({
    name: {type: String, required: true},
    members: [String], // user ids
    tasks: [String], // task ids
    events: [String], // event ids
    address: String,
    landlordName: String,
    landlordPhoneNumber: String,
    leaseLink: String
});

module.exports = mongoose.model('Home', HomeSchema);