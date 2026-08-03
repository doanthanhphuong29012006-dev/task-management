const taskRoute = require('../routes/task.route');
const userRoute = require('../routes/user.route');

const authMiddleware = require('../middlewares/auth.middleware');

module.exports = (app) => {
    const version = "/api/v1"

    app.use(version + '/tasks', authMiddleware.requireAuth, taskRoute);

    app.use(version + '/users', userRoute);
}