App.Widgets.Behaviors = App.Widgets.Behaviors || {};

App.Widgets.Behaviors.OnSelectIsDisabled = function (event, params) {
	var behavior = Object.create(App.Widgets.Behavior(), {
		execute: {
			value: function () {
				var viewModel = this._target,
					event = this.getEvent(),
					dataItem = event.sender.dataItem() || '',
					params = this._params;
				
				if (dataItem !== '') {
					if (dataItem.Key === 'true') {
						viewModel.set(params.bind, false);
					} else {
						viewModel.set(params.bind, true);
					}
				}
			},
			enumerable: true,
			configurable: false,
			writable: true
		}
	});
	
	return behavior.init(event, params);
};

App.Widgets.Behaviors.OnSelectDisplayField = function (event, params) {
	var behavior = Object.create(App.Widgets.Behavior(), {
		execute: {
			value: function () {
				var target = this._target,
					params = this._params,
					event = this.getEvent(),
					isWidget = target.hasOwnProperty('element') ? true : false,
					dataItem = event.sender.dataItem() || '';
					
				// Are we dealing with a widget or a DOM element?
				target = (isWidget) ? target.element : target;
				
				if (dataItem !== '') {
					// Overkill?
					//if (e.sender.selectedIndex > -1) {
						// Multiple matches
						if (params.matches instanceof Array) {
							// Regex match might be better...
							if (params.matches.indexOf(dataItem.Key) !== -1) {
								target.closest('.field').show();
							} else {
								target.closest('.field').hide();
							}
						// Single match
						} else {
							if (dataItem.Key === true || dataItem.Key === params.matches) {
								target.closest('.field').show();
							} else {
								target.closest('.field').hide();
							}
						}
					//}
				}
			},
			enumerable: true,
			configurable: false,
			writable: true
		}
	});
	
	return behavior.init(event, params);
};

App.Widgets.Behaviors.OnSelectDisplayFieldGroup = function (event, params) {
	var behavior = Object.create(App.Widgets.Behavior(), {
		execute: {
			value: function () {
				var target = this._target,
					params = this._params,
					event = this.getEvent(),
					isWidget = target.hasOwnProperty('element') ? true : false,
					dataItem = event.sender.dataItem() || '';
					
				// Are we dealing with a widget or a DOM element?
				target = (isWidget) ? target.element : target;
				
				if (dataItem !== '') {
					// Overkill?
					//if (e.sender.selectedIndex > -1) {
						// Multiple matches
						if (params.matches instanceof Array) {
							// Regex match might be better...
							if (params.matches.indexOf(dataItem.Key) !== -1) {
								target.closest('.fieldgroup').show();
							} else {
								target.closest('.fieldgroup').hide();
							}
						// Single match
						} else {
							if (dataItem.Key === true || dataItem.Key === params.matches) {
								target.closest('.fieldgroup').show();
							} else {
								target.closest('.fieldgroup').hide();
							}
						}
					//}
				}
			},
			enumerable: true,
			configurable: false,
			writable: true
		}
	});
	
	return behavior.init(event, params);
};

App.Widgets.Behaviors.OnSelectCascade = function (event, params) {
	var behavior = Object.create(App.Widgets.Behavior(), {
		execute: {
			value: function () {
				var widget = this._target,
					params = this._params,
					event = this.getEvent(),
					dataItem = event.sender.dataItem() || '';
						
				if (dataItem !== '') {
					widget.dataSource.read();
					widget.enable();
				}
			},
			enumerable: true,
			configurable: false,
			writable: true
		}
	});
	
	return behavior.init(event, params);
};

App.Widgets.Behaviors.OnSelectRequired = function (event, params) {
	var behavior = Object.create(App.Widgets.Behavior(), {
		execute: {
			value: function () {
				var target = this._target,
					params = this._params,
					event = this.getEvent(),
					isWidget = target.hasOwnProperty('element') ? true : false,
					dataItem = event.sender.dataItem() || '';
					
				// Are we dealing with a widget or a DOM element?
                // TODO: Accommodate CSS selectors
				target = (isWidget) ? document.getElementById(target.element.context.id) : target[0];

				if (dataItem !== '') {
                    if(dataItem.Key === true || dataItem.Key === params.matches) {
                        kendo.unbind(target, App.getCurrent().getBlock('center-pane').getViewModel());
                        target.setAttribute("required", true);
                        kendo.bind(target, App.getCurrent().getBlock('center-pane').getViewModel());
                    } else {
                        kendo.unbind(target, App.getCurrent().getBlock('center-pane').getViewModel());
                        target.removeAttribute("required");
                        kendo.bind(target, App.getCurrent().getBlock('center-pane').getViewModel());
                    }
				}
			},
			enumerable: true,
			configurable: false,
			writable: true
		}
	});
	
	return behavior.init(event, params);
};
																			
App.Widgets.Behaviors.UpdateWidget = function (event, params) {
	/*var behavior = Object.create(App.Widgets.Behavior(), {
		_event: {
			enumerable: true,
			configurable: false,
			writable: true
		},
		_target: {
			enumerable: true,
			configurable: false,
			writable: true
		},
		init: {
			value: function (params) {
				this._event = params.event;
				this._target = params.target; // TODO: Silent fail
				
				return this;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		execute: {
			value: function () {
			
			},
			enumerable: true,
			configurable: false,
			writable: true
		}
	});*/
};