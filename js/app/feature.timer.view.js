(function(window) {
	
	var page = window.page,
			log = new NI.Logging({
				moduleName:'Feature(Timer.View)',
				enabled:true
			});
	
	
	// fix for IE Date.now as per:
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
	if (!Date.now) {
		Date.now = function now() {
			return +new Date();
		};
	}
	
	page.features.push(function(app){
		
		var timer, favicon, dom, timeout, elements;
		
		favicon = new NI.Favicon({});
		
		dom = $('.pane.timer-pane');
		
		elements = {
			body:tc.jQ('body'),
			running:dom.find('.running-pane'),
			finished:{
				container:dom.find('.finished-pane'),
				qualified:dom.find('.finished-pane .qualified'),
				time:dom.find('.finished-pane .time'),
				date:dom.find('.finished-pane .date')
			},
			qualifier:dom.find('.description span.qualifier'),
			qualified:dom.find('.description span.qualified'),
			timer:dom.find('.timer'),
			milliseconds:dom.find('.timer .milliseconds'),
			seconds:dom.find('.timer .seconds'),
			minutes:dom.find('.timer .minutes'),
			hours:dom.find('.timer .hours'),
			days:dom.find('.timer .days')
		};
		
		function cycle(){
			if(render.display()){
				timeout = setTimeout(cycle,25);
			}
		};
		
		var render = {
			loading:function(){
				
			},
			start:function(running){
				if(running){
					elements.finished.container.hide();
					elements.qualifier.text('It\'s almost');
					elements.timer.show();
					elements.running.show();
				} else {
					elements.running.hide();
					elements.finished.container.show();
				}
				vertCenter(tc.jQ('.timer-pane'));
				favicon.setFavicon("./img/favicon/favicon-still.png");
			},
			display:function(){
				var diff, time_exploded;
				if(!timer){ return false; }
				
				diff = timer.expires - Date.now();
				
				if(diff <= 0){
					render.expired();
					return false;
				}
				
				elements.timer.attr('title','on ' + timer.expires);
				
				time_exploded = {
					milliseconds:Math.floor((diff)%1000),
					seconds:Math.floor((diff/1000)%60),
					minutes:Math.floor((diff/1000/60)%60),
					hours:Math.floor((diff/1000/60/60)%24),
					days:Math.floor(diff/1000/60/60/24)
				};
				
				if(timer.name != elements.qualified.text()){
					elements.qualified.text(timer.name);
				}
				
				elements.milliseconds.text(time_exploded.milliseconds);
				elements.seconds.text(time_exploded.seconds);
				
				if(!time_exploded.days){
					elements.days.parent().hide();
				} else {
					elements.days.text(time_exploded.days).parent().show();
				}
				
				if(!time_exploded.hours && !elements.days.filter(':visible').length){
					elements.hours.parent().hide();
				} else {
					elements.hours.text(time_exploded.hours).parent().show();
				}
				
				if(!time_exploded.minutes && !elements.hours.filter(':visible').length){
					elements.minutes.parent().hide();
				} else {
					elements.minutes.text(time_exploded.minutes).parent().show();
				}
				
				return true;
			},
			expired:function(starting_off_expired){
				var timestr, is_pm;
				app.events.trigger('timer.view.timerExpired');
				if(starting_off_expired){
					elements.running.hide();
					elements.finished.qualified.text(timer.name);
					timestr = '';
					if(timer.expires.getHours() > 12){
						timestr = (timer.expires.getHours() - 12) + ':';
						is_pm = true;
					} else {
						timestr = (timer.expires.getHours()) + ':';
					}
					
					if(timer.expires.getMinutes() < 10){
						timestr = timestr + '0' + timer.expires.getMinutes();
					} else {
						timestr = timestr + timer.expires.getMinutes();
					}
					
					timestr = timestr + ' ' + (is_pm ? 'PM' : 'AM');
					
					elements.finished.time.text(timestr);
					elements.finished.date.text(timer.expires.toLocaleDateString());
					elements.finished.container.show();
					vertCenter(tc.jQ('.timer-pane'));
				} else {
					favicon.setFavicon("./img/favicon/favicon-ani.gif");
					elements.qualifier.text('It\'s');
					document.title = 'It\'s ' + timer.name;
					elements.timer.hide();
				}
				
				/*(function () {
						jQuery.favicon.animate('./img/favicon/favicon-ani-sprite-white.png', {
							interval: 100,
							onStop: function () {
								jQuery.favicon('./img/favicon/favicon-still.png');
							}
						});
				}).apply(window);*/
			}
		}
		
		// Vertical centering
		var theWindow = tc.jQ(window);
		var footerHeight = tc.jQ('.footer').height();
		
		function vertCenter(ele) {
			var winHeight = theWindow.height() - footerHeight;
			var eleHeight = ele.height();
			ele.css('top', Math.ceil((winHeight - eleHeight) * 0.4));
		}
		
		function elementsToCenter() {
			vertCenter(tc.jQ('.start-pane'));
			vertCenter(tc.jQ('.timer-pane'));
			vertCenter(tc.jQ('.modal-container'));
		};
		
		tc.jQ(window).resize(function() {
			elementsToCenter();
		});
		elementsToCenter();
		
		// iOS 'add to homescreen' tooltips
		var isIpad = elements.body.hasClass('browser-ipad') ;
		var isIphone = elements.body.hasClass('browser-iphone');
		
		if ((isIpad || isIphone) && !(elements.body.hasClass('ios-webapp'))) {
			elements.body.find('.footer').after('<div class="ios-tooltip" style="display:none"></div>');
			var theTooltip = elements.body.find('.ios-tooltip')
			
			if (isIpad) {
				theTooltip.css({'top':'-=175','display':'block'}).delay(2500).animate({
					top: '+=190'
				}, 750, 'easeOutExpo', function() {
					theTooltip.animate({
						top:'-=15'
					}, 100, 'easeOutExpo');
					tooltipTimeout = setTimeout(removeTooltip, 12000);
				});
			} else {
				theTooltip.delay(2500).fadeIn(750, function() {
					timeout = setTimeout(removeTooltip,12000);
				});
			}
			
			theTooltip.click(function(){
				removeTooltip()
			});
			function removeTooltip() {
				theTooltip.fadeOut(500)
			}
		}
		
		
		
		
		app.events.bind('timer.manager.timerLoaded',function(e,d){
			timer = d;
			if(timeout){ clearTimeout(timeout); }
			if(dom.filter(':visible').length){
				document.title = 'It\'s Almost ' + timer.name;
			}
			if(timer.expired){
				render.expired(true);
			} else {
				render.start(true);
				cycle();
			}
			
		});
		
		app.events.bind('timer.manager.noTimerLoaded',function(e,d){
			if(timeout){
				clearTimeout(timeout);
			}
		});
		
		app.events.bind('hashchange.hashChanged',function(e,d){
			if(!d.hash.length){
				vertCenter(tc.jQ('.timer-pane'));
				dom.stop().animate({
					opacity:0.0
				},500,function(){
					render.start();
					$(this).hide();
				});
			} else {
				render.start(true);
				dom.stop(true,true).show().animate({
					opacity:1.0
				},500,function(){
					dom.css('opacity','none');
				});
			}
		});
		
	});
	
})(this);