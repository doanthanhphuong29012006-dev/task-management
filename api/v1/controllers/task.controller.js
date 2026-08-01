const Task = require('../models/task.model');

const paginationHelper = require('../../../helpers/pagination');
const searchHelper = require('../../../helpers/search');

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    }

    if (req.query.status) {
        find.status = req.query.status
    }

    // Search
    const objectSearch = searchHelper(req.query);

    if (req.query.keyword) {
        find.title = objectSearch.regex;
    }
    // End Search

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

// [PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.body.status;

        await Task.updateOne({
            _id: id
        }, {
            status: status
        });

        res.json({
            code: 200,
            message: "Cập nhật trạng thái thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Không tồn tại!"
        });
    }
}

// [PATCH] /api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, key, value } = req.body;

        switch (key) {
            case "status":
                await Task.updateMany({
                    _id: { $in: ids },
                }, {
                    status: value
                });
                res.json({
                    code: 200,
                    message: "Cập nhật trạng thái thành công!"
                });
                break;
        
            default:
                res.json({
                    code: 400,
                    message: "Không tồn tại!"
                });
                break;
        }
    } catch (error) {
        res.json({
            code: 400,
            message: "Không tồn tại!"
        });
    }
}