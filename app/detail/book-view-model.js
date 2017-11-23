const observableModule = require("data/observable");
const observableArrayModule = require("data/observable-array");
const couchbaseService = require("../shared/db/database.js");

function BookViewModel(documentId) {
    if (documentId) {
      var document = couchbaseService.getBookDetail(documentId);
    } else {
      var document = couchbaseService.newBook({});
    }

    const viewModel = observableModule.fromObject(document);

    return viewModel;
}

module.exports = BookViewModel;
