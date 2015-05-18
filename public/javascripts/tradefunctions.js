
// Buy Limit Calculator
$("input[name='buyLimitRate'], input[name='buyLimitQuantity']").keyup(function () {
	
	var rate = Number($("input[name='buyLimitRate']").val()).toFixed(8);
	var quantity = Number($("input[name='buyLimitQuantity']").val()).toFixed(8);


	var total = Number((rate*quantity)).toFixed(8)
	var fee = Number((total*.01)).toFixed(8)
	var netTotal = (Number(total) + Number(fee)).toFixed(8);

	if(isNaN(total) || isNaN(fee) || isNaN(netTotal)){
		total = 0
		fee = 0
		netTotal = 0;
	}

	if(rate != '' && quantity != '' && !isNaN(rate) && !isNaN(quantity)){
		var buyCounter = '<table style="background:rgba(101,179,84,.05); width: 100%; align="center"><tr><td >Total (BTC): </td><td >' + total + '</td></tr><tr><td >Trade Fees (BTC): </td><td >' + fee + '</td></tr><td >Net Total (BTC): </td><td >' + netTotal + '</td></tr></table>';
		$("#buyLimitExchangeCalc").fadeIn().html(buyCounter);	
	} else {
		$("#buyLimitExchangeCalc").fadeOut();
	}
});

// Sell Limit Calculator
$("input[name='sellLimitRate'], input[name='sellLimitQuantity']").keyup(function () {
	
	var rate = $("input[name='sellLimitRate']").val();
	var quantity = $("input[name='sellLimitQuantity']").val();
	var total = Number((rate*quantity)).toFixed(8)
	var fee = Number((total*.01)).toFixed(8)
	var netTotal = (Number(total) + Number(fee)).toFixed(8);

	if(isNaN(total) || isNaN(fee) || isNaN(netTotal)){
		total = 0
		fee = 0
		netTotal = 0;
	}

	if(rate != '' && quantity != '' && !isNaN(rate) && !isNaN(quantity)){
		var sellCounter = '<table style="background:rgba(228,66,41,.05); width: 100%;" align="center"><tr><td >Total (BTC): </td><td >' + total + '</td></tr><tr><td >Trade Fees (BTC): </td><td >' + fee + '</td></tr><td >Net Total (BTC): </td><td >' + netTotal + '</td></tr></table>';
		$("#sellLimitExchangeCalc").fadeIn().html(sellCounter);	
	} else {
		$("#sellLimitExchangeCalc").fadeOut();
	}
});

// Buy Ladder Calculation
$("input[name='bittrexBuyLadderStart'], input[name='bittrexBuyLadderStop'], input[name='bittrexBuyLadderSpread'], input[name='bittrexBuyLadderQuantity']").keyup(function() {
	
	var start = $("input[name='bittrexBuyLadderStart']").val();
	var stop = $("input[name='bittrexBuyLadderStop']").val();
	var spread = $("input[name='bittrexBuyLadderSpread']").val()*0.00000001;
	var quantity = $("input[name='bittrexBuyLadderQuantity']").val();

	var spreadDistance = (stop-start).toFixed(8)
	var numTrade = Math.floor((stop-start)/spread);
	var perTrade = (quantity/numTrade).toFixed(8);
	var satoshiTotal = (perTrade*start).toFixed(8);
	var dustLimitResult;


	if(!isFinite(perTrade) || isNaN(numTrade) || isNaN(spreadDistance) || isNaN(perTrade)){
		perTrade = 0
		numTrade = 0
		spreadDistance = 0
	}

	if(satoshiTotal >= 0.00050000){
		dustLimitResult = '<font color="#65b354">Pass</font>';
	} else {
		dustLimitResult = '<font color="#e44229">Failed</font>'
	}

	var response = '<table style="background:rgba(101,179,84,.05); width: 100%"><tr><td> Spread Distance: </td><td>' + spreadDistance + 
				   '</td></tr><tr><td> Number of trades: </td><td>' + numTrade + 
				   '</td></tr><tr><td>Amount per trade: </td><td>' + perTrade + 
				   '</td></tr><tr><td>50k Dust Limit: </td><td>' + dustLimitResult + '</td></tr></table>';
	
	if( start != '' &&
		stop != '' &&
		spread != '' &&
		quantity != ''){

		if(numTrade <= 75){
			for(var i = 0; i <= 22; i++){

				var orderTotal = Number(start)+(Number(spread)*[i]);
				var orderFee = orderTotal*.01;

				var orderNetTotal = (orderTotal+orderFee).toFixed(8)
				if(i=22){
					console.log(orderTotal)
				}
			}
			console.log(typeof orderTotal, typeof orderFee, typeof orderNetTotal)
			
			console.log('totalCoins: ' + orderTotal.toFixed(8))
			console.log('orderTotal: ' + orderTotal.toFixed(8))
			console.log('orderTotal: ' + orderTotal.toFixed(8))
			console.log('orderTotal: ' + orderTotal.toFixed(8))
			console.log('orderTotal: ' + orderTotal.toFixed(8))
			console.log('orderFee: ' + orderFee.toFixed(8))
			console.log('orderNetTotal: ' + orderNetTotal)
		}

		

		$("#buyLadderCalc").fadeIn().html(response);
		
	} else {
		$("#buyLadderCalc").fadeOut();
	}
});

// Buy Ladder Calculation
$("input[name='bittrexSellLadderStart'], input[name='bittrexSellLadderStop'], input[name='bittrexSellLadderSpread'], input[name='bittrexSellLadderQuantity']").keyup(function() {
	
	var start = $("input[name='bittrexSellLadderStart']").val();
	var stop = $("input[name='bittrexSellLadderStop']").val();
	var spread = $("input[name='bittrexSellLadderSpread']").val()*0.00000001;
	var quantity = $("input[name='bittrexSellLadderQuantity']").val();

	var spreadDistance = (stop-start).toFixed(8)
	var numTrade = Math.floor((stop-start)/spread);
	var perTrade = (quantity/numTrade).toFixed(8);
	var satoshiTotal = (perTrade*start).toFixed(8);
	var dustLimitResult;

	if(!isFinite(perTrade) || isNaN(numTrade) || isNaN(spreadDistance) || isNaN(perTrade)){
		perTrade = 0
		numTrade = 0
		spreadDistance = 0

	}

	if(satoshiTotal >= 0.00050000){
		dustLimitResult = '<font color="#65b354">Pass</font>';
	} else {
		dustLimitResult = '<font color="#e44229">Failed</font>'
	}

	var response = '<table style="background:rgba(228,66,41,.05); width: 100%"><tr><td align="left"> Spread Distance: </td><td>' + spreadDistance + 
				   '</td></tr><tr><td align="left"> Number of trades: </td><td>' + numTrade + 
				   '</td></tr><tr><td align="left">Amount per trade: </td><td>' + perTrade + 
				   '</td></tr><tr><td align="left">50k Dust Limit: </td><td>' + dustLimitResult + '</td></tr></table>';
	
	if( start != '' &&
		stop != '' &&
		spread != '' &&
		quantity != ''){

		$("#sellLadderCalc").fadeIn().html(response);
		
	} else {
		$("#sellLadderCalc").fadeOut();
	}
});



////////////////////////////////////////////////////////////////////////
// Cancel order button
$('#tradeOrderInfo table tbody').on('click', 'span', function(){
    var id = $(this).data('OrderUuid');

    // Fade out cancel button.
    $(this).fadeOut(function(){

    	//Display cancelling (loading dialog)
    	$('<div>').insertBefore($(this).closest('span')).html('Cancelling...');
        
        //Execute cancel order function
        cancelOrder(id);

    });
});

// Cancel order button
$('#orderInfo table tbody').on('click', 'span', function(){
    var id = $(this).data('OrderUuid');

    // Fade out cancel button.
    $(this).fadeOut(function(){

    	//Display cancelling (loading dialog)
    	$('<div>').insertBefore($(this).closest('span')).html('Cancelling...');
        
        //Execute cancel order function
        cancelOrder(id);

    });
});

// Cancel padding order button
$('#tradeLadderInfo table tbody').on('click', 'span', function(){
	
	// Label jQuery value variable name for ease of use.
    var id = $(this).data('_id');
    
    // Fade out cancel button
    $(this).fadeOut(function(){

    	//Display cancelling (loading dialog)
    	$('<div>').insertBefore($(this).closest('span')).html('Cancelling...');

    	//Execute complete ladder cancel using ladderCancel function.
        cancelLadder(id);

    });
});

// Cancel padding order button
$('#ladderInfo table tbody').on('click', 'span', function(){
	
	// Label jQuery value variable name for ease of use.
    var id = $(this).data('_id');
    
    // Fade out cancel button
    $(this).fadeOut(function(){

    	//Display cancelling (loading dialog)
    	$('<div>').insertBefore($(this).closest('span')).html('Cancelling...');

    	//Execute complete ladder cancel using ladderCancel function.
        cancelLadder(id);

    });
});

// On order book rate click, populate buy rate field.
$('#bittrexBuyOrderBook table tbody').on('click', 'rate', function(){
    var rate = $(this).data('rate');
    console.log('clicked on rate, need to update form')
});

// On order book rate click, populate sell rate field.
$('#bittrexOrderBookSell table tbody').on('click', 'rate', function(){
    var rate = $(this).data('rate');
    console.log('clicked on rate, need to update form')
});

$('#tradeBittrexBalance').on('click', 'span', function(){

	// Re-label jquery values to variable names for ease of use
    var available = $(this).data('Available');
    var currency = $(this).data('Currency')

    // Launch bittrex withdraw form
    bittrexWithdrawForm(available,currency);
});	