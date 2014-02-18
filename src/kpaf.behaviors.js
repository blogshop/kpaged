App.Behaviors = App.Behaviors || {};

App.Behaviors.DisableElement = function (event, params) {
	var behavior = Object.create(App.Widgets.Behavior(), {
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