(function($) {

    /**
     * Copyright 2012, Digital Fusion
     * Licensed under the MIT license.
     * http://teamdf.com/jquery-plugins/license/
     *
     * @author Sam Sehnert
     * @desc A small plugin that checks whether elements are within
     *     the user visible viewport of a web browser.
     *     only accounts for vertical position, not horizontal.
     */
  
    $.fn.visible = function(partial) {
  
        var $t            = $(this),
            $w            = $(window),
            viewTop       = $w.scrollTop(),
            viewBottom    = viewTop + $w.height(),
            _top          = $t.offset().top,
            _bottom       = _top + $t.height(),
            compareTop    = partial === true ? _bottom : _top,
            compareBottom = partial === true ? _top : _bottom;
  
      return ((compareBottom <= viewBottom) && (compareTop >= viewTop));
  
    };
  
})(jQuery);
  
$(window).scroll(function(event) {
  
      $(".scrollright").each(function(i, el) {
          var el = $(el);
          if (el.visible(true)) {
              el.addClass("come-in-right");
          }
      });
  
      $(".scrollleft").each(function(i, el) {
          var el = $(el);
          if(el.visible(true)) {
              el.addClass("come-in-left");
          }
      });
  
      $(".scrollup").each(function(i, el) {
          var el = $(el);
          if(el.visible(true)) {
              el.addClass("come-in");
          }
      });
  
  });
  
  var win = $(window);
  var allModsRight = $(".scrollright");
  var allModsLeft = $(".scrollleft");
  var allModsUp = $(".scrollup");
  
  // Already visible modules
  allModsRight.each(function(i, el) {
    var el = $(el);
    if (el.visible(true)) {
      el.addClass("already-visible");
    }
  });
  
  allModsLeft.each(function(i, el) {
    var el = $(el);
    if (el.visible(true)) {
      el.addClass("already-visible");
    }
  });
  
  allModsUp.each(function(i, el) {
    var el = $(el);
    if (el.visible(true)) {
      el.addClass("already-visible");
    }
  });
  
  win.scroll(function(event) {
  
    allModsRight.each(function(i, el) {
      var el = $(el);
      if (el.visible(true)) {
        el.addClass("come-in-right");
      }
    });
  
    allModsLeft.each(function(i, el) {
      var el = $(el);
      if (el.visible(true)) {
        el.addClass("come-in-left");
      }
    });
  
    allModsUp.each(function(i, el) {
      var el = $(el);
      if (el.visible(true)) {
        el.addClass("come-in-left");
      }
    });
  
  });
  