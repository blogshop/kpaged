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
    id: "eventpanelbar",
    name: "EventPanelBar",
    category: "web",
    description: "The EventPanelBar widget displays hierarchical data as a multi-level expandable panel bar.",
    depends: [ "core" ]
});

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        NS = ".kendoEventPanelBar";

    var EventPanelBar = kendo.ui.PanelBar.extend({
        init: function (element, options) {
            var that = this;
			
			ui.PanelBar.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;
        },
		notify: function (event, data) {
			console.log(data);
			this.options.dataSource = data;
			this.init(this.element, this.options);
		},
        options: {
            name: "EventPanelBar"
        }
    });

    kendo.ui.plugin(EventPanelBar);
})(jQuery);