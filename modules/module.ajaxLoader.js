define({
	name: 'ajaxLoader',
	id: 'ajaxLoader', // This can be improved... the double ID reference isn't the greatest
	autoBind: true, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: true,
	setMessage: function (message) {
		var that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			block = page.getBlock(page.getPrimaryBlockName()),
			viewModel = that.getViewModel();
			
		viewModel.set('message', message);
			
		return that;
	},
	open: function () {
		this.loader.center().open();
		return this;
	},
	close: function () {
		this.getViewModel().set('message', '');
		this.loader.close();
		return this;
	},
	events: {
		initialized: function () {
			var that = this,
				moduleElement = $('#' + that.getId()),
				page = that.getPage(),
				block = page.getBlock(page.getPrimaryBlockName()),
				viewModel = that.getViewModel();
				
			that.setMessage = that.getConfig().setMessage;
			that.open = that.getConfig().open;
			that.close = that.getConfig().close;
			
			page.setLoader = function (loader) {
				this._loader = loader;
				return this;
			}
			
			page.getLoader = function () {
				return this._loader;
			}
		},
		pageLoaded: function () {
			var that = this;
			that.render();
		},
		rendered: function (e) {
			var that = this,
				moduleElement = $('#' + that.getId()),
				page = that.getPage(),
				block = page.getBlock(page.getPrimaryBlockName()),
				viewModel = that.getViewModel(),
				widgetTypes = App.Config.Widgets.defaults(),
                widgets;
			
			that.dataBind();
				
			// Display loader (Kendo UI progress bar)
			// Loader will display in the center pane, but this is app specific
			$('<span class="status"></span><span class="ellipsis" style="position: absolute"><span>.</span><span>.</span><span>.</span><span>.</span><span>.</span></span>').appendTo('#ui-loader h4').first();
			
			var loader = $('[name=ui-loader-window]').kendoWindow({
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
			
			console.log('attempting to set message');
			viewModel.set('message', 'test123');
			console.log(viewModel);
			loader.element.parent().css({ backgroundColor: 'rgba(255, 255, 255, 0.888)' });
			
			page.setLoader(that);
		}
	},
	layout: {
		templates: {
			tag: 'div',
			id: 'loader',
			children: [
				{
					tag: 'div',
					name: 'ui-loader-window',
					class: 'ui-loader-window',
					children: [
						{
							tag: 'div',
							id: 'ui-progress-container',
							style: 'display: flex; flex-flow: column nowrap; justify-content: center; align-items: center; padding: 3.5rem 0; height: 100%',
							children: [
								{
									tag: 'h3',
									name: 'message',
									style: 'text-align: center, width: 100%, flex: 0 0 3.5rem',
									text: 'Please wait patiently while we load your data.',
									data: {
										bind: {
											text: 'message'
										}
									}
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