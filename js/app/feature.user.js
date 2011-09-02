(function(window) {
	
	var page = window.page,
			log = new NI.Logging({
				moduleName:'Feature(User)',
				enabled:true
			});

	page.features.push(function(app){
		
		var timer_cookies, timers;
		
		timer_cookies = new NI.Cookies({
			namespace:'itsalmostusertimers'
		});
		
		app.events.bind('timer.manager.timerCreated',function(e,d){
			timer_cookies.setCookie(d.id, d.name, d.expires);
		});
		
		app.events.bind('footer.myTimersLinkClicked',function(e,d){
			var timers;
			timers = timer_cookies.getAllCookies();
			if(!timers.length){
				return;
			}
			app.events.trigger('user.localTimersFetched',{
				timers:timers
			});
		});
		
		app.events.bind('app.featuresInitialized',function(e,d){
			var timers;
			timers = timer_cookies.getAllCookies();
			if(!timers.length){
				return;
			}
			app.events.trigger('user.localTimersLoaded',{
				timers:timers
			});
		});
		
	});
	
})(this);