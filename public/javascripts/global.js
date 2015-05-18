//
//   ██████╗ █████╗ ███╗   ██╗███╗   ██╗ █████╗ ██████╗  █████╗ ██╗   ██╗
//  ██╔════╝██╔══██╗████╗  ██║████╗  ██║██╔══██╗██╔══██╗██╔══██╗╚██╗ ██╔╝
//  ██║     ███████║██╔██╗ ██║██╔██╗ ██║███████║██████╔╝███████║ ╚████╔╝ 
//  ██║     ██╔══██║██║╚██╗██║██║╚██╗██║██╔══██║██╔═══╝ ██╔══██║  ╚██╔╝  
//  ╚██████╗██║  ██║██║ ╚████║██║ ╚████║██║  ██║██║     ██║  ██║   ██║   
//   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝   ╚═╝   
//   v1.0 created by. SubCreative (aka. Josh Dellay)              
//

// Userlist data array for filling in info box
var userListData = [];
if($( "#viewMarket option:selected" ).text() != ''){
    market = $( "#viewMarket option:selected" ).text();
} else {
    market = 'BTC-CCN';
}

// DOM Ready =============================================================
    $(document).ready(function() {
        //Drop down select for changing orderbook market (CURRENTLY DISABLED)
        
        var balances = [];
        populateUserSettings();
        populateExchangeTable(market);
        populateWalletTable();
        populateInvoiceTable();
        displayTransactions(10,0);
        displayTrades();
        displayOpenOrders(market);
        displayOrderBook(market);
        displayOpenLadders(market);


        // High-Priority Information Redraw Timer
        window.setInterval( function() {
            populateWalletTable();
            displayTransactions(10,0);
            displayOrderBook(market);

        }, 5000)

        // Medium-Priority Information Redraw Timer
        window.setInterval( function() {
            
            populateExchangeTable(market);
            displayTrades();
            displayOpenOrders(market);
            displayOpenLadders(market);

        }, 8000)

        var footer = $('#footer'),
        vis   = true,
        timer;

        footer.hide().fadeIn('slow');
        $(window).mousemove(function() {
            clearTimeout(timer);
            if (vis) {
                footer.fadeOut('slow');
                vis = false;
            }
            timer = setTimeout(function() {
                footer.fadeIn('slow');
                vis = true;
            }, 2000);
        });

        // InvoiceID link click
        $('#invoiceList table tbody').on('click', 'td a.linkshowinvoice', showInvoiceDetail);
        
        // Update template to light theme
        $("#light").click(function() { 
            $("link.template").attr("href",$(this).attr('rel'));
            return false;
        });

        // Update template to dark theme
        $("#dark").click(function() { 
            $("link.template").attr("href",$(this).attr('rel'));
            return false;
        });
    });

// Exchange Functions =====================(JQUERY REFACTOR COMPLETED)====

    // Fill exchange balance table with data (jQuery refactor 9/24)
    function populateExchangeTable(market) {

        // jQuery AJAX call for JSON
        $.getJSON( '/user/bittrex', function( data ) {
            
            // Create table to store updated data in
            var table = $('#exchangeBittrex table tbody');
            var tradeBalanceTable = $('#tradeBittrexBalance table tbody');

            // Clear the table each loop
            $(table).html('');
            $(tradeBalanceTable).html('');

            // if Ajax request fails show "enable API message" 
            if (data.success == false) {

                // Create the table row for each entry (jQuery)
                var tableRow = $('<tr/>').appendTo(table);
                var tradeTableRow = $('<tr/>').appendTo(tradeBalanceTable);

                // Append the rest of the blank <td> values to fill in our table row
                $('<td/>').appendTo(tableRow).html(data.message);
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');   

                // Append the rest of the blank <td> values to fill in our table row
                $('<td/>').appendTo(tradeTableRow).html(data.message);
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html(''); 
            
            // if Ajax request successfull... 
            } else {

                // Look through each item in our JSON object array.
                $.each(data['result'], function(){

                        // Create the table row for each entry (jQuery)
                        var tableRow = $('<tr/>').appendTo(table);
                        var tradeTableRow = $('<tr/>').appendTo(tradeBalanceTable);
                        
                        // Create the withdraw button/link for each row
                        var withdrawButton = $('<span/>')
                                        .attr('id','bittrexwithdrawForm'+this.Currency+'')
                                        .addClass('button-green')
                                        .html('Withdraw '+this.Currency+'')
                                        .data(this);    

                        // Append the <td> values to our table row
                        $('<td/>').appendTo(tableRow).html(this.Currency);
                        $('<td/>').appendTo(tableRow).html(this.Available);
                        $('<td/>').appendTo(tableRow).html(this.Pending);
                        $('<td/>').appendTo(tableRow).html(this.CryptoAddress);

                        // Append our withdrawButton creted above to our table row
                        $('<td/>').appendTo(tableRow).html(withdrawButton);    

                        if(market == 'BTC-'+this.Currency || this.Currency == 'BTC'){
                            // Append the <td> values to our table row
                            $('<td/>').appendTo(tradeTableRow).html(this.Currency);
                            $('<td/>').appendTo(tradeTableRow).html(this.Available);
                            $('<td/>').appendTo(tradeTableRow).html(this.Pending);
                            $('<td/>').appendTo(tradeTableRow).html(this.CryptoAddress);

                            // Append our withdrawButton creted above to our table row
                            $('<td/>').appendTo(tradeTableRow).html(withdrawButton);
                        }


                });
            }   
        });
        
        //Swisscex 
        /*
            // jQuery AJAX call for JSON
            $.getJSON( '/user/swisscex', function( exchangeInfo ) {

                // Create table to store updated data in
                var table = $('#exchangeSwisscex table tbody');

                // Clear the table each loop
                $(table).html('');
                
                if (exchangeInfo.success == false) {

                    // Create the table row for each entry (jQuery)
                    var tableRow = $('<tr/>').appendTo(table);

                    // Append the rest of the blank <td> values to fill in our table row
                    $('<td/>').appendTo(tableRow).html(exchangeInfo.message);
                    $('<td/>').appendTo(tableRow).html('');
                    $('<td/>').appendTo(tableRow).html('');
                    $('<td/>').appendTo(tableRow).html('');
                    $('<td/>').appendTo(tableRow).html('');    

                } else{
                    
                    // For each item in our JSON, add a table row and cells to the content string
                    $.each(exchangeInfo.data, function(){
                        
                        var object = {
                            currency: this.currency.symbol,
                            balance: this.balance
                        };

                        // Create the table row for each entry (jQuery)
                        var tableRow = $('<tr/>').appendTo(table);
                        
                        // Create the withdraw button/link for each row
                        var withdrawButton = $('<span/>')
                                        .attr('id','swisscexWithdrawForm'+this.currency.symbol+'')
                                        .addClass('button-green')
                                        .html('Withdraw '+this.currency.symbol+'')
                                        .data(object);    

                        // Append the <td> values to our table row
                        $('<td/>').appendTo(tableRow).html(this.currency['symbol']);
                        $('<td/>').appendTo(tableRow).html(this.balance);
                        $('<td/>').appendTo(tableRow).html(this.unconfirmedBalance);
                        $('<td/>').appendTo(tableRow).html(this.address);

                        // Append our withdrawButton creted above to our table row
                        $('<td/>').appendTo(tableRow).html(withdrawButton);  

                    });
                }
            });
        */
    };

// Wallet Functions =======================(JQUERY REFACTOR COMPLETED)====

    // Fill server wallet table with data (jQuery refactor 9/25)
    function populateWalletTable() {
        // jQuery AJAX call for JSON
        $.getJSON( '/user/balance', function( walletInfo ) {
            
            // Create table to store updated data in
            var table = $('#walletInfo table tbody');

            // Clear the table each loop
            $(table).html('');

            if (walletInfo.success == false) {
                
                // Create the table row for each entry (jQuery)
                var tableRow = $('<tr/>').appendTo(table);

                // Create the withdraw button/link for each row
                var getNewAddressButton = $('<span/>')
                                .addClass('button-green')
                                .html('Generate New Address')
                                .data({generateNewAddress: true});    

                // Append the rest of the blank <td> values to fill in our table row
                $('<td/>').appendTo(tableRow).html(getNewAddressButton);
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html(''); 

            } else {
                
                // Create the table row for each entry (jQuery)
                var tableRow = $('<tr/>').appendTo(table);

                // Create the withdraw button/link for each row
                var withdrawFunds = $('<span/>')
                                .addClass('button-green')
                                .attr('id', 'withdrawFunds')
                                .html('Withdraw')
                                .data({withdrawFunds: true, balance: walletInfo.data.balance}); 

                // Create the withdraw button/link for each row
                var listAddresses = $('<span/>')
                                .addClass('button-green')
                                .html('Show List')
                                .data({listAddresses: true}); 

                // Append the rest of the blank <td> values to fill in our table row
                $('<td/>').appendTo(tableRow).html(walletInfo.data.addresses[0]);
                $('<td/>').appendTo(tableRow).html(walletInfo.data.balance);
                $('<td/>').appendTo(tableRow).html(withdrawFunds);
                $('<td/>').appendTo(tableRow).html(listAddresses); 
            }
        });   
    };

    // (jQeuery Refactored 9/25)
    function getNewAddress() {   
        
        // jQuery AJAX call for JSON
        $.getJSON( '/user/newaddress', function( data ) {
           
            if(data.success == true){
                alertify.success('New address generated successfully!');
                populateWalletTable();
            } else {
                alertify.error('Error: '+ data.message)
            }
           
        });  
    };

    // (needs small jquery refactor)
    function listAddresses() {
       
        // jQuery AJAX call for JSON
        $.getJSON('/user/balance', function( data ) {

            if(data.success == false){
                
                alertify.error('Error: '+ data.message  )

            } else {
                    
                var addressesBody = '<table>';
                    addressesBody += '<h2 style="color:#389382;">Address List:<h2>';

                var label = 1;
                var i = 0;

                $.each(data.data.addresses, function(){
                    //TODO: Fix QR Codes
                    $('#qrcode2').qrcode({width: 75, height: 75, text: data.data.addresses[i]}) 
                    addressesBody += '<tr><td><div id="qrcode2" style="border-width: 0px;" ></div></td><td><a style="color: #222222" href="http://explorer.cannapay.io/api/addr/'+data.data.addresses[i]+'" class="addressList" id="'+data.data.addresses[i]+'">'+data.data.addresses[i]+'</a><td></tr>';
                    label++;
                    i++;
                });
                
                addressesBody += '</table>';

                $('#addressList table').html(addressesBody);
                $.colorbox({html:addressesBody, top:'150px'});
            }

        });  
    };

// Cannacoin Transactions Functions ===========(STILL NEEDS REFACTOR)=====
    
    // Create CCN Withdraw Popup showing balance
    function ccnWithdrawForm(balance) {

        withdrawForm = '';
        withdrawForm += '<div style="width:400px; height:150px;" id="bittrexWithdrawForm">';
        withdrawForm += '<center>';
        withdrawForm += '<p style="color:#222222;"> Available Balance: '+balance+'</p>';
        withdrawForm += '<form action="/user/bittrex/withdraw", method="POST">';
        withdrawForm += '<input type="text", name="ccnWithdrawAddress" class="withdraw", placeholder="Address", id="email">';
        withdrawForm += '<input type="text", name="ccnWithdrawAmount" class="withdraw", placeholder="Amount", id="coin">';
        withdrawForm += '<a class="btn" title="test" onclick="ccnWithdraw()" href="javascript:void(0);"> Withdraw</a>';

       $('#withdrawFunds').colorbox({html:withdrawForm, top:'150px', title: 'Cannacoin Withdraw'});
    };

    // Generate API Key
    function ccnWithdraw() {
        
        var withdraw = {
            withdrawaddress: $("input[name='ccnWithdrawAddress']").val(),
            amount: $("input[name='ccnWithdrawAmount']").val()
            
        }

        $.ajax({
                type: 'POST',
                data: withdraw,
                url: '/user/withdraw',
            }).done(function(response) {

                // Check for successful (blank) response
                if (response.success == true) {
                    $.colorbox.close();
                    alertify.success("Withdraw success!");
                }
                if(response.success == false) {

                    // If something goes wrong, alert the error message that our service returned
                    $.colorbox.close();
                    alertify.error(response.message);
                }
            });
    };

    // Fill server wallet table with data
    function displayTransactions(count, from) {
        // Empty content string
        var tableContent = '';
        var overviewInfo  = '';
        var txCount = 0;
        var txRec = 0;
        var txSent = 0;
        var txFees = 0;
        var txBalance = 0;
        
        // jQuery AJAX call for JSON
        $.getJSON( '/user/tx?count=' + count + '&from=' + from + '', function( data ) {
            
            txInfo = data;
            
            if (txInfo.success == false) {
                   
                // For each item in our JSON, add a table row and cells to the content string
                    tableContent += '<tr>';
                    tableContent += '<td class="userEmail">You don\'t have any transactions.</td>';
                    tableContent += '<td class="userEmail"></td>';
                    tableContent += '<td class="userEmail"></td>';
                    tableContent += '<td class="userEmail"></td>';
                    tableContent += '<td class="userEmail"></td>';
                    tableContent += '<td class="userEmail"></td>';
                    //tableContent += '<td><a class="btn" title="Generate New Address" onclick="getNewAddress()" href="javascript:void(0);">Generate New Address</a></td>';
                    tableContent += '</tr>';

                $('#txInfo table tbody').html(tableContent);

            } else {
                $.each(txInfo.tx, function(){
                    var date = new Date(this.time*1000);
                    var day = date.getDate();
                    var month = date.getMonth() + 1; //Months are zero based
                    var year = date.getFullYear();
                    var hours = date.getHours();
                    // minutes part from the timestamp
                    var minutes = date.getMinutes();
                    // seconds part from the timestamp
                    var seconds = date.getSeconds();

                    // will display time in 10:30:23 format
                    var formattedTime = month+'/'+day+'/'+year+' '+hours + ':' + minutes + ':' + seconds;

                    // For each item in our JSON, add a table row and cells to the content string
                    tableContent += '<tr>';
                    if(this.address == 'CWZfS4viQ28mGCpeTEbMme2eZZFZ3SGtJE'){
                        tableContent += '<td class="userEmail"><a href="http://cannacoin.cc:2750/address/'+this.address+'">Cannapay Fee (1%)</a></td>';    
                    } else {
                            tableContent += '<td class="userEmail"><a href="http://cannacoin.cc:2750/address/'+this.address+'">'+this.address+'</a></td>';    
                    }
                    if(this.amount < 0) {
                        tableContent += '<td class="userEmail"><font color="#e44229">'+(this.amount).toFixed(8)+'</font></td>';
                    } else {
                        tableContent += '<td class="userEmail"><font color="#3ab54a">'+(this.amount).toFixed(8)+'</font></td>';
                    }
                    if(this.fee === undefined){
                        tableContent += '<td class="userEmail"></td>';    
                    }
                    if(this.fee !== undefined){
                        tableContent += '<td class="userEmail">'+this.fee+'</td>';    
                    }
                    
                    tableContent += '<td class="userEmail">'+this.confirmations+'</td>';
                    tableContent += '<td class="userEmail"><a href="http://cannacoin.cc:2750/tx/'+this.txid+'">'+(this.txid).substring(0,16)+'...</a></td>';
                    tableContent += '<td class="userEmail">'+formattedTime+'</td>';
                    //tableContent += '<td><a class="btn" title="Generate New Address" onclick="getNewAddress()" href="javascript:void(0);">Generate New Address</a></td>';
                    tableContent += '</tr>';
                    
                    // Inject the whole content string into our existing HTML table
                    $('#txInfo table tbody').html(tableContent);
                    
                });

                jQuery('a.withdrawForm').colorbox({inline:true, top:'150px'});

            }
        
        });

        $.getJSON( '/user/tx?count=999&from=0', function( data ) {
            
            txInfo = data;
            
            if (txInfo.success == false) {
                   
                // For each item in our JSON, add a table row and cells to the content string
                overviewInfo += '<tr><td><span id="overViewTx" class="userEmail">No transaction history.</td>';

                $('#txhistory table').html(overviewInfo);

            } else {
                $.each(txInfo.tx, function(){
                    txCount++
                    if(this.fee !== undefined) {
                        txBalance = txBalance+this.amount+this.fee;

                    }
                    if(this.fee === undefined) {
                        this.fee = 'NA';
                        txBalance = txBalance+this.amount
                    }
                    

                    if(this.category === 'send') {
                        
                        txSent++;
                    }
                    if(this.category === 'receive') {
                        txRec++;
                    }
                    
                });
                overviewInfo += '<tr><td class="overview"><h2 style="margin-top: 0;">Transaction History:</h2></td>';
                overviewInfo += '<tr><td class="overview"><strong>Transactions:</strong></td>';
                overviewInfo += '<td><span id="overViewTx" class="userEmail">' + txCount + '</td>';
                overviewInfo += '<tr><td class="overview"><strong>Sent:</strong></td>';
                overviewInfo += '<td><span id="overViewSent" class="userEmail">' + txSent + '</td>';
                overviewInfo += '<tr><td class="overview"><strong>Received:</strong></td>';
                overviewInfo += '<td><span id="overViewRec" class="userEmail">' + txRec + '</td>';
                overviewInfo += '<tr><td class="overview"><strong>Balance:</strong></td>';
                overviewInfo += '<td><span id="overViewBalance" class="userEmail">' + txBalance.toFixed(8) + '</td>';


                $('#txhistory table').html(overviewInfo);

            }
        
        });
    };

// Bittrex Transactions Functions =============(STILL NEEDS REFACTOR)=====
    
    // Create CCN Withdraw Popup showing balance for Bittrex
    function bittrexWithdrawForm(bittrexBalance, bittrexCurrency) {

        var withdrawForm = $('#bittrexWithdrawForm');

        withdrawForm = '';
        withdrawForm += '<div style="width:400px; height:150px;" id="bittrexwithdrawForm">';
        withdrawForm += '<center>';
        withdrawForm += '<p style="color:#222222;" id="bittrexWithdrawFormAvailableBalance" value="'+bittrexBalance+'"> Available Balance: '+bittrexBalance+' </p>';
        withdrawForm += '<input type="text" name="'+bittrexCurrency+'bittrexWithdrawAddress" class="withdraw" placeholder="Address" id="email">';
        withdrawForm += '<input type="text" name="'+bittrexCurrency+'bittrexWithdrawAmount" class="withdraw" id="bittrexWithdrawFormAmount" placeholder="Amount">';
        withdrawForm += '<input type="hidden" name="'+bittrexCurrency+'bittrexWithdrawCurrency" class="withdraw" value="'+bittrexCurrency+'">';
        withdrawForm += '<a class="btn" title="test" onclick="bittrexWithdraw(\'' + bittrexBalance + '\',\'' + bittrexCurrency + '\')" href="javascript:void(0);">Withdraw '+bittrexCurrency+'</a>';

       $('#bittrexwithdrawForm'+bittrexCurrency+'').colorbox({html:withdrawForm, top:'150px', title: 'Bittrex Withdraw'});
    };

    // Create Bittrex Withdraw
    function bittrexWithdraw(bittrexBalance, bittrexCurrency) {
        
        var withdraw = {
            withdrawaddress: $('input[name="'+bittrexCurrency+'bittrexWithdrawAddress"]').val(),
            amount: $('input[name="'+bittrexCurrency+'bittrexWithdrawAmount"]').val(),
            currency: $('input[name="'+bittrexCurrency+'bittrexWithdrawCurrency"]').val(),
        }

        $.ajax({
                type: 'POST',
                data: withdraw,
                url: '/user/bittrex/withdraw',
        }).done(function (response) {
            
            console.log(response)
            // Check for successful (blank) response
            if(response.success == false) {
                // If something goes wrong, alert the error message that our service returned
                $.colorbox.close();
                alertify.error(response.message);
            } 
            if(response.success == true){
                $.colorbox.close();
                alertify.success('Withdraw success! UUID: '+response.result.uuid+'');
            }
        });
    };

// Swisscex Transactions Functions ============(STILL NEEDS REFACTOR)=====

    // Create CCN Withdraw Popup showing balance for swisscex
    function swisscexWithdrawForm(swisscexBalance, swisscexCurrency) {
        
        withdrawForm = '';
        withdrawForm += '<div style="width:400px; height:150px;" id="swisscexWithdrawFormAvailableBalance">';
        withdrawForm += '<center>';
        withdrawForm += '<p style="color:#222222;"> Available Balance: '+swisscexBalance+' </p>';
        withdrawForm += '<input type="text", name="'+swisscexCurrency+'swisscexWithdrawAddress" class="withdraw", placeholder="Address", id="email">';
        withdrawForm += '<input type="text", name="'+swisscexCurrency+'swisscexWithdrawAmount" class="withdraw", placeholder="Amount", id="swisscexWithdrawFormAmount">';
        withdrawForm += '<input type="hidden", name="'+swisscexCurrency+'swisscexWithdrawCurrency" class="withdraw" value="'+swisscexCurrency+'">';
        withdrawForm += '<a class="btn" title="test" onclick="swisscexWithdraw(\'' + swisscexBalance + '\',\'' + swisscexCurrency + '\')" href="javascript:void(0);">Withdraw '+swisscexCurrency+'</a>';

       $('#swisscexWithdrawForm'+swisscexCurrency+'').colorbox({html:withdrawForm, top:'150px', title: 'Swisscex Withdraw'});
    };

    // Create swisscex Withdraw
    function swisscexWithdraw(swisscexBalance, swisscexCurrency) {
        
        var withdraw = {
            withdrawaddress: $('input[name="'+swisscexCurrency+'swisscexWithdrawAddress"]').val(),
            amount: $('input[name="'+swisscexCurrency+'swisscexWithdrawAmount"]').val(),
            currency: $('input[name="'+swisscexCurrency+'swisscexWithdrawCurrency"]').val(),
        }
        
        console.log(withdraw)
        $.ajax({

                type: 'POST',
                data: withdraw,
                url: '/user/swisscex/withdraw',


            }).done(function(response) {
                console.log(response)
                // Check for successful (blank) response
                if (response.success == true) {
                    
                    alertify.success('Withdraw success! '+response.message+'');
                    $.colorbox.close();

                }
                else {
                    if(response.success == false){
                        alertify.error(response.message);
                        $.colorbox.close();
                    }
                    else {
                        alertify.error(response.message);
                        $.colorbox.close();
                    }
                }
            });
    };

// User Settings ==============================(STILL NEEDS REFACTOR)=====
    
    function populateUserSettings() {
    
        
        // Empty content string
        var userSettings = '';
        var userSettingsApi = '';
        var userSettingsBittrexApi = '';
        var userSettingsSwisscexApi = '';
        var userSettings2fa = '';
        var userSettingsYubiKey = '';

            // jQuery AJAX call for JSON
            $.getJSON( '/user', function( data ) {

                if(data.apiKeys.yubiKey && data.apiKeys.yubiKey.uuid != null){
                    var uuid = data.apiKeys.yubiKey.uuid
                } else {
                    var uuid = 'fObfuscate Shared Secret (UUID)'
                }
                userSettings += '<input id="email" class="form" placeholder="'+data.local.email+'" disabled><br>';
                userSettings += '<input id="protected" class="form" type="password" placeholder="New Password" name="passwordNew"><br>';
                userSettings += '<input id="protected" class="form" type="password" placeholder="Confirm New Password" name="passwordNewConfirm"></td><br><br>';
                userSettings += '<input id="protected" class="form" type="password" placeholder="Current Password" name="currentPassword" onkeydown="if (event.keyCode == 13) document.getElementById(\'updatePassword\').click()"><br>';
                userSettings += '<input id="key" class="form" type="password" placeholder="2FA Code" name="google2fa" onkeydown="if (event.keyCode == 13) document.getElementById(\'updatePassword\').click()"></td><br>';
                userSettings += '<a class="btn" title="Update Password" id="updatePassword" onclick="updatePassword()" href="javascript:void(0);">Update Password</a>';

                userSettingsApi += '<input id="key" class="form" placeholder="Cannapay API Key" name="cannapay" value="'+data.apiKeys.cannapay+'"><br>';
                userSettingsApi += '<a class="btn" title="Generate New Key" onclick="getNewApiKey()" href="javascript:void(0);">Generate New Key</a>';

                userSettings2fa += '<img id="2faQrcode" style="border-style:solid; border-color:#fff; border-width:1px;" src="'+data.apiKeys.google2fa.google_auth_url+'"></div>';
                userSettings2fa += '<a class="btn" title="Enable Two Factor Authentication" onclick="enable2fa()" href="javascript:void(0);">Enable 2FA</a>';
                userSettings2fa += '<a class="btn-red" title="Disable Two Factor Authentication" onclick="disable2fa()" href="javascript:void(0);">Disable 2FA</a>';

                userSettingsBittrexApi += '<input id="key" class="form" name="bittrexApiKey" placholder="Please enter an API Key" value="' + data.apiKeys.bittrexApiKey + '"><br>';
                userSettingsBittrexApi += '<input id="key" class="form" name="bittrexPrivateKey"  placholder="Please enter a Private Key" value="' + data.apiKeys.bittrexPrivateKey + '"><br>';
                userSettingsBittrexApi += '<a class="btn" title="Update Bittrex API Keys" onclick="updateBittrexApiKeys()" href="javascript:void(0);">Update API Keys</a>';

                userSettingsSwisscexApi += '<input id="key" class="form" name="swisscexApiKey"placholder="Please enter an API Key" value="' + data.apiKeys.swisscexApiKey + '"><br>';
                userSettingsSwisscexApi += '<input id="key" class="form" name="swisscexPrivateKey"placholder="Please enter a Private Key" value="' + data.apiKeys.swisscexPrivateKey + '"><br>';
                userSettingsSwisscexApi += '<a class="btn" title="Update Swisscex API Keys" onclick="updateSwisscexKeys()" href="javascript:void(0);">Update API Keys</a>';

                userSettingsYubiKey += '<input id="key" class="form" name="userSettingsYubiKeyUuid" placholder="Please enter a Fobfuscte Shared Secret (UUID)" value="' + uuid + '"><br>';
                userSettingsYubiKey += '<a class="btn" title="Enable fObfuscate Two Factor Authentication" onclick="enableFobfuscate()" href="javascript:void(0);">Enable fObfuscate</a>';
                userSettingsYubiKey += '<a class="btn-red" title="Disable fObfuscate Two Factor Authentication" onclick="disableFobfuscate()" href="javascript:void(0);">Disable fObfuscate</a>';
                userSettingsYubiKey += '<p align="left">Caution: Please enter your fObfuscate UUID above, you must insure that you have entered the correct UUID as once it is enabled it is required in order to authenticate with Cannapay. If for any reason the UUID is incorrect you will be locked out of your account and will need to contact the site admin.</a>';

                // Inject the whole content string into our existing HTML table
                $('#userSettings form').html(userSettings);
                $('#userSettingsApi form').html(userSettingsApi);
                $('#userSettings2fa form').html(userSettings2fa);
                $('#bittrexSettings form').html(userSettingsBittrexApi);
                $('#swisscexSettings form').html(userSettingsSwisscexApi);
                $('#yubiKeySettings form').html(userSettingsYubiKey);

            });
    };   

// User Table ============================(JQUERY REFACTOR COMPLETED)=====

    // Fill table with data (needs refactor)
    function populateUserTable() {

        // jQuery AJAX call for JSON
        $.getJSON( '/users', function( userListData ) {
            
            // Empty content string
            var table = $('#userList table tbody');
            // Reset table each redraw
            table.html('')

            // For each item in our JSON, add a table row and cells to the content string
            $.each(userListData, function(){
                
                var tableRow = $('<tr/>').appendTo(table);

                $('<td/>').appendTo(tableRow).html('<a href="#" class="linkshowuser" rel="' + this.username + '" title="Show Details">' + this.username + '</a>');
                $('<td/>').appendTo(tableRow).html(this.email);
                $('<td/>').appendTo(tableRow).html('<a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a>');

            });
        });
    };

    // Show User Info
    function showUserInfo(event) {

        // Prevent Link from Firing
        event.preventDefault();

        // Retrieve username from link rel attribute
        var thisUserName = $(this).attr('rel');

        // Get Index of object based on id value
        var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);
        
        // Get our User Object
        var thisUserObject = userListData[arrayPosition];

        //Populate Info Box
        $('#userInfoName').text(thisUserObject.fullname);
        $('#userInfoAge').text(thisUserObject.age);
        $('#userInfoGender').text(thisUserObject.gender);
        $('#userInfoLocation').text(thisUserObject.location);
    };

    // Add User
    function addUser(event) {
        event.preventDefault();

        // Super basic validation - increase errorCount variable if any fields are blank
        var errorCount = 0;

        $('#addUser input').each(function(index, val) {

            if($(this).val() === '') { errorCount++; }

        });

        // Check and make sure errorCount's still at zero
        if(errorCount === 0) {

            // If it is, compile all user info into one object
            var newUser = {

                'username'  : $('#addUser fieldset input#inputUserName').val(),
                'email'     : $('#addUser fieldset input#inputUserEmail').val(),
                'fullname'  : $('#addUser fieldset input#inputUserFullname').val(),
                'age'       : $('#addUser fieldset input#inputUserAge').val(),
                'location'  : $('#addUser fieldset input#inputUserLocation').val(),
                'gender'    : $('#addUser fieldset input#inputUserGender').val()
            }

            // Use AJAX to post the object to our adduser service
            $.ajax({

                type: 'POST',
                data: newUser,
                url: '/user/adduser',
                dataType: 'JSON'

            }).done(function(response) {

                // Check for successful (blank) response
                if (response.msg === '') {
                    alertify.success("Added user successfully!");
                    // Clear the form inputs
                    $('#addUser fieldset input').val('');

                    // Update the table
                    populateUserTable();

                }
                else {

                    // If something goes wrong, alert the error message that our service returned
                    alert('Error: ' + response.msg);

                }
            });
        }
        else {
            // If errorCount is more than 0, error out
            alertify.error('Please fill in all fields');
            return false;
        }
    };

    // Delete User
    function deleteUser(event) {

        event.preventDefault();
        
        user = $(this).attr('rel');

        alertify.confirm('Are you sure you want to delete this user? (ID: ' + user + ')', function (e) {
            // user clicked "ok"
            if (e) {
                
                // If they did, do our delete
                $.ajax({
                    type: 'DELETE',
                    url: '/user/deleteuser/' + user
                }).done(function( response ) {


                    // Check for a successful (blank) response
                    if (response.msg === '') {
                        alertify.success("User deleted successfully!");
                    }

                    else {
                        alertify.error("Error deleting user");
                    }

                    // Update the table
                    populateUserTable();

                });
            } else {
                alertify.error("Deleting user canceled.");
                return false;
            }

        });  
    };

    // Delete User
    function resetAttempts() {
                
        // If they did, do our delete
        $.ajax({
            type: 'GET',
            url: '/user/resetattempts/'
        }).done(function( response ) {

            
            // Check for a successful (blank) response
            if (response.success == true) {

                alertify.success(response.message);
                $( "#message" ).hide( "fast" );
            }

            else {
                alertify.error(response.message);
            }

        });
    };

// Invoice Functions =====================(JQUERY REFACTOR COMPLETED)=====

    // Fill table with data (needs refactor)
    function populateInvoiceTable() {

        // Empty content string
        var table = $('#invoiceTable table tbody');

        // Clear table each redraw
        table.html('')

        // jQuery AJAX call for JSON
        $.getJSON( '/invoices/list', function( invoiceData ) {

            // For each item in our JSON, add a table row and cells to the content string
            $.each(invoiceData, function(){

                //Create table row
                var tableRow = $('<tr/>').appendTo(table);
               
               // Create the withdraw button/link for each row
                var detailsButton = $('<span/>')
                                .attr('id','cancel_'+this._id+'')
                                .addClass('button-green')
                                .html('Details')
                                .data(this); 

                // Create the withdraw button/link for each row
                var printButton = $('<span/>')
                                .attr('id','cancel_'+this._id+'')
                                .addClass('button-green')
                                .html('Print')
                                .data(this); 
                // Append the rest of the blank <td> values to fill in our table row
                $('<td/>').appendTo(tableRow).html(this._id);
                $('<td/>').appendTo(tableRow).html(this.customer);
                $('<td/>').appendTo(tableRow).html(this.priority);
                $('<td/>').appendTo(tableRow).html(this.amount);
                $('<td/>').appendTo(tableRow).html(this.confirmed);
                $('<td/>').appendTo(tableRow).html(detailsButton);
                $('<td/>').appendTo(tableRow).html(printButton);

            });
        });
    };

    // Show Invoice Details
    function showInvoiceDetail(event) {

        // Prevent Link from Firing
        event.preventDefault();

        // Retrieve OrderId from link rel attribute
        var this_id = $(this).attr('rel');

        // Get Index of object based on id value
        var arrayPosition = invoiceData.map(function(arrayItem) { return arrayItem._id; }).indexOf(this_id);
        
        // Get our User Object
        var thisInvoiceObject = invoiceData[arrayPosition];

        //Populate Info Box
        $('#invoiceOrderId').text(thisInvoiceObject.orderId);
        $('#invoiceCustomer').text(thisInvoiceObject.customer);
        $('#invoicePriority').text(thisInvoiceObject.priority);
        $('#invoiceAmount').text(thisInvoiceObject.amount);
        $('#invoiceItems').text(thisInvoiceObject.items);
        $('#invoiceConfirmed').text(thisInvoiceObject.confirmed);
        $('#invoicePrint').text(thisInvoiceObject.confirmed);
    };

    // Delete User
    function deleteInvoice(event) {

        event.preventDefault();

        // Pop up a confirmation dialog
        var confirmation = confirm('Are you sure you want to delete this invoice?');

        // Check and make sure the user confirmed
        if (confirmation === true) {

            // If they did, do our delete
            $.ajax({
                type: 'DELETE',
                url: '/invoices/delete/' + $(this).attr('rel')
            }).done(function( response ) {

                // Check for a successful (blank) response
                if (response.msg === '') {
                }
                else {
                    alert('Error: ' + response.msg);
                }

                // Update the table
                populateTable();

            });

        }
        else {

            // If they said no to the confirm, do nothing
            return false;

        }
    };

// User Profile Functions ================(JQUERY REFACTOR COMPLETED)=====

    // Update user Password
    function updatePassword() {
            

        // Super basic validation - increase errorCount variable if any fields are blank
        var errorCount = 0;

        $('#userSettings input').each(function(index, val) {

            if($(this).val() === '') { errorCount++; }

        });

        //TODO: Update form check to be more legit
        // Check and make sure errorCount's still at zero
        if(errorCount === 2) {

            // If it is, compile all user info into one object
            var newUser = {

                'passwordNew'  : $("input[name='passwordNew']").val(),
                'passwordNewConfirm'  : $("input[name='passwordNewConfirm']").val(),
                'currentPassword'  : $("input[name='currentPassword']").val(),
                'google2fa'  : $("input[name='google2fa']").val()

            }
            
            // Use AJAX to post the object to our adduser service
            $.ajax({

                type: 'POST',
                data: newUser,
                url: '/user/update',


            }).done(function(response) {
                
                // Check for successful (blank) response
                if (response.success == true) {
                    alertify.success("Password updated successfully!");
                    // Clear the form inputs
                    $("input[name='passwordNew']").val('');
                    $("input[name='passwordNewConfirm']").val('');
                    $("input[name='currentPassword']").val('');
                    $("input[name='google2fa']").val('');

                    // Update the table
                    populateUserSettings();

                }
                else {

                    // If something goes wrong, alert the error message that our service returned
                    alertify.error(response.message);
                }
            });
        }
         else {
            // If errorCount is more than 0, error out
            alertify.error('Please fill in all fields');
            return false;
        }  
    };

    // Generate API Key
    function getNewApiKey() {
        
        // confirm dialog
        alertify.confirm("Are you sure you want to do this?", function (e) {
            // user clicked "ok"
            if (e) {
               
                // jQuery AJAX call for JSON
                $.getJSON( '/user/newapikey', function( data ) {
                   
                    if(data.success == true){
                        alertify.success('New API Key generated successfully!');
                        populateUserSettings();
                    } else {
                        alertify.error('Error: '+ data.message  )
                    }
                   
                });
            } else {
                // user clicked "cancel"
                alertify.error('Request canceled.');
            }
        });
    };

    // Generate API Key
    function enable2fa() {
       
       alertify.confirm("Are you sure you want to enable 2FA?", function (e) {
           // user clicked "ok"
           if (e) {
               // jQuery AJAX call for JSON
               $.getJSON( '/user/enable2fa', function( data ) {
                  
                   if(data.success == true){
                       response = '2FA Enabled! '+"\n"+' Please make sure to scan your QR Code using Google Authenticator!';

                       alertify.success(response);
                       populateUserSettings();
                   } else {
                       alertify.error('Error: '+ data.message  )
                   }
                
               });
           } else {
                alertify.error('Request canceled.')
           }
       });
    };

    // Generate API Key
    function disable2fa() {
        alertify.confirm("Are you sure you want to disable 2FA? This is not recommended.", function (e) {
            
            // user clicked "ok"            
            if (e) {
                $.getJSON( '/user/disable2fa', function( data ) {
                   
                    if(data.success == true){
                        alertify.error('2FA Disabled!');
                        populateUserSettings();
                    } else {
                        alertify.error('Error: '+ data.message  )
                    }
                });  
            } else {
                alertify.error('Request canceled.')
            }
        });
        // jQuery AJAX call for JSON    
    };

    // Enable Fobfuscate
    function enableFobfuscate() {
       
       alertify.confirm("Are you sure you want to enable 2FA Fobfuscate?", function (e) {
            // If it is, compile all user info into one object
            var updates = {

                'uuid'      : $("input[name='userSettingsYubiKeyUuid']").val(),
            }
           // user clicked "ok"
           if (e) {
                $.ajax({
                    type: 'POST',
                    data: updates,
                    url: '/user/enableFobfuscate',
                }).done(function(data) {
                  console.log(data)
                   if(data.success == true){
                       response = '2FA fObfuscate Enabled!';
                       alertify.success(response);
                       populateUserSettings();
                   } else {
                       alertify.error('Error: '+ data.message  )
                   }
               });
           } else {
                alertify.error('Request canceled.')
           }
       });
    };

    // Disable Fobfuscate
    function disableFobfuscate() {
        alertify.confirm("Are you sure you want to disable 2FA? This is not recommended.", function (e) {
            // user clicked "ok"            
            if (e) {
                $.ajax({
                    type: 'POST',
                    url: '/user/disableFobfuscate',
                }).done(function(data) {
                    if(data.success == true){
                        alertify.error('2FA fObfuscate Disabled!');
                        populateUserSettings();
                    } else {
                        alertify.error('Error: '+ data.message  )
                    }
                });  
            } else {
                alertify.error('Request canceled.')
            }
        });
        // jQuery AJAX call for JSON    
    };

    // Update user Password
    function updateBittrexApiKeys() {
            
        // Super basic validation - increase errorCount variable if any fields are blank
        var errorCount = 0;

        $('#bittrexSettings input').each(function(index, val) {

            if($(this).val() === '') { errorCount++; }

        });

        // Check and make sure errorCount's still at zero
        if(errorCount === 0) {

            // If it is, compile all user info into one object
            var updates = {

                'bittrexApiKey'      : $("input[name='bittrexApiKey']").val(),
                'bittrexPrivateKey'  : $("input[name='bittrexPrivateKey']").val()
            }
            
            // confirm dialog
            alertify.confirm("Are you sure you want to do this?", function (e) {
                // user clicked "ok"
                if (e) {
                    
                    // Use AJAX to post the object to our adduser service
                    $.ajax({

                        type: 'POST',
                        data: updates,
                        url: '/user/bittrex/apikeys',
                    }).done(function(response) {
                        
                        // Check for successful (blank) response
                        if (response.success == true) {
                            alertify.success("Bittrex API keys updated successfully!");
                            // Clear the form inputs
                            $("input[name='bittrexApiKey']").val('');
                            $("input[name='bittrexPrivateKey']").val('');

                            // Update the table
                            populateUserSettings();

                        }
                        else {

                            // If something goes wrong, alert the error message that our service returned
                            alertify.error(response.message);
                        }
                    });
                } else {
                    alertify.error('Request canceled.')
                }
            });
        }
         else {
            // If errorCount is more than 0, error out
            alertify.error('Please fill in all fields');
            return false;
        }  
    };

    // Update user Password
    function updateSwisscexKeys() {

        // Super basic validation - increase errorCount variable if any fields are blank
        var errorCount = 0;

        $('#swisscexSettings input').each(function(index, val) {

            if($(this).val() === '') { errorCount++; }

        });

        // Check and make sure errorCount's still at zero
        if(errorCount === 0) {

            // If it is, compile all user info into one object
            var updates = {

                'swisscexApiKey'      : $("input[name='swisscexApiKey']").val(),
                'swisscexPrivateKey'  : $("input[name='swisscexPrivateKey']").val()
            }
            

            // confirm dialog
            alertify.confirm("Are you sure you want to do this?", function (e) {
                // user clicked "ok"
                if (e) {
                    // Use AJAX to post the object to our adduser service
                    $.ajax({

                        type: 'POST',
                        data: updates,
                        url: '/user/swisscex/apikeys',
                    }).done(function(response) {
                        
                        // Check for successful (blank) response
                        if (response.success == true) {
                            alertify.success("Swisscex API keys updated successfully!");
                            // Clear the form inputs
                            $("input[name='swisscexApiKey']").val('');
                            $("input[name='swisscexPrivateKey']").val('');

                            // Update the table
                            populateUserSettings();

                        }
                        else {

                            // If something goes wrong, alert the error message that our service returned
                            alertify.error(response.message);
                        }
                    });
                } else {
                    alertify.error('Request canceled.')
                }
            });
        }
         else {
            // If errorCount is more than 0, error out
            alertify.error('Please fill in all fields');
            return false;
        }  
    };

// Trade Functions =======================(JQUERY REFACTOR COMPLETED)=====
    
    // Fill server wallet table with data
    function displayTrades() {
        
        // jQuery AJAX call for JSON
        $.getJSON( '/trade/history', function( tradeInfo ) {
            
            // Create table to store updated data in
            var table = $('#tradeInfo table tbody');

            // Clear the table each loop
            table.html('');

            if (tradeInfo.success == false) {
                   
                // Create the table row for each entry (jQuery)
                var tableRow = $('<tr/>').appendTo(table);

                // Append the rest of the blank <td> values to fill in our table row
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');

            } else {
                $.each(tradeInfo.data, function(){

                    var date = new Date(this.time*1000);
                    var day = date.getDate();
                    var month = date.getMonth() + 1; //Months are zero based
                    var year = date.getFullYear();
                    var hours = date.getHours();
                    // minutes part from the timestamp
                    var minutes = date.getMinutes();
                    // seconds part from the timestamp
                    var seconds = date.getSeconds();

                    // will display time in 10:30:23 format
                    var formattedTime = month+'/'+day+'/'+year+' '+hours + ':' + minutes + ':' + seconds;

                    // Create the table row for each entry (jQuery)
                    var tableRow = $('<tr/>').appendTo(table);

                    // Append the rest of the blank <td> values to fill in our table row
                    $('<td/>').appendTo(tableRow).html(this.exchange);
                    $('<td/>').appendTo(tableRow).html(this.market);
                    $('<td/>').appendTo(tableRow).html(this.type);
                    $('<td/>').appendTo(tableRow).html(this.rate);
                    $('<td/>').appendTo(tableRow).html(this.quantity);
                    $('<td/>').appendTo(tableRow).html(this.timestamp);
                    $('<td/>').appendTo(tableRow).html(this.completed);
                    
                });
            }
        
        });
    };

    // Show open orders from exchange (jQuery refactor 9/25)
    function displayOpenOrders (market) { 

        // jQuery AJAX call for JSON
        $.getJSON( '/trade/openorders'+ '?exchange=bittrex', function( orderInfo ) {
            
            // Create table to store updated data in
            var table = $('#orderInfo table tbody');
            var tradeTable = $('#tradeOrderInfo table tbody');

            // Clear the table each loop
            table.html('');
            $(tradeTable).html('');
            
            if (orderInfo.result == '' || orderInfo.success == false) {

                // Create the table row for each entry (jQuery)
                var tableRow = $('<tr/>').appendTo(table);
                var tradeTableRow = $('<tr/>').appendTo(tradeTable);

                // Append the rest of the blank <td> values to fill in our table row
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');

                // Append the rest of the blank <td> values to fill in our table row
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');
                

            } else {
                $.each(orderInfo.result, function(){

                    var date = new Date(this.time*1000);
                    var day = date.getDate();
                    var month = date.getMonth() + 1; //Months are zero based
                    var year = date.getFullYear();
                    var hours = date.getHours();
                    // minutes part from the timestamp
                    var minutes = date.getMinutes();
                    // seconds part from the timestamp
                    var seconds = date.getSeconds();
                    // will display time in 10:30:23 format
                    var formattedTime = month+'/'+day+'/'+year+' '+hours + ':' + minutes + ':' + seconds;


                    // Create the table row for each entry (jQuery)
                    var tableRow = $('<tr/>').appendTo(table);
                    var tradeTableRow = $('<tr/>').appendTo(tradeTable);

                    // Create the withdraw button/link for each row
                    var cancelButton = $('<span/>')
                                    .attr('id','cancel_'+this.id+'')
                                    .addClass('button-green')
                                    .html('Cancel')
                                    .data(this); 

                    // Append the rest of the blank <td> values to fill in our table row
                    $('<td/>').appendTo(tableRow).html(this.Exchange);
                    $('<td/>').appendTo(tableRow).html(this.OrderType);
                    $('<td/>').appendTo(tableRow).html((this.Limit).toFixed(8));
                    $('<td/>').appendTo(tableRow).html(this.Quantity);
                    $('<td/>').appendTo(tableRow).html(this.Opened);
                    $('<td/>').appendTo(tableRow).html(cancelButton);

                    if(this.Exchange == market){
                        // Append the rest of the blank <td> values to fill in our table row
                        $('<td/>').appendTo(tradeTableRow).html(this.Exchange);
                        $('<td/>').appendTo(tradeTableRow).html(this.OrderType);
                        $('<td/>').appendTo(tradeTableRow).html((this.Limit).toFixed(8));
                        $('<td/>').appendTo(tradeTableRow).html(this.Quantity);
                        $('<td/>').appendTo(tradeTableRow).html(this.Opened);
                        $('<td/>').appendTo(tradeTableRow).html(cancelButton);
                    }



                    
                });
            }
        
        });
    };

    // Show open ladders (jQuery refactor 9/25)
    function displayOpenLadders(market) {
    
        // jQuery AJAX call for JSON
        $.getJSON( '/trade/openladders'+ '?exchange=bittrex' + '&market='+market+'', function( ladderInfo ) {
            
            // Create table to store updated data in
            var table = $('#ladderInfo table tbody');
            var tradeTable = $('#tradeLadderInfo table tbody');

            // Clear the table each loop
            $(table).html('');
            $(tradeTable).html('');

            if (ladderInfo.result == '' || ladderInfo.success == false) {
                   
                // Create the table row for each entry (jQuery)
                var tableRow = $('<tr/>').appendTo(table);
                var tradeTableRow = $('<tr/>').appendTo(tradeTable);

                // Append the rest of the blank <td> values to fill in our table row
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');
                $('<td/>').appendTo(tableRow).html('');

                // Append the rest of the blank <td> values to fill in our table row
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');
                $('<td/>').appendTo(tradeTableRow).html('');


            } else {
                $.each(ladderInfo.data, function(){

                    // Create the table row for each entry (jQuery)
                    var tableRow = $('<tr/>').appendTo(table);
                    var tradeTableRow = $('<tr/>').appendTo(tradeTable);

                    // Create the withdraw button/link for each row
                    var cancelButton = $('<span/>')
                                    .attr('id','cancel_'+this.id+'')
                                    .addClass('button-green')
                                    .html('Cancel')
                                    .data(this); 

                    // Append the rest of the <td> values to fill in our table row
                    $('<td/>').appendTo(tableRow).html(this.market);
                    $('<td/>').appendTo(tableRow).html(this.type);
                    $('<td/>').appendTo(tableRow).html(this.start);
                    $('<td/>').appendTo(tableRow).html(this.stop);
                    $('<td/>').appendTo(tableRow).html(this.spread);
                    $('<td/>').appendTo(tableRow).html(this.quantity);
                    $('<td/>').appendTo(tableRow).html(cancelButton);    

                    if(this.market == market){
                        // Append the rest of the <td> values to fill in our table row
                        $('<td/>').appendTo(tradeTableRow).html(this.market);
                        $('<td/>').appendTo(tradeTableRow).html(this.type);
                        $('<td/>').appendTo(tradeTableRow).html(this.start);
                        $('<td/>').appendTo(tradeTableRow).html(this.stop);
                        $('<td/>').appendTo(tradeTableRow).html(this.spread);
                        $('<td/>').appendTo(tradeTableRow).html(this.quantity);
                        $('<td/>').appendTo(tradeTableRow).html(cancelButton);    
                    };
                    
                });
            }
        });
    };
        
    function cancelOrder(uuid) {   

        // If they did, do our delete
        $.ajax({
            type: 'GET',
            url: '/trade/cancel?exchange=bittrex&uuid='+uuid+''
        }).done(function( response ) {

            
            // Check for a successful (blank) response
            if (response.success == true) {
                alertify.success(response.message);
            }

            else {
                alertify.error(response.message);
            }

        });  
    };

    function cancelLadder(id) {

        // If they did, do our delete
        $.ajax({
            type: 'GET',
            url: '/trade/cancelladder?exchange=bittrex&id='+id+''
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.success == true) {
                alertify.success(response.message);
            }

            else {
                alertify.error(response.message);
            }

        });  
    };

    // Create sellLimit order
    function sellLimit() {
        // Super basic validation - increase errorCount variable if any fields are blank
        var errorCount = 0;

            // If it is, compile all user info into one object
            var trade = {

                'exchange'  : $("input[name='sellLimitExchange']").val(),
                'market'    : $("input[name='sellLimitMarket']").val(),
                'type'      : $("input[name='sellLimitType']").val(),
                'rate'      : $("input[name='sellLimitRate']").val(),
                'quantity'  : $("input[name='sellLimitQuantity']").val(),
                'enabled'   : $("input[name='sellLimitEnabled']").val()

            }
            
            // Use AJAX to post the object to our adduser service
            $.ajax({

                type: 'GET',
                data: trade,
                url: '/trade/selllimit',


            }).done(function(response) {
                
                // Check for successful (blank) response
                if (response.success == true) {
                    
                    alertify.success("New sell limit placed at "+Number($("input[name='sellLimitRate']").val()).toFixed(8)+" ("+$("input[name='sellLimitMarket']").val()+")!");

                    // Clear the form inputs
                    $("input[name='sellLimitRate']").val('0.00000000'),
                    $("input[name='sellLimitQuantity']").val(''),
                    $("#sellLimitExchangeCalc").fadeOut();

                    // Update the table
                    displayOpenOrders();

                }
                else {

                    // If something goes wrong, alert the error message that our service returned
                    alertify.error(response.message);
                }
            });
    };

    // Create buyLimit order
    function buyLimit() {
        // Super basic validation - increase errorCount variable if any fields are blank
        var errorCount = 0;

            // If it is, compile all user info into one object
            var trade = {

                'exchange'  : $("input[name='buyLimitExchange']").val(),
                'market'    : $("input[name='buyLimitMarket']").val(),
                'type'      : $("input[name='buyLimitType']").val(),
                'rate'      : $("input[name='buyLimitRate']").val(),
                'quantity'  : $("input[name='buyLimitQuantity']").val(),
                'enabled'   : $("input[name='buyLimitEnabled']").val()

            }
            
            // Use AJAX to post the object to our adduser service
            $.ajax({

                type: 'GET',
                data: trade,
                url: '/trade/buylimit',


            }).done(function(response) {
                
                // Check for successful response
                if (response.success == true) {
                    
                    // Send popup alert to notify user of success 
                    alertify.success("New buy limit placed at "+Number($("input[name='buyLimitRate']").val()).toFixed(8)+" ("+$("input[name='buyLimitMarket']").val()+")!");

                    // Clear the form inputs
                    $("input[name='buyLimitRate']").val('0.00000000'),
                    $("input[name='buyLimitQuantity']").val(''),
                    $("#buyLimitExchangeCalc").fadeOut();
                    
                    // Redraw the open order table with changes.
                    displayOpenOrders();

                }
                else {

                    // If something goes wrong, alert the error message that our service returned
                    alertify.error(response.message);
                }
            });
    };

    // Display market order books & draw graph (jQuery refactor 9/24)
    function displayOrderBook(market) {

        // Create buy/sell table for bittrex orderbook
        var buyTable = $('#bittrexOrderBookBuy table tbody');
        var sellTable = $('#bittrexOrderBookSell table tbody');

        // Create buy/sell table for swisscex orderbook
        var swisscexBuyTable = $('#swisscexOrderBookBuy table tbody');
        var swisscexSellTable = $('#swisscexOrderBookSell table tbody');

        // jQuery AJAX call for bittrex order book data
        $.getJSON( '/trade/orderbook'+ '?exchange=bittrex' + '&market='+market+'' + '&type=both', function (orderBook) {

            // Buy & Sell Depth Data used for charts {x: rate, y: quantity} (javascripts/ui/charts.js)
            var buyDepth = [];
            var sellDepth = [];

            // Clear the buy/sell tables after each loop
            $(buyTable).html('');
            $(sellTable).html('');

            if (orderBook.result == '' || orderBook.success == false) {
                
                // Create the table row for each buy entry (jQuery)
                var buyTableRow = $('<tr/>').appendTo(buyTable);
                var errorMsg = 'No order book data available.';

                // Append the rest of the blank <td> values to fill in our buy table row
                $('<td/>').appendTo(buyTableRow).html(errorMsg);
                $('<td/>').appendTo(buyTableRow).html('');
                $('<td/>').appendTo(buyTableRow).html('');

                // Create the table row for each sell entry (jQuery)
                var sellTableRow = $('<tr/>').appendTo(sellTable);

                // Append the rest of the blank <td> values to fill in our sell table row
                $('<td/>').appendTo(sellTableRow).html(errorMsg);
                $('<td/>').appendTo(sellTableRow).html('');
                $('<td/>').appendTo(sellTableRow).html('');

            } else {
                $.each(orderBook.result.buy, function(){

                    //Push total buy quantity to array for use in our depth charting (javascripts/ui/charts.js)
                    if(this.Rate.toFixed(8) !== '0.00000000'){
                        buyDepth.push({name:'Buy', x: this.Rate.toFixed(8), y: Number(this.Quantity.toFixed(8))});    
                    }

                    // Apply variable names to data (fixed floating point)
                    var total = (this.Quantity*this.Rate).toFixed(8);
                    var quantity = this.Quantity.toFixed(8);
                    var rate = this.Rate.toFixed(8)

                    // Create the table row for each buy entry (jQuery)
                    var buyTableRow = $('<tr/>').appendTo(buyTable);

                    // Append the rest of the blank <td> values to fill in our buy table row
                    $('<td/>').appendTo(buyTableRow).html(total);
                    $('<td/>').appendTo(buyTableRow).html(quantity);
                    $('<td/>').appendTo(buyTableRow).html(rate);
                });
                $.each(orderBook.result.sell, function(){


                    if(this.Rate.toFixed(8) !== '0.00000000'){
                        sellDepth.push({name:'Sell', x: this.Rate.toFixed(8), y: Number(this.Quantity.toFixed(8))});    
                    }

                     // Apply variable names to data (fixed floating point)
                    var total = (this.Quantity*this.Rate).toFixed(8);
                    var quantity = this.Quantity.toFixed(8);
                    var rate = this.Rate.toFixed(8)

                    // Create the table row for each buy entry (jQuery)
                    var sellTableRow = $('<tr/>').appendTo(sellTable);

                    // Append the rest of the blank <td> values to fill in our buy table row
                    $('<td/>').appendTo(sellTableRow).html(rate);
                    $('<td/>').appendTo(sellTableRow).html(quantity);
                    $('<td/>').appendTo(sellTableRow).html(total); 
                });
            }
            //Update market depth chart
            marketDepthChart(market, buyDepth, sellDepth);
            //Update market history chart
            displayMarketHistory(market);
        });
        
        
        // jQuery AJAX call for swisscex order book data
        var swisscexMarket = market.split('-')[1];
        $.getJSON( '/trade/orderbook?exchange=swisscex&market='+swisscexMarket+'', function (orderBook) {

            // Buy & Sell Depth Data used for charts {x: rate, y: quantity} (javascripts/ui/charts.js)
            var buyDepth = [];
            var sellDepth = [];

            // Clear the buy/sell tables after each loop
            $(swisscexBuyTable).html('');
            $(swisscexSellTable).html('');

            if ((orderBook.data.buyOrders).length == 0 || (orderBook.data.sellOrders).length == 0) {
                
                // Create the table row for each buy entry (jQuery)
                var buyTableRow = $('<tr/>').appendTo(swisscexBuyTable);
                var errorMsg = 'No order book data available.';

                // Append the rest of the blank <td> values to fill in our buy table row
                $('<td/>').appendTo(buyTableRow).html(errorMsg);
                $('<td/>').appendTo(buyTableRow).html('');
                $('<td/>').appendTo(buyTableRow).html('');

                // Create the table row for each sell entry (jQuery)
                var sellTableRow = $('<tr/>').appendTo(swisscexSellTable);

                // Append the rest of the blank <td> values to fill in our sell table row
                $('<td/>').appendTo(sellTableRow).html(errorMsg);
                $('<td/>').appendTo(sellTableRow).html('');
                $('<td/>').appendTo(sellTableRow).html('');

            } else {
                $.each(orderBook.data.buyOrders, function(){

                    //Push total buy quantity to array for use in our depth charting (javascripts/ui/charts.js)
                    if(this.price.toFixed(8) !== '0.00000000'){
                        buyDepth.push({name:'Buy', x: this.price.toFixed(8), y: Number(this.size.toFixed(8))});    
                    }

                    // Apply variable names to data (fixed floating point)
                    var total = (this.size*this.price).toFixed(8);
                    var quantity = this.size.toFixed(8);
                    var rate = this.price.toFixed(8)

                    // Create the table row for each buy entry (jQuery)
                    var buyTableRow = $('<tr/>').appendTo(swisscexBuyTable);

                    // Append the rest of the blank <td> values to fill in our buy table row
                    $('<td/>').appendTo(buyTableRow).html(total);
                    $('<td/>').appendTo(buyTableRow).html(quantity);
                    $('<td/>').appendTo(buyTableRow).html(rate);
                });
                $.each(orderBook.data.sellOrders, function(){


                    if(this.price.toFixed(8) !== '0.00000000'){
                        sellDepth.push({name:'Sell', x: this.price.toFixed(8), y: Number(this.size.toFixed(8))});    
                    }

                     // Apply variable names to data (fixed floating point)
                    var total = (this.size*this.price).toFixed(8);
                    var quantity = this.size.toFixed(8);
                    var rate = this.price.toFixed(8)

                    // Create the table row for each buy entry (jQuery)
                    var sellTableRow = $('<tr/>').appendTo(swisscexSellTable);

                    // Append the rest of the blank <td> values to fill in our buy table row
                    $('<td/>').appendTo(sellTableRow).html(rate);
                    $('<td/>').appendTo(sellTableRow).html(quantity);
                    $('<td/>').appendTo(sellTableRow).html(total); 
                });
            }
            //Update market depth chart
            //swisscexMarketDepthChart(market, buyDepth, sellDepth);
            //Update market history chart
            //swisscexDisplayMarketHistory(market);
        });

    };

    function displayMarketHistory(market) {
        
        // jQuery AJAX call for JSON
        $.getJSON( '/trade/markethistory'+ '?exchange=bittrex' + '&market='+market+'', function( data ) {
            // Create empty market history buy/sell array
            var marketHistoryChartBuy = [];
            var marketHistoryChartSell = [];

            var tableContentHistory = '';
            
            if (data.result == false) {

                    // For each item in our JSON, add a table row and cells to the content string
                    tableContentHistory += '<h1>No market history available.</h1>';

                    
                $('#marketHistoryChart').html(tableContentHistory);

            } else {
                $.each(data.result, function(){
                    
                    if(this.OrderType == 'SELL'){
                        marketHistoryChartSell.push([(this.Price).toFixed(8), this.Quantity]);
                    }
                    if(this.OrderType == 'BUY'){
                        marketHistoryChartBuy.push([(this.Price).toFixed(8), this.Quantity]);
                    }
                
                });
                
            }

            // Create depth chart for order book (using highcharts (style for chart @ javascripts/highchartdark.js))
            marketHistoryChart(marketHistoryChartBuy, marketHistoryChartSell);
            
        });
    };

    function bittrexBuy(market) {   
        
        // Compile all user info into one object
        var trade = {
            'exchange'  : $("input[name='buyExchange']").val(),
            'market'  : $("input[name='buyMarket']").val(),
            'rate'  : $("input[name='buyRate']").val(),
            'quantity'  : $("input[name='buyQuantity']").val(),
        }
        
        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'GET',
            data: trade,
            url: '/trade/buy',

        }).done(function(response) {
           
            // Check for successful (blank) response
            if (response.success == true) {
                alertify.success("New buy order added!");
                // Clear the form inputs
                $("input[name='buyRate']").val('0.00000000'),
                $("input[name='buyQuantity']").val('')

                // Update the table
                displayOpenOrders();

            }
            
            else {
                // If something goes wrong, alert the error message that our service returned
                alertify.error('Error: ' + response.message);
            }
        });
    };

    function bittrexSell(market) {   

            // Compile all user info into one object
            var trade = {
                'exchange'  : $("input[name='sellExchange']").val(),
                'market'  : $("input[name='sellMarket']").val(),
                'rate'  : $("input[name='sellRate']").val(),
                'quantity'  : $("input[name='sellQuantity']").val(),
            }
            
            // Use AJAX to post the object to our adduser service
            $.ajax({
                type: 'GET',
                data: trade,
                url: '/trade/sell'

            }).done(function(response) {
    
                // Check for successful (blank) response
                if (response.success == true) {
                    
                    // Trigger popup notification
                    alertify.success("New sell order added!");
                    
                    // Reset the form inputs
                    $("input[name='sellRate']").val('0.00000000'),
                    $("input[name='sellQuantity']").val('')

                    // Update the table
                    displayOpenOrders();

                }
                else {

                    // If something goes wrong, alert the error message that our service returned
                    alertify.error('Error: ' + response.message);
                }
            });
    };

    function bittrexBuyLadder(market) {   
        // Compile all user info into one object
        var trade = {
            'exchange'      : $("input[name='bittrexBuyLadderExchange']").val(),
            'market'        : $("input[name='bittrexBuyLadderMarket']").val(),
            'startPrice'    : $("input[name='bittrexBuyLadderStart']").val(),
            'stopPrice'     : $("input[name='bittrexBuyLadderStop']").val(),
            'spread'        : $("input[name='bittrexBuyLadderSpread']").val()*0.00000001,
            'quantity'      : $("input[name='bittrexBuyLadderQuantity']").val(),
        }
        
        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'GET',
            data: trade,
            url: '/trade/buyladder',

        }).done(function(response) {

            // Check for successful (blank) response
            if (response.success == true) {
                alertify.success("New buy ladder created!");
                // Clear the form inputs
                $("input[name='bittrexBuyLadderStart']").val('0.00000000'),
                $("input[name='bittrexBuyLadderStop']").val('0.00000000'),
                $("input[name='bittrexBuyLadderSpread']").val(''),
                $("input[name='bittrexBuyLadderQuantity']").val(''),
                $("#buyLadderCalc").fadeOut();

                // Update the table
                displayOpenLadders();

            }
            else {
                // If something goes wrong, alert the error message that our service returned
                alertify.error('Error: ' + response.message);
            }
        });
    };

    function bittrexSellLadder(market) {  

        // Compile all user info into one object
        var trade = {
            'exchange'      : $("input[name='bittrexSellLadderExchange']").val(),
            'market'        : $("input[name='bittrexSellLadderMarket']").val(),
            'startPrice'    : $("input[name='bittrexSellLadderStart']").val(),
            'stopPrice'     : $("input[name='bittrexSellLadderStop']").val(),
            'spread'        : $("input[name='bittrexSellLadderSpread']").val()*0.00000001,
            'quantity'      : $("input[name='bittrexSellLadderQuantity']").val(),
        }
        
        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'GET',
            data: trade,
            url: '/trade/sellladder',

        }).done(function(response) {
           
            // Check for successful (blank) response
            if (response.success == true) {
                alertify.success("New sell ladder created!");
                // Clear the form inputs
                $("input[name='bittrexSellLadderStart']").val('0.00000000'),
                $("input[name='bittrexSellLadderStop']").val('0.00000000'),
                $("input[name='bittrexSellLadderSpread']").val(''),
                $("input[name='bittrexSellLadderQuantity']").val(''),
                $("#sellLadderCalc").fadeOut();
                
                // Update the table
                displayOpenLadders();

            }
            else {
                // If something goes wrong, alert the error message that our service returned
                alertify.error('Error: ' + response.message);
            }
        });
    };

    function swisscexBuy() {   
        // Compile all user info into one object
        var trade = {
            'exchange'  : $("input[name='buyExchange']").val(),
            'symbol'  : ($("input[name='buyMarket']").val()).split('-')[1]+'_BTC',
            'price'  : $("input[name='buyRate']").val(),
            'qty'  : $("input[name='buyQuantity']").val(),
        }
        console.log(trade)
        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'GET',
            data: trade,
            url: '/trade/buy',

        }).done(function(response) {
           console.log(response)
            // Check for successful (blank) response
            if (response.success == true) {
                alertify.success("New buy order added!");
                // Clear the form inputs
                $("input[name='buyRate']").val('0.00000000'),
                $("input[name='buyQuantity']").val('')

                // Update the table
                displayOpenOrders();

            }
            
            else {
                // If something goes wrong, alert the error message that our service returned
                alertify.error('Error: ' + response.error);
            }
        });
    };

    function swisscexSell() {   
        // Compile all user info into one object
        var trade = {
            'exchange'  : $("input[name='sellExchange']").val(),
            'symbol'  : ($("input[name='sellMarket']").val()).split('-')[1]+'_BTC',
            'price'  : $("input[name='sellRate']").val(),
            'qty'  : $("input[name='sellQuantity']").val(),
        }
        console.log(trade)
        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'GET',
            data: trade,
            url: '/trade/sell',

        }).done(function(response) {
           console.log(response)
            // Check for successful (blank) response
            if (response.success == true) {
                alertify.success("New sell order added!");
                // Clear the form inputs
                $("input[name='sellRate']").val('0.00000000'),
                $("input[name='sellQuantity']").val('')

                // Update the table
                displayOpenOrders();

            }
            
            else {
                // If something goes wrong, alert the error message that our service returned
                alertify.error('Error: ' + response.error);
            }
        });
    };

    
