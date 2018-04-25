const observableModule = require("data/observable");
const observableArrayModule = require("data/observable-array");

const frameModule = require("ui/frame");
const dialogModule = require("ui/dialogs");

const httpModule = require("http");
const metadataDownloadModal = 'detail/metadata-download-modal';

const couchbaseService = require("../shared/db/database.js");
const BookViewModel = require("./book-view-model");

const barcodeScannerModule = require("nativescript-barcodescanner");
const BarcodeScanner = new barcodeScannerModule.BarcodeScanner();

/* ***********************************************************
* Use the "onNavigatingTo" handler to initialize the page binding context.
*************************************************************/
function onNavigatingTo(args) {
    /* ***********************************************************
    * The "onNavigatingTo" event handler lets you detect if the user navigated with a back button.
    * Skipping the re-initialization on back navigation means the user will see the
    * page in the same data state that he left it in before navigating.
    *************************************************************/
    if (args.isBackNavigation) {
        return;
    }

    const page = args.object;
  
    page.bindingContext = new BookViewModel(page.navigationContext.documentId);
    if (page.bindingContext.authors.length == 0) {
      // Add default author field
      console.log('Adding default author');
      page.bindingContext.authors.push(new observableModule.fromObject({ name: '' }));
    };

    // TODO: Find better way to watch author list for changes
    // Right now, only uses 'tap' event in book-edit-page.xml

    page.bindingContext.isLoading = false;
}

function onCancelTap(args) {
  frameModule.topmost().goBack();
}

function onSaveTap(args) {
  console.log('Saving book record...');
  var page = args.object;
  couchbaseService.saveBook(page.bindingContext);
  frameModule.topmost().navigate({
    moduleName: 'home/home-page'  
  });
}

function onDeleteTap(args) {
  var page = args.object;
  var book = args.object.bindingContext;
  dialogModule.confirm({
    title: "Delete book",
    message: 'Are you sure you want to delete "' + book.title + '"?',
    okButtonText: "Delete",
    cancelButtonText: "Cancel"
  }).then(function (result) {
    if (result == 1) {
      var isDeleted = couchbaseService.deleteBook(book._id);
      frameModule.topmost().navigate({
        moduleName: 'home/home-page'
      });
    }
  });
};

function onAuthorChange(args) {
  console.log('Checking author list...');
  var page = args.object;
  var author = page.bindingContext;
  var book = page.parent.parent.bindingContext;

  console.log('Height: ' + page.parents);

  var lastAuthor = book.authors.getItem(book.authors.length-1);
  if (lastAuthor.name != '') {
    // Add empty author field
    console.log('Adding new author field');
    book.authors.push(new observableModule.fromObject({ name: ''}));
  };
}

function scanBarcode(args) {
  console.log('Scanning barcode...');
  var page = args.object;
  var book = page.bindingContext;
  BarcodeScanner.scan({
    formats: "EAN_8, EAN_13",
    showTorchButton: true,
    beepOnScan: true,
  }).then(
    function(result) {
      console.log("We got a " + result.format + ": " + result.text);
      book.isbn = result.text;
      downloadMetadata(args);
    },
    function(error) {
      console.log("Scan failed: " + error);
    }
  );
}

function downloadMetadata(args) {
  console.log("Downloading metadata...");
  var page = args.object.page;
  var book = args.object.bindingContext;

    page.showModal(metadataDownloadModal, { isbn: book.isbn }, (bookData, error) => {
        console.log("Got bookData: " + bookData);

        if (bookData && !error) {
          book.title = bookData.title ? bookData.title : book.title;
          book.publisher = bookData.publishers ? bookData.publishers[0] : book.publisher;
          book.genre = bookData.subjects ? bookData.subjects[0] : book.genre;
          if (bookData.authors) {
            book.authors.length = 0;
            for (a in bookData.authors) {
              book.authors.push(new observableModule.fromObject({
                name: bookData.authors[a].name,
              }));
            };
          };
          book.description = bookData.description ? bookData.description.value : book.description;
          book.binding_type = bookData.physical_format ? bookData.physical_format: book.binding_type;
        } else {
          console.log("Error: " + error);
        };
    }, true)
}

exports.onNavigatingTo = onNavigatingTo;
exports.onCancelTap = onCancelTap;
exports.onSaveTap = onSaveTap;
exports.onDeleteTap = onDeleteTap;
exports.onAuthorChange = onAuthorChange;
exports.scanBarcode = scanBarcode;
exports.downloadMetadata = downloadMetadata;
