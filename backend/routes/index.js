module.exports = function (app, router) {
    app.use('/api', require('./backend/routes/home.js')(router));
    app.use('/api/users', require('./backend/routes/users.js')(router));
    app.use('/api/tasks', require('./backend/routes/tasks.js')(router));
    app.use('/api/homes', require('./backend/routes/homes.js')(router));
    app.use('/api/events', require('./backend/routes/events.js')(router));
};
