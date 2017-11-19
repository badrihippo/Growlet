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

exports.onNavigatingTo = onNavigatingTo;
exports.onCancelTap = onCancelTap;
exports.onSaveTap = onSaveTap;
exports.onDeleteTap = onDeleteTap;
