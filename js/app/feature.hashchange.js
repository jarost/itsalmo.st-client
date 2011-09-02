(function(window) {
	
	var page = window.page,
			log = new NI.Logging({
				moduleName:'Feature(Hashchange)',
				enabled:true
			});

	page.features.push(function(app){
		var $w;
		
		$w = $(window);
		$w.hashchange(function(){
			if(window.location.hash.split(':')[1] == 'embed'){
				$('body').addClass('widget');
			} else {
				$('body').removeClass('widget');
			}
			
			if(window.location.hash.indexOf('?') > -1){
				//strip out the get vars added by facebook redirect
				window.location.hash = window.location.hash.split('?')[0];
			} else {
				app.events.one('timer.manager.noTimerLoaded',function(e,d){
					window.location.hash = '#';
				});
				app.events.trigger('hashchange.hashChanged',{
					hash:window.location.hash.substring(1,window.location.hash.length).toLowerCase()
				});
			}
		});
		
		app.events.bind('timer.manager.timerCreated',function(e,d){
			window.location.hash = '#'+d.id;
		});
		
		app.events.bind('app.featuresInitialized',function(e,d){
			$w.trigger('hashchange');
		});
		
	});
	
})(this);