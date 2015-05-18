$(document).ready(function(){

    $("#copy").zclip({
        path:'http://www.steamdev.com/zclip/js/ZeroClipboard.swf',
        copy:$('#description').text(),
        afterCopy:function(){
            alertify.success('Copied!');
        }
    });

});