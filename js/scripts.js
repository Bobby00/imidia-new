
window.mr = window.mr || {};

mr = (function (mr, $, window, document){
    "use strict";

    mr = mr || {};

    var components = {documentReady: [],documentReadyDeferred: [], windowLoad: [], windowLoadDeferred: []};

    mr.status = {documentReadyRan: false, windowLoadPending: false};

    $(document).ready(documentReady);
    $(window).on("load", windowLoad);

    function documentReady(context){

        context = typeof context === typeof undefined ? $ : context;
        components.documentReady.concat(components.documentReadyDeferred).forEach(function(component){
            component(context);
        });
        mr.status.documentReadyRan = true;
        if(mr.status.windowLoadPending){
            windowLoad(mr.setContext());
        }
    }

    function windowLoad(context){
        if(mr.status.documentReadyRan){
            mr.status.windowLoadPending = false;
            context = typeof context === "object" ? $ : context;
            components.windowLoad.concat(components.windowLoadDeferred).forEach(function(component){
               component(context);
            });
        }else{
            mr.status.windowLoadPending = true;
        }
    }

    mr.setContext = function (contextSelector){
        var context = $;
        if(typeof contextSelector !== typeof undefined){
            return function(selector){
                return $(contextSelector).find(selector);
            };
        }
        return context;
    };

    mr.components    = components;
    mr.documentReady = documentReady;
    mr.windowLoad    = windowLoad;

    return mr;
}(window.mr, jQuery, window, document));


//////////////// Utility Functions
mr = (function (mr, $, window, document){
    "use strict";
    mr.util = {};

    mr.util.requestAnimationFrame    = window.requestAnimationFrame ||
                                       window.mozRequestAnimationFrame ||
                                       window.webkitRequestAnimationFrame ||
                                       window.msRequestAnimationFrame;

    mr.util.documentReady = function($){
        var today = new Date();
        var year = today.getFullYear();
        $('.update-year').text(year);
    };

    mr.util.windowLoad = function($){
        $('[data-delay-src]').each(function(){
            var $el = $(this);
            $el.attr('src', $el.attr('data-delay-src'));
            $el.removeAttr('data-delay-src');
        });
    };

    mr.util.getURLParameter = function(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [undefined, ""])[1].replace(/\+/g, '%20')) || null;
    };


    mr.util.capitaliseFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    mr.util.slugify = function(text, spacesOnly){
        if(typeof spacesOnly !== typeof undefined){
            return text.replace(/ +/g, '');
        }else{
            return text
                .toLowerCase()
                .replace(/[\~\!\@\#\$\%\^\&\*\(\)\-\_\=\+\]\[\}\{\'\"\;\\\:\?\/\>\<\.\,]+/g, '')
                .replace(/ +/g, '-');
        }
    };

    mr.util.sortChildrenByText = function(parentElement, reverse){
        var $parentElement = $(parentElement);
        var items          = $parentElement.children().get();
        var order          = -1;
        var order2         = 1;
        if(typeof reverse !== typeof undefined){order = 1; order2 = -1;}

        items.sort(function(a,b){
          var keyA = $(a).text();
          var keyB = $(b).text();

          if (keyA < keyB) return order;
          if (keyA > keyB) return order2;
          return 0;
        });

        // Append back into place
        $parentElement.empty();
        $(items).each(function(i, itm){
          $parentElement.append(itm);
        });
    };

    // Set data-src attribute of element from src to be restored later
    mr.util.idleSrc = function(context, selector){

            selector  = (typeof selector !== typeof undefined) ? selector : '';
            var elems = context.is(selector+'[src]') ? context : context.find(selector+'[src]');

        elems.each(function(index, elem){
            elem           = $(elem);
            var currentSrc = elem.attr('src'),
                dataSrc    = elem.attr('data-src');

            // If there is no data-src, save current source to it
            if(typeof dataSrc === typeof undefined){
                elem.attr('data-src', currentSrc);
            }

            // Clear the src attribute
            elem.attr('src', '');

        });
    };

    // Set src attribute of element from its data-src where it was temporarily stored earlier
    mr.util.activateIdleSrc = function(context, selector){

        selector     = (typeof selector !== typeof undefined) ? selector : '';
        var elems    = context.is(selector+'[data-src]') ? context : context.find(selector+'[data-src]');

        elems.each(function(index, elem){
            elem = $(elem);
            var dataSrc    = elem.attr('data-src');

            // Write the 'src' attribute using the 'data-src' value
            elem.attr('src', dataSrc);
        });
    };

    mr.util.pauseVideo = function(context){
        var elems = context.is('video') ? context : context.find('video');

        elems.each(function(index, video){
            var playingVideo = $(video).get(0);
            playingVideo.pause();
        });
    };

    // Take a text value in either px (eg. 150px) or vh (eg. 65vh) and return a number in pixels.
    mr.util.parsePixels = function(text){
        var windowHeight = $(window).height(), value;

        // Text text against regular expression for px value.
        if(/^[1-9]{1}[0-9]*[p][x]$/.test(text)){
            return parseInt(text.replace('px', ''),10);
        }
        // Otherwise it is vh value.
        else if(/^[1-9]{1}[0-9]*[v][h]$/.test(text)){
            value = parseInt(text.replace('vh', ''),10);
            // Return conversion to percentage of window height.
            return windowHeight * (value/100);
        }else{
            // If it is not proper text, return -1 to indicate bad value.
            return -1;
        }
    };

    mr.util.removeHash = function() {
        // Removes hash from URL bar without reloading and without losing search query
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }

    mr.components.documentReady.push(mr.util.documentReady);
    mr.components.windowLoad.push(mr.util.windowLoad);
    return mr;

}(mr, jQuery, window, document));

//////////////// Window Functions
mr = (function (mr, $, window, document){
    "use strict";

    mr.window = {};
    mr.window.height = $(window).height();
    mr.window.width = $(window).width();

    $(window).on('resize',function(){
        mr.window.height = $(window).height();
        mr.window.width = $(window).width();
    });

    return mr;
}(mr, jQuery, window, document));


//////////////// Scroll Functions
mr = (function (mr, $, window, document){
    "use strict";


    mr.scroll           = {};
    var raf             = window.requestAnimationFrame ||
                          window.mozRequestAnimationFrame ||
                          window.webkitRequestAnimationFrame ||
                          window.msRequestAnimationFrame;
    mr.scroll.listeners = [];
    mr.scroll.busy      = false;
    mr.scroll.y         = 0;
    mr.scroll.x         = 0;

    var documentReady = function($){

        //////////////// Capture Scroll Event and fire scroll function
        jQuery(window).off('scroll.mr');
        jQuery(window).on('scroll.mr', function(evt) {
                if(mr.scroll.busy === false){

                    mr.scroll.busy = true;
                    raf(function(evt){
                        mr.scroll.update(evt);
                    });

                }
                if(evt.stopPropagation){
                    evt.stopPropagation();
                }
        });

    };

    mr.scroll.update = function(event){

        // Loop through all mr scroll listeners
        var parallax = typeof window.mr_parallax !== typeof undefined ? true : false;
        mr.scroll.y = (parallax ? mr_parallax.mr_getScrollPosition() : window.pageYOffset);
        mr.scroll.busy = false;
        if(parallax){
            mr_parallax.mr_parallaxBackground();
        }


        if(mr.scroll.listeners.length > 0){
            for (var i = 0, l = mr.scroll.listeners.length; i < l; i++) {
               mr.scroll.listeners[i](event);
            }
        }

    };

    mr.scroll.documentReady = documentReady;

    mr.components.documentReady.push(documentReady);

    return mr;

}(mr, jQuery, window, document));


//////////////// Scroll Class Modifier
mr = (function (mr, $, window, document){
    "use strict";

    mr.scroll.classModifiers = {};
    // Globally accessible list of elements/rules
    mr.scroll.classModifiers.rules = [];

    mr.scroll.classModifiers.parseScrollRules = function(element){
        var text  = element.attr('data-scroll-class'),
            rules = text.split(";");

        rules.forEach(function(rule){
            var ruleComponents, scrollPoint, ruleObject = {};
            ruleComponents = rule.replace(/\s/g, "").split(':');
            if(ruleComponents.length === 2){
                scrollPoint = mr.util.parsePixels(ruleComponents[0]);
                if(scrollPoint > -1){
                    ruleObject.scrollPoint = scrollPoint;
                    if(ruleComponents[1].length){
                        var toggleClass = ruleComponents[1];
                        ruleObject.toggleClass = toggleClass;
                        // Set variable in object to indicate that element already has class applied
                        ruleObject.hasClass = element.hasClass(toggleClass);
                        ruleObject.element = element.get(0);
                        mr.scroll.classModifiers.rules.push(ruleObject);
                    }else{
                        // Error: toggleClass component does not exist.
                        //console.log('Error - toggle class not found.');
                        return false;
                    }
                }else{
                    // Error: scrollpoint component was malformed
                    //console.log('Error - Scrollpoint not found.');
                    return false;
                }
            }
        });

        if(mr.scroll.classModifiers.rules.length){
            return true;
        }else{
            return false;
        }
    };

    mr.scroll.classModifiers.update = function(event){
        var currentScroll = mr.scroll.y,
            scrollRules   = mr.scroll.classModifiers.rules,
            l             = scrollRules.length,
            currentRule;

        // Given the current scrollPoint, check for necessary changes
        while(l--) {

            currentRule = scrollRules[l];

            if(currentScroll > currentRule.scrollPoint && !currentRule.hasClass){
                // Set local copy and glogal copy at the same time;
                currentRule.element.classList.add(currentRule.toggleClass);
                currentRule.hasClass = mr.scroll.classModifiers.rules[l].hasClass = true;
            }
            if(currentScroll < currentRule.scrollPoint && currentRule.hasClass){
                // Set local copy and glogal copy at the same time;
                currentRule.element.classList.remove(currentRule.toggleClass);
                currentRule.hasClass = mr.scroll.classModifiers.rules[l].hasClass = false;
            }
        }
    };

    var fixedElementSizes = function(){
        $('.main-container [data-scroll-class*="pos-fixed"]').each(function(){
            var element = $(this);
            element.css('max-width',element.parent().outerWidth());
            element.parent().css('min-height',element.outerHeight());
        });
    };

    var documentReady = function($){
        // Collect info on all elements that require class modification at load time
        // Each element has data-scroll-class with a formatted value to represent class to add/remove at a particular scroll point.
        $('[data-scroll-class]').each(function(){
            var element  = $(this);

            // Test the rules to be added to an array of rules.
            if(!mr.scroll.classModifiers.parseScrollRules(element)){
                console.log('Error parsing scroll rules on: '+element);
            }
        });

        // For 'position fixed' elements, give them a max-width for correct fixing behaviour
        fixedElementSizes();
        $(window).on('resize', fixedElementSizes);

        // If there are valid scroll rules add classModifiers update function to the scroll event processing queue.
        if(mr.scroll.classModifiers.rules.length){
            mr.scroll.listeners.push(mr.scroll.classModifiers.update);
        }
    };

    mr.components.documentReady.push(documentReady);
    mr.scroll.classModifiers.documentReady = documentReady;



    return mr;

}(mr, jQuery, window, document));


//////////////// Accordions
mr = (function (mr, $, window, document){
    "use strict";

    mr.accordions = mr.accordions || {};

    mr.accordions.documentReady = function($){
        $('.accordion__title').on('click', function(){
            mr.accordions.activatePanel($(this));
        });

        $('.accordion').each(function(){
            var accordion = $(this);
            var minHeight = accordion.outerHeight(true);
            accordion.css('min-height',minHeight);
        });

        if(window.location.hash !== '' && window.location.hash !== '#'){
            if($('.accordion li'+$(this).attr('href')).length){
                 mr.accordions.activatePanelById(window.location.hash, true);
            }
        }

        jQuery(document).on('click', 'a[href^="#"]:not(a[href="#"])', function(){

             if($('.accordion > li > .accordion__title'+$(this).attr('href')).length){
                mr.accordions.activatePanelById($(this).attr('href'), true);
             }
        });
    };



    mr.accordions.activatePanel = function(panel, forceOpen){

        var $panel    = $(panel),
            accordion = $panel.closest('.accordion'),
            li        = $panel.closest('li'),
            openEvent = document.createEvent('Event'),
            closeEvent = document.createEvent('Event');

            openEvent.initEvent('panelOpened.accordions.mr', true, true);
            closeEvent.initEvent('panelClosed.accordions.mr', true, true);



        if(li.hasClass('active')){

            if(forceOpen !== true){

                li.removeClass('active');
                $panel.trigger('panelClosed.accordions.mr').get(0).dispatchEvent(closeEvent);
            }
        }else{

            if(accordion.hasClass('accordion--oneopen')){

                var wasActive = accordion.find('li.active');
                if(wasActive.length){
                    wasActive.removeClass('active');
                    wasActive.trigger('panelClosed.accordions.mr').get(0).dispatchEvent(closeEvent);
                }
                li.addClass('active');
                li.trigger('panelOpened.accordions.mr').get(0).dispatchEvent(openEvent);

            }else{

                if(!li.is('.active')){
                    li.trigger('panelOpened.accordions.mr').get(0).dispatchEvent(openEvent);
                }
                li.addClass('active');
            }
        }
    };

    mr.accordions.activatePanelById = function(id, forceOpen){
        var panel;

        if(id !== '' && id !== '#'){
            panel = $('.accordion > li > .accordion__title#'+id.replace('#', ''));
            if(panel.length){
                $('html, body').stop(true).animate({
                    scrollTop: (panel.offset().top - 50)
                }, 1200);

                mr.accordions.activatePanel(panel, forceOpen);
            }
        }
    };

    mr.components.documentReady.push(mr.accordions.documentReady);
    return mr;

}(mr, jQuery, window, document));


//////////////// Alerts
mr = (function (mr, $, window, document){
    "use strict";

    mr.alerts = mr.alerts || {};

    mr.alerts.documentReady = function($){
        $('.alert__close').on('click touchstart', function(){
            jQuery(this).closest('.alert').addClass('alert--dismissed');
        });
    };

    mr.components.documentReady.push(mr.alerts.documentReady);
    return mr;

}(mr, jQuery, window, document));


//////////////// Backgrounds
mr = (function (mr, $, window, document){
    "use strict";

    mr.backgrounds = mr.backgrounds || {};

    mr.backgrounds.documentReady = function($){

        //////////////// Append .background-image-holder <img>'s as CSS backgrounds

	    $('.background-image-holder').each(function() {
	        var imgSrc = $(this).children('img').attr('src');
	        $(this).css('background', 'url("' + imgSrc + '")').css('background-position', 'initial').css('opacity','1');
	    });
    };

    mr.components.documentReady.push(mr.backgrounds.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Bars
mr = (function (mr, $, window, document){
    "use strict";

    mr.bars = mr.bars || {};

    mr.bars.documentReady = function($){
        $('.nav-container .bar[data-scroll-class*="fixed"]:not(.bar--absolute)').each(function(){
            var bar = $(this),
                barHeight = bar.outerHeight(true);
            bar.closest('.nav-container').css('min-height',barHeight);
        });
    };

    mr.components.documentReady.push(mr.bars.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Cookies
mr = (function (mr, $, window, document){
    "use strict";

    mr.cookies = {

        getItem: function (sKey) {
            if (!sKey) { return null; }
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },
        setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
                var sExpires = "";
                if (vEnd) {
                  switch (vEnd.constructor) {
                    case Number:
                      sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                      break;
                    case String:
                      sExpires = "; expires=" + vEnd;
                      break;
                    case Date:
                      sExpires = "; expires=" + vEnd.toUTCString();
                      break;
                }
            }
            document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            return true;
        },
        removeItem: function (sKey, sPath, sDomain) {
            if (!this.hasItem(sKey)) { return false; }
            document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
            return true;
        },
        hasItem: function (sKey) {
            if (!sKey) { return false; }
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        },
        keys: function () {
            var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
            return aKeys;
        }
    };

    return mr;

}(mr, jQuery, window, document));

//////////////// Countdown
mr = (function (mr, $, window, document){
    "use strict";

    mr.countdown = mr.countdown || {};
    mr.countdown.options = mr.countdown.options || {};

    mr.countdown.documentReady = function($){

        $('.countdown[data-date]').each(function(){
            var element      = $(this),
                date         = element.attr('data-date'),
                daysText     = typeof element.attr('data-days-text') !== typeof undefined ? '%D '+element.attr('data-days-text')+' %H:%M:%S': '%D days %H:%M:%S',
                daysText     = typeof mr.countdown.options.format !== typeof undefined ? mr.countdown.options.format : daysText,
                dateFormat   = typeof element.attr('data-date-format') !== typeof undefined ? element.attr('data-date-format'): daysText,

                fallback;

            if(typeof element.attr('data-date-fallback') !== typeof undefined){
                fallback = element.attr('data-date-fallback') || "Timer Done";
            }

            element.countdown(date, function(event) {
                if(event.elapsed){
                    element.text(fallback);
                }else{
                    element.text(
                      event.strftime(dateFormat)
                    );
                }
            });
        });

    };

    mr.components.documentReadyDeferred.push(mr.countdown.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Datepicker
mr = (function (mr, $, window, document){
    "use strict";

    mr.datepicker = mr.datepicker || {};

    var options = mr.datepicker.options || {};

    mr.datepicker.documentReady = function($){
        if($('.datepicker').length){
            $('.datepicker').pickadate(options);
        }
    };

    mr.components.documentReadyDeferred.push(mr.datepicker.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Dropdowns
mr = (function (mr, $, window, document){
    "use strict";

    mr.dropdowns = mr.dropdowns || {};

    mr.dropdowns.done = false;

    mr.dropdowns.documentReady = function($){

        var rtl = false;

        if($('html[dir="rtl"]').length){
            rtl = true;
        }

        if(!mr.dropdowns.done){
            jQuery(document).on('click','body:not(.dropdowns--hover) .dropdown:not(.dropdown--hover), body.dropdowns--hover .dropdown.dropdown--click',function(event){
                var dropdown = jQuery(this);
                if(jQuery(event.target).is('.dropdown--active > .dropdown__trigger')){
                    dropdown.siblings().removeClass('dropdown--active').find('.dropdown').removeClass('dropdown--active');
                    dropdown.toggleClass('dropdown--active');
                }else{
                    $('.dropdown--active').removeClass('dropdown--active');
                    dropdown.addClass('dropdown--active');
                }
            });
            jQuery(document).on('click touchstart', 'body:not(.dropdowns--hover)', function(event){
                if(!jQuery(event.target).is('[class*="dropdown"], [class*="dropdown"] *')){
                    $('.dropdown--active').removeClass('dropdown--active');
                }
            });
            jQuery('body.dropdowns--hover .dropdown').on('click', function(event){
                event.stopPropagation();
                var hoverDropdown = jQuery(this);
                hoverDropdown.toggleClass('dropdown--active');
            });

            // Append a container to the body for measuring purposes
            jQuery('body').append('<div class="container containerMeasure" style="opacity:0;pointer-events:none;"></div>');




            // Menu dropdown positioning
            if(rtl === false){
                mr.dropdowns.repositionDropdowns($);
                jQuery(window).on('resize', function(){mr.dropdowns.repositionDropdowns($);});
            }else{
                mr.dropdowns.repositionDropdownsRtl($);
                jQuery(window).on('resize', function(){mr.dropdowns.repositionDropdownsRtl($);});
            }

            mr.dropdowns.done = true;
        }
    };

    mr.dropdowns.repositionDropdowns = function($){
        $('.dropdown__container').each(function(){
            var container, containerOffset, masterOffset, menuItem, content;

                jQuery(this).css('left', '');

                container       = jQuery(this);
                containerOffset = container.offset().left;
                masterOffset    = jQuery('.containerMeasure').offset().left;
                menuItem        = container.closest('.dropdown').offset().left;
                content         = null;

                container.css('left',((-containerOffset)+(masterOffset)));

                if(container.find('.dropdown__content:not([class*="md-12"])').length){
                    content = container.find('.dropdown__content');
                    content.css('left', ((menuItem)-(masterOffset)));
                }

        });
        $('.dropdown__content').each(function(){
            var dropdown, offset, width, offsetRight, winWidth, leftCorrect;

                dropdown    = jQuery(this);
                offset      = dropdown.offset().left;
                width       = dropdown.outerWidth(true);
                offsetRight = offset + width;
                winWidth    = jQuery(window).outerWidth(true);
                leftCorrect = jQuery('.containerMeasure').outerWidth() - width;

            if(offsetRight > winWidth){
                dropdown.css('left', leftCorrect);
            }

        });
    };

    mr.dropdowns.repositionDropdownsRtl = function($){

        var windowWidth = jQuery(window).width();

        $('.dropdown__container').each(function(){
            var container, containerOffset, masterOffset, menuItem, content;

                jQuery(this).css('left', '');

                container   = jQuery(this);
                containerOffset = windowWidth - (container.offset().left + container.outerWidth(true));
                masterOffset    = jQuery('.containerMeasure').offset().left;
                menuItem        = windowWidth - (container.closest('.dropdown').offset().left + container.closest('.dropdown').outerWidth(true));
                content         = null;

                container.css('right',((-containerOffset)+(masterOffset)));

                if(container.find('.dropdown__content:not([class*="md-12"])').length){
                    content = container.find('.dropdown__content');
                    content.css('right', ((menuItem)-(masterOffset)));
                }
        });
        $('.dropdown__content').each(function(){
            var dropdown, offset, width, offsetRight, winWidth, rightCorrect;

                dropdown    = jQuery(this);
                offset      = windowWidth - (dropdown.offset().left + dropdown.outerWidth(true));
                width       = dropdown.outerWidth(true);
                offsetRight = offset + width;
                winWidth    = jQuery(window).outerWidth(true);
                rightCorrect = jQuery('.containerMeasure').outerWidth() - width;

            if(offsetRight > winWidth){
               dropdown.css('right', rightCorrect);
            }

        });
    };


    mr.components.documentReady.push(mr.dropdowns.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Forms

mr = (function (mr, $, window, document){
    "use strict";

    mr.forms                 = mr.forms || {};
    mr.forms.captcha         = {};
    mr.forms.captcha.widgets = [];
    mr.forms.captcha.done    = false;

    mr.forms.documentReady = function($){

        mr.forms.captcha.widgets = [];

        /// Checkbox & Radio Inputs

        $('.input-checkbox input[type="checkbox"], .input-radio input[type="radio"]').each(function(index){
            var input = $(this),
                label = input.siblings('label'),
                id    = "input-assigned-"+index;
            if(typeof input.attr('id') === typeof undefined || input.attr('id') === ""){
                input.attr('id',id);
                label.attr('for',id);
            }else{
                id = input.attr('id');
                label.attr('for',id);
            }
        });

        //////////////// Number Inputs

        $('.input-number__controls > span').off('click.mr').on('click.mr',function(){
            var control = jQuery(this),
                parent   = control.closest('.input-number'),
                input    = parent.find('input[type="number"]'),
                max      = input.attr('max'),
                min      = input.attr('min'),
                step     = 1,
                current  = parseInt(input.val(),10);

            if(parent.is('[data-step]')){
                step = parseInt(parent.attr('data-step'),10);
            }

            if(control.hasClass('input-number__increase')){
                if((current+step) <= max){
                    input.val(current+step);
                }
            }else{
                if((current-step) >= min){
                    input.val(current-step);
                }
            }
        });


        //////////////// File Uploads

        $('.input-file .btn').off('click.mr').on('click.mr',function(){
            $(this).siblings('input').trigger('click');
            return false;
        });

        //////////////// Handle Form Submit

        $('form.form-email, form[action*="list-manage.com"], form[action*="createsend.com"]').attr('novalidate', true).off('submit').on('submit', mr.forms.submit);

        //////////////// Handle Form Submit
        $(document).on('change, input, paste, keyup', '.attempted-submit .field-error', function(){
            $(this).removeClass('field-error');
        });

         //////////////// Check forms for Google reCaptcha site keys

        $('form[data-recaptcha-sitekey]:not([data-recaptcha-sitekey=""])').each(function(){
            var $thisForm    = jQuery(this),
                $captchaDiv  = $thisForm.find('div.recaptcha'),
                $insertBefore, $column, widgetObject,  $script, scriptSrc, widgetColourTheme, widgetSize;

            widgetColourTheme = $thisForm.attr('data-recaptcha-theme');
            widgetColourTheme = typeof widgetColourTheme !== typeof undefined ? widgetColourTheme : '';

            widgetSize = $thisForm.attr('data-recaptcha-size');
            widgetSize = typeof widgetSize !== typeof undefined ? widgetSize : '';

            // Store the site key for later use
            mr.forms.captcha.sitekey = $thisForm.attr('data-recaptcha-sitekey');

            if($captchaDiv.length){
                // If a div.recaptcha was already present on this form, do nothing at this stage,
                // It will be populated with a captcha widget later.
            }else{
                // Create a captcha div and insert it before the submit button.
                $insertBefore = $thisForm.find('button[type=submit]').closest('[class*="col-"]');
                $captchaDiv   = jQuery('<div>').addClass('recaptcha');
                $column       = jQuery('<div>').addClass('col-xs-12').append($captchaDiv);
                $column.insertBefore($insertBefore);
            }


            // Add the widget div to the widgets array
            widgetObject = {
                element:    $captchaDiv.get(0),
                parentForm: $thisForm,
                theme:      widgetColourTheme,
                size:       widgetSize,
            };



            mr.forms.captcha.widgets.push(widgetObject);

            // mr.forms.captcha.done indicates whether the api script has been appended yet.
            if(mr.forms.captcha.done === false){
                if(!jQuery('script[src*="recaptcha/api.js"]').length){
                    $script   = jQuery('<script async defer>');
                    scriptSrc = 'https://www.google.com/recaptcha/api.js?onload=mrFormsCaptchaInit&render=explicit';
                    $script.attr('src', scriptSrc);
                    jQuery('body').append($script);
                    mr.forms.captcha.done = true;
                }
            }else{
                if(typeof grecaptcha !== typeof undefined){
                    mr.forms.captcha.renderWidgets();
                }
            }

        });


    };

    mr.forms.submit = function(e){
        // return false so form submits through jQuery rather than reloading page.
        if (e.preventDefault) e.preventDefault();
        else e.returnValue = false;

        var body          = $('body'),
            thisForm      = $(e.target).closest('form'),
            formAction    = typeof thisForm.attr('action') !== typeof undefined ? thisForm.attr('action') : "",
            submitButton  = thisForm.find('button[type="submit"], input[type="submit"]'),
            error         = 0,
            originalError = thisForm.attr('original-error'),
            captchaUsed   = thisForm.find('div.recaptcha').length ? true:false,
            successRedirect, formError, formSuccess, errorText, successText;

        body.find('.form-error, .form-success').remove();
        submitButton.attr('data-text', submitButton.text());
        errorText = thisForm.attr('data-error') ? thisForm.attr('data-error') : "Please fill all fields correctly";
        successText = thisForm.attr('data-success') ? thisForm.attr('data-success') : "Thanks, we'll be in touch shortly";
        body.append('<div class="form-error" style="display: none;">' + errorText + '</div>');
        body.append('<div class="form-success" style="display: none;">' + successText + '</div>');
        formError = body.find('.form-error');
        formSuccess = body.find('.form-success');
        thisForm.addClass('attempted-submit');

        // Do this if the form is intended to be submitted to MailChimp or Campaign Monitor
        if (formAction.indexOf('createsend.com') !== -1 || formAction.indexOf('list-manage.com') !== -1 ) {

            console.log('Mail list form signup detected.');
            if (typeof originalError !== typeof undefined && originalError !== false) {
                formError.html(originalError);
            }

            // validateFields returns 1 on error;
            if (mr.forms.validateFields(thisForm) !== 1) {

                thisForm.removeClass('attempted-submit');

                // Hide the error if one was shown
                formError.fadeOut(200);
                // Create a new loading spinner in the submit button.
                submitButton.addClass('btn--loading');

                try{
                    $.ajax({
                        url: thisForm.attr('action'),
                        crossDomain: true,
                        data: thisForm.serialize(),
                        method: "GET",
                        cache: false,
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        success: function(data){
                            // Request was a success, what was the response?

                            if (data.result !== "success" && data.Status !== 200) {

                                // Got an error from Mail Chimp or Campaign Monitor

                                // Keep the current error text in a data attribute on the form
                                formError.attr('original-error', formError.text());
                                // Show the error with the returned error text.
                                formError.html(data.msg).stop(true).fadeIn(1000);
                                formSuccess.stop(true).fadeOut(1000);

                                submitButton.removeClass('btn--loading');
                            } else {

                                // Got success from Mail Chimp or Campaign Monitor

                                submitButton.removeClass('btn--loading');

                                successRedirect = thisForm.attr('data-success-redirect');
                                // For some browsers, if empty `successRedirect` is undefined; for others,
                                // `successRedirect` is false.  Check for both.
                                if (typeof successRedirect !== typeof undefined && successRedirect !== false && successRedirect !== "") {
                                    window.location = successRedirect;
                                }else{
                                    mr.forms.resetForm(thisForm);
                                    mr.forms.showFormSuccess(formSuccess, formError, 1000, 5000, 500);
                                }
                            }
                        }
                    });
                }catch(err){
                    // Keep the current error text in a data attribute on the form
                    formError.attr('original-error', formError.text());
                    // Show the error with the returned error text.
                    formError.html(err.message);
                    mr.forms.showFormError(formSuccess, formError, 1000, 5000, 500);

                    submitButton.removeClass('btn--loading');
                }



            } else {
                // There was a validation error - show the default form error message
                mr.forms.showFormError(formSuccess, formError, 1000, 5000, 500);
            }
        } else {
            // If no MailChimp or Campaign Monitor form was detected then this is treated as an email form instead.
            if (typeof originalError !== typeof undefined && originalError !== false) {
                formError.text(originalError);
            }

            error = mr.forms.validateFields(thisForm);

            if (error === 1) {
                mr.forms.showFormError(formSuccess, formError, 1000, 5000, 500);
            } else {

                thisForm.removeClass('attempted-submit');

                // Hide the error if one was shown
                formError.fadeOut(200);

                // Create a new loading spinner in the submit button.
                submitButton.addClass('btn--loading');

                jQuery.ajax({
                    type: "POST",
                    url: (formAction !== "" ? formAction : "mail/mail.php"),
                    data: thisForm.serialize()+"&url="+window.location.href+"&captcha="+captchaUsed,
                    success: function(response) {
                        // Swiftmailer always sends back a number representing number of emails sent.
                        // If this is numeric (not Swift Mailer error text) AND greater than 0 then show success message.

                        submitButton.removeClass('btn--loading');

                        if ($.isNumeric(response)) {
                            if (parseInt(response,10) > 0) {
                                // For some browsers, if empty 'successRedirect' is undefined; for others,
                                // 'successRedirect' is false.  Check for both.
                                successRedirect = thisForm.attr('data-success-redirect');
                                if (typeof successRedirect !== typeof undefined && successRedirect !== false && successRedirect !== "") {
                                    window.location = successRedirect;
                                }

                                mr.forms.resetForm(thisForm);
                                mr.forms.showFormSuccess(formSuccess, formError, 1000, 5000, 500);
                                mr.forms.captcha.resetWidgets();
                            }
                        }
                        // If error text was returned, put the text in the .form-error div and show it.
                        else {
                            // Keep the current error text in a data attribute on the form
                            formError.attr('original-error', formError.text());
                            // Show the error with the returned error text.
                            formError.text(response).stop(true).fadeIn(1000);
                            formSuccess.stop(true).fadeOut(1000);
                        }
                    },
                    error: function(errorObject, errorText, errorHTTP) {
                        // Keep the current error text in a data attribute on the form
                        formError.attr('original-error', formError.text());
                        // Show the error with the returned error text.
                        formError.text(errorHTTP).stop(true).fadeIn(1000);
                        formSuccess.stop(true).fadeOut(1000);
                        submitButton.removeClass('btn--loading');
                    }
                });
            }
        }
        return false;
    };

    mr.forms.validateFields = function(form) {
        var body = $(body),
            error = false,
            originalErrorMessage,
            name,
            thisElement;

            form = $(form);




        form.find('.validate-required[type="checkbox"]').each(function() {
            var checkbox = $(this);
            if (!$('[name="' + $(this).attr('name') + '"]:checked').length) {
                error = 1;
                name = $(this).attr('data-name') ||  'check';
                checkbox.parent().addClass('field-error');
                //body.find('.form-error').text('Please tick at least one ' + name + ' box.');
            }
        });

        form.find('.validate-required, .required, [required]').not('input[type="checkbox"]').each(function() {
            if ($(this).val() === '') {
                $(this).addClass('field-error');
                error = 1;
            } else {
                $(this).removeClass('field-error');
            }
        });

        form.find('.validate-email, .email, [name*="cm-"][type="email"]').each(function() {
            if (!(/(.+)@(.+){2,}\.(.+){2,}/.test($(this).val()))) {
                $(this).addClass('field-error');
                error = 1;
            } else {
                $(this).removeClass('field-error');
            }
        });

        form.find('.validate-number-dash').each(function() {
            if (!(/^[0-9][0-9-]+[0-9]$/.test($(this).val()))) {
                $(this).addClass('field-error');
                error = 1;
            } else {
                $(this).removeClass('field-error');
            }
        });

        // Validate recaptcha
        if(form.find('div.recaptcha').length && typeof form.attr('data-recaptcha-sitekey') !== typeof undefined){
            thisElement = $(form.find('div.recaptcha'));

            if(grecaptcha.getResponse(form.data('recaptchaWidgetID')) !== ""){
                thisElement.removeClass('field-error');
            }else{
                thisElement.addClass('field-error');
                error = 1;
            }
        }

        if (!form.find('.field-error').length) {
            body.find('.form-error').fadeOut(1000);
        }else{

            var firstError = $(form).find('.field-error:first');

            if(firstError.length){
                $('html, body').stop(true).animate({
                    scrollTop: (firstError.offset().top - 100)
                }, 1200, function(){firstError.focus();});
            }
        }



        return error;
    };

    mr.forms.showFormSuccess = function(formSuccess, formError, fadeOutError, wait, fadeOutSuccess){

        formSuccess.stop(true).fadeIn(fadeOutError);

        formError.stop(true).fadeOut(fadeOutError);
        setTimeout(function() {
            formSuccess.stop(true).fadeOut(fadeOutSuccess);
        }, wait);
    };

    mr.forms.showFormError = function(formSuccess, formError, fadeOutSuccess, wait, fadeOutError){

        formError.stop(true).fadeIn(fadeOutSuccess);

        formSuccess.stop(true).fadeOut(fadeOutSuccess);
        setTimeout(function() {
            formError.stop(true).fadeOut(fadeOutError);
        }, wait);
    };

    // Reset form to empty/default state.
    mr.forms.resetForm = function(form){
        form = $(form);
        form.get(0).reset();
        form.find('.input-radio, .input-checkbox').removeClass('checked');
        form.find('[data-default-value]').filter('[type="text"],[type="number"],[type="email"],[type="url"],[type="search"],[type="tel"]').each(function(){
            var elem = jQuery(this);
            elem.val(elem.attr('data-default-value'));
        });

    };

    // Defined on the window scope as the recaptcha js api seems not to be able to call function in mr scope
    window.mrFormsCaptchaInit = function(){
        mr.forms.captcha.renderWidgets();
    };

    mr.forms.captcha.renderWidgets = function(){
        mr.forms.captcha.widgets.forEach(function(widget){
            if(widget.element.innerHTML === ''){
                widget.id = grecaptcha.render(widget.element, {
                    'sitekey' : mr.forms.captcha.sitekey,
                    'theme' : widget.theme,
                    'size' : widget.size,
                    'callback' : mr.forms.captcha.setHuman
                });
                widget.parentForm.data('recaptchaWidgetID', widget.id);
            }
        });
    };

    mr.forms.captcha.resetWidgets = function(){
        mr.forms.captcha.widgets.forEach(function(widget){
            grecaptcha.reset(widget.id);
        });
    };

    mr.forms.captcha.setHuman = function(){
        jQuery('div.recaptcha.field-error').removeClass('field-error');
    };

    mr.components.documentReadyDeferred.push(mr.forms.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Granim
mr = (function (mr, $, window, document){
    "use strict";

    mr.granim = mr.granim || {};

    mr.granim.documentReady = function($){
    	$('[data-gradient-bg]').each(function(index,element){
    		var granimParent = $(this),
    			granimID 	 = 'granim-'+index+'',
				colours 	 = granimParent.attr('data-gradient-bg'),
				pairs        = [],
				tempPair     = [],
                ao           = {},
				count,
				passes,
				i,
                themeDefaults,

                options;

			// Canvas element forms the gradient background
			granimParent.prepend('<canvas id="'+granimID+'"></canvas>');

            // Regular expression to match comma separated list of hex colour values
            passes = /^(#[0-9|a-f|A-F]{6}){1}([ ]*,[ ]*#[0-9|a-f|A-F]{6})*$/.test(colours);

            if(passes === true){
            	colours = colours.replace(' ','');
            	colours = colours.split(',');
            	count = colours.length;
            	// If number of colours is odd - duplicate last colour to make even array
            	if(count%2 !== 0){
            		colours.push(colours[count-1]);
            	}
            	for(i = 0; i < (count/2); i++){
                    tempPair = [];
                    tempPair.push(colours.shift());
                    tempPair.push(colours.shift());
                    pairs.push(tempPair);
            	}

                // attribute overrides - allows per-gradient override of global options.
                ao.states = {
                    "default-state": {
                        gradients: pairs
                    }
                }
            }

            themeDefaults = {
                element: '#'+granimID,
                name: 'basic-gradient',
                direction: 'left-right',
                opacity: [1, 1],
                isPausedWhenNotInView: true,
                states : {
                    "default-state": {
                        gradients: pairs
                    }
                }
            };

            options = jQuery.extend({}, themeDefaults, mr.granim.options, ao);
            $(this).data('gradientOptions', options);
    		var granimElement = $(this);
    		var granimInstance = new Granim(options);
    	});
    };

    mr.components.documentReadyDeferred.push(mr.granim.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Instagram
mr = (function (mr, $, window, document){
    "use strict";

    mr.instagram = mr.instagram || {};

    mr.instagram.documentReady = function($){

        var themeDefaults, options, ao = {};

        if($('.instafeed').length){

            // Replace with your own Access Token and Client ID
            var token  = '4079540202.b9b1d8a.1d13c245c68d4a17bfbff87919aaeb14',
                client = 'b9b1d8ae049d4153b24a6332f0088686',
                elementToken, elementClient;

            if($('.instafeed[data-access-token][data-client-id]').length){
                elementToken = $('.instafeed[data-access-token][data-client-id]').first().attr('data-access-token');
                elementClient = $('.instafeed[data-access-token][data-client-id]').first().attr('data-client-id');

                if(elementToken !== ""){token = elementToken;}
                if(elementClient !== ""){client = elementClient;}
            }

            jQuery.fn.spectragram.accessData = {
                accessToken: token,
                clientID: client
            };
        }

        $('.instafeed').each(function(){
            var feed   = $(this),
                feedID = feed.attr('data-user-name'),
                fetchNumber = 12;

            themeDefaults = {
                query: 'mediumrarethemes',
                max: 12
            };

            // Attribute Overrides taken from data attributes allow for per-feed customization
            ao.max = feed.attr('data-amount')
            ao.query = feed.attr('data-user-name');

            options = jQuery.extend({}, themeDefaults, mr.instagram.options, ao);

            feed.append('<ul></ul>');
            feed.children('ul').spectragram('getUserFeed', options);
        });
    };

    mr.components.documentReadyDeferred.push(mr.instagram.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Maps
mr = (function (mr, $, window, document){
    "use strict";

    mr.maps = mr.maps || {};
    mr.maps.options = mr.maps.options || {};

    mr.maps.documentReady = function($){
        // Interact with Map once the user has clicked (to prevent scrolling the page = zooming the map

        $('.map-holder').on('click', function() {
            $(this).addClass('interact');
        }).removeClass('interact');

        var mapsOnPage = $('.map-container[data-maps-api-key]');
        if(mapsOnPage.length){
            mapsOnPage.addClass('gmaps-active');
            mr.maps.initAPI($);
            mr.maps.init();
        }

    };

    mr.maps.initAPI = function($){
        // Load Google MAP API JS with callback to initialise when fully loaded
        if(document.querySelector('[data-maps-api-key]') && !document.querySelector('.gMapsAPI')){
            if($('[data-maps-api-key]').length){
                var script = document.createElement('script');
                var apiKey = $('[data-maps-api-key]:first').attr('data-maps-api-key');
                apiKey = typeof apiKey !== typeof undefined ? apiKey : '';
                if(apiKey !== ''){
                    script.type = 'text/javascript';
                    script.src = 'https://maps.googleapis.com/maps/api/js?key='+apiKey+'&callback=mr.maps.init';
                    script.className = 'gMapsAPI';
                    document.body.appendChild(script);
                }
            }
        }
    };

    mr.maps.init = function(){
        if(typeof window.google !== "undefined"){
            if(typeof window.google.maps !== "undefined"){

                mr.maps.instances = [];


                jQuery('.gmaps-active').each(function(){
                    var mapElement      = this,
                        mapInstance     = jQuery(this),
                        isDraggable     = jQuery(document).width() > 766 ? true : false,
                        showZoomControl = typeof mapInstance.attr('data-zoom-controls') !== typeof undefined ? true : false,
                        zoomControlPos  = typeof mapInstance.attr('data-zoom-controls') !== typeof undefined ? mapInstance.attr('data-zoom-controls'): false,
                        latlong         = typeof mapInstance.attr('data-latlong') !== typeof undefined ? mapInstance.attr('data-latlong') : false,
                        latitude        = latlong ? 1 *latlong.substr(0, latlong.indexOf(',')) : false,
                        longitude       = latlong ? 1 * latlong.substr(latlong.indexOf(",") + 1) : false,
                        geocoder        = new google.maps.Geocoder(),
                        address         = typeof mapInstance.attr('data-address') !== typeof undefined ? mapInstance.attr('data-address').split(';'): [""],
                        map, marker, markerDefaults,mapDefaults,mapOptions, markerOptions, mapAo = {}, markerAo = {}, mapCreatedEvent;

                        mapCreatedEvent    = document.createEvent('Event');
                        mapCreatedEvent.initEvent('mapCreated.maps.mr', true, true);




                    mapDefaults = {
                        disableDefaultUI: true,
                        draggable: isDraggable,
                        scrollwheel: false,
                        styles: [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}],
                        zoom: 17,
                        zoomControl: false,
                    };

                    // Attribute overrides - allows data attributes on the map to override global options
                    mapAo.styles             = typeof mapInstance.attr('data-map-style') !== typeof undefined ? JSON.parse(mapInstance.attr('data-map-style')): undefined;
                    mapAo.zoom               = mapInstance.attr('data-map-zoom');
                    mapAo.zoomControlOptions = zoomControlPos !== false ? {position: google.maps.ControlPosition[zoomControlPos]} : undefined,

                    markerDefaults = {
                        icon: {url:( typeof mr_variant !== typeof undefined ? '../': '' )+'img/mapmarker.png', scaledSize: new google.maps.Size(50,50)},
                        title: 'We Are Here',
                        optimised: false
                    };

                    markerAo.icon = typeof mapInstance.attr('data-marker-image') !== typeof undefined ? mapInstance.attr('data-marker-image'): undefined,
                    markerAo.title = mapInstance.attr('data-marker-title');

                    mapOptions = jQuery.extend({}, mapDefaults, mr.maps.options.map, mapAo);
                    markerOptions = jQuery.extend({}, markerDefaults, mr.maps.options.marker, markerAo);


                    if(address !== undefined && address[0] !== ""){
                            geocoder.geocode( { 'address': address[0].replace('[nomarker]','')}, function(results, status) {
                                if (status === google.maps.GeocoderStatus.OK) {
                                map = new google.maps.Map(mapElement, mapOptions);


                                mr.maps.instances.push(map);
                                jQuery(mapElement).trigger('mapCreated.maps.mr').get(0).dispatchEvent(mapCreatedEvent);
                                map.setCenter(results[0].geometry.location);

                                address.forEach(function(address){
                                    var markerGeoCoder;

                                    if(/(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)/.test(address) ){
                                        var latlong = address.split(','),
                                        marker = new google.maps.Marker(jQuery.extend({}, markerOptions, {
                                                        position: { lat: 1*latlong[0], lng: 1*latlong[1] },
                                                        map: map,
                                                    }));
                                    }
                                    else if(address.indexOf('[nomarker]') < 0){
                                        markerGeoCoder = new google.maps.Geocoder();
                                        markerGeoCoder.geocode( { 'address': address.replace('[nomarker]','')}, function(results, status) {
                                            if (status === google.maps.GeocoderStatus.OK) {
                                                marker = new google.maps.Marker(jQuery.extend({}, markerOptions, {
                                                    map: map,
                                                    position: results[0].geometry.location,
                                                }));
                                            }
                                            else{
                                                console.log('Map marker error: '+status);
                                            }
                                        });
                                    }

                                });
                            } else {
                                console.log('There was a problem geocoding the address.');
                            }
                        });
                    }
                    else if(typeof latitude !== typeof undefined && latitude !== "" && latitude !== false && typeof longitude !== typeof undefined && longitude !== "" && longitude !== false ){

                        mapOptions.center   = { lat: latitude, lng: longitude};
                        map                 = new google.maps.Map(mapElement, mapOptions);
                        marker              = new google.maps.Marker(jQuery.extend({}, markerOptions, {
                                                    position: { lat: latitude, lng: longitude },
                                                    map: map }));
                        mr.maps.instances.push(map);
                        jQuery(mapElement).trigger('mapCreated.maps.mr').get(0).dispatchEvent(mapCreatedEvent);


                    }



                });
            }
        }
    };

    mr.components.documentReady.push(mr.maps.documentReady);
    return mr;

}(mr, jQuery, window, document));


//////////////// Masonry
mr = (function (mr, $, window, document){
    "use strict";

    mr.masonry = mr.masonry || {};

    mr.masonry.documentReady = function($){

        mr.masonry.updateFilters();

        $(document).on('click touchstart', '.masonry__filters li:not(.js-no-action)', function(){
            var masonryFilter = $(this);
            var masonryContainer = masonryFilter.closest('.masonry').find('.masonry__container');
            var filterValue = '*';
            if(masonryFilter.attr('data-masonry-filter') !== '*'){
                filterValue = '.filter-'+masonryFilter.attr('data-masonry-filter');
            }
            masonryFilter.siblings('li').removeClass('active');
            masonryFilter.addClass('active');
            masonryContainer.removeClass('masonry--animate');
            masonryContainer.on('layoutComplete',function(){
                $(this).addClass('masonry--active');
                if(typeof mr_parallax !== typeof undefined){
                    setTimeout(function(){ mr_parallax.profileParallaxElements(); },100);
                }
            });
            masonryContainer.isotope({ filter: filterValue });

        });

    };

    mr.masonry.windowLoad = function(){

        $('.masonry').each(function(){
            var masonry       = $(this).find('.masonry__container'),
                masonryParent = $(this),
                defaultFilter = '*',
                themeDefaults, ao = {};

            themeDefaults = {
                itemSelector: '.masonry__item',
                filter: '*',
                masonry: {
                  columnWidth: '.masonry__item'
                }
            };

            // Check for a default filter attribute
            if(masonryParent.is('[data-default-filter]')){
                defaultFilter = masonryParent.attr('data-default-filter').toLowerCase();
                defaultFilter = '.filter-'+defaultFilter;
                masonryParent.find('li[data-masonry-filter]').removeClass('active');
                masonryParent.find('li[data-masonry-filter="'+masonryParent.attr("data-default-filter").toLowerCase()+'"]').addClass('active');
            }

            // Use data attributes to override the default settings and provide a per-masonry customisation where necessary.
            ao.filter = defaultFilter !== '*' ? defaultFilter : undefined;

            masonry.on('layoutComplete',function(){
                masonry.addClass('masonry--active');
                if(typeof mr_parallax !== typeof undefined){
                    setTimeout(function(){ mr_parallax.profileParallaxElements(); },100);
                }
            });


            masonry.isotope(jQuery.extend({}, themeDefaults, mr.masonry.options, ao));

        });
    };

    mr.masonry.updateFilters = function(masonry){

        // If no argument is supplied, just apply the update to all masonry sets on the page.
        masonry = typeof masonry !== typeof undefined ? masonry : '.masonry';

        var $masonry = $(masonry);

        $masonry.each(function(){
            var $masonry         = $(this),
                masonryContainer = $masonry.find('.masonry__container'),
                filters          = $masonry.find('.masonry__filters'),
                // data-filter-all-text can be used to set the word for "all"
                filterAllText    = typeof filters.attr('data-filter-all-text') !== typeof undefined ? filters.attr('data-filter-all-text') : "All",
                filtersList;

            // Ensure we are working with a .masonry element
            if($masonry.is('.masonry')){
                // If a filterable masonry item exists
                if(masonryContainer.find('.masonry__item[data-masonry-filter]').length){

                    // Create empty ul for filters
                    filtersList = filters.find('> ul');

                    if(!filtersList.length){
                        filtersList = filters.append('<ul></ul>').find('> ul');
                    }

                    // To avoid cases where user leave filter attribute blank
                    // only take items that have filter attribute
                    masonryContainer.find('.masonry__item[data-masonry-filter]').each(function(){
                        var masonryItem  = $(this),
                            filterString = masonryItem.attr('data-masonry-filter'),
                            filtersArray = [];

                        // If not undefined or empty
                        if(typeof filterString !== typeof undefined && filterString !== ""){
                            // Split tags from string into array
                            filtersArray = filterString.split(',');
                        }
                        jQuery(filtersArray).each(function(index, tag){

                            // Slugify the tag

                            var slug = mr.util.slugify(tag);

                            // Add the filter class to the masonry item

                            masonryItem.addClass('filter-'+slug);

                            // If this tag does not appear in the list already, add it
                            if(!filtersList.find('[data-masonry-filter="'+slug+'"]').length){
                                filtersList.append('<li data-masonry-filter="'+slug+'">'+tag+'</li>');

                            }
                        });
                    });

                    mr.util.sortChildrenByText($(this).find('.masonry__filters ul'));
                    // Add a filter "all" option
                    if(!filtersList.find('[data-masonry-filter="*"]').length){
                        filtersList.prepend('<li class="active" data-masonry-filter="*">'+filterAllText+'</li>');
                    }

                }
                //End of "if filterable masonry item exists"
            }
            //End of "if $masonry is .masonry"
        });

    };

    mr.masonry.updateLayout = function(masonry){

        // If no argument is supplied, just apply the update to all masonry sets on the page.
        masonry = typeof masonry !== typeof undefined ? masonry : '.masonry';

        var $masonry = $(masonry);


        $masonry.each(function(){
            var collection       = $(this),
                newItems         = collection.find('.masonry__item:not([style])'),
                masonryContainer = collection.find('.masonry__container');

            if(collection.is('.masonry')){
                if(newItems.length){
                    masonryContainer.isotope('appended', newItems).isotope( 'layout');
                }

                masonryContainer.isotope('layout');
            }
        });
    };

    mr.components.documentReady.push(mr.masonry.documentReady);
    mr.components.windowLoad.push(mr.masonry.windowLoad);
    return mr;

}(mr, jQuery, window, document));


//////////////// Modals
mr = (function (mr, $, window, document){
    "use strict";

    mr.modals = mr.modals || {};

    mr.modals.documentReady = function($){
        var allPageModals = "<div class=\"all-page-modals\"></div>",
            mainContainer = $('div.main-container');

        if(mainContainer.length){
            jQuery(allPageModals).insertAfter(mainContainer);
            mr.modals.allModalsContainer = $('div.all-page-modals');
        }
        else{
            jQuery('body').append(allPageModals);
            mr.modals.allModalsContainer = jQuery('body div.all-page-modals');
        }

        $('.modal-container').each(function(){

            // Add modal close if none exists

            var modal        = $(this),
                $window      = $(window),
                modalContent = modal.find('.modal-content');


            if(!modal.find('.modal-close').length){
                modal.find('.modal-content').append('<div class="modal-close modal-close-cross"></div>');
            }

            // Set modal height

            if(modalContent.attr('data-width') !== undefined){
                var modalWidth = modalContent.attr('data-width').substr(0,modalContent.attr('data-width').indexOf('%')) * 1;
                modalContent.css('width',modalWidth + '%');
            }
            if(modalContent.attr('data-height') !== undefined){
                var modalHeight = modalContent.attr('data-height').substr(0,modalContent.attr('data-height').indexOf('%')) * 1;
                modalContent.css('height',modalHeight + '%');
            }

            // Set iframe's src to data-src to stop autoplaying iframes
            mr.util.idleSrc(modal, 'iframe');

        });


        $('.modal-instance').each(function(index){
            var modalInstance = $(this);
            var modal = modalInstance.find('.modal-container');
            var modalContent = modalInstance.find('.modal-content');
            var trigger = modalInstance.find('.modal-trigger');

            // Link modal with modal-id attribute

            trigger.attr('data-modal-index',index);
            modal.attr('data-modal-index',index);

            // Set unique id for multiple triggers

            if(typeof modal.attr('data-modal-id') !== typeof undefined){
                trigger.attr('data-modal-id', modal.attr('data-modal-id'));
            }


            // Attach the modal to the body
            modal = modal.detach();
            mr.modals.allModalsContainer.append(modal);
        });


        $('.modal-trigger').on('click', function(){

            var modalTrigger = $(this);
            var uniqueID, targetModal;
            // Determine if the modal id is set by user or is set programatically

            if(typeof modalTrigger.attr('data-modal-id') !== typeof undefined){
                uniqueID = modalTrigger.attr('data-modal-id');
                targetModal = mr.modals.allModalsContainer.find('.modal-container[data-modal-id="'+uniqueID+'"]');
            }else{
                uniqueID = $(this).attr('data-modal-index');
                targetModal = mr.modals.allModalsContainer.find('.modal-container[data-modal-index="'+uniqueID+'"]');
            }

            mr.util.activateIdleSrc(targetModal, 'iframe');
            mr.modals.autoplayVideo(targetModal);

            mr.modals.showModal(targetModal);

            return false;
        });

        jQuery(document).on('click', '.modal-close', mr.modals.closeActiveModal);

        jQuery(document).keyup(function(e) {
            if (e.keyCode === 27) { // escape key maps to keycode `27`
                mr.modals.closeActiveModal();
            }
        });

        $('.modal-container').on('click', function(e) {
            if( e.target !== this ) return;
            mr.modals.closeActiveModal();
        });

        // Trigger autoshow modals
        $('.modal-container[data-autoshow]').each(function(){
            var modal = $(this);
            var millisecondsDelay = modal.attr('data-autoshow')*1;

            mr.util.activateIdleSrc(modal);
            mr.modals.autoplayVideo(modal);

            // If this modal has a cookie attribute, check to see if a cookie is set, and if so, don't show it.
            if(typeof modal.attr('data-cookie') !== typeof undefined){
                if(!mr.cookies.hasItem(modal.attr('data-cookie'))){
                    mr.modals.showModal(modal, millisecondsDelay);
                }
            }else{
                mr.modals.showModal(modal, millisecondsDelay);
            }
        });

        // Exit modals
        $('.modal-container[data-show-on-exit]').each(function(){
            var modal        = jQuery(this),
                exitSelector = modal.attr('data-show-on-exit'),
                delay = 0;

            if(modal.attr('data-delay')){
                delay = parseInt(modal.attr('data-delay'), 10) || 0;
            }

            // If a valid selector is found, attach leave event to show modal.
            if($(exitSelector).length){
                modal.prepend($('<i class="ti-close close-modal">'));
                jQuery(document).on('mouseleave', exitSelector, function(){
                    if(!$('.modal-active').length){
                        if(typeof modal.attr('data-cookie') !== typeof undefined){
                            if(!mr.cookies.hasItem(modal.attr('data-cookie'))){
                                mr.modals.showModal(modal, delay);
                            }
                        }else{
                            mr.modals.showModal(modal, delay);
                        }
                    }
                });
            }
        });


        // Autoshow modal by ID from location href
        if(window.location.href.split('#').length === 2){
            var modalID = window.location.href.split('#').pop();
            if($('[data-modal-id="'+modalID+'"]').length){
                mr.modals.closeActiveModal();
                mr.modals.showModal($('[data-modal-id="'+modalID+'"]'));
            }
        }

        jQuery(document).on('click','a[href^="#"]', function(){
            var modalID = $(this).attr('href').replace('#', '');
            mr.modals.closeActiveModal();
            setTimeout(mr.modals.showModal, 500,'[data-modal-id="'+modalID+'"]', 0);
        });

        // Make modal scrollable
        jQuery(document).on('wheel mousewheel scroll','.modal-content, .modal-content .scrollable', function(evt){
            if(evt.preventDefault){evt.preventDefault();}
            if(evt.stopPropagation){evt.stopPropagation();}
            this.scrollTop += (evt.originalEvent.deltaY);
        });
    };
    ////////////////
    //////////////// End documentReady
    ////////////////

    mr.modals.showModal = function(modal, millisecondsDelay){

        var delay = (typeof millisecondsDelay !== typeof undefined) ? (1*millisecondsDelay) : 0, $modal = $(modal);

        if($modal.length){
            setTimeout(function(){
                var openEvent = document.createEvent('Event');
                openEvent.initEvent('modalOpened.modals.mr', true, true);
                $(modal).addClass('modal-active').trigger('modalOpened.modals.mr').get(0).dispatchEvent(openEvent);

            },delay);
        }
    };

    mr.modals.closeActiveModal = function(){
        var modal      = jQuery('body div.modal-active'),
            closeEvent = document.createEvent('Event');

        mr.util.idleSrc(modal, 'iframe');
        mr.util.pauseVideo(modal);

        // If this modal requires to be closed permanently using a cookie, set the cookie now.
        if(typeof modal.attr('data-cookie') !== typeof undefined){
            mr.cookies.setItem(modal.attr('data-cookie'), "true", Infinity, '/');
        }

        if(modal.length){
            // Remove hash from URL bar if this modal was opened via url bar ID
            if(modal.is('[data-modal-id]') && window.location.hash === '#'+modal.attr('data-modal-id')){
                mr.util.removeHash();
            }
            closeEvent.initEvent('modalClosed.modals.mr', true, true);
            modal.removeClass('modal-active').trigger('modalClosed.modals.mr').get(0).dispatchEvent(closeEvent);
        }
    };

    mr.modals.autoplayVideo = function(modal){
        // If modal contains HTML5 video with autoplay, play the video
        if(modal.find('video[autoplay]').length){
            var video = modal.find('video').get(0);
            video.play();
        }
    };

    mr.components.documentReady.push(mr.modals.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Newsletter Providers
mr = (function (mr, $, window, document){
    "use strict";

    mr.newsletters = mr.newsletters || {};

    mr.newsletters.documentReady = function($){

  	var form,checkbox,label,id,parent,radio;

    // Treat Campaign Monitor forms
    $('form[action*="createsend.com"]').each(function(){
    	form = $(this);

        // Override browser validation and allow us to use our own
        form.attr('novalidate', 'novalidate');

    	// Give each text input a placeholder value

    	if(!form.is('.form--no-placeholders')){
            form.find('input:not([checkbox]):not([radio])').each(function(){
                var $input = $(this);
                if(typeof $input.attr('placeholder') !== typeof undefined){
                    if($input.attr('placeholder') === ""){
                        if($input.siblings('label').length){
                            $input.attr('placeholder', $input.siblings('label').first().text());
                            if(form.is('.form--no-labels')){
                                $input.siblings('label').first().remove();
                            }
                        }
                    }
                }else if($input.siblings('label').length){
                    $input.attr('placeholder', $input.siblings('label').first().text());
                    if(form.is('.form--no-labels')){
                        $input.siblings('label').first().remove();
                    }
                }
                if($input.parent().is('p')){
                    $input.unwrap();
                }
            });
        }else{
            form.find('input[placeholder]').removeAttr('placeholder');
        }


    	// Wrap select elements in template code

    	form.find('select').wrap('<div class="input-select"></div>');

    	// Wrap radios elements in template code

    	form.find('input[type="radio"]').wrap('<div class="input-radio"></div>');

    	// Wrap checkbox elements in template code

    	form.find('input[type="checkbox"]').each(function(){
    		checkbox = $(this);
    		id = checkbox.attr('id');
    		label = form.find('label[for='+id+']');
            if(!label.length){
                label = $('<label for="'+id+'"></label>');
            }

    		checkbox.before('<div class="input-checkbox" data-id="'+id+'"></div>');
    		$('.input-checkbox[data-id="'+id+'"]').prepend(checkbox);
    		$('.input-checkbox[data-id="'+id+'"]').prepend(label);
    	});

    	form.find('button[type="submit"]').each(function(){
            var button = $(this);
            button.addClass('btn');
            if(button.parent().is('p')){
                button.unwrap();
            }
        });

        form.find('[required]').attr('required', 'required').addClass('validate-required');

        form.addClass('form--active');

        mr.newsletters.prepareAjaxAction(form);


    });

    // Treat MailChimp forms
    $('form[action*="list-manage.com"]').each(function(){
    	form = $(this);

        // Override browser validation and allow us to use our own
        form.attr('novalidate', 'novalidate');

    	// Give each text input a placeholder value
        if(!form.is('.form--no-placeholders')){
        	form.find('input:not([checkbox]):not([radio])').each(function(){
        		var $input = $(this);
                if(typeof $input.attr('placeholder') !== typeof undefined){
                    if($input.attr('placeholder') === ""){
                        if($input.siblings('label').length){
                            $input.attr('placeholder', $input.siblings('label').first().text());
                            if(form.is('.form--no-labels')){
                                $input.siblings('label').first().remove();
                            }
                        }
                    }
                }else if($input.siblings('label').length){
                    $input.attr('placeholder', $input.siblings('label').first().text());
                    if(form.is('.form--no-labels')){
                        $input.siblings('label').first().remove();
                    }
                }
        	});
        }else{
            form.find('input[placeholder]').removeAttr('placeholder');
        }

        if(form.is('.form--no-labels')){
            form.find('input:not([checkbox]):not([radio])').each(function(){
                var $input = $(this);
                if($input.siblings('label').length){
                    $input.siblings('label').first().remove();
                }
            });
        }

    	// Wrap select elements in template code

    	form.find('select').wrap('<div class="input-select"></div>');

    	// Wrap checboxes elements in template code

    	form.find('input[type="checkbox"]').each(function(){
    		checkbox = jQuery(this);
    		parent = checkbox.parent();
    		label = parent.find('label');
            if(!label.length){
                label = jQuery('<label>');
            }
    		checkbox.before('<div class="input-checkbox"></div>');
    		parent.find('.input-checkbox').append(checkbox);
    		parent.find('.input-checkbox').append(label);
    	});

    	// Wrap radio elements in template code

    	form.find('input[type="radio"]').each(function(){
    		radio = jQuery(this);
    		parent = radio.closest('li');
    		label = parent.find('label');
            if(!label.length){
                label = jQuery('<label>');
            }
    		radio.before('<div class="input-radio"></div>');
    		parent.find('.input-radio').prepend(radio);
    		parent.find('.input-radio').prepend(label);
    	});

        // Convert MailChimp input[type="submit"] to div.button

        form.find('input[type="submit"]').each(function(){
            var submit = $(this);

            var newButton = jQuery('<button/>').attr('type','submit').attr('class', submit.attr('class')).addClass('btn').text(submit.attr('value'));

            if(submit.parent().is('div.clear')){
                submit.unwrap();
            }

            newButton.insertBefore(submit);
            submit.remove();
        });

        form.find('input').each(function(){
            var input = $(this);
            if(input.hasClass('required')){
                input.removeClass('required').addClass('validate-required');
            }
        });

        form.find('input[type="email"]').removeClass('email').addClass('validate-email');

        form.find('#mce-responses').remove();

        form.find('.mc-field-group').each(function(){
            $(this).children().first().unwrap();
        });

        form.find('[required]').attr('required', 'required').addClass('validate-required');

        form.addClass('form--active');

        mr.newsletters.prepareAjaxAction(form);

    });

	// Reinitialize the forms so interactions work as they should

	mr.forms.documentReady(mr.setContext('form.form--active'));

  };

  mr.newsletters.prepareAjaxAction = function(form){
        var action = $(form).attr('action');

        // Alter action for a Mail Chimp-compatible ajax request url.
        if(/list-manage\.com/.test(action)){
           action = action.replace('/post?', '/post-json?') + "&c=?";
           if(action.substr(0,2) === "//"){
               action = 'http:' + action;
           }
        }

        // Alter action for a Campaign Monitor-compatible ajax request url.
        if(/createsend\.com/.test(action)){
           action = action + '?callback=?';
        }

        // Set action on the form
        $(form).attr('action', action);

    };



  mr.components.documentReady.push(mr.newsletters.documentReady);
  return mr;

}(mr, jQuery, window, document));

//////////////// Notifications
mr = (function (mr, $, window, document){
    "use strict";

    mr.notifications = mr.notifications || {};

    mr.notifications.documentReady = function($){

        $('.notification').each(function(){
            var notification = $(this);
            if(!notification.find('.notification-close').length){
                notification.append('<div class="notification-close-cross notification-close"></div>');
            }
        });


        $('.notification[data-autoshow]').each(function(){
            var notification = $(this);
            var millisecondsDelay = parseInt(notification.attr('data-autoshow'),10);

            // If this notification has a cookie attribute, check to see if a cookie is set, and if so, don't show it.
            if(typeof notification.attr('data-cookie') !== typeof undefined){
                if(!mr.cookies.hasItem(notification.attr('data-cookie'))){
                    mr.notifications.showNotification(notification, millisecondsDelay);
                }
            }else{
                mr.notifications.showNotification(notification, millisecondsDelay);
            }
        });

        $('[data-notification-link]:not(.notification)').on('click', function(){
            var notificationID = jQuery(this).attr('data-notification-link');
            var notification = $('.notification[data-notification-link="'+notificationID+'"]');
            jQuery('.notification--reveal').addClass('notification--dismissed');
            notification.removeClass('notification--dismissed');
            mr.notifications.showNotification(notification, 0);
            return false;
        });

        $('.notification-close').on('click', function(){
            var closeButton = jQuery(this);
            // Pass the closeNotification function a reference to the close button
            mr.notifications.closeNotification(closeButton);

            if(closeButton.attr('href') === '#'){
                return false;
            }
        });

        $('.notification .inner-link').on('click', function(){
            var notificationLink = jQuery(this).closest('.notification').attr('data-notification-link');
            mr.notifications.closeNotification(notificationLink);
        });

    };


    mr.notifications.showNotification = function(notification, millisecondsDelay){
        var $notification = jQuery(notification),
            delay         = (typeof millisecondsDelay !== typeof undefined) ? (1*millisecondsDelay) : 0,
            openEvent     = document.createEvent('Event');

        setTimeout(function(){
            openEvent.initEvent('notificationOpened.notifications.mr', true, true);
            $notification.addClass('notification--reveal').trigger('notificationOpened.notifications.mr').get(0).dispatchEvent(openEvent);
            $notification.closest('nav').addClass('notification--reveal');
            if($notification.find('input').length){
                $notification.find('input').first().focus();
            }



        },delay);
        // If notification has autohide attribute, set a timeout
        // for the autohide time plus the original delay time in case notification was called
        // on page load
        if(notification.is('[data-autohide]')){
            var hideDelay = parseInt(notification.attr('data-autohide'),10);
            setTimeout(function(){
                mr.notifications.closeNotification(notification);
            },hideDelay+delay);
        }
    };

    mr.notifications.closeNotification = function(notification){
        var $notification = jQuery(notification),
            closeEvent    = document.createEvent('Event');
        notification = $notification.is('.notification') ?
                       $notification :
                       $notification.is('.notification-close') ?
                       $notification.closest('.notification') :
                       $('.notification[data-notification-link="'+notification+'"]');

        closeEvent.initEvent('notificationClosed.notifications.mr', true, true);
        notification.addClass('notification--dismissed').trigger('notificationClosed.notifications.mr').get(0).dispatchEvent(closeEvent);
        notification.closest('nav').removeClass('notification--reveal');

        // If this notification requires to be closed permanently using a cookie, set the cookie now.
        if(typeof notification.attr('data-cookie') !== typeof undefined){
            mr.cookies.setItem(notification.attr('data-cookie'), "true", Infinity, '/');
        }
    };

    mr.components.documentReady.push(mr.notifications.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Parallax
mr = (function (mr, $, window, document){
    "use strict";

    mr.parallax = mr.parallax || {};

    mr.parallax.documentReady = function($){

        var $window      = $(window);
        var windowWidth  = $window.width();
        var windowHeight = $window.height();
        var navHeight    = $('nav').outerHeight(true);

        if (windowWidth > 768) {
            var parallaxHero = $('.parallax:nth-of-type(1)'),
                parallaxHeroImage = $('.parallax:nth-of-type(1) .background-image-holder');

            parallaxHeroImage.css('top', -(navHeight));
            if(parallaxHero.outerHeight(true) === windowHeight){
                parallaxHeroImage.css('height', windowHeight + navHeight);
            }
        }
    };

    mr.parallax.update = function(){
        if(typeof mr_parallax !== typeof undefined){
            mr_parallax.profileParallaxElements();
            mr_parallax.mr_parallaxBackground();
        }
    };

    mr.components.documentReady.push(mr.parallax.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Progress Horizontal (bars)
mr = (function (mr, $, window, document){
    "use strict";

    mr.progressHorizontal = mr.progressHorizontal || {};

    mr.progressHorizontal.documentReady = function($){

        var progressBars = [];

        $('.progress-horizontal').each(function(){
            var bar       = jQuery(this).find('.progress-horizontal__bar'),
                barObject = {},
                progress  = jQuery('<div class="progress-horizontal__progress"></div>');

                bar.prepend(progress);

                barObject.element = bar;
                barObject.progress = progress;
                barObject.value = parseInt(bar.attr('data-value'),10)+"%";
                barObject.offsetTop = bar.offset().top;
                barObject.animate = false;

                if(jQuery(this).hasClass('progress-horizontal--animate')){
                    barObject.animate = true;
                }else{
                    progress.css('width',barObject.value);
                }
                progressBars.push(barObject);
        });
    };

    mr.components.documentReady.push(mr.progressHorizontal.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// EasyPiecharts
mr = (function (mr, $, window, document){
	  "use strict";

		mr.easypiecharts = mr.easypiecharts || {};
		mr.easypiecharts.pies = [];
		mr.easypiecharts.options = mr.easypiecharts.options || {};

		mr.easypiecharts.documentReady = function($){

		  	$('.radial').each(function(){
		  		var chart              = jQuery(this),
		  			  value              = 0,
		  			  color              = '#000000',
		  			  time               = 2000,
		  			  pieSize            = 110,
		  			  barWidth           = 3,
		  			  defaults           = {},
		  			  attributeOverrides = {},
		  			  options;

		  		defaults = {
		  			animate: ({duration: time, enabled: true}),
		  			barColor: color,
		  			scaleColor: false,
		  			size: pieSize,
		  			lineWidth: barWidth
		  		};

		  		if(typeof mr.easypiecharts.options.size !== typeof undefined){
            pieSize = mr.easypiecharts.options.size;
		  		}
		  		if(typeof chart.attr('data-timing') !== typeof undefined){
		  			attributeOverrides.animate = {duration: parseInt(chart.attr('data-timing'), 10), enabled: true};
		  		}
		  		if(typeof chart.attr('data-color') !== typeof undefined){
		  			attributeOverrides.barColor = chart.attr('data-color');
		  		}
		  		if(typeof chart.attr('data-size') !== typeof undefined){
		  			pieSize = attributeOverrides.size = parseInt(chart.attr('data-size'), 10);
		  		}
		  		if(typeof chart.attr('data-bar-width') !== typeof undefined){
		  			attributeOverrides.lineWidth = parseInt(chart.attr('data-bar-width'), 10);
		  		}

		  		chart.css('height',pieSize).css('width',pieSize);



		  		if(typeof mr.easypiecharts.options === 'object'){
            options = jQuery.extend({}, defaults, mr.easypiecharts.options, attributeOverrides);
		  		}

		  		chart.easyPieChart(options);
		  		chart.data('easyPieChart').update(0);
		  	});

		  	if($('.radial').length){
		  		mr.easypiecharts.init();
		  		mr.easypiecharts.activate();
		  		mr.scroll.listeners.push(mr.easypiecharts.activate);
		  	}

	  };

	  mr.easypiecharts.init = function(){

			mr.easypiecharts.pies = [];

			$('.radial').each(function(){
			  var pieObject  = {},
				  currentPie = jQuery(this);

				  pieObject.element = currentPie;
				  pieObject.value = parseInt(currentPie.attr('data-value'),10);
				  pieObject.top = currentPie.offset().top;
				  pieObject.height = currentPie.height()/2;
				  pieObject.active = false;
				  mr.easypiecharts.pies.push(pieObject);
			});
		};

		mr.easypiecharts.activate = function(){
			mr.easypiecharts.pies.forEach(function(pie){
				if(Math.round((mr.scroll.y + mr.window.height)) >= Math.round(pie.top+pie.height)){
					if(pie.active === false){

	                	pie.element.data('easyPieChart').enableAnimation();
	                	pie.element.data('easyPieChart').update(pie.value);
	                	pie.element.addClass('radial--active');
	                	pie.active = true;
					}
	            }
        	});
		};

	  mr.components.documentReadyDeferred.push(mr.easypiecharts.documentReady);
	  return mr;

}(mr, jQuery, window, document));

//////////////// Flickity
mr = (function (mr, $, window, document){
    "use strict";

    mr.sliders = mr.sliders || {};

    mr.sliders.documentReady = function($){

        $('.slider').each(function(index){

            var slider = $(this);
            var sliderInitializer = slider.find('ul.slides');
            sliderInitializer.find('>li').addClass('slide');
            var childnum = sliderInitializer.find('li').length;

            var themeDefaults = {
                cellSelector: '.slide',
                cellAlign: 'left',
                wrapAround: true,
                pageDots: false,
                prevNextButtons: false,
                autoPlay: true,
                draggable: (childnum < 2 ? false: true),
                imagesLoaded: true,
                accessibility: true,
                rightToLeft: false,
                initialIndex: 0,
                freeScroll: false
            };

            // Attribute Overrides - options that are overridden by data attributes on the slider element
            var ao = {};
            ao.pageDots = (slider.attr('data-paging') === 'true' && sliderInitializer.find('li').length > 1) ? true : undefined;
            ao.prevNextButtons = slider.attr('data-arrows') === 'true'? true: undefined;
            ao.draggable = slider.attr('data-draggable') === 'false'? false : undefined;
            ao.autoPlay = slider.attr('data-autoplay') === 'false'? false: (slider.attr('data-timing') ? parseInt(slider.attr('data-timing'), 10): undefined);
            ao.accessibility = slider.attr('data-accessibility') === 'false'? false : undefined;
            ao.rightToLeft = slider.attr('data-rtl') === 'true'? true : undefined;
            ao.initialIndex = slider.attr('data-initial') ? parseInt(slider.attr('data-initial'), 10) : undefined;
            ao.freeScroll = slider.attr('data-freescroll') === "true" ? true: undefined;

            // Set data attribute to inidicate the number of children in the slider
            slider.attr('data-children',childnum);


            $(this).data('sliderOptions', jQuery.extend({}, themeDefaults, mr.sliders.options, ao));

            $(sliderInitializer).flickity($(this).data('sliderOptions'));

            $(sliderInitializer).on( 'scroll.flickity', function( event, progress ) {
              if(slider.find('.is-selected').hasClass('controls--dark')){
                slider.addClass('controls--dark');
              }else{
                slider.removeClass('controls--dark');
              }
            });
        });

        if(mr.parallax.update){ mr.parallax.update(); }

    };

    mr.components.documentReadyDeferred.push(mr.sliders.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Smoothscroll
mr = (function (mr, $, window, document){
    "use strict";

    mr.smoothscroll = mr.smoothscroll || {};
    mr.smoothscroll.sections = [];

    mr.smoothscroll.init = function(){
        mr.smoothscroll.sections = [];



        $('a.inner-link').each(function(){
            var sectionObject = {},
                link          = $(this),
                href          = link.attr('href'),
                validLink     = new RegExp('^#[^\r\n\t\f\v\#\.]+$','gm');

            if(validLink.test(href)){

                if($('section'+href).length){

                    sectionObject.id     = href;
                    sectionObject.top = Math.round($(href).offset().top);
                    sectionObject.height = Math.round($(href).outerHeight());
                    sectionObject.link   = link.get(0);
                    sectionObject.active = false;

                    mr.smoothscroll.sections.push(sectionObject);
                }
            }
        });

        mr.smoothscroll.highlight();
    };

    mr.smoothscroll.highlight = function(){
        mr.smoothscroll.sections.forEach(function(section){
            if(mr.scroll.y >= section.top && mr.scroll.y < (section.top + section.height)){
                if(section.active === false){
                    section.link.classList.add("inner-link--active");
                    section.active = true;
                }
            }else{
                section.link.classList.remove("inner-link--active");
                section.active = false;
            }
        });
    };

    mr.scroll.listeners.push(mr.smoothscroll.highlight);

    mr.smoothscroll.documentReady = function($){
        // Smooth scroll to inner links
        var innerLinks = $('a.inner-link'), offset, themeDefaults, ao = {};

        themeDefaults = {
            selector: '.inner-link',
            selectorHeader: null,
            speed: 750,
            easing: 'easeInOutCubic',
            offset: 0
        };

        if(innerLinks.length){
            innerLinks.each(function(index){
                var link          = $(this),
                    href          = link.attr('href');
                if(href.charAt(0) !== "#"){
                    link.removeClass('inner-link');
                }
            });

            mr.smoothscroll.init();
            $(window).on('resize', mr.smoothscroll.init);

            offset = 0;
            if($('body[data-smooth-scroll-offset]').length){
                offset = $('body').attr('data-smooth-scroll-offset');
                offset = offset*1;
            }

            ao.offset = offset !== 0 ? offset: undefined;

            smoothScroll.init(jQuery.extend({}, themeDefaults, mr.smoothscroll.options, ao));
        }
    };

    mr.components.documentReady.push(mr.smoothscroll.documentReady);
    mr.components.windowLoad.push(mr.smoothscroll.init);
    return mr;

}(mr, jQuery, window, document));

//////////////// Tabs
mr = (function (mr, $, window, document){
    "use strict";

    mr.tabs = mr.tabs || {};

    mr.tabs.documentReady = function($){
        $('.tabs').each(function(){
            var tabs = $(this);
            tabs.after('<ul class="tabs-content">');
            tabs.find('li').each(function(){
                var currentTab      = $(this),
                    tabContent      = currentTab.find('.tab__content').wrap('<li></li>').parent(),
                    tabContentClone = tabContent.clone(true,true);
                tabContent.remove();
                currentTab.closest('.tabs-container').find('.tabs-content').append(tabContentClone);
            });
        });

        $('.tabs > li').on('click', function(){
            var clickedTab = $(this), hash;
            mr.tabs.activateTab(clickedTab);

            // Update the URL bar if the currently clicked tab has an ID
            if(clickedTab.is('[id]')){
                // Create the hash from the tab's ID
                hash = '#'+ clickedTab.attr('id');
                // Check we are in a newish browser with the history API
                if(history.pushState) {
                    history.pushState(null, null, hash);
                }
                else {
                    location.hash = hash;
                }
            }
        });

        $('.tabs li.active').each(function(){
            mr.tabs.activateTab(this);
        });

        if(window.location.hash !== ''){
            mr.tabs.activateTabById(window.location.hash);
        }

        $('a[href^="#"]').on('click', function(){
            mr.tabs.activateTabById($(this).attr('href'));
        });

    };

    mr.tabs.activateTab = function(tab){
        var clickedTab    = $(tab),
            tabContainer  = clickedTab.closest('.tabs-container'),
            activeIndex   = (clickedTab.index()*1)+(1),
            activeContent = tabContainer.find('> .tabs-content > li:nth-of-type('+activeIndex+')'),
            openEvent     = document.createEvent('Event'),
            iframe, radial;

            openEvent.initEvent('tabOpened.tabs.mr', true, true);


        tabContainer.find('> .tabs > li').removeClass('active');
        tabContainer.find('> .tabs-content > li').removeClass('active');

        clickedTab.addClass('active').trigger('tabOpened.tabs.mr').get(0).dispatchEvent(openEvent);
        activeContent.addClass('active');



        // If there is an <iframe> element in the tab, reload its content when the tab is made active.
        iframe = activeContent.find('iframe');
        if(iframe.length){
            iframe.attr('src', iframe.attr('src'));
        }
    };



    mr.tabs.activateTabById = function(id){
        if(id !== '' && id !== '#'){
            $('.tabs > li#'+id.replace('#', '')).click();
        }
    };

    mr.components.documentReady.push(mr.tabs.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Toggle Class
mr = (function (mr, $, window, document){
    "use strict";

    mr.toggleClass = mr.toggleClass || {};

    mr.toggleClass.documentReady = function($){
        $('[data-toggle-class]').each(function(){
        	var element = $(this),
                data    = element.attr('data-toggle-class').split("|");


            $(data).each(function(){
                var candidate     = element,
                    dataArray     = [],
            	    toggleClass   = '',
            	    toggleElement = '',
                    dataArray = this.split(";");

            	if(dataArray.length === 2){
            		toggleElement = dataArray[0];
            		toggleClass   = dataArray[1];
            		$(candidate).on('click',function(){
                        if(!candidate.hasClass('toggled-class')){
                            candidate.toggleClass('toggled-class');
                        }else{
                            candidate.removeClass('toggled-class');
                        }
            			$(toggleElement).toggleClass(toggleClass);
            			return false;
            		});
            	}else{
            		console.log('Error in [data-toggle-class] attribute. This attribute accepts an element, or comma separated elements terminated witha ";" followed by a class name to toggle');
            	}
            });
        });
    };

    mr.components.documentReady.push(mr.toggleClass.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Typed Headline Effect
mr = (function (mr, $, window, document){
    "use strict";

    mr.typed = mr.typed || {};


    mr.typed.documentReady = function($){
        $('.typed-text').each(function(){
            var text = $(this);
            var strings = text.attr("data-typed-strings") ? text.attr("data-typed-strings").split(",") : [],
                themeDefaults = {
                    strings: [],
                    typeSpeed: 100,
                    loop: true,
                    showCursor: false
                }, ao = {};

            ao.strings = text.attr("data-typed-strings") ? text.attr("data-typed-strings").split(",") : undefined;

            $(text).typed(jQuery.extend({}, themeDefaults, mr.typed.options, ao));

        });
    };

    mr.components.documentReady.push(mr.typed.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Twitter Feeds
mr = (function (mr, $, window, document){
    "use strict";

    mr.twitter = mr.twitter || {};
    mr.twitter.options = mr.twitter.options || {};

    mr.twitter.documentReady = function($){
        $('.tweets-feed').each(function(index) {
            $(this).attr('id', 'tweets-' + index);
        }).each(function(index) {
            var element = $('#tweets-' + index);

            var TweetConfig = {
               "domId": '',
               "maxTweets": 6,
               "enableLinks": true,
               "showUser": true,
               "showTime": true,
               "dateFunction": '',
               "showRetweet": false,
               "customCallback": handleTweets
            };

            TweetConfig = jQuery.extend(TweetConfig, mr.twitter.options);



            if(typeof element.attr('data-widget-id') !== typeof undefined){
                TweetConfig.id = element.attr('data-widget-id');
            }else if(typeof element.attr('data-feed-name') !== typeof undefined && element.attr('data-feed-name') !== ""){
                TweetConfig.profile = {"screenName": element.attr('data-feed-name').replace('@', '')};
            }else if(typeof mr.twitter.options.profile !== typeof undefined){
                TweetConfig.profile = {"screenName": mr.twitter.options.profile.replace('@', '')};
            }else{
                TweetConfig.profile = {"screenName": 'twitter'};
            }

            TweetConfig.maxTweets = element.attr('data-amount') ? element.attr('data-amount'): TweetConfig.maxTweets;

            if(element.closest('.twitter-feed--slider').length){
                element.addClass('slider');
            }

            function handleTweets(tweets) {
                var x = tweets.length;
                var n = 0;
                var html = '<ul class="slides">';
                while (n < x) {
                    html += '<li>' + tweets[n] + '</li>';
                    n++;
                }
                html += '</ul>';
                element.html(html);

                // Initialize twitter feed slider
                if(element.closest('.slider').length){
                    mr.sliders.documentReady(mr.setContext());

                    return html;
                }
            }
            twitterFetcher.fetch(TweetConfig);
        });
    };

    mr.components.documentReady.push(mr.twitter.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Video
mr = (function (mr, $, window, document){
    "use strict";

    mr.video = mr.video || {};
    mr.video.options = mr.video.options || {};
    mr.video.options.ytplayer = mr.video.options.ytplayer || {};

	  mr.video.documentReady = function($){

			//////////////// Youtube Background

			if($('.youtube-background').length){
				$('.youtube-background').each(function(){


					var player = $(this),

					themeDefaults = {
						containment: "self",
						autoPlay: true,
						mute: true,
						opacity: 1
					}, ao = {};

          // Attribute overrides - provides overrides to the global options on a per-video basis
					ao.videoURL = $(this).attr('data-video-url');
					ao.startAt = $(this).attr('data-start-at')? parseInt($(this).attr('data-start-at'), 10): undefined;


					player.closest('.videobg').append('<div class="loading-indicator"></div>');
					player.YTPlayer(jQuery.extend({}, themeDefaults, mr.video.options.ytplayer, ao));
					player.on("YTPStart",function(){
				  		player.closest('.videobg').addClass('video-active');
					});

				});
			}

			if($('.videobg').find('video').length){
				$('.videobg').find('video').closest('.videobg').addClass('video-active');
			}

			//////////////// Video Cover Play Icons

			$('.video-cover').each(function(){
			    var videoCover = $(this);
			    if(videoCover.find('iframe[src]').length){
			        videoCover.find('iframe').attr('data-src', videoCover.find('iframe').attr('src'));
			        videoCover.find('iframe').attr('src','');
			    }
			});

			$('.video-cover .video-play-icon').on("click", function(){
			    var playIcon = $(this);
			    var videoCover = playIcon.closest('.video-cover');
			    if(videoCover.find('video').length){
			        var video = videoCover.find('video').get(0);
			        videoCover.addClass('reveal-video');
			        video.play();
			        return false;
			    }else if(videoCover.find('iframe').length){
			        var iframe = videoCover.find('iframe');
			        iframe.attr('src',iframe.attr('data-src'));
			        videoCover.addClass('reveal-video');
			        return false;
			    }
			});
	  };

	  mr.components.documentReady.push(mr.video.documentReady);
	  return mr;

}(mr, jQuery, window, document));

//////////////// Wizard
mr = (function (mr, $, window, document){
    "use strict";

    mr.wizard = mr.wizard || {};

	  mr.wizard.documentReady = function($){

			$('.wizard').each(function(){
				var wizard = jQuery(this), themeDefaults = {};

        themeDefaults = {
					headerTag: "h5",
				  bodyTag: "section",
					transitionEffect: "slideLeft",
					autoFocus: true
				}


				if(!wizard.is('[role="application"][id^="steps-uid"]')){
						wizard.steps(jQuery.extend({}, themeDefaults, mr.wizard.options));

		   	    wizard.addClass('active');
		    }

		  });
		};

	  mr.components.documentReady.push(mr.wizard.documentReady);
	  return mr;

}(mr, jQuery, window, document));


(function(t,e){"use strict";var i=t.GreenSockGlobals=t.GreenSockGlobals||t;if(!i.TweenLite){var s,n,r,a,o,l=function(t){var e,s=t.split("."),n=i;for(e=0;s.length>e;e++)n[s[e]]=n=n[s[e]]||{};return n},h=l("com.greensock"),_=1e-10,u=function(t){var e,i=[],s=t.length;for(e=0;e!==s;i.push(t[e++]));return i},f=function(){},m=function(){var t=Object.prototype.toString,e=t.call([]);return function(i){return null!=i&&(i instanceof Array||"object"==typeof i&&!!i.push&&t.call(i)===e)}}(),p={},c=function(s,n,r,a){this.sc=p[s]?p[s].sc:[],p[s]=this,this.gsClass=null,this.func=r;var o=[];this.check=function(h){for(var _,u,f,m,d=n.length,v=d;--d>-1;)(_=p[n[d]]||new c(n[d],[])).gsClass?(o[d]=_.gsClass,v--):h&&_.sc.push(this);if(0===v&&r)for(u=("com.greensock."+s).split("."),f=u.pop(),m=l(u.join("."))[f]=this.gsClass=r.apply(r,o),a&&(i[f]=m,"function"==typeof define&&define.amd?define((t.GreenSockAMDPath?t.GreenSockAMDPath+"/":"")+s.split(".").pop(),[],function(){return m}):s===e&&"undefined"!=typeof module&&module.exports&&(module.exports=m)),d=0;this.sc.length>d;d++)this.sc[d].check()},this.check(!0)},d=t._gsDefine=function(t,e,i,s){return new c(t,e,i,s)},v=h._class=function(t,e,i){return e=e||function(){},d(t,[],function(){return e},i),e};d.globals=i;var g=[0,0,1,1],T=[],y=v("easing.Ease",function(t,e,i,s){this._func=t,this._type=i||0,this._power=s||0,this._params=e?g.concat(e):g},!0),w=y.map={},P=y.register=function(t,e,i,s){for(var n,r,a,o,l=e.split(","),_=l.length,u=(i||"easeIn,easeOut,easeInOut").split(",");--_>-1;)for(r=l[_],n=s?v("easing."+r,null,!0):h.easing[r]||{},a=u.length;--a>-1;)o=u[a],w[r+"."+o]=w[o+r]=n[o]=t.getRatio?t:t[o]||new t};for(r=y.prototype,r._calcEnd=!1,r.getRatio=function(t){if(this._func)return this._params[0]=t,this._func.apply(null,this._params);var e=this._type,i=this._power,s=1===e?1-t:2===e?t:.5>t?2*t:2*(1-t);return 1===i?s*=s:2===i?s*=s*s:3===i?s*=s*s*s:4===i&&(s*=s*s*s*s),1===e?1-s:2===e?s:.5>t?s/2:1-s/2},s=["Linear","Quad","Cubic","Quart","Quint,Strong"],n=s.length;--n>-1;)r=s[n]+",Power"+n,P(new y(null,null,1,n),r,"easeOut",!0),P(new y(null,null,2,n),r,"easeIn"+(0===n?",easeNone":"")),P(new y(null,null,3,n),r,"easeInOut");w.linear=h.easing.Linear.easeIn,w.swing=h.easing.Quad.easeInOut;var b=v("events.EventDispatcher",function(t){this._listeners={},this._eventTarget=t||this});r=b.prototype,r.addEventListener=function(t,e,i,s,n){n=n||0;var r,l,h=this._listeners[t],_=0;for(null==h&&(this._listeners[t]=h=[]),l=h.length;--l>-1;)r=h[l],r.c===e&&r.s===i?h.splice(l,1):0===_&&n>r.pr&&(_=l+1);h.splice(_,0,{c:e,s:i,up:s,pr:n}),this!==a||o||a.wake()},r.removeEventListener=function(t,e){var i,s=this._listeners[t];if(s)for(i=s.length;--i>-1;)if(s[i].c===e)return s.splice(i,1),void 0},r.dispatchEvent=function(t){var e,i,s,n=this._listeners[t];if(n)for(e=n.length,i=this._eventTarget;--e>-1;)s=n[e],s.up?s.c.call(s.s||i,{type:t,target:i}):s.c.call(s.s||i)};var k=t.requestAnimationFrame,A=t.cancelAnimationFrame,S=Date.now||function(){return(new Date).getTime()},x=S();for(s=["ms","moz","webkit","o"],n=s.length;--n>-1&&!k;)k=t[s[n]+"RequestAnimationFrame"],A=t[s[n]+"CancelAnimationFrame"]||t[s[n]+"CancelRequestAnimationFrame"];v("Ticker",function(t,e){var i,s,n,r,l,h=this,u=S(),m=e!==!1&&k,p=500,c=33,d=function(t){var e,a,o=S()-x;o>p&&(u+=o-c),x+=o,h.time=(x-u)/1e3,e=h.time-l,(!i||e>0||t===!0)&&(h.frame++,l+=e+(e>=r?.004:r-e),a=!0),t!==!0&&(n=s(d)),a&&h.dispatchEvent("tick")};b.call(h),h.time=h.frame=0,h.tick=function(){d(!0)},h.lagSmoothing=function(t,e){p=t||1/_,c=Math.min(e,p,0)},h.sleep=function(){null!=n&&(m&&A?A(n):clearTimeout(n),s=f,n=null,h===a&&(o=!1))},h.wake=function(){null!==n?h.sleep():h.frame>10&&(x=S()-p+5),s=0===i?f:m&&k?k:function(t){return setTimeout(t,0|1e3*(l-h.time)+1)},h===a&&(o=!0),d(2)},h.fps=function(t){return arguments.length?(i=t,r=1/(i||60),l=this.time+r,h.wake(),void 0):i},h.useRAF=function(t){return arguments.length?(h.sleep(),m=t,h.fps(i),void 0):m},h.fps(t),setTimeout(function(){m&&(!n||5>h.frame)&&h.useRAF(!1)},1500)}),r=h.Ticker.prototype=new h.events.EventDispatcher,r.constructor=h.Ticker;var C=v("core.Animation",function(t,e){if(this.vars=e=e||{},this._duration=this._totalDuration=t||0,this._delay=Number(e.delay)||0,this._timeScale=1,this._active=e.immediateRender===!0,this.data=e.data,this._reversed=e.reversed===!0,B){o||a.wake();var i=this.vars.useFrames?q:B;i.add(this,i._time),this.vars.paused&&this.paused(!0)}});a=C.ticker=new h.Ticker,r=C.prototype,r._dirty=r._gc=r._initted=r._paused=!1,r._totalTime=r._time=0,r._rawPrevTime=-1,r._next=r._last=r._onUpdate=r._timeline=r.timeline=null,r._paused=!1;var R=function(){o&&S()-x>2e3&&a.wake(),setTimeout(R,2e3)};R(),r.play=function(t,e){return null!=t&&this.seek(t,e),this.reversed(!1).paused(!1)},r.pause=function(t,e){return null!=t&&this.seek(t,e),this.paused(!0)},r.resume=function(t,e){return null!=t&&this.seek(t,e),this.paused(!1)},r.seek=function(t,e){return this.totalTime(Number(t),e!==!1)},r.restart=function(t,e){return this.reversed(!1).paused(!1).totalTime(t?-this._delay:0,e!==!1,!0)},r.reverse=function(t,e){return null!=t&&this.seek(t||this.totalDuration(),e),this.reversed(!0).paused(!1)},r.render=function(){},r.invalidate=function(){return this},r.isActive=function(){var t,e=this._timeline,i=this._startTime;return!e||!this._gc&&!this._paused&&e.isActive()&&(t=e.rawTime())>=i&&i+this.totalDuration()/this._timeScale>t},r._enabled=function(t,e){return o||a.wake(),this._gc=!t,this._active=this.isActive(),e!==!0&&(t&&!this.timeline?this._timeline.add(this,this._startTime-this._delay):!t&&this.timeline&&this._timeline._remove(this,!0)),!1},r._kill=function(){return this._enabled(!1,!1)},r.kill=function(t,e){return this._kill(t,e),this},r._uncache=function(t){for(var e=t?this:this.timeline;e;)e._dirty=!0,e=e.timeline;return this},r._swapSelfInParams=function(t){for(var e=t.length,i=t.concat();--e>-1;)"{self}"===t[e]&&(i[e]=this);return i},r.eventCallback=function(t,e,i,s){if("on"===(t||"").substr(0,2)){var n=this.vars;if(1===arguments.length)return n[t];null==e?delete n[t]:(n[t]=e,n[t+"Params"]=m(i)&&-1!==i.join("").indexOf("{self}")?this._swapSelfInParams(i):i,n[t+"Scope"]=s),"onUpdate"===t&&(this._onUpdate=e)}return this},r.delay=function(t){return arguments.length?(this._timeline.smoothChildTiming&&this.startTime(this._startTime+t-this._delay),this._delay=t,this):this._delay},r.duration=function(t){return arguments.length?(this._duration=this._totalDuration=t,this._uncache(!0),this._timeline.smoothChildTiming&&this._time>0&&this._time<this._duration&&0!==t&&this.totalTime(this._totalTime*(t/this._duration),!0),this):(this._dirty=!1,this._duration)},r.totalDuration=function(t){return this._dirty=!1,arguments.length?this.duration(t):this._totalDuration},r.time=function(t,e){return arguments.length?(this._dirty&&this.totalDuration(),this.totalTime(t>this._duration?this._duration:t,e)):this._time},r.totalTime=function(t,e,i){if(o||a.wake(),!arguments.length)return this._totalTime;if(this._timeline){if(0>t&&!i&&(t+=this.totalDuration()),this._timeline.smoothChildTiming){this._dirty&&this.totalDuration();var s=this._totalDuration,n=this._timeline;if(t>s&&!i&&(t=s),this._startTime=(this._paused?this._pauseTime:n._time)-(this._reversed?s-t:t)/this._timeScale,n._dirty||this._uncache(!1),n._timeline)for(;n._timeline;)n._timeline._time!==(n._startTime+n._totalTime)/n._timeScale&&n.totalTime(n._totalTime,!0),n=n._timeline}this._gc&&this._enabled(!0,!1),(this._totalTime!==t||0===this._duration)&&(this.render(t,e,!1),O.length&&M())}return this},r.progress=r.totalProgress=function(t,e){return arguments.length?this.totalTime(this.duration()*t,e):this._time/this.duration()},r.startTime=function(t){return arguments.length?(t!==this._startTime&&(this._startTime=t,this.timeline&&this.timeline._sortChildren&&this.timeline.add(this,t-this._delay)),this):this._startTime},r.timeScale=function(t){if(!arguments.length)return this._timeScale;if(t=t||_,this._timeline&&this._timeline.smoothChildTiming){var e=this._pauseTime,i=e||0===e?e:this._timeline.totalTime();this._startTime=i-(i-this._startTime)*this._timeScale/t}return this._timeScale=t,this._uncache(!1)},r.reversed=function(t){return arguments.length?(t!=this._reversed&&(this._reversed=t,this.totalTime(this._timeline&&!this._timeline.smoothChildTiming?this.totalDuration()-this._totalTime:this._totalTime,!0)),this):this._reversed},r.paused=function(t){if(!arguments.length)return this._paused;if(t!=this._paused&&this._timeline){o||t||a.wake();var e=this._timeline,i=e.rawTime(),s=i-this._pauseTime;!t&&e.smoothChildTiming&&(this._startTime+=s,this._uncache(!1)),this._pauseTime=t?i:null,this._paused=t,this._active=this.isActive(),!t&&0!==s&&this._initted&&this.duration()&&this.render(e.smoothChildTiming?this._totalTime:(i-this._startTime)/this._timeScale,!0,!0)}return this._gc&&!t&&this._enabled(!0,!1),this};var D=v("core.SimpleTimeline",function(t){C.call(this,0,t),this.autoRemoveChildren=this.smoothChildTiming=!0});r=D.prototype=new C,r.constructor=D,r.kill()._gc=!1,r._first=r._last=null,r._sortChildren=!1,r.add=r.insert=function(t,e){var i,s;if(t._startTime=Number(e||0)+t._delay,t._paused&&this!==t._timeline&&(t._pauseTime=t._startTime+(this.rawTime()-t._startTime)/t._timeScale),t.timeline&&t.timeline._remove(t,!0),t.timeline=t._timeline=this,t._gc&&t._enabled(!0,!0),i=this._last,this._sortChildren)for(s=t._startTime;i&&i._startTime>s;)i=i._prev;return i?(t._next=i._next,i._next=t):(t._next=this._first,this._first=t),t._next?t._next._prev=t:this._last=t,t._prev=i,this._timeline&&this._uncache(!0),this},r._remove=function(t,e){return t.timeline===this&&(e||t._enabled(!1,!0),t._prev?t._prev._next=t._next:this._first===t&&(this._first=t._next),t._next?t._next._prev=t._prev:this._last===t&&(this._last=t._prev),t._next=t._prev=t.timeline=null,this._timeline&&this._uncache(!0)),this},r.render=function(t,e,i){var s,n=this._first;for(this._totalTime=this._time=this._rawPrevTime=t;n;)s=n._next,(n._active||t>=n._startTime&&!n._paused)&&(n._reversed?n.render((n._dirty?n.totalDuration():n._totalDuration)-(t-n._startTime)*n._timeScale,e,i):n.render((t-n._startTime)*n._timeScale,e,i)),n=s},r.rawTime=function(){return o||a.wake(),this._totalTime};var I=v("TweenLite",function(e,i,s){if(C.call(this,i,s),this.render=I.prototype.render,null==e)throw"Cannot tween a null target.";this.target=e="string"!=typeof e?e:I.selector(e)||e;var n,r,a,o=e.jquery||e.length&&e!==t&&e[0]&&(e[0]===t||e[0].nodeType&&e[0].style&&!e.nodeType),l=this.vars.overwrite;if(this._overwrite=l=null==l?Q[I.defaultOverwrite]:"number"==typeof l?l>>0:Q[l],(o||e instanceof Array||e.push&&m(e))&&"number"!=typeof e[0])for(this._targets=a=u(e),this._propLookup=[],this._siblings=[],n=0;a.length>n;n++)r=a[n],r?"string"!=typeof r?r.length&&r!==t&&r[0]&&(r[0]===t||r[0].nodeType&&r[0].style&&!r.nodeType)?(a.splice(n--,1),this._targets=a=a.concat(u(r))):(this._siblings[n]=$(r,this,!1),1===l&&this._siblings[n].length>1&&K(r,this,null,1,this._siblings[n])):(r=a[n--]=I.selector(r),"string"==typeof r&&a.splice(n+1,1)):a.splice(n--,1);else this._propLookup={},this._siblings=$(e,this,!1),1===l&&this._siblings.length>1&&K(e,this,null,1,this._siblings);(this.vars.immediateRender||0===i&&0===this._delay&&this.vars.immediateRender!==!1)&&(this._time=-_,this.render(-this._delay))},!0),E=function(e){return e.length&&e!==t&&e[0]&&(e[0]===t||e[0].nodeType&&e[0].style&&!e.nodeType)},z=function(t,e){var i,s={};for(i in t)G[i]||i in e&&"transform"!==i&&"x"!==i&&"y"!==i&&"width"!==i&&"height"!==i&&"className"!==i&&"border"!==i||!(!U[i]||U[i]&&U[i]._autoCSS)||(s[i]=t[i],delete t[i]);t.css=s};r=I.prototype=new C,r.constructor=I,r.kill()._gc=!1,r.ratio=0,r._firstPT=r._targets=r._overwrittenProps=r._startAt=null,r._notifyPluginsOfEnabled=r._lazy=!1,I.version="1.13.1",I.defaultEase=r._ease=new y(null,null,1,1),I.defaultOverwrite="auto",I.ticker=a,I.autoSleep=!0,I.lagSmoothing=function(t,e){a.lagSmoothing(t,e)},I.selector=t.$||t.jQuery||function(e){var i=t.$||t.jQuery;return i?(I.selector=i,i(e)):"undefined"==typeof document?e:document.querySelectorAll?document.querySelectorAll(e):document.getElementById("#"===e.charAt(0)?e.substr(1):e)};var O=[],L={},N=I._internals={isArray:m,isSelector:E,lazyTweens:O},U=I._plugins={},F=N.tweenLookup={},j=0,G=N.reservedProps={ease:1,delay:1,overwrite:1,onComplete:1,onCompleteParams:1,onCompleteScope:1,useFrames:1,runBackwards:1,startAt:1,onUpdate:1,onUpdateParams:1,onUpdateScope:1,onStart:1,onStartParams:1,onStartScope:1,onReverseComplete:1,onReverseCompleteParams:1,onReverseCompleteScope:1,onRepeat:1,onRepeatParams:1,onRepeatScope:1,easeParams:1,yoyo:1,immediateRender:1,repeat:1,repeatDelay:1,data:1,paused:1,reversed:1,autoCSS:1,lazy:1},Q={none:0,all:1,auto:2,concurrent:3,allOnStart:4,preexisting:5,"true":1,"false":0},q=C._rootFramesTimeline=new D,B=C._rootTimeline=new D,M=N.lazyRender=function(){var t=O.length;for(L={};--t>-1;)s=O[t],s&&s._lazy!==!1&&(s.render(s._lazy,!1,!0),s._lazy=!1);O.length=0};B._startTime=a.time,q._startTime=a.frame,B._active=q._active=!0,setTimeout(M,1),C._updateRoot=I.render=function(){var t,e,i;if(O.length&&M(),B.render((a.time-B._startTime)*B._timeScale,!1,!1),q.render((a.frame-q._startTime)*q._timeScale,!1,!1),O.length&&M(),!(a.frame%120)){for(i in F){for(e=F[i].tweens,t=e.length;--t>-1;)e[t]._gc&&e.splice(t,1);0===e.length&&delete F[i]}if(i=B._first,(!i||i._paused)&&I.autoSleep&&!q._first&&1===a._listeners.tick.length){for(;i&&i._paused;)i=i._next;i||a.sleep()}}},a.addEventListener("tick",C._updateRoot);var $=function(t,e,i){var s,n,r=t._gsTweenID;if(F[r||(t._gsTweenID=r="t"+j++)]||(F[r]={target:t,tweens:[]}),e&&(s=F[r].tweens,s[n=s.length]=e,i))for(;--n>-1;)s[n]===e&&s.splice(n,1);return F[r].tweens},K=function(t,e,i,s,n){var r,a,o,l;if(1===s||s>=4){for(l=n.length,r=0;l>r;r++)if((o=n[r])!==e)o._gc||o._enabled(!1,!1)&&(a=!0);else if(5===s)break;return a}var h,u=e._startTime+_,f=[],m=0,p=0===e._duration;for(r=n.length;--r>-1;)(o=n[r])===e||o._gc||o._paused||(o._timeline!==e._timeline?(h=h||H(e,0,p),0===H(o,h,p)&&(f[m++]=o)):u>=o._startTime&&o._startTime+o.totalDuration()/o._timeScale>u&&((p||!o._initted)&&2e-10>=u-o._startTime||(f[m++]=o)));for(r=m;--r>-1;)o=f[r],2===s&&o._kill(i,t)&&(a=!0),(2!==s||!o._firstPT&&o._initted)&&o._enabled(!1,!1)&&(a=!0);return a},H=function(t,e,i){for(var s=t._timeline,n=s._timeScale,r=t._startTime;s._timeline;){if(r+=s._startTime,n*=s._timeScale,s._paused)return-100;s=s._timeline}return r/=n,r>e?r-e:i&&r===e||!t._initted&&2*_>r-e?_:(r+=t.totalDuration()/t._timeScale/n)>e+_?0:r-e-_};r._init=function(){var t,e,i,s,n,r=this.vars,a=this._overwrittenProps,o=this._duration,l=!!r.immediateRender,h=r.ease;if(r.startAt){this._startAt&&(this._startAt.render(-1,!0),this._startAt.kill()),n={};for(s in r.startAt)n[s]=r.startAt[s];if(n.overwrite=!1,n.immediateRender=!0,n.lazy=l&&r.lazy!==!1,n.startAt=n.delay=null,this._startAt=I.to(this.target,0,n),l)if(this._time>0)this._startAt=null;else if(0!==o)return}else if(r.runBackwards&&0!==o)if(this._startAt)this._startAt.render(-1,!0),this._startAt.kill(),this._startAt=null;else{i={};for(s in r)G[s]&&"autoCSS"!==s||(i[s]=r[s]);if(i.overwrite=0,i.data="isFromStart",i.lazy=l&&r.lazy!==!1,i.immediateRender=l,this._startAt=I.to(this.target,0,i),l){if(0===this._time)return}else this._startAt._init(),this._startAt._enabled(!1)}if(this._ease=h=h?h instanceof y?h:"function"==typeof h?new y(h,r.easeParams):w[h]||I.defaultEase:I.defaultEase,r.easeParams instanceof Array&&h.config&&(this._ease=h.config.apply(h,r.easeParams)),this._easeType=this._ease._type,this._easePower=this._ease._power,this._firstPT=null,this._targets)for(t=this._targets.length;--t>-1;)this._initProps(this._targets[t],this._propLookup[t]={},this._siblings[t],a?a[t]:null)&&(e=!0);else e=this._initProps(this.target,this._propLookup,this._siblings,a);if(e&&I._onPluginEvent("_onInitAllProps",this),a&&(this._firstPT||"function"!=typeof this.target&&this._enabled(!1,!1)),r.runBackwards)for(i=this._firstPT;i;)i.s+=i.c,i.c=-i.c,i=i._next;this._onUpdate=r.onUpdate,this._initted=!0},r._initProps=function(e,i,s,n){var r,a,o,l,h,_;if(null==e)return!1;L[e._gsTweenID]&&M(),this.vars.css||e.style&&e!==t&&e.nodeType&&U.css&&this.vars.autoCSS!==!1&&z(this.vars,e);for(r in this.vars){if(_=this.vars[r],G[r])_&&(_ instanceof Array||_.push&&m(_))&&-1!==_.join("").indexOf("{self}")&&(this.vars[r]=_=this._swapSelfInParams(_,this));else if(U[r]&&(l=new U[r])._onInitTween(e,this.vars[r],this)){for(this._firstPT=h={_next:this._firstPT,t:l,p:"setRatio",s:0,c:1,f:!0,n:r,pg:!0,pr:l._priority},a=l._overwriteProps.length;--a>-1;)i[l._overwriteProps[a]]=this._firstPT;(l._priority||l._onInitAllProps)&&(o=!0),(l._onDisable||l._onEnable)&&(this._notifyPluginsOfEnabled=!0)}else this._firstPT=i[r]=h={_next:this._firstPT,t:e,p:r,f:"function"==typeof e[r],n:r,pg:!1,pr:0},h.s=h.f?e[r.indexOf("set")||"function"!=typeof e["get"+r.substr(3)]?r:"get"+r.substr(3)]():parseFloat(e[r]),h.c="string"==typeof _&&"="===_.charAt(1)?parseInt(_.charAt(0)+"1",10)*Number(_.substr(2)):Number(_)-h.s||0;h&&h._next&&(h._next._prev=h)}return n&&this._kill(n,e)?this._initProps(e,i,s,n):this._overwrite>1&&this._firstPT&&s.length>1&&K(e,this,i,this._overwrite,s)?(this._kill(i,e),this._initProps(e,i,s,n)):(this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration)&&(L[e._gsTweenID]=!0),o)},r.render=function(t,e,i){var s,n,r,a,o=this._time,l=this._duration,h=this._rawPrevTime;if(t>=l)this._totalTime=this._time=l,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1,this._reversed||(s=!0,n="onComplete"),0===l&&(this._initted||!this.vars.lazy||i)&&(this._startTime===this._timeline._duration&&(t=0),(0===t||0>h||h===_)&&h!==t&&(i=!0,h>_&&(n="onReverseComplete")),this._rawPrevTime=a=!e||t||h===t?t:_);else if(1e-7>t)this._totalTime=this._time=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0,(0!==o||0===l&&h>0&&h!==_)&&(n="onReverseComplete",s=this._reversed),0>t?(this._active=!1,0===l&&(this._initted||!this.vars.lazy||i)&&(h>=0&&(i=!0),this._rawPrevTime=a=!e||t||h===t?t:_)):this._initted||(i=!0);else if(this._totalTime=this._time=t,this._easeType){var u=t/l,f=this._easeType,m=this._easePower;(1===f||3===f&&u>=.5)&&(u=1-u),3===f&&(u*=2),1===m?u*=u:2===m?u*=u*u:3===m?u*=u*u*u:4===m&&(u*=u*u*u*u),this.ratio=1===f?1-u:2===f?u:.5>t/l?u/2:1-u/2}else this.ratio=this._ease.getRatio(t/l);if(this._time!==o||i){if(!this._initted){if(this._init(),!this._initted||this._gc)return;if(!i&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration))return this._time=this._totalTime=o,this._rawPrevTime=h,O.push(this),this._lazy=t,void 0;this._time&&!s?this.ratio=this._ease.getRatio(this._time/l):s&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time?0:1))}for(this._lazy!==!1&&(this._lazy=!1),this._active||!this._paused&&this._time!==o&&t>=0&&(this._active=!0),0===o&&(this._startAt&&(t>=0?this._startAt.render(t,e,i):n||(n="_dummyGS")),this.vars.onStart&&(0!==this._time||0===l)&&(e||this.vars.onStart.apply(this.vars.onStartScope||this,this.vars.onStartParams||T))),r=this._firstPT;r;)r.f?r.t[r.p](r.c*this.ratio+r.s):r.t[r.p]=r.c*this.ratio+r.s,r=r._next;this._onUpdate&&(0>t&&this._startAt&&this._startTime&&this._startAt.render(t,e,i),e||(this._time!==o||s)&&this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||T)),n&&(!this._gc||i)&&(0>t&&this._startAt&&!this._onUpdate&&this._startTime&&this._startAt.render(t,e,i),s&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!e&&this.vars[n]&&this.vars[n].apply(this.vars[n+"Scope"]||this,this.vars[n+"Params"]||T),0===l&&this._rawPrevTime===_&&a!==_&&(this._rawPrevTime=0))}},r._kill=function(t,e){if("all"===t&&(t=null),null==t&&(null==e||e===this.target))return this._lazy=!1,this._enabled(!1,!1);e="string"!=typeof e?e||this._targets||this.target:I.selector(e)||e;var i,s,n,r,a,o,l,h;if((m(e)||E(e))&&"number"!=typeof e[0])for(i=e.length;--i>-1;)this._kill(t,e[i])&&(o=!0);else{if(this._targets){for(i=this._targets.length;--i>-1;)if(e===this._targets[i]){a=this._propLookup[i]||{},this._overwrittenProps=this._overwrittenProps||[],s=this._overwrittenProps[i]=t?this._overwrittenProps[i]||{}:"all";break}}else{if(e!==this.target)return!1;a=this._propLookup,s=this._overwrittenProps=t?this._overwrittenProps||{}:"all"}if(a){l=t||a,h=t!==s&&"all"!==s&&t!==a&&("object"!=typeof t||!t._tempKill);for(n in l)(r=a[n])&&(r.pg&&r.t._kill(l)&&(o=!0),r.pg&&0!==r.t._overwriteProps.length||(r._prev?r._prev._next=r._next:r===this._firstPT&&(this._firstPT=r._next),r._next&&(r._next._prev=r._prev),r._next=r._prev=null),delete a[n]),h&&(s[n]=1);!this._firstPT&&this._initted&&this._enabled(!1,!1)}}return o},r.invalidate=function(){return this._notifyPluginsOfEnabled&&I._onPluginEvent("_onDisable",this),this._firstPT=null,this._overwrittenProps=null,this._onUpdate=null,this._startAt=null,this._initted=this._active=this._notifyPluginsOfEnabled=this._lazy=!1,this._propLookup=this._targets?{}:[],this},r._enabled=function(t,e){if(o||a.wake(),t&&this._gc){var i,s=this._targets;if(s)for(i=s.length;--i>-1;)this._siblings[i]=$(s[i],this,!0);else this._siblings=$(this.target,this,!0)}return C.prototype._enabled.call(this,t,e),this._notifyPluginsOfEnabled&&this._firstPT?I._onPluginEvent(t?"_onEnable":"_onDisable",this):!1},I.to=function(t,e,i){return new I(t,e,i)},I.from=function(t,e,i){return i.runBackwards=!0,i.immediateRender=0!=i.immediateRender,new I(t,e,i)},I.fromTo=function(t,e,i,s){return s.startAt=i,s.immediateRender=0!=s.immediateRender&&0!=i.immediateRender,new I(t,e,s)},I.delayedCall=function(t,e,i,s,n){return new I(e,0,{delay:t,onComplete:e,onCompleteParams:i,onCompleteScope:s,onReverseComplete:e,onReverseCompleteParams:i,onReverseCompleteScope:s,immediateRender:!1,useFrames:n,overwrite:0})},I.set=function(t,e){return new I(t,0,e)},I.getTweensOf=function(t,e){if(null==t)return[];t="string"!=typeof t?t:I.selector(t)||t;var i,s,n,r;if((m(t)||E(t))&&"number"!=typeof t[0]){for(i=t.length,s=[];--i>-1;)s=s.concat(I.getTweensOf(t[i],e));for(i=s.length;--i>-1;)for(r=s[i],n=i;--n>-1;)r===s[n]&&s.splice(i,1)}else for(s=$(t).concat(),i=s.length;--i>-1;)(s[i]._gc||e&&!s[i].isActive())&&s.splice(i,1);return s},I.killTweensOf=I.killDelayedCallsTo=function(t,e,i){"object"==typeof e&&(i=e,e=!1);for(var s=I.getTweensOf(t,e),n=s.length;--n>-1;)s[n]._kill(i,t)};var J=v("plugins.TweenPlugin",function(t,e){this._overwriteProps=(t||"").split(","),this._propName=this._overwriteProps[0],this._priority=e||0,this._super=J.prototype},!0);if(r=J.prototype,J.version="1.10.1",J.API=2,r._firstPT=null,r._addTween=function(t,e,i,s,n,r){var a,o;return null!=s&&(a="number"==typeof s||"="!==s.charAt(1)?Number(s)-i:parseInt(s.charAt(0)+"1",10)*Number(s.substr(2)))?(this._firstPT=o={_next:this._firstPT,t:t,p:e,s:i,c:a,f:"function"==typeof t[e],n:n||e,r:r},o._next&&(o._next._prev=o),o):void 0},r.setRatio=function(t){for(var e,i=this._firstPT,s=1e-6;i;)e=i.c*t+i.s,i.r?e=Math.round(e):s>e&&e>-s&&(e=0),i.f?i.t[i.p](e):i.t[i.p]=e,i=i._next},r._kill=function(t){var e,i=this._overwriteProps,s=this._firstPT;if(null!=t[this._propName])this._overwriteProps=[];else for(e=i.length;--e>-1;)null!=t[i[e]]&&i.splice(e,1);for(;s;)null!=t[s.n]&&(s._next&&(s._next._prev=s._prev),s._prev?(s._prev._next=s._next,s._prev=null):this._firstPT===s&&(this._firstPT=s._next)),s=s._next;return!1},r._roundProps=function(t,e){for(var i=this._firstPT;i;)(t[this._propName]||null!=i.n&&t[i.n.split(this._propName+"_").join("")])&&(i.r=e),i=i._next},I._onPluginEvent=function(t,e){var i,s,n,r,a,o=e._firstPT;if("_onInitAllProps"===t){for(;o;){for(a=o._next,s=n;s&&s.pr>o.pr;)s=s._next;(o._prev=s?s._prev:r)?o._prev._next=o:n=o,(o._next=s)?s._prev=o:r=o,o=a}o=e._firstPT=n}for(;o;)o.pg&&"function"==typeof o.t[t]&&o.t[t]()&&(i=!0),o=o._next;return i},J.activate=function(t){for(var e=t.length;--e>-1;)t[e].API===J.API&&(U[(new t[e])._propName]=t[e]);return!0},d.plugin=function(t){if(!(t&&t.propName&&t.init&&t.API))throw"illegal plugin definition.";var e,i=t.propName,s=t.priority||0,n=t.overwriteProps,r={init:"_onInitTween",set:"setRatio",kill:"_kill",round:"_roundProps",initAll:"_onInitAllProps"},a=v("plugins."+i.charAt(0).toUpperCase()+i.substr(1)+"Plugin",function(){J.call(this,i,s),this._overwriteProps=n||[]},t.global===!0),o=a.prototype=new J(i);o.constructor=a,a.API=t.API;for(e in r)"function"==typeof t[e]&&(o[r[e]]=t[e]);return a.version=t.version,J.activate([a]),a},s=t._gsQueue){for(n=0;s.length>n;n++)s[n]();for(r in p)p[r].func||t.console.log("GSAP encountered missing dependency: com.greensock."+r)}o=!1}})("undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window,"TweenLite");

!function(a,b,c,d){"use strict";function e(a){var b,c,d,e,f,g,h,i={};for(f=a.replace(/\s*:\s*/g,":").replace(/\s*,\s*/g,",").split(","),h=0,g=f.length;g>h&&(c=f[h],-1===c.search(/^(http|https|ftp):\/\//)&&-1!==c.search(":"));h++)b=c.indexOf(":"),d=c.substring(0,b),e=c.substring(b+1),e||(e=void 0),"string"==typeof e&&(e="true"===e||("false"===e?!1:e)),"string"==typeof e&&(e=isNaN(e)?e:+e),i[d]=e;return null==d&&null==e?a:i}function f(a){a=""+a;var b,c,d,e=a.split(/\s+/),f="50%",g="50%";for(d=0,b=e.length;b>d;d++)c=e[d],"left"===c?f="0%":"right"===c?f="100%":"top"===c?g="0%":"bottom"===c?g="100%":"center"===c?0===d?f="50%":g="50%":0===d?f=c:g=c;return{x:f,y:g}}function g(b,c){var d=function(){c(this.src)};a("<img src='"+b+".gif'>").load(d),a("<img src='"+b+".jpg'>").load(d),a("<img src='"+b+".jpeg'>").load(d),a("<img src='"+b+".png'>").load(d)}function h(b,c,d){if(this.$element=a(b),"string"==typeof c&&(c=e(c)),d?"string"==typeof d&&(d=e(d)):d={},"string"==typeof c)c=c.replace(/\.\w*$/,"");else if("object"==typeof c)for(var f in c)c.hasOwnProperty(f)&&(c[f]=c[f].replace(/\.\w*$/,""));this.settings=a.extend({},j,d),this.path=c,this.init()}var i="vide",j={volume:1,playbackRate:1,muted:!0,loop:!0,autoplay:!0,position:"50% 50%",posterType:"detect"},k=/iPad|iPhone|iPod/i.test(d.userAgent),l=/Android/i.test(d.userAgent);h.prototype.init=function(){var b,c,d=this,e=f(d.settings.position);d.$wrapper=a("<div>").css({position:"absolute","z-index":-1,top:0,left:0,bottom:0,right:0,overflow:"hidden","-webkit-background-size":"cover","-moz-background-size":"cover","-o-background-size":"cover","background-size":"cover","background-repeat":"no-repeat","background-position":e.x+" "+e.y}),c=d.path,"object"==typeof d.path&&(d.path.poster?c=d.path.poster:d.path.mp4?c=d.path.mp4:d.path.webm?c=d.path.webm:d.path.ogv&&(c=d.path.ogv)),"detect"===d.settings.posterType?g(c,function(a){d.$wrapper.css("background-image","url("+a+")")}):"none"!==d.settings.posterType&&d.$wrapper.css("background-image","url("+c+"."+d.settings.posterType+")"),"static"===d.$element.css("position")&&d.$element.css("position","relative"),d.$element.prepend(d.$wrapper),k||l||(b="","object"==typeof d.path?(d.path.mp4&&(b+="<source src='"+d.path.mp4+".mp4' type='video/mp4'>"),d.path.webm&&(b+="<source src='"+d.path.webm+".webm' type='video/webm'>"),d.path.ogv&&(b+="<source src='"+d.path.ogv+".ogv' type='video/ogv'>"),d.$video=a("<video>"+b+"</video>")):d.$video=a("<video><source src='"+d.path+".mp4' type='video/mp4'><source src='"+d.path+".webm' type='video/webm'><source src='"+d.path+".ogv' type='video/ogg'></video>"),d.$video.css("visibility","hidden"),d.$video.prop({autoplay:d.settings.autoplay,loop:d.settings.loop,volume:d.settings.volume,muted:d.settings.muted,playbackRate:d.settings.playbackRate}),d.$wrapper.append(d.$video),d.$video.css({margin:"auto",position:"absolute","z-index":-1,top:e.y,left:e.x,"-webkit-transform":"translate(-"+e.x+", -"+e.y+")","-ms-transform":"translate(-"+e.x+", -"+e.y+")",transform:"translate(-"+e.x+", -"+e.y+")"}),d.$video.bind("loadedmetadata."+i,function(){d.$video.css("visibility","visible"),d.resize()}),d.$element.bind("resize."+i,function(){d.resize()}))},h.prototype.getVideoObject=function(){return this.$video?this.$video[0]:null},h.prototype.resize=function(){if(this.$video){var a=this.$video[0].videoHeight,b=this.$video[0].videoWidth,c=this.$wrapper.height(),d=this.$wrapper.width();this.$video.css(d/b>c/a?{width:d+2,height:"auto"}:{width:"auto",height:c+2})}},h.prototype.destroy=function(){this.$element.unbind(i),this.$video&&this.$video.unbind(i),delete a[i].lookup[this.index],this.$element.removeData(i),this.$wrapper.remove()},a[i]={lookup:[]},a.fn[i]=function(b,c){var d;return this.each(function(){d=a.data(this,i),d&&d.destroy(),d=new h(this,b,c),d.index=a[i].lookup.push(d)-1,a.data(this,i,d)}),this},a(c).ready(function(){a(b).bind("resize."+i,function(){for(var b,c=a[i].lookup.length,d=0;c>d;d++)b=a[i].lookup[d],b&&b.resize()}),a(c).find("[data-"+i+"-bg]").each(function(b,c){var d=a(c),e=d.data(i+"-options"),f=d.data(i+"-bg");d[i](f,e)})})}(window.jQuery,window,document,navigator);

var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";_gsScope._gsDefine("easing.Back",["easing.Ease"],function(t){var e,i,s,r=_gsScope.GreenSockGlobals||_gsScope,n=r.com.greensock,a=2*Math.PI,o=Math.PI/2,h=n._class,l=function(e,i){var s=h("easing."+e,function(){},!0),r=s.prototype=new t;return r.constructor=s,r.getRatio=i,s},_=t.register||function(){},u=function(t,e,i,s){var r=h("easing."+t,{easeOut:new e,easeIn:new i,easeInOut:new s},!0);return _(r,t),r},c=function(t,e,i){this.t=t,this.v=e,i&&(this.next=i,i.prev=this,this.c=i.v-e,this.gap=i.t-t)},p=function(e,i){var s=h("easing."+e,function(t){this._p1=t||0===t?t:1.70158,this._p2=1.525*this._p1},!0),r=s.prototype=new t;return r.constructor=s,r.getRatio=i,r.config=function(t){return new s(t)},s},f=u("Back",p("BackOut",function(t){return(t-=1)*t*((this._p1+1)*t+this._p1)+1}),p("BackIn",function(t){return t*t*((this._p1+1)*t-this._p1)}),p("BackInOut",function(t){return 1>(t*=2)?.5*t*t*((this._p2+1)*t-this._p2):.5*((t-=2)*t*((this._p2+1)*t+this._p2)+2)})),m=h("easing.SlowMo",function(t,e,i){e=e||0===e?e:.7,null==t?t=.7:t>1&&(t=1),this._p=1!==t?e:0,this._p1=(1-t)/2,this._p2=t,this._p3=this._p1+this._p2,this._calcEnd=i===!0},!0),d=m.prototype=new t;return d.constructor=m,d.getRatio=function(t){var e=t+(.5-t)*this._p;return this._p1>t?this._calcEnd?1-(t=1-t/this._p1)*t:e-(t=1-t/this._p1)*t*t*t*e:t>this._p3?this._calcEnd?1-(t=(t-this._p3)/this._p1)*t:e+(t-e)*(t=(t-this._p3)/this._p1)*t*t*t:this._calcEnd?1:e},m.ease=new m(.7,.7),d.config=m.config=function(t,e,i){return new m(t,e,i)},e=h("easing.SteppedEase",function(t){t=t||1,this._p1=1/t,this._p2=t+1},!0),d=e.prototype=new t,d.constructor=e,d.getRatio=function(t){return 0>t?t=0:t>=1&&(t=.999999999),(this._p2*t>>0)*this._p1},d.config=e.config=function(t){return new e(t)},i=h("easing.RoughEase",function(e){e=e||{};for(var i,s,r,n,a,o,h=e.taper||"none",l=[],_=0,u=0|(e.points||20),p=u,f=e.randomize!==!1,m=e.clamp===!0,d=e.template instanceof t?e.template:null,g="number"==typeof e.strength?.4*e.strength:.4;--p>-1;)i=f?Math.random():1/u*p,s=d?d.getRatio(i):i,"none"===h?r=g:"out"===h?(n=1-i,r=n*n*g):"in"===h?r=i*i*g:.5>i?(n=2*i,r=.5*n*n*g):(n=2*(1-i),r=.5*n*n*g),f?s+=Math.random()*r-.5*r:p%2?s+=.5*r:s-=.5*r,m&&(s>1?s=1:0>s&&(s=0)),l[_++]={x:i,y:s};for(l.sort(function(t,e){return t.x-e.x}),o=new c(1,1,null),p=u;--p>-1;)a=l[p],o=new c(a.x,a.y,o);this._prev=new c(0,0,0!==o.t?o:o.next)},!0),d=i.prototype=new t,d.constructor=i,d.getRatio=function(t){var e=this._prev;if(t>e.t){for(;e.next&&t>=e.t;)e=e.next;e=e.prev}else for(;e.prev&&e.t>=t;)e=e.prev;return this._prev=e,e.v+(t-e.t)/e.gap*e.c},d.config=function(t){return new i(t)},i.ease=new i,u("Bounce",l("BounceOut",function(t){return 1/2.75>t?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}),l("BounceIn",function(t){return 1/2.75>(t=1-t)?1-7.5625*t*t:2/2.75>t?1-(7.5625*(t-=1.5/2.75)*t+.75):2.5/2.75>t?1-(7.5625*(t-=2.25/2.75)*t+.9375):1-(7.5625*(t-=2.625/2.75)*t+.984375)}),l("BounceInOut",function(t){var e=.5>t;return t=e?1-2*t:2*t-1,t=1/2.75>t?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375,e?.5*(1-t):.5*t+.5})),u("Circ",l("CircOut",function(t){return Math.sqrt(1-(t-=1)*t)}),l("CircIn",function(t){return-(Math.sqrt(1-t*t)-1)}),l("CircInOut",function(t){return 1>(t*=2)?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)})),s=function(e,i,s){var r=h("easing."+e,function(t,e){this._p1=t||1,this._p2=e||s,this._p3=this._p2/a*(Math.asin(1/this._p1)||0)},!0),n=r.prototype=new t;return n.constructor=r,n.getRatio=i,n.config=function(t,e){return new r(t,e)},r},u("Elastic",s("ElasticOut",function(t){return this._p1*Math.pow(2,-10*t)*Math.sin((t-this._p3)*a/this._p2)+1},.3),s("ElasticIn",function(t){return-(this._p1*Math.pow(2,10*(t-=1))*Math.sin((t-this._p3)*a/this._p2))},.3),s("ElasticInOut",function(t){return 1>(t*=2)?-.5*this._p1*Math.pow(2,10*(t-=1))*Math.sin((t-this._p3)*a/this._p2):.5*this._p1*Math.pow(2,-10*(t-=1))*Math.sin((t-this._p3)*a/this._p2)+1},.45)),u("Expo",l("ExpoOut",function(t){return 1-Math.pow(2,-10*t)}),l("ExpoIn",function(t){return Math.pow(2,10*(t-1))-.001}),l("ExpoInOut",function(t){return 1>(t*=2)?.5*Math.pow(2,10*(t-1)):.5*(2-Math.pow(2,-10*(t-1)))})),u("Sine",l("SineOut",function(t){return Math.sin(t*o)}),l("SineIn",function(t){return-Math.cos(t*o)+1}),l("SineInOut",function(t){return-.5*(Math.cos(Math.PI*t)-1)})),h("easing.EaseLookup",{find:function(e){return t.map[e]}},!0),_(r.SlowMo,"SlowMo","ease,"),_(i,"RoughEase","ease,"),_(e,"SteppedEase","ease,"),f},!0)}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()();
(function() {

    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

    // Main
    initHeader();
    initAnimation();
    addListeners();

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        /*width = 1903px;
        height = 900px;*/
        target = {x: width/2, y: height/2};

        largeHeader = document.getElementById('header');
        largeHeader.style.height = height+'px';

        canvas = document.getElementById('header-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // create points
        points = [];
        for(var x = 0; x < width; x = x + width/20) {
            for(var y = 0; y < height; y = y + height/20) {
                var px = x + Math.random()*width/20;
                var py = y + Math.random()*height/20;
                var p = {x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }

        // for each point find the 5 closest points
        for(var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for(var j = 0; j < points.length; j++) {
                var p2 = points[j]
                if(!(p1 == p2)) {
                    var placed = false;
                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(closest[k] == undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }

        // assign a circle to each point
        for(var i in points) {
            var c = new Circle(points[i], 2+Math.random()*2, 'rgba(255,255,255,0.8)');
            points[i].circle = c;
        }
    }

    // Event handling
    function addListeners() {
        if(!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
        }
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }

    function mouseMove(e) {
        var posx = posy = 0;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY)    {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        target.x = posx;
        target.y = posy;
    }

    function scrollCheck() {
        if(document.body.scrollTop > height) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height+'px';
        canvas.width = width;
        canvas.height = height;
    }

    // animation
    function initAnimation() {
        animate();
        for(var i in points) {
            shiftPoint(points[i]);
        }
    }

    function animate() {
        if(animateHeader) {
            ctx.clearRect(0,0,width,height);
            for(var i in points) {
                // detect points in range
                if(Math.abs(getDistance(target, points[i])) < 4000) {
                    points[i].active = 0.3;
                    points[i].circle.active = 0.6;
                } else if(Math.abs(getDistance(target, points[i])) < 20000) {
                    points[i].active = 0.1;
                    points[i].circle.active = 0.3;
                } else if(Math.abs(getDistance(target, points[i])) < 40000) {
                    points[i].active = 0.02;
                    points[i].circle.active = 0.1;
                } else {
                    points[i].active = 0;
                    points[i].circle.active = 0;
                }

                drawLines(points[i]);
                points[i].circle.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
        TweenLite.to(p, 1+1*Math.random(), {x:p.originX-50+Math.random()*100,
            y: p.originY-50+Math.random()*100, ease:Circ.easeInOut,
            onComplete: function() {
                shiftPoint(p);
            }});
    }

    // Canvas manipulation
    function drawLines(p) {
        if(!p.active) return;
        for(var i in p.closest) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            ctx.strokeStyle = 'rgba(255,255,255,'+ p.active+')';
            ctx.stroke();
        }
    }

    function Circle(pos,rad,color) {
        var _this = this;

        // constructor
        (function() {
            _this.pos = pos || null;
            _this.radius = rad || null;
            _this.color = color || null;
        })();

        this.draw = function() {
            if(!_this.active) return;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(255,255,255,'+ _this.active+')';
            ctx.fill();
        };
    }

    // Util
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
    
})();