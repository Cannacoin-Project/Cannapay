// Invoice Functions =============================================================

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


