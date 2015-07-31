define({
    name: 'liveCountryFilter',
    id: 'liveCountryFilter',
    events: {
        // TODO: This should be registered as a default event handler for all pages
        // For now, include this function in all page scripts
        pageLoaded: function (e) {
            var that = this,
				moduleId = that.getId(),
				module = $('#' + moduleId),
				page = App.getCurrent(),
				summaryViewModel = that.getViewModel(),
				data,
				sources = {},
				entities = ['insureds', 'drivers', 'vehicles', 'claims'],
                widgetTypes = App.Config.Widgets.defaults(),
                widgets;

            
        },
        initialized: function () {
            // Do something
        }
    },
    layout: {
        templates: {
			block: 'autorow',
			config: {
				params: {
					class: 'country-searchbar'
				},
				items: [
					{
						id: 'textCountry',
						name: 'textCountry',
						label: 'Search Countries',
						tag: 'input',
						type: 'text',
						class: 'k-textbox',
						data: {
							bind: {
								value: 'textCountry'
							}
						},
					},
					{
						tag: 'div',
						id: 'countries',
						name: 'countries',
						//label: 'Countries',
						style: 'max-width: 800px; height: 30px; border: 0;',
						data: {
							role: 'listview',
							selectable: 'multiple',
							template: {
								id: 'country-item-template',
								source: 'country-item.tmpl.htm'
							}
						}
					}
				]
			}
		}
    }
});