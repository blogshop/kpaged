/**
 *	KPaged - A Paged Application Framework for Kendo UI
 *	
 *	@author Lucas Lopatka (lucas@blog-shop.ca)
 *	@version 0.9b
 */

/**********************************************************
 *	Declare GLOBAL Namespace: App
 *
 *	We don't want to pollute the global namespace, so we're 
 *	going to encapsulate everything under a single variable 
 **********************************************************/
 
//"use strict";

(function ($) {
    $.fn.serializeObject = function(){

        var self = this,
            json = {},
            push_counters = {},
            patterns = {
                "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
                "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
                "push":     /^$/,
                "fixed":    /^\d+$/,
                "named":    /^[a-zA-Z0-9_]+$/
            };


        this.build = function(base, key, value){
            base[key] = value;
            return base;
        };

        this.push_counter = function(key){
            if(push_counters[key] === undefined){
                push_counters[key] = 0;
            }
            return push_counters[key]++;
        };

        $.each($(this).serializeArray(), function(){

            // skip invalid keys
            if(!patterns.validate.test(this.name)){
                return;
            }

            var k,
                keys = this.name.match(patterns.key),
                merge = this.value,
                reverse_key = this.name;

            while((k = keys.pop()) !== undefined){

                // adjust reverse_key
                reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

                // push
                if(k.match(patterns.push)){
                    merge = self.build([], self.push_counter(reverse_key), merge);
                }

                // fixed
                else if(k.match(patterns.fixed)){
                    merge = self.build([], k, merge);
                }

                // named
                else if(k.match(patterns.named)){
                    merge = self.build({}, k, merge);
                }
            }

            json = $.extend(true, json, merge);
        });

        return json;
    };
})(jQuery);

// This construct can be improved - should ideally be self-executing
var App = window.App = window.App || {
	// The four route verbs
	VERBS: ['get', 'post', 'put', 'delete'],
	// An array of the default events triggered by the application during its lifecycle
	EVENTS: [
		'run',
		'unload', 
		'lookup-route', 
		'run-route',
		'route-found', 
		'event-context-before',
		'event-context-after', 
		'changed', 
		'error', 
		'check-form-submission', 
		'redirect', 
		'location-changed'
	],
	
	_config: {},
	_events: {},
	_router: {},
	_pages: {},
	_page: {}, // Current (initialized) page
	
	init: function () {	
		var eventHandler,
			router;
		
		this.Entities = window.EntityFramework.Entities;
		
		this._config = Object.create(App.Utilities.ChainableHash(), {});
		this._config.set('pages', Object.create(App.Utilities.ChainableHash(), {}));
		
		this._pages = Object.create(App.Utilities.ChainableHash(), {});
		
		// Initialize router
		this._router = App.Router(App.Routers.Adapters.Crossroads(), {});
		
		// Initialize events
		// TODO: Event handler should be configurable
		eventHandler = App.EventHandlers.Adapters.Signals(App.EVENTS);
		this._events = Object.create(App.EventHandler(eventHandler), {});
		
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
				if (typeof config.route == 'string') {
					router.add(config.route);
				} else if (typeof config.route == 'object') {
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
		
		router.parse(window.location.pathname);
		
		// Add generic routes for Kendo UI widgets
		// Kendo UI SemanticTabStrip
		router.add('/{path*}/tab5/{id}', function (path, id) {
			var tabstrip = $('[data-role=semantictabstrip]:first').data('kendoSemanticTabStrip');
			tabstrip.select(id - 1);
		});
		// Kendo UI TabStrip
		router.add('/{path*}/tab/{id}', function (path, id) {
			var tabstrip = $('[data-role=tabstrip]:first').data('kendoTabStrip');
			tabstrip.select(id - 1);
		});
		// Kendo UI PanelBar
		router.add('/{path*}/panel/{id}', function (path, id) {
			var panelbar, item;
			
			panelbar = $('[data-role=panel]:first').data('kendoPanelBar');
			item = panelBar.select(id - 1);
			
			if (item.hasClass("k-state-active") === false) {
				panelBar.expand(item);
			}
		});
		
		// Field
		// TODO: This needs to be improved
		router.add('/{path*}/field/{attr}/{ref}', function (path, attr, ref) {
			var field = $('#center-pane').find('[' + attr + '=' + ref + ']');
			
			// Focus the field
			field.click();
		});
		
		// TODO: This is pretty terrible! Move somewhere else...
		var semantictabstrips = $(document.body).find('.k-tabstrip');
		semantictabstrips.each(function (idx, tabstrip) {
			var tabstrip = $(tabstrip).data("kendoSemanticTabStrip");
			tabstrip.contentElements.each(function (idx, contentElement) {
				$(contentElement).on({
					click: function (e) {
						that.focusTab(e);
					},
					blur: function (e) {
						var current = App.getCurrent(),
							block = current.getBlock('center-pane'),
							validator = block.getValidator(),
							errorHandler = current.getErrorHandler(),
							errorPanel = $('[name=ErrorPanel]').data('kendoEventPanelBar');

						if (validator.validate() === false) {
							errorHandler.setErrors('validation', validator._errors);
						}
					}
				}, '.k-input');
			});
		});
	},
	// TODO: This is pretty terrible! Move somewhere else...
	focusTab: function (e) {
		var target,
			tabstrip,
			tab,
			index;
		
		target = e.target;
		tabstrip = $(target).closest('.k-tabstrip').data("kendoSemanticTabStrip");
		tab = $(target).closest('[role=tabpanel]');
		index = tab.parent().children().index(tab);
		
		tabstrip.select(index - 1);
	},
	addPage: function (pageName, options) {
		var defaults = {},
			pages = this.getConfig('pages');
			
		// Merge defaults with options
		options = $.extend({
			name: pageName
		}, defaults, options) || defaults;
		
		
		pages.set(pageName, options);
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
			pages.each(function(name, config) {
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
 *	Object: App.URL
 *	Type: Class
 *
 *	Base class for all URLs
 */
App.URL = function () {
	var url = Object.create({
		data: {},
		template: {},
		
		init: function () {
			return this;
		},
		setTemplate: function () {
			var templateContent = $("#myTemplate").html();
			
			this.template = kendo.template(templateContent);
			this.data = [
				{ name: "John", isAdmin: false },
				{ name: "sAlex", isAdmin: true }
			];
			
			$("#users").html(result);
		},
		render: function () {
			return kendo.render(this.template, this.data);
		}
		
	});
	
	return url.init();
}

/**
 *	Object: App.Router
 *	Type: Class
 *
 *	Base class for all pages
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
			if (typeof this._adapter.current == 'function') {
				return this._adapter.current();
			}
			
			return false;
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
 *	Namespace: App.Routers
 **********************************************************/
App.Routers = App.Routers || {};

/**********************************************************
 *	Namespace: App.Routers.Adapters
 **********************************************************/
App.Routers.Adapters = App.Routers.Adapters || {
	/**
	 *	Adapter for Kendo UI Router
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
				var route = this._router.route(route, callback);
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
	 *	Adapter for Crossroads.js
	 *
	 *	Credits to Miller Medeiros
	 *	Crossroads.js Javascript Routes System
	 *	http://millermedeiros.github.io/crossroads.js
	 */
	Crossroads: function (options) {
		var router = Object.create({
			_router: {},
			_hasher: {},
			_current: {},
			
			/**
			 *	Method: App.Router.Crossroads.router
			 *
			 *	Signal dispatched every time that crossroads.parse can't find a Route that matches the request. 
			 *	Useful for debuging and error handling. 
			 *
			 *	@return Crossroads object
			 */
			router: function () {
				return this._router;
			},
			/**
			 *	Method: App.Router.Crossroads.hasher
			 *
			 *	@return Crossroads object
			 */
			hasher: function () {
				return this._hasher;
			},
			
			/**
			 *	Method: App.Router.bypassed
			 *
			 *	Signal dispatched every time that crossroads.parse can't find a Route that matches the request. 
			 *	Useful for debuging and error handling. 
			 *
			 *	@return Signal object
			 */
			bypassed: function () {
				return this._router.bypassed;
			},
			/**
			 *	Method: App.Router.routed
			 *
			 *	Signal dispatched every time that crossroads.parse finds a Route that matches the request.
			 *	Useful for debuging and for executing tasks that should happen at each routing. 
			 *
			 *	@return Signal object
			 */
			routed: function () {
				return this._router.routed;
			},
			/**
			 *	Method: App.Router.greedy
			 *
			 *	Sets the global route matching behavior to greedy so crossroads will try to match every single route with the supplied request.
			 *	If true it won't stop at the first match.
			 *
			 *	@value bool
			 *	
			 *	@return this
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
	 *	Adapter for Hasher.js
	 *
	 *	Credits to Miller Medeiros
	 *	Hasher
	 *	https://github.com/millermedeiros/Hasher
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
			destroy: function () {;
			},
			reset: function () {
			}
		});
		
		return router.init(options);
	},
};

// Real-time event logging
// TODO: This should be generic
App.ErrorHandler = function (page) {
	var errorHandler = Object.create({
		_page: {},
		_subscribers: {},
		
		init: function (page) {
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
								
								/* Reference ONLY
								App.URL = function () {
									var url = Object.create({
										data: {},
										template: {},
										
										init: function () {
											return this;
										},
										setTemplate: function () {
											var templateContent = $("#myTemplate").html();
											
											this.template = kendo.template(templateContent);
											this.data = [
												{ name: "John", isAdmin: false },
												{ name: "sAlex", isAdmin: true }
											];
											
											$("#users").html(result);
										},
										render: function () {
											return kendo.render(this.template, this.data);
										}
										
									});
									
									return url.init();
								}*/
								
								parent.items.push(item);
								
							});
						}
						
						parent.items.push({text: 'Test error', cssClass: 'error'});
						parent.items.push({text: 'Test notice', cssClass: ['error', 'notice'].join(' ')}); 
						
						data.push(parent);
					}
				});
				
				// Notify subscribers
				that.notifySubscribers(event, data);
			});
			
			
			this._page = page;
			this._subscribers = subscribers;
			
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
		notifySubscribers: function (event, data) {
			this._subscribers.each(function (name, subscriber) {
				// Duck-typing doesn't work... something to do with inheritance?
				// Oh well, crash if the observer doesn't have a notify method.
				subscriber.notify(event, data);
			});
			
			return this;
		},
		setErrors: function (type, data) {
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
		log: function (error) {
			// Do something
		}
	});
	
	return errorHandler.init(page);
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
			if (typeof this._adapter.adapter == 'function') {
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
		hasEventListener: function (eventName, callback, scope) {
			this._adapter.hasEventListener(eventName, callback, scope);
		},
		dispatch: function (eventName, target) {
			this._adapter.dispatch(eventName, target);
		},
		getEvents: function () {
			this._adapter.getEvents();
		}
	});
	
	return eventHandler.init(adapter);
};

/**********************************************************
 *	Namespace: App.EventHandlers
 **********************************************************/
App.EventHandlers = App.EventHandlers || {};

/**********************************************************
 *	Namespace: App.EventHandlers.Adapters
 **********************************************************/
App.EventHandlers.Adapters = App.EventHandlers.Adapters || {
	/**
	 *	Adapter for JS-Signals
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
			},
			removeEventListener: function (eventName, callback, scope) {
				var events = this._events;
				
				if (events.has(eventName)) {
					this._events.get(eventName).remove(callback);
				}
				
				return this;
			},
			hasEventListener: function (eventName, callback, scope) {
				var events = this._events;
					
				return events.has(eventName);
			},
			dispatch: function (eventName, args) {
				var events = this._events,
					event;
				
				if (events.has(eventName)) {
					event = this._events.get(eventName);
					event.dispatch.apply(event, args);
				}
			},
			getEvents: function () {
				return this._events;
			}
		});
		
		return jssignals.init(events);
	},
	/**
	 *	EventBus Driver
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
				if (typeof this.listeners[type] != "undefined") {
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
				if (typeof this.listeners[type] != "undefined") {
					var numOfCallbacks = this.listeners[type].length;
					var newArray = [];
					for (var i = 0; i < numOfCallbacks; i++) {
						var listener = this.listeners[type][i];
						if (listener.scope == scope && listener.callback == callback) {

						} else {
							newArray.push(listener);
						}
					}
					this.listeners[type] = newArray;
				}
			},
			hasEventListener: function (type, callback, scope) {
				if (typeof this.listeners[type] != "undefined") {
					var numOfCallbacks = this.listeners[type].length;
					if (callback === undefined && scope === undefined) {
						return numOfCallbacks > 0;
					}
					for (var i = 0; i < numOfCallbacks; i++) {
						var listener = this.listeners[type][i];
						if (listener.scope == scope && listener.callback == callback) {
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
				};
				args = args.length > 2 ? args.splice(2, args.length - 1) : [];
				args = [event].concat(args);
				if (typeof this.listeners[type] != "undefined") {
					var numOfCallbacks = this.listeners[type].length;
					for (var i = 0; i < numOfCallbacks; i++) {
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
 *	Namespace: App.Controllers
 **********************************************************/
App.Controllers = App.Controllers || {
	/**
	 * This is the base prototype of the Controller classes.
	 * The inheriting classes only expand the prototype so the trouble of handling
	 * private constructor is saved.
	 * It makes sense that each controller is a singleton. The cases that a
	 * controller's state need to be shared across the application are more than the
	 * cases that the states need to be kept independently. It also helps the user
	 * logic shares the same controller state as the one the Router uses.
	 * However, if independent states are vital, one can extend a controller with
	 * empty members or define their method statelessly.
	 * @type {Class}
	 */
	Base: function () {
		var instance;
		var klass = function Controller() {
			if (instance !== undefined) { //try to simulate Singleton
				return instance;
			}
			BaseController.apply(this, arguments);

			//'initialize()' method works as explicit constructor, if it is defined,
			// then run it
			if (this.initialize !== undefined) {
				this.initialize.apply(this, arguments);
			}

			instance = this;
			return instance;
		};

		klass.prototype = new BaseController();
		_.extend(klass.prototype, properties);

		klass.prototype.constructor = klass;
		klass.prototype.classId = _.uniqueId('controller_');

		return klass;
	},
	//some default implementations for the methods are listed here:
	Controller: {
		init: function () {
			var name = properties.name;
            if (typeof name === 'undefined') {
                throw '\'name\' property is mandatory ';
            }

            // also inherits the methods from ancestry
            properties = _.extend({}, _inheritedMethodsDefinition, properties);

            //special handling of method override in inheritance
            var tmpControllerProperties = _.extend({}, BackboneMVC.Controller);

            var actionMethods = {}, secureActions = {};
            //try to pick out action methods
            _.each(properties, function (value, propertyName) {
                tmpControllerProperties[propertyName] = value; // transfer the property, which will be later
                //filter the non-action methods
                if (typeof value !== 'function' || propertyName[0] === '_' ||
                    _.indexOf(systemActions, propertyName) >= 0) {
                    return false;
                }

                actionMethods[propertyName] = value;
                if (propertyName.match(/^user_/i)) { //special handling to secure methods
                    secureActions[propertyName] = value;
                    // even though secure methods start with 'user_', it's useful if they can be invoked without
                    // that prefix
                    var shortName = propertyName.replace(/^user_/i, '');
                    if (typeof properties[shortName] !== 'function') {
                        // if the shortname function is not defined separately, also account it for a secure method
                        secureActions[shortName] = value;
                        actionMethods[shortName] = value;
                    }
                }
            });

            //_actions and _secureActions are only used to tag those two types of methods, the action methods
            //are still with the controller
            _.extend(tmpControllerProperties, actionMethods, {
                _actions:actionMethods,
                _secureActions:secureActions
            });
            //remove the extend method if there is one, so it doesn't stay in the property history
            if ('extend' in tmpControllerProperties) {
                delete tmpControllerProperties.extend;
            }
            //get around of singleton inheritance issue by using mixin
            var _controllerClass = ControllerSingleton.extend(tmpControllerProperties);
            //special handling for utility method of inheritance
            _.extend(_controllerClass, {
                extend:_extendMethodGenerator(_controllerClass, _.extend({}, _inheritedMethodsDefinition, properties))
            });

            //Register Controller
            ControllersPool[name] = _controllerClass;

            return _controllerClass;
			
		},
		beforeFilter: function () {
			return (new $.Deferred()).resolve();
		},

		afterRender: function () {
			
		},
		
		execute: function () {
		},

		checkSession: function () {
			//if not defined, then always succeed
			return (new $.Deferred()).resolve(true);
		},

		'default': function () {
			//TODO: this function will list all the actions of the controller
			//intend to be overridden in most of the cases
			return true;
		}
	},
	instance: function () {
		return new App.Controller.Base();
	}
};

/**
 *	Object: App.Page
 *	Type: Class
 *	
 *	Base class for all page instances, and an ancestor class for page controllers
 */
App.Page = kendo.Class.extend({
	_entities: [],
	_context: {},
	_name: {},
	_config: {},
	// Stores layout instance
	_layout: {},
	// Stores event handler
	_eventHandler: {},
	// Stores events
	events: {},
	// Stores error handler
	_errorHandler: {},
	// Stores validation errors
	errors: {},
	initialized: false,
	loaded: false,
	
	init: function (config) {
		var that = this,
			defaults = {},
			config,
			entity,
			blocks,
			block,
			layout,
			hasBlocks = false;
		
		/* We have to reset the that for all "protected" properties. In the event that they don't exist in the inheriting object, the compiler will continue along the prototype chain and properties will be appended to the prototype instead of the inheriting object. */
		that._name = {}, that._entities = [], that._layout = [], that._eventHandler = {}, that.events = {}, that._errorHandler = {}, that.errors = {};
		
		// Merge defaults with config
		config = $.extend({}, defaults, config) || defaults;
		
		if (config.hasOwnProperty('name') && config.name !== '') {
			this._name = config.name;
		}
		
		// Register entities
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
		
		// Register layout
		that._layout = Object.create(App.Layout.Blocks(), {});
		
		if (config.layout && config.layout.length > 0) {
			$.each(config.layout, function (i, block) {
				try {
					that._layout.set(block.id, App.Layout.Block(block));
				} catch (e) {
					console.log(e);
				}
			});
		}
		
		// Register error handler
		that._errorHandler = Object.create(App.ErrorHandler(this), {});
		
		this.initialized = true;
		
		return this;
	},
	getName: function () {
		return this._name;
	},
	getBlock: function (block) {
		return this._layout.get(block);
	},
	getErrorHandler: function () {
		return this._errorHandler;
	},
	getEventHandler: function () {
		return this._eventHandler;
	},
	// TODO: Move save method to base controller
	save: function (event) {
		var that = this,
			validator = this.getBlock('center-pane').getValidator(),
			errorHandler = this.getErrorHandler(),
			errorPanel;

		// TODO: This should really be bound somewhere else
		errorPanel = $('[name=ErrorPanel]').data('kendoEventPanelBar');
		errorHandler.subscribe('errors', errorPanel);

		// TODO: This should be all be abstracted
		if (validator.validate()) {
			if (true /* if callback has been defined in config, load it */) {
				var response, d;
				
				d = {
					newClaim: $(event.currentTarget.form).serializeObject()
				};
				
				d.newClaim['ratedVehicleID'] = d.newClaim.claimVehicleID;

				d = kendo.stringify(d);
				
				response = $.ajax({
					type: "POST",
					contentType: "application/json; charset=utf-8",
					url: "Claims.aspx/SaveClaim",
					data: d,
					//data: "{'newClaim': {'lossType':'type', 'lossCause':'cause', 'isSectionA':'true', 'isSectionC':'true', 'atFaultPercent':'22', 'lossDate':'2010-12-27T11:59:18.119Z', 'chargesLaid':'false', 'chargesLaidDetails':'hweh edit', 'sectionAAmount':'53', 'sectionCAmount':'66', 'claimVehicleID':'22', 'ratedVehicleID':'22', 'driverID':'2', 'driverName':'Bob', 'ignore':'This Term Only', 'ignoreReason': ''}}",
					dataType: "json",
					async: false,
					processData: false,
					complete: function (xhr, status) {
						// Do something
					},
					success: function (data, status, xhr) {
						alert('Success!');
					},
					error: function (xhr, status, msg) {
						alert('Something went wrong. Please review your submission and try again!');
					}
				});
			}
		} else {
			errorHandler.setErrors('validation', validator._errors);
		}
	},
	// TODO: Move load method to base controller
	load: function () {
		var response,
			data,
			viewModel,
			prop,
			value;
		
		response = $.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			url: "Claims.aspx/GetClaim",
			async: false
		});
		
		// Parse response
		data = $.parseJSON(response.responseJSON.d)[0]; // TODO: Why the 0?
		
		// Get the view-model
		viewModel = this.getBlock('center-pane').getViewModel();
		
		// Set values to view-model
		for (prop in data) {
			if (viewModel.hasOwnProperty(prop)) {
				value = data[prop] || '';
				viewModel.set(prop, value);
			}
		}
	}
});

/**********************************************************
 *	Namespace: App.Helpers
 **********************************************************/
App.Helpers = App.Helpers || {
	/**
	 *	Method: App.Helpers.isEmpty
	 *
	 *	Checks to see if an object is empty
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
 *	Namespace: App.Helpers.String
 **********************************************************/
App.Helpers.String = App.Helpers.String || {
	/**
	 *	Method: App.Helpers.String.hyphenize
	 *
	 */
	hyphenize: function (str) {
		return str.replace(/[A-Z]/g, function (str) { 
			return '-' + str.toLowerCase();
		});
	},
	/**
	 *	Method: App.Helpers.String.hyphenize
	 *
	 */
	camelize: function (str) {
		return str.replace(/[\s\-_]+(\w)/g, function (str) { 
			return str.toUpperCase().replace('-', ''); 
		});
	}
};

/**********************************************************
 *	Namespace: App.Helpers.JSON
 **********************************************************/
App.Helpers.JSON = App.Helpers.JSON || {
	/**
	 *	Method: App.Helpers.JSON.find
	 *
	 *	Searches for and returns a given node in a JSON dataset
	 *
	 *	@node Object
	 *	@data JSON Object: Any valid JSON object
	 *
	 *	@return
	 */
	find: function (expr, data) {
		return jsonPath(data, expr, {resultType: 'VALUE'});
	},
	/**
	 *	Method: App.Helpers.JSON.findNode
	 *
	 *	Returns a given node in a JSON dataset
	 *
	 *	@node Object
	 *	@data JSON Object: Any valid JSON object
	 *
	 *	@return
	 */
	findNode: function (node, data) {
		var expr;
		
		// Build expression from node
		expr = "$..*[?(@.name=='TypeOfLoss')]";
		
		return App.Helpers.JSON.find(expr, data);
	},
	/**
	 *	Method: App.Helpers.JSON.pathTo
	 *
	 *	Returns the path to a given node in a JSON dataset
	 *
	 *	@expr String
	 *	@data JSON Object: Any valid JSON object
	 *
	 *	@return
	 */
	pathTo: function (expr, data) {
		return jsonPath(data, expr, {resultType: 'PATH'});
	},
	/**
	 *	Method: App.Helpers.JSON.pathToNode
	 *
	 *	Searches for and returns the path to a node belonging to a JSON dataset
	 *
	 *	@expr String
	 *	@data JSON Object: Any valid JSON object
	 *
	 *	@return
	 */
	pathToNode: function (node, data) {
		var expr;
		
		// Build expression from node
		expr = "$..*[?(@.name=='TypeOfLoss')]";
		
		return App.Helpers.JSON.pathTo(expr, data);
	}
}

/**********************************************************
 *	Namespace: App.Utilities
 **********************************************************/
App.Utilities = App.Utilities || {
	/**
	 *	Object: App.Utilities.HashTable
	 *	Type: Hash
	 *
	 *	Basic hash table implementation
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
	 *	Object: App.Utilities.ChainableHash
	 *	Type: Hash
	 *
	 *	Wrapper for App.Utilities.HashTable providing a cleaner interface and supporting method chaining
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
	 *	Object: App.Utilities.Injector
	 *	Type: Class
	 *
	 *	Dependency Injection container
	 *	
	 *	Note: I should probably be using a AMD/CommonJS loader instead
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
	 *	Object: App.Utilities.Iterator
	 *	Type: Class
	 *
	 *	Basic iterator
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
	 *	Object: App.Utilities.RecursiveIterator
	 *	Type: Class
	 *
	 *	Basic recursive iterator
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
	 *	Create a namespaced function
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

/**********************************************************
 *	Namespace: App.Layout
 **********************************************************/
App.Layout = App.Layout || {

	/**
	 *	Object: App.Layout.Base
	 *	Type: Class
	 *	Base class for all layouts
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
	 *	Object: App.Page.Layout.Blocks
	 *	Type: Hash
	 */
	Blocks: function () {
		return Object.create(App.Utilities.ChainableHash(), {});
	},
	/**
	 *	Object: App.Page.Layout.Block
	 *	Type: Hash
	 */
	Block: function (obj) {
		var block = Object.create({}, {
			_id: {
				value: '',
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
			_config: {
				value: {},
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
			init: {
				value: function (obj) {	
					this._id = obj.id;
					this._config = obj;
					
					// Auto-render
					this.render();
					
					return this;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			render: {
				value: function () {
					var hasBlocks = false,
						//map,
						//fieldMap,
						layoutBuilder,
						layoutBinder,
						layoutDirector,
						children;
					
					// Check to see if this block has any forms
					hasBlocks = (this._config.hasOwnProperty('blocks') && this._config.blocks.length > 0) ? true : false;
					
					// Build forms
					if (hasBlocks) {
						
						try {
							//fieldMap = Object.create(App.Layout.FieldMap());
							layoutBinder = Object.create(App.Layout.KendoDOMBinder(), {});
							layoutBuilder = Object.create(App.Layout.KendoDOMBuilder(layoutBinder), {});
							layoutDirector = Object.create(App.Layout.DocumentDirector(layoutBuilder), {});
							
							// Build
							layoutDirector.build(this._config.blocks);
							
							// TODO: Verify functionality, maps forms
							children = document.getElementById(this._id).childNodes;
							$.each(children, function (i, node) {
								if (node.nodeType == 1 && node.className == 'pane-content') {
									node.innerHTML = '';
									node.appendChild(layoutDirector.getDocument());
									return;
								}
							});
							
							layoutBinder.bind('#' + this._id).bindValidation('#' + this._id);
							
							// Get view-model
							this._viewModel = layoutBinder.getViewModel();
							
							// Get validator
							this._validator = layoutBinder.getValidator();
							
							this._rendered = true;
							
						} catch (e) {
							console.log(e);
						}
					}
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getId: {
				value: function () {get
					return this._id;
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
		
		return block.init(obj);
	},
	DocumentDirector: function (builder, fieldMap) {
		var director = Object.create({
			_builder: {},
			// Warning: DO NOT use HTML element or attribute names, or you might get unexpected behavior!
			_validCollection: ['layout', 'Blocks', 'panels', 'forms', 'fieldsets', 'fieldgroups', 'fields', 'group', 'modules'],
			_validAttributes: ['id', 'name', 'type', 'class', 'style', 'data', 'for', 'min', 'max', 'pattern', 'step', 'required', 'rows', 'cols', 'disabled'],
			_voidElements: ['base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'img', 'input', 'link', 'meta', 'param', 'source'],
			_inputElements: ['text', 'url', 'email', 'select', 'radio', 'checkbox', 'textarea', 'datepicker', 'yesno'],
			_prevLevel: 0,
			
			init: function (builder) {
				builder = builder || '';
				if (builder) this.setBuilder(builder);
				
				return this;
			},
			setBuilder: function (builder) {
				this._builder = builder;
				
				return this;
			},
			getBuilder: function () {
				return this._builder;
			},
			isCollection: function (key, node) {
				// Collections MUST have a key, as they don't have a type
				key = key || '';
				if (key === '') return false;
				
				return (node.constructor === Array && this._validCollection.indexOf(key) !== -1) ? true : false;
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
					level,
					key,
					current,
					attributes,
					pair,
					children,
					isFirst = true,
					hasTag = false,
					maxNesting = false,
					widget;
					
				do {
					// Get the current node and build it
					key = iterator.key();
					current = iterator.current();
					
					hasTag = (current.hasOwnProperty('tag') && current.tag !== '') ? current.tag : false;
						
					if (hasTag) {
						maxNesting = (this.isVoid(current.tag)) ? true : false;
						
						attributes = {};
						
						$.each(current, function(key, value) {
							if (that._validAttributes.indexOf(key) !== -1) {
								attributes[key] = value;
							}
						});
						
                        if (isFirst === true) {
							builder.append(current.tag, attributes);
							isFirst = false;
						} else {
                            builder.add(current.tag, attributes)
                        }
						
						if (attributes.hasOwnProperty('data') && attributes.data.hasOwnProperty('role')) {
							if (attributes.data.role == 'semantictabstrip' && current.hasOwnProperty('tabs')) {
								App.Widgets.Helpers.SemanticTabStrip.build(builder, current.tabs);
							}
							
							if (attributes.data.role == 'panelbar' || attributes.data.role == 'eventpanelbar') {
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
						
						// Append validation
						if (current.hasOwnProperty('validation')) {
							attributes = {}; // Clear attributes
							
							$.each(current.validation, function(key, value) {
								if (that._validAttributes.indexOf(key) !== -1) {
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
							level = (hasTag) ? level + 1 : level;
							this.build(children, level);
						}
					}
					
					// Move to the next node
					iterator.next();
				} while (iterator.hasNext());
				
				if (current && current.hasOwnProperty('tag') && current.tag !== '') {
					if (iterator.hasNext() === false) builder.parent();
				}
			},
			getDocument: function () {
				return this.getBuilder().getDocument();
			}
		});
		
		return director.init(builder);
	},
	FieldMap: function () {
		return Object.create(App.Utilities.ChainableHash(), {});
	},
	/**
	 *	Object: App.Layout.DocumentBuilder
	 *	Type: Class
	 *
	 *	Interface for Builder classes
	 *	
	 */ 
	DocumentBuilder: function () {},
		
	/**
	 *	Object: App.Layout.DOMBuilder
	 *	Type: Class
	 *
	 *	Creates an HTML document using W3C DOM methods
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
			 *	Returns the document
			 *
			 *	@return DOM Node: The DOM document fragment
			 */
			getDocument: function () {
				return this._document;
			},
			/**
			 *	Returns the root node
			 *
			 *	@return DOM Node: The root node
			 */
			getRoot: function () {
				return this._rootNode;
			},
			/**
			 *	Returns the current node
			 *
			 *	@return DOM Node: The current node
			 */
			getCurrent: function () {
				return this._currentNode;
			},
			/**
			 *	Sets the current node
			 *
			 *	@return DOM Node: The current node
			 */
			setCurrent: function (node) {
				this._currentNode = node;
				
				return this;
			},
			/**
			 *	Returns the parent of the current node
			 *
			 *	@return DOM Node: The parent node
			 */
			getParent: function () {
				return this._currentNode.parentNode;
			},
			/**
			 *	Creates and appends a node inside a specified parent
			 *	
			 *	@ref DOM Node: The insertion target for the new node
			 *	@tag String: A valid HTML5 element tag
			 *	@attributes Object: And object containing key-value pairs of attributes and values
			 *
			 *	@return DOM Node: The newly created node
			 */
			appendNode: function (ref, tag, attributes) {
				var node = document.createElement(tag);
				ref.appendChild(node);
				//this._currentNode = node;
				
				this.setAttributes(node, attributes);
				
				return node;
			},
			/**
			 *	Creates a node and inserts it before the specified element
			 *	
			 *	@ref DOM Node: A reference node for inserting the new node
			 *	@tag String: A valid HTML5 element tag
			 *	@attributes Object: And object containing key-value pairs of attributes and values
			 *
			 *	@return DOM Node: The newly created node
			 */
			addBefore: function (ref, tag, attributes) {
				var node = document.createElement(tag);
				ref.parentNode.insertBefore(node, ref);
				//this._currentNode = node;
				
				this.setAttributes(node, attributes);
				
				return node;
			},
			/**
			 *	Creates a node and inserts it after the specified element
			 *	
			 *	@parent DOM Node: A reference node for inserting the new node
			 *	@tag String: A valid HTML5 element tag
			 *	@attributes Object: And object containing key-value pairs of attributes and values
			 *
			 *	@return DOM Node: The newly created node
			 */
			addAfter: function (ref, tag, attributes) {
				var node = document.createElement(tag);
				ref.parentNode.insertBefore(node, ref.nextSibling);
				//this._currentNode = node;
				
				this.setAttributes(node, attributes);
				
				return node;
			},
			
			/* Chainable methods
			---------------------- */
			
			/**
			 *	Creates and appends a node inside a specified parent
			 *	
			 *	@tag String: A valid HTML5 element tag
			 *	@attributes Object: And object containing key-value pairs of attributes and values
			 *	@ref DOM Node: (Optional) The insertion target for the new node
			 *
			 *	@return DOMBuilder: this
			 */
			append: function (tag, attributes, ref) {
				var parent, node;
				
				ref = ref || this._currentNode;
				node = document.createElement(tag);
				ref.appendChild(node);
				this._currentNode = node;
				
				this.setAttributes(node, attributes);
				
				return this;
			},
			/**
			 *	Creates a node and inserts it after the specified element
			 *	
			 *	@tag String: A valid HTML5 element tag
			 *	@attributes Object: And object containing key-value pairs of attributes and values
			 *	@ref DOM Node: A reference node for inserting the new node
			 *
			 *	@return DOMBuilder: this
			 */
			add: function (tag, attributes, ref) {
				var ref, node;
				
				ref = ref || this._currentNode;
				node = document.createElement(tag);
				ref.parentNode.insertBefore(node, ref.nextSibling);
				this._currentNode = node;
				
				this.setAttributes(node, attributes);
				
				return this;
			},
			/**
			 *	Creates a node and inserts it before the specified element
			 *	
			 *	@tag String: A valid HTML5 element tag
			 *	@attributes Object: And object containing key-value pairs of attributes and values
			 *	@ref DOM Node: A reference node for inserting the new node
			 *
			 *	@return DOMBuilder: this
			 */
			before: function (tag, attributes, ref) {
				var ref, node;
				
				ref = ref || this._currentNode;
				node = document.createElement(tag);
				ref.parentNode.insertBefore(node, ref);
				this._currentNode = node;
				
				this.setAttributes(node, attributes);				
				
				return this;
			},
			/**
			 *	Sets the internal current node reference to the parent of the current node
			 *
			 *	@return DOMBuilder: this
			 */
			parent: function () {
				var ref, node;
				
				ref = ref || this._currentNode;
				this._currentNode = this._currentNode.parentNode;
				
				return this;
			},
			/**
			 *	Sets the text for a specified node
			 *
			 *	@return DOMBuilder: this
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
	KendoDOMBuilder: function (domBinder) {
		var domBuilder = Object.create(App.Layout.DOMBuilder(), {
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
						'visible'
					],
					'role': true,
					'link': true
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			
			init: {
				value: function (domBinder) {
					var doc, rootNode;
					
					this._document = doc = document.createDocumentFragment();
					this._rootNode = rootNode = this.appendNode(doc, 'div');
					this._currentNode = rootNode;
					this._binder = domBinder || Object.create(App.Layout.DOMBinder(), {});
					this._widgets = App.Config.Widgets.defaults();
					
					return this;
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
														if (Object.keys(attributes.data).indexOf(k) == -1) {
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
												break;
											default:
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
		
		return domBuilder.init(domBinder);
	},
	/**
	 *	Object: App.Layout.DOMBinder
	 *	Type: Class
	 *
	 *	Creates Kendo UI View-Model inheriting from App.Layout.Base
	 *	
	 *	@param ViewModel: A kendo.observable object
	 */
	DOMBinder: function (viewModel) {
		var binder = Object.create({
			_viewModel: {},
			
			init: function (viewModel) {
				this._viewModel = viewModel || Object.create(kendo.observable(), {});
				
				return this;
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
		
		return binder.init(viewModel);
	},
	// TODO: this should inherit from the generic object above
	KendoDOMBinder: function (viewModel) {
		var binder = Object.create({
			_viewModel: {},
			_validator: {},
			_widgets: {},
			_root: {},
			
			init: function (viewModel) {
				this._viewModel = viewModel || Object.create(kendo.observable(), {});
				this._widgets = App.Config.Widgets.defaults();
				
				return this;
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
					events = [],
					event,
					target,
					fnCallback;	
				
				// Empty data attributes will crash Kendo
				if (App.Helpers.isEmpty(bindings) === false) {
					// TODO: Could be using strategy pattern to process data attributes
					if (typeof bindings === 'string') {
						// Data-bind the value
						// Make sure the property doesn't exist before adding it
						if (that._viewModel.hasOwnProperty(bindings) === false) {
							// Add the property
							val.push('value: ' + bindings);
							that._viewModel.set(bindings, '');
						}
					} else {
						$.each(bindings, function (type, binding) {
							switch (type) {
								case 'source':
									// TODO: relying on a name attribute is kind of retarded. IDs aren't much better... auto-naming?
									identifier = node.getAttribute('name');
									method = App.Helpers.String.camelize(identifier) + type[0].toUpperCase() + type.slice(1);
							
									ds = App.Data.DataSource.Factory(binding);
									val.push(type + ': ' + method);
									that._viewModel.set(method, ds);
									
									break;

								case 'value':
									// Make sure the property doesn't exist before adding it
									if (that._viewModel.hasOwnProperty(binding) === false) {
										// Add the property
										val.push(type + ': ' + binding);
										that._viewModel.set(binding, '');
										// TODO: accept function
									}
									
									break;

								case 'events':
									// TODO: Make sure events are supported!
									$.each(binding, function (event, callback) {
										fnCallback = App.Helpers.String.camelize(node.getAttribute('name')) + 'On' + event[0].toUpperCase() + event.slice(1);
										// Add the property
										events.push(event + ': ' + fnCallback);
										that._viewModel.set(fnCallback, callback);
									});

									if (events.length > 0) {
										val.push('events: { ' + events.join(', ') + ' }');
									}

									break;

								case 'field':
									/*fnCallback = false;
									event = binding.event || 'change';
									type = binding.type;
									target = binding.target;
									
									if (binding.type == 'triggerUpdate') {
										console.log(method);
										console.log(binding.callback);
										fnCallback = [method, binding.callback].join('_');
										console.log(fnCallback);
										
										// Make sure the property doesn't exist before adding it
										if (fnCallback && that._viewModel.hasOwnProperty(fnCallback) === false) {
											// Define the callback
											switch (binding.callback) {
												case 'updateSourceUsingValue':
													// Add the property
													that._viewModel.set(fnCallback, function () {
														alert("Doing something");
													});
													console.log(that._viewModel);
													
													events.push(event + ': ' + fnCallback);
													break;
												case 'updateUsingValue':
													break;
											}
										}
									}*/
									
									break;

								default:
									val.push(type + ': ' + binding);

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
			bindValidation: function (selector) {
				selector = selector || 'body';
				this._validator = $(selector).kendoValidator().data('kendoValidator');
				
				return this;
			}
		});
		
		return binder.init(viewModel);
	}
};

App.Data = App.Data || {};

App.Data.DataSource = App.Data.DataSource || {
	Factory: function (params) {
		try {
			var dataSource;
			
			switch (params.type) {
				case 'entity':
					dataSource = Object.create(App.Data.DataSource.EntityDS(params.config), {});
					break;
				case 'method':
					dataSource = Object.create(App.Data.DataSource.MethodDS(params.config), {});
					break;
				case 'custom':
					dataSource = Object.create(App.Data.DataSource.CustomDS(params.config), {});
					break;
				case 'raw':
					dataSource = Object.create(App.Data.DataSource.RawDS(params.config), {});
					break;
			}
		} catch (e) {
			console.log(e);
		}
		
		return dataSource;
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
	}
	
};

App.Data.Bindings =  App.Data.Bindings || {
	
};


/**********************************************************
 *	Namespace: App.Config
 **********************************************************/
 
App.Config = App.Config || {};
	
App.Config.DataSource = App.Config.DataSource || {
	defaults: function () {
		return {
			transport: {
				create: {
					url: '',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json'
				},
				read: {
					url: '',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json'
				},
				update: {
					url: '',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json'
				},
				destroy: {
					url: '',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json'
				},
				parameterMap: function (options) {
					return kendo.stringify(options); // kendo.stringify serializes to JSON string
				}
			},
			schema: {
				data: function (data) {
					return $.parseJSON(data.d);
				}
			}
		}
	}
};

/**
 *	Default Kendo UI widget parameters and attributes
 *	Convention over configuration!
 */
App.Config.Widgets = App.Config.Widgets || {
	defaults: function () {
		return {
			// Lowercase keys are easier to find when iterating!
			autocomplete: {
				attributes: {
					data: {
						textField: 'Value'
					}
				}
			},
			calendar: {},
			colorpicker: {},
			combobox: {
				attributes: {
					data: {
						textField: 'Value',
						valueField: 'Key'
					}
				}
			},
			datepicker: {}, 
			datetimepicker: {},
			dropdownlist: {
				attributes: {
					data: {
						textField: 'Value',
						valueField: 'Key',
					}
				}
			},
			editor: {},
			grid: {},
			listview: {},
			menu: {},
			multiselect: {},
			numerictextbox: {},
			panelbar: {},
			eventpanelbar: {},
			slider: {},
			splitter: {},
			tabstrip: {},
			semantictabstrip: {
				attributes: {
					data: {
						tabContainer: 'ul',
						tabElement: 'li',
						contentElement: 'fieldset',
					}
				}
			},
			timepicker: {},
			tooltip: {},
			treeview: {
				attributes: {
					data: {
						animation: false,
						dragAndDrop: false,
					}
				}
			},
			upload: {},
			window: {}
		}
	}
};

/**********************************************************
 *	Namespace: App.Widgets
 **********************************************************/
App.Widgets = App.Widgets || {}

/**********************************************************
 *	Namespace: App.Widgets.HTML
 **********************************************************/
App.Widgets.Helpers = App.Widgets.Helpers || {
	PanelBar: {
		build: function (builder, obj, level) {
			var that = this,
				level = level || 0,
				isFirst = true,
				idx = 0,
				current,
				items,
				node;
				
			if (typeof obj == 'function') {
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
				
				if (idx === obj.length - 1) builder.parent();
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
				if (idx == 0) tab.className += ' k-state-active';
			}
		}
	}
}

function triggerUpdate(e) {
	console.log(e)
}