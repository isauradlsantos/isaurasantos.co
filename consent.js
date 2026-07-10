(function () {
  'use strict';

  var CONSENT_KEY = 'isaura-cookie-consent';
  var LEGACY_TWNYA_KEY = 'twnya_cookies_accepted_v1';
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

  function updateGoogleConsent(granted) {
    if (!window.gtag) {
      return;
    }
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied'
    });
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

  function applyConsent(consent) {
    if (consent === 'accepted') {
      updateGoogleConsent(true);
      loadMetaPixel();
      return;
    }
    updateGoogleConsent(false);
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
      applyConsent('accepted');
      hideBanner(banner);
    });

    document.getElementById('cookie-deny').addEventListener('click', function () {
      setConsent('denied');
      applyConsent('denied');
      hideBanner(banner);
    });

    showBanner(banner);
  }

  function init() {
    var consent = getConsent();
    if (consent === 'accepted' || consent === 'denied') {
      applyConsent(consent);
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
