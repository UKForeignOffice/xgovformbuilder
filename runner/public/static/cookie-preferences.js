'use strict'

var GOVUK = GOVUK || {};

var browser = {
    isIe: function () {
        return navigator.appVersion.indexOf("MSIE") != -1;
    },
    navigator: navigator.appVersion,
    getVersion: function () {
        var version = 999; // we assume a sane browser
        if (navigator.appVersion.indexOf("MSIE") != -1) {
            // bah, IE again, lets downgrade version number
            version = parseFloat(navigator.appVersion.split("MSIE")[1]);
        }
        return version;
    }
};

$(document).ready(function () {

    $('#accept-all-cookies').click(function (event) {
        if (browser.isIe() && browser.getVersion() <= 9) {
            return true;
        }
        GOVUK.approveAllCookieTypes();
        //remove cookie banner when called (button pressed)
    });

    $('#hide-confirmation').click(function (event) {
        if (browser.isIe() && browser.getVersion() <= 9) {
            return true;
        }
        GOVUK.hideConfirmationBanner();
    });

    $('#preference-cookies').click(function (event) {
        if (browser.isIe() && browser.getVersion() <= 9) {
            return true;
        }
        //redirects to cookie screen, could maybe be a new tab instead
        window.location = "/cookies";
    });

    $('#save-cookie-changes').click(function (event) {
        if (browser.isIe() && browser.getVersion() <= 9) {
            return true;
        }
        //save selections onclick of save button
        GOVUK.savePreferencesSelected();
        window.location.href = '/';
    });

//Display cookie banner(if required)
    GOVUK.showCookieBanner();

//set default/essential cookies if policy not set (user hasnt accepted all)
    if (!GOVUK.cookie('cookies_preferences_set')) {
        GOVUK.setDefaultConsentCookie();
    }
//disable matomo if required
    GOVUK.disableMatomo(GOVUK.getConsentCookie());

    var currentConsent = GOVUK.getConsentCookie();

    if (typeof (currentConsent) != 'undefined' && currentConsent.usage == true) {
        $("#radio-web_cookie-1").prop('checked', true);
    } else {
        $("#radio-web_cookie-2").prop('checked', true);
    }

    if (typeof (currentConsent) != 'undefined' && currentConsent.settings == true) {
        $("#radio-settings-cookie-1").prop('checked', true);
    } else {
        $("#radio-settings-cookie-2").prop('checked', true);
    }

});

function refreshPage() {
    window.location.reload(false);
};

