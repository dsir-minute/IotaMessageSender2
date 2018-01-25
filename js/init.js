// I am  leaderboard-example/js/init.js
// modded by raxy on 20jan18, beautified by http://jsbeautifier.org/

var iota;

var connection = {
   "accountData": false,
   "previousAccountData": false,
   "isLoggedIn": false,
   "showStatus": false,
   "inApp": true,
   "isSpamming": false,
   "handleURL": false,
   "testNet": false,
   "host": "http://",
   "port": "",
   "depth": 3,
   "minWeightMagnitude": 14,
   "ccurl": 1,
   "ccurlPath": "",
   "lightWallet": false,
   "allowShortSeedLogin": false,
   "keccak": false,
   "language": "en"
};

var UI = (function(UI, $, undefined) {
   console.log("Initializing UI variable...")
   UI.initializationTime = 0;
   UI.initialConnection = false;
   UI.isLocked = false;
   UI.hasFocus = true;

   UI.start = function() {
      console.log("UI.start: Initialization");

      UI.initializationTime = new Date().getTime();

      var loc = window.location.pathname;
      var dir = loc.substring(0, loc.lastIndexOf('/'));
      dir = dir.substring(0, dir.lastIndexOf('/'));
      var relpath = "/ccurl/lin64/"
      dir = dir.concat(relpath)
      console.log("Path to libccurl.so: " + dir)
      connection.ccurlPath = dir

   }

   function showErrorMessage(error) {
      document.body.innerHTML = "<div style='padding: 20px;background:#efefef;border:#aaa;border-radius: 5px;max-width: 60%;margin: 100px auto;'>" + UI.format(error) + "</div>";
      document.body.style.display = "block";
   }

   function showLightWalletErrorMessage() {
      //showErrorMessage(UI.t("could_not_load_light_wallet_functionality"));
      console.log("could_not_load_light_wallet_functionality")
   }

   function showBackendConnectionError() {
      showErrorMessage(UI.t("could_not_load_required_backend_files"));
   }

   function showOutdatedBrowserMessage() {
      console.log("showOutdatedBrowserMessage");
      var html = "";

      html += "<div style='padding: 20px;background:#efefef;border:#aaa;border-radius: 5px;max-width: 60%;margin: 100px auto;'>";
      html += "<strong data-i18n='browser_out_of_date'>" + UI.t("browser_out_of_date") + "</strong>";
      html += "<ul>";
      html += "<li><a href='https://www.google.com/chrome/browser/desktop/' rel='noopener noreferrer' data-i18n='google_chrome'>" + UI.t("google_chrome") + "</a></li>";
      html += "<li><a href='http://www.mozilla.com/firefox/' rel='noopener noreferrer' data-i18n='mozilla_firefox'>" + UI.t("mozilla_firefox") + "</a></li>";
      html += "<li><a href='http://www.opera.com/' rel='noopener noreferrer' data-i18n='opera'>" + UI.t("opera") + "</a></li>";
      html += "</ul>";
      html += "</div>";

      $("body").html(html).show();
   }

   return UI;
}(UI || {}, jQuery));

$(document).ready(function() {
   console.log("Going to do UI.start...")
   UI.start();
});

