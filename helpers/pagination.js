module.exports = (objectPagination, query, countTask) => {
    if (query.page && !isNaN(query.page)) {
        const page = parseInt(query.page);
        if (page > 0) {
            objectPagination.currentPage = page;
        }
    }

    if (query.limit && !isNaN(query.limit)) {
        const limit = parseInt(query.limit);
        if (limit > 0) {
            objectPagination.limitTask = limit;
        }
    }

    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitTask;
    objectPagination.totalPage = Math.ceil(countTask / objectPagination.limitTask);

    return objectPagination;
}