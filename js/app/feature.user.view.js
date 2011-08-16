(function(window) {
	
	var page = window.page,
			log = new NI.Logging({
				moduleName:'Feature(User.View)',
				enabled:true
			});

	page.features.push(function(app){
		
		app.events.bind('user.localTimersFetched',function(e,d){
			console.log(d.timers);
		});
		
	});
	
})(this);