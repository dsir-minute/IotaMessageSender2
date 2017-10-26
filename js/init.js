var iota;

var connection = {"accountData"         : false,
    "previousAccountData" : false,
    "isLoggedIn"          : false,
    "showStatus"          : false,
    "inApp"               : true,
    "isSpamming"          : false,
    "handleURL"           : false,
    "testNet"             : false,
    "host"                : "http://88.198.230.98",
    "port"                : "14265",
    "depth"               : 3,
    "minWeightMagnitude"  : 14,
    "ccurl"               : 1,
    "ccurlPath"           : "",
    "lightWallet"         : false,
    "allowShortSeedLogin" : false,
    "keccak"              : false,
    "language"            : "en"};



var UI = (function(UI, $, undefined) {

    console.log("Initializing UI variable...")
    UI.initializationTime = 0;
    UI.initialConnection  = false;

    UI.isLocked           = false;
    UI.hasFocus           = true;

    UI.start = function() {
        console.log("UI.start: Initialization");

        UI.initializationTime = new Date().getTime();

        var interruptAttachingToTangle = false;

        connection.ccurlPath = "../ccurl/mac"



        console.log ("Creating new IOTA instance...")
        iota = new IOTA({
            "host": connection.host,
            "port": connection.port
        });

        console.log ("IOTA object:")
        console.log (iota)
        iota.api.getNodeInfo( function (e, nodeInfo){
            console.log (nodeInfo);

        });



        if (connection.host != "http://localhost") {
            connection.lightWallet = true;
            if (!connection.inApp || typeof(ccurl) == "undefined" || !ccurl) {
                if (typeof(ccurl) == "undefined") {
                    console.log("ccurl is undefined");
                } else if (!ccurl) {
                    console.log("ccurl is false");
                } else {
                    console.log("...");
                }
                showLightWalletErrorMessage();
                return;
            } else {
                connection.ccurlProvider = ccurl.ccurlProvider(connection.ccurlPath);
                if (!connection.ccurlProvider) {
                    console.log("Did not get ccurlProvider from " + connection.ccurlPath);
                    return;
                }
            }
            // Overwrite iota lib with light wallet functionality
            $.getScript("iota.lightnode.js").done(function() {
                console.log("getScript lightnode done")
                if (interruptAttachingToTangle) {
                    iota.api.interruptAttachingToTangle(function() {});
                }
            }).fail(function(jqxhr, settings, exception) {
                console.log("Could not load iota.lightwallet.js");
                showLightWalletErrorMessage();
            });
        } else {
            if (interruptAttachingToTangle) {
                iota.api.interruptAttachingToTangle(function() {});
            }
        }




    }


    function showErrorMessage(error) {
        document.body.innerHTML = "<div style='padding: 20px;background:#efefef;border:#aaa;border-radius: 5px;max-width: 60%;margin: 100px auto;'>" + UI.format(error) + "</div>";
        document.body.style.display = "block";
    }

    function showLightWalletErrorMessage() {
        //showErrorMessage(UI.t("could_not_load_light_wallet_functionality"));
        console.log ("could_not_load_light_wallet_functionality")
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
    console.log ("Going to do UI.start...")
    UI.start();
});

