(function(window) {
	
	var page = window.page,
			log = new NI.Logging({
				moduleName:'Feature(Timer.Manager)',
				enabled:true
			});

	page.features.push(function(app){
		
		$.ajaxSetup({
			cache: false,
			dataType: 'json'
		});
		
		function get_timer(id){
			if(!id.length){
				return;
			}
			$.ajax({
				url:'/'+app.page.env.server_name+'/timer/'+id.toLowerCase(),
				type:'GET',
				success:function(data, textStatus, jqXHR){
					if(!data.length){
						app.events.trigger('timer.manager.noTimerLoaded',{});
						return;
					}
					data[0].expires = new Date(data[0].expires);
					app.events.trigger('timer.manager.timerLoaded',data[0]);
				},
				error:function(jqXHR, textStatus, errorThrown){
					app.events.trigger('timer.manager.noTimerLoaded',{});
				}
			});
		};
		
		function post_timer(id,timer){
			if(!id || !id.length){
				return;
			}
			timer.expires = timer.expires.getTime();
			$.ajax({
				url:'/'+app.page.env.server_name+'/timer/'+id.toLowerCase(),
				type:'POST',
				data:timer,
				success:function(data, textStatus, jqXHR){
					if(!data.length){
						app.events.trigger('timer.manager.noTimerCreated',{});
						return;
					}
					data[0].expires = new Date(data[0].expires);
					app.events.trigger('timer.manager.timerCreated',data[0]);
				},
				error:function(jqXHR, textStatus, errorThrown){
					app.events.trigger('timer.manager.noTimerCreated',{});
				}
			});
		};
		
		
		
		app.events.bind('form.newTimerIdGenerated',function(e,d){
			get_timer(d.newTimerId);
		});
		
		app.events.bind('form.timerGenerated',function(e,d){
			post_timer(d.newTimerId,d.timer);
		});
		
		app.events.bind('hashchange.hashChanged',function(e,d){
			get_timer(d.hash.split(':')[0]);
		});
		
	});
	
})(this);