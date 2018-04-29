const httpModule = require("http");
const observableModule = require("data/observable");
const observableArrayModule = require("data/observable-array");
const labelModule = require("ui/label");

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
  var titleLabel = page.getViewById('title-label');
  var descriptionLabel = page.getViewById('description-label');
  var okButton = page.getViewById('ok-button');
  var cancelButton = page.getViewById('cancel-button');
  var metadataList = page.getViewById('metadata-list');

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

    // display downloaded information
    console.log("Got book data for " + book.title + ".");
    titleLabel.text = "Metadata for " + book.title;
    descriptionLabel.text = "Information has been found for your chosen book. Please review the information to insert it into your book details";

    // list downloaded data
    ["title", "publisher", "genre", "description", "binding_type"].forEach(function(p) {
      if (book[p]) {
        console.log(p + ": " + book[p]);
        var l = new labelModule.Label();
        l.text = p + ": " + book[p];
        metadataList.addChild(l);
      };
    });

  }).catch(function(error) {
    console.log("Error fetching data: " + error);
    titleLabel.text = "No data found";
    descriptionLabel.text = "No data was found for your selected book [Error: " + error + "]. You will have to enter the details manually."
  });
  // hide spinner; show "success" or "fail" message
  activityIndicator.busy = false;
  okButton.visibility = 'visible';
}

function okButtonTap(args) {
  closeCallback(book, book.error);
}

function cancelButtonTap(args) {
  closeCallback({}, 'Operation cancelled');
}

exports.onShownModally = onShownModally;
exports.okButtonTap = okButtonTap;
exports.cancelButtonTap = cancelButtonTap;
