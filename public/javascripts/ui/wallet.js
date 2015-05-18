$('#walletInfo table tbody').on('click', 'span', function(){

	// Generate new user if user clicked "generate address"
    if($(this).data('generateNewAddress') == true){
        getNewAddress();
    } 

    // Trigger colorbox for CCN withdraw 
    if($(this).data('withdrawFunds') == true){
    	var balance = $(this).data('balance');
        ccnWithdrawForm(balance);
    }

    //Trigger colorbox for CCN address list
    if($(this).data('listAddresses') == true){
        listAddresses();
    }

});