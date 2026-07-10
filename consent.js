(function () {
  'use strict';

  var CONSENT_KEY = 'isaura-cookie-consent';
  var LEGACY_TWNYA_KEY = 'twnya_cookies_accepted_v1';
  var GA_ID = 'G-M788KL9WG9';
  var META_PIXEL_ID = '1292622612797075';

  function isTwnyaPage() {
    return window.location.pathname.indexOf('/twnya') === 0;
  }

  function getPolicyUrl() {
    return isTwnyaPage() ? '/twnya/cookies.html' : '/cookie-policy.html';
  }

  function getConsent() {
    var consent = localStorage.getItem(CONSENT_KEY);
    if (consent === 'accepted' || consent === 'denied') {
      return consent;
    }
    if (localStorage.getItem(LEGACY_TWNYA_KEY) === 'true') {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      localStorage.removeItem(LEGACY_TWNYA_KEY);
      return 'accepted';
    }
    return null;
  }

  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
    localStorage.removeItem(LEGACY_TWNYA_KEY);
  }

  function loadGoogleAnalytics() {
    if (window.__gaLoaded) {
      return;
    }
    window.__gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);
  }

  function loadMetaPixel() {
    if (window.__metaPixelLoaded || !isTwnyaPage()) {
      return;
    }
    window.__metaPixelLoaded = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) {
        return;
      }
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) {
        f._fbq = n;
      }
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function loadTracking() {
    loadGoogleAnalytics();
    loadMetaPixel();
  }

  function hideBanner(banner) {
    banner.style.display = 'none';
    banner.classList.remove('is-visible');
  }

  function showBanner(banner) {
    banner.style.display = 'flex';
    requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });
  }

  function createBanner() {
    var banner = document.createElement('div');
    var twnya = isTwnyaPage();
    banner.id = 'cookie-banner';
    banner.className = twnya ? 'cookie-banner cookie-banner--twnya' : 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');

    var message = twnya
      ? 'TWNYA uses cookies to understand traffic and improve this site. Accept or deny non-essential cookies. Read the '
      : 'i use cookies to understand how visitors use this site. opt into or reject non-essential cookies. read the ';

    banner.innerHTML =
      '<p>' + message + '<a href="' + getPolicyUrl() + '">cookie policy</a>.</p>' +
      '<div class="cookie-actions">' +
      '<button type="button" id="cookie-accept">accept non-essential</button>' +
      '<button type="button" id="cookie-deny" class="cookie-deny">deny non-essential</button>' +
      '</div>';

    document.body.appendChild(banner);

    document.getElementById('cookie-accept').addEventListener('click', function () {
      setConsent('accepted');
      loadTracking();
      hideBanner(banner);
    });

    document.getElementById('cookie-deny').addEventListener('click', function () {
      setConsent('denied');
      hideBanner(banner);
    });

    showBanner(banner);
  }

  function init() {
    var consent = getConsent();
    if (consent === 'accepted') {
      loadTracking();
      return;
    }
    if (consent === 'denied') {
      return;
    }
    if (document.body) {
      createBanner();
    } else {
      document.addEventListener('DOMContentLoaded', createBanner);
    }
  }

  init();
})();
