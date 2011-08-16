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
			share_button:dom.find('.share-btn'),
			modal:{
				overlay:$('.modal-overlay'),
				container:$('.modal-container'),
				url_link:$('.modal-container').find('.url a'),
				url_text:$('.modal-container').find('.url a .text'),
				twitter_link:$('.modal-container').find('.twitter a'),
				facebook_link:$('.modal-container').find('.fb a')
			}
		};
		
		app.events.bind('hashchange.hashChanged',function(e,d){
			if(!d.hash.length){
				elements.social.stop().animate({
					'opacity':0.0
				},500,function(){
					$(this).css('visibility','hidden');
				});
			} else {
				elements.social.stop().css('visibility','visible').animate({
					'opacity':1.0
				},500,function(){
					$(this).css('opacity','none');
				});
			}
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
			facebook_url =   'https://www.facebook.com/dialog/feed?' +
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
		
		//elements.modal.facebook_link.bind('click',function(e,d){
		//	e.preventDefault();
		//	var opts		= 'status=1' +
		//							',width='  + 1000  +
		//							',height=' + 600;
		//	window.open(elements.modal.facebook_link.attr('href'), 'Facebook', opts);
		//});
		

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
		
		tc.jQ('#share-done-btn, .modal-overlay').click(function(e) {
			e.preventDefault();
			if (elements.body.hasClass('browser-ipad')) {
				elements.modal.overlay.hide();
				elements.modal.container.hide();
			} else {
				elements.modal.container.fadeOut(250);
				elements.modal.overlay.delay(150).fadeOut(400);
			};
		});
		
		
		/* cycle through social network 'like' buttons */
		(function(){
			var spread_timer, spread_area, spread_buttons, spread_array, cyclePlay, i, j, fadeSpeed, vertOffset, bottomOffset;
			
			spread_timer = setTimeout(cycleButtons, 4500);
			spread_area = tc.jQ('.footer .spread');
			spread_buttons = spread_area.children('.spread-button');
			spread_array =[spread_buttons.eq(0), spread_buttons.eq(1), spread_buttons.eq(2)];
			var current_button = 0;
			
			cyclePlay = true;
			fadeSpeed = 600;
			vertOffset = 35;
			bottomOffset = 20;
			
			i = 0;
			
			function cycleButtons() {
				if (cyclePlay == true) {
					spread_buttons.stop(true,true).fadeOut(fadeSpeed);
					i++;
					current_button = (i % 3);
					spread_area.find('.spread-'+current_button).css('bottom', bottomOffset).fadeIn(fadeSpeed);
				}
				spread_timer = setTimeout(cycleButtons, 4500);
			};
					
			spread_area.hover(
				function () {
					cyclePlay = false;
					spread_area.stop(true,true).animate({
						background:'#222222',
						top:'-'+(vertOffset*2)+'px'
					},fadeSpeed*.65,function(){
						spread_array[current_button].fadeIn(fadeSpeed);
						spread_array[(current_button+1)%3].css('bottom', vertOffset+bottomOffset+'px').fadeIn(fadeSpeed*.75);
						spread_array[(current_button+2)%3].css('bottom', (vertOffset*2)+bottomOffset+'px').fadeIn(fadeSpeed*.75);
					});
				},
				function () {	
					spread_array[(current_button+1)%3].stop(true,true).fadeOut(fadeSpeed/3);
					spread_array[(current_button+2)%3].fadeOut(fadeSpeed/3);
					spread_area.animate({
						top:'1px'
					},fadeSpeed*.75,function(){
						cyclePlay = true;
					});
				}
			);
			
		})();
		
	});
	
})(this);