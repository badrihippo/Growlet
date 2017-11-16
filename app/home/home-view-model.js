const observableModule = require("data/observable");
const observableArrayModule = require("data/observable-array");
const couchbaseService = require("../shared/db/database.js");

function HomeViewModel() {
    const emptyBook = observableModule.fromObject({
        title: "Untitled",
        authors: [],
    });
    const fullBook = observableModule.fromObject({
        title: "Tree Felling",
        authors: ["Tim Burr"],
    });

    const bookList = new observableArrayModule.ObservableArray(couchbaseService.getBookList());
    
    const viewModel = observableModule.fromObject({
        bookList: bookList
    });

    return viewModel;
}

module.exports = HomeViewModel;
