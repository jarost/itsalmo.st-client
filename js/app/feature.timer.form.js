(function(window) {
	
	var page = window.page,
	    NI = window.NI,
	    log = new NI.Logging({
	    	moduleName:'Feature(Timer.Create)',
	    	enabled:true
	    });
			
	page.features.push(function(app){
		
		var dom, elements, lookup_timer, newTimerId, tempTimerId, oldTempTimerId, validationManager;
		
		dom = $('.pane.start-pane');
		
		elements = {
			name:dom.find('#countdown-name'),
			url:dom.find('p.url'),
			url_id:dom.find('.url_id'),
			url_id_loader:dom.find('.url_id_loader'),
			date:dom.find('#countdown-date'),
			time:{
				hour:dom.find('#countdown-hour'),
				minute:dom.find('#countdown-minutes'),
				period:dom.find('#countdown-timeperiod'),
				period_picker:dom.find('#timeperiod-picker')
			},
			start_btn:dom.find('#start-btn')
		};
		
		validationManager = new NI.ValidationManager({
			$mother: dom,
			spec: [
				{
					element: elements.name, 
					validators:["required"]
				},
				{
					element: elements.date, 
					validators:["required", "date"]
				},
				{
					element: elements.time.hour,
					validators:["required", "number", NI.ValidationManager.makeRangeValidator(1, 12)]
				},
				{
					element: elements.time.minute,
					validators:["required", "number", NI.ValidationManager.makeRangeValidator(0, 59)]
				},
				{
					element: elements.time.period,
					validators:[
						"required",
						function(value) {
							value = value.toLowerCase();
							if (value !== "am" && value !== "pm") {
								return { valid: false, errors:["This is not a valid period"] };
							}
							return { valid: true };
						}
					]
				}
			],
			watchKeypress: true
		});
		
		function validationHint(element, hint) {
			element.bind("validationFail", function(e, d) {
				var $field = $(this),
				    $hint = $field.parent().find(".validation-notice");
				if (!$hint.length) {
					$hint = $("<div class='validation-notice'></div>");
					$field.parent().append($hint);
				}
				$hint.html($.isFunction(hint) ? hint() : hint);
				
			}).bind("validationPass", function(e, d) {
				$(this).parent().find(".validation-notice").remove();
			});
		}
				
		validationHint(elements.date, function() {
			return "Oops! We need a valid date, like "+ randomFutureDateStr();
		});
		
		$.each([elements.time.hour, elements.time.minute, elements.time.period], function(i, element) {
			validationHint(element, function() {
				return "Oops! We need a valid time, like "+ randomTimeStr();
			});
		});
		
		function randomFutureDateStr(maxDays) {
			var future, m, d, y;
			
			future = new Date();
			future.setTime(future.getTime() + (NI.math.random(1, maxDays || 100)*24*60*60*1000));
			
			m = future.getMonth() + 1;
			if (m < 10) { m = "0" + m; }
			d = future.getDate();
			if (d < 10) { d = "0" + d; }
			y = future.getFullYear();
			
			return (m +"/"+ d +"/"+ y);
		}
		
		function randomTimeStr() {
			var h, m, p;
			
			h =  window.Math.floor(NI.math.random(1, 13));
			m = window.Math.floor(NI.math.random(0, 60));
			if (m < 10) { m = "0" + m; }
			p = (NI.math.random() < 0.5) ? "AM" : "PM";
			
			return h +":"+ m +" "+ p;
		}
		
		function clear_form(){
			var future;
			document.title = 'It\'s Almost'; 
			future = new Date();
			future.setMinutes(future.getMinutes()+30);
			elements.url.css({
				opacity:0.0
			});
			elements.start_btn.addClass('disabled');
			elements.name.get(0).value = '';
			elements.date.get(0).value = (future.getMonth()+1)+'/'+future.getDate()+'/'+future.getFullYear();
			elements.time.hour.get(0).value = ((future.getHours() > 12) ? future.getHours() - 12 : future.getHours());
			elements.time.minute.get(0).value = future.getMinutes();
			fixMinutes();
			elements.time.period.get(0).value = ((future.getHours() > 12) ? 'PM' : 'AM');
		}
		
		function generate_id(name,append_random){
			var i, invalidCharacters;
			tempTimerId = $.trim(name);
			for(i in invalidCharacters = [
				' ',
				'\\.', '\,',
				'\!',
				'\/', '\\\\',
				'@',
				'\'','\"',
				'\;', '\:',
				'\<', '\>',
				'\\[', '\\]',
				'\\(', '\\)'])
			{
				tempTimerId = tempTimerId.replace(new RegExp(invalidCharacters[i],'g'),'');
			}
			if(tempTimerId == oldTempTimerId && !append_random){
				return;
			}
			oldTempTimerId = tempTimerId;
			if(!tempTimerId.length){
				elements.start_btn.addClass('disabled');
				elements.url.stop().animate({
					opacity:0.0
				},300);
				return;
			}
			if(append_random){
				tempTimerId = newTimerId + '_' + (function(){
					var out = "", possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", i;
					for( i=0; i < 5; i++ ) out += possible.charAt(Math.floor(Math.random() * possible.length));
					return out;
				})();
			}
			if(lookup_timer){
				clearTimeout(lookup_timer);
			}
			elements.url.stop().animate({
				opacity:1.0
			},300);
			newTimerId = tempTimerId;
			elements.url_id.text(newTimerId);
			if(newTimerId.length){
				elements.url_id_loader.show();
				lookup_timer = setTimeout(function(){
					app.events.trigger('form.newTimerIdGenerated',{
						newTimerId:newTimerId
					});
				},500);
			}
		};
		
		function validate_and_submit(){
			var date;
			
			if (!validationManager.validate()) {
				return false;
			}
			
			date = elements.date.val().split('/');
			
			date = new Date(
				((date[2].length == 4) ? date[2] : '20'+date[2]),
				(date[0] - 1),
				date[1],
				((elements.time.period.val().toLowerCase() == 'pm') ? ((elements.time.hour.val()*1.0) + 12) : elements.time.hour.val()),
				elements.time.minute.val()
			);
			
			if(date.getTime() < (new Date())){
				return false;
			}
			
			app.events.trigger('form.timerGenerated',{
				newTimerId:newTimerId,
				timer:{
					name:elements.name.val(),
					expires:date
				}
			});
			
			return true;
		};
		
		elements.name.bind('change keyup',function(e,d){
			generate_id(elements.name.val());
		});
		
		elements.start_btn.bind('click',function(e,d){
			if(!validate_and_submit()){}
		}).addClass('disabled');
		
		app.events.bind('timer.manager.timerLoaded',function(e,d){
			if(newTimerId){
				generate_id(newTimerId,true);
			}
			elements.url_id_loader.hide();
		});
		
		app.events.bind('timer.manager.timerCreated',function(e,d){
			newTimerId = null;
		});
		
		app.events.bind('timer.manager.noTimerLoaded',function(e,d){
			elements.start_btn.removeClass('disabled');
			elements.url_id_loader.hide();
		});
		
		app.events.bind('hashchange.hashChanged',function(e,d){
			if(!d.hash.length){
				clear_form();
				document.title = 'It\'s Almost';
				dom.stop().css('opacity',0.0).show().animate({
					opacity:1.0
				},500,function(){
					dom.css('opacity','none');
				});
			} else {
				newTimerId = null;
				dom.stop().animate({
					opacity:0.0
				},500,function(){
					$(this).hide();
				});
			}
		});
		
		
		/* handle the hiding/showing of the empty state text for countdown name */
		var emptyPhrases;
		emptyPhrases = (function(arr){
			// array shuffler from http://yelotofu.com/2008/08/jquery-shuffle-plugin/
			for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
			return arr;
		})([
			"time to go",
			"hammer time",
			"donk o'clock",
			"beer time",
			"winning",
			"the apocalypse",
			"lunch time",
			"my birthday!",
			"time to rock",
			"happy hour",
			"party time",
			"cupcake time",
			"snack time",
			"man time",
			"groundhog day",
			"the weekend",
			"sexy time",
			"product launch",
			"business time"
		]);
		
		(function() {
			var hint_timer, fadeSpeed, textDiv, i;
			
			hint_timer = setTimeout(changeText, 1000);
			textDiv = $('.countdown-name-empty-overlay');
			i = 0;
			
			function changeText() {
				if (!textDiv.hasClass('hidden')) {
					var j = i % emptyPhrases.length;
					textDiv.animate({
						opacity:0.0
					}, 400, function(){
						textDiv.html(emptyPhrases[j]).animate({
							opacity:0.35
						}, 400);
					});
					i++;
				}
				hint_timer = setTimeout(changeText,5000);
			}

			tc.jQ('.countdown-name-empty-overlay').click(function() {
				tc.jQ('#countdown-name').focus();
			});
			tc.jQ('#countdown-name').focus(function() {
				if(hint_timer){
					clearTimeout(hint_timer);
				}
				tc.jQ('.countdown-name-empty-overlay').stop().animate({
					opacity:0.0
				},150).css('display','none').addClass('hidden');
			});
			tc.jQ('#countdown-name').blur(function() {
				if(tc.jQ('#countdown-name').val().length){
					return;
				}
				hint_timer = setTimeout(function(){
					tc.jQ('.countdown-name-empty-overlay').css('display','block').animate({
						opacity:0.35
					},150,function(){
						hint_timer = setTimeout(changeText, 1500);
					}).removeClass('hidden');
				},100);
			});
		})();
		
		
		elements.time.minute.blur(function() { 
			fixMinutes();
		});
		
		function fixMinutes() {
			var v = elements.time.minute.val();
			if (v=='0'||v=='1'||v=='2'||v=='3'||v=='4'||v=='5'||v=='6'||v=='7'||v=='8'||v=='9') {
				elements.time.minute.val('0'+v);
			} else if (isNaN(v) || v < 0 || v > 59) {
				elements.time.minute.val('00');
			}
		}
		
		/* scroll through number inputs */
		var hoursChange = 0;
		elements.time.hour.bind("mousewheel", function(event, delta) {
			hoursChange += (delta/2);
			if (hoursChange > 1) {
				this.value = parseInt(this.value) + 1;
				hoursChange = 0;
			} else if (hoursChange < -1) {
				if (parseInt(this.value) > 0) {
					this.value = parseInt(this.value) - 1;
				}
				hoursChange = 0;
			}
			
			if (this.value > 12) {
				this.value = 12;
			} else if (this.value < 1) {
				this.value = 1;
			}
			return false;
		});
			
		var minutesChange = 0;
		elements.time.minute.bind("mousewheel", function(event, delta) {
			var valueSplit = this.value.split("");
			if (valueSplit[0] == 0) {
				this.value = valueSplit[1]
			}
			minutesChange += (delta/2);
			if (minutesChange > 1) {
				this.value = parseInt(this.value) + 1;
				minutesChange = 0;
			} else if (minutesChange < -1) {
				if (parseInt(this.value) > 0) {
					this.value = parseInt(this.value) - 1;
				}
				minutesChange = 0;
			}
			if (this.value > 59) {
				this.value = 59;
			}
			fixMinutes();
			return false;
		});
		
		
		/* am/pm picker */
		var pickerActive = false;
		
		elements.time.period.focus(function() {
			var inputPos = elements.time.period.position();
			var inputWidth = elements.time.period.outerWidth();
			var inputHeight = elements.time.period.outerHeight();
			
			elements.time.period_picker.css({
				'top': (inputPos.top + inputHeight + 2) + 'px',
				'left': (inputPos.left + 10) + 'px',
				'width': (inputWidth - 20) + 'px'
			}).slideDown(400);
		});
		elements.time.period.blur(function(e) {
			if (!pickerActive) {
				elements.time.period_picker.slideUp(200);
			}
		});
		
		elements.time.period_picker.mouseover(function() {
			pickerActive = true;
		}).mouseout(function() {
			pickerActive = false;
		}).click(function(e) {
			e.preventDefault();
			elements.time.period.val( $(e.target).text() );
			elements.time.period_picker.slideUp(200);
			pickerActive = false;
		});		
		
	});
	
})(this);