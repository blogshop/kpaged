/*
* Kendo UI Web v2013.1.319 (http://kendoui.com)
* Copyright 2013 Telerik AD. All rights reserved.
*
* Kendo UI Web commercial licenses may be obtained at
* https://www.kendoui.com/purchase/license-agreement/kendo-ui-web-commercial.aspx
* If you do not own a commercial license, this file shall be governed by the
* GNU General Public License (GPL) version 3.
* For GPL requirements, please review: http://www.gnu.org/copyleft/gpl.html
*/
kendo_module({
    id: "semantictabstrip",
    name: "SemanticTabStrip",
    category: "web",
    description: "The SemanticTabStrip widget displays a collection of tabs with associated tab content.",
    depends: [ "data" ]
});

(function ($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        keys = kendo.keys,
        map = $.map,
        each = $.each,
        trim = $.trim,
        extend = $.extend,
        Widget = ui.Widget,
        template = kendo.template,
        excludedNodesRegExp = /^(a|div)$/i,
        NS = ".kendoSemanticTabStrip",
        IMG = "img",
        HREF = "href",
        PREV = "prev",
        LINK = "k-link",
        LAST = "k-last",
        CLICK = "click",
        ERROR = "error",
        EMPTY = ":empty",
        IMAGE = "k-image",
        FIRST = "k-first",
        SELECT = "select",
        ACTIVATE = "activate",
        CONTENT = "k-content",
        CONTENTURL = "contentUrl",
        MOUSEENTER = "mouseenter",
        MOUSELEAVE = "mouseleave",
        CONTENTLOAD = "contentLoad",
        DISABLEDSTATE = "k-state-disabled",
        DEFAULTSTATE = "k-state-default",
        ACTIVESTATE = "k-state-active",
        FOCUSEDSTATE = "k-state-focused",
        HOVERSTATE = "k-state-hover",
        TABONTOP = "k-tab-on-top",
        NAVIGATABLEITEMS = ".k-item:not(." + DISABLEDSTATE + ")",
        HOVERABLEITEMS = ".k-tabstrip-items > " + NAVIGATABLEITEMS + ":not(." + ACTIVESTATE + ")",

		templates = {
			content: template(
				"<div class='k-content'#= contentAttributes(data) # role='tabpanel'>#= content(item) #</div>"
			),
			itemWrapper: template(
				"<#= tag(item) # class='k-link'#= contentUrl(item) ##= textAttributes(item) #>" +
					"#= image(item) ##= sprite(item) ##= text(item) #" +
				"</#= tag(item) #>"
			),
			item: template(
				"<li class='#= wrapperCssClass(group, item) #' role='tab' #=item.active ? \"aria-selected='true'\" : ''#>" +
					"#= itemWrapper(data) #" +
				"</li>"
			),
			image: template("<img class='k-image' alt='' src='#= imageUrl #' />"),
			sprite: template("<span class='k-sprite #= spriteCssClass #'></span>"),
			empty: template("")
		};

    function updateTabClasses (tabs) {
        tabs.children(IMG)
            .addClass(IMAGE);

        tabs.children("a")
            .addClass(LINK)
            .children(IMG)
            .addClass(IMAGE);

        tabs.filter(":not([disabled]):not([class*=k-state-disabled])")
            .addClass(DEFAULTSTATE);

        tabs.filter("li[disabled]")
            .addClass(DISABLEDSTATE)
            .removeAttr("disabled");

        tabs.filter(":not([class*=k-state])")
            .children("a")
            .filter(":focus")
            .parent()
            .addClass(ACTIVESTATE + " " + TABONTOP);

        tabs.attr("role", "tab");
        tabs.filter("." + ACTIVESTATE)
            .attr("aria-selected", true);


        tabs.each(function() {
            var item = $(this);

            if (!item.children("." + LINK).length) {
                item
                    .contents()      // exclude groups, real links, templates and empty text nodes
                    .filter(function() { return (!this.nodeName.match(excludedNodesRegExp) && !(this.nodeType == 3 && !trim(this.nodeValue))); })
                    .wrapAll("<a class='" + LINK + "'/>");
            }
        });

    }
	
	function updateFirstLast (tabGroup) {
        var tabs = tabGroup.children(".k-item");

        tabs.filter(".k-first:not(:first-child)").removeClass(FIRST);
        tabs.filter(".k-last:not(:last-child)").removeClass(LAST);
        tabs.filter(":first-child").addClass(FIRST);
        tabs.filter(":last-child").addClass(LAST);
    }

    var SemanticTabStrip = kendo.ui.TabStrip.extend({
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            that._animations(that.options);

            if (that.element.is(that.options.tabContainer)) {
                that.wrapper = that.element.wrapAll("<div />").parent();
            } else {
                that.wrapper = that.element;
            }

            options = that.options;

            that._isRtl = kendo.support.isRtl(that.wrapper);

            that._tabindex();

            that._updateClasses();

            that._dataSource();

            if (options.dataSource) {
                that.dataSource.fetch();
            }

            if (that.options.contentUrls) {
                that.wrapper.find(".k-tabstrip-items > .k-item")
                    .each(function(index, item) {
                        $(item).find(">." + LINK).data(CONTENTURL, that.options.contentUrls[index]);
                    });
            }

            that.wrapper
                .on(MOUSEENTER + NS + " " + MOUSELEAVE + NS, HOVERABLEITEMS, that._toggleHover)
                .on("keydown" + NS, $.proxy(that._keydown, that))
                .on("focus" + NS, $.proxy(that._active, that))
                .on("blur" + NS, function() { that._current(null); });

            that.wrapper.children(".k-tabstrip-items")
                .on(CLICK + NS, ".k-state-disabled .k-link", false)
                .on(CLICK + NS, " > " + NAVIGATABLEITEMS, function(e) {
                    if (that._click($(e.currentTarget))) {
                        e.preventDefault();
                    }
                });

            var selectedItems = that.tabGroup.children(options.tabElement + "." + ACTIVESTATE),
                content = that.contentHolder(selectedItems.index());

            if (content.length > 0 && content[0].childNodes.length === 0) {
                that.activateTab(selectedItems.eq(0));
            }

            that.element.attr("role", "tablist");

            if (that.element[0].id) {
                that._ariaId = that.element[0].id + "_ts_active";
            }

            kendo.notify(that);
        },

        refresh: function(e) {
            var that = this,
                options = that.options,
                text = kendo.getter(options.dataTextField),
                content = kendo.getter(options.dataContentField),
                contentUrl = kendo.getter(options.dataContentUrlField),
                image = kendo.getter(options.dataImageUrlField),
                url = kendo.getter(options.dataUrlField),
                sprite = kendo.getter(options.dataSpriteCssClass),
                idx,
                tabs = [],
                tab,
                action,
                view = that.dataSource.view(),
                length;


            e = e || {};
            action = e.action;

            if (action) {
               view = e.items;
            }

            for (idx = 0, length = view.length; idx < length; idx ++) {
                tab = {
                    text: text(view[idx])
                };

                if (options.dataContentField) {
                    tab.content = content(view[idx]);
                }

                if (options.dataContentUrlField) {
                    tab.contentUrl = contentUrl(view[idx]);
                }

                if (options.dataUrlField) {
                    tab.url = url(view[idx]);
                }

                if (options.dataImageUrlField) {
                    tab.imageUrl = image(view[idx]);
                }

                if (options.dataSpriteCssClass) {
                    tab.spriteCssClass = sprite(view[idx]);
                }

                tabs[idx] = tab;
            }

            if (e.action == "add") {
                if (e.index < that.tabGroup.children().length) {
                    that.insertBefore(tabs, that.tabGroup.children().eq(e.index));
                } else {
                    that.append(tabs);
                }
            } else if (e.action == "remove") {
                for (idx = 0; idx < view.length; idx++) {
                   that.remove(e.index);
                }
            } else if (e.action == "itemchange") {
                idx = that.dataSource.view().indexOf(view[0]);
                if (e.field === options.dataTextField) {
                    that.tabGroup.children().eq(idx).find(".k-link").text(view[0].get(e.field));
                }
            } else {
                that.trigger("dataBinding");
                that.remove(options.tabElement);
                that.append(tabs);
                that.trigger("dataBound");
            }
        },

        setOptions: function(options) {
            var animation = this.options.animation;

            this._animations(options);

            options.animation = extend(true, animation, options.animation);

            Widget.fn.setOptions.call(this, options);
        },

        options: {
            name: "SemanticTabStrip",
            tabElement: "li",
			tabContainer: "ul",
			contentElement: "div",
			dataTextField: "",
            dataContentField: "",
            dataImageUrlField: "",
            dataUrlField: "",
            dataSpriteCssClass: "",
            dataContentUrlField: "",
            animation: {
                open: {
                    effects: "expand:vertical fadeIn",
                    duration: 200
                },
                close: { // if close animation effects are defined, they will be used instead of open.reverse
                    duration: 200
                }
            },
            collapsible: false
        },

        select: function (element) {
            var that = this,
				options = that.options;

            if (arguments.length === 0) {
                return that.tabGroup.children(options.tabElement + "." + ACTIVESTATE);
            }

            if (!isNaN(element)) {
                element = that.tabGroup.children().get(element);
            }

            element = that.tabGroup.find(element);
            $(element).each(function (index, item) {
                item = $(item);
                if (!item.hasClass(ACTIVESTATE) && !that.trigger(SELECT, { item: item[0], contentElement: that.contentHolder(item.index())[0] })) {
                    that.activateTab(item);
                }
            });

            return that;
        },

        _create: function (tab) {
            var options = that.options,
				plain = $.isPlainObject(tab),
                that = this, tabs, contents;

            if (plain || $.isArray(tab)) {
                tab = $.isArray(tab) ? tab : [tab];

                tabs = map(tab, function (value, idx) {
                            return $(SemanticTabStrip.renderItem({
                                group: that.tabGroup,
                                item: extend(value, { index: idx })
                            }));
                        });

                contents = map( tab, function (value, idx) {
                            if (value.content || value.contentUrl) {
                                return $(SemanticTabStrip.renderContent({
                                    item: extend(value, { index: idx })
                                }));
                            }
                        });
            } else {
                tabs = $(tab);
                contents = $("<" + options.contentElement + " class='" + CONTENT + "'/>");

                updateTabClasses(tabs);
            }

            return { tabs: tabs, contents: contents };
        },

        _updateClasses: function() {
            var that = this,
				options = that.options,
                tabs, activeItem, activeTab;

            that.wrapper.addClass("k-widget k-header k-tabstrip");

            that.tabGroup = that.wrapper.children(options.tabContainer).addClass("k-tabstrip-items k-reset");

            if (!that.tabGroup[0]) {
                that.tabGroup = $("<" + options.tabContainer + " class='k-tabstrip-items k-reset'/>").appendTo(that.wrapper);
            }

            tabs = that.tabGroup.find(options.tabElement).addClass("k-item");

            if (tabs.length) {
                activeItem = tabs.filter("." + ACTIVESTATE).index();
                activeTab = activeItem >= 0 ? activeItem : undefined;

                that.tabGroup // Remove empty text nodes
                    .contents()
                    .filter(function () { return (this.nodeType == 3 && !trim(this.nodeValue)); })
                    .remove();
            }

            if (activeItem >= 0) {
                tabs.eq(activeItem).addClass(TABONTOP);
            }

            that.contentElements = that.wrapper.children(options.contentElement);

            that.contentElements
                .addClass(CONTENT)
                .eq(activeTab)
                .addClass(ACTIVESTATE)
                .css({ display: "block" });

            if (tabs.length) {
                updateTabClasses(tabs);

                updateFirstLast(that.tabGroup);
                that._updateContentElements();
            }
        },

        _updateContentElements: function() {
            var that = this,
				options = that.options,
                contentUrls = that.options.contentUrls || [],
                tabStripID = that.element.attr("id"),
                contentElements = that.wrapper.children(options.contentElement);

            that.tabGroup.find(".k-item").each(function(idx) {
                var currentContent = contentElements.eq(idx),
                    id = tabStripID + "-" + (idx+1);

                this.setAttribute("aria-controls", id);

                if (!currentContent.length && contentUrls[idx]) {
                    $("<" + options.contentElement + " id='"+ id +"' class='" + CONTENT + "'/>").appendTo(that.wrapper);
                } else {
                    currentContent.attr("id", id);
                }
                currentContent.attr("role", "tabpanel");
                currentContent.filter(":not(." + ACTIVESTATE + ")").attr("aria-hidden", true).attr("aria-expanded", false);
                currentContent.filter("." + ACTIVESTATE).attr("aria-expanded", true);
            });

            that.contentElements = that.contentAnimators = that.wrapper.children(options.contentElement); // refresh the contents

            if (kendo.kineticScrollNeeded && kendo.mobile.ui.Scroller) {
                kendo.touchScroller(that.contentElements);
                that.contentElements = that.contentElements.children(".km-scroll-container");
            }
        }
    });

    // client-side rendering
    extend(SemanticTabStrip, {
        renderItem: function (options) {
            options = extend({ tabStrip: {}, group: {} }, options);

            var empty = templates.empty,
                item = options.item;

            return templates.item(extend(options, {
                image: item.imageUrl ? templates.image : empty,
                sprite: item.spriteCssClass ? templates.sprite : empty,
                itemWrapper: templates.itemWrapper
            }, rendering));
        },

        renderContent: function (options) {
            return templates.content(extend(options, rendering));
        }
    });

    kendo.ui.plugin(SemanticTabStrip);

})(window.kendo.jQuery);
