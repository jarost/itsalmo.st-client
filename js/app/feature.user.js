(function(window) {
	
	var page = window.page,
			log = new NI.Logging({
				moduleName:'Feature(User)',
				enabled:true
			});

	page.features.push(function(app){
		
		var timer_cookies, timers;
		
		timer_cookies = new NI.Cookies({
			namespace:'itsalmost-user-timers'
		});
		
		app.events.bind('timer.manager.timerCreated',function(e,d){
			timer_cookies.setCookie(d.id, d.name, d.expires);
			app.events.trigger('user.localTimersFetched',{
				timers:timer_cookies.getAllCookies()
			});
		});
		
		app.events.bind('app.featuresInitialized',function(e,d){
			app.events.trigger('user.localTimersFetched',{
				timers:timer_cookies.getAllCookies()
			});
		});
		
	});
	
})(this);