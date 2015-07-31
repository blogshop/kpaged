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
    id: "observinglistview",
    name: "ObservingListView",
    category: "web",
    description: "The ObservingListView widget offers rich support for interacting with data.",
    depends: [ "data" ],
    features: [ {
        id: "listview-editing",
        name: "Editing",
        description: "Support for record editing",
        depends: [ "editable" ]
    }, {
        id: "listview-selection",
        name: "Selection",
        description: "Support for selection",
        depends: [ "selectable" ]
    } ]
});

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        NS = ".kendoObservingListView",
		Widget = kendo.ui.Widget;

    var ObservingListView = kendo.ui.ListView.extend({
        init: function(element, options) {
            var that = this;

            options = $.isArray(options) ? { dataSource: options } : options;

            Widget.fn.init.call(that, element, options);

            options = that.options;

            that.wrapper = element = that.element;

            if (element[0].id) {
                that._itemId = element[0].id + "_lv_active";
            }

            that._element();

            that._dataSource();

            that.template = kendo.template(options.template || "");
            that.altTemplate = kendo.template(options.altTemplate || options.template);
            that.editTemplate = kendo.template(options.editTemplate || "");

            that._navigatable();

            that._selectable();

            that._pageable();

            that._crudHandlers();

            if (that.options.autoBind){
                that.dataSource.fetch();
            }

            kendo.notify(that);
        },
		update: function (event, data) {
			var that = this;
			
			that.dataSource.read();
		},
        options: {
            name: "ObservingListView"
        }
    });

    kendo.ui.plugin(ObservingListView);
})(jQuery);