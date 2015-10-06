define({
	name: 'ajaxLoader',
	id: 'ajaxLoader', // This can be improved... the double ID reference isn't the greatest
	autoBind: true, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: true,
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
		},
		rendered: function (e) {
			var that = this,
				moduleElement = $('#' + that.getId()),
				page = that.getPage(),
				block = page.getBlock(page.getPrimaryBlockName()),
				viewModel = block.getViewModel(),
				validator = block.getValidator(),
				widgetTypes = App.Config.Widgets.defaults(),
                widgets;
			
			that.dataBind();
				
			// Display loader (Kendo UI progress bar)
			// Loader will display in the center pane, but this is app specific
			$('<span class="status"></span><span class="ellipsis" style="position: absolute"><span>.</span><span>.</span><span>.</span><span>.</span><span>.</span></span>').appendTo('#ui-loader h4').first();
			
			var loader = $('#ui-loader').kendoWindow({
				title: false,
				modal: true,
				visible: false,
				resizable: false,
				draggable: false,
				width: '40%'
			}).data('kendoWindow');
			console.log('IS THIS GONNA WORK?');
			console.log(loader);
			
			that.loader = loader;
			
			loader.element.parent().css({ backgroundColor: 'rgba(255, 255, 255, 0.888)' });
			
			
		}
	},
	layout: {
		templates: {
			tag: 'div',
			id: 'loader',
			children: [
				{
					tag: 'div',
					id: 'ui-loader',
					children: [
						{
							tag: 'div',
							id: 'ui-progress-container',
							style: 'display: flex; flex-flow: column nowrap; justify-content: center; align-items: center; padding: 3.5rem 0; height: 100%',
							children: [
								{
									tag: 'h3',
									style: 'text-align: center, width: 100%, flex: 0 0 3.5rem',
									text: 'Please wait patiently while we load your data.'
								},
								{
									tag: 'div',
									id: 'ui-progress',
									style: 'width: 70%; flex: 0 0 30px',
								},
								{
									tag: 'h4',
									style: 'text-align: center; width: 100%; flex: 0 0 3.5rem',
								}
							]
						}
					]
				}
			]
		}
	}
});