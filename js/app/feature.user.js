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
		});
		
		app.events.bind('hashchange.hashChanged',function(e,d){
			if(!d.hash.length){
				app.events.trigger('user.localTimersFetched',{
					timers:timer_cookies.getAllCookies()
				});
			} else if(d.hash.length && d.hash == 'local_timers'){
				e.stopImmediatePropagation();
				app.events.trigger('user.localTimersFetched',{
					timers:timer_cookies.getAllCookies()
				});
			}
		});
		
	});
	
})(this);