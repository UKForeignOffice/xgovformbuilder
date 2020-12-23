// used by the cookie banner component

(function (root) {
    'use strict'
    window.GOVUK = window.GOVUK || {}

    var DEFAULT_COOKIE_CONSENT = {
        'essential': true,
        'settings': false,
        'usage': false
    }

    var COOKIE_CATEGORIES = {
        'access_token': 'essential',
        'seen_cookie_message': 'essential',
        'cookie_preferences_set': 'essential',
        'cookies_preferences_set': 'essential',
        '_email-alert-frontend_session': 'essential',
        'licensing_session': 'essential',
        'govuk_contact_referrer': 'essential',
        'dgu_beta_banner_dismissed': 'settings',
        'global_bar_seen': 'settings',
        'govuk_browser_upgrade_dismisssed': 'settings',
        'govuk_not_first_visit': 'settings',
        'analytics_next_page_call': 'usage',
        '_ga': 'usage',
        '_gid': 'usage',
        '_gat': 'usage',
        'JS-Detection': 'usage',
        'TLSversion': 'usage',
        '_pk_ref': 'usage',
        '_pk_cvr': 'usage',
        '_pk_id': 'usage',
        '_pk_ses': 'usage'
    }

    /*
      Cookie methods
      ==============

      Usage:

        Setting a cookie:
        GOVUK.cookie('hobnob', 'tasty', { days: 30 });

        Reading a cookie:
        GOVUK.cookie('hobnob');

        Deleting a cookie:
        GOVUK.cookie('hobnob', null);
    */
    window.GOVUK.cookie = function (name, value, options) {
        if (typeof value !== 'undefined') {
            if (value === false || value === null) {
                return window.GOVUK.setCookie(name, '', { days: -1 })
            } else {
                // Default expiry date of 30 days
                if (typeof options === 'undefined') {
                    options = { days: 30 }
                }
                return window.GOVUK.setCookie(name, value, options)
            }
        } else {
            return window.GOVUK.getCookie(name)
        }
    }

    window.GOVUK.savePreferencesSelected = function () {
        //get values from preferences check boxes and save to session
        var essential = true;
        var usage = (document.getElementById("radio-web_cookie-1").checked) ? true : false;
        var settings = (document.getElementById("radio-settings-cookie-1").checked) ? true : false;

        var consent = {
            'essential': essential,
            'usage': usage,
            'settings': settings
        };

        window.GOVUK.userProvidedConsent(consent);
    }

    window.GOVUK.setDefaultConsentCookie = function () {
        window.GOVUK.setConsentCookie(DEFAULT_COOKIE_CONSENT);
    }

    window.GOVUK.approveAllCookieTypes = function () {
        var approvedConsent = {
            'essential': true,
            'settings': true,
            'usage': true,
        }
 //       window.GOVUK.cookie('cookies_preferences_set', 'true', { days: 365 })
        window.GOVUK.setCookie('cookies_policy', JSON.stringify(approvedConsent), { days: 365 })

//        var message = document.getElementById('accept-cookies-message');
//        var confirmation_message = document.getElementById('confirmation-cookie-message');

//        message.style.display = 'none';
//        confirmation_message.style.display = 'block';
    }

    window.GOVUK.userProvidedConsent = function (options) {
        //used when user sets preferences to call setCookieConsent
        window.GOVUK.setConsentCookie(options);
        window.GOVUK.cookie('cookies_preferences_set', 'true', {days: 365});
    }

    window.GOVUK.showCookieBanner = function(){
        var message = document.getElementById('global-cookie-message'),
            hasCookieMessage = (message &&  window.GOVUK.cookie('cookies_preferences_set') !== 'true');
        var onCookiesPage = window.location.pathname === '/cookies';

        //display cookie banner if it hasnt been seen before and not in the cookie screen
        if (hasCookieMessage && !onCookiesPage) {
            message.style.display = 'block';
            window.GOVUK.cookie('seen_cookie_message', 'yes', {days: 28});
        }
        else{
            message.style.display = 'none';
        }
    }

    window.GOVUK.hideConfirmationBanner = function () {
        var confirmation_message = document.getElementById('confirmation-cookie-message');
        confirmation_message.style.display = 'none';
        window.GOVUK.cookie('cookies_preferences_set', 'true', { days: 365 })
    }

    window.GOVUK.getConsentCookie = function () {
        var consentCookie = window.GOVUK.cookie('cookies_policy')
        var consentCookieObj

        if (consentCookie) {
            try {
                consentCookieObj = JSON.parse(consentCookie)
            } catch (err) {
                return null
            }

            if (typeof consentCookieObj !== 'object' && consentCookieObj !== null) {
                consentCookieObj = JSON.parse(consentCookieObj)
            }
        } else {
            return null
        }

        return consentCookieObj
    }

    window.GOVUK.setConsentCookie = function (options) {
        var cookieConsent = window.GOVUK.getConsentCookie()

        if (!cookieConsent) {
            cookieConsent = JSON.parse(JSON.stringify(DEFAULT_COOKIE_CONSENT))
        }

        for (var cookieType in options) {
            cookieConsent[cookieType] = options[cookieType]

            if(JSON.stringify(cookieConsent.usage) != true) {
                _paq.push(['disableCookies']);
            }
            else
            {
            }
            // Delete cookies of that type if consent being set to false
            if (!options[cookieType]) {
                for (var cookie in COOKIE_CATEGORIES) {
                    if (COOKIE_CATEGORIES[cookie] === cookieType) {
                        window.GOVUK.deleteCookie(cookie)
                    }
                }
            }
            window.GOVUK.setCookie('cookies_policy', JSON.stringify(cookieConsent), {days: 365});
        }
    }

    window.GOVUK.checkConsentCookieCategory = function (cookieName, cookieCategory) {
        var currentConsentCookie = window.GOVUK.getConsentCookie()

        // If the consent cookie doesn't exist, but the cookie is in our known list, return true
        if (!currentConsentCookie && COOKIE_CATEGORIES[cookieName]) {
            return true
        }

        currentConsentCookie = window.GOVUK.getConsentCookie()

        // Sometimes currentConsentCookie is malformed in some of the tests, so we need to handle these
        try {
            return currentConsentCookie[cookieCategory]
        } catch (e) {
            console.error(e)
            return false
        }
    }

    window.GOVUK.checkConsentCookie = function (cookieName, cookieValue) {

        // If we're setting the consent cookie OR deleting a cookie, allow by default
        if (cookieName === 'cookies_policy' || (cookieValue === null || cookieValue === false)) {
            return true
        }

        // Survey cookies are dynamically generated, so we need to check for these separately
        if (cookieName.match('^govuk_surveySeen') || cookieName.match('^govuk_taken')) {
            return window.GOVUK.checkConsentCookieCategory(cookieName, 'settings')
        }

        if (COOKIE_CATEGORIES[cookieName]) {
            var cookieCategory = COOKIE_CATEGORIES[cookieName]

            return window.GOVUK.checkConsentCookieCategory(cookieName, cookieCategory)
        } else {
            // Deny the cookie if it is not known to us
            return false
        }
    }

    window.GOVUK.setCookie = function (name, value, options) {
        if (window.GOVUK.checkConsentCookie(name, value)) {
            if (typeof options === 'undefined') {
                options = {}
            }
            var cookieString = name + '=' + value + '; path=/'
            if (options.days) {
                var date = new Date()
                date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000))
                cookieString = cookieString + '; expires=' + date.toGMTString()
            }
            if (document.location.protocol === 'https:') {
                cookieString = cookieString + '; Secure'
            }
            document.cookie = cookieString
        }
    }

    window.GOVUK.getCookie = function (name) {

        var nameEQ = name + '='
        var cookies = document.cookie.split(';')
        for (var i = 0, len = cookies.length; i < len; i++) {
            var cookie = cookies[i]
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length)
            }
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length))
            }
        }
        return null
    }

    window.GOVUK.getCookieCategory = function (cookie) {

        return COOKIE_CATEGORIES[cookie]
    }

    window.GOVUK.disableMatomo = function(currentConsent){
        if(JSON.stringify(currentConsent.usage) === "false")
        {
            _paq.push(['disableCookies']);
        }
        else
        {
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
        }
    }

    window.GOVUK.deleteCookie = function (cookie) {
        window.GOVUK.cookie(cookie, null);
        if (window.GOVUK.cookie(cookie)) {
            // We need to handle deleting cookies on the domain and the .domain
            document.cookie = cookie + '=;expires=' + new Date() + ';'
            document.cookie = cookie + '=;expires=' + new Date() + ';domain=' + window.location.hostname + ';path=/'
        }
    }

    window.GOVUK.deleteUnconsentedCookies = function () {
        var currentConsent = window.GOVUK.getConsentCookie();
        if(JSON.stringify(currentConsent.usage) === "false")    {
            _paq.push(['disableCookies']);

        }
        for (var cookieType in currentConsent) {
            // Delete cookies of that type if consent being set to false
            if (!currentConsent[cookieType]) {
                for (var cookie in COOKIE_CATEGORIES) {
                    if (COOKIE_CATEGORIES[cookie] === cookieType) {
                        window.GOVUK.deleteCookie(cookie)
                    }
                }
            }
        }
    }
}(window))
