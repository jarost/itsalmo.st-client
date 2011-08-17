(function(window) {
	
	var page = window.page,
			log = new NI.Logging({
				moduleName:'Feature(Footer)',
				enabled:true
			});
			
	page.features.push(function(app){
		
		var dom, elements;
		
		dom = $('.footer');
		
		elements = {
			body:$('body'),
			social:dom.find('.social'),
			timer_links:dom.find('.timer-link'),
			my_timers:dom.find('.my-timers-link'),
			share_button:dom.find('.share-btn'),
			modal:{
				overlay:$('.share-pane .modal-overlay'),
				container:$('.share-pane .modal-container'),
				url_link:$('.share-pane .modal-container').find('.url a'),
				url_text:$('.share-pane .modal-container').find('.url a .text'),
				twitter_link:$('.share-pane .modal-container').find('.twitter a'),
				facebook_link:$('.share-pane .modal-container').find('.fb a')
			}
		};
		
		elements.my_timers.bind('click',function(e,d){
			e.preventDefault();
			app.events.trigger('footer.myTimersLinkClicked');
		});
		
		app.events.bind('hashchange.hashChanged',function(e,d){
			if(!d.hash.length){
				elements.timer_links.stop().animate({
					'opacity':0.0
				},500,function(){
					$(this).css('visibility','hidden');
				});
			} else {
				elements.timer_links.stop().css('visibility','visible').animate({
					'opacity':1.0
				},500,function(){
					$(this).css('opacity','none');
				});
			}
		});
		
		app.events.bind('user.localTimersFetched user.localTimersLoaded form.timerGenerated',function(e,d){
			elements.my_timers.stop().css('visibility','visible').animate({
				'opacity':1.0
			},500,function(){
				$(this).css('opacity','none');
			});
		});
		
		app.events.bind('timer.manager.timerLoaded',function(e,d){
			var url, twitter_url, facebook_url;
			
			elements.share_button.removeClass('disabled');
			elements.share_button.animate({
				opacity:1.0
			},400,function(){
				$(this).css('opacity','none');
			});
			
			url = 'http://itsalmo.st/#' + window.escape(d.id);
			twitter_url = 'http://twitter.com/share?url=' + window.escape(url) + '&text=' + window.escape('It\'s Almost ' + d.name);
			//facebook_url = 'http://www.facebook.com/sharer.php?u=' + window.escape(url) + '&t=' + window.escape('It\'s Almost ' + d.name);
			facebook_url =   'http://facebook.com/dialog/feed?' +
			 	'app_id=' + '198989746829532' + '&' +
				'link=' + window.escape(url+'?') + '&' +
				'redirect_uri=' + window.escape(url+'?') + '&' +
				'message=' + 'It\'s Almost ' + d.name + '&' +
				'name=' + 'It\'s Almost ' + d.name + '&' +
				'image=' + window.escape('http://itsalmo.st/img/favicon/bigfavicon.png') + '&' +
				'description=' + 'A snazzy free countdown tool by Type/Code';
			
			elements.modal.url_link.attr('href',url);
			elements.modal.url_text.text(url);
			elements.modal.twitter_link.attr('href',twitter_url);
			elements.modal.facebook_link.attr('href',facebook_url);
		});
		
		app.events.bind('timer.view.timerExpired',function(){
			elements.share_button.animate({
				opacity:0.25
			},400,function(){
				elements.share_button.addClass('disabled');
			});
		});
		
		elements.modal.twitter_link.bind('click',function(e,d){
			e.preventDefault();
			var opts		= 'status=1' +
									',width='  + 575  +
									',height=' + 400;
			window.open(elements.modal.twitter_link.attr('href'), 'Twitter', opts);
		});
		
		/* handle modal hiding and showing */
		elements.share_button.bind('click',function() {
			if (elements.body.hasClass('browser-ipad')) {
				elements.modal.overlay.show();
				elements.modal.container.show();
			} else {
				elements.modal.overlay.fadeIn(300);
				elements.modal.container.css('opacity',0.0).show().delay(200).animate({
					opacity:1.0
				},600,function(){
					elements.modal.container.css('opacity','none');
				});
			};
			
			//centers the modal when it is shown;
			(function(ele){
				var winHeight = tc.jQ(window).height() - tc.jQ('.footer').height();
				var eleHeight = ele.height();
				ele.css('top', Math.ceil((winHeight - eleHeight) * 0.4));
			})(elements.modal.container);			
		});
		
		tc.jQ('#share-done-btn, .share-pane .modal-overlay').click(function(e) {
			e.preventDefault();
			if (elements.body.hasClass('browser-ipad')) {
				elements.modal.overlay.hide();
				elements.modal.container.hide();
			} else {
				elements.modal.container.fadeOut(250);
				elements.modal.overlay.delay(150).fadeOut(400);
			};
		});
		
		var socialRotator = new NI.SocialRotator({
			element:tc.jQ('.footer .spread')
		});
		
//		/* cycle through social network 'like' buttons */
//		(function(){
//			var spread_timer, spread_area, spread_buttons, spread_array, cyclePlay, drawerOpen, i, fadeSpeed, vertOffset, bottomOffset;
//			
//			spread_timer = setTimeout(cycleButtons, 4500);
//			spread_area = tc.jQ('.footer .spread');
//			spread_buttons = spread_area.children('.spread-button');
//			spread_array =[spread_buttons.eq(0), spread_buttons.eq(1), spread_buttons.eq(2)];
//			var current_button = 0;
//			
//			cyclePlay = true;
//			drawerOpen = false;
//			fadeSpeed = 600;
//			vertOffset = 35;
//			bottomOffset = 20;
//			
//			i = 0;
//			
//			function cycleButtons() {
//				if (cyclePlay == true) {
//					//spread_buttons.stop(true,true).fadeOut(fadeSpeed);
//					spread_array[current_button].stop(true,true).fadeOut(fadeSpeed);
//					i++;
//					current_button = (i % 3);
//					//spread_array[(current_button+1)%3].hide();
//					//spread_array[(current_button+2)%3].hide();
//					spread_array[current_button].css('bottom', bottomOffset).fadeIn(fadeSpeed);
//				}
//				spread_timer = setTimeout(cycleButtons, 4500);
//			};
//			
//			spread_area.hover(
//				function () {
//					cyclePlay = false;
//				},
//				function () {	
//					cyclePlay = true;
//				}
//			);
//					
//			/*spread_area.hover(
//				function () {
//					if (drawerOpen==false) {
//						cyclePlay = false;
//						spread_area.stop(true,true).animate({
//							top:'-'+(vertOffset*2)+'px'
//						},fadeSpeed*.5,function(){
//							spread_array[current_button].show();
//							spread_array[(current_button+1)%3].css('bottom', vertOffset+bottomOffset+'px').fadeIn(fadeSpeed/3);
//							spread_array[(current_button+2)%3].css('bottom', (vertOffset*2)+bottomOffset+'px').fadeIn(fadeSpeed/2);
//							drawerOpen = true;
//						});
//					}
//				},
//				function () {	
//					if (drawerOpen==true) {
//						spread_array[(current_button+1)%3].hide();
//						spread_array[(current_button+2)%3].hide();
//						spread_area.animate({
//							top:'1px'
//						},fadeSpeed*.5,function(){
//							drawerOpen = false;
//						});
//						cyclePlay = true;
//					}
//				}
//			);*/
//			 
//		})();
		
	});
	
})(this);