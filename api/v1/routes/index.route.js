const taskRoute = require('../routes/task.route');

module.exports = (app) => {
    app.use('/api/v1/tasks', taskRoute);
}