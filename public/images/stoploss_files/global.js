// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
    $(document).ready(function() {

        populateUserSettings();

        populateExchangeTable();

        populateWalletTable();

        populateUserSettings();

        populateInvoiceTable();

        displayTransactions(10,0);

        // InvoiceID link click
        $('#invoiceList table tbody').on('click', 'td a.linkshowinvoice', showInvoiceDetail);
        // Delete User link click

        $("#light").click(function() { 
            $("link.template").attr("href",$(this).attr('rel'));
            return false;
        });

        $("#dark").click(function() { 
            $("link.template").attr("href",$(this).attr('rel'));
            return false;
        });
    });

// Exchange Functions ====================================================
    // Fill exchange balance table with data
    function populateExchangeTable() {

        $('ul.tabs').each(function(){
                // For each set of tabs, we want to keep track of
                // which tab is active and it's associated content
                var $active, $content, $links = $(this).find('a.tab');

                // If the location.hash matches one of the links, use that as the active tab.
                // If no match is found, use the first link as the initial active tab.
                $active = $($links.filter('[href="'+location.hash+'"]')[0] || $links[0]);
                $active.addClass('active');

                $content = $($active[0].hash);

                // Hide the remaining content
                $links.not($active).each(function () {
                  $(this.hash).hide();
                });

                // Bind the click event handler
                $(this).on('click', 'a.tab', function(e){
                    // Make the old tab inactive.
                    $active.removeClass('active');
                    $content.hide();

                    // Update the variables with the new link and content
                    $active = $(this);
                    $content = $(this.hash);

                    // Make the tab active.
                    $active.addClass('active');
                    $content.show();

                    // Prevent the anchor's default click action
                    e.preventDefault();
                });
            });

        var bittrexTableContent = '';

        // jQuery AJAX call for JSON
        $.getJSON( '/user/bittrex', function( data ) {
           
            // Empty content string

            if (data.success == false) {

                bittrexTableContent += '<tr>';
                bittrexTableContent += '<td class="userEmail">Error: '+data.message+'</td>';
                bittrexTableContent += '<td class="userEmail"></td>';
                bittrexTableContent += '<td class="userEmail"></td>';
                bittrexTableContent += '<td class="userEmail"></td>';
                bittrexTableContent += '<td></td>';
                bittrexTableContent += '</tr>';

                $('#exchangeBittrex table tbody').html(bittrexTableContent);
                
            } else {

                // For each item in our JSON, add a table row and cells to the content string
                $.each(data['result'], function(){
                   
                        bittrexTableContent += '<tr>';
                        bittrexTableContent += '<td class="userEmail">' + this.Currency + '</td>';
                        bittrexTableContent += '<td class="userEmail">' + this.Available + '</td>';
                        bittrexTableContent += '<td class="userEmail">' + this.Pending + '</td>';
                        bittrexTableContent += '<td class="userEmail">' + this.CryptoAddress + '</td>';
                        bittrexTableContent += '<td><a class="button-green" title="Withdraw Bittrex Funds ('+this.Currency+')" onclick="bittrexWithdrawForm(\'' + this.Available + '\',\'' + this.Currency + '\')" href="javascript:void(0);" id="bittrexwithdrawForm'+this.Currency+'">Withdraw '+this.Currency+'</a></td>';
                        bittrexTableContent += '</tr>';

                        jQuery('a.bittrexwithdrawForm'+this.Currency+'').colorbox({inline:true, top:'150px'});
                        
                });
                $('#exchangeBittrex table tbody').html(bittrexTableContent);
            }   

            
            
            // Open colorbox window when withdraw is clicked
          // jQuery('a.withdrawForm').colorbox({inline:true, onClosed: close()});
        });
        
        // Empty content string
        var swisscexTableContent = '';

        // jQuery AJAX call for JSON
        $.getJSON( '/user/swisscex', function( data ) {
            exchangeInfo = data;
        
                if (data.success == false) {

                    swisscexTableContent += '<tr>';
                    swisscexTableContent += '<td class="userEmail">Error: '+data.message+'</td>';
                    swisscexTableContent += '<td class="userEmail"></td>';
                    swisscexTableContent += '<td class="userEmail"></td>';
                    swisscexTableContent += '<td class="userEmail"></td>';
                    swisscexTableContent += '<td></td>';
                    swisscexTableContent += '</tr>';

                    $('#exchangeSwisscex table tbody').html(swisscexTableContent);

                } else{
                    console.log(data.data)
                    // For each item in our JSON, add a table row and cells to the content string
                    $.each(data.data, function(){

                        swisscexTableContent += '<tr>';
                        swisscexTableContent += '<td class="userEmail">' + this.currency['symbol'] + '</td>';
                        swisscexTableContent += '<td class="userEmail">' + this.balance + '</td>';
                        swisscexTableContent += '<td class="userEmail">' + this.unconfirmedBalance + '</td>';
                        swisscexTableContent += '<td class="userEmail">' + this.address + '</td>';
                        swisscexTableContent += '<td><a class="button-green" title="Withdraw Swisscex Funds ('+this.currency['symbol']+')" onclick="swisscexWithdrawForm(\'' + this.balance + '\',\'' + this.currency['symbol'] + '\')" href="javascript:void(0);" id="swisscexwithdrawForm'+this.currency['symbol']+'">Withdraw '+this.currency['symbol']+'</a></td>';
                        swisscexTableContent += '</tr>';

                        
                        jQuery('a.swisscexwithdrawForm'+this.currency['symbol']+'').colorbox({inline:true, top:'150px'});

                    });

                    $('#exchangeSwisscex table tbody').html(swisscexTableContent);
                    
                    
                }
            
            // Open colorbox window when withdraw is clicked
            //
        });
    };

// Wallet Functions ======================================================

    // Fill server wallet table with data
    function populateWalletTable() {

        // Empty content string
        var tableContent = '';
        
        // jQuery AJAX call for JSON
        $.getJSON( '/user/balance', function( data ) {
            
            walletInfo = data;
         
            if (data.success == false) {
                
                tableContent += '<tr>';
                tableContent += '<td class="userEmail"><a class="btn" title="Generate New Address" onclick="getNewAddress()" href="javascript:void(0);">Generate New Address</a></td>';
                tableContent += '<td class="userEmail"></td>';
                tableContent += '<td class="userEmail"></td>';
                tableContent += '<td class="userEmail"></td>';
                tableContent += '</tr>';

                $('#walletInfo table tbody').html(tableContent);

            } else {
        
                // For each item in our JSON, add a table row and cells to the content string
                tableContent += '<tr>';
                tableContent += '<td class="userEmail"><div id="qrcode" style="border-style: solid; border-width: 4px; border-color: #fff;" width="75px" height="75px"></div></td>';
                tableContent += '<td class="userEmail">'+walletInfo.data.label+'</td>';
                tableContent += '<td class="userEmail">' + walletInfo.data.balance + '</td>';
                tableContent += '<td><a class="button-green" title="Withdraw Funds" onclick="ccnWithdrawForm('+walletInfo.data.balance+')" href="javascript:void(0);" id="withdrawFunds">Withdraw</a></td>';
                tableContent += '<td><a class="button-green" title="Show Addresses" onclick="listAddresses()" href="javascript:void(0);">Show List</a></td>';
                //tableContent += '<td><a class="btn" title="Generate New Address" onclick="getNewAddress()" href="javascript:void(0);">Generate New Address</a></td>';
                tableContent += '</tr>';
                
                // Inject the whole content string into our existing HTML table
                $('#walletInfo table tbody').html(tableContent);
                jQuery('#qrcode').qrcode({width: 125,height: 125,text: walletInfo.data.addresses[0]})
                jQuery('a.withdrawForm').colorbox({inline:true, top:'150px'});
                
               
            }
        
        });   
    };

    // Add User
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

    // Create CCN Withdraw Popup showing balance
    function ccnWithdrawForm(balance) {
       
        withdrawForm = '';
        withdrawForm += '<div style="width:400px; height:150px;" id="bittrexWithdrawForm">';
        withdrawForm += '<center>';
        withdrawForm += '<p style="color:#d1d1d1;"> Available Balance: '+balance+'</p>';
        withdrawForm += '<form action="/user/bittrex/withdraw", method="POST">';
        withdrawForm += '<input type="text", name="ccnWithdrawAddress" class="withdraw", placeholder="Address", id="email">';
        withdrawForm += '<input type="text", name="ccnWithdrawAmount" class="withdraw", placeholder="Amount", id="coin">';
        withdrawForm += '<a class="btn" title="test" onclick="ccnWithdraw()" href="javascript:void(0);"> Withdraw</a>';

       $('#withdrawFunds').colorbox({html:withdrawForm, top:'150px'});
    };

    // Generate API Key
    function listAddresses() {
       
        // jQuery AJAX call for JSON
        $.getJSON('/user/balance', function( data ) {

            if(data.success == false){
                
                alertify.error('Error: '+ data.message  )

            } else {
                    
                var addressesBody = '<table>';
                    addressesBody += '<h1>Address List:<h1>';

                var label = 1;
                var i = 0;

                $.each(data.data.addresses, function(){
                    addressesBody += '<tr><td><div id="qrcode2" style="border-style: solid; border-width: 4px; border-color: #fff;" width="75px" height="75px"></div></td><td><a href="http://cannacoin.cc:2750/address/'+data.data.addresses[i]+'" class="addressList" id="'+data.data.addresses[i]+'">'+data.data.addresses[i]+'</a><td></tr>';
                    label++;
                    i++;
                    jQuery('#qrcode2').qrcode({width: 125,height: 125, text: data.data.addresses[i]})
                    
                });
                
                addressesBody += '</table>';

                $('#addressList table').html(addressesBody);
                $.colorbox({html:addressesBody, top:'15px'});
            }

        });  
    };

// Transactions Functions ================================================
    
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
                    alertify.success("Withdraw success!");
                    
                    colorbox().close()

                }
                else {

                    // If something goes wrong, alert the error message that our service returned
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
                    tableContent += '<td class="userEmail"><a href="http://cannacoin.cc:2750/address/'+this.address+'">'+this.address+'</a></td>';

                    if(this.amount < 0) {
                        tableContent += '<td class="userEmail"><font color="#e44229">'+(this.amount).toFixed(8)+'</font></td>';
                    } else {
                        tableContent += '<td class="userEmail"><font color="#3ab54a">'+(this.amount).toFixed(8)+'</font></td>';
                    }

                    tableContent += '<td class="userEmail">'+this.fee+'</td>';
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
                overviewInfo += '<tr><td><span id="overViewTx" class="userEmail">Could not get Tx data.</td>';

                $('#overview table').html(overviewInfo);

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

                overviewInfo += '<tr><td class="overview"><strong>Transactions:</strong></td>';
                overviewInfo += '<td><span id="overViewTx" class="userEmail">' + txCount + '</td>';
                overviewInfo += '<tr><td class="overview"><strong>Sent:</strong></td>';
                overviewInfo += '<td><span id="overViewSent" class="userEmail">' + txSent + '</td>';
                overviewInfo += '<tr><td class="overview"><strong>Received:</strong></td>';
                overviewInfo += '<td><span id="overViewRec" class="userEmail">' + txRec + '</td>';
                overviewInfo += '<tr><td class="overview"><strong>Balance:</strong></td>';
                overviewInfo += '<td><span id="overViewBalance" class="userEmail">' + txBalance.toFixed(8) + '</td>';


                $('#overview table').html(overviewInfo);

            }
        
        });


    };

    // Create CCN Withdraw Popup showing balance for Bittrex
    function bittrexWithdrawForm(bittrexBalance, bittrexCurrency) {
       
        withdrawForm = '';
        withdrawForm += '<div style="width:400px; height:150px;" id="bittrexwithdrawForm">';
        withdrawForm += '<center>';
        withdrawForm += '<h3 style="color:#222222;"> Available Balance: '+bittrexBalance+' </h3>';
        withdrawForm += '<input type="text", name="'+bittrexCurrency+'bittrexWithdrawAddress" class="withdraw", placeholder="Address", id="email">';
        withdrawForm += '<input type="text", name="'+bittrexCurrency+'bittrexWithdrawAmount" class="withdraw", placeholder="Amount", id="coin">';
        withdrawForm += '<input type="hidden", name="'+bittrexCurrency+'bittrexWithdrawCurrency" class="withdraw" value="'+bittrexCurrency+'">';
        withdrawForm += '<a class="btn" title="test" onclick="bittrexWithdraw(\'' + bittrexBalance + '\',\'' + bittrexCurrency + '\')" href="javascript:void(0);">Withdraw '+bittrexCurrency+'</a>';

       $('#bittrexwithdrawForm'+bittrexCurrency+'').colorbox({html:withdrawForm, top:'150px'});
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


                }).done(function(response) {
                    response = JSON.parse(response)
                    console.log(response)
                    // Check for successful (blank) response
                    if (response.success == true) {
                        alertify.success('Withdraw success! UUID: '+response.result.uuid+'');
                        
                        $.colorbox.close();

                    }
                    else {
                        alertify.error(response.message)
                        // If something goes wrong, alert the error message that our service returned
                        
               
                    }
                });
        };


    // Create CCN Withdraw Popup showing balance for swisscex
    function swisscexWithdrawForm(swisscexBalance, swisscexCurrency) {
       
        withdrawForm = '';
        withdrawForm += '<div style="width:400px; height:150px;" id="swisscexwithdrawForm">';
        withdrawForm += '<center>';
        withdrawForm += '<h3 style="color:#222222;"> Available Balance: '+swisscexBalance+' </h3>';
        withdrawForm += '<input type="text", name="'+swisscexCurrency+'swisscexWithdrawAddress" class="withdraw", placeholder="Address", id="email">';
        withdrawForm += '<input type="text", name="'+swisscexCurrency+'swisscexWithdrawAmount" class="withdraw", placeholder="Amount", id="coin">';
        withdrawForm += '<input type="hidden", name="'+swisscexCurrency+'swisscexWithdrawCurrency" class="withdraw" value="'+swisscexCurrency+'">';
        withdrawForm += '<a class="btn" title="test" onclick="swisscexWithdraw(\'' + swisscexBalance + '\',\'' + swisscexCurrency + '\')" href="javascript:void(0);">Withdraw '+swisscexCurrency+'</a>';

       $('#swisscexwithdrawForm'+swisscexCurrency+'').colorbox({html:withdrawForm, top:'150px'});
    };

        // Create swisscex Withdraw
        function swisscexWithdraw(swisscexBalance, swisscexCurrency) {
            
            var withdraw = {
                withdrawaddress: $('input[name="'+swisscexCurrency+'swisscexWithdrawAddress"]').val(),
                amount: $('input[name="'+swisscexCurrency+'swisscexWithdrawAmount"]').val(),
                currency: $('input[name="'+swisscexCurrency+'swisscexWithdrawCurrency"]').val(),
            }
            console.log('trying to post to swiss: '+JSON.stringify(withdraw))

            $.ajax({

                    type: 'POST',
                    data: withdraw,
                    url: '/user/swisscex/withdraw',


                }).done(function(response) {
                    
                    // Check for successful (blank) response
                    if (response.success == true) {
                        
                        alertify.success("Withdraw success!");
                        $.colorbox().close()

                    }
                    else {
                        if(response.error){
                            alertify.error(response.error);
                        }
                        if(response.message){
                            alertify.error(response.message);
                        }
                    
                    }
                });
        };

// User Settings =========================================================
    
    function populateUserSettings() {
    
        
        // Empty content string
        var userSettings = '';
        var userSettingsApi = '';
        var userSettingsBittrexApi = '';
        var userSettingsSwisscexApi = '';
        var userSettings2fa = '';

            // jQuery AJAX call for JSON
            $.getJSON( '/user', function( data ) {
                
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

                // Inject the whole content string into our existing HTML table
                $('#userSettings form').html(userSettings);
                $('#userSettingsApi form').html(userSettingsApi);
                $('#userSettings2fa form').html(userSettings2fa);
                $('#bittrexSettings form').html(userSettingsBittrexApi);
                $('#swisscexSettings form').html(userSettingsSwisscexApi);
              
            });
    };   

// User Table ============================================================

    // Fill table with data
    function populateUserTable() {

        // Empty content string
        var tableContent = '';

        // jQuery AJAX call for JSON
        $.getJSON( '/users', function( data ) {
            userListData = data;
            // For each item in our JSON, add a table row and cells to the content string
            $.each(data, function(){
                tableContent += '<tr>';
                tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '" title="Show Details">' + this.username + '</td>';
                tableContent += '<td class="userEmail">' + this.email + '</td>';
                tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
                tableContent += '</tr>';
            });

            // Inject the whole content string into our existing HTML table
            $('#userList table tbody').html(tableContent);
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

// Invoice Functions =====================================================

    // Fill table with data
    function populateInvoiceTable() {

        // Empty content string
        var tableContent = '';

        // jQuery AJAX call for JSON
        $.getJSON( '/invoices', function( data ) {
            invoiceData = data;
            // For each item in our JSON, add a table row and cells to the content string
            $.each(data, function(){
                tableContent += '<tr>';
                tableContent += '<td><a href="#" class="linkshowinvoice" rel="' + this._id + '" title="Show Details">' + this._id + '</td>';
                tableContent += '<td class="userEmail">' + this.customer + '</td>';
                tableContent += '<td class="userEmail">' + this.priority + '</td>';
                tableContent += '<td><a onclick="window.print();" style="cursor:pointer;cursor:hand;" title="Show Details">Print</td>';
                tableContent += '</tr>';
            });

            // Inject the whole content string into our existing HTML table
            $('#invoiceList table tbody').html(tableContent);
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

// User Profile Functions ================================================

    // Update user Password
    function updatePassword() {
            

        // Super basic validation - increase errorCount variable if any fields are blank
        var errorCount = 0;

        $('#userSettings input').each(function(index, val) {

            if($(this).val() === '') { errorCount++; }

        });

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
        
        
        // jQuery AJAX call for JSON
        $.getJSON( '/user/newapikey', function( data ) {
           
            if(data.success == true){
                alertify.success('New API Key generated successfully!');
                populateUserSettings();
            } else {
                alertify.error('Error: '+ data.message  )
            }
           
        });  
    };

    // Generate API Key
    function enable2fa() {
        
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
    };

    // Generate API Key
    function disable2fa() {
        
        // jQuery AJAX call for JSON
        $.getJSON( '/user/disable2fa', function( data ) {
           
            if(data.success == true){
                alertify.error('2FA Disabled!');
                populateUserSettings();
            } else {
                alertify.error('Error: '+ data.message  )
            }
           
        });  
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
        }
         else {
            // If errorCount is more than 0, error out
            alertify.error('Please fill in all fields');
            return false;
        }  
    };

    

// Trade Functions ================================================
// Delete User
    function enableStopLoss() {
                
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