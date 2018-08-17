/*
 *  jquery-btablesorter - v1.0.0
 *  A simple jQuery plugin to sort tables
 *
 *  Made by Diego Rodrigues Vieira
 */

(function($, window, document, undefined) {
  'use strict';

  var defaults = {
    sortInitialOrder: 'asc', //string : Set the direction to be ordered
  };

  function BTableSorter(element, options) {
    var self = this;

    self.settings = $.extend({}, defaults, options);
    self._defaults = defaults;

    // Table elements
    self.element = element;
    self.$table = $(element);
    self.$thead = $('thead', self.$table);
    self.$th = $('[data-sort="true"]', self.$thead);

    // Current index column
    self.index = 0;

    // Data type
    self.sortType = '';

    // Current order (asc, desc)
    self.order = '';

    self.init();
  }

  $.extend(BTableSorter.prototype, {
    init: function() {
      var self = this;

      // Add class to sortable headers
      self.$th.addClass('sortable');

      self.$th.on('click', function() {
        self.index = $(this).index();
        self.sortType = $(this).data('sort-type');

        var order = $(this).data('sort-order');

        // If data-sort-order is not defined, get initial order
        if (typeof order === 'undefined') {
          $(this).data('sort-order', self.settings.sortInitialOrder);
          self.order = self.settings.sortInitialOrder;
        } else {
          self.order = order;
        }

        // Add class
        self.$th.removeClass('asc desc');
        $(this).addClass(self.order);
        self.sort();

        // Set the next direction to order
        $(this).data('sort-order', self.order === 'asc' ? 'desc' : 'asc');
      });
    },
    sort: function() {
      var self = this,
        $rows = $('tbody tr', self.$table),
        cells = $rows.find('td:nth-of-type( ' + (self.index + 1) + ' )'),
        sortedRows = [],
        unsortedValues = null;

      // Get unsorted values formatted
      switch (self.sortType) {
        case 'integer':
          unsortedValues = cells.map(function() {
            return self.formatInt($(this).text());
          });
          break;

        case 'float':
          unsortedValues = cells.map(function() {
            return self.formatFloat($(this).text());
          });
          break;
        default:
          unsortedValues = cells.map(function() {
            return $(this).text();
          });
      }

      var direction = self.order === 'asc' ? 1 : -1;

      // Merge rows with values
      for (var i = 0, length = unsortedValues.length; i < length; i++) {
        sortedRows.push({
          row: $rows[i],
          value: unsortedValues[i],
        });
      }

      // Sort rows
      sortedRows.sort(function(a, b) {
        if (a.value > b.value) {
          return 1 * direction;
        } else if (a.value < b.value) {
          return -1 * direction;
        } else {
          return 0;
        }
      });

      // Append sorted rows to table
      $.each(sortedRows, function(i, entry) {
        self.$table.append($(entry.row));
      });
    },

    // Format value to integer
    formatInt: function(value) {
      value = value.replace(/\D/g, '');
      return parseInt(value, 10);
    },

    // Format value to float
    formatFloat: function(value) {
      value = value.replace(/[^\d.-]/g, '');
      return parseFloat(value);
    },
  });

  $.fn.btablesorter = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_btablesorter')) {
        $.data(this, 'plugin_btablesorter', new BTableSorter(this, options));
      }
    });
  };
})(window.jQuery, window, document);
