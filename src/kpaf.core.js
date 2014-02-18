/**
 * Kendo UI Paged Application Framework (kPaged)
 *
 * @author Lucas Lopatka
 * @version 1.0
 *
 * This is the Kendo Paged Application Framework core. Don't mess with it unless you're a Jedi Master.
 *
 */

/**********************************************************
 * Declare GLOBAL Namespace: App
 *
 * We don't want to pollute the global namespace, so we're 
 * going to encapsulate everything under a single variable 
 **********************************************************/
 
//"use strict";

(function ($) {	
	$.fn.serializeObject = function () {
		var o = {};
		var a = this.serializeArray({ checkboxesAsBools: true});
		$.each(a, function () {
			if (o[this.name]) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
	 
		return o;
	};
	 
	$.fn.serializeArray = function (options) {
		var o = $.extend({
			checkboxesAsBools: false
		}, options || {});
	 
		var rselectTextarea = /select|textarea/i;
		var rinput = /text|hidden|password|search/i;
	 
		return this.map(function () {
			return this.elements ? $.makeArray(this.elements) : this;
		})
		.filter(function () {
			return this.name && !this.disabled && (this.checked || (o.checkboxesAsBools && this.type === 'checkbox') || rselectTextarea.test(this.nodeName) || rinput.test(this.type));
		})
		.map(function (i, elem) {
			var val = $(this).val();
			return val === null ?
			null :
			$.isArray(val) ?
			$.map(val, function (val, i) {
				return { name: elem.name, value: val };
			}) :
			{
				name: elem.name,
				value: (o.checkboxesAsBools && this.type === 'checkbox') ? //moar ternaries!
					(this.checked ? 'true' : 'false') :
					val
			};
		}).get();
	};
	
	
	kendo.data.binders.widget.observables = kendo.data.Binder.extend({
        init: function (widget, bindings, options) {
			kendo.data.Binder.fn.init.call(this, widget, bindings, options);
            
		},
        refresh: function () {
			
		}
    });
})(jQuery);

// This construct can be improved - should ideally be self-executing
var App = window.App = window.App || {
	_config: {},
	_errorHandler: {},
	_eventHandler: {},
	_events: {},
	_loader: {},
	_router: {},
	_pages: {},
	_page: {}, // Current (initialized) page
	
	init: function (config) {	
		var that = this,
			eventHandler,
            eventHandlerAdapter,
			router;
		
		this.Entities = window.EntityFramework.Entities;
		
		// Initialize and register the config hash
		this._config = Object.create(App.Utilities.ChainableHash(), {});
		
		// Initialize an empty hash to store pages and set it to config
		this._config.set('pages', Object.create(App.Utilities.ChainableHash(), {}));
		this._pages = Object.create(App.Utilities.ChainableHash(), {});
		
		// Initialize an empty hash to store modules that have been loaded via App.addBlock
		this._config.set('blocks', Object.create(App.Utilities.ChainableHash(), {}));
		
		// Initialize an empty hash to store modules that have been loaded via App.addModule
		this._config.set('modules', Object.create(App.Utilities.ChainableHash(), {}));
		
		// Initialize and register the resource loader
		this._loader = App.Loader();
		
		// Load the application config file
		this.load('script', config.configFile, { 
			ajaxOptions: {
				async: false
			}
		});
		
		// Merge and set configuration parameters
		config = $.extend({}, App.Config.defaults(), config);
		$.each(config, function (key, value) {
			that._config.set(key, value);
		});
		
		// Initialize and register the router
		this._router = App.Router(App.Routers.Adapters.Crossroads(), {});
		
		// Initialize and register the global event handler
		eventHandlerAdapter = App.EventHandlers.Adapters.Signals(this._config.get('events'));
		eventHandler = this._eventHandler = Object.create(App.EventHandler(eventHandlerAdapter), {});
		this._events = eventHandler.getEvents();
		
		return this;
	},
	execute: function () {
		var that = this,
			pages,
			router;
			
			
		pages = App.getConfig('pages');
		router = App.getRouter();
		
		// Add routes
		pages.each(function (name, config) {
			if (config.hasOwnProperty('route')) {
				if (typeof config.route === 'string') {
					router.add(config.route);
				} else if (typeof config.route === 'object') {
					router.add(config.route.pattern);
				}
			}
		});
		
		// Rebuild URL fragments so they're in a consistent order
		var url = [
			window.location.pathname,
			window.location.search,
			window.location.hash,
		].join('');
		
		router.parse(window.location.pathname)
		console.log(window.location.pathname);
		
		// Kendo UI TabStrip switcher
		router.add('/{path*}/field/{attr}/{ref}', function (path, attr, ref) {
			var field,
				panel,
				panels,
				idx,
				tablist,
				role,
				widget;
				
			// Get the field
			field = $('#center-pane').find('[' + attr + '=' + ref + ']');
			
			// Get the index of the closest tabpanel
			panel = field.closest('[role=tabpanel]');
			panels = panel.parent().children('[role=tabpanel]');
			idx = panels.index(panel);
			
			// Get the widget
			tablist = panel.closest('[role=tablist]');
			role = tablist.attr('data-role');
			
			if (role === 'semantictabstrip') {
				widget = tablist.data('kendoSemanticTabStrip');
			} else if (role === 'tabstrip') {
				widget = tablist.data('kendoTabStrip');
			}
			
			widget.select(idx);
		});
		
		// TODO: This is pretty terrible (I mean here, the code's all good)! Move somewhere else...
		var semantictabstrips = $(document.body).find('.k-tabstrip');
		semantictabstrips.each(function (idx, tabstrip) {
			tabstrip = $(tabstrip).data('kendoSemanticTabStrip');
			tabstrip.contentElements.each(function (idx, contentElement) {
				$(contentElement).on({
					blur: function (e) {
						var current = App.getCurrent(),
							block = current.getBlock('center-pane'),
							validator = block.getValidator(),
							errorHandler = current.getErrorHandler(),
							errorPanel = $('[name=ErrorPanel]').data('kendoEventPanelBar');

						if (validator.silentValidate() === false) {
							errorHandler.setErrors('validation', validator._errors);
						}
					}
				}, '.k-input');
			});
		});
	},
	addPage: function (pageName, config) {
		// TODO: Defaults should be set in app.config.js
		var defaults = {
				events: {
					isLoaded: function () {
						var widgetTypes = App.Config.Widgets.defaults(),
							widgets,
							page = App.getCurrent(),
							block = page.getBlock('center-pane'),
							viewModel = block.getViewModel(),
							validator = block.getValidator(),
							options = {};
						
						options = $.extend(true, {}, validator.options, options);
						
						block._validator = $('#center-pane.k-pane').first().kendoSilentValidator(options).data('kendoSilentValidator');
						
						// Something is changing all the date fields to text fields
						$('[data-role=datepicker], [data-role=datetimepicker]').attr('type', 'date');
						
						// HACK: Chrome's HTML5 datepicker sucks
						$('input[type="date"]').prop('type', 'text');
					}
				}
			},
			pages = this.getConfig('pages');
			
		// Merge defaults with options
		config = $.extend(true, { name: pageName }, defaults, config) || defaults;
		
		pages.set(pageName, config);
	},
	addBlock: function (blockName, config) {
		var defaults = {},
			blocks = this.getConfig('blocks');
		
		// Merge defaults with options
		config = $.extend({
			name: blockName
		}, defaults, config) || defaults;
		
		blocks.set(blockName, config);
    },
	addModule: function (moduleName, config) {
		var defaults = {},
			modules = this.getConfig('modules');
		
		// Merge defaults with options
		config = $.extend({
			name: moduleName
		}, defaults, config) || defaults;
		
		modules.set(moduleName, config);
    },
	loader: function () {
		return this._loader;
	},
	load: function (type, url, options) {
		this._loader.load(type, url, options);
	},
	getPages: function () {
		return this._pages;
	},
	getPageNames: function () {
		return Object.keys(this._pages.items);
	},
	getPage: function (pageName) {
		return this._pages.get(pageName);
	},
	setPage: function (pageName, instance) {
		this._pages.set(pageName, instance);
	},
	getCurrent: function () {
		return this._current;
	},
	setCurrent: function (pageName, instance) {		
		// Register the page instance
		if (this._pages.has(pageName) === false) {
			this._pages.set(pageName, instance);
		}
		
		this._current = instance;
		return this;
	},
	getConfig: function (key) {
		return (key) ? this._config.get(key) : this._config;
	},
	setConfig: function (key, value) {
		this._config.set(key, value);
		return this;
	},
	buildMenu: function (selector) {
		var pages,
			source,
			item,
			menu;
		
		pages = this.getConfig('pages');
		source = [];
		
		if (pages) {
			pages.each(function (name, config) {
				item = {
					text: name,
					url: config.url || ''
				};
				
				source.push(item);
			});
		}
		
		menu = $(selector).kendoMenu({
			dataSource: source
		});
	},
	getRouter: function () {
		return this._router;
	}
};

/**
 * Object: App.Loader
 * Type: Class
 *
 * Asynchronous file loader
 */
App.Loader = function () {
	var loader = Object.create({
		_eventHandler: {},
		_types: ['html', 'json', 'script', 'template', 'module', 'block', 'page'], // Don't change these! If they were supposed to be editable, they would be in the config!
		_events: ['success', 'error', 'complete'], // Similar to jQuery's $.ajax events
		_queue: {},
		
		init: function () {
			// Create a queue to store resource references and their respective event handlers
			this._queue = Object.create(App.Utilities.ChainableHash(), {});
			
			return this;
		},
		getResourceEventHandler: function (resource) {
			return this._queue.get(resource);
		},
		setResourceEventHandler: function (resource, handler) {
			this._queue.set(resource, handler);
			return this;
		},
		load: function (type, source, options) {
			var that = this,
				options = options || {},
				eventHandlerAdapter = App.EventHandlers.Adapters.Signals(this._events),
				eventHandler = Object.create(App.EventHandler(eventHandlerAdapter), {}),
				inQueue = false;
			
			
			if (this._queue.has(source)) {
				inQueue = true;
			}
			
			this.setResourceEventHandler(source, eventHandler);
			
			if (this._types.indexOf(type) !== -1) {
				switch (type) {					
					case 'template':
						type = 'html';
						
						options = $.extend({}, {
							ajaxOptions: {
								async: false
							},
							events: {
								success: function (data, status, xhr) {
									if (inQueue === false) {
										$(document.body).append(data);
									}
								}
							}
						}, options);
						break;
						
					case 'module':
						type = 'script';
						
						options = $.extend({
							ajaxOptions: {
								async: false, // If the DOMBuilder starts before all the modules are loaded, they won't render
								cache: false
							}
						}, options);
						break;
						
					case 'block':
						type = 'script';
						
						options = $.extend({
							ajaxOptions: {
								async: false, // If the DOMBuilder starts before all the blocks are loaded, they won't render
								cache: false
							}
						}, options);
						break;
						
					case 'page':
						type = 'script';
						
						options = $.extend({
							ajaxOptions: {
								async: false,
								cache: false
							}
						}, options);
						break;
						
					default:
						break;
				}
				
				this._load(type, source, options);
			}
		},
		_load: function (type, source, options) {
			var options = options || {},
				ajaxOptions = {},
				eventHandler = this.getResourceEventHandler(source),
				events = {},
				event,
				response;
			
			if (options.hasOwnProperty('events')) {
				events = options.events;
			}
			
			if (options.hasOwnProperty('ajaxOptions')) {
				ajaxOptions = options.ajaxOptions;
			}
			
			// Register event listeners
			this._registerListeners(source, events);
			
			// Allow user to set any option except for dataType, cache, and url
			ajaxOptions = $.extend({}, ajaxOptions, {
				dataType: type,
				cache: true,
				url: source,
				// jqXHR xhr, String status
				// Valid statuses: "success", "notmodified", "error", "timeout", "abort", or "parsererror"
				complete: function (xhr, status) {
					// Trigger complete event
					if (eventHandler.hasEvent('complete')) {
						event = eventHandler.getEvent('complete');
						event.dispatch(xhr, status);
					}
				},
				// jqXHR xhr, String status, String error
				// Valid statuses: "success", "notmodified", "error", "timeout", "abort", or "parsererror"
				error: function (xhr, status, error) {
					// Trigger error event
					if (eventHandler.hasEvent('error')) {
						event = eventHandler.getEvent('error');
						event.dispatch(xhr, status, error);
					}
				},
				// PlainObject data, String status, jqXHR xhr
				// Valid statuses: "success", "notmodified", "error", "timeout", "abort", or "parsererror"
				success: function (data, status, xhr) {					
					// Trigger success event
					if (eventHandler.hasEvent('success')) {
						event = eventHandler.getEvent('success');
						event.dispatch(data, status, xhr);
					}
				}
			});
			
			response = $.ajax(ajaxOptions);
			
			// Return the jqXHR object so we can chain callbacks
			return response;
		},
		_registerListeners: function (resource, events) {
			var eventHandler = this.getResourceEventHandler(resource),
				event,
				listener;
				
			if (typeof events === 'object' && Object.keys(events).length > 0) {
				$.each(events, function (eventName, listeners) {	
					event = eventHandler.getEvent(eventName);
					
					if (event) {
						switch (typeof listeners) {
							// TODO: Double check this one!
							case 'string':
								listener = listeners;
								eventHandler.addEventListener(eventName, listener);
								break;
								
							case 'array':
								$.each(listeners, function (idx, listener) {
									eventHandler.addEventListener(eventName, listener);
								});
								break;
							
							case 'function':
								listener = listeners;
								eventHandler.addEventListener(eventName, listener);
								break;
							
							case 'object':
								$.each(listeners, function (idx, listener) {
									eventHandler.addEventListener(eventName, listener);
								});
								break;
							
							default:
								break;
						}
					}
				});
			}			
		}
	});
	
	return loader.init();
};

/**
 * Object: App.URL
 * Type: Class
 *
 * Base class for all URLs
 */
App.URL = function () {
	var url = Object.create({
		data: {},
		template: {},
		
		init: function () {
			return this;
		},
		setTemplate: function () {
			var templateContent = $("#myTemplate").html(),
				result;
			
			this.template = kendo.template(templateContent);
			this.data = [
				{ name: "", isAdmin: false },
				{ name: "", isAdmin: true }
			];
			
			$("#users").html(result);
		},
		render: function () {
			return kendo.render(this.template, this.data);
		}
	});
	
	return url.init();
};

/**
 * Object: App.Router
 * Type: Class
 *
 * Base class for all pages
 */
App.Router = function (adapter, options)  {
	var router = Object.create({
		_adapter: {},
		_hasher: {},
		
		adapter: function () {
			return this._adapter;
		},
		
		init: function (options) {
			this._adapter = adapter;
			
			return this;
		},
		current: function () {
			if (typeof this._adapter.current === 'function') {
				return this._adapter.current();
			}
			
			return false;
		},
		routes: function () {
			return this._adapter.router()._routes;
		},
		add: function (pattern, callback) {
			// Default -- no controller, just render the page
			callback = callback || function () {
				var pages, page, pageName;
				
				pages = App.getConfig('pages');
				pages.each(function (name, config) {
					if (config.hasOwnProperty('route')) {
						if (config.route === pattern || config.route.pattern === pattern) {
							page = new App.Page().init(config);
							pageName = name;
						}
					}
				});
				
				if (page !== 'undefined') {
					// Load the page
					App.setCurrent(pageName, page).getCurrent().load();
				} else {
					// Throw exception
				}
			};
			
			this._adapter.add(pattern, callback);
			
			return this;
		},
		remove: function () {
			this._adapter.remove();
			return this;
		},
		removeAll: function () {
			this._adapter.removeAll();
			return this;
		},
		parse: function (request) {
			this._adapter.parse(request);		
			return this;
		},
		destroy: function () {
			this._adapter.destroy();
			return this;
		},
		reset: function () {
			this._adapter.reset();
			return this;
		}
	});
	
	return router.init(options);
};

/**********************************************************
 * Namespace: App.Routers
 **********************************************************/
App.Routers = App.Routers || {};

/**********************************************************
 * Namespace: App.Routers.Adapters
 **********************************************************/
App.Routers.Adapters = App.Routers.Adapters || {
	/**
	 * Adapter for Kendo UI Router
	 * 
	 */
	Kendo: function (options) {
		// This router sucks
		var router = Object.create({
			_router: {},
			
			router: function () {
				return this._router;
			},
			
			init: function () {
				this._router = new kendo.Router();
				return this;
			},
			add: function (route, callback) {
				route = this._router.route(route, callback);
				return this;
			},
			remove: function (route) {
				return this;
			},
			removeAll: function () {
				return this;
			},
			parse: function (request) {
			},
			destroy: function () {
				this._router.destroy();
				return this;
			},
			reset: function () {
				return this;
			}
		});
		
		return router.init(options);
	},
	/**
	 * Adapter for Crossroads.js
	 *
	 * Credits to Miller Medeiros
	 * Crossroads.js Javascript Routes System
	 * http://millermedeiros.github.io/crossroads.js
	 */
	Crossroads: function (options) {
		var router = Object.create({
			_router: {},
			_hasher: {},
			_current: {},
			
			/**
			 * Method: App.Router.Crossroads.router
			 *
			 * Signal dispatched every time that crossroads.parse can't find a Route that matches the request. 
			 * Useful for debuging and error handling. 
			 *
			 * @return Crossroads object
			 */
			router: function () {
				return this._router;
			},
			/**
			 * Method: App.Router.Crossroads.hasher
			 *
			 * @return Crossroads object
			 */
			hasher: function () {
				return this._hasher;
			},
			
			/**
			 * Method: App.Router.bypassed
			 *
			 * Signal dispatched every time that crossroads.parse can't find a Route that matches the request. 
			 * Useful for debuging and error handling. 
			 *
			 * @return Signal object
			 */
			bypassed: function () {
				return this._router.bypassed;
			},
			/**
			 * Method: App.Router.routed
			 *
			 * Signal dispatched every time that crossroads.parse finds a Route that matches the request.
			 * Useful for debuging and for executing tasks that should happen at each routing. 
			 *
			 * @return Signal object
			 */
			routed: function () {
				return this._router.routed;
			},
			/**
			 * Method: App.Router.greedy
			 *
			 * Sets the global route matching behavior to greedy so crossroads will try to match every single route with the supplied request.
			 * If true it won't stop at the first match.
			 *
			 * @value bool
			 * 
			 * @return this
			 */
			greedy: function (value) {
				value = value || false;
				this._router.greedy = value;
				return this;
			},
			
			init: function () {
				var that = this;
				
				// Make sure Crossroads is loaded
				if (window.hasOwnProperty('crossroads')) {
					this._router = crossroads.create();
					
					if (window.hasOwnProperty('hasher')) {
						this._hasher = window.hasher;
						this._hasher.changed.add(function (hash, oldhash) {
							var url = [
								window.location.pathname,
								window.location.search,
								'#/' + hash
							].join('');
							
							that.parse(url);
						});
						
						this._hasher.init();
					}
					
					return this;
				}
			},
			current: function () {
				return this._current;
			},
			add: function (pattern, callback, priority) {
				var route = this._current = this._router.addRoute(pattern, callback, priority);
				return this;
			},
			remove: function (route) {
				this._router.removeRoute(route);
				return this;
			},
			removeAll: function () {
				this._router.removeAllRoutes();
				return this;
			},
			parse: function (request, defaults) {
				this._router.parse(request, defaults);
				return this;
			},
			destroy: function () {
				return this;
			},
			reset: function () {
				this._router.resetState();
				return this;
			}
		});
		
		return router.init(options);
	},
	/**
	 * Adapter for Hasher.js
	 *
	 * Credits to Miller Medeiros
	 * Hasher
	 * https://github.com/millermedeiros/Hasher
	 */
	Hasher: function (options) {
		var router = Object.create({
			_hasher: {},
			_current: {},
			
			init: function () {
			},
			adapter: function () {
				return this._router;
			},
			current: function () {
				return this._current;
			},
			add: function (pattern, callback, priority) {
			},
			remove: function (route) {
			},
			removeAll: function () {
			},
			parse: function (request, defaults) {
			},
			destroy: function () {
			},
			reset: function () {
			}
		});
		
		return router.init(options);
	}
};

// Manages hooks
App.EventHandler = function (adapter) {
	var eventHandler = Object.create({
		_adapter: {},
		
		init: function (adapter) {
			this._adapter = adapter;
			
			return this;
		},
		adapter: function () {
			if (typeof this._adapter.adapter === 'function') {
				return this._adapter.adapter();
			}
			
			return false;
		},
		addEventListener: function (eventName, callback, scope) {
			this._adapter.addEventListener(eventName, callback, scope);
		},
		removeEventListener: function (eventName, callback, scope) {
			this._adapter.removeEventListener(eventName, callback, scope);
		},
		hasEventListener: function (eventName) {
			this._adapter.hasEventListener(eventName);
		},
		dispatch: function (eventName, target) {
			this._adapter.dispatch(eventName, target);
		},
		getEvents: function () {
			var adapter = this.adapter();
			
			if (adapter === false) {
				// TODO: Throw exception
				return false;
			}
			
			return adapter.getEvents();
		},
		getEvent: function (event) {
			var adapter = this.adapter();
			
			if (adapter === false) {
				// TODO: Throw exception
				return false;
			}
			
			return adapter.getEvent(event);
		},
		hasEvent: function (event) {
			var adapter = this.adapter();
			
			if (adapter === false) {
				// TODO: Throw exception
				return false;
			}
			
			return adapter.hasEvent(event);
		}
	});
	
	return eventHandler.init(adapter);
};

// Abstract Observable 
App.Observable = function () {
	var observable = Object.create({
		_subscribers: {}, // TODO: Pretty sure this is flawed... use events instead.
		_eventHandler: {},
		
		init: function () {
			this._subscribers = Object.create(App.Utilities.ChainableHash(), {});
			
			return this;
		},
		subscribe: function (name, subscriber) {			
			this._subscribers.set(name, subscriber);
			
			return this;
		},
		unsubscribe: function (name) {
			this._subscribers.remove(name);
			
			return this;
		},
		hasSubscriber: function (name) {
			return this._subscribers.has(name) ? true : false;
		},
		notify: function (eventName, event, data) {
			var hasEventHandler = false,
				eventHandler,
				eventName = eventName || 'default',
				event;
				
			if (this._subscribers.length > 0) {
				this._subscribers.each(function (name, subscriber) {
					hasEventHandler = subscriber.hasOwnProperty('getEventHandler');
					eventHandler = (hasEventHandler) ? subscriber.getEventHandler() : false;
					
					if (eventName !== 'default' && eventHandler && eventHandler.hasEvent(eventName)) {
						// The observable has a registered event listener/handler
						event = eventHandler.getEvent(eventName);
						
						// Dispatch the event
						// TODO: What about args?
						event.dispatch(event, data);
					} else {					
						// Subscriber is a Kendo UI widget
						// Update the subscriber with the event
						// TODO: If the observer doesn't have an update method, this should throw some kind of error
						// hasOwnProperty is not working... something to do with inheritance
						if (typeof subscriber.update == 'function') {
							subscriber.update(event, data);
						} else {
							// TODO: Throw error if there is no update method.
						}
					}
				});
			}
			
			return this;
		}
	});
	
	return observable.init();
};

// Real-time event logging
// TODO: This should be generic
App.ErrorHandler = function (page) {
	var errorHandler = Object.create(App.Observable(), {
		_page: {
			value: {},
			enumerable: true,
			configurable: false,
			writable: true
		},
		
		init: {
			value: function (page) {
				var that = this,
					json = App.Helpers.JSON,
					subscribers = new App.Utilities.ChainableHash(),
					errors = new kendo.data.ObservableObject(),
					config,
					data,
					parent,
					item,
					id,
					name,
					path,
					matches,
					match,
					params,
					stacks,
					stack,
					widgets;
				
				page.errors = errors;
			
				page.errors.bind('change', function (event) {
					data = [];
					
					$.each(App.getPageNames(), function (idx, pageName) {
						if (page.errors.hasOwnProperty(pageName)) {
							if (page.initialized) {
							
								// Parent template
								parent = {
									text: pageName,
									expanded: true,
									items: []
								};
								
								// Block
								// This should use layout, not config
								config = App.getCurrent().getBlock('center-pane')._config;
								widgets = App.Config.Widgets.defaults();
								
								$.each(page.errors[pageName], function (idx, pageErrors) {
									name = pageErrors.field;
									id = '#' + $('[name=' + name + ']').attr('id');
										
									// Item template
									item = {
										text: pageErrors.message,
										encoded: false,
										cssClass: ['error', pageErrors.type].join(' '),
										url: '#' + name
									};
									
									parent.items.push(item);
								});
							}
							data.push(parent);
						}
					});
					
					// Notify subscribers
					that.notify('update', event, data);
				});
				
				this._page = page;
				this._subscribers = subscribers;
				
				return this;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		setErrors: {
			value: function (type, data) {
				var page = this._page,
					errors = [],
					error,
					key;
					
				for (key in data) {
					if (data.hasOwnProperty(key)) {
						error = {
							type: type,
							field: key,
							message: data[key]
						};
						
						errors.push(error);
					}
				}
				
				page.errors.set(page.getName(), errors);
				
				return this;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		log: {
			value: function (error) {
				// Do something
			},
			enumerable: true,
			configurable: false,
			writable: true
		}
	});
	
	return errorHandler.init(page);
};

/**********************************************************
 * Namespace: App.EventHandlers
 **********************************************************/
App.EventHandlers = App.EventHandlers || {};

/**********************************************************
 * Namespace: App.EventHandlers.Adapters
 **********************************************************/
App.EventHandlers.Adapters = App.EventHandlers.Adapters || {
	/**
	 * Adapter for JS-Signals
	 * 
	 */			
	Signals: function (events) {
		var jssignals = Object.create({
			_events: {},
			
			init: function (events) {
				var that = this;
				
				this._events = Object.create(App.Utilities.ChainableHash(), {});
				$.each(events, function (i, eventName) {
					that._events.set(eventName, new signals.Signal());
				});
				
				return this;
			},
			event: function (eventName) {
				if (this._events.has(eventName)) {
					return this._events.get(eventName);
				}
				
				return false;
			},
			adapter: function () {
				return this;
			},
			addEventListener: function (eventName, callback, scope) {
				var events = this._events, 
					event;
				
				if (events.has(eventName) === false) {
					// Create and register the event if it doesn't exist
					events.set(eventName, new signals.Signal());
				}
				
				event = events.get(eventName);				
				event.add(callback);

                return this;
			},
            setEventListener: function (eventName, callback, scope) {
				var events = this._events, 
					event;
				
				if (events.has(eventName) === false) {
					event = events.get(eventName);				
					event.started.add(callback);
				}

                return this;
            },
			removeEventListener: function (eventName, callback, scope) {
				var event = this.getEvent(event),
					hasListener = false;
				
				if (event) {
					hasListener = this._events.get(eventName).remove(callback);
				}
				
				return this;
			},
			hasEventListener: function (eventName, callback) {
				var event = this.getEvent(event),
					hasListener = false;
				
				if (event) {
					hasListener = event.started.has(callback);
				}
				
				return hasListener;
			},
			dispatch: function (eventName, args) {
				var events = this._events,
					event;
				
				if (events.has(eventName)) {
					event = this._events.get(eventName);
					event.dispatch.apply(event, args);
				}

                return this;
			},
			getEvents: function () {
				return this._events;
			},
			getEvent: function (event) {
				var events = this.getEvents();
				return (events.has(event)) ? events.get(event) : false;
			},
			hasEvent: function (event) {
				event = this.getEvent(event);
				return (event) ? true : false;
			}
		});
		
		return jssignals.init(events);
	},
	/**
	 * EventBus Driver
	 *
	 */
	EventBus: function (events) {
		var eventBus = Object.create({
			_events: {},
			
			init: function () {
				return this;
			},
			adapter: function () {
				return this;
			},
			addEventListener: function (type, callback, scope) {
				var args = [];
				var numOfArgs = arguments.length;
				for (var i = 0; i < numOfArgs; i++) {
					args.push(arguments[i]);
				}
				args = args.length > 3 ? args.splice(3, args.length - 1) : [];
				if (typeof this.listeners[type] !== "undefined") {
					this.listeners[type].push({
						scope: scope,
						callback: callback,
						args: args
					});
				} else {
					this.listeners[type] = [{
						scope: scope,
						callback: callback,
						args: args
					}];
				}
			},
			removeEventListener: function (type, callback, scope) {
				if (typeof this.listeners[type] !== "undefined") {
					var numOfCallbacks = this.listeners[type].length;
					var newArray = [];
					for (var i = 0; i < numOfCallbacks; i++) {
						var listener = this.listeners[type][i];
						if (listener.scope === scope && listener.callback === callback) {
							// Do something
						} else {
							newArray.push(listener);
						}
					}
					this.listeners[type] = newArray;
				}
			},
			hasEventListener: function (type, callback, scope) {
				if (typeof this.listeners[type] !== "undefined") {
					var numOfCallbacks = this.listeners[type].length;
					if (callback === undefined && scope === undefined) {
						return numOfCallbacks > 0;
					}
					for (var i = 0; i < numOfCallbacks; i++) {
						var listener = this.listeners[type][i];
						if (listener.scope === scope && listener.callback === callback) {
							return true;
						}
					}
				}
				return false;
			},
			dispatch: function (type, target) {
				var numOfListeners = 0;
				var event = {
					type: type,
					target: target
				};
				var args = [];
				var numOfArgs = arguments.length;
				for (var i = 0; i < numOfArgs; i++) {
					args.push(arguments[i]);
				}
				
				args = args.length > 2 ? args.splice(2, args.length - 1) : [];
				args = [event].concat(args);
				if (typeof this.listeners[type] !== "undefined") {
					var numOfCallbacks = this.listeners[type].length;
					for (i = 0; i < numOfCallbacks; i++) {
						var listener = this.listeners[type][i];
						if (listener && listener.callback) {
							var concatArgs = args.concat(listener.args);
							listener.callback.apply(listener.scope, concatArgs);
							numOfListeners += 1;
						}
					}
				}
			},
			getEvents: function () {
				var str = "";
				for (var type in this.listeners) {
					var numOfCallbacks = this.listeners[type].length;
					for (var i = 0; i < numOfCallbacks; i++) {
						var listener = this.listeners[type][i];
						str += listener.scope && listener.scope.className ? listener.scope.className : "anonymous";
						str += " listen for '" + type + "'\n";
					}
				}
				return str;
			}
		});
		
		return eventBus.init(events);
	}
};

/**********************************************************
 * Namespace: App.Helpers
 **********************************************************/
App.Helpers = App.Helpers || {
	/**
	 * Method: App.Helpers.isEmpty
	 *
	 * Checks to see if an object is empty
	 */
	isEmpty: function (obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				return false;
			}
		}
		
		return true;
	}
};

/**********************************************************
 * Namespace: App.Helpers.String
 **********************************************************/
App.Helpers.String = App.Helpers.String || {
	/**
	 * Method: App.Helpers.String.hyphenize
	 *
	 */
	hyphenize: function (str) {
		return str.replace(/[A-Z]/g, function (str) { 
			return '-' + str.toLowerCase();
		});
	},
	/**
	 * Method: App.Helpers.String.hyphenize
	 *
	 */
	camelize: function (str) {
		return str.replace(/[\s\-_]+(\w)/g, function (str) { 
			return str.toUpperCase().replace('-', ''); 
		});
	}
};

/**********************************************************
 * Namespace: App.Helpers.JSON
 **********************************************************/
App.Helpers.JSON = App.Helpers.JSON || {
	/**
	 * Method: App.Helpers.JSON.find
	 *
	 * Searches for and returns a given node in a JSON dataset
	 *
	 * @node Object
	 * @data JSON Object: Any valid JSON object
	 *
	 * @return
	 */
	find: function (expr, data) {
		return jsonPath(data, expr, {resultType: 'VALUE'});
	},
	/**
	 * Method: App.Helpers.JSON.findNode
	 *
	 * Returns a given node in a JSON dataset
	 *
	 * @node Object
	 * @data JSON Object: Any valid JSON object
	 *
	 * @return
	 */
	findNode: function (node, data) {
		var expr;
		
		// Build expression from node
		expr = "$..*[?(@.name=='TypeOfLoss')]"; // TODO: Implement!
		
		return App.Helpers.JSON.find(expr, data);
	},
	/**
	 * Method: App.Helpers.JSON.pathTo
	 *
	 * Returns the path to a given node in a JSON dataset
	 *
	 * @expr String
	 * @data JSON Object: Any valid JSON object
	 *
	 * @return
	 */
	pathTo: function (expr, data) {
		return jsonPath(data, expr, {resultType: 'PATH'});
	},
	/**
	 * Method: App.Helpers.JSON.pathToNode
	 *
	 * Searches for and returns the path to a node belonging to a JSON dataset
	 *
	 * @expr String
	 * @data JSON Object: Any valid JSON object
	 *
	 * @return
	 */
	pathToNode: function (node, data) {
		var expr;
		
		// Build expression from node
		expr = "$..*[?(@.name=='TypeOfLoss')]"; // TODO: Implement!
		
		return App.Helpers.JSON.pathTo(expr, data);
	}
};

/**********************************************************
 * Namespace: App.Helpers.JSON
 **********************************************************/
App.Helpers.URL = App.Helpers.URL || {
	getParams: function (query) {
        var query = query || window.location.search.substr(1).split('&'),
			params = {},
			param,
			idx;
		
		if (query === "") {
			return params;
		}
		
        for (idx = 0; idx < query.length; ++idx) {
            param = query[idx].split('=');
            
			if (param.length !== 2) {
				continue;
            }
			
			params[param[0]] = decodeURIComponent(param[1].replace(/\+/g, " "));
        }
        return params;
    },
	getParam: function (param, params) {
		params = params || this.getParams();
		
		if (params.hasOwnProperty(param)) {
			return params[param];
		}
		return null;
	}
};

/**********************************************************
 * Namespace: App.Utilities
 **********************************************************/
App.Utilities = App.Utilities || {
	/**
	 * Object: App.Utilities.Stack
	 *
	 * Basic stack (LIFO) implementation
	 */
	Stack: function () {
		var stack = Object.create({
			stack: [],
			
			init: function () {
				return this;
			},
			pop: function () {
				return this.stack.pop();
			},
			push: function (item) {
				this.stack.push(item);
			}
		});
		
		return stack.init();
	},
	/**
	 * Object: App.Utilities.Stack
	 *
	 * Basic queue (FIFO) implementation
	 */
	Queue: function () {
		var queue = Object.create({
			stack: [],
			
			init: function () {
				return this;
			},
			dequeue: function () {
				return this.stack.pop();
			},
			enqueue: function (item) {
				this.stack.unshift(item);
			}
		});
		
		return queue.init();
	},
	/**
	 * Object: App.Utilities.HashTable
	 * Type: Hash
	 *
	 * Basic hash table implementation
	 */
	HashTable: function (obj) {
		var hashTable = Object.create({
			length: 0,
			items: {},
			
			init: function (obj) {
				var p;
				
				for (p in obj) {
					if (obj.hasOwnProperty(p)) {
						this.items[p] = obj[p];
						this.length++;
					}
				}
				
				return this;
			},
			setItem: function (key, value) {
				var previous;
				
				if (this.hasItem(key)) {
					previous = this.items[key];
				}
				else {
					this.length++;
				}
				this.items[key] = value;
				return previous;
			},
			getItem: function (key) {
				return this.hasItem(key) ? this.items[key] : undefined;
			},
			hasItem: function (key) {
				return this.items.hasOwnProperty(key);
			},
			removeItem: function (key) {
				var previous;
				
				if (this.hasItem(key)) {
					previous = this.items[key];
					this.length--;
					delete this.items[key];
					return previous;
				}
				
				return undefined;
			},
			keys: function () {
				var keys = [], k;
					
				for (k in this.items) {
					if (this.hasItem(k)) {
						keys.push(k);
					}
				}
				return keys;
			},
			values: function () {
				var values = [], k;
					
				for (k in this.items) {
					if (this.hasItem(k)) {
						values.push(this.items[k]);
					}
				}
				return values;
			},
			each: function (fn) {
				var k;
				
				for (k in this.items) {
					if (this.hasItem(k)) {
						fn(k, this.items[k]);
					}
				}
			},
			clear: function () {
				this.items = {};
				this.length = 0;
			}
		});
		
		return hashTable.init(obj);
	},

	/**
	 * Object: App.Utilities.ChainableHash
	 * Type: Hash
	 *
	 * Wrapper for App.Utilities.HashTable providing a cleaner interface and supporting method chaining
	 */
	ChainableHash: function (obj) {
		var chainableHash = Object.create(App.Utilities.HashTable(), {
			has: {
				// Yeah, prototypal inheritance is a bit too verbose if you ask me, but I didn't come up with this stuff.
				// Prototypal inheritance works better than classical OOP & constructors anyway (at least for JS).
				value: function (key) {
					return this.hasItem(key);
				},
				enumerable: true, // 
				configurable: false,
				writable: true
			},
			get: {
				value: function (key) {
					return this.getItem(key);
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			set: {
				value: function (key, value) {
					this.setItem(key, value);
					return this;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			remove: {
				value: function (key) {
					return (this.removeItem(key) !== undefined) ? this : false;
				},
				enumerable: true,
				configurable: false,
				writable: true
			}
		});
		
		// TODO: Make sure we're not calling the init method twice
		return chainableHash.init(obj);
	},
	/**
	 * Object: App.Utilities.Injector
	 * Type: Class
	 *
	 * Dependency Injection container
	 * 
	 * Note: I should probably be using a AMD/CommonJS loader instead
	 */
	Injector: function () {
		return Object.create(kendo.Class(), {
			_dependencies: {
				value: function () {
					return Class.create(App.Utilities.ChainableHash());
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			get: {
				value: function (name) {
					return this._dependencies.get(name);
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			register: {
				value: function (name, dependency) {
					this._dependencies.set(name, dependency);
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			unregister: {
				value: function (name) {
					this._dependencies.remove(name);
				},
				enumerable: true,
				configurable: false,
				writable: true
			}
		});
	},
	/**
	 * Object: App.Utilities.Iterator
	 * Type: Class
	 *
	 * Basic iterator
	 */
	Iterator: function (obj) {
		var iterator = Object.create({
			data: {},
			keys: [],
			index: 0,
			len: 0,
			
			init: function (obj) {
				if (obj) {
					this.data = obj;
					this.keys = Object.keys(obj);
					this.len = this.keys.length;
					this.index = 0;
				}
				
				return this;
			},
			next: function () {
				var element,
					data = this.data,
					keys = this.keys,
					index = this.index;
					
				if (!this.hasNext()) {
					return null;
				}

				element = data[keys[index]];
				this.index++;

				return element;
			},
			hasNext: function () {
				var index = this.index,
					len = this.len;
						
				return index < len;
			},
			rewind: function () {
				var data = this.data,
					keys = this.keys,
					index = this.index;
				
				this.index = 0;
				
				return data[keys[index]];
			},
			current: function () {
				var data = this.data,
					keys = this.keys,
					index = this.index;
					
				return data[keys[index]];
			},
			key: function () {
				var keys = this.keys,
					index = this.index;
					
				return keys[index];
			}
		});
		
		return iterator.init(obj);
	},
	/**
	 * Object: App.Utilities.RecursiveIterator
	 * Type: Class
	 *
	 * Basic recursive iterator
	 */
	RecursiveIterator: function (obj) {	
		var recursiveIterator = Object.create(App.Utilities.Iterator(), {
			hasChildren: {
				value: function () {
					var data = this.data,
						keys = this.keys,
						index = this.index,
						len = this.len,
						type;
					
					type = data[keys[index]].constructor;
					
					if (type === Object || type === Array) {
						if (Object.keys(data[keys[index]]).length !== 0) {
							return Object.keys(data[keys[index]]).length;
						}
					}
					
					return false;
				},
				enumerable: true,
				configurable: false,
				writable: true				
			},
			getChildren: {
				value: function () {
					var data = this.data,
						keys = this.keys || {},
						index = this.index,
						len = this.len,
						type;
						
					type = data[keys[index]].constructor;
					
					if (type === Object || type === Array) {
						if (Object.keys(data[keys[index]]).length !== 0) {
							return data[keys[index]];
						}
					}
					
					return false;
				},
				enumerable: true,
				configurable: false,
				writable: true
			}
		});
		
		return recursiveIterator.init(obj);
	},
	/**
	 * Create a namespaced function
	 */
	createFunction: function (ns, fn) {
		var nsArray = ns.split(/\./),
			currentNode = this._root,
			newNS;
			
		while (nsArray.length > 1) {
			newNS = nsArray.shift();

			if (typeof currentNode[newNS] === "undefined") {
				currentNode[newNS] = {};
			}
			
			currentNode = currentNode[newNS];
		}

		if (fn) {
			currentNode[nsArray.shift()] = fn;
		} else {
			currentNode[nsArray.shift()] = {};
		}
	}
};

/**
 * Object: App.Page
 * Type: Class
 * 
 * Base class for all page instances, and an ancestor class for page controllers
 */
App.Page = function () {
	var page = Object.create(App.Observable(), {
		_entities: {
			value: [],
			enumerable: true,
			configurable: false,
			writable: true
		},
		_context: {
			value: {},
			enumerable: true,
			configurable: false,
			writable: true
		},
		_name: {
			value: {},
			enumerable: true,
			configurable: false,
			writable: true
		},
		_config: {
			value: {},
			enumerable: true,
			configurable: false,
			writable: true
		},
		// Stores layout instance
		_layout: {
			value: {},
			enumerable: true,
			configurable: false,
			writable: true
		// Stores block instances
		},
		_blocks: {
			value: {},
			enumerable: true,
			configurable: false,
			writable: true
		},
		// Stores module instances
		_modules: {
			value: {},
			enumerable: true,
			configurable: false,
			writable: true
		},
		// Stores error handler
		_errorHandler: {
			value: {},
			enumerable: true,
			configurable: false,
			writable: true
		},
		// Stores validation errors
		_errors: {
			value: {},
			enumerable: true,
			configurable: false,
			writable: true
		},
		// Stores event handler
		_eventHandler: {
			value: {},
			enumerable: true,
			configurable: false,
			writable: true
		},
		// Stores events
		_events: {
			value: {},
			enumerable: true,
			configurable: false,
			writable: true
		},
		// Stores data
		_formData: {
			value: {},
			enumerable: true,
			configurable: false,
			writable: true
		},

		initialized: {
			value: false,
			enumerable: true,
			configurable: false,
			writable: true
		},
		loaded: {
			value: false,
			enumerable: true,
			configurable: false,
			writable: true
		},
		
		init: {
			value: function (config) {
				var that = this,
					defaults = {},
					entity,
					errorHandler,
					eventHandlerAdapter,
					eventHandler,
					event,
					block,
					blockConfig,
					node,
					children,
					domNode;
				
				/* We have to reset the that for all "protected" properties. In the event that they don't exist in the inheriting object, the compiler will continue along the prototype chain and properties will be appended to the prototype instead of the inheriting object. */
				that._name = {};
				that._entities = [];
				that._layout = [];
				that._modules = {};
				that._eventHandler = {};
				that._events = {};
				that._errorHandler = {};
				that.errors = {};
				
				// Merge defaults with config
				config = $.extend({}, defaults, config) || defaults;
				
				if (config.hasOwnProperty('name') && config.name !== '') {
					this._name = config.name;
				}
				
				// Initialize hash for storing block instances
				this._blocks = Object.create(App.Utilities.ChainableHash(), {});
				
				// Initialize hash for storing module instances
				this._modules = Object.create(App.Utilities.ChainableHash(), {});
				
				// Register entities
				// TODO: Do we really need entity support? At some point, I guess it could be useful
				if (config.hasOwnProperty('entities') && config.entities.length > 0) {
					$.each(config.entities, function (i, entityType) {
						try {
							// Make sure the Entity Type exists before we try to create an instance
							if (App.Entities.hasOwnProperty(entityType)) {
								entity = Object.create(App.Entities[entityType]);
								that._entities.push(entity);
							}
						} catch (e) {
							console.log(e);
						}
					});
				}
				
				// Register error handler
				errorHandler = that._errorHandler = Object.create(App.ErrorHandler(this), {});
				
				// Register page event handler
				// TODO: Event handler should be configurable
				eventHandlerAdapter = App.EventHandlers.Adapters.Signals(App.getConfig('pageEvents'));
				eventHandler = that._eventHandler = Object.create(App.EventHandler(eventHandlerAdapter), {});
				
				// Register layout
				this._layout = Object.create(App.Page.Layout.Blocks(), {});
				
				if (config.hasOwnProperty('layout') && config.layout.length > 0) {
					$.each(config.layout, function (i, node) {
						try {
							// We're iterating over the page layout nodes, so we need to repackage them
							blockConfig = {
								id: node.id,
								layout: {
									block: node
								}
							};
							
							// Auto-rendering enabled for top-level blocks
							block = App.Page.Layout.Block(that, blockConfig);
						} catch (e) {
							console.log(e);
						}
						
						if (block) {
							that._layout.set(block.getId(), block);
							
							// Append rendered top-level blocks to the DOM
							children = document.getElementById(block.getId()).childNodes;
							$.each(children, function (idx, domNode) {
								if (domNode.nodeType === 1 && domNode.className === 'pane-content') {
									domNode.innerHTML = '';
									domNode.appendChild(block.html());
									return;
								}
							});
							
							block.dataBind();
							
							// Data-bind module instances to their respective layouts
							that._modules.each(function (name, module) {
								module.dataBind();
							});

						} else {
							// TODO: Throw error - page could not be rendered
							//console.log('Error: could not initialize the ' + node.id + ' block');
						}
					});
				}
				
				// Register event callbacks
				if (config.hasOwnProperty('events')) {
					$.each(config.events, function (eventName, callback) {			
						if (typeof callback === 'function') {
							event = eventHandler.getEvent(eventName);
							if (event) {
								eventHandler.addEventListener(eventName, callback);
							}
						} else {
							// Continue
							return true;
						}
						
					});
				}
				
				this.initialized = true;
				
				// Trigger initialized event
				if (eventHandler.hasEvent('initialized')) {
					event = eventHandler.getEvent('initialized');
					event.dispatch();
				}
				
				return this;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		getName: {
			value: function () {
				return this._name;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		getBlock: {
			value: function (block) {
				return this._layout.get(block);
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		setBlock: {
			value: function (blockName, block) {
				this._blocks.set(blockName, block);
				return this;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		hasBlock: {
			value: function (block) {
				return this._layout.has(block);
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		getModules: {
			value: function () {
				return this._modules;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		getModule: {
			value: function (moduleName) {
				return this._modules.get(moduleName);
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		setModule: {
			value: function (moduleName, module) {
				this._modules.set(moduleName, module);
				return this;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		getConfig: {
			value: function () {
				return App.getConfig(this.getName());
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		getFormData: {
			value: function () {
				return this._formData;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		getErrorHandler: {
			value: function () {
				return this._errorHandler;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		getEventHandler: {
			value: function () {
				return this._eventHandler;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		// TODO: Move load method to base controller
		load: {
			value: function (params, url) {
				var that = this,
					config = App.getConfig('pages').get(this.getName()),
					block,
					binder,
					validator,
					validationConfig,
					eventHandler = this.getEventHandler(),
					event,
					errorHandler = this.getErrorHandler(),
					errorPanel,
					response,
					data,
					viewModel,
					prop,
					value,
					widgetTypes,
					widgetRole,
					widgetConfig,
					widgets,
					widget,
					moduleEventHandler,
					moduleEvent,
					modules,
					idx,
					doRead = true,
					query,
					id;

				errorPanel = $('[name=ErrorPanel]').data('kendoObservingPanelBar');
				errorHandler.subscribe('errors', errorPanel);
				
				id = App.Helpers.URL.getParam('id');

				if (config.hasOwnProperty('route')) {
					if (typeof config.route === 'object') {
						if (!config.route.hasOwnProperty('read')) {
							doRead = false; // Just for clarity...
							return false;
						} else {
							if (config.route.hasOwnProperty('autoRead')) {
								if (config.route.autoRead !== true) {
									doRead = false;
								} else {
									id = (id !== null) ? id : false;
								}
							}
						}
					} else {
						return false;
					}
				} else {
					return false;
				}
				
				// TODO: This should be done somewhere *not* in the core!
				// TODO: This should be configurable
				// Maybe we should be using a handler instead?
				if (doRead && id !== null) {
					query = { queryString: kendo.stringify({ id: id }) };
					
					response = $.ajax({
						type: 'POST',
						contentType: 'application/json; charset=utf-8',
						dataType: 'json',
						data: kendo.stringify(query),
						url: url || config.route.read,
						async: false
					});
					
					// Parse response
					// TODO: This should be configurable
					data = $.parseJSON(response.responseJSON.d)[0];
					this._formData = data;
					
					// Get the view-model
					// TODO: This should be configurable
					block = this.getBlock('center-pane');
					viewModel = block.getViewModel();
					
					// Set values to view-model
					for (prop in data) {
						if (viewModel.hasOwnProperty(prop)) {
							value = data[prop] || '';

							viewModel.set(prop, value);
						}
					}
				}
				
				// Trigger (page) loaded event
				if (eventHandler.hasEvent('loaded')) {
					event = eventHandler.getEvent('loaded');
					event.dispatch();
				}
				
				if (typeof block !== 'undefined') {
					binder = block.getBinder();
					
					if (binder !== 'undefined') {
						config = this._config;
						
						validationConfig = (config.hasOwnProperty('validation')) ? config.validation : false;
						binder.bindValidation('#center-pane', validationConfig);
					}
				}
				
				modules = App.getCurrent().getModules();
				
				if (modules !== 'undefined') {
					modules.each(function (moduleName, module) {
						moduleEventHandler = module.getEventHandler();
						if (moduleEventHandler.hasEvent('pageLoaded')) {
							event = moduleEventHandler.getEvent('pageLoaded');
							event.dispatch();
						}
					});
				}
				
				if (typeof block !== 'undefined') {
					binder = block.getBinder();
					
					if (binder !== 'undefined') {
						config = this._config;
						
						validationConfig = (config.hasOwnProperty('validation')) ? config.validation : false;
						binder.bindValidation('#center-pane', validationConfig);
					}
				}
				
				// Trigger (page) isLoaded event
				if (eventHandler.hasEvent('isLoaded')) {
					event = eventHandler.getEvent('isLoaded');
					event.dispatch();
				}
				
				this.loaded = true;
				
				return this;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		// TODO: Move save method to base controller
		save: {
			// TODO: Accept callback function
			value: function (event, callback) {
				var that = this,
					config = App.getConfig('pages').get(this.getName()),
					validator = this.getBlock('center-pane').getValidator(),
					eventHandler = this.getEventHandler(),
					errorHandler = this.getErrorHandler(),
					errorPanel,
					options;

				// TODO: This should really be bound somewhere else
				errorPanel = $('[name=ErrorPanel]').data('kendoObservingPanelBar');
				//errorHandler.subscribe('errors', errorPanel);

				// TODO: This should be all be abstracted
				if (validator.validate()) {
					if (true /* if callback has been defined in config, load it */) {
						var response,
							url,
							isString = false,
							d;
						
						if (config.hasOwnProperty('ajax')) {
							if (config.ajax.hasOwnProperty('isString')) {
								if (config.ajax.isString === true) {
									isString = true;
								}
							}
						}
						
						if (isString) {
							d = "{\'data\': \'" + kendo.stringify($(event.currentTarget.form).serializeObject()) + "\'}";
						} else {
							d = kendo.stringify({
								data: $(event.currentTarget.form).serializeObject()
							});
						}
						
						// Set defaults
						options = {
							type: 'POST',
							contentType: 'application/json; charset=utf-8',
							data: d,
							dataType: 'json',
							async: true,
							processData: false,
							beforeSend: function (xhr, settings) {
								OpenGeneralDialog('Saving...');
							},
							complete: function (xhr, status) {
								CloseGeneralDialog(function () {
									messaging = $('#messaging');

									switch (status) {
										case 'success':
											messaging.find('.messaging-left').find('img').attr('src', '../Images/kuba_ok.png');
											messaging.find('.messaging-right').first().find('h2').text('Success').end()
													.next('.messaging-right').text('Your changes have been saved!');
											break;
										case 'error':
											messaging.find('.messaging-left').find('img').attr('src', '../Images/kuba_error.png');
											messaging.find('.messaging-right').first().find('h2').text('Validation Error(s)').end()
													.next('.messaging-right').text('Please check for errors and try again.');    
											break;
									}

									messaging.show();
								});
							},
							success: function (data, status, xhr) {
								// TODO: Success/error methods should be implemented as callbacks
								var splitter = $('#horizontal').data('kendoSplitter');
								
								// Clear errors
								errorHandler.setErrors('validation', {});
								
								// Collapse the right-hand side panel
								splitter.collapse('#right-pane');

								// Notify subscribers
								that.notify('update');
								
								// Trigger (page) saved event
								if (eventHandler.hasEvent('saved')) {
									event = eventHandler.getEvent('saved');
									event.dispatch();
								}
							},
							error: function (xhr, status, error) {
								// TODO: Success/error methods should be implemented as callbacks
								var splitter = $('#horizontal').data('kendoSplitter'),
									errors = [];
													
								// Expand the right-hand side panel
								splitter.expand('#right-pane');
								$.each($.parseJSON(xhr.responseJSON.d), function (idx, obj) {
									errors[obj.id] = obj.message;
								});
								
								// Set errors
								errorHandler.setErrors('validation', errors);
							}
						};
						
						if (config.hasOwnProperty('route')) {
							if (typeof config.route === 'object') {
								if (config.route.hasOwnProperty('update')) {
									if (typeof config.route.update === 'object') {
										// TODO: This is wonky!
										$.extend({}, options, config.route.put);
									} else if (typeof config.route.update === 'string') {
										options.url = config.route.update;
									}
								}
							} else {
								return false;
							}
						} else {
							return false;
						}
						
						response = $.ajax(options);
					}
				} else {
					// TODO: Success/error methods should be implemented as callbacks
					var splitter = $('#horizontal').data('kendoSplitter'),
						messaging = $('#messaging');
													
					// Expand the right-hand side panel
					splitter.expand('#right-pane');

					errorHandler.setErrors('validation', validator._errors);

					messaging.find('.messaging-left').find('img').attr('src', '../Images/kuba_error.png');
					messaging.find('.messaging-right').first().find('h2').text('Validation Error(s)').end()
							.next('.messaging-right').text('Please check for errors and try again.');    
					messaging.show();
				}
				
				return this;
			},
			enumerable: true,
			configurable: false,
			writable: true
		},
		validate: {
			value: function (event) {
				var that = this,
					config = App.getConfig('pages').get(this.getName()),
					validator = this.getBlock('center-pane').getValidator(),
					errorHandler = this.getErrorHandler(),
					errorPanel = $('[name=ErrorPanel]').data('kendoObservingPanelBar'),
					messaging = $('#messaging');

				// TODO: This should be all be abstracted
				if (validator.validate()) {
					if (true) {
						/* if callback has been defined in config, load it */
					}
				} else {
					errorHandler.setErrors('validation', validator._errors);
					
					messaging.find('.messaging-left').find('img').attr('src', '../Images/kuba_error.png');
					messaging.find('.messaging-right').first().find('h2').text('Validation Error(s)').end()
							.next('.messaging-right').text('Please check for errors and try again.');    
					messaging.show();
				}
			},
			enumerable: true,
			configurable: false,
			writable: true
		}
	});
	
	return page;
};

/**********************************************************
 * Namespace: App.Page.Layout
 **********************************************************/
App.Page.Layout = App.Page.Layout || {

	/**
	 * Object: App.Page.Layout.Base
	 * Type: Class
	 * Base class for all layouts
	 */
	Base: function () {
		var base = Object.create({
			init: function () {
				return this;
			}
		});
		
		return base.init();
	},
	/**
	 * Object: App.Page.Layout.Blocks
	 * Type: Hash
	 */
	Blocks: function () {
		return Object.create(App.Utilities.ChainableHash(), {});
	},
	/**
	 * Object: App.Page.Layout.Block
	 * 
	 */
	Block: function (page, config) {
		var block = Object.create({}, {
			_id: {
				value: '',
				enumerable: true,
				configurable: false,
				writable: true
			},
			_page: {
				value: {},
				enumerable: true,
				configurable: false,
				writable: true
			},
			_config: {
				value: {},
				enumerable: true,
				configurable: false,
				writable: true
			},
			_layout: {
				value: {},
				enumerable: true,
				configurable: false,
				writable: true
			},
			// Stores block instances
			_blocks: {
				value: {},
				enumerable: true,
				configurable: false,
				writable: true
			},
			_rendered: {
				value: false,
				enumerable: true,
				configurable: false,
				writable: true
			},
			_html: {
				value: '',
				enumerable: true,
				configurable: false,
				writable: true
			},
			_viewModel: {
				value: {},
				enumerable: true,
				configurable: false,
				writable: true
			},
			_validator: {
				value: {},
				enumerable: true,
				configurable: false,
				writable: true
			},
			autoRender:  {
				value: true,
				enumerable: true,
				configurable: false,
				writable: true
			},
			init: {
				value: function (page, config) {
					page = page || '';
					config = config || '';
					
					if (page !== '') {
						this._page = page;
					} else {
						// TODO: Throw error
					}
					
					// We can't parse a block that doesn't exist
					if (config === '') {
						return false;
					}
					
					this._id = config.id;
					this._config = config;
					
					/*console.log('block.init config id');
					console.log(config.id);
					console.log('block.init config');
					console.log(config);*/
					
					// Store a reference to the block's layout configuration
					this._layout = config.layout;
					
					// Initialize hash for storing block instances
					this._blocks = Object.create(App.Utilities.ChainableHash(), {});
					
					this._director = director = Object.create(App.Page.Layout.BlockDirector(this, this._page), {});
					this._binder = director.getBinder();
					this._builder = director.getBuilder();
					
					// Auto-render
					if (this.autoRender === true) {
						this.render();
					}
					
					return this;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			dataBind: {
				value: function () {
					var binder = this._binder,
						id = this._id,
						config = this._config,
						validationConfig = (config.hasOwnProperty('validation')) ? config.validation : false;
						
					// Bind the view-model
					this._binder.bind('#' + id);
					
					//console.log('binding block | id: ' + id);
					//console.log('validation config');
					//console.log(validationConfig);
											
					// Bind block-level validation rules here!
					// Page validation isn't logical anyway...
					// HTML5 sections exist for a reason
					//console.log('not binding block validation | id: ' + id);		
					//console.log('-----');
					// Bind the validation after everything is loaded or things get weird
					// I don't recommend uncommenting the following line
					//this._binder.bindValidation('#' + id, validationConfig);
					
					// Set view-model
					this._viewModel = this._binder.getViewModel();
					
					// Set validator
					this._validator = this._binder.getValidator();
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			setLayout: {
				value: function (layout) {
					this._layout = layout;
					return this;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getLayout: {
				value: function (layout) {
					return this._layout;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			// Usually called by BlockDirector during the build process
			setBlocks: {
				value: function (blocks) {	
					$.each(blocks, function (idx, block) {
						this._blocks.set(block.id, block);
					});
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			render: {
				value: function () {
					var layout = this._layout,
						director = this._director;
					
					director.build(layout);
					
					// Store content
					this._html = director.getDocument();
					
					// Set rendered flag
					this._rendered = true;
					
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getId: {
				value: function () {
					return this._id;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			html: {
				value: function () {
					return this._html;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getDirector: {
				value: function () {
					return this._director;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getBinder: {
				value: function () {
					return this._binder;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getBuilder: {
				value: function () {
					return this._builder;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getViewModel: {
				value: function () {
					return this._viewModel;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getValidator: {
				value: function () {
					return this._validator;
				},
				enumerable: true,
				configurable: false,
				writable: true
			}
		});
		
		return block.init(page, config);
	},
	/**
	 * Object: App.Page.Layout.Module
	 *
	 */
	Module: function (page, config) {
		// TODO: this should inherit from the App.Page.Layout.Block
		var module = Object.create(App.Observable(), {
			_id: {
				value: '',
				enumerable: true,
				configurable: false,
				writable: true
			},
			_page: {
				value: {},
				enumerable: true,
				configurable: false,
				writable: true
			},
			_errorHander: {
				value: '',
				enumerable: true,
				configurable: false,
				writable: true
			},
			_eventHandler: {
				value: '',
				enumerable: true,
				configurable: false,
				writable: true
			},
			_events: {
				value: '',
				enumerable: true,
				configurable: false,
				writable: true
			},
			_config: {
				value: {},
				enumerable: true,
				configurable: false,
				writable: true
			},
			_html: {
				value: '',
				enumerable: true,
				configurable: false,
				writable: true
			},
			_viewModel: {
				value: {},
				enumerable: true,
				configurable: false,
				writable: true
			},
			_validator: {
				value: {},
				enumerable: true,
				configurable: false,
				writable: true
			},
			_rendered: {
				value: false,
				enumerable: true,
				configurable: false,
				writable: true
			},
			autoRender:  {
				value: true,
				enumerable: true,
				configurable: false,
				writable: true
			},
			
			init: {
				value: function (page, config) {
					var director,
						eventHandlerAdapter,
						eventHandler,
						events,
                        event;
						
					page = page || '';
					config = config || '';
					
					if (page !== '') {
						this._page = page;
					} else {
						// TODO: Throw error
					}
					
					// We can't parse a block that doesn't exist
					if (config === '') {
						return false;
					}
					
					this._id = config.id;
					this._config = config;
					this._director = director = Object.create(App.Page.Layout.BlockDirector(this, this._page), {});
					this._binder = director.getBinder();
					this._builder = director.getBuilder();
					
					// Register error handler
					//errorHandler = that._errorHandler = Object.create(App.ErrorHandler(this), {});

					// Register page event handler
					// TODO: Event handler should be configurable
					events = $.extend({}, App.getConfig('moduleEvents'));
					eventHandlerAdapter = App.EventHandlers.Adapters.Signals(events);
					eventHandler = this._eventHandler = Object.create(App.EventHandler(eventHandlerAdapter), {});

					// Register event callbacks
					if (config.hasOwnProperty('events')) {
						$.each(config.events, function (eventName, callback) {			
							if (typeof callback === 'function') {
								event = eventHandler.getEvent(eventName);
								
								if (event) {
									eventHandler.addEventListener(eventName, callback);
								}
							} else {
								// Continue
								return true;
							}
							
						});
					}

					// Trigger initialized event
					if (eventHandler.hasEvent('initialized')) {
						event = eventHandler.getEvent('initialized');
						event.dispatch();
					}
					
					// Auto-render
					if (this.autoRender === true) {
						this.render();
					}
					
					return this;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			dataBind: {
				value: function () {
					var binder = this._binder,
						id = this._id,
						config = this._config,
						validationConfig = (config.hasOwnProperty('validation')) ? config.validation : false,
						eventHandler = this._eventHandler,
						event;
					
					// Bind the view-model
					this._binder.bind('#' + id);				
											
					// Bind block-level validation rules here!
					// Page validation isn't logical anyway...
					// HTML5 sections exist for a reason		
					this._binder.bindValidation('#' + id, validationConfig);
					
					// Set view-model
					this._viewModel = this._binder.getViewModel();
					
					// Set validator
					this._validator = this._binder.getValidator();
					
					// Trigger dataBound event
					if (eventHandler.hasEvent('dataBound')) {
						event = eventHandler.getEvent('dataBound');
						event.dispatch();
					}
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			render: {
				value: function () {
					var config = this._config,
						director = this._director;
						
					director.build(config);
					
					// Store content
					this._html = director.getDocument();
					
					// Set rendered flag
					this._rendered = true;
					
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getId: {
				value: function () {
					return this._id;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			html: {
				value: function () {
					return this._html;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getDirector: {
				value: function () {
					return this._director;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getBinder: {
				value: function () {
					return this._binder;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getBuilder: {
				value: function () {
					return this._builder;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getViewModel: {
				value: function () {
					return this._viewModel;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getValidator: {
				value: function () {
					return this._validator;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getEventHandler: {
				value: function () {
					return this._eventHandler;
				},
				enumerable: true,
				configurable: false,
				writable: true
			}
		});
		
		return module.init(page, config);
	},
	/**
	 * Object: App.Page.Layout.BlockDirector
	 * Type: Class
	 * 
	 */
	BlockDirector: function (block, page, builder, binder) {
		var director = Object.create({
			_page: {},
			_block: {},
			_element: {},
			_binder: {},
			_builder: {},
			_collections: [],
			_attributes: [],
			_voidElements: [],
			_inputElements: [],
			_prevLevel: 0,
			
			init: function (block, page, builder, binder) {
				block = block || '';
				page = page || '';
				binder = binder || Object.create(App.Page.Layout.KendoDOMBinder(this), {});
				builder = builder || Object.create(App.Page.Layout.KendoDOMBuilder(this), {});
				
				if (block !== '') {
					this._block = block;
				} else {
					// TODO: Throw error
				}
				
				if (page !== '') {
					this._page = page;
				} else {
					// TODO: Throw error
				}
				
				this._builder = builder;
				this._binder = binder;
				
				this._collections = App.getConfig('validCollections');
				this._voidElements = App.getConfig('validVoidElements');
				this._inputElements = App.getConfig('validInputElements');
				this._attributes = App.getConfig('validAttributes');
				
				return this;
			},
			/**
			 * Merge the parameters of two or more blocks together into the first block
			 * @credit: Yep, I basically jacked this from the awesome folks at jQuery
			 * @usage: merge( target [, object1 ] [, objectN ] )
			 *
			 * @target: An object that will receive the new properties if additional objects are passed in
			 * @object1: An object containing additional properties to merge in
			 * @object2: Additional objects containing properties to merge in
			 *
			 * @return Object
			 */
			merge: function () {
				var collection,
					exists = false,
					obj,
					prop,
					src,
					copy,
					copyIsArray,
					clone,
					target = arguments[0] || {},
					i = 1,
					length = arguments.length,
					deep = false;

				// Handle a deep copy situation
				if (typeof target === 'boolean') {
					deep = target;
					target = arguments[1] || {};
					// skip the boolean and the target
					i = 2;
				}

				// Handle case when target is a string or something (possible in deep copy)
				if (typeof target !== 'object' && !jQuery.isFunction(target)) {
					target = {};
				}

				for (i = 0; i < length; i++) {
					// Only deal with non-null/undefined values
					if ((obj = arguments[i]) != null) {
						// Extend the base object
						for (prop in obj) {
							src = target[prop];
							copy = obj[prop];
							
							// Prevent never-ending loop
							if (target === copy) {
								continue;
							}
							
							// Recurse if we're merging plain objects or arrays
							if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
								if (copyIsArray) {
									copyIsArray = false;
									clone = src && jQuery.isArray(src) ? src : [];

								} else {
									clone = src && jQuery.isPlainObject(src) ? src : {};
								}
								
								if (App.Config.defaults().validCollection.indexOf(prop) !== -1) {
									// Valid collection
									
									// Merge the objects by id
									$.each(obj[prop], function (i, copyItem) {
										if (!copyItem.hasOwnProperty('id')) {
											return true;
										} else {
										// Does an item with the same ID exist in the target?
											$.each(target[prop], function (j, targetItem) {
												if (targetItem.hasOwnProperty('id') && copy) {
													exists = true;
												}
											});
										}
										
										//if (item.hasOwnProperty('id')
										
									});
									
								}

								// Never move original objects, clone them
								target[prop] = this.merge(deep, clone, copy);

							// Don't bring in undefined values
							} else if (copy !== undefined) {
								target[prop] = copy;
							}
						}
					}
				}
				
			},
			getPage: function () {
				return this._page;
			},
			getBlock: function () {
				return this._block;
			},
			getBinder: function () {
				return this._binder;
			},
			setBinder: function (binder) {
				this._binder = binder;
				
				return this;
			},
			getBuilder: function () {
				return this._builder;
			},
			setBuilder: function (builder) {
				this._builder = builder;
				
				return this;
			},
			isCollection: function (key, node) {
				// Collections MUST have a key, as they don't have a type
				key = key || '';
				
				if (key === '') {
					return false;
				}
				
				return (node.constructor === Array && this._collections.indexOf(key) !== -1) ? true : false;
			},
			isVoid: function (type) {
				var isVoidElement = false;
				
				if (this._voidElements.indexOf(type.toString()) !== -1) {
					isVoidElement = true;
				}
				
				if (this._inputElements.indexOf(type.toString()) !== -1) {
					isVoidElement = true;
				}
				
				return isVoidElement;
			},
			build: function (obj, level) {
				var that = this,
					builder = this.getBuilder(),
					iterator = Object.create(App.Utilities.RecursiveIterator(obj), {}),
					key,
					current,
					module = false,
					modules,
					moduleConfig,
					block = false,
					blocks,
					blockConfig,
					blockLayout,
					attributes,
					pair,
					parent,
					children,
					isFirst = true,
					isDOMElement = false,
					isBlock = false,
					maxNesting = false,
					widget;
					
				do {
					// Get the current node and build it
					current = iterator.current();
					isDOMElement = (current.hasOwnProperty('tag') && current.tag !== '') ? current.tag : false;
					isBlock = (current.hasOwnProperty('block') && current.block !== '') ? current.block : false;
					
					// Is the current node a module?
					if (current.hasOwnProperty('module') && current.module !== '') {
						modules = App.getConfig('modules');
						
						// Get the module configuration 
						if (modules.has(current.module)) {
							moduleConfig = modules.get(current.module);
						} else if (current.hasOwnProperty('config')) {
							moduleConfig = current.config;
						} else {
							moduleConfig = false;
						}
						
						// Create a new module from the module configuration, if it exists
						module = (moduleConfig) ? App.Page.Layout.Module(this._page, moduleConfig) : false;
					}
					// Is the current node a module?
					else if (current.hasOwnProperty('block') && current.block !== '') {
						blocks = App.getConfig('blocks');
						
						//console.log('-- current block --');
						//console.log(current);
						
						// Get the block configuration 
						if (blocks.has(current.block)) {
							blockConfig = blocks.get(current.block);
							blockLayout = (blockConfig.hasOwnProperty('layout')) ? blockConfig.layout : false;
						} else {
							blockLayout = false;
						}
						
						if (blockLayout) {
							if (current.hasOwnProperty('config') && current.config.hasOwnProperty('layout')) {
								this.merge(true, blockLayout, current.config.layout);
							}
						}
						//console.log('-- blockLayout --');
						//console.log(blockLayout);
						
						// Create a new block from the block configuration, if it exists
						block = (blockLayout) ? Object.create(App.Page.Layout.Block(this._page, blockLayout)) : false;
						
						
					}
					
					// Set any attributes, so long as the current node isn't a collection
					if (module || block || isDOMElement) {
						attributes = {};
						
						$.each(current, function(key, value) {
							if (that._attributes.indexOf(key) !== -1) {
								attributes[key] = value;
							}
						});
					}
					
					if (module) {
						if (isFirst === true) {
							builder.append(module.html());							
							isFirst = false;
						} else {
							builder.add(module.html());
						}
						
						// Store the module instance
						this._page.setModule(current.id, module);
						
					} else if (block) {
						maxNesting = true;
						
						if (isFirst === true) {
							builder.append(block.html());
							isFirst = false;
						} else {
							builder.add(block.html());
						}
						
						// Store the block instance
						this._page.setBlock(current.id, block);
					} else if (isDOMElement) {
						maxNesting = (this.isVoid(current.tag)) ? true : false;
						
                        if (isFirst === true) {
							builder.append(current.tag, attributes);
							isFirst = false;
						} else {
                            builder.add(current.tag, attributes);
                        }
						
						if (attributes.hasOwnProperty('data') && attributes.data.hasOwnProperty('role')) {
							if (attributes.data.role === 'semantictabstrip' && current.hasOwnProperty('tabs')) {
								App.Widgets.Helpers.SemanticTabStrip.build(builder, current.tabs);
							}
							
							if (attributes.data.role === 'panelbar' || attributes.data.role === 'eventpanelbar') {
								if (current.data.hasOwnProperty('items')) {
									App.Widgets.Helpers.PanelBar.build(builder, current.data.items);
								}
							}
						}
						
						// Prepend title
						if (current.hasOwnProperty('title')) {
							var title = builder.addBefore(builder.getCurrent(), 'h1', { 'class': 'title-prefix' });
							builder.text(title, current.title);
						}
						
						// Prepend legend
						if (current.hasOwnProperty('legend')) {
							// TODO: I need to add a prepend method
							var legend = builder.appendNode(builder.getCurrent(), 'legend');
							builder.text(legend, current.legend);
						}
						
						// Prepend label
						if (current.hasOwnProperty('label')) {
							var label = builder.addBefore(builder.getCurrent(), 'label', {
								for: builder.getCurrent().id
							});
							builder.text(label, current.label);
						}
						
						// Append text
						if (current.hasOwnProperty('text')) {
							builder.text(builder.getCurrent(), current.text);
						}
						
						// TODO: Improve validation procedure
						// Append validation
						if (current.hasOwnProperty('validation')) {
							attributes = {}; // Clear attributes
							
							$.each(current.validation, function(key, value) {
								if (that._attributes.indexOf(key) !== -1) {
									attributes[key] = value;
								}
							});
							
							builder.setAttributes(builder.getCurrent(), attributes);
							
							if (current.validation.hasOwnProperty('message') && current.validation.message !== '') {
								builder.getCurrent().setAttribute('validationMessage', current.validation.message);
							}
							
							var validation = builder.addAfter(builder.getCurrent(), 'span', {
								class: 'k-invalid-msg',
								data: {
									for: builder.getCurrent().id
								}
							});
						}
					}
					
					// Are there child nodes? If so, recurse...
					if (iterator.hasChildren()) {
						children = iterator.getChildren();
							
						if (maxNesting === false) {						
							// Recurse
							level = (isDOMElement) ? level + 1 : level;
							this.build(children, level);
						}
					}
					
					// Move to the next node
					iterator.next();
				} while (iterator.hasNext());
				
				if (isDOMElement) {
					if (iterator.hasNext() === false) {						
						builder.parent();
					}
				}
			},
			getDocument: function () {
				return this._builder.getDocument();
			}
		});
		
		return director.init(block, page, builder, binder);
	},
	FieldMap: function () {
		return Object.create(App.Utilities.ChainableHash(), {});
	},
	/**
	 * Object: App.Page.Layout.DocumentBuilder
	 * Type: Class
	 *
	 * Interface for Builder classes
	 * 
	 */ 
	DocumentBuilder: function () {},
		
	/**
	 * Object: App.Page.Layout.DOMBuilder
	 * Type: Class
	 *
	 * Creates an HTML document using W3C DOM methods
	 * 
	 */
	DOMBuilder: function () {
		var domBuilder = Object.create({
			_document: {},
			_rootNode: {},
			_currentNode: {},
			
			init: function () {
				var doc, rootNode;
				
				this._document = doc = document.createDocumentFragment();
				this._rootNode = rootNode = this.appendNode(doc, 'div');
				this._currentNode = rootNode;
				
				return this;
			},
			
			/* Generic methods
			------------------ */
			
			/**
			 * Returns the document
			 *
			 * @return DOM Node: The DOM document fragment
			 */
			getDocument: function () {
				return this._document;
			},
			/**
			 * Returns the root node
			 *
			 * @return DOM Node: The root node
			 */
			getRoot: function () {
				return this._rootNode;
			},
			/**
			 * Returns the current node
			 *
			 * @return DOM Node: The current node
			 */
			getCurrent: function () {
				return this._currentNode;
			},
			/**
			 * Sets the current node
			 *
			 * @return DOM Node: The current node
			 */
			setCurrent: function (node) {
				this._currentNode = node;
				
				return this;
			},
			/**
			 * Returns the parent of the current node
			 *
			 * @return DOM Node: The parent node
			 */
			getParent: function () {
				return this._currentNode.parentNode;
			},
			/**
			 * Creates and appends a node inside a specified parent
			 * 
			 * @ref DOM Node: The insertion target for the new node
			 * @element String: A valid HTML5 element or DOM DocumentFragment
			 * @attributes Object: An object containing key-value pairs of attributes and values
			 *
			 * @return DOM Node: The newly created node
			 */
			appendNode: function (ref, element, attributes) {
				var node = (typeof element === 'string') ? document.createElement(element) : element;
				ref.appendChild(node);
				
				this.setAttributes(node, attributes);
				
				return node;
			},
			/**
			 * Creates a node and inserts it before the specified element
			 * 
			 * @ref DOM Node: A reference node for inserting the new node
			 * @element String: A valid HTML5 element or DOM DocumentFragment
			 * @attributes Object: An object containing key-value pairs of attributes and values
			 *
			 * @return DOM Node: The newly created node
			 */
			addBefore: function (ref, element, attributes) {
				var node = (typeof element === 'string') ? document.createElement(element) : element;
				ref.parentNode.insertBefore(node, ref);
				
				this.setAttributes(node, attributes);
				
				return node;
			},
			/**
			 * Creates a node and inserts it after the specified element
			 * 
			 * @parent DOM Node: A reference node for inserting the new node
			 * @element String: A valid HTML5 element or DOM DocumentFragment
			 * @attributes Object: An object containing key-value pairs of attributes and values
			 *
			 * @return DOM Node: The newly created node
			 */
			addAfter: function (ref, element, attributes) {
				var node = (typeof element === 'string') ? document.createElement(element) : element;
				ref.parentNode.insertBefore(node, ref.nextSibling);
				
				this.setAttributes(node, attributes);
				
				return node;
			},
			
			/* Chainable methods
			---------------------- */
			
			/**
			 * Creates and appends a node inside a specified parent
			 * 
			 * @element String: A valid HTML5 element or DOM DocumentFragment
			 * @attributes Object: An object containing key-value pairs of attributes and values
			 * @ref DOM Node: (Optional) The insertion target for the new node
			 *
			 * @return DOMBuilder: this
			 */
			append: function (element, attributes, ref) {
				var parent, node;
				
				ref = ref || this._currentNode;
				node = (typeof element === 'string') ? document.createElement(element) : element;
				ref.appendChild(node);
				
				if (typeof element === 'string') {
					this._currentNode = node;
					this.setAttributes(node, attributes);
				}
				
				return this;
			},
			/**
			 * Creates a node and inserts it after the specified element
			 * 
			 * @element String: A valid HTML5 element or DOM DocumentFragment
			 * @attributes Object: An object containing key-value pairs of attributes and values
			 * @ref DOM Node: A reference node for inserting the new node
			 *
			 * @return DOMBuilder: this
			 */
			add: function (element, attributes, ref) {
				var node;
				
				ref = ref || this._currentNode;
				node = (typeof element === 'string') ? document.createElement(element) : element;
				ref.parentNode.insertBefore(node, ref.nextSibling);
				
				if (typeof element === 'string') {
					this._currentNode = node;
					this.setAttributes(node, attributes);
				}
				
				return this;
			},
			/**
			 * Creates a node and inserts it before the specified element
			 * 
			 * @element String: A valid HTML5 element or DOM DocumentFragment
			 * @attributes Object: An object containing key-value pairs of attributes and values
			 * @ref DOM Node: A reference node for inserting the new node
			 *
			 * @return DOMBuilder: this
			 */
			before: function (element, attributes, ref) {
				var node;
				
				ref = ref || this._currentNode;
				node = (typeof element === 'string') ? document.createElement(element) : element;
				ref.parentNode.insertBefore(node, ref);
				this._currentNode = node;
				
				this.setAttributes(node, attributes);				
				
				return this;
			},
			/**
			 * Sets the internal current node reference to the parent of the current node
			 *
			 * @return DOMBuilder: this
			 */
			parent: function () {
				var ref, node;
				
				ref = ref || this._currentNode;
				this._currentNode = this._currentNode.parentNode;
				
				return this;
			},
			/**
			 * Sets the text for a specified node
			 *
			 * @return DOMBuilder: this
			 */
			text: function (ref, value) {
				var node = document.createTextNode(value);
				ref.appendChild(node);
				
				return this;
			},
			setAttributes: function (node, attributes) {
				attributes = attributes || '';
				
				if (attributes) {					
					// If this behavior needs to be changed, create an inheriting object
					$.each(attributes, function (key, value) {
						node.setAttribute(key, value);
					});
				}
				
				return this;
			}
		});
		
		return domBuilder.init();
	},
	XmlDOMBuilder: function (director) {
		var domBuilder = Object.create(App.Page.Layout.DOMBuilder(), {
		});
		
		return domBuilder.init(director);
		
	},
	KendoDOMBuilder: function (director) {
		var domBuilder = Object.create(App.Page.Layout.DOMBuilder(), {
			_validAttributes: {
				value: {
					'bind': [
						'attr',
						'checked',
						'click',
						'custom',
						'disabled',
						'enabled',
						'events',
						'html',
						'invisible',
						'source',
						'style',
						'text',
						'value',
						'visible',
					],
					'role': true,
					'link': true
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			
			init: {
				value: function (director) {
					var doc, rootNode;
					
					this._document = doc = document.createDocumentFragment();
					this._rootNode = rootNode = this.appendNode(doc, 'div');
					this._currentNode = rootNode;
					this._director = director;
					this._widgets = App.Config.Widgets.defaults();
					
					return this;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getDirector: {
				value: function () {
					return this._director;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getBinder: {
				value: function () {
					return this._director.getBinder();
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			// Override default attribute parsing
			setAttributes: {
				value: function (node, attributes) {
					var that = this,
						widget;
						
					attributes = attributes || '';
					
					if (attributes) {
						// If this behavior needs to be changed, create an inheriting object
						$.each(attributes, function (key, value) {
							switch (key) {
								// Parse Kendo UI specific attributes so we can bind our elements
								case 'data':
									for (var prop in value) {
										switch (prop) {
											case 'role':
												key = 'data-role';
												node.setAttribute(key, value.role);
												
												// We're dealing with a Kendo UI widget, so invoke method 
												// to ensure that we don't miss any widget specific parameters
												// ie: The combobox widget and dropdownlist widgets require
												// the data-text-field and data-value-field attributes
												widget = that._widgets[value.role];
												
												if (widget.hasOwnProperty('attributes') && widget.attributes.hasOwnProperty('data')) {
													// The jQuery's map function actually lists callback params in reverse order!
													$.map(widget.attributes.data, function (v, k) {
														// If the data attribute wasn't listed in the configuration
														if (Object.keys(attributes.data).indexOf(k) === -1) {
															// Add the missing data attribute
															node.setAttribute('data-' + App.Helpers.String.hyphenize(k), v);
														}
													});
													// Clear widget
													widget = null;
												}
												break;
												
											case 'bind':
												// Bind the DOM element to the View-Model
												that.getBinder().bindNode(node, value.bind);
												break;
												
											case 'items':
												// Do something?
												break;
												
											case 'template':
												// TODO: WTF template is hardcoded - sucky!
												// Don't use Kendo's declarative binding syntax for templates! Use App.Loader, or template binding will fail miserably
												App.load('template', App.getConfig('baseUrl') + 'Assets/Templates/' + value.template.source, { id: node.id, template: value.template.id });
												node.setAttribute('data-' + App.Helpers.String.hyphenize(prop), value.template.id);
												break;
												
											default:
												if (!(typeof value[prop] === 'string' || typeof value[prop] === 'int')) {
													// Kendo widgets don't initialize correctly if parameter keys are enclosed in quotes
													value[prop] = kendo.stringify(value[prop]).replace(/\"([^(\")"]+)\":/g,"$1:");
												}
												
												node.setAttribute('data-' + App.Helpers.String.hyphenize(prop), value[prop]);
												break;
										}
									}
									
									break;
									
								default:									
									node.setAttribute(key, value);									
									break;
							}
						});
					}
				},
				enumerable: true,
				configurable: false,
				writable: true
			}
		});
		
		return domBuilder.init(director);
	},
	/**
	 * Object: App.Page.Layout.DOMBinder
	 * Type: Class
	 *
	 * Creates Kendo UI View-Model inheriting from App.Page.Layout.Base
	 * 
	 * @param ViewModel: A kendo.observable object
	 */
	DOMBinder: function (director, viewModel) {
		var binder = Object.create({
			_director: {},
			_viewModel: {},
			
			init: function (director, viewModel) {
				this._director = director;
				this._viewModel = viewModel || Object.create(kendo.observable(), {});
				
				return this;
			},
			getDirector: function () {
				return this._director;
			},
			getViewModel: function () {
				return this._viewModel;
			},
			bind: function (type, value) {
				this._viewModel.set(type, value);
				
				return this;
			},
			unbind: function (key) {
				//this._viewModel.unbind;
				
				return this;
			}
		});
		
		return binder.init(director, viewModel);
	},
	KendoDOMBinder: function (director, viewModel) {
		// TODO: this should inherit from the App.Page.Layout.DOMBinder
		var binder = Object.create({
			_director: {},
			_viewModel: {},
			_validator: {},
			_widgets: {},
			_root: {},
			
			init: function (director, viewModel) {
				this._director = director;
				this._viewModel = viewModel || Object.create(kendo.observable(), {});
				this._widgets = App.Config.Widgets.defaults();
				
				return this;
			},
			getDirector: function () {
				return this._director;
			},
			getViewModel: function () {
				return this._viewModel;
			},
			getValidator: function () {
				return this._validator;
			},
			bindNode: function (node, bindings) {
				var that = this,
					identifier,
					method,
					val = [],
					ds,
					eventHandler,
					events = [],
					event,
					observables = [],
					observable,
					target,
					callback,
					fn;
					
				// Empty data attributes will crash Kendo
				if (App.Helpers.isEmpty(bindings) === false) {
					// TODO: Could be using strategy pattern to process data attributes
					if (typeof bindings === 'string') {
						// Data-bind the value
						// Make sure the property doesn't exist before adding it
						if (that._viewModel.hasOwnProperty(bindings) === false) {
							// Add the property
							that._viewModel.set(bindings, '');
						}
						
						val.push('value: ' + bindings);
					} else {
						$.each(bindings, function (type, binding) {
							switch (type) {
								case 'source':
									if (typeof binding === 'string') {
										// Not sure if I can do this...
										//val.push(type + ': ' + binding);
										//that._viewModel.set(binding, '');
									} else {
										// TODO: relying on a name attribute is kind of retarded. IDs aren't much better... auto-naming?
										identifier = node.getAttribute('name');
										method = App.Helpers.String.camelize(identifier) + type[0].toUpperCase() + type.slice(1);
								
										ds = App.Data.DataSource.Factory(binding);
										val.push(type + ': ' + method);
										that._viewModel.set(method, ds);
									}
									break;

								case 'value':
									// Make sure the property doesn't exist before adding it
									if (that._viewModel.hasOwnProperty(binding) === false) {
										// Add the property
										val.push(type + ': ' + binding);
										that._viewModel.set(binding, '');
										// TODO: accept function
									} else {
										val.push(type + ': ' + binding);
									}
									break;

								case 'events':
									// TODO: Make sure events are supported!
									$.each(binding, function (event, fn) {
										callback = App.Helpers.String.camelize(node.getAttribute('name')) + 'On' + event[0].toUpperCase() + event.slice(1);
										// Add the property
										events.push(event + ': ' + callback);
										that._viewModel.set(callback, fn);
									});

									if (events.length > 0) {
										val.push('events: { ' + events.join(', ') + ' }');
									}
									break;
									
								case 'observables':
									eventHandler = that.getDirector().getPage().getEventHandler();
									
									$.each(binding, function (idx, observable) {
										switch (observable.type) {
											case 'app':
												break;
												
											case 'page':
												fn = function () {
													var obj = $('#' + node.getAttribute('id')).data('kendoObservingListView');
													
													callback = App.Helpers.String.camelize('pageSubscribe_' + node.getAttribute('name'));
													App.getCurrent().subscribe(callback, obj);
												}
												break;
												
											case 'module':
												fn = function () {
													var obj = $('#' + node.getAttribute('id')).data('kendoObservingListView');
													
													callback = App.Helpers.String.camelize('moduleSubscribe_' + observable.name + '_' + node.getAttribute('name'));
													if (typeof App.getCurrent().getModule(observable.name) !== 'undefined') {
														App.getCurrent().getModule(observable.name).subscribe(callback, obj);
													}
												}
												break;
												
											case 'widget':
												break;
												
											case 'element':
												break;
											
											case 'custom':
												if (typeof observable.callback !== 'function') {
													return false;
												}
												break;
												
											default:
												return false;
										}
										
										eventHandler.addEventListener('loaded', fn);
									});
									break;

								default:
									val.push(type + ': ' + binding);
									that._viewModel.set(binding, '');
									break;
							}
						});
					}
				}
				
				node.setAttribute('data-bind', val.join(', '));
				
				return this;
			},
			unbindNode: function (key) {
				//this._viewModel.unbind;
				
				return this;
			},
			bind: function (selector) {
				selector = selector || 'body';
				kendo.bind($(selector), this._viewModel);
				
				return this;
			},
			bindValidation: function (selector, rules) {
				selector = selector || 'body';
				rules = rules || {};
				
                this._validator = $(selector).kendoSilentValidator(rules).data('kendoSilentValidator'); // TODO: This property really belongs to the block
				
				return this;
			}
		});
		
		return binder.init(director, viewModel);
	}
};

App.Data = App.Data || {};

App.Data.DataSource = App.Data.DataSource || {
	Factory: function (params) {
		try {
			var dataSource;
			
			switch (params.type) {
				case 'entity':
					if (params.hasOwnProperty('hierarchical') && params.hierarchical === true) {
						dataSource = Object.create(App.Data.DataSource.HierarchicalEntityDS(params.config), {});
					} else {
						dataSource = Object.create(App.Data.DataSource.EntityDS(params.config), {});
					}
					break;
					
				case 'method':
					if (params.hasOwnProperty('hierarchical') && params.hierarchical === true) {
						dataSource = Object.create(App.Data.DataSource.HierarchicalMethodDS(params.config), {});
					} else {
						dataSource = Object.create(App.Data.DataSource.MethodDS(params.config), {});
					}
					break;
					
				case 'custom':
					if (params.hasOwnProperty('hierarchical') && params.hierarchical === true) {
						dataSource = Object.create(App.Data.DataSource.HierarchicalCustomDS(params.config), {});
					} else {
						dataSource = Object.create(App.Data.DataSource.CustomDS(params.config), {});
					}
					break;
					
				case 'raw':
					if (params.hasOwnProperty('hierarchical') && params.hierarchical === true) {
						dataSource = Object.create(App.Data.DataSource.HierarchicalRawDS(params.config), {});
					} else {
						dataSource = Object.create(App.Data.DataSource.RawDS(params.config), {});
					}
					break;
			}
			
			return dataSource;
			
		} catch (e) {
			console.log(e);
		}
		
		
	},
	DataSource: function (config) {
		var defaults,
			dataSource;
			
		defaults = App.Config.DataSource.defaults();	
		config = $.extend({}, defaults, config);
		dataSource = new kendo.data.DataSource(config);
		
		return dataSource;
	},
	EntityDS: function (config) {		
		var defaults,
			dataSource;
			
		defaults = App.Config.DataSource.defaults();	
		config = $.extend({}, defaults, config);
		dataSource = new kendo.data.DataSource(config);
		
		return dataSource;
	},
	MethodDS: function (config) {
		var defaults,
			dataSource;
			
		defaults = App.Config.DataSource.defaults();
		// Merge objects recursively
		config = $.extend(true, defaults, config);
		dataSource = new kendo.data.DataSource(config);
		
		return dataSource;
	},
	CustomDS: function (config) {
		var dataSource;
		
		dataSource = new kendo.data.DataSource(config);
		
		return dataSource;
	},
	// No datasource setup needed - return object literal
	RawDS: function (config) {
		return config.data;
	},
	HierarchicalDataSource: function (config) {
		var defaults,
			dataSource;
			
		defaults = App.Config.HierarchicalDataSource.defaults();	
		config = $.extend({}, defaults, config);
		dataSource = new kendo.data.HierarchicalDataSource(config);
		
		return dataSource;
	},
	HierarchicalEntityDS: function (config) {		
		var defaults,
			dataSource;
			
		defaults = App.Config.HierarchicalDataSource.defaults();	
		config = $.extend({}, defaults, config);
		dataSource = new kendo.data.HierarchicalDataSource(config);
		
		return dataSource;
	},
	HierarchicalMethodDS: function (config) {
		var defaults,
			dataSource;
			
		defaults = App.Config.HierarchicalDataSource.defaults();
		// Merge objects recursively
		config = $.extend(true, defaults, config);
		dataSource = new kendo.data.HierarchicalDataSource(config);
		
		return dataSource;
	},
	HierarchicalCustomDS: function (config) {
		var dataSource;
		
		dataSource = new kendo.data.HierarchicalDataSource(config);
		
		return dataSource;
	},
	// No datasource setup needed - return object literal
	HierarchicalRawDS: function (config) {
		return config.data;
	}
	
};

App.Data.Bindings =  App.Data.Bindings || {
	
};

/**********************************************************
 * Namespace: App.Widgets
 **********************************************************/
App.Widgets = App.Widgets || {};

/**********************************************************
 * Namespace: App.Widgets.HTML
 **********************************************************/
App.Widgets.Helpers = App.Widgets.Helpers || {
	PanelBar: {
		build: function (builder, obj, level) {
			var that = this,
				isFirst = true,
				idx = 0,
				current,
				items,
				node;

			level = level || 0;
			
			if (typeof obj === 'function') {
				obj = obj();
			}
			
			for (idx = 0; idx < obj.length; idx++) {
				current = obj[idx];
				
				if (isFirst === true) {
					builder.append('li');
					isFirst = false;
				} else {
					builder.add('li');
				}
				
				node = builder.getCurrent();
				
				if (current.hasOwnProperty('text')) {
					builder.text(node, current.text);
				}
				
				if (current.hasOwnProperty('expanded') && current.expanded === true) {
					
				}
				
				if (current.hasOwnProperty('items')) {
					if (current.items.length > 0) {
						builder.append('ul');
						App.Widgets.Helpers.PanelBar.build(builder, current.items, level + 1);
						builder.parent();
					}
				}
				
				if (idx === obj.length - 1) {
					builder.parent();
				}
			}
		}
	},
	SemanticTabStrip: {
		build: function (builder, obj) {
			var that = this,
				idx = 0,
				tabcontainer,
				tab;
				
			// Populate tabs		
			tabcontainer = builder.appendNode(builder.getCurrent(), 'ul');
			
			// Create and inject the tabs
			for (idx = 0; idx < obj.length; idx++) {
				tab = builder.appendNode(tabcontainer, 'li');
				builder.text(tab, obj[idx]);
				
				// Make active
				if (idx === 0) {
					tab.className += ' k-state-active';
				}
			}
		}
	}
};

App.Widgets.Behavior = function () {
	var behavior = Object.create({
		_event: {},
		_target: {},
		_params: {},
		
		init: function (event, params) {
			this._event = event;
			this._params = params;
			this._target = (params.hasOwnProperty('target')) ? params.target : {};
			this._binding = (params.hasOwnProperty('bind')) ? params.bind : '';
			
			return this;
		},
		getEvent: function () {
			return this._event;
		},
		execute: function () {
		}
	});
	
	return behavior;
};

function triggerUpdate(e) {
	console.log(e);
}