var mongoose = require('mongoose');
var Event = require('./backend/models/event')

var UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true, dropDups: true},
    password: {type: String, required: true},
    home: {type: String, default: "none"}, //home id
    color: {type: String, default: "#ADD8E6"},
    pendingTasks: [String],
    events: [Event],
    debts: [{user: String, amount: Number}]
});

module.exports = mongoose.model('User', UserSchema);