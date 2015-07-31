App.Behaviors = App.Behaviors || {};

App.Behaviors.DisableElement = function (event, params) {
	var behavior = Object.create(App.Behavior(), {
		execute: {
			value: function () {
				var viewModel = this._target,
					event = this.getEvent(),
					dataItem = event.sender.dataItem() || '',
					params = this._params;
			}
		}
	});
};

App.Behaviors.OnCheckedDisplayFieldGroup = function (event, params) {
	var behavior = Object.create(App.Behavior(), {
		execute: {
			value: function () {
				var params = this._params,
					isArray = (this._target instanceof Array) ? true : false,
					target = this._target,
					doAction;
				
				doAction = function (target) {
					var checkedCallback,
						uncheckedCallback;
					
					if (params.checkedCallback !== 'undefined' && typeof params.checkedCallback === 'function') {
						// Wrap the function in a generic handler so we can pass in custom args
						callback = params.checkedCallback;
						params.checkedCallback = function () {													
							var args = Array.prototype.slice.call(arguments, 0);
							callback.apply(this, args);
						};
					}
					
					if (params.uncheckedCallback !== 'undefined' && typeof params.uncheckedCallback === 'function') {
						// Wrap the function in a generic handler so we can pass in custom args
						callback = params.uncheckedCallback;
						params.uncheckedCallback = function () {													
							var args = Array.prototype.slice.call(arguments, 0);
							callback.apply(this, args);
						};
					}
					
					if ($(event.currentTarget).is(':checked')) {
						if (params.checkedCallback !== 'undefined' && typeof params.checkedCallback === 'function') {
							params.checkedCallback();
						}
						
						target.closest('.fieldgroup').show();
					} else {
						if (params.uncheckedCallback !== 'undefined' && typeof params.uncheckedCallback === 'function') {
							params.uncheckedCallback();
						}
								
						target.closest('.fieldgroup').hide();
					}
				}
					
				if (!isArray) {
					doAction(target);
				} else {
					$.each(target, function (idx, obj) {
						target = obj;
						doAction(target);
					});
				}
			},
			enumerable: true,
			configurable: false,
			writable: true
		}
	});
	
	return behavior.init(event, params);
};