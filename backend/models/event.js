var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    name: {type: String, required: true},
    home: {type: String, required: true}, // do we need this?
    start: {type: Date, required: true},
    end: {type: Date, required: true},
    host: {type: String, default: ""}, // user id
    hostName: {type: String, default: "none"},
    location: {type: String, default: ""},
    guests: [String], // user ids
    notes: {type: String, default: ""},
    repeat: {type: String, default: "none"},
    dateCreated: Date
});

module.exports = mongoose.model('Event', EventSchema);
