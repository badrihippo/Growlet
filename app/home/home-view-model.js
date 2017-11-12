const observableModule = require("data/observable");
const observableArrayModule = require("data/observable-array");

function HomeViewModel() {
    const emptyBook = observableModule.fromObject({
        title: "Untitled",
        authors: [],
    });
    const fullBook = observableModule.fromObject({
        title: "Tree Felling",
        authors: ["Tim Burr"],
    });

    const bookList = new observableArrayModule.ObservableArray(
        emptyBook,
        fullBook
    );
    
    const viewModel = observableModule.fromObject({
        bookList: bookList
    });

    return viewModel;
}

module.exports = HomeViewModel;
