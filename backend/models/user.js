var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true, dropDups: true},
    password: {type: String, required: true},
    home: {type: String, default: "none"}, //home id
    color: {type: String, default: "#ADD8E6"},
    pendingTasks: [String], // task id
    events: [String], // event id
    debts: [{user: String, amount: Number}] // positive = you owe them, negative = they owe you
});

module.exports = mongoose.model('User', UserSchema);