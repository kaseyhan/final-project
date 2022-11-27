const { Timestamp } = require('bson');
var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    name: {type: String, required: true},
    date: {type: Date, required: true},
    time: Timestamp, // CHANGE???
    host: {type: String, default: ""},
    hostName: {type: String, default: "none"},
    location: {type: String, default: ""},
    guests: [String],
    notes: {type: String, default: ""},
    repeat: Boolean,
    dateCreated: Date
});

module.exports = mongoose.model('Event', EventSchema);
