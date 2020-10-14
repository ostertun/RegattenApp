<?php

	header('Content-Type: text/javascript');

	require_once(__DIR__ . '/../../server/version.php');
	require_once(__DIR__ . '/../../server/config.php');

?>
//Loading the Service Worker
var swRegistration = null;
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async function() {
    swRegistration = await navigator.serviceWorker.register('<?php echo SERVER_ADDR; ?>/service-worker.js.php');
    if (typeof onServiceWorkerLoaded === 'function') onServiceWorkerLoaded();
  });
}


$(document).ready(function(){
    'use strict'

    var pwaVersion = '<?php echo PWA_VERSION; ?>'; //must be identical to _manifest.json version. If not it will create update window loop


    $('[data-pwa-version]').data('pwa-version', pwaVersion);


    //Creating Cookie System for PWA Hide
    function createCookie(e, t, n) {if (n) {var o = new Date;o.setTime(o.getTime() + n * 365 * 24 * 3600 * 1e3);var r = "; expires=" + o.toGMTString()} else var r = "";document.cookie = e + "=" + t + r + "; path=/"}
    function readCookie(e) {for (var t = e + "=", n = document.cookie.split(";"), o = 0; o < n.length; o++) {for (var r = n[o];" " == r.charAt(0);) r = r.substring(1, r.length);if (0 == r.indexOf(t)) return r.substring(t.length, r.length)}return null}
    function eraseCookie(e) {createCookie(e, "", -1)}

    //Enabling dismiss button
    setTimeout(function(){
        $('.pwa-dismiss').on('click',function(){
            log('[pwa] User Closed Add to Home / PWA Prompt')
            createCookie('Sticky_pwa_rejected_install', true, 1);
            $('body').find('#menu-install-pwa-android, #menu-install-pwa-ios, .menu-hider').removeClass('menu-active');
        });
    },1500);

    //Detecting Mobile Operating Systems
    var isMobile = {
        Android: function() {return navigator.userAgent.match(/Android/i);},
        iOS: function() {return navigator.userAgent.match(/iPhone|iPad|iPod/i);},
        any: function() {return (isMobile.Android() || isMobile.iOS() || isMobile.Windows());}
    };
    var isInWebAppiOS = (window.navigator.standalone == true);
    var isInWebAppChrome = (window.matchMedia('(display-mode: standalone)').matches);

    //Firing PWA prompts for specific versions and when not on home screen.
    if (isMobile.Android()) {
        log('[pwa] Android Detected');
        function showInstallPromotion(){
            if($('#menu-install-pwa-android, .add-to-home').length){
                log('[pwa] Triggering PWA Menu for Android');
                if (!readCookie('Sticky_pwa_rejected_install')) {
                    setTimeout(function(){
                        $('.add-to-home').addClass('add-to-home-visible add-to-home-android');
                        $('#menu-install-pwa-android, .menu-hider').addClass('menu-active')
                    },3000);
                }
            }
        }
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
			var welcomActive = $('#menu-welcome').hasClass('menu-active');
			if (welcomActive) {
				$('#menu-welcome-a-okay').click(showInstallPromotion);
			} else {
				showInstallPromotion();
			}
        });
        $('.pwa-install').on('click',function(e){
          deferredPrompt.prompt();
          deferredPrompt.userChoice
            .then((choiceResult) => {
              if (choiceResult.outcome === 'accepted') {
                log('[pwa] User accepted the A2HS prompt');
              } else {
                log('[pwa] User dismissed the A2HS prompt');
              }
              deferredPrompt = null;
            });
        });
        window.addEventListener('appinstalled', (evt) => {
            $('#menu-install-pwa-android, .menu-hider').removeClass('menu-active')
        });
    }

    if (isMobile.iOS()) {
        if(!isInWebAppiOS){
            log('[pwa] iOS Detected');
            if($('#menu-install-pwa-ios, .add-to-home').length){
                if (!readCookie('Sticky_pwa_rejected_install')) {
					function triggerPwaInstallIos() {
	                    log('[pwa] Triggering PWA / Add to Home Screen Menu for iOS');
	                    setTimeout(function(){
	                        $('.add-to-home').addClass('add-to-home-visible add-to-home-ios');
	                        $('#menu-install-pwa-ios, .menu-hider').addClass('menu-active');
	                    },3000);
					}
					var welcomActive = $('#menu-welcome').hasClass('menu-active');
					if (welcomActive) {
						$('#menu-welcome-a-okay').click(triggerPwaInstallIos);
					} else {
						triggerPwaInstallIos();
					}
                };
            }
        }
    }

    //Reload To Clear Button
    $('body').on('click', '.page-update, .reloadme', function() {
        location.reload();
    });

    //Adding Offline Alerts
    var offlineAlerts = $('.offline-message');

    if(!offlineAlerts.length){
        $('body').append('<p class="offline-message bg-red2-dark color-white center-text uppercase ultrabold">' + strings['inetMsgOffline'] + '</p>');
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
        log('[pwa] Connection: Online');
    }
    function updateOfflineStatus(event) {
        isOffline();
        log('[pwa] Connection: Offline');
    }
    window.addEventListener('online',  updateOnlineStatus);
    window.addEventListener('offline', updateOfflineStatus);



});
