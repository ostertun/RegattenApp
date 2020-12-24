<?php

	header('Content-Type: text/javascript');

	require_once(__DIR__ . '/../../server/config.php');

?>

log('[tpl] Script "custom.js" loaded');

var loaderCount = 2;
var showConsoleButtonTimeout = setTimeout(function(){
	$('#button-show-console').show();
}, 10000);
var showLoader = function() {
	log('[tpl] showLoader called, loaderCount:', loaderCount);
	if (loaderCount < 1) {
		$('#preloader').removeClass('preloader-hide');
		loaderCount = 0;
		showConsoleButtonTimeout = setTimeout(function(){
			$('#button-show-console').show();
		}, 10000);
		log('[tpl] Loader shown');
	}
	loaderCount ++;
}
var hideLoader = function() {
	log('[tpl] hideLoader called, loaderCount:', loaderCount);
	loaderCount --;
	if (loaderCount < 1) {
		$('#preloader').addClass('preloader-hide');
		loaderCount = 0;
		clearTimeout(showConsoleButtonTimeout);
		$('#button-show-console').hide();
		log('[tpl] Loader hidden');
	}
}

$(window).on('load',function(){
	$('.menu').css('display','block');
	hideLoader();
})

//Generating Cookies
function createCookie(e, t, n) {if (n) {var o = new Date;o.setTime(o.getTime() + n * 365 * 24 * 3600 * 1e3);var r = "; expires=" + o.toGMTString()} else var r = "";document.cookie = e + "=" + t + r + "; path=/"}
function readCookie(e) {for (var t = e + "=", n = document.cookie.split(";"), o = 0; o < n.length; o++) {for (var r = n[o];" " == r.charAt(0);) r = r.substring(1, r.length);if (0 == r.indexOf(t)) return r.substring(t.length, r.length)}return null}
function eraseCookie(e) {createCookie(e, "", -1)}

$(document).ready(function(){
	'use strict'

	log('[tpl] Document ready');

	function init_template(){

		log('[tpl] Initializing template...');

		//ADD YOUR CUSTOM JAVASCRIPT CODES HERE!
		//Do not put inside HTML files.
		//The init_template() function will be triggered when pages open.


		//Generating Dynamic Styles to decrease CSS size and execute faster loading times.
		var colorsArray = [
			//colors must be in HEX format.
			// use the color scheme as bellow  this will automatically generate CSS for
			// bg-colorName-dark bg-colorName-light color-colorName-dark color-colorName-light
			//["colorName","light_hex","dark_hex","darker_hex_for_gradient"],
			["none","","",""],
			["plum","#6772A4","#6772A4","#3D3949"],
			["violet","#673c58","#673c58","#492D3D"],
			["magenta3","#413a65","#413a65","#2b2741"],
			["red3","#c62f50","#6F1025","#6F1025"],
			["green3","#6eb148","#2d7335","#2d7335"],
			["pumpkin","#E96A57","#C15140","#C15140"],
			["dark3","#535468","#535468","#343341"],
			["red1","#D8334A","#BF263C","#9d0f23"],
			["red2","#ED5565","#DA4453","#a71222"],
			["orange","#FC6E51","#E9573F","#ce3319"],
			["yellow1","#FFCE54","#F6BB42","#e6a00f"],
			["yellow2","#E8CE4D","#E0C341","#dbb50c"],
			["yellow3","#CCA64F","#996A22","#996A22"],
			["green1","#A0D468","#8CC152","#5ba30b"],
			["green2","#2ECC71","#2ABA66","#0da24b"],
			["mint","#48CFAD","#37BC9B","#0fa781"],
			["teal","#A0CECB","#7DB1B1","#158383"],
			["aqua","#4FC1E9","#3BAFDA","#0a8ab9"],
			["sky","#188FB6","#0F5F79","#0F5F79"],
			["blue1","#4FC1E9","#3BAFDA","#0b769d"],
			["blue2","#5D9CEC","#4A89DC","#1a64c6"],
			["magenta1","#AC92EC","#967ADC","#704dc9"],
			["magenta2","#8067B7","#6A50A7","#4e3190"],
			["pink1","#EC87C0","#D770AD","#c73c8e"],
			["pink2","#fa6a8e","#fb3365","#d30e3f"],
			["brown1","#BAA286","#AA8E69","#896b43"],
			["brown2","#8E8271","#7B7163","#584934"],
			["gray1","#F5F7FA","#E6E9ED","#c2c5c9"],
			["gray2","#CCD1D9","#AAB2BD","#88919d"],
			["dark1","#656D78","#434A54","#242b34"],
			["dark2","#3C3B3D","#323133","#1c191f"]
		];
		var socialColorArray = [
			["facebook","#3b5998"],
			["linkedin","#0077B5"],
			["twitter","#4099ff"],
			["google","#d34836"],
			["whatsapp","#34AF23"],
			["pinterest","#C92228"],
			["sms","#27ae60"],
			["mail","#3498db"],
			["dribbble","#EA4C89"],
			["phone","#27ae60"],
			["skype","#12A5F4"],
			["instagram","#e1306c"]
		];


		//Back Button Scroll Stop
		//if ('scrollRestoration' in history) {history.scrollRestoration = 'manual';}

		//Disable Page Jump on Empty Links.
		$('a').on('click', function(){var attrs = $(this).attr('href'); if(attrs === '#'){return false;}});

		log('[tpl] init menus');

		//Adding Background for Gradient
		if(!$('.menu-hider').length){$('#page').append('<div class="menu-hider"><div>');}

		history.pushState(null, '');
		log('[tpl] state pushed');

		/*Menu Extender Function*/
		$.fn.showMenu = function() {$(this).addClass('menu-active'); $('#footer-bar').addClass('footer-menu-hidden');setTimeout(function(){$('.menu-hider').addClass('menu-active');},250);$('body').addClass('modal-open');};
		$.fn.hideMenu = function() {$(this).removeClass('menu-active'); $('#footer-bar').removeClass('footer-menu-hidden');$('.menu-hider').removeClass('menu-active menu-active-clear');$('body').removeClass('modal-open');};

		window.onpopstate = function(event) {
			var menuOpened = $('body').hasClass('modal-open');
			log('[tpl] popstate event fired. location:' + document.location + ', state:' + JSON.stringify(event.state) + ', menuOpened:' + menuOpened);
			if (menuOpened) {
				$('.menu').hideMenu();
				log('Menu hidden');
			} else {
				log('history.back');
				history.back();
			}
		};

		//Add your programatically triggered menus here


		//Menu Required Variables
		var menu = $('.menu'),
			body = $('body'),
			menuFixed = $('.nav-fixed'),
			menuFooter = $('#footer-bar'),
			menuHider = $('body').find('.menu-hider'),
			menuClose = $('.close-menu'),
			header = $('.header'),
			pageAll = $('#page'),
			pageContent = $('.page-content'),
			headerAndContent = $('.header, .page-content, #footer-bar'),
			menuDeployer = $('a[data-menu]');

		//Menu System
		menu.each(function(){
			var menuHeight = $(this).data('menu-height');
			var menuWidth = $(this).data('menu-width');
			var menuActive = $(this).data('menu-active');
			if($(this).hasClass('menu-box-right')){$(this).css("width",menuWidth);}
			if($(this).hasClass('menu-box-left')){$(this).css("width",menuWidth);}
			if($(this).hasClass('menu-box-bottom')){$(this).css("height",menuHeight);}
			if($(this).hasClass('menu-box-top')){$(this).css("height",menuHeight);}
			if($(this).hasClass('menu-box-modal')){$(this).css({"height":menuHeight, "width":menuWidth});}
		});

		//Menu Deploy Click
		menuDeployer.on('click',function(){
			menu.removeClass('menu-active');
			menuHider.addClass('menu-active');

			var menuData = $(this).data('menu');
			var menuID = $('#'+menuData);
			var menuEffect = $('#'+menuData).data('menu-effect');
			var menuWidth = menuID.data('menu-width');
			var menuHeight = menuID.data('menu-height');
			$('body').addClass('modal-open');
			if(menuID.hasClass('menu-header-clear')){menuHider.addClass('menu-active-clear');}
			function menuActivate(){menuID = 'menu-active' ? menuID.addClass('menu-active') : menuID.removeClass('menu-active');}
			if(menuID.hasClass('menu-box-bottom')){$('#footer-bar').addClass('footer-menu-hidden');}
			if(menuEffect === "menu-parallax"){
				if(menuID.hasClass('menu-box-bottom')){headerAndContent.css("transform", "translateY("+(menuHeight/5)*(-1)+"px)");}
				if(menuID.hasClass('menu-box-top')){headerAndContent.css("transform", "translateY("+(menuHeight/5)+"px)");}
				if(menuID.hasClass('menu-box-left')){headerAndContent.css("transform", "translateX("+(menuWidth/5)+"px)");}
				if(menuID.hasClass('menu-box-right')){headerAndContent.css("transform", "translateX("+(menuWidth/5)*(-1)+"px)");}
			}
			if(menuEffect === "menu-push"){
				if(menuID.hasClass('menu-box-bottom')){headerAndContent.css("transform", "translateY("+(menuHeight)*(-1)+"px)");}
				if(menuID.hasClass('menu-box-top')){headerAndContent.css("transform", "translateY("+(menuHeight)+"px)");}
				if(menuID.hasClass('menu-box-left')){headerAndContent.css("transform", "translateX("+(menuWidth)+"px)");}
				if(menuID.hasClass('menu-box-right')){headerAndContent.css("transform", "translateX("+(menuWidth)*(-1)+"px)");}
			}
			if(menuEffect === "menu-push-full"){
				if(menuID.hasClass('menu-box-left')){headerAndContent.css("transform", "translateX(100%)");}
				if(menuID.hasClass('menu-box-right')){headerAndContent.css("transform", "translateX(-100%)");}
			}
			menuActivate();
		});

		//Allows clicking even if menu is loaded externally.
		$('body').removeClass('modal-open');
		$('.menu-hider, .close-menu, .menu-close').on('click', function(){
			menu.removeClass('menu-active');
			menuHider.removeClass('menu-active menu-active-clear');
			headerAndContent.css('transform','translate(0,0)');
			menuHider.css('transform','translate(0,0)');
			$('#footer-bar').removeClass('footer-menu-hidden');
			$('body').removeClass('modal-open');
			return false;
		});

		log('[tpl] init dark mode');

		//Disabling & Enabling Dark Transitions in Dark Mode to Speed up Performance.
		function allowTransitions(){$('body').find('#transitions-remove').remove();}
		function removeTransitions(){$('body').append('<style id="transitions-remove">.btn, .header, #footer-bar, .menu-box, .menu-active{transition:all 0ms ease!important;}</style>'); setTimeout(function(){allowTransitions();},10);}

		//Dark Mode
		var darkSwitch = $('[data-toggle-theme-switch], [data-toggle-theme], [data-toggle-theme-switch] input, [data-toggle-theme] input');
		$('[data-toggle-theme], [data-toggle-theme-switch]').on('click',function(){
			removeTransitions();
			$('body').toggleClass('theme-light theme-dark');
			setTimeout(function(){
			if($('body').hasClass('detect-theme')){$('body').removeClass('detect-theme');}
			if($('body').hasClass('theme-light')){
				eraseCookie('sticky_dark_mode');
				darkSwitch.prop('checked', false);
				createCookie('sticky_light_mode', true, 1);
			}
			if($('body').hasClass('theme-dark')){
				eraseCookie('sticky_light_mode');
				darkSwitch.prop('checked', true);
				createCookie('sticky_dark_mode', true, 1);
			}
			},150);
		})
		if (readCookie('sticky_dark_mode')) {createCookie('sticky_dark_mode', true, 1); darkSwitch.prop('checked', true); $('body').removeClass('detect-theme').removeClass('theme-light').addClass('theme-dark');}
		if (readCookie('sticky_light_mode')) {createCookie('sticky_light_mode', true, 1); darkSwitch.prop('checked', false); $('body').removeClass('detect-theme').removeClass('theme-dark').addClass('theme-light');}


		//Auto Dark Mode
		function activateDarkMode(){$('body').removeClass('theme-light').addClass('theme-dark'); $('#dark-mode-detected').removeClass('disabled'); eraseCookie('sticky_light_mode'); createCookie('sticky_dark_mode', true, 1);}
		function activateLightMode(){$('body').removeClass('theme-dark').addClass('theme-light'); $('#dark-mode-detected').removeClass('disabled'); eraseCookie('sticky_dark_mode'); createCookie('sticky_light_mode', true, 1);}
		function activateNoPreference(){$('#manual-mode-detected').removeClass('disabled');}

		function setColorScheme() {
			const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
			const isLightMode = window.matchMedia("(prefers-color-scheme: light)").matches
			const isNoPreference = window.matchMedia("(prefers-color-scheme: no-preference)").matches
			window.matchMedia("(prefers-color-scheme: dark)").addListener(e => e.matches && activateDarkMode())
			window.matchMedia("(prefers-color-scheme: light)").addListener(e => e.matches && activateLightMode())
			window.matchMedia("(prefers-color-scheme: no-preference)").addListener(e => e.matches && activateNoPreference())
			if(isDarkMode) activateDarkMode();
			if(isLightMode) activateLightMode();
		}
		if($('body').hasClass('detect-theme')){setColorScheme();}
		$('.detect-dark-mode').on('click',function(){ $('body').addClass('detect-theme'); setColorScheme(); return false;});
		$('.disable-auto-dark-mode').on('click',function(){ $('body').removeClass('detect-theme'); $(this).remove(); return false;});

		log('[tpl] init other ui elements');

		//Footer Menu Active Elements
		if($('.footer-bar-2, .footer-bar-4, .footer-bar-5').length){
			if(!$('.footer-bar-2 strong, .footer-bar-4 strong, .footer-bar-5 strong').length){
				$('.footer-bar-2 .active-nav, .footer-bar-4 .active-nav, .footer-bar-5 .active-nav').append('<strong></strong>')
			}
		}

		//Back Button in Header
		var backButton = $('.back-button, [data-back-button]');
		backButton.on('click', function() {
			window.history.go(-1);
			//return false;
		});

		log('[tpl] detect mobile os');

		//Detect Mobile OS//
		var isMobile = {
			Android: function() {return navigator.userAgent.match(/Android/i);},
			iOS: function() {return navigator.userAgent.match(/iPhone|iPad|iPod/i);},
			Windows: function() {return navigator.userAgent.match(/IEMobile/i);},
			any: function() {return (isMobile.Android() || isMobile.iOS() || isMobile.Windows());}
		};
		if (!isMobile.any()) {
			$('body').addClass('is-not-ios');
			$('.show-ios, .show-android').addClass('disabled');
			$('.show-no-device').removeClass('disabled');
		}
		if (isMobile.Android()) {
			$('body').addClass('is-not-ios');
			$('head').append('<meta name="theme-color" content="#FFFFFF"> />');
			$('.show-android').removeClass('disabled');
			$('.show-ios, .show-no-device, .simulate-android, .simulate-iphones').addClass('disabled');
		}
		if (isMobile.iOS()) {
			$('body').addClass('is-ios');
			$('.show-ios').removeClass('disabled');
			$('.show-android, .show-no-device, .simulate-android, .simulate-iphones').addClass('disabled');
		}

		log('[tpl] init toasts');

		//Toast, Snackbars and Notifications
		$('[data-toast]').on('click',function(){
			$('.toast, .snackbar-toast, .notification').toast('hide');
			$('#'+$(this).data('toast')).toast('show');
			return false;
		});
		$('[data-dismiss]').on('click',function(){
			var thisData = $(this).data('dismiss');
			$('#'+thisData).toast('hide');
		});

		log('[tpl] init switches');

		//Switches
		$('.ios-input, .android-input, .classic-input').on('click',function(){
			var id = $(this).attr('id');
			var data = $('[data-switch='+id+']')
			if(data.length){data.stop().animate({height: 'toggle'},250);}
		});
		$('[data-activate]').on('click',function(){
			var activateCheck = $(this).data('activate');
			$('#'+activateCheck).trigger('click');
		});

		$('[data-trigger-switch]').on('click',function(){
			var thisID = $(this).data('trigger-switch');
			if ($('#'+thisID).prop('checked')) {
				$('#'+thisID).prop('checked', false);
			} else {
				$('#'+thisID).prop('checked', true);
			}
		})

		log('[tpl] Init inputs');

        $('.input-required input, .input-required select, .input-required textarea').on('focusin keyup',function(){
            var spanValue = $(this).parent().find('span').text();
            if($(this).val() != spanValue && $(this).val() != ""){
                $(this).parent().find('span').addClass('input-style-1-active').removeClass('input-style-1-inactive');
            }
            if($(this).val() === ""){
                $(this).parent().find('span').removeClass('input-style-1-inactive input-style-1-active');
            }
        });
        $('.input-required input, .input-required select, .input-required textarea').on('focusout',function(){
            var spanValue = $(this).parent().find('span').text();
            if($(this).val() === ""){
                $(this).parent().find('span').removeClass('input-style-1-inactive input-style-1-active');
            }
            $(this).parent().find('span').addClass('input-style-1-inactive')
        });
        $('.input-required select').on('focusout',function(){
            var getValue = $(this)[0].value;
            if(getValue === "default"){
                $(this).parent().find('span').removeClass('input-style-1-inactive input-style-1-active');
            }
        });

		log('[tpl] init a2h');

		//Adding added-to-homescreen class to be targeted when used as PWA.
		function ath(){
			(function(a, b, c) {
				if (c in b && b[c]) {
					var d, e = a.location,
						f = /^(a|html)$/i;
					a.addEventListener("click", function(a) {
						d = a.target;
						while (!f.test(d.nodeName)) d = d.parentNode;
						"href" in d && (d.href.indexOf("http") || ~d.href.indexOf(e.host)) && (a.preventDefault(), e.href = d.href)
					}, !1);
					$('.add-to-home').addClass('disabled');
					$('body').addClass('is-on-homescreen');
				}
			})(document, window.navigator, "standalone")
		}
		ath();

		//Add to Home Banners
		$('.simulate-android-badge').on('click',function(){$('.add-to-home').removeClass('add-to-home-ios').addClass('add-to-home-visible add-to-home-android');});
		$('.simulate-iphone-badge').on('click',function(){$('.add-to-home').removeClass('add-to-home-android').addClass('add-to-home-visible add-to-home-ios');});
		$('.add-to-home').on('click',function(){$('.add-to-home').removeClass('add-to-home-visible');})
		$('.simulate-android-banner').on('click',function(){$('#menu-install-pwa-android, .menu-hider').addClass('menu-active')})
		$('.simulate-ios-banner').on('click',function(){$('#menu-install-pwa-ios, .menu-hider').addClass('menu-active')})

		log('[tpl] init offline alerts');

		//Adding Offline Alerts
		var offlineAlerts = $('.offline-message');
		if(!offlineAlerts.length){
			$('body').append('<p class="offline-message bg-red2-dark color-white center-text uppercase ultrabold">' + strings['inetMsgOffline'] + '</p> ');
			$('body').append('<p class="online-message bg-green1-dark color-white center-text uppercase ultrabold">' + strings['inetMsgOnline'] + '</p>');
		}

		//Offline Function Show
		function isOffline(){
			$('.offline-message').addClass('offline-message-active');
			$('.online-message').removeClass('online-message-active');
			setTimeout(function(){$('.offline-message').removeClass('offline-message-active');},2000);
		}

		//Online Function Show
		function isOnline(){
			$('.online-message').addClass('online-message-active');
			$('.offline-message').removeClass('offline-message-active');
			setTimeout(function(){$('.online-message').removeClass('online-message-active');},2000);
		}

		//Check if Online / Offline
		function updateOnlineStatus(event) {
		var condition = navigator.onLine ? "online" : "offline";
			isOnline();
			log('[tpl] Connection: Online');
		}
		function updateOfflineStatus(event) {
			isOffline();
			log('[tpl] Connection: Offline');
		}
		window.addEventListener('online',  updateOnlineStatus);
		window.addEventListener('offline', updateOfflineStatus);

		log('[tpl] init share buttons');

		//Sharing
		var share_link = window.location.href;
		var share_title = document.title;
		$('.shareToFacebook').prop("href", "https://www.facebook.com/sharer/sharer.php?u="+share_link)
		$('.shareToLinkedIn').prop("href", "https://www.linkedin.com/shareArticle?mini=true&url="+share_link+"&title="+share_title+"&summary=&source=")
		$('.shareToTwitter').prop("href", "https://twitter.com/home?status="+share_link)
		$('.shareToPinterest').prop("href", "https://pinterest.com/pin/create/button/?url=" + share_link)
		$('.shareToWhatsApp').prop("href", "whatsapp://send?text=" + share_link)
		$('.shareToMail').prop("href", "mailto:?body=" + share_link)

		log('[tpl] init colors');

		//Style Generator
		var generatedStyles = $('.generated-styles');
		var generatedHighlight = $('.generated-highlight');

		//HEX to RGBA Converter
		function HEXtoRGBA(hex){
			var c;
			if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
				c= hex.substring(1).split('');
				if(c.length== 3){c= [c[0], c[0], c[1], c[1], c[2], c[2]];}
				c= '0x'+c.join('');
				return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',0.3)';
			}
		}

		log('[tpl] init highlight colors');

		function highlight_colors(){
			var bodyColor = $('body').data('highlight');
			var bodyBackground = $('body').data('background');

			var data = colorsArray.map(colorsArray => colorsArray[0]);
			if (data.indexOf(bodyColor) > -1) {
				var highlightLocated = data.indexOf(bodyColor)
				var backgroundLocated = data.indexOf(bodyBackground)
				var highlightColorCode = colorsArray[highlightLocated][2]
				var backgroundColorCode = colorsArray[backgroundLocated][3] + ', ' + colorsArray[backgroundLocated][1]
				var highlightColor = '.color-highlight{color:'+highlightColorCode+'!important}'
				var highlightBg = '.bg-highlight, .page-item.active a{background-color:'+highlightColorCode+'!important}'
				var highlightNav = '.footer-bar-1 .active-nav *, .footer-bar-3 .active-nav i{color:'+highlightColorCode+'!important} .footer-bar-2 strong, .footer-bar-4 strong, .footer-bar-5 strong{background-color:'+highlightColorCode+'!important; color:#FFF;}'
				var highlightBorder = '.border-highlight{border-color:'+highlightColorCode+'!important}'
				var highlightHeaderTabs = '.header-tab-active{border-color:'+highlightColorCode+'!important}'
				var bodyBG = '#page{background: linear-gradient(0deg, '+backgroundColorCode+')!important;} .bg-page{background: linear-gradient(0deg, '+backgroundColorCode+')!important }'
				if(!generatedHighlight.length){
					$('body').append('<style class="generated-highlight"></style>')
					$('body').append('<style class="generated-background"></style>')
					$('.generated-highlight').append(highlightColor, highlightBg, highlightNav, highlightBorder, highlightHeaderTabs);
					$('.generated-background').append(bodyBG);
				}
			}
		}
		highlight_colors();

		setTimeout(function(){
			log('[tpl] init other colors');
			if (!generatedStyles.length){
				$('body').append('<style class="generated-styles"></style>');
				$('.generated-styles').append('/*Generated using JS for lower CSS file Size, Easier Editing & Faster Loading*/');
				colorsArray.forEach(function (colorValue) {$('.generated-styles').append('.bg-'+colorValue[0]+'-light{ background-color: '+colorValue[1]+'!important; color:#FFFFFF!important;} .bg-'+colorValue[0]+'-light i, .bg-'+colorValue[0]+'-dark i{color:#FFFFFF;} .bg-'+colorValue[0]+'-dark{  background-color: '+colorValue[2]+'!important; color:#FFFFFF!important;} .border-'+colorValue[0]+'-light{ border-color:'+colorValue[1]+'!important;} .border-'+colorValue[0]+'-dark{  border-color:'+colorValue[2]+'!important;} .color-'+colorValue[0]+'-light{ color: '+colorValue[1]+'!important;} .color-'+colorValue[0]+'-dark{  color: '+colorValue[2]+'!important;}');});
				colorsArray.forEach(function (colorFadeValue) {$('.generated-styles').append('.bg-fade-'+colorFadeValue[0]+'-light{ background-color: '+ HEXtoRGBA(colorFadeValue[1]) + '!important; color:#FFFFFF;} .bg-fade-'+colorFadeValue[0]+'-light i, .bg-'+colorFadeValue[0]+'-dark i{color:#FFFFFF;} .bg-fade-'+colorFadeValue[0]+'-dark{  background-color: '+HEXtoRGBA(colorFadeValue[2])+'!important; color:#FFFFFF;} .border-fade-'+colorFadeValue[0]+'-light{ border-color:'+HEXtoRGBA(colorFadeValue[1])+'!important;} .border-fade-'+colorFadeValue[0]+'-dark{  border-color:'+HEXtoRGBA(colorFadeValue[2])+'!important;} .color-fade-'+colorFadeValue[0]+'-light{ color: '+HEXtoRGBA(colorFadeValue[1])+'!important;} .color-fade-'+colorFadeValue[0]+'-dark{  color: '+HEXtoRGBA(colorFadeValue[2])+'!important;}');});
				colorsArray.forEach(function (gradientValue) {$('.generated-styles').append('.bg-gradient-'+gradientValue[0]+'{background-image: linear-gradient(to bottom, '+gradientValue[1]+' 0, '+gradientValue[2]+' 100%)}')});
				socialColorArray.forEach(function (socialColorValue) {$('.generated-styles').append('.bg-'+socialColorValue[0]+'{background-color:'+socialColorValue[1]+'!important; color:#FFFFFF;} .color-'+socialColorValue[0]+'{color:'+socialColorValue[1]+'!important;}')});
				colorsArray.forEach(function (gradientBodyValue) {$('.generated-styles').append('.body-'+gradientBodyValue[0]+'{background-image: linear-gradient(to bottom, '+gradientBodyValue[1]+' 0, '+gradientBodyValue[3]+' 100%)}')});
			}
			log('[tpl] other colors initialized');
		},0);

		log('[tpl] init welcome banner');

		function welcomeOk() {
			createCookie('sticky_welcome_banner', true, 1);
			$('#menu-welcome').hideMenu();
			$('.menu-hider').removeClass('no-click');
		}
		function showWelcome() {
			if (!readCookie('sticky_welcome_banner')) {
				$('.menu-hider').addClass('no-click');
				$('#menu-welcome').showMenu();
			}
		}
		$('#menu-welcome-a-okay').click(welcomeOk);
		showWelcome();

		log('[tpl] Template initialized');
		log('[tpl] Initializing app');

		initRegatten();

		hideLoader();

	}
	//Activating all the plugins
	setTimeout(init_template, 0);

});
