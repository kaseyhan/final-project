var mongoose = require('mongoose');

var HomeSchema = new mongoose.Schema({
    name: {type: String, required: true},
    password: {type: String, required: true},
    members: [String], // user ids
    tasks: [String], // task ids
    events: [String], // event ids
    address: {type: String, default: ""},
    landlordName: {type: String, default: ""},
    landlordPhoneNumber: {type: String, default: ""},
    leaseLink: {type: String, default: ""},
    announcements: [{user: String, message: String}], // user id
    inventory: {type: [String], default: []}
});

module.exports = mongoose.model('Home', HomeSchema);