$( "#fullscreen" ).click(function toggleUsers(){
	if (screenfull.enabled) {
		screenfull.toggle();
	}
});

document.addEventListener(screenfull.raw.fullscreenchange, function () {
    if (screenfull.isFullscreen){
    	$('#fullscreen').attr('class', 'fa fa-compress fa-2x');
    }else{
    	$('#fullscreen').attr('class', 'fa fa-expand fa-2x');
    }
});