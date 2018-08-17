(function($, window, document, undefined) {
  'use strict';

  var roomTable = (function() {
    var table = $('.rooms_table'),
      rows = $('tbody tr', table),
      selectQuantity = $('.room_quantity select'),
      currencySymbol = '';

    var getCurrencySymbol = function(text) {
      return text.split(/[0-9]/)[0];
    };

    var subtotal = function() {
      var selectQuantity = $(this),
        row = selectQuantity.closest('tr'),
        tdPrice = $('.room_price', row),
        tdSubtotal = $('.room_subtotal', row),
        price = parseFloat(removeCurrencySymbol(tdPrice.text())),
        quantity = parseInt(selectQuantity.val()),
        subtotal = (price * quantity).toFixed(2);

      subtotal = subtotal > 0 ? currencySymbol.concat(subtotal) : 0;
      tdSubtotal.text(subtotal);

      // Get total
      total();
    };

    var total = function() {
      var subtotal = $('.room_subtotal', rows),
        total = 0,
        tdTotal = $('.room_total_text');

      $.each(subtotal, function(index, value) {
        total += parseFloat(removeCurrencySymbol($(value).text()));
      });

      total = total > 0 ? currencySymbol.concat(total.toFixed(2)) : 0;
      tdTotal.text(total);
    };

    var removeCurrencySymbol = function(value) {
      return value.replace(/[^0-9.]/g, '');
    };

    var setup = function() {
      // Subtotal on change number of rooms
      selectQuantity.on('change', subtotal);

      // Get current currency symbol
      currencySymbol = getCurrencySymbol($('.room_price', rows.first()).text());
    };

    var init = function() {
      setup();
    };

    return {
      init: init,
    };
  })();

  roomTable.init();
})(window.jQuery, window, document);
