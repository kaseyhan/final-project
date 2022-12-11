var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({
    name: {type: String, required: true},
    home: {type: String, required: true},
    deadline: {type: Date, default: null},
    completed: {type: Boolean, default: false},
    assignee: {type: String, default: ""},
    assigneeName: {type: String, default: "unassigned"},
    rotate: {type: String, default: "none"},
    notes: {type: String, default: ""},
    dateCreated: Date
});

module.exports = mongoose.model('Task', TaskSchema);
