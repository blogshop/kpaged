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
    id: "observingpanelbar",
    name: "ObservingPanelBar",
    category: "web",
    description: "The ObservingPanelBar widget displays hierarchical data as a multi-level expandable panel bar.",
    depends: [ "core" ]
});

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        NS = ".kendoObservingPanelBar",
        CONTENTLOAD = "contentLoad";

    var ObservingPanelBar = kendo.ui.PanelBar.extend({
        init: function (element, options) {
            var that = this;
			
			ui.PanelBar.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;
        },
		update: function (event, data) {
			this.options.dataSource = data;
			this.init(this.element, this.options);

            // We're technically reloading the content, so fire the contentLoad event.
            // This is a lot easier than implementing a custom event.
            this.trigger(CONTENTLOAD, { event: event, data: data });
		},
        options: {
            name: "ObservingPanelBar"
        }
    });

    kendo.ui.plugin(ObservingPanelBar);
})(jQuery);