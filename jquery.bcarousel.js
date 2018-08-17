/*
 *  jquery.bcarousel - v1.0.0
 *  A jQuery plugin to display slide images
 *
 *  Made by Diego Rodrigues Vieira
 */

(function($, window, document, undefined) {
  'use strict';

  var defaults = {
    loop: true, //bool : Set the carousel in loop autoplay mode.
    autoPlay: true, //bool : Set automatic slide rotation.
    autoPlayTimeOut: 4000, //int  : Set autoplay interval timeout.
    animationSpeed: 600, //int  : Set the speed of animations, in milliseconds.

    // User experience
    spOnAction: true, //bool : Stop on action in thumbnails or control nav.
    stopOnHover: true, //bool : Stop on mouse hover.
    stopOnFocusOut: true, //bool : Stop when browser slider tab is not visible, lower CPU usage.

    // Nav controls
    nav: true, //bool   : Show next/prev buttons.
    navigationText: ['Previous', 'Next'], //string : Set the text for navigation. HTML allowed.
    thumbs: true, //bool   : Set events to thumbnails.

    // Information
    captions: true, //bool : Show captions, alt attribute is required on the images.

    // Extra direction nav
    keyboard: true, //bool : Enable navigation with keyboard arrows.
  };

  function BCarousel(element, options) {
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;

    // Slider elements
    this.element = element;
    this.$sliderWrapper = $(element);
    this.$sliderWrapperItems = $('.bcarousel-items', this.$sliderWrapper);

    // Wrap slider items with viewport element
    this.$sliderWrapperItems.wrap('<div class="bcarousel-viewport"></div>');

    this.$sliderViewport = $('.bcarousel-viewport', this.$sliderWrapper);
    this.$slides = $('.bcarousel-item', this.$sliderWrapper);
    this.$thumbnails = $('.bcarousel-thumbs > li', this.$sliderWrapper);

    this.currentSlide = 0;

    this.totalSlides = this.$slides.length;

    this.stopped = false;

    this.animating = false;

    // Indicates if the user is on the slider tab in the browser
    this.focused = true;

    this.playing = false;

    this.nextSlide = this.currentSlide;

    this.lastSlide = this.totalSlides - 1;

    // Indicates whether the user is browsing manually between slides
    this.manualAction = false;

    this.interval = null;

    this.init();
  }

  $.extend(BCarousel.prototype, {
    init: function() {
      var self = this;

      // Show current slide
      self.$slides
        .css({ opacity: 0, display: 'block', zIndex: 1 })
        .eq(self.currentSlide)
        .css({ zIndex: 2, opacity: 1 });

      // Set active slide class
      self.$slides
        .removeClass('bcarousel-active')
        .eq(self.currentSlide)
        .addClass('bcarousel-active');

      // Direction nav
      if (self.settings.nav) {
        self.buildDirectionNav();
      }

      // Captions
      if (self.settings.captions) {
        self.buildCaptions();
      }

      // Thumbnails
      if (self.settings.thumbs) {
        self.buildThumbnails();
      }

      // Check if slider tab browser is focused
      if (self.settings.stopOnFocusOut) {
        self.checkFocusTab();
      }

      // Check mouse hover
      self.checkMouseHover();

      // Keyboard extra direction nav
      if (self.settings.keyboard) {
        self.enableKeyboards();
      }
      // Enable automatic slide rotation
      if (self.settings.autoPlay) {
        self.play();
      }
    },
    checkFocusTab: function() {
      var self = this;

      $(window)
        .blur(function() {
          self.focused = false;
        })
        .focus(function() {
          self.focused = true;
        });
    },
    checkMouseHover: function() {
      var self = this;

      if (self.settings.autoPlay) {
        if (self.settings.stopOnHover) {
          self.$sliderViewport.on({
            mouseenter: function() {
              self.pause();
            },
            mouseleave: function() {
              if (!self.stopped) {
                self.play();
              }
            },
          });
        }
      }
    },
    stop: function() {
      var self = this;

      self.pause();
      self.stopped = true;
    },
    pause: function() {
      var self = this;

      clearInterval(self.interval);
      self.interval = null;
      self.playing = false;
    },
    play: function() {
      var self = this;

      if (self.playing) {
        clearInterval(self.interval);
      }

      self.interval =
        self.interval ||
        setInterval(function() {
          self.animate();
        }, self.settings.autoPlayTimeOut);

      self.playing = true;
    },
    animate: function() {
      var self = this;

      if (!self.animating && self.focused) {
        self.go(self.getTarget('next'));
      }
    },
    getTarget: function(direction) {
      var self = this;

      if (direction === 'next') {
        return self.currentSlide === self.lastSlide ? 0 : self.currentSlide + 1;
      } else {
        return self.currentSlide === 0 ? self.lastSlide : self.currentSlide - 1;
      }
    },
    go: function(target, stop) {
      var self = this;

      // If target is equal current slide, nothing to do
      if (target === self.currentSlide) {
        return;
      }

      if (
        (self.currentSlide === 0 && target === self.lastSlide) ||
        (self.currentSlide === self.lastSlide && target === 0)
      ) {
        if (!self.settings.loop) {
          self.pause();
          return;
        }
      }

      self.animating = true;
      self.nextSlide = target;
      if (stop) {
        self.stop();
      }

      // Set active slide class
      self.$slides
        .removeClass('bcarousel-active')
        .eq(target)
        .addClass('bcarousel-active');

      // Update nav class
      if (self.settings.nav) {
        self.updateDirectionNav();
      }

      self.$slides
        .eq(self.currentSlide)
        .css({ zIndex: 1 })
        .stop()
        .animate({ opacity: 0 }, self.settings.animationSpeed);

      self.$slides
        .eq(target)
        .css({ zIndex: 2 })
        .stop()
        .animate({ opacity: 1 }, self.settings.animationSpeed, self.reset());
    },
    reset: function() {
      var self = this;

      self.animating = false;
      self.currentSlide = self.nextSlide;

      if (self.settings.thumbs) {
        self.updateThumbnails(self.currentSlide);
      }

      if (self.manualAction && !self.stopped && !self.settings.stopOnHover) {
        self.manualAction = false;
        self.pause();
        self.play();
      }
    },
    buildDirectionNav: function() {
      var self = this;

      var directionNavHTML =
        '<ul class="bcarousel-direction-nav">' +
        '<li class="bcarousel-nav-prev">' +
        '<a class="bcarousel-prev" href="#">' +
        self.settings.navigationText[0] +
        '</a>' +
        '</li>' +
        '<li class="bcarousel-nav-next">' +
        '<a class="bcarousel-next" href="#">' +
        self.settings.navigationText[1] +
        '</a>' +
        '</li>' +
        '</ul>';

      self.$sliderViewport.append(directionNavHTML);
      self.$nav = $('.bcarousel-direction-nav li a', self.$sliderWrapper);

      self.$nav.on('click', function(event) {
        event.preventDefault();
        var target;

        if ($(this).hasClass('bcarousel-next')) {
          target = self.getTarget('next');
        } else {
          target = self.getTarget('prev');
        }

        self.manualAction = true;
        self.go(target, self.settings.stopOnAction);
      });

      self.updateDirectionNav();
    },
    updateDirectionNav: function() {
      var self = this,
        disabledClass = 'bcarousel-nav-disabled';

      if (self.totalSlides === 1) {
        self.$nav.addClass(disabledClass);
      } else if (!self.settings.loop) {
        if (self.nextSlide === 0) {
          self.$nav
            .removeClass(disabledClass)
            .filter('.bcarousel-prev')
            .addClass(disabledClass);
        } else if (self.nextSlide === self.lastSlide) {
          self.$nav
            .removeClass(disabledClass)
            .filter('.bcarousel-next')
            .addClass(disabledClass);
        } else {
          self.$nav.removeClass(disabledClass);
        }
      } else {
        self.$nav.removeClass(disabledClass);
      }
    },
    buildCaptions: function() {
      var self = this;

      $.each(self.$slides, function(key, slide) {
        var $slide = $(slide);
        var caption = $slide.find('img:first-child').attr('alt');
        if (caption) {
          caption = $('<p/>', {
            class: 'bcarousel-caption',
            html: caption,
          });
          $slide.append(caption);
        }
      });
    },
    buildThumbnails: function() {
      var self = this;

      self.$thumbnails.on('click', function(event) {
        event.preventDefault();
        var target = $(this).index();
        self.manualAction = true;
        self.go(target, self.settings.stopOnAction);
      });

      self.updateThumbnails(self.currentSlide);
    },
    updateThumbnails: function() {
      var self = this;

      self.$thumbnails
        .removeClass('bcarousel-thumb-active')
        .eq(self.currentSlide)
        .addClass('bcarousel-thumb-active');
    },
    enableKeyboards: function() {
      var self = this,
        target;

      $(window).keydown(function(event) {
        if (/input|textarea|select/i.test(event.target.tagName)) {
          return;
        }

        switch (event.which) {
          case 37:
            target = self.getTarget('prev');
            break;
          case 39:
            target = self.getTarget('next');
            break;
          default:
            return;
        }

        self.manualAction = true;
        self.go(target, self.settings.stopOnAction);
        event.preventDefault();
      });
    },
  });

  $.fn.bcarousel = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_bcarousel')) {
        $.data(this, 'plugin_bcarousel', new BCarousel(this, options));
      }
    });
  };
})(window.jQuery, window, document);
