/* I am  IotaMessageSender/js/send.js from https://github.com/alero3/IotaMessageSender.git
   modded by raxy on 20jan18
   wallet server parametrable, changed labels, add #transfers : updated by getAccountInfo()
*/
var seed;
var balance = 0;
var address;

$(document).ready(function() {

    function toggleSidebar() {
        $(".button").toggleClass("active");
        $("main").toggleClass("move-to-left");
        $(".sidebar-item").toggleClass("active");
        $(".sidebar").toggleClass("donotdisplay");
    }
    //
    //  Properly formats the seed, replacing all non-latin chars with 9's
    //  And extending it to length 81
    //
    function setSeed(value) {
        seed = "";
        value = value.toUpperCase();

        for (var i = 0; i < value.length; i++) {
            if (("9ABCDEFGHIJKLMNOPQRSTUVWXYZ").indexOf(value.charAt(i)) < 0) {
                seed += "9";
            } else {
                seed += value.charAt(i);
            }
        }
    }
    //
    // Gets the addresses and transactions of an account
    // As well as the current balance
    //  Automatically updates the HTML on the site
    //
    function getAccountInfo() {

        // Command to be sent to the IOTA API
        // Gets the latest transfers for the specified seed
        iota.api.getAccountData(seed, function(e, accountData) {

            console.log("Account data", accountData);
            // Update address
            if (!address && accountData.addresses[0]) {
                address = iota.utils.addChecksum(accountData.addresses[accountData.addresses.length - 1]);
                updateAddressHTML(address);
            }
            balance = accountData.balance;
            // Update total balance
            updateBalanceHTML(balance);
            $("#nbTransf").html( accountData.transfers.length);
        })
    }

    //
    //  Generate address function
    //  Automatically updates the HTML on the site
    //
    function genAddress() {

        console.log("Generating an address");
        // Deterministically Generates a new address with checksum for the specified seed
        iota.api.getNewAddress(seed, {'checksum': true}, function(e,address) {
             if (!e) {
                console.log("NEW ADDRESS GENERATED: ", address)
                address = address;
                // Update the HTML on the site
                updateAddressHTML(address)
            }
        })
    }
    //
    //  Makes a new transfer for the specified seed
    //  Includes message and value
    function sendTransfer(address, value, messageTrytes) {

        var transfer = [{
            'address': address,
            'value': parseInt(value),
            'message': messageTrytes,
            'tag' : '',
            'obsoleteTag' : ''
        }];
        console.log("Sending Transfer with sendTransfer", transfer);
        // We send the transfer from this seed, with depth 4 and minWeightMagnitude 14 or 18
        iota.api.sendTransfer(seed, 4, 14, transfer, function(e) {
            if (e){
                var html = '<div class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>ERROR!</strong>' + e + '.</div>'
                $("#send__success").html(JSON.stringify());
                $("#submit").toggleClass("disabled");
                $("#send__waiting").css("display", "none");
            } else {
                var html = '<div class="alert alert-info alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> You have successfully sent your transaction. If you want to make another one make sure that this transaction is confirmed first (check in your client).</div>'
                $("#send__success").html(html);
                $("#submit").toggleClass("disabled");
                $("#send__waiting").css("display", "none");
                balance = balance - value;
                updateBalanceHTML(balance);
            }
        })
    }
    //
    // Menu Open/Close
    $(".button").on("click tap", function() {
        toggleSidebar();
    });
    //
    // Set seed and Tangle wallet server
    $("#seedSubmit").on("click", function() {
      loadSettings();
      // We modify the entered seed to fit the criteria of 81 chars, all uppercase and only latin letters
      setSeed($("#userSeed").val());
      // Then we remove the input
      //$("#enterSeed").html('<div class="alert alert-success" role="alert">Tks for your connection params. You can generate an address now.</div>');
      $(this).hide();
      console.log("walletSrvHost:"+$("#walletSrvHost").val() );
      console.log("walletSrvPort:"+$("#walletSrvPort").val() );
      connection.host += $("#walletSrvHost").val();
      connection.port += $("#walletSrvPort").val();
      connectToTangle();
      // We fetch the latest transactions every 90 seconds
      getAccountInfo();
      setInterval(getAccountInfo, 90000);
      alert("Tks for your connection params. You can generate an address now or send transfers.");
    });
    //
    // Generate a new address
    $("#genAddress").on("click", function() {
        if (!seed) {
            alert("seed missing, you need to enter one!");
            return
        }
        genAddress();
    })
    //
    // Send a new message
    $("#submit").on("click", function() {

        console.log ("Clicked Submit");
        if (!seed) {
            var html = '<div class="alert alert-warning alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>No Seed!</strong> You have not entered your seed yet. Do so on the panel on the right.</div>'
            $("#send__success").html(html);
            return
        }
        console.log("seed OK");       
        /*
        if (!balance || balance === 0) {
            var html = '<div class="alert alert-warning alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>No Tokens!</strong> You do not have enough IOTA tokens. Make sure you have enough confirmed tokens.</div>'
            $("#send__success").html(html);
            return
        }
        */
        console.log("balance OK");
        var name = $("#name").val();
        var value = parseInt($("#value").val());
        var address = $("#address").val();
        var message = $("#message").val();
        console.log ("Value =", value);
        if (!name || value == null || value == NaN || value < 0 || !message)
            return
        
        console.log("name, value, message OK");
        if (value > balance) {
            var html = '<div class="alert alert-warning alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Value too high!</strong> You have specified a too high value.</div>'
            $("#send__success").html(html);
            return
        }
        console.log("value <= balance: OK");
        // the message which we will send with the transaction
        var messageToSend = {
            'name': name,
            'message': message
        }
        // Convert the user message into trytes
        // In case the user supplied non-ASCII characters we throw an error
        try {
            console.log("Sending Message: ", messageToSend);
            var messageTrytes = iota.utils.toTrytes(JSON.stringify(messageToSend));
            console.log("Converted Message into trytes: ", messageTrytes);
            // We display the loading screen
            $("#send__waiting").css("display", "block");
            $("#submit").toggleClass("disabled");
            // If there was any previous error message, we remove it
            $("#send__success").html();
            // call send transfer
            sendTransfer(address, value, messageTrytes);
        } catch (e) {
            console.log(e);
            var html = '<div class="alert alert-warning alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Wrong Format!</strong> Your message contains an illegal character. Make sure you only enter valid ASCII characters.</div>'
            $("#send__success").html(html);
        }
    })
});

function connectToTangle() {
      var interruptAttachingToTangle = false;     
      console.log("Creating new IOTA instance...")
      iota = new IOTA({
         "host": connection.host,
         "port": connection.port
      });

      console.log("IOTA object:");
      console.log(iota);
      iota.api.getNodeInfo(function(e, nodeInfo) {
         console.log(nodeInfo);
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
            showLightWalletErrorMessage();m
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

//======== end of send.js
