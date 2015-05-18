function marketDepthChart (market, buyDepth, sellDepth){
    $('#chart').highcharts({

        chart: {
            type:"area",
            zoomType:"x"
        },
        title: {
            text: 'Depth Chart ('+market+')'
        },
        subtitle: {
            text: 'Bittrex Order Book'
        },
        xAxis: {
            allowDecimals: true,
            title: {
                text: 'Rate'
            },
            type: 'logarithmic',
            labels: {
                formatter: function () {
                    
                    return this.value.toFixed(8); 
                    
                }
            }
        },
        yAxis: {
            allowDecimals: true,
            title: {
                text: 'Quantity'
            },
            labels: {

                formatter: function () {

                    return this.value;

                }
            }
        },
        tooltip: {
            pointFormat: '<b>Quantity:</b> {point.y} <br><b>Rate:</b> {point.x} <br>'
        },
        
        series: [{
            name: 'Bid',
            data: buyDepth.reverse()
        },
        {
            name: 'Ask',
            data: sellDepth
        }]
    });
};

function marketHistoryChart (marketHistoryChartBuy, marketHistoryChartSell){
    $('#marketHistoryChart').highcharts({
        chart: {
            zoomType: 'x',
            type: 'line'
        },
        title: {
            text: 'Market History ('+market+')'
        },
        subtitle: {
            text: 'Last 50 Trades @ Bittrex'
        },
        xAxis: {
            allowDecimals: true,
            title: {
                text: 'Rate'
            }
            
        },
        yAxis: {
            title: {
                text: 'Quantity'
            }
        },
        tooltip: {
            pointFormat: '<b>Quantity:</b> {point.y:,.8f} <br><b>Rate:</b> {point.x:,.8f}'
        },
        
        series: [{
            name: 'Sell',
            data: marketHistoryChartSell
        }, {
            name: 'Buy',
            data: marketHistoryChartBuy
        }]
    });
}; 