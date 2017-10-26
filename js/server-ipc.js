const ipcRenderer = require("electron").ipcRenderer;
//const clipboard   = require("electron").clipboard;

var ccurl = true;

var isLightWallet = require("electron").remote.getGlobal("lightWallet");
isLightWallet = true

console.log ("Is light wallet? " + isLightWallet)

//only load for light wallets
if (isLightWallet) {
  try {
    ccurl = require("./ccurl-interface");
  } catch (err) {
    alert(err);
    ccurl = false;
  }
}






ipcRenderer.on("stopCcurl", function(event, callback) {
  console.log("in stopCcurl renderer");
  if (ccurl && connection.ccurlProvider) {
    console.log("calling ccurlInterruptAndFinalize with " + connection.ccurlProvider);
    ccurl.ccurlInterruptAndFinalize(connection.ccurlProvider);
  }

  console.log("Calling relaunchApplication");
  ipcRenderer.send("relaunchApplication", true);
});

function _hoverAmountStart(amount) {
  ipcRenderer.send("hoverAmountStart", amount);
}

function _hoverAmountStop() {
  ipcRenderer.send("hoverAmountStop");
}


function _rendererIsReady() {
  ipcRenderer.send("rendererIsReady", process.pid);
}




process.once("loaded", function() {
  global.backendLoaded = true;
  global.hoverAmountStart = _hoverAmountStart;
  global.hoverAmountStop = _hoverAmountStop;
  global.rendererIsReady = _rendererIsReady;


  console.log ("Is curl defined?")
  if (typeof(ccurl) != "undefined") {
    console.lof ("Defining ccurl...")
    global.ccurl = ccurl;
  }
});
