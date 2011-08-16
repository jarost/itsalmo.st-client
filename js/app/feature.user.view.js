(function(window) {
	
	var page = window.page,
			log = new NI.Logging({
				moduleName:'Feature(User.View)',
				enabled:true
			});

	page.features.push(function(app){
		var overlay;
		
		overlay = new NI.Overlay({
			maskClick:true
		});
		
		app.events.bind('user.localTimersFetched',function(e,d){
			var timers_list, overlay_options;
			timers_list = (function(timers){
				var out, i;
				out = '';
				for(i in timers){
					out = out + "<li><a href='#"+timers[i].key+"'>"+timers[i].value+"&nbsp;<span>(#"+timers[i].key+")</span></a></li>"
				}
				return out;
			})(d.timers);
			overlay_options = {
				bd:$(
					"<div class='modal your-countdowns'>\
						<h2>Your countdowns</h2>\
						<ul>" + timers_list + "</ul>\
						<a id='running-close-btn' class='btn custom-btn-close' href='#'>\
							<span>close this</span>\
						</a>\
					</div><!-- end .modal -->\
				")
			};
			overlay_options.bd.find('.custom-btn-close').bind('click',function(e,d){
				overlay.close();
			});
			overlay.open(overlay_options);
			window.location.hash = '#';
		});
		
		app.events.bind('hashchange.hashChanged',function(e,d){
			if(d.hash.length && d.hash != 'local_timers'){
				overlay.close();
				return;
			}
		});
		
	});
	
})(this);