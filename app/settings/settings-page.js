const frameModule = require("ui/frame");
const couchbaseService = require("../shared/db/database.js");
const appSettings = require("application-settings");

const SettingsViewModel = require("./settings-view-model");

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
    page.bindingContext = new SettingsViewModel();
    page.bindingContext.set('downloadAfterBarScan',
        appSettings.getBoolean('downloadAfterBarScan', true));
    page.bindingContext.set('scanOnNewBook',
        appSettings.getBoolean('scanOnNewBook', true));
}

/* ***********************************************************
* According to guidelines, if you have a drawer on your page, you should always
* have a button that opens it. Get a reference to the RadSideDrawer view and
* use the showDrawer() function to open the app drawer section.
*************************************************************/
function onDrawerButtonTap(args) {
    const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

function onAddBookRecordTap(args) {
    const book = {
        title: 'Tree Felling',
        authors: [
          { name: 'Tim Burr' },
          { name: 'Wood Cutter' }
        ],
        genre: 'Agriculture',
        publisher: 'NoPress',
        binding_type: 'paperback',
        price: 0,
    };
    couchbaseService.saveBook(book);
}

function onSwitchChange(args) {
    console.log('onSwitchChange...');
    if (args.object.id == "scanOnNewBookSwitch") {
        console.log('Setting scanOnNewBook to ' + !args.object.checked);
        appSettings.setBoolean('scanOnNewBook', !args.object.checked);
    }
    if (args.object.id == "downloadAfterBarScanSwitch") {
        console.log('Setting downloadAfterBarScan to ' + !args.object.checked);
        appSettings.setBoolean('downloadAfterBarScan', !args.object.checked);
    };
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.onAddBookRecordTap = onAddBookRecordTap;
exports.onSwitchChange = onSwitchChange;
