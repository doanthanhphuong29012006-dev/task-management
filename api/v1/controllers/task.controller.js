const Task = require('../models/task.model');

const paginationHelper = require('../../../helpers/pagination');

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    }

    if (req.query.status) {
        find.status = req.query.status
    }

    // Pagination
    let initPagination = {
        currentPage: 1,
        limitTask: 2
    };

    const countTask = await Task.countDocuments(find);
    const objectPagination = paginationHelper(
        initPagination,
        req.query,
        countTask
    );
    // End Pagination
    
    // Sort
    const sort = {};

    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue
    }
    // End Sort

    const tasks = await Task.find(find)
        .sort(sort)
        .limit(objectPagination.limitTask)
        .skip(objectPagination.skip)
    ;

    res.status(200).json(tasks);
}

// [GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;

        const task = await Task.findOne({
            _id: id,
            deleted: false
        });

        res.status(200).json(task);
    } catch (error) {
        res.json("Không tìm thấy");
    }
}