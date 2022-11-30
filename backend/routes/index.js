module.exports = function (app, router) {
    app.use('/api', require('./home.js')(router));
    app.use('/api/users', require('./users.js')(router));
    app.use('/api/tasks', require('./tasks.js')(router));
    app.use('/api/homes', require('./homes.js')(router));
    app.use('/api/events', require('./events.js')(router));
};
