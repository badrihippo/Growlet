const httpModule = require("http");
const observableModule = require("data/observable");
const observableArrayModule = require("data/observable-array");

var book;
var context;
var closeCallback;

function onShownModally(args) {
  var page = args.object;
  context = args.context;
  
  closeCallback = args.closeCallback;
  book = {
    error: null,
    isbn: context.isbn,
  };

  var activityIndicator = page.getViewById('activityIndicator');
  var label1 = page.getViewById('label1');
  var okButton = page.getViewById('okButton');

  activityIndicator.busy = true;
  okButton.visibility = 'collapse';

  // download and process metadata
  // TODO move API url to more appropriate place
  const api_url_prefix = "http://openlibrary.org/api/books?jscmd=details&format=json&bibkeys=ISBN:";

  console.log("Downloading metadata for " + book.isbn);

  httpModule.getJSON(api_url_prefix + book.isbn).then(function(response) {
    console.log('Reading data...');
    var bookData = response['ISBN:' + book.isbn].details;
    if (bookData) {
      book.title = bookData.title ? bookData.title : book.title;
      book.publisher = bookData.publishers ? bookData.publishers[0] : book.publisher;
      book.genre = bookData.subjects ? bookData.subjects[0] : book.genre;
      if (bookData.authors) {
        book.authors = [];
        for (a in bookData.authors) {
          book.authors.push(new observableModule.fromObject({
            name: bookData.authors[a].name,
          }));
        };
      };
      book.description = bookData.description ? bookData.description.value : book.description;
      book.binding_type = bookData.physical_format ? bookData.physical_format: book.binding_type;

      book.success = true;
    } else {
      book.success = false;
      book.error = 'No matching records found';
    };
    console.log("Got book data for " + book.title + ".");
    label1.text = "Data fetched. Press OK to save.";
  }).catch(function(error) {
    console.log("Error fetching data: " + error);
  });
  // hide spinner; show "success" or "fail" message
  activityIndicator.busy = false;
  okButton.visibility = 'visible';
}

function okButtonTap(args) {
  closeCallback(book, book.error);
}

exports.onShownModally = onShownModally;
exports.okButtonTap = okButtonTap;
