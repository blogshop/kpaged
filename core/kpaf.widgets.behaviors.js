App.Widgets.Behaviors = App.Widgets.Behaviors || {};

App.Widgets.Behaviors.OnSelectIsDisabled = function (event, params) {
	var behavior = Object.create(App.Behavior(), {
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
	var behavior = Object.create(App.Behavior(), {
		execute: {
			value: function () {
				var params = this._params,
					event = this.getEvent(),
					dataItem = event.sender.dataItem() || '',
					isWidget = (this._target.hasOwnProperty('element')) ? true : false,
					isArray = (this._target instanceof Array) ? true : false,
					target,
					getTarget,
					doAction;
					
				// Are we dealing with a widget or a DOM element?
				//target = (isWidget) ? target.element : target;
				getTarget = function (target) {
					isWidget = target.hasOwnProperty('element') ? true : false;		
					return (isWidget) ? target.element : target;
				};
				
				doAction = function (target) {
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
				};
					
				if (dataItem !== '') {
					target = getTarget(this._target);
					
					if (!isWidget && !isArray) {
						doAction(target);
					} else {
						if (isWidget) {
							doAction(target);
						} else if (isArray) {
							$.each(target, function (idx, obj) {
								target = getTarget(obj);
								doAction(target);
							});
						}
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

App.Widgets.Behaviors.OnSelectDisplayFieldGroup = function (event, params) {
	var behavior = Object.create(App.Behavior(), {
		execute: {
			value: function () {
				var params = this._params,
					event = this.getEvent(),
					dataItem = event.sender.dataItem() || '',
					isWidget = (this._target.hasOwnProperty('element')) ? true : false,
					isArray = (this._target instanceof Array) ? true : false,
					target,
					getTarget,
					doAction;
					
				// Are we dealing with a widget or a DOM element?
				//target = (isWidget) ? target.element : target;
				getTarget = function (target) {
					isWidget = target.hasOwnProperty('element') ? true : false;		
					return (isWidget) ? target.element : target;
				};
				
				doAction = function (target) {
					var matchCallback,
						nonMatchCallback;
					
					if (typeof params.matchCallback !== 'undefined' && typeof params.matchCallback === 'function') {
						// Wrap the function in a generic handler so we can pass in custom args
						callback = params.matchCallback;
						params.matchCallback = function () {													
							var args = Array.prototype.slice.call(arguments, 0);
							callback.apply(this, args);
						};
					}
					
					if (typeof params.nonMatchCallback !== 'undefined' && typeof params.nonMatchCallback === 'function') {
						// Wrap the function in a generic handler so we can pass in custom args
						callback = params.nonMatchCallback;
						params.nonMatchCallback = function () {													
							var args = Array.prototype.slice.call(arguments, 0);
							callback.apply(this, args);
						};
					}
						
					// Multiple matches
					if (params.matches instanceof Array) {
						// Regex match might be better...
						if (params.matches.indexOf(dataItem.Key) !== -1) {
							if (typeof params.matchCallback !== 'undefined' && typeof params.matchCallback === 'function') {
								params.matchCallback();
							}
							
							target.closest('.fieldgroup').show();
						} else {
							if (typeof params.nonMatchCallback !== 'undefined' && typeof params.nonMatchCallback === 'function') {
								params.nonMatchCallback();
							}
							
							target.closest('.fieldgroup').hide();
						}
					// Single match
					} else {
						if (dataItem.Key === true || dataItem.Key === params.matches) {
							if (typeof params.matchCallback !== 'undefined' && typeof params.matchCallback === 'function') {
								params.matchCallback();
							}
							
							target.closest('.fieldgroup').show();
						} else {
							if (typeof params.nonMatchCallback !== 'undefined' && typeof params.nonMatchCallback === 'function') {
								params.nonMatchCallback();
							}
							
							target.closest('.fieldgroup').hide();
						}
					}
				};
					
				if (dataItem !== '') {
					target = getTarget(this._target);
					
					if (!isWidget && !isArray) {
						doAction(target);
					} else {
						if (isWidget) {
							doAction(target);
						} else if (isArray) {
							$.each(target, function (idx, obj) {
								target = getTarget(obj);
								doAction(target);
							});
						}
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

App.Widgets.Behaviors.OnSelectCascade = function (event, params) {
	var behavior = Object.create(App.Behavior(), {
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
	var behavior = Object.create(App.Behavior(), {
		execute: {
			value: function () {
				var params = this._params,
					event = this.getEvent(),
					dataItem = event.sender.dataItem() || '',
					isWidget = (this._target.hasOwnProperty('element')) ? true : false,
					isArray = (this._target instanceof Array) ? true : false,
					target,
					getTarget,
					doAction;
					
				// Are we dealing with a widget or a DOM element?
				//target = (isWidget) ? target.element : target;
				getTarget = function (target) {
					isWidget = target.hasOwnProperty('element') ? true : false;		
					return (isWidget) ? target.element : target;
				};
				
				doAction = function (target) {
					// Multiple matches
					if (params.matches instanceof Array) {
						// Regex match might be better...
						if (params.matches.indexOf(dataItem.Key) !== -1) {
							kendo.unbind(target, App.getCurrent().getBlock('center-pane').getViewModel());
							target.attr('required', true);
							kendo.bind(target, App.getCurrent().getBlock('center-pane').getViewModel());
						} else {
							kendo.unbind(target, App.getCurrent().getBlock('center-pane').getViewModel());
							target.removeAttr('required');
							kendo.bind(target, App.getCurrent().getBlock('center-pane').getViewModel());
						}
					// Single match
					} else {
						if (dataItem.Key === true || dataItem.Key === params.matches) {
							kendo.unbind(target, App.getCurrent().getBlock('center-pane').getViewModel());
							target.attr('required', true);
							kendo.bind(target, App.getCurrent().getBlock('center-pane').getViewModel());
						} else {
							kendo.unbind(target, App.getCurrent().getBlock('center-pane').getViewModel());
							target.removeAttr('required');
							kendo.bind(target, App.getCurrent().getBlock('center-pane').getViewModel());
						}
					}
				};
					
				if (dataItem !== '') {
					target = getTarget(this._target);
					
					if (!isWidget && !isArray) {
						doAction(target);
					} else {
						if (isWidget) {
							doAction(target);
						} else if (isArray) {
							$.each(target, function (idx, obj) {
								target = getTarget(obj);
								doAction(target);
							});
						}
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

App.Widgets.Behaviors.OnSelectClearGrid = function (event, params) {
	var behavior = Object.create(App.Behavior(), {
		execute: {
			value: function () {
				var params = this._params,
					event = this.getEvent(),
					dataItem = event.sender.dataItem() || '',
					isWidget = (this._target.hasOwnProperty('element')) ? true : false,
					isArray = (this._target instanceof Array) ? true : false,
					target,
					doAction;
				
				doAction = function (target) {
					// Multiple matches
					if (params.matches instanceof Array) {
						// Regex match might be better...
						if (params.matches.indexOf(dataItem.Key) !== -1) {
							for (var idx = target.dataSource.data().length - 1; idx > -1; idx--) {
								target.dataSource.remove(target.dataSource.at(idx));
							}
							
							target.dataSource.sync();
						}
					// Single match
					} else {
						if (dataItem.Key === true || dataItem.Key === params.matches) {
							for (var idx = target.dataSource.data().length - 1; idx > -1; idx--) {
								target.dataSource.remove(target.dataSource.at(idx));
							}
							
							target.dataSource.sync();
						}
					}
				};
					
				if (dataItem !== '') {
					target = this._target;
					
					if (!isWidget && !isArray) {
						doAction(target);
					} else {
						if (isWidget) {
							doAction(target);
						} else if (isArray) {
							$.each(target, function (idx, obj) {
								target = getTarget(obj);
								doAction(target);
							});
						}
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

App.Widgets.Behaviors.OnSelectActivateTab = function (event, params) {
	var behavior = Object.create(App.Behavior(), {
		execute: {
			value: function () {
				var params = this._params,
					event = this.getEvent(),
					dataItem = event.sender.dataItem() || '',
					isWidget = (this._target.hasOwnProperty('element')) ? true : false,
					isArray = (this._target instanceof Array) ? true : false,
					target,
					doAction;
				
				doAction = function (target) {
					var tabToActivate;
					
					// Multiple matches
					if (params.matches instanceof Array) {
						// Regex match might be better...
						if (params.matches.indexOf(dataItem.Key) !== -1) {
							if (params.hasOwnProperty('tab')) {
								target.activateTab(params.tab);
							}
						} else {
							if (params.hasOwnProperty('tab')) {								
								target.deactivateTab(params.tab);
							}
						}
					// Single match
					} else {
						if (dataItem.Key === true || dataItem.Key === params.matches) {
							if (params.hasOwnProperty('tab')) {								
								target.activateTab(params.tab);
							}
						} else {
							if (params.hasOwnProperty('tab')) {								
								target.deactivateTab(params.tab);
							}
						}
					}
				};
					
				if (dataItem !== '') {
					target = this._target;
					
					if (!isWidget && !isArray) {
						doAction(target);
					} else {
						if (isWidget) {
							doAction(target);
						} else if (isArray) {
							$.each(target, function (idx, obj) {
								target = getTarget(obj);
								doAction(target);
							});
						}
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

App.Widgets.Behaviors.OnSelectEnableTab = function (event, params) {
	var behavior = Object.create(App.Behavior(), {
		execute: {
			value: function () {
				var params = this._params,
					event = this.getEvent(),
					dataItem = event.sender.dataItem() || '',
					isWidget = (this._target.hasOwnProperty('element')) ? true : false,
					isArray = (this._target instanceof Array) ? true : false,
					target,
					doAction;
				
				doAction = function (target) {
					var matchCallback,
						nonMatchCallback;
					
					if (typeof params.matchCallback !== 'undefined' && typeof params.matchCallback === 'function') {
						// Wrap the function in a generic handler so we can pass in custom args
						callback = params.matchCallback;
						params.matchCallback = function () {													
							var args = Array.prototype.slice.call(arguments, 0);
							callback.apply(this, args);
						};
					}
					
					if (typeof params.nonMatchCallback !== 'undefined' && typeof params.nonMatchCallback === 'function') {
						// Wrap the function in a generic handler so we can pass in custom args
						callback = params.nonMatchCallback;
						params.nonMatchCallback = function () {													
							var args = Array.prototype.slice.call(arguments, 0);
							callback.apply(this, args);
						};
					}
					
					// Multiple matches
					if (params.matches instanceof Array) {
						// Regex match might be better...
						if (params.matches.indexOf(dataItem.Key) !== -1) {
							if (params.hasOwnProperty('tabIndex')) {
								if (typeof params.matchCallback !== 'undefined' && typeof params.matchCallback === 'function') {
									params.matchCallback();
								}
								
								target.enable(target.tabGroup.find('[role=tab]').get(params.tabIndex), true);
							}
						} else {
							if (params.hasOwnProperty('tabIndex')) {								
								if (typeof params.nonMatchCallback !== 'undefined' && typeof params.nonMatchCallback === 'function') {
									params.nonMatchCallback();
								}
								
								target.enable(target.tabGroup.find('[role=tab]').get(params.tabIndex), false);
							}
						}
					// Single match
					} else {
						if (dataItem.Key === true || dataItem.Key === params.matches) {
							if (params.hasOwnProperty('tabIndex')) {								
								if (typeof params.matchCallback !== 'undefined' && typeof params.matchCallback === 'function') {
									params.matchCallback();
								}
								
								target.enable(target.tabGroup.find('[role=tab]').get(params.tabIndex), true);
							}
						} else {
							if (params.hasOwnProperty('tabIndex')) {								
								if (typeof params.nonMatchCallback !== 'undefined' && typeof params.nonMatchCallback === 'function') {
									params.nonMatchCallback();
								}
								
								target.enable(target.tabGroup.find('[role=tab]').get(params.tabIndex), false);
							}
						}
					}
				};
					
				if (dataItem !== '') {
					target = this._target;
					
					if (!isWidget && !isArray) {
						doAction(target);
					} else {
						if (isWidget) {
							doAction(target);
						} else if (isArray) {
							$.each(target, function (idx, obj) {
								target = getTarget(obj);
								doAction(target);
							});
						}
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

App.Widgets.Behaviors.MultiSelectedDisplayFieldGroup = function (event, params) {
	var behavior = Object.create(App.Behavior(), {
		execute: {
			value: function () {
				var params = this._params,
					event = this.getEvent(),
					dataItems = event.sender.dataItems() || '',
					dataKeys = [],
					isWidget = (this._target.hasOwnProperty('element')) ? true : false,
					isArray = (this._target instanceof Array) ? true : false,
					target,
					getTarget,
					doAction;
				
				if (dataItems !== '' && dataItems.length > 0) {
					$.each(dataItems, function (idx, dataItem) {
						dataKeys.push(dataItem.Key);
					});
				}
				
				// Are we dealing with a widget or a DOM element?
				//target = (isWidget) ? target.element : target;
				getTarget = function (target) {
					isWidget = target.hasOwnProperty('element') ? true : false;		
					return (isWidget) ? target.element : target;
				};
				
				doAction = function (target) {
					var matchCallback,
						nonMatchCallback;
					
					if (typeof params.matchCallback !== 'undefined' && typeof params.matchCallback === 'function') {
						// Wrap the function in a generic handler so we can pass in custom args
						callback = params.matchCallback;
						params.matchCallback = function () {													
							var args = Array.prototype.slice.call(arguments, 0);
							callback.apply(this, args);
						};
					}
					
					if (typeof params.nonMatchCallback !== 'undefined' && typeof params.nonMatchCallback === 'function') {
						// Wrap the function in a generic handler so we can pass in custom args
						callback = params.nonMatchCallback;
						params.nonMatchCallback = function () {							
							var args = Array.prototype.slice.call(arguments, 0);
							callback.apply(this, args);
						};
					}
						
					// Are there match requirements?
					if (params.hasOwnProperty('matches')) {
						// Specific matches
						if (params.matches instanceof Array) {							
							if (App.Helpers.Array.intersect(params.matches, dataKeys).length > 0) {
								if (typeof params.matchCallback !== 'undefined' && typeof params.matchCallback === 'function') {
									params.matchCallback();
								}
								
								target.closest('.fieldgroup').show();
							} else {
								if (typeof params.nonMatchCallback !== 'undefined' && typeof params.nonMatchCallback === 'function') {
									params.nonMatchCallback();
								}
								
								target.closest('.fieldgroup').hide();
							}
						// Specific match
						} else if (typeof params.matches === 'string' && params.matches !== '') {
							if (dataKeys.indexOf(params.matches) !== -1) {
								if (typeof params.matchCallback !== 'undefined' && typeof params.matchCallback === 'function') {
									params.matchCallback();
								}
								
								target.closest('.fieldgroup').show();
							} else {
								if (typeof params.nonMatchCallback !== 'undefined' && typeof params.nonMatchCallback === 'function') {
									params.nonMatchCallback();
								}
								
								target.closest('.fieldgroup').hide();
							}
						}
					} else {
						if (dataItems.length > 0) {
							target.closest('.fieldgroup').show();
						} else {
							target.closest('.fieldgroup').hide();
						}
					}
				};
				
				target = getTarget(this._target);
				
				if (!isWidget && !isArray) {
					doAction(target);
				} else {
					if (isWidget) {
						doAction(target);
					} else if (isArray) {
						$.each(target, function (idx, obj) {
							target = getTarget(obj);
							doAction(target);
						});
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

App.Widgets.Behaviors.OnCheckedEnableWidget = function (event, params) {
	var behavior = Object.create(App.Behavior(), {
		execute: {
			value: function () {
				var params = this._params,
					event = this.getEvent(),
					isWidget = (this._target.hasOwnProperty('element')) ? true : false,
					isArray = (this._target instanceof Array) ? true : false,
					target,
					doAction;
				
				doAction = function (target) {
					if ($(event.currentTarget).is(':checked')) {
						target.enable(true);
					} else {
						target.enable(false);
					}
				};
					
				target = this._target;
				
				if (isWidget) {
					doAction(target);
				} else if (isArray) {
					$.each(target, function (idx, obj) {
						target = obj;
						if (target.hasOwnProperty('element')) {
							doAction(target);
						}
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
																			
App.Widgets.Behaviors.UpdateWidget = function (event, params) {
	/*var behavior = Object.create(App.Behavior(), {
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