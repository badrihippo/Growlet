const observableModule = require("data/observable");
const observableArrayModule = require("data/observable-array");
const couchbaseService = require("../shared/db/database.js");

function BookViewModel(documentId) {
    const document = couchbaseService.getBookDetail(documentId);
    const viewModel = observableModule.fromObject(document);

    return viewModel;
}

module.exports = BookViewModel;
