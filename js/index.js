const electron = require("electron")
const i18n     = electron.remote.getGlobal("i18n");



let webglAvailable = false;
try {
  require('curl.lib.js').init();
  webglAvailable = true;
} catch (e) {}


var UI = (function(UI, undefined) {
  var showQuitAlert      = false;
  var isInitialized      = false;
  var callNodeStarted    = false;
  var serverLogLines     = 0;
  var webviewIsLoaded    = false;
  var lightWallet        = false;
  var isDebug            = false;
  var webview;

  UI.initialize = function() {
    isInitialized = true;

    var showStatusBar = false;
    var isFirstRun    = false;
    var lang          = null;

    if (typeof(URLSearchParams) != "undefined") {
      var params = new URLSearchParams(location.search.slice(1));
      showStatusBar = params.get("showStatus") == 1;
      isFirstRun = params.get("isFirstRun") == 1;
      lightWallet = parseInt(params.get("lightWallet"), 10) == 1;
      isDebug = params.get("isDebug") == 1;
      lang = params.get("lang");
    }

    if (isFirstRun) {
      document.body.className = "new-user-active";
    } else if (showStatusBar) {
      document.body.className = "status-bar-active";
    } else {
      document.body.className = "";
    }

    electron.webFrame.setZoomLevelLimits(1, 1);
    electron.ipcRenderer.send("rendererIsInitialized");
    if (callNodeStarted) {
      UI.nodeStarted(callNodeStarted);
      callNodeStarted = false;
    }

    if (!lightWallet) {
      document.body.className += " full-node";
      document.getElementById("status-bar-milestone").addEventListener("click", function(e) {
        electron.ipcRenderer.send("showServerLog");
      });

      document.getElementById("status-bar-solid-milestone").addEventListener("click", function(e) {
        electron.ipcRenderer.send("showServerLog");
      });
    }


    document.getElementById("new-user").addEventListener("click", function(e) {
      UI.sendToWebview("openHelpMenu");
    });
  }


  UI.nodeStarted = function(url, settings) {
    url = url + "?" + Object.keys(settings).map(function(key) { return encodeURIComponent(key) + "=" + encodeURIComponent(settings[key]); }).join("&");

    if (!isInitialized) {
      callNodeStarted = url;
      return;
    }

    webview = document.getElementById("server");
    webviewIsLoaded = false;

    if (isDebug) {
      webview.openDevTools({"mode": "undocked"});
    }

    webview.loadURL(url);

    // Prevent window from redirecting to dragged link location (mac)
    webview.addEventListener("dragover",function(e) {
      e.preventDefault();
      return false;
    },false);

    //also "dom-ready"
    webview.addEventListener("did-finish-load", UI.webviewDidFinishLoad());

    //sometimes did-finish-load does not fire..
    setTimeout(UI.webviewDidFinishLoad, 1000);

    webview.addEventListener("new-window", function(e) {
      electron.shell.openExternal(e.url);
    });
  }

  UI.webviewDidFinishLoad = function() {
    //for some reason this is sometimes called 2 times?..
    if (webviewIsLoaded) {
      return;
    }

    if (electron.remote.getGlobal("hasOtherWin")) {
      return;
    }

    if (webview.style.display == "none") {
      webview.style.display = "";
    }

    webviewIsLoaded = true;

    webview.getWebContents().addListener("context-menu", function(e) {
      e.preventDefault();
      e.stopPropagation();
      UI.showContextMenu(e);
    });

    setTimeout(function() {
      electron.remote.getCurrentWindow().show();
      webview.focus();
      //electron.ipcRenderer.send("rendererIsReady");
    }, 250);

    try {
      webview.getWebContents().document.body.addEventListener("contextmenu", UI.showContextMenu, false);
    } catch (err) {
    }
  }



  UI.relaunchApplication = function(didFinalize) {
    electron.ipcRenderer.send("relaunchApplication", didFinalize);
  }

  UI.toggleDeveloperTools = function() {
    if (webviewIsLoaded && webview) {
      if (webview.isDevToolsOpened()) {
        webview.closeDevTools();
      } else {
        webview.openDevTools({"mode": "undocked"});
      }
    }
  }

  UI.sendToWebview = function(command, args) {
    if (showQuitAlert) {
      return;
    }

    if (webviewIsLoaded && webview) {
      webview.send(command, args);
    } else if (args && args.constructor == Object && args.hasOwnProperty("relaunch") && args.relaunch) {
      UI.relaunchApplication(true);
    }
  }



  UI.t = function(message, options) {
    if (message.match(/^[a-z\_]+$/i)) {
      return UI.format(i18n.t(message, options));
    } else {
      return UI.format(message);
    }
  }


  UI.relaunch = function() {
    UI.hideAlerts();
    showQuitAlert = false;
    webviewIsLoaded = false;
    var server = document.getElementById("server");
    if (server) {
      server.style.display = "none";
    }
  }

  UI.shutdown = function() {
    if (webviewIsLoaded && webview) {
      webview.send("shutdown");
    }
  }

  return UI;
}(UI || {}));

window.addEventListener("load", UI.initialize, false);

window.addEventListener("focus", UI.focusOnWebview);

window.addEventListener("contextmenu", function(e) {
  e.preventDefault();
  e.stopPropagation();
  UI.showContextMenu(e);
});


electron.ipcRenderer.on("stopCcurl", function(event, data) {
  UI.sendToWebview("stopCcurl", data);
});


electron.ipcRenderer.on("relaunch", UI.relaunch);

electron.ipcRenderer.on("shutdown", UI.shutdown);
