/*!
 * jQuery HOLA !
 *
 * https://github.com/romainbessugesmeusy/hola
 *
 * Copyright 2013, 2014 Romain Bessuges
 * Released under the MIT license
 *
 * Date: 2013-31-12T14:30Z
 */
jQuery.fn.hola = function (optionsOrMethod, pane) {

    var methods = {
        slideTo: function (pane) {
            return this.each(function () {
                $(this).find('> .hola-wrapper > .hola-pane').removeClass('hola-current');
                $(this).find('> .hola-wrapper').find(pane).addClass('hola-current');
                $(this).hola('update');
            })
        },
        update:  function () {
            return this.each(function () {
                var $main = $(this),
                    data = $main.data("hola"),
                    x = 0,
                    $dom,
                    wrapperX = 0,
                    i = 0,
                    cnt = data.elements.length,
                    el,
                    $resizeBar;

                if (data.isFullscreen) {
                    var $w = jQuery(window);
                    $main.height($w.height());
                    $main.width($w.width());
                }

                var mHeight = $main.height(),
                    mWidth = $main.width();

                for (i; i < cnt; i++) {
                    el = data.elements[i];
                    $dom = $(el.dom);
                    $resizeBar = $dom.find('+ .hola-resize-bar');
                    var css = {
                        height:   mHeight,
                        position: 'absolute',
                        left:     x
                    };

                    if ($dom.hasClass('hola-current')) {
                        wrapperX = -x;
                    }

                    if (el.width === 'auto') {
                        css.width = mWidth;
                        x += mWidth;
                    } else {
                        css.width = el.width;
                        x += el.width
                    }

                    if (cnt > 1 && i > 0 && el.width == 'auto' &&
                        data.elements[i - 1].width != 'auto' &&
                        $(data.elements[i - 1].dom).hasClass('hola-current')
                        ) {
                        css.width = mWidth - data.elements[i - 1].width
                    }
                    if ($resizeBar.length > 0) {
                        $resizeBar.height(mHeight);
                        $resizeBar.css({left: x});
                        x += $resizeBar.outerWidth();
                    }

                    $dom.css(css);
                }


                data.wrapper.animate({"left": wrapperX});
            });
        }
    };

    if (methods[optionsOrMethod]) {
        return methods[ optionsOrMethod ].apply(this, Array.prototype.slice.call(arguments, 1));
    }


    var settings = jQuery.extend({}, jQuery.fn.hola.defaults, optionsOrMethod);


    function createResizeBar() {
        var $resizeBar = jQuery('<div class="hola-resize-bar"></div>');
        $resizeBar.on('mousedown', jQuery.fn.hola.dragHelpers.startDrag);
        return $resizeBar[0];
    }

    return this.each(function () {

        var $main = jQuery(this),
            $panes = $main.find('> .hola-pane'),
            $wrapper = jQuery('<div class="hola-wrapper"></div>'),
            elements = [],
            isFullscreen = $main.hasClass('hola-fullscreen');

        $main.css({
            overflow: 'hidden',
            position: 'relative'
        });

        $wrapper.css({
            position: 'relative'
        });

        if (isFullscreen) {
            $main.css({
                position: 'absolute',
                left:     0,
                top:      0,
                margin:   0,
                padding:  0,
                width:    '100%'
            });
        }

        $panes.each(function () {
            var $pane = jQuery(this),
                id,
                el = {
                    dom:      this,
                    width:    $pane.hasClass('hola-auto') ? 'auto' : $pane.outerWidth(),
                    maxWidth: $pane.css('max-width'),
                    minWidth: $pane.css('min-width')
                };

            $pane.css({
                overflowY: 'scroll'
            });

            el.maxWidth = (el.maxWidth == 'none') ? null : parseInt(el.maxWidth);
            el.minWidth = (el.minWidth == '0px') ? null : parseInt(el.minWidth);

            elements.push(el);

            if (id = $pane.attr('id')) {
                jQuery.fn.hola.registry[id] = $pane[0];
            }

            $wrapper.append(this);
            if (jQuery(this).hasClass('hola-resizable')) {
                var resizeBar = createResizeBar();
                $wrapper.append(resizeBar);
            }
        });

        $main.empty().append($wrapper);

        $main.data('hola', {
            elements:     elements,
            isFullscreen: isFullscreen,
            wrapper:      $wrapper,
            settings:     settings
        });

        $main.hola('update');
        $(window).load(function () {
            $main.hola('update');
        });

        if (isFullscreen) {
            $(window).resize(function () {
                $main.hola('update');
            });
        }
    });
};


jQuery.fn.hola.defaults = {
    refreshRate:   500,
    createWrapper: true
};

jQuery.fn.hola.dragHelpers = {
    $resizeBar:    null,
    $resizedPane:  null,
    $main:         null,
    $wrapper:      null,
    el:            null,
    wrapperOffset: null,
    offset:        null,
    startX:        null,
    left:          null,

    startDrag:                function (event) {
        jQuery.fn.hola.dragHelpers.initDocumentListeners();
        jQuery.fn.hola.dragHelpers.$resizeBar = $(event.target);
        jQuery.fn.hola.dragHelpers.$resizedPane = jQuery.fn.hola.dragHelpers.$resizeBar.prev('.hola-pane');
        jQuery.fn.hola.dragHelpers.$main = jQuery.fn.hola.dragHelpers.$resizeBar.closest('.hola-main');
        jQuery.fn.hola.dragHelpers.$wrapper = jQuery.fn.hola.dragHelpers.$main.find('> .hola-wrapper');
        jQuery.fn.hola.dragHelpers.offset = parseInt(jQuery.fn.hola.dragHelpers.$main.offset().left);
        jQuery.fn.hola.dragHelpers.wrapperOffset = parseInt(jQuery.fn.hola.dragHelpers.$wrapper.css('left'));
        jQuery.fn.hola.dragHelpers.startX = parseInt(jQuery.fn.hola.dragHelpers.$resizeBar.css('left'));
    },
    initDocumentListeners:    function () {
        $(document)
            .on('mouseup', jQuery.fn.hola.dragHelpers.documentMouseUpHandler)
            .on('mousemove', jQuery.fn.hola.dragHelpers.documentMouseMoveHandler)
            .on('selectstart', jQuery.fn.hola.dragHelpers.cancelSelection);

        document.body.style.MozUserSelect = "none";
    },
    removeDocumentListeners:  function () {
        $(document)
            .off('mouseup', jQuery.fn.hola.dragHelpers.documentMouseUpHandler)
            .off('mousemove', jQuery.fn.hola.dragHelpers.documentMouseMoveHandler)
            .off('selectstart', jQuery.fn.hola.dragHelpers.cancelSelection);

        document.body.style.MozUserSelect = "";
    },
    documentMouseUpHandler:   function (event) {
        jQuery.fn.hola.dragHelpers.removeDocumentListeners();
        jQuery(jQuery.fn.hola.dragHelpers.$main.data('hola').elements).each(function (i, el) {
            if (el.dom === jQuery.fn.hola.dragHelpers.$resizedPane[0]) {
                el.width += jQuery.fn.hola.dragHelpers.left - jQuery.fn.hola.dragHelpers.startX;

                if(el.width < 0){
                    el.width = 0;
                }

                if (el.minWidth != null && el.width < el.minWidth) {
                    el.width = el.minWidth;
                }
                if (el.maxWidth != null && el.width > el.maxWidth) {
                    el.width = el.maxWidth;
                }
            }
        });
        jQuery.fn.hola.dragHelpers.$main.hola('update');
    },
    documentMouseMoveHandler: function (event) {
        var dh = jQuery.fn.hola.dragHelpers;
        jQuery.fn.hola.dragHelpers.left = event.pageX - dh.offset - dh.wrapperOffset;
        jQuery.fn.hola.dragHelpers.$resizeBar.css({
            left: jQuery.fn.hola.dragHelpers.left
        });
    },
    cancelSelection:          function (event) {
        event.preventDefault && event.preventDefault();
        event.stopPropagation && event.stopPropagation();
        event.returnValue = false;
        return false;
    }
};

jQuery.fn.hola.registry = {

};