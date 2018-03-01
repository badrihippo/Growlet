const observableModule = require("data/observable");
const observableArrayModule = require("data/observable-array");

const frameModule = require("ui/frame");
const dialogModule = require("ui/dialogs");

const couchbaseService = require("../shared/db/database.js");
const BookViewModel = require("./book-view-model");

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
    book.authors.push({ name: ''});
  };
}

exports.onNavigatingTo = onNavigatingTo;
exports.onCancelTap = onCancelTap;
exports.onSaveTap = onSaveTap;
exports.onDeleteTap = onDeleteTap;
exports.onAuthorChange = onAuthorChange;
