/*
 * Country code picker for every .phone-input (intl-tel-input v18.2.1, loaded locally).
 * Each phone input names its hidden country-code field via data-countrycode-id,
 * e.g. <input class="phone-input" data-countrycode-id="qCountryCode4">
 *      <input type="hidden" id="qCountryCode4" name="country_code" value="+91">
 * The hidden field always holds the selected dial code ("+91", "+971", ...),
 * which the form integration reads through SenderControlCountryCodeID.
 */
(function () {
    'use strict';
    if (typeof window.intlTelInput !== 'function') return;

    // The plugin measures the flag box to set the input's left padding, so its CSS must be
    // applied first. index.html loads that CSS without blocking render and fires 'iti-css-ready'.
    var css = document.getElementById('itiCss');
    if (css && !css.getAttribute('data-ready')) {
        document.addEventListener('iti-css-ready', init, { once: true });
    } else {
        init();
    }

    function init() {
    var inputs = document.querySelectorAll('.phone-input');
    Array.prototype.forEach.call(inputs, function (input) {
        var hidden = document.getElementById(input.getAttribute('data-countrycode-id'));

        var iti = window.intlTelInput(input, {
            initialCountry: 'in',
            preferredCountries: ['in', 'ae', 'us', 'gb', 'sg', 'sa', 'qa', 'kw', 'om', 'au', 'ca'],
            separateDialCode: true,
            autoPlaceholder: 'off',
            formatOnDisplay: false
        });

        function syncCode() {
            var data = iti.getSelectedCountryData();
            if (hidden && data && data.dialCode) hidden.value = '+' + data.dialCode;
        }

        input.addEventListener('countrychange', syncCode);
        // digits only, max 15 (E.164 limit)
        input.addEventListener('input', function () {
            var clean = input.value.replace(/\D/g, '').slice(0, 15);
            if (clean !== input.value) input.value = clean;
        });

        syncCode();
        input.iti = iti;
    });
    }
})();
