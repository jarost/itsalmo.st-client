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
				url_text:$('.share-pane .modal-container').find('.url .text'),
				twitter_link:$('.share-pane .modal-container').find('.twitter a'),
				facebook_link:$('.share-pane .modal-container').find('.fb a'),
				embed_toggle_btn:$('.share-pane .modal-container').find('.embed-toggle-button'),
				embed_drawer:$('.share-pane .modal-container').find('.embed-drawer'),
				embed_width:$('.share-pane .modal-container').find('input.embed-width'),
				embed_height:$('.share-pane .modal-container').find('input.embed-height')
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
			
			if(d.expired){
				elements.share_button.animate({
					opacity:0.25
				},400,function(){
					elements.share_button.addClass('disabled');
				});
			}
			
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
			
			elements.modal.url_text.text(url);
			elements.modal.twitter_link.attr('href',twitter_url);
			elements.modal.facebook_link.attr('href',facebook_url);
			
			timerid = window.escape(d.id);
			generateEmbedCode(timerid);
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
		
		
		
		/* SHARE MODAL STUFF */
		var embedDrawerShowing, modalContainerOffset, defaultEmbedWidth, defaultEmbedHeight, minEmbedWidth, minEmbedHeight, timerid;
		
		embedDrawerShowing = false;
		modalContainerOffset = "55px";
		
		defaultEmbedWidth = 400;
		defaultEmbedHeight = 250;
		
		minEmbedWidth = 275;
		minEmbedHeight = 200;
		
		/* show sharing modal */
		elements.share_button.bind('click',function() {
			if($(this).hasClass('disabled')){
				return;
			}
			
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
		
		/* hide sharing modal */
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
		
		/* toggle widget embed drawer */
		elements.modal.embed_toggle_btn.click(function() {			
			if (embedDrawerShowing == false) {
				modalTopOffset = elements.modal.container.css('top');
				elements.modal.embed_toggle_btn.addClass('open').find('span').text('-');
				elements.modal.embed_drawer.slideDown(450, function(){
					embedDrawerShowing = true;
				});
				elements.modal.container.animate({top: "-=" + modalContainerOffset}, 450);
			} else {
				elements.modal.embed_drawer.slideUp(300, function(){
					elements.modal.embed_toggle_btn.removeClass('open').find('span').text('+');
					embedDrawerShowing = false;
				});
				elements.modal.container.animate({top: "+=" + modalContainerOffset}, 300);
			}
		});
		
		/* validate and generate new embed code if someone enters a custom widget size */
		elements.modal.embed_drawer.find('input').blur(function() {
			var valWidth = elements.modal.embed_width.val();
			var valHeight = elements.modal.embed_height.val()
			
			if (valWidth < minEmbedWidth || valHeight < minEmbedHeight) {
				elements.modal.embed_drawer.find('textarea').text('Please keep your widget to over '+ minEmbedWidth + ' pixels wide and ' + minEmbedHeight + ' pixels tall');
			} else {
				generateEmbedCode(timerid, valWidth, valHeight)
			};
		});
		
		/* generate the embed code */
		function generateEmbedCode(id, width, height) {
			if (!width) { width = defaultEmbedWidth }
			if (!height) { height = defaultEmbedHeight }
			
			var embedCode = '<iframe width="' + width + '" height="' + height + '" src="http://itsalmo.st/#' + id + ':embed" scrolling="no" frameborder="0" style="border: 1px solid #dbd8d7"></iframe>';
			elements.modal.embed_drawer.find('textarea').text(embedCode);
		};
		
		
		/* FOOTER SOCIAL MEDIA ROTATER */
		var socialRotator = new NI.SocialRotator({
			element:tc.jQ('.footer .spread')
		});
		
	});
	
})(this);