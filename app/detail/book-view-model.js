const observableModule = require("data/observable");
const observableArrayModule = require("data/observable-array");
const couchbaseService = require("../shared/db/database.js");

function BookViewModel(documentId) {
    if (documentId) {
      var document = couchbaseService.getBookDetail(documentId);
    } else {
      var document = couchbaseService.newBook({});
    }

    // Make 'authors' array observable
    author_list = new observableArrayModule.ObservableArray();
    document.authors.forEach(function (a) {
      author_list.push(a);
    });

    document.authors = author_list;

    document.authorListConverter = {
      toView(value) {
        console.log('Calculating author string...');
        var output = ''
        for (i=0;i<value.length;i++) {
          if (value.length > 1 && i == (value.length-1)) {
            output += ' and '
          }
          else if (i != 0) {
            output += ', '
          };
          output += value.getItem(i).name;
        };
        return output;
      },
      toModel(value) {
      }
    };

    const viewModel = observableModule.fromObject(document);

    return viewModel;
}

module.exports = BookViewModel;
