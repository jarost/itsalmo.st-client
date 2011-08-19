(function(window) {
	
	var page = window.page,
			log = new NI.Logging({
				moduleName:'Feature(BrowserDetection)',
				enabled:true
			});
			
	page.features.push(function(app){
		
		app.google_analytics = new NI.GoogleAnalytics({
			account:app.page.env.ga_account
		});
		
		app.events.bind('hashchange.hashChanged',function(e,d){
			_gaq.push(['_trackPageview', location.pathname + location.hash]);
			
			//chartbeat stuff
			if(typeof pSUPERFLY != 'undefined' && pSUPERFLY){
				pSUPERFLY.virtualPage((location.pathname + location.hash), "#" + location.hash);
			}
			
		});
		
	});
	
})(this);