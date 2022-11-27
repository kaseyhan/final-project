var mongoose = require('mongoose');
var Event = require('./event')

var UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true, dropDups: true},
    password: {type: String, required: true},
    home: String, //home id
    color: String, // CHANGE
    pendingTasks: [String],
    events: [Event],
    debts: [{user: String, amount: Number}]
});

module.exports = mongoose.model('User', UserSchema);