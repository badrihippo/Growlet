const frameModule = require("ui/frame");
const dialogModule = require("ui/dialogs");
const fileSystemModule = require("tns-core-modules/file-system");
const couchbaseService = require("../shared/db/database.js");
const appSettings = require("application-settings");
const isAndroid = require("tns-core-modules/platform").isAndroid;
const mPicker = require("nativescript-mediafilepicker");

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

function onExportDataTap(args) {
    var now = new Date().toISOString();
    const filename = `growlet-export-${now}.json`;
    dialogModule.confirm({
        title: 'Export Data',
        message: "The books database will be exported as " + filename + "." +
            " Note that this will not include your settings and" +
            " preferences. Please confirm that you wish to continue.",
        okButtonText: 'Export',
        cancelButtonText: 'Cancel',
    }).then(function(result) {
        // TODO: see if there's a safer way to do this
        if (result) {
            var bookList = couchbaseService.getBookList();
            var data = JSON.stringify({
                books: bookList,
            });
            // Write data to file
            console.log('Getting folder...');
            var downloadsFolderPath = '/sdcard/Download';
            if (isAndroid) {
                console.log("We're Android.");
                downloadsFolderPath = android.os.Environment.getExternalStoragePublicDirectory(
                    android.os.Environment.DIRECTORY_DOWNLOADS
                ).toString();
            } else {
                console.log('Warning: using default value for downloads directory!');
            }
            console.log('Loading ' + downloadsFolderPath);
            const folder = fileSystemModule.Folder.fromPath(downloadsFolderPath);
            console.log('Getting file...')
            const file = folder.getFile(filename);
            console.log(data);
            file.writeText(data).then(function(result) {
                console.log('Data exported to ' + file.path);
                dialogModule.alert({
                    title: 'Export complete',
                    message: 'Book data has been exported to ' + file.path,
                    okButtonText: 'OK',
                });
            }).catch(function(err) {
                console.log('Error writing file:' + err.stack);
                dialogModule.alert({
                    title: 'Error saving data',
                    message: 'Data export failed: ' + err,
                    okButtonText: 'OK',
                });
            });
        };
    });
}

function onImportDataTap(args) {
    // The file-picker only works on Android
    console.log('Creating FilePicker...');
    const fp = new mPicker.Mediafilepicker();

    fp.on('getFiles', function(res) {
        const results = res.object.results;
        console.log('We got: ' + results[0].file);
        dialogModule.alert({
            title: 'Hypothetical import',
            message: 'Thanks for trying to import from ' +
                results[0].file + '. Unfortunately, this feature is ' +
                'not implemented yet. We\'re working on it.',
            okButtonText: 'Um, okay',
        });
    });

    fp.on('error', function(res) {
        const msg = res.object.msg;
        console.log('Error: ' + msg);
        dialogModule.alert({
            title: 'Import error',
            message: 'There was an error in selecting files to import from: ' +
                msg,
            okButtonText: 'OK',
        });
    });

    fp.on('cancel', function(res) {
        const msg = res.object.msg;
        console.log('Cancelled: ' + msg);
    });

    fp.openFilePicker({
        android: {
            extensions: ['json'],
            maxNumberFiles: 1,
        },
        ios: {
            extensions: ['kUTTypeText'],
            multipleSelection: false,
        },
    });
    console.log('Opening FilePicker...');
    //fp.show();
    console.log('Everything\'s closed');
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.onAddBookRecordTap = onAddBookRecordTap;
exports.onSwitchChange = onSwitchChange;
exports.onExportDataTap = onExportDataTap;
exports.onImportDataTap = onImportDataTap;
