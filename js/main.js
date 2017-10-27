//MAIN PROCESS

const {app, BrowserWindow} = require('electron')
const electron = require("electron");
const path = require('path')
const url = require('url')
const fs = require("fs-extra");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

var appDataDirectory = "";
var settings = {};

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600})

    // and load the send.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'send.html'),
        protocol: 'file:',
        slashes: true
    }))

    //Define ccurlPath
    try{

        var appDirectory = path.dirname(__dirname);

        var resourcesDirectory = path.dirname(appDirectory);

        var ccurlPath;

        if (process.platform == "win32") {
            ccurlPath = path.join(resourcesDirectory, "ccurl", "win" + (is64BitOS ? "64" : "32"));
        } else if (process.platform == "darwin") {
            ccurlPath = path.join(resourcesDirectory, "ccurl", "mac");
        } else {
            ccurlPath = path.join(resourcesDirectory, "ccurl", "lin" + (is64BitOS ? "64" : "32"));
        }

    }
    catch (err) {
        console.log("Error:");
        console.log(err);
    }

    loadSettings();

    // Open the DevTools.
    //win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
var loadSettings = function() {



    try {

        settings = {};


        if (!settings.hasOwnProperty("lightWallet")) {
            settings.lightWallet = -1;
        }

        if (!settings.hasOwnProperty("ccurl")) {
            settings.ccurl = 0;
        }

    } catch (err) {
        console.log("Error reading settings:");
        console.log(err);
        settings = {bounds: {width: 520, height: 780}, checkForUpdates: 1, lastUpdateCheck: 0, showStatusBar: 0, isFirstRun: 1, port: (isTestNet ? 14900 : 14265), udpReceiverPort: 14600, tcpReceiverPort: 15600, sendLimit: 0, nodes: [], dbLocation: "", allowShortSeedLogin: 0, keccak: 0, ccurl: 0};
    }

    try {
        if (electron.screen) {
            var displaySize = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint()).workAreaSize;

            if (displaySize.width < settings.bounds.width + 100 || displaySize.height < settings.bounds.height+100) {
                settings.bounds.height = displaySize.height - 100;
                settings.bounds.width = Math.round(settings.bounds.height / 16 * 11);
            }

            if (settings.bounds.hasOwnProperty("x") && settings.bounds.hasOwnProperty("y")) {
                if (settings.bounds.x > displaySize.width || settings.bounds.y > displaySize.height) {
                    delete settings.bounds.x;
                    delete settings.bounds.y;
                }
            }
        }
    } catch (err) {
        settings.bounds = {width: 520, height: 780};
    }
    console.log ("Settings loaded successfully");
}

