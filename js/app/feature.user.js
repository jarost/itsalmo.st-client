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
			var timers;
			timers = timer_cookies.getAllCookies();
			if(!timers.length){
				window.location.hash = '#';
				return;
			}
			if(d.hash.length && d.hash == 'local_timers'){
				e.stopImmediatePropagation();
				app.events.trigger('user.localTimersFetched',{
					timers:timers
				});
			}
		});
		
		
		app.events.bind('app.featuresInitialized',function(e,d){
			var timers;
			timers = timer_cookies.getAllCookies();
			if(!timers.length){
				window.location.hash = '#';
				return;
			}
			app.events.trigger('user.localTimersLoaded',{
				timers:timers
			});
		});
		
	});
	
})(this);