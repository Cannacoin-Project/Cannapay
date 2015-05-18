$(document).ready(function(){

	$('#exchangeSwisscex table tbody').on('click', 'span', function(){
	                
		// Re-label jquery values to variable names for ease of use
		var currency = $(this).data('currency');
		var balance = $(this).data('balance')

		// Launch swisscex withdraw form
		swisscexWithdrawForm(balance,currency);

	});

	$('#exchangeBittrex table tbody').on('click', 'span', function(){

		// Re-label jquery values to variable names for ease of use
	    var available = $(this).data('Available');
	    var currency = $(this).data('Currency')

	    // Launch bittrex withdraw form
	    bittrexWithdrawForm(available,currency);

	});

	//===================

	// Change view of orderbook based on selection in dropdown.
	$('#viewMarket').change(function() {
		
		// Re-label jquery values to variable names for ease of use
		market = $( "#viewMarket option:selected" ).text();
	  	
	  	// Update orderbook froms with new market
	  	$("input[name='sellLimitMarket']").val(market);
	  	$("input[name='buyLimitMarket']").val(market);
	  	$("input[name='buyMarket']").val(market);
	  	$("input[name='sellMarket']").val(market);
	  	$("input[name='bittrexBuyLadderMarket']").val(market);
	  	$("input[name='bittrexSellLadderMarket']").val(market);
	  	
	  	// Redraw market page for selected market
	  	displayOrderBook(market);
	  	displayOpenOrders(market);
        displayOpenLadders(market);
        populateExchangeTable(market);
	});


	// Hide bittrex wallet balance on Trade page
	$('#hideBittrexBalance').on('click', function(){
		$('#tradeBittrexBalance').toggle(function(){
		});	
	})
	
	// Hide bittrex orders on Trade page
	$('#hideBittrexOrderInfo').on('click', function(){
		$('#tradeOrderInfo').toggle(function(){
		});	
	})
	
	// Hide bittrex padding orders on Trade page
	$('#hideBittrexLadderInfo').on('click', function(){
		$('#tradeLadderInfo').toggle(function(){
		});	
	})

	$('#bittrexWithdrawFormAvailableBalance').on('click', function(){
		console.log('clickedme')
	})
	$('#swisscexWithdrawFormAvailableBalance').on('click', function(){
		$('#swisscexWithdrawFormAmount').html($('#swisscexWithdrawFormAvailableBalance').val())
	})
	
});

