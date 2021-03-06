const frameModule = require("ui/frame");
const observableModule = require("data/observable");

const couchbaseService = require("../shared/db/database.js");
const HomeViewModel = require("./home-view-model");

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
    page.bindingContext = new HomeViewModel();
}

/* ***********************************************************
 * According to guidelines, if you have a drawer on your page, you should always
 * have a button that opens it. Get a reference to the RadSideDrawer view and
 * use the showDrawer() function to open the app drawer section.
 *************************************************************/
function onDrawerButtonTap(args) {
    const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
};

function onItemTap(args) {
    const page = args.object;
    document = page.bindingContext.bookList.getItem(args.index);
    documentId = document._id

    frameModule.topmost().navigate({
        moduleName: 'detail/book-detail-page',
        context: {
            document: document,
            documentId: documentId,
            },
        animated: true,
        transition: {
            name: "slideLeft",
            curve: "easeIn",
        },
    });
};

function onAddTap(args) {
    const page = args.object;
    frameModule.topmost().navigate({
        moduleName: 'detail/book-edit-page',
        context: {
            documentId: null,
            newBook: true,
        },
        animated: true,
        transition: {
            name: "slideTop",
            curve: "easeIn",
        },
    });
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.onItemTap = onItemTap;
exports.onAddTap = onAddTap;
