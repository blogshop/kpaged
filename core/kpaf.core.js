
/**
 * Kendo UI Paged Application Framework (kPaged)
 * Formerly known as kpaf, but kPaged sounds better
 *
 * @author Lucas Lopatka
 * @version 1.0
 * @props To everyone that pays me to write stuff that I'm actually interested in!
 *
 * This is the Kendo Paged Application Framework core. Don't mess with it unless you're a Jedi Master.
 *
 */
 
//"use strict";

define(['signals', 'crossroads', 'hasher'], function (signals, crossroads, hasher) {
	/*global log:false*/
	
	if (typeof console === 'undefined' || typeof console.log === 'undefined') {  
		console = {
			log: function (message) {
				return false;
			}
		};
	}

	// Tell IE9 to use its built-in console
	if (Function.prototype.bind && /^object$|^function$/.test(typeof console) && typeof console.log === 'object' && typeof window.addEventListener === 'function') {
		['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd']
			.forEach(function(method) {
				console[method] = this.call(console[method], console);
			}, Function.prototype.bind);
	}

	// log() -- The complete, cross-browser console.log wrapper for his or her logging pleasure
	(function _log() {
		if (window.log) {
			return;
		}

		window.log = function() {
			var args = arguments,
				isIECompatibilityView = false,
				i, sliced,
				// Test if the browser is IE8
				isIE8 = function _isIE8() {
					// Modernizr, es5-shim, and other scripts may polyfill `Function.prototype.bind` so we can't rely solely on whether that is defined
					return (!Function.prototype.bind || (Function.prototype.bind && typeof window.addEventListener === 'undefined')) &&
						typeof console === 'object' &&
						typeof console.log === 'object';
				};

			log.history = log.history || new kendo.data.ObservableArray([]); // store logs to an array for reference
			log.history.push(arguments);

			// If the detailPrint plugin is loaded, check for IE10- pretending to be an older version,
			//   otherwise it won't pass the "Browser with a console" condition below. IE8-10 can use
			//   console.log normally, even though in IE7/8 modes it will claim the console is not defined.
			// TODO: Can someone please test this on Windows Vista and Windows 8?
			if (log.detailPrint && log.needsDetailPrint) {
				(function() {
					var ua = navigator.userAgent,
						winRegexp = /Windows\sNT\s(\d+\.\d+)/;

					// Check for certain combinations of Windows and IE versions to test for IE running in an older mode
					if (console && console.log && /MSIE\s(\d+)/.test(ua) && winRegexp.test(ua)) {
						// Windows 7 or higher cannot possibly run IE7 or older
						if (parseFloat(winRegexp.exec(ua)[1]) >= 6.1) {
							isIECompatibilityView = true;
						}
						// Cannot test for IE8+ running in IE7 mode on XP (Win 5.1) or Vista (Win 6.0)...
					}
				}());
			}

			// Browser with a console
			if (isIECompatibilityView || typeof console.log === 'function') {
				sliced = Array.prototype.slice.call(args);

				// Get argument details for browsers with primitive consoles if this optional plugin is included
				if (log.detailPrint && log.needsDetailPrint) {
					// Display a separator before the list
					console.log('-----------------');
					args = log.detailPrint(args);
					i = 0;

					while (i < args.length) {
						console.log(args[i]);
						i++;
					}
				}
				// Single argument, which is a string
				else if (sliced.length === 1 && typeof sliced[0] === 'string') {
					console.log(sliced.toString());
				}
				else {
					console.log(sliced);
				}
			}
			// IE8
			else if (isIE8()) {
				if (log.detailPrint) {
					// Prettify arguments
					args = log.detailPrint(args);

					// Add separator at the beginning of the list
					args.unshift('-----------------');

					// Loop through arguments and log them individually
					i = 0;
					while (i < args.length) {
						Function.prototype.call.call(console.log, console, Array.prototype.slice.call([args[i]]));
						i++;
					}
				}
				else {
					Function.prototype.call.call(console.log, console, Array.prototype.slice.call(args));
				}
			}
			// IE7 and lower, and other old browsers
			else {
				// Inject Firebug lite
				if (!document.getElementById('firebug-lite')) {
					// Include the script
					(function () {
						var script = document.createElement('script');

						script.type = 'text/javascript';
						script.id = 'firebug-lite';

						// If you run the script locally, change this to /path/to/firebug-lite/build/firebug-lite.js
						script.src = 'https://getfirebug.com/firebug-lite.js';

						// If you want to expand the console window by default, uncomment this line
						//document.getElementsByTagName('HTML')[0].setAttribute('debug','true');
						document.getElementsByTagName('HEAD')[0].appendChild(script);
					}());

					setTimeout(function() {
						window.log.apply(window, args);
					}, 2000);
				}
				else {
					// FBL was included but it hasn't finished loading yet, so try again momentarily
					setTimeout(function() {
						window.log.apply(window, args);
					}, 500);
				}
			}
		};
	}());
	
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
		
		/*!
		 * $.fn.scrollIntoView - similar to the default browser scrollIntoView
		 * The default browser behavior always places the element at the top or bottom of its container. 
		 * This override is smart enough to not scroll if the element is already visible.
		 *
		 * Copyright 2011 Arwid Bancewicz
		 * Licensed under the MIT license
		 * http://www.opensource.org/licenses/mit-license.php
		 * 
		 * @date 8 Jan 2013
		 * @author Arwid Bancewicz http://arwid.ca
		 * @version 0.3
		 */
		 (function($) {
			$.fn.scrollIntoView = function(duration, easing, complete) {
				// The arguments are optional.
				// The first argment can be false for no animation or a duration.
				// The first argment could also be a map of options.
				// Refer to http://api.jquery.com/animate/.
				var opts = $.extend({},
				$.fn.scrollIntoView.defaults);

				// Get options
				if ($.type(duration) == "object") {
					$.extend(opts, duration);
				} else if ($.type(duration) == "number") {
					$.extend(opts, { duration: duration, easing: easing, complete: complete });
				} else if (duration == false) {
					opts.smooth = false;
				}

				// get enclosing offsets
				var elY = Infinity, elH = 0;
				if (this.size()==1)((elY=this.get(0).offsetTop)==null||(elH=elY+this.get(0).offsetHeight));
				else this.each(function(i,el){(el.offsetTop<elY?elY=el.offsetTop:el.offsetTop+el.offsetHeight>elH?elH=el.offsetTop+el.offsetHeight:null)});
				elH -= elY;

				// start from the common ancester
				var pEl = this.commonAncestor().get(0);

				var wH = $(window).height();
				
				// go up parents until we find one that scrolls
				while (pEl) {
					var pY = pEl.scrollTop, pH = pEl.clientHeight;
					if (pH > wH) pH = wH;
					
					// case: if body's elements are all absolutely/fixed positioned, use window height
					if (pH == 0 && pEl.tagName == "BODY") pH = wH;
					
					if (
					// it wiggles?
					(pEl.scrollTop != ((pEl.scrollTop += 1) == null || pEl.scrollTop) && (pEl.scrollTop -= 1) != null) ||
					(pEl.scrollTop != ((pEl.scrollTop -= 1) == null || pEl.scrollTop) && (pEl.scrollTop += 1) != null)) {
						if (elY <= pY) scrollTo(pEl, elY); // scroll up
						else if ((elY + elH) > (pY + pH)) scrollTo(pEl, elY + elH - pH); // scroll down
						else scrollTo(pEl, undefined) // no scroll
						return;
					}

					// try next parent
					pEl = pEl.parentNode;
				}

				function scrollTo(el, scrollTo) {
					if (scrollTo === undefined) {
						if ($.isFunction(opts.complete)) opts.complete.call(el);
					} else if (opts.smooth) {
						$(el).stop().animate({ scrollTop: scrollTo }, opts);
					} else {
						el.scrollTop = scrollTo;
						if ($.isFunction(opts.complete)) opts.complete.call(el);
					}
				}
				return this;
			};

			$.fn.scrollIntoView.defaults = {
				smooth: true,
				duration: null,
				easing: $.easing && $.easing.easeOutExpo ? 'easeOutExpo': null,
				// Note: easeOutExpo requires jquery.effects.core.js
				//       otherwise jQuery will default to use 'swing'
				complete: $.noop(),
				step: null,
				specialEasing: {} // cannot be null in jQuery 1.8.3
			};

			/*
			 Returns whether the elements are in view
			*/
			$.fn.isOutOfView = function(completely) {
				// completely? whether element is out of view completely
				var outOfView = true;
				this.each(function() {
					var pEl = this.parentNode, pY = pEl.scrollTop, pH = pEl.clientHeight, elY = this.offsetTop, elH = this.offsetHeight;
					if (completely ? (elY) > (pY + pH) : (elY + elH) > (pY + pH)) {}
					else if (completely ? (elY + elH) < pY: elY < pY) {}
					else outOfView = false;
				});
				return outOfView;
			};

			/*
			 Returns the common ancestor of the elements.
			 It was taken from http://stackoverflow.com/questions/3217147/jquery-first-parent-containing-all-children
			 It has received minimal testing.
			*/
			$.fn.commonAncestor = function() {
				var parents = [];
				var minlen = Infinity;

				$(this).each(function() {
					var curparents = $(this).parents();
					parents.push(curparents);
					minlen = Math.min(minlen, curparents.length);
				});

				for (var i = 0; i < parents.length; i++) {
					parents[i] = parents[i].slice(parents[i].length - minlen);
				}

				// Iterate until equality is found
				for (var i = 0; i < parents[0].length; i++) {
					var equal = true;
					for (var j in parents) {
						if (parents[j][i] != parents[0][i]) {
							equal = false;
							break;
						}
					}
					if (equal) return $(parents[0][i]);
				}
				return $([]);
			}

		})(jQuery);
		
		
		kendo.data.binders.widget.observables = kendo.data.Binder.extend({
			init: function (widget, bindings, options) {
				kendo.data.Binder.fn.init.call(this, widget, bindings, options);
				
			},
			refresh: function () {
				
			}
		});
	})(jQuery);
	
	
	/**********************************************************
	 * Declare GLOBAL Namespace: App
	 *
	 * We don't want to pollute the global namespace, so we're 
	 * going to encapsulate everything under a single variable 
	 **********************************************************/
	// This construct can be improved - should ideally be self-executing
	var App = window.App = window.App || {
		_config: null,
		_errorHandler: {},
		_eventHandler: {},
		_events: {},
		_loader: {},
		_debugger: {},
		_router: {},
		_pages: {},
		_page: {}, // Current (initialized) page
		
		init: function (config) {	
			var that = this,
				eventHandler,
				eventHandlerAdapter,
				router;
			
			// Initialize and register the config hash
			this._config = this._config || Object.create(App.Utilities.ChainableHash(), {});
			
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
			
			// Initialize the logger
			this._debugger = App.Debugger();
			
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
				router,
				adapter,
				url;
				
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
			url = [
				window.location.pathname,
				window.location.search,
				//window.location.hash,
			].join('');
			
			router.parse(url);
			
			// Kendo UI TabStrip switcher
			// TODO: Implement as plugin/module
			router.add('/{path*}/field/{attr}/{ref}', function (args) {
				var field,
					panel,
					panels,
					idx,
					tablist,
					role,
					widget;
				
				// Get the field
				field = $('#' + App.getPrimaryBlockName()).find('[' + args.attr + '=' + args.ref + ']');
				
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
				
				if (typeof widget !== 'undefined') {
					widget.select(idx);
				}
			});
			
			// TODO: This needs to be updated pronto...
			// TODO: This is pretty terrible (I mean here, the code's all good)! Move somewhere else...
			var semantictabstrips = $(document.body).find('.k-tabstrip');
			semantictabstrips.each(function (idx, tabstrip) {
				tabstrip = $(tabstrip).data('kendoSemanticTabStrip');
				tabstrip = (typeof tabstrip == 'undefined' || tabstrip == null) ? $(tabstrip).data('kendoTabStrip') : tabstrip;
				
				tabstrip.contentElements.each(function (idx, contentElement) {
					$(contentElement).on({
						blur: function (e) {
							var current = App.getCurrent(),
								block = current.getBlock(App.getPrimaryBlockName()),
								validator = block.getValidator(),
								errorHandler = current.getErrorHandler(),
								errorPanel = $('[name=ErrorPanel]').data('kendoEventPanelBar');

							// TODO: This fucking method keeps failing what the fuck is up with the goddamn validator that it isn't attaching
							if (validator.hasOwnProperty('silventValidate') && validator.silentValidate() === false) {
								errorHandler.setErrors('validation', validator._errors);
							}
						}
					}, '.k-input');
				});
			});
		},
		// TODO: Implement protocol
		getRootWebsitePath: function (trailing, protocol) {
			var path = requirejs.s.contexts._.config.baseUrl;
			trailing = (trailing === true) ? true : false;
			
			return (trailing) ? path : path.replace(/\/$/, '');
		},
		getPrimaryBlockName: function () {
			var page = App.getCurrent();
			
			if (typeof page !== 'undefined') {
				return page.getPrimaryBlockName();
			}
			
			return null;
		},
		addPage: function (config, debug) {
			// TODO: Defaults should be set in app.config.js
			var pages = this.getConfig('pages'),
				pageName,
				primaryBlock = false,
				defaults,
				events,
				listener,
				debug = debug || false;
				
			if (typeof config !== undefined && config.hasOwnProperty('name')) {
				pageName = config.name;
				
				if (config.debug) {
					App.log('Adding ' + pageName + ' page');
				}
			} else {
				throw new Error('Invalid page! No name was provided for the page');
			}
			
			if (config.hasOwnProperty('layout')) {
				$.each(config.layout, function (idx, blockConfig) {
					if (blockConfig.hasOwnProperty('primary') && blockConfig.primary === true) {
						primaryBlock = blockConfig.primaryBlock = blockConfig.block;
					}
				});
				
				if (primaryBlock === false) {
					App.log('A primary block was not specified in the configuration for the following page: ' + pageName);
					
					return false;
				} else {
					if (App.getConfig('debug') === true) {
						App.log('primary block: ' + primaryBlock);
					}
				}
			} else {
				App.log('A layout was not defined in the configuration for the following page: ' + pageName);
				
				return false;
			}
			
			defaults = {
				primaryBlock: primaryBlock,
			};
			
			// Merge defaults with options
			config = $.extend(true, defaults, config) || defaults;
			
			// Merge event handlers
			events = {
				loaded: [{
					callback: function () {
						var widgetTypes = App.Config.Widgets.defaults(),
							widgets,
							page = App.getCurrent(),
							block = page.getBlock(primaryBlock),
							viewModel = block.getViewModel(),
							validator = block.getValidator();
							
						// Trigger pageLoaded event on widgets
						// TODO: Add support for attaching multiple event listeners to a built-in page event
						$.each(widgetTypes, function (widgetRole, widgetConfig) {
							if (widgetConfig.hasOwnProperty('type')) {
								widgets = $('.k-widget').find('[data-role=' + widgetRole + ']');
								if (widgets) {
									widgets.each(function (idx, widget) {
										if (App.getConfig('debug') === true) {
											/*App.log('Triggering pageLoaded event on ' + widgetConfig.type + ' widget attached to:');
											App.log(widget);
											App.log($(widget));*/
										}
										
										if (typeof $(widget).data(widgetConfig.type) !== 'undefined') {
											$(widget).data(widgetConfig.type).trigger('pageLoaded');
										}
									});
								}
							}
						});
					}
				}],
				isLoaded: [{
					callback: function () {
						var widgetTypes = App.Config.Widgets.defaults(),
							widgets,
							page = App.getCurrent(),
							block = page.getBlock(primaryBlock),
							viewModel = block.getViewModel(),
							validator = block.getValidator(),
							validatorOptions = config.validation || {};
						
						validatorOptions = $.extend(true, {}, validator.options, validatorOptions);
						
						
						// TODO: Enable/disable SilentValidator
						//block._validator = $('#' + primaryBlock + '.k-pane').first().kendoSilentValidator(validatorOptions).data('kendoSilentValidator');
						block._validator = $('#' + primaryBlock + '.k-pane').first().kendoValidator(validatorOptions).data('kendoValidator');
						
						// This is the old way to disable Chrome's datepicker
						//$('[data-role=datepicker], [data-role=datetimepicker]').prop('type', 'text');
						//$('input[type=date]').prop('type', 'text');
						
						// Fry Chrome's datepicker/calendar and set initial date values
						if (navigator.userAgent.indexOf('Chrome') !== -1) {
							$('[data-role=datepicker], [data-role=datetimepicker]').each(function () {
								var that = $(this),
									widget;
								
								if (that.attr('data-role') === 'datepicker') {
									widget = that.data('kendoDatePicker');
								} else if (that.attr('data-role') === 'datetimepicker') {
									widget = that.data('kendoDateTimePicker');
								}
								
								if (typeof widget !== 'undefined') {
									that.prop('type', 'text');
								}
								
								that.val(kendo.toString(widget.value(), (widget.options.format || 'dd/MM/yyyy')));
							});
							
							$('input[type="date"]').each(function () {
								var that = $(this);
								
								this.addEventListener('keydown', function (event) {
									if (event.keyIdentifier == 'Down') {
										event.preventDefault();
									}
								}, false);
							});
						}
					}
				}]
			};
			
			// TODO: Add override support
			var mapEvents = function (events, eventsObject) {
				if (typeof events !== 'undefined') {
					$.each(eventsObject, function (eventName, eventListeners) {
						if (typeof eventListeners === 'function') {
							listener = {
								callback: eventListeners
							};
							
							if (typeof events[eventName] === 'undefined') {
								events[eventName] = [];
							}
							
							events[eventName].push(listener);
						} else if (eventListeners instanceof Array) {
							if (typeof events[eventName] === 'undefined') {
								events[eventName] = [];
							}
							
							$.each(eventListeners, function (idx, listener) {
								events[eventName].push(listener);
							});
						}
						
						listener = null;
					});
				}
			};
			
			var pageBase = App.Config.Page.base() || {};
			if (pageBase.hasOwnProperty('events')) {
				mapEvents(events, pageBase.events);
			}
			
			if (config.hasOwnProperty('events')) {
				mapEvents(events, config.events);
			}
			
			config.events = events;
			
			pages.set(pageName, config);
			
			if (debug) {
				App.log('Added ' + pageName + ' to pages');
			}
		},
		addBlock: function (config, debug) {
			var blockName = config.name,
				defaults = {},
				blocks = this.getConfig('blocks'),
				debug = debug || false;
			
			// Merge defaults with options
			config = $.extend({}, defaults, config) || defaults;
			
			blocks.set(blockName, config);
		},
		addModule: function (config, debug) {
			var moduleName,
				defaults = {},
				modules = this.getConfig('modules'),
				debug = debug || false;
				
			if (typeof config !== undefined && config.hasOwnProperty('name')) {
				moduleName = config.name;
				
				if (config.debug) {
					App.log('Adding ' + moduleName + ' module');
				}
			} else {
				throw new Error('Invalid module! No name was provided for the module');
			}
			
			// Merge defaults with options
			config = $.extend({}, defaults, config) || defaults;
			modules.set(moduleName, config);
			
			if (debug) {
				App.log('Added ' + moduleName + ' to modules');
			}
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
		},
		getDebugger: function () {
			if (typeof this._debugger !== 'undefined') {
				return this._debugger;
			}
		},
		log: function (message) {
			if (typeof this._debugger !== 'undefined') {
				if (this._debugger.hasOwnProperty('log') && typeof this._debugger.log === 'function') {
					this._debugger.log(message);
				}
			}
		},
		trace: function (obj) {
			if (typeof this._debugger !== 'undefined') {
				if (this._debugger.hasOwnProperty('trace') && typeof this._debugger.trace === 'function') {
					this._debugger.trace(obj);
				}
			}
		}
	};

	/**
	 * Object: App.Debugger
	 * Type: Class
	 *
	 * Basic logger
	 */
	App.Debugger = function () {
		var debug = {};
		
		/**
		 * Main function giving a function stack trace with a forced or passed in Error
		 *
		 * @cfg {Error} e The error to create a stacktrace from (optional)
		 * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
		 * @return {Array} of Strings with functions, lines, files, and arguments where possible
		 */
		$.extend(debug, {
			trace: function (options) {
				options = options || {guess: true};
				var ex = options.e || null, guess = !!options.guess;
				var p = new debug.trace.implementation(), result = p.run(ex);
				return (guess) ? p.guessAnonymousFunctions(result) : result;
			},
			log: function () {
				var log = Function.prototype.bind.call(window.log, console);
				log.apply(console, arguments);
			}
		});

		debug.trace.implementation = function () {
		};

		debug.trace.implementation.prototype = {
			/**
			 * @param {Error} [ex] The error to create a stacktrace from (optional)
			 * @param {String} [mode] Forced mode (optional, mostly for unit tests)
			 */
			run: function (ex, mode) {
				ex = ex || this.createException();
				mode = mode || this.mode(ex);
				if (mode === 'other') {
					return this.other(arguments.callee);
				} else {
					return this[mode](ex);
				}
			},

			createException: function() {
				try {
					this.undef();
				} catch (e) {
					return e;
				}
			},

			/**
			 * Mode could differ for different exception, e.g.
			 * exceptions in Chrome may or may not have arguments or stack.
			 *
			 * @return {String} mode of operation for the exception
			 */
			mode: function(e) {
				if (e['arguments'] && e.stack) {
					return 'chrome';
				}

				if (e.stack && e.sourceURL) {
					return 'safari';
				}

				if (e.stack && e.number) {
					return 'ie';
				}

				if (e.stack && e.fileName) {
					return 'firefox';
				}

				if (e.message && e['opera#sourceloc']) {
					// e.message.indexOf("Backtrace:") > -1 -> opera9
					// 'opera#sourceloc' in e -> opera9, opera10a
					// !e.stacktrace -> opera9
					if (!e.stacktrace) {
						return 'opera9'; // use e.message
					}
					if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
						// e.message may have more stack entries than e.stacktrace
						return 'opera9'; // use e.message
					}
					return 'opera10a'; // use e.stacktrace
				}

				if (e.message && e.stack && e.stacktrace) {
					// e.stacktrace && e.stack -> opera10b
					if (e.stacktrace.indexOf("called from line") < 0) {
						return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
					}
					// e.stacktrace && e.stack -> opera11
					return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
				}

				if (e.stack && !e.fileName) {
					// Chrome 27 does not have e.arguments as earlier versions,
					// but still does not have e.fileName as Firefox
					return 'chrome';
				}

				return 'other';
			},

			/**
			 * Given a context, function name, and callback function, overwrite it so that it calls
			 * trace() first with a callback and then runs the rest of the body.
			 *
			 * @param {Object} context of execution (e.g. window)
			 * @param {String} functionName to instrument
			 * @param {Function} callback function to call with a stack trace on invocation
			 */
			instrumentFunction: function(context, functionName, callback) {
				context = context || window;
				var original = context[functionName];
				context[functionName] = function instrumented() {
					callback.call(this, trace().slice(4));
					return context[functionName]._instrumented.apply(this, arguments);
				};
				context[functionName]._instrumented = original;
			},

			/**
			 * Given a context and function name of a function that has been
			 * instrumented, revert the function to it's original (non-instrumented)
			 * state.
			 *
			 * @param {Object} context of execution (e.g. window)
			 * @param {String} functionName to de-instrument
			 */
			deinstrumentFunction: function(context, functionName) {
				if (context[functionName].constructor === Function &&
					context[functionName]._instrumented &&
					context[functionName]._instrumented.constructor === Function) {
					context[functionName] = context[functionName]._instrumented;
				}
			},

			/**
			 * Given an Error object, return a formatted Array based on Chrome's stack string.
			 *
			 * @param e - Error object to inspect
			 * @return Array<String> of function calls, files and line numbers
			 */
			chrome: function(e) {
				return (e.stack + '\n')
					.replace(/^[\s\S]+?\s+at\s+/, ' at ') // remove message
					.replace(/^\s+(at eval )?at\s+/gm, '') // remove 'at' and indentation
					.replace(/^([^\(]+?)([\n$])/gm, '{anonymous}() ($1)$2')
					.replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}() ($1)')
					.replace(/^(.+) \((.+)\)$/gm, '$1@$2')
					.split('\n')
					.slice(0, -1);
			},

			/**
			 * Given an Error object, return a formatted Array based on Safari's stack string.
			 *
			 * @param e - Error object to inspect
			 * @return Array<String> of function calls, files and line numbers
			 */
			safari: function(e) {
				return e.stack.replace(/\[native code\]\n/m, '')
					.replace(/^(?=\w+Error\:).*$\n/m, '')
					.replace(/^@/gm, '{anonymous}()@')
					.split('\n');
			},

			/**
			 * Given an Error object, return a formatted Array based on IE's stack string.
			 *
			 * @param e - Error object to inspect
			 * @return Array<String> of function calls, files and line numbers
			 */
			ie: function(e) {
				return e.stack
					.replace(/^\s*at\s+(.*)$/gm, '$1')
					.replace(/^Anonymous function\s+/gm, '{anonymous}() ')
					.replace(/^(.+)\s+\((.+)\)$/gm, '$1@$2')
					.split('\n')
					.slice(1);
			},

			/**
			 * Given an Error object, return a formatted Array based on Firefox's stack string.
			 *
			 * @param e - Error object to inspect
			 * @return Array<String> of function calls, files and line numbers
			 */
			firefox: function(e) {
				return e.stack.replace(/(?:\n@:0)?\s+$/m, '')
					.replace(/^(?:\((\S*)\))?@/gm, '{anonymous}($1)@')
					.split('\n');
			},

			opera11: function(e) {
				var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
				var lines = e.stacktrace.split('\n'), result = [];

				for (var i = 0, len = lines.length; i < len; i += 2) {
					var match = lineRE.exec(lines[i]);
					if (match) {
						var location = match[4] + ':' + match[1] + ':' + match[2];
						var fnName = match[3] || "global code";
						fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
						result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
					}
				}

				return result;
			},

			opera10b: function(e) {
				// "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
				// "trace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
				// "@file://localhost/G:/js/test/functional/testcase1.html:15"
				var lineRE = /^(.*)@(.+):(\d+)$/;
				var lines = e.stacktrace.split('\n'), result = [];

				for (var i = 0, len = lines.length; i < len; i++) {
					var match = lineRE.exec(lines[i]);
					if (match) {
						var fnName = match[1] ? (match[1] + '()') : "global code";
						result.push(fnName + '@' + match[2] + ':' + match[3]);
					}
				}

				return result;
			},

			/**
			 * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
			 *
			 * @param e - Error object to inspect
			 * @return Array<String> of function calls, files and line numbers
			 */
			opera10a: function(e) {
				// "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
				// "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
				var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
				var lines = e.stacktrace.split('\n'), result = [];

				for (var i = 0, len = lines.length; i < len; i += 2) {
					var match = lineRE.exec(lines[i]);
					if (match) {
						var fnName = match[3] || ANON;
						result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
					}
				}

				return result;
			},

			// Opera 7.x-9.2x only!
			opera9: function(e) {
				// "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
				// "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
				var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
				var lines = e.message.split('\n'), result = [];

				for (var i = 2, len = lines.length; i < len; i += 2) {
					var match = lineRE.exec(lines[i]);
					if (match) {
						result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
					}
				}

				return result;
			},

			// Safari 5-, IE 9-, and others
			other: function(curr) {
				var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
				var slice = Array.prototype.slice;
				while (curr && curr['arguments'] && stack.length < maxStackSize) {
					fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
					args = slice.call(curr['arguments'] || []);
					stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
					try {
						curr = curr.caller;
					} catch (e) {
						stack[stack.length] = '' + e;
						break;
					}
				}
				return stack;
			},

			/**
			 * Given arguments array as a String, substituting type names for non-string types.
			 *
			 * @param {Arguments,Array} args
			 * @return {String} stringified arguments
			 */
			stringifyArguments: function(args) {
				var result = [];
				var slice = Array.prototype.slice;
				for (var i = 0; i < args.length; ++i) {
					var arg = args[i];
					if (arg === undefined) {
						result[i] = 'undefined';
					} else if (arg === null) {
						result[i] = 'null';
					} else if (arg.constructor) {
						// TODO constructor comparison does not work for iframes
						if (arg.constructor === Array) {
							if (arg.length < 3) {
								result[i] = '[' + this.stringifyArguments(arg) + ']';
							} else {
								result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
							}
						} else if (arg.constructor === Object) {
							result[i] = '#object';
						} else if (arg.constructor === Function) {
							result[i] = '#function';
						} else if (arg.constructor === String) {
							result[i] = '"' + arg + '"';
						} else if (arg.constructor === Number) {
							result[i] = arg;
						} else {
							result[i] = '?';
						}
					}
				}
				return result.join(',');
			},

			sourceCache: {},

			/**
			 * @return the text from a given URL
			 */
			ajax: function(url) {
				var req = this.createXMLHTTPObject();
				if (req) {
					try {
						req.open('GET', url, false);
						//req.overrideMimeType('text/plain');
						//req.overrideMimeType('text/javascript');
						req.send(null);
						//return req.status == 200 ? req.responseText : '';
						return req.responseText;
					} catch (e) {
					}
				}
				return '';
			},

			/**
			 * Try XHR methods in order and store XHR factory.
			 *
			 * @return <Function> XHR function or equivalent
			 */
			createXMLHTTPObject: function() {
				var xmlhttp, XMLHttpFactories = [
					function() {
						return new XMLHttpRequest();
					}, function() {
						return new ActiveXObject('Msxml2.XMLHTTP');
					}, function() {
						return new ActiveXObject('Msxml3.XMLHTTP');
					}, function() {
						return new ActiveXObject('Microsoft.XMLHTTP');
					}
				];
				for (var i = 0; i < XMLHttpFactories.length; i++) {
					try {
						xmlhttp = XMLHttpFactories[i]();
						// Use memoization to cache the factory
						this.createXMLHTTPObject = XMLHttpFactories[i];
						return xmlhttp;
					} catch (e) {
					}
				}
			},

			/**
			 * Given a URL, check if it is in the same domain (so we can get the source
			 * via Ajax).
			 *
			 * @param url <String> source url
			 * @return <Boolean> False if we need a cross-domain request
			 */
			isSameDomain: function(url) {
				return typeof location !== "undefined" && url.indexOf(location.hostname) !== -1; // location may not be defined, e.g. when running from nodejs.
			},

			/**
			 * Get source code from given URL if in the same domain.
			 *
			 * @param url <String> JS source URL
			 * @return <Array> Array of source code lines
			 */
			getSource: function(url) {
				// TODO reuse source from script tags?
				if (!(url in this.sourceCache)) {
					this.sourceCache[url] = this.ajax(url).split('\n');
				}
				return this.sourceCache[url];
			},

			guessAnonymousFunctions: function(stack) {
				for (var i = 0; i < stack.length; ++i) {
					var reStack = /\{anonymous\}\(.*\)@(.*)/,
						reRef = /^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,
						frame = stack[i], ref = reStack.exec(frame);

					if (ref) {
						var m = reRef.exec(ref[1]);
						if (m) { // If falsey, we did not get any file/line information
							var file = m[1], lineno = m[2], charno = m[3] || 0;
							if (file && this.isSameDomain(file) && lineno) {
								var functionName = this.guessAnonymousFunction(file, lineno, charno);
								stack[i] = frame.replace('{anonymous}', functionName);
							}
						}
					}
				}
				return stack;
			},

			guessAnonymousFunction: function(url, lineNo, charNo) {
				var ret;
				try {
					ret = this.findFunctionName(this.getSource(url), lineNo);
				} catch (e) {
					ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
				}
				return ret;
			},

			findFunctionName: function(source, lineNo) {
				// FIXME findFunctionName fails for compressed source
				// (more than one function on the same line)
				// function {name}({args}) m[1]=name m[2]=args
				var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
				// {name} = function ({args}) TODO args capture
				// /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
				var reFunctionExpression = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/;
				// {name} = eval()
				var reFunctionEvaluation = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
				// Walk backwards in the source lines until we find
				// the line which matches one of the patterns above
				var code = "", line, maxLines = Math.min(lineNo, 20), m, commentPos;
				for (var i = 0; i < maxLines; ++i) {
					// lineNo is 1-based, source[] is 0-based
					line = source[lineNo - i - 1];
					commentPos = line.indexOf('//');
					if (commentPos >= 0) {
						line = line.substr(0, commentPos);
					}
					// TODO check other types of comments? Commented code may lead to false positive
					if (line) {
						code = line + code;
						m = reFunctionExpression.exec(code);
						if (m && m[1]) {
							return m[1];
						}
						m = reFunctionDeclaration.exec(code);
						if (m && m[1]) {
							//return m[1] + "(" + (m[2] || "") + ")";
							return m[1];
						}
						m = reFunctionEvaluation.exec(code);
						if (m && m[1]) {
							return m[1];
						}
					}
				}
				return '(?)';
			}
		};

		return (debug) ? debug : undefined;
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
				
				var startTime = new Date().getTime(),
					endTime;
					
				if (App.getConfig('debug') === true) {
					App.log('Attempting to load file [' + source + ']');
				}
				
				response = $.ajax(ajaxOptions).done(function () {
					if (App.getConfig('debug') === true) {
						endTime = new Date().getTime() - startTime;
						
						App.log('File [' + source + '] loaded in ' + endTime.toString() + 'ms');
					}
				});
				
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
				if (typeof adapter === 'undefined') {
					// If there's no adapter the router won't work!
					throw new Error('The routing adapter did not initialize or does not exist');
				}
				
				this._adapter = adapter;
				
				return this;
			},
			routes: function () {
				return this._adapter.router()._routes;
			},
			add: function (pattern, callback) {
				pattern = pattern;
				App.log('Attempting to match pattern [' + pattern + ']');
				
				// Default -- no controller, just render the page
				callback = callback || function (args) {
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
						App.setCurrent(pageName, page);
						page.setRequest(args).load();
					} else {
						// Throw exception
					}
				};
				
				// TODO: This is hard-coded to use Crossroads
				this._adapter.router().normalizeFn = crossroads.NORM_AS_OBJECT;
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
				bypassed: null,
				/**
				 * Method: App.Router.routed
				 *
				 * Signal dispatched every time that crossroads.parse finds a Route that matches the request.
				 * Useful for debuging and for executing tasks that should happen at each routing. 
				 *
				 * @return Signal object
				 */
				routed: null,
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
					var that = this,
						router;
					
					// Make sure Crossroads is loaded
					if (typeof crossroads !== 'undefined') {
						router = this._router = crossroads.create();
						this.bypassed = router.bypassed;
						this.routed = router.routed;
						
						if (typeof hasher !== 'undefined') {
							this._hasher = hasher;
							
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
					} else {
						throw new Error('The crossroads library must be loaded');
					}
				},
				add: function (pattern, callback, priority) {
					this._router.addRoute(pattern, callback, priority);
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
				if (App.getConfig('debug') === true) {
					//App.log('Adding listener for the ' + eventName + ' event');
					
					if (typeof scope !== 'undefined') {
						//App.log('event scope: ');
						//App.log(scope);
					}
				}
				
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
				
				if (App.getConfig('debug') === true) {
					App.log(eventName + ' event triggered - notifying subscribers');
					App.log('subscribers: ');
					App.log(this._subscribers);
				}
				
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
								if (App.getConfig('debug') === true) {
									App.log('The subscriber doesn\'t implement an update method');
								}
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
					
					page._errors = errors;
				
					page._errors.bind('change', function (event) {
						data = [];
						
						$.each(App.getPageNames(), function (idx, pageName) {
							if (page._errors.hasOwnProperty(pageName)) {
								if (page.initialized) {
								
									// Parent template
									parent = {
										text: pageName,
										expanded: true,
										items: []
									};
									
									// Block
									// This should use layout, not config
									config = App.getCurrent().getBlock(App.getPrimaryBlockName())._config;
									widgets = App.Config.Widgets.defaults();
									
									$.each(page._errors[pageName], function (idx, pageErrors) {
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
						
						that.notify('update', event, data);
					});
					
					that._page = page;
					that._subscribers = subscribers;
					
					return this;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getErrors: {
				value: function () {
					var page = this._page;
					
					return page._errors.get(page.getName());
				},
				enumerable: false,
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
					
					page._errors.set(page.getName(), errors);
					
					return this;
				},
				enumerable: false,
				configurable: false,
				writable: true
			},
			clearErrors: {
				value: function () {
					var page = this._page;
					
					page._errors.set(page.getName(), []);
				},
				enumerable: false,
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
					event.add(callback, scope);

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
		decodeHtmlEntities: function (str) {
			var element = document.createElement('div');
			
			function decode (str) {
				if (str && typeof str === 'string') {
					// Strip script/html tags
					str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
					str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
					element.innerHTML = str;
					str = element.textContent;
					element.textContent = '';
				}
				
				return str;
			}
			
			return decode(str);
		},
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
		},
		swapSubstrings: function (str, sub1, sub2) {
			str = str.replace(new RegExp('(' + sub1 + '|' + sub2 + ')', 'g'), function (match) {
				return match === sub1 ? sub2 : sub1;
			});
			
			return string;
		},
		escapeRegExp: function (str) {
		  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
		},
		shortenText: function (str, maxLength) {
			maxLength = maxLength || str.length;
			var trimmed = str.substr(0, maxLength);
			return trimmed.substr(0, Math.min(trimmed.length, trimmed.lastIndexOf(' ')));
		}
	};
	
	/**********************************************************
	 * Namespace: App.Helpers.Array
	 **********************************************************/
	App.Helpers.Array = App.Helpers.Array || {
		/**
		 * Method: App.Helpers.Array.intersect
		 *
		 */
		intersect: function (a, b) {
			var ai = 0, bi = 0, result = [];

			while (ai < a.length && bi < b.length) {
				if (a[ai] < b[bi]) {
					ai++;
				} else if (a[ai] > b[bi]) {
					bi++;
				} else {
					result.push(a[ai]);
					ai++;
					bi++;
				}
			}

			return result;
		},
		/**
		 * Method: App.Helpers.Array.intersectDestructive
		 *
		 */
		intersectDestructive: function (str) {
			var result = [];

			while (a.length > 0 && b.length > 0) {
				if (a[0] < b[0]) {
					a.shift();
				} else if (a[0] > b[0]) {
					b.shift();
				} else {
					result.push(a.shift());
					b.shift();
				}
			}

			return result;
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
				value: {},
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
			_primaryBlock: {
				value: null,
				enumerable: true,
				configurable: false,
				writable: true
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
			_request: {
				value: {},
				enumerable: true,
				configurable: false,
				writable: true
			},

			initialized: {
				value: false,
				enumerable: false,
				configurable: false,
				writable: true
			},
			loaded: {
				value: false,
				enumerable: false,
				configurable: false,
				writable: true
			},
			isWebForm: {
				value: false,
				enumerable: false,
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
						node,
						block,
						blockName,
						blockConfig,
						primaryBlock = false,
						layout,
						children,
						domNode;
					
					/* We have to reset the that for all "protected" properties. In the event that they don't exist in the inheriting object, the compiler will continue along the prototype chain and properties will be appended to the prototype instead of the inheriting object. */
					that._name = {};
					that._layout = [];
					that._modules = {};
					that._eventHandler = {};
					that._events = {};
					that._errorHandler = {};
					that._errors = {};
					
					// Merge defaults with config
					config = $.extend({}, defaults, config) || defaults;
					
					// Set the page configuration
					this._config = config;
					
					// Initialize hash for storing block instances
					that._blocks = Object.create(App.Utilities.ChainableHash(), {});
					
					// Initialize hash for storing block instances
					that._entities = Object.create(App.Utilities.ChainableHash(), {});
					
					// MOVE: To Metadata Validation WI
					// TODO: Refactor this into a kPaged plugin - which also involves adding plugin functionality!
					// Do we need to fetch metadata from somewhere?
					if (config.hasOwnProperty('validation') && config.validation.hasOwnProperty('entities')) {
						if (config.validation.entities.length > 0) {
							// Get the metadata schema from the application configuration
							var metadataConfig = App.Config.Metadata,
								idField = metadataConfig.schema.model.id; // TODO: Throw an error if a model hasn't been defined
							
							$.each(config.validation.entities, function (idx, entityConfig) {
								if (entityConfig.hasOwnProperty('isPrimary') && entityConfig.isPrimary === true) {
									// TODO: Throw a warning if the isPrimary flag has been set more than once!
									that._entities.primary = entityConfig.entityName;
								}
								
								$.ajax({
									url: entityConfig.url,
									data: { entityName: entityConfig.entityName },
									dataType: 'json',
									contentType: 'application/json;charset=utf-8',
									async: false, // This has to be set to false: we don't want to start rendering the object-model until the entity metadata has been loaded
									success: function (data, status, xhr) {
										var entityMetadata = Object.create(App.Utilities.ChainableHash(), {});
										
										$.map(data, function (item, idx) {
											var field = item[idField],
												fieldMetadata = item;
												
											delete fieldMetadata[idField];
											
											entityMetadata.set(field, fieldMetadata)
										});
										
										that._entities.set(entityConfig.entityName, entityMetadata);
										
										if (App.getConfig('debug') === true) {
											App.log('entity metadata');
											App.log(that._entities);
										}
										
									},
									error: function (xhr, status, message) {
										App.log('Failed to retrieve metadata for the ' + entityConfig.entityName + ' entity');
										App.log(status);
										App.log(message);
									}
								});
							});
						}
					}
					
					if (config.hasOwnProperty('name') && config.name !== '') {
						that._name = config.name;
					}
					
					// Initialize hash for storing block instances
					that._blocks = Object.create(App.Utilities.ChainableHash(), {});
					
					// Initialize hash for storing module instances
					that._modules = Object.create(App.Utilities.ChainableHash(), {});
					
					// Register error handler
					that._errorHandler = errorHandler = Object.create(App.ErrorHandler(that), {});
					
					// Register page event handler
					// TODO: Event handler should be configurable
					eventHandlerAdapter = App.EventHandlers.Adapters.Signals(App.getConfig('pageEvents'));
					eventHandler = that._eventHandler = Object.create(App.EventHandler(eventHandlerAdapter), {});
					
					// Register layout
					that._layout = Object.create(App.Page.Layout.Blocks(), {});
					
					if (config.hasOwnProperty('layout') && config.layout.length > 0) {
						$.each(config.layout, function (i, node) {
							try {
								// We're iterating over the page layout nodes, so we need to repackage them
								if (node.hasOwnProperty('block') && node.hasOwnProperty('templates')) {
									// Use a custom template, if one has been specified in the block configuration
									if (node.hasOwnProperty('template') && node.templates.hasOwnProperty(node.template)) {
										layout = node.templates[node.template];
									} else if (node.templates.hasOwnProperty('default')) {
										layout = node.templates.default;
									} else {
										layout = node.templates;
									}
									
									// The primary block should have already been set
									// This is a fail-safe
									if (node.hasOwnProperty('primary') && node.primary === true) {
										primaryBlock = that._primaryBlock = node.block;
									}
									
									blockConfig = {
										id: node.block,
										layout: layout
									};
									
									if (node.hasOwnProperty('links')) {
										$.extend(blockConfig, { links: node.links });
									}
									
									// Auto-rendering enabled for top-level blocks
									block = App.Page.Layout.Block(that, blockConfig);
								}
							} catch (e) {
								App.log(e);
							}
							
							if (block) {
								that._layout.set(block.getId(), block);
								that._blocks.set(block.getId(), block);
								
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
								
								that._blocks.each(function (name, instance) {
									if (instance.autoBind === false && instance.dataBound === false) {										
										instance.dataBind(block.getViewModel());
									}
								});
								
								
								// Data-bind module instances to their respective layouts
								that._modules.each(function (name, instance) {
									// TODO: Nested block binding still isn't working right in modules
									// TODO: Confirm... there have been changes
									if (instance.autoBind === false && instance.dataBound === false) {										
										instance.dataBind(block.getViewModel());
									} else {
										instance.dataBind();
									}
								});
							
							} else {
								if (App.getConfig('debug') === true) {
									App.log('Could not initialize the ' + node.id + ' block');
								}
							}
						});
						
						if (primaryBlock === false) {
							App.log('A primary block was not specified in the configuration for the following page: ' + this._name);
							
							return false;
						}
					}
					
					// Are we reading data from a Web Form's code-behind?
					if (config.hasOwnProperty('route')) {
						if (config.route.hasOwnProperty('mode')) {
							if (typeof config.route.mode === 'undefined' || config.route.mode === 'webForm') {
								that.isWebForm = true;
							} else if (config.route.mode === 'api') {
								that.isWebForm = false;
							}
						} else {
							that.isWebForm = true; // Default to Web Forms for now
						}
					}
					
					// Register event handlers
					if (config.hasOwnProperty('events')) {
						$.each(config.events, function (eventName, listeners) {			
							if (typeof listeners === 'function') {
								event = eventHandler.getEvent(eventName);
								
								if (event) {
									// Don't forget to set the scope!
									eventHandler.addEventListener(eventName, listeners, that);
								}
							} else if (listeners instanceof Array && listeners.length > 0) {
								event = eventHandler.getEvent(eventName);
								
								if (event) {
									$.each(listeners, function (idx, listener) {
										// Don't forget to set the scope!
										if (listeners[idx].hasOwnProperty('callback') && typeof listeners[idx].callback === 'function') {
											eventHandler.addEventListener(eventName, listeners[idx].callback, that);
										}
									});
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
			getBlocks: {
				value: function (block) {
					return this._blocks;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getBlock: {
				value: function (block) {
					return this._blocks.get(block);
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
			getPrimaryBlockName: {
				value: function () {
					return this._primaryBlock;
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
				value: function (moduleId) {
					if (moduleId) {
						return this._modules.get(moduleId);
					}
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			setModule: {
				value: function (moduleId, module) {
					this._modules.set(moduleId, module);
					return this;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			getConfig: {
				value: function () {
					return App.getConfig('pages').get(this.getName());
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
			getRequest: {
				value: function () {
					return this._request;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			setRequest: {
				value: function (request) {
					this._request = request;
					
					return this;
				},
				enumerable: true,
				configurable: false,
				writable: true
			},
			load: {
				value: function (params, url) {
					var that = this,
						config = App.getConfig('pages').get(this.getName()),
						request = this.getRequest(),
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
						requestType,
						ajaxDefaults,
						query,
						id;

					errorPanel = $('[name=ErrorPanel]').data('kendoObservingPanelBar');
					errorHandler.subscribe('errors', errorPanel);
					
					// Check if an ID was set in the request, otherwise try to pull it from the query string
					id = (request.hasOwnProperty('id') && request.id !== '') ? request.id : App.Helpers.URL.getParam('id');

					if (config.hasOwnProperty('route')) {
						if (typeof config.route === 'object') {
							if (!config.route.hasOwnProperty('read')) {
								doRead = false; // Just for clarity...
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
							if (App.getConfig('debug') === true) {
								App.log('The current page configuration contains an invalid route definition');
							}
						}
					} else {
						if (App.getConfig('debug') === true) {
							App.log('The current page configuration does not contain a route definition');
						}
						
						return false;
					}
					
					// TODO: This should be done somewhere *not* in the core!
					// TODO: This should be configurable
					// Maybe we should be using a handler instead?
					if (doRead && id !== null) {
						if (App.getConfig('debug') === true) {
							App.log('The current page\'s "autoRead" route parameter has been set to true');
						}
						
						ajaxDefaults = {
							type: 'POST',
							contentType: 'application/json; charset=utf-8',
							dataType: 'json',
							url: url || config.route.read,
							async: false,
							beforeSend: function (xhr, settings) {
								// Trigger the Page's loading event
								if (eventHandler.hasEvent('loading')) {
									if (App.getConfig('debug') === true) {
										App.log('Attempting to fetch data...');
										App.log('Triggering the current page\'s "loading" event');
									}
									
									event = eventHandler.getEvent('loading');
									event.dispatch(xhr, settings);
								}
							},
							complete: function (xhr, status) {
								switch (status) {
									case 'success':
										if (!that.isWebForm) {
											data = xhr.responseJSON;
										} else {
											data = $.parseJSON(xhr.responseJSON.d)[0];
										}
										
										that._formData = data;
										
										// Get the view-model
										block = that.getBlock(that.getPrimaryBlockName());
										
										viewModel = block.getViewModel();

										// Trigger Page's beforePopulate event
										if (eventHandler.hasEvent('beforePopulate')) {
											if (App.getConfig('debug') === true) {
												App.log('Triggering the current page\'s "beforePopulate" event');
											}
											
											event = eventHandler.getEvent('beforePopulate');
											event.dispatch(xhr, status, data);
										}
										
										// Set values to view-model
										for (prop in data) {
											if (viewModel.hasOwnProperty(prop)) {
												value = data[prop];
												type = typeof value;

												switch (type) {
													case 'string':
														value = (value.length > 0) ? value : '';
														break;
													case 'number':
														value = (parseInt(value) > -1) ? value : 0;
														break;
													case 'boolean':
														break;
													default:
														break;
												}

												viewModel.set(prop, value);
											}
										}
										
										if (App.getConfig('debug') === true) {
											App.log('Page data populated');
										}
										
										// Trigger the Page's loaded event
										if (eventHandler.hasEvent('loaded')) {
											if (App.getConfig('debug') === true) {
												App.log('Triggering the current page\'s "loaded" event');
											}
											
											event = eventHandler.getEvent('loaded');
											event.dispatch(xhr, status);
										}
										
										break;
									case 'error':
										// Trigger the Page's loadFailed event
										if (eventHandler.hasEvent('loadFailed')) {
											event = eventHandler.getEvent('loadFailed');
											event.dispatch(xhr, status);
										}
										
										break;
								}
							}
						};
						
						// Do we use the string value of the route, or extend the ajax configuration?
						if (that.isWebForm) {
							query = { queryString: kendo.stringify({ id: id }) };
							$.extend(true, ajaxDefaults, { data: kendo.stringify(query) });
						} else {
							if (typeof config.route.read !== 'undefined') {
								query = { id: id };
								url = App.getRootWebsitePath() + '/' + config.route.read.url;
								$.extend(true, ajaxDefaults, config.route.read, { data: query, url: url });
							} else {
								// Just in case...
								if (App.getConfig('debug') === true) {
									throw new Error('The route parameters for this page have been incorrectly configured');
								} else {
									errors[0] = 'Please contact your systems administrator: the route parameters for this page have not been configured';
									errorHandler.setErrors('error', errors); // TODO: Nothing happening here
								}
							}
						}
						
						response = $.ajax(ajaxDefaults);
					} else if (doRead === false) {
						App.log('The current page\'s "autoRead" route parameter has been set to false');
						
						// Trigger Page's loaded event
						if (eventHandler.hasEvent('loaded')) {
							if (App.getConfig('debug') === true) {
								App.log('Triggering the current page\'s "loaded" event');
							}
							
							event = eventHandler.getEvent('loaded');
							event.dispatch();
						}

						// Get the view-model
						block = that.getBlock(that.getPrimaryBlockName());
						
						viewModel = block.getViewModel();
					}
					
					if (App.getConfig('debug') === true) {
						App.log('Attempting to bind page validations...');
					}
					
					if (typeof block !== 'undefined') {
						binder = block.getBinder();
						
						if (binder !== 'undefined') {
							config = this._config;
							
							validationConfig = (config.hasOwnProperty('validation')) ? config.validation : false;
							binder.bindValidation('#' + App.getPrimaryBlockName(), validationConfig);
						}
					}
					
					if (App.getConfig('debug') === true) {
						App.log('Page validation binding unsuccessful - I probably should finish this :)');
					}
					
					if (App.getConfig('debug') === true) {
						App.log('Page validation binding complete');
					}
					
					modules = App.getCurrent().getModules();
					console.log('MODULES');
					console.log(modules);
					if (modules !== 'undefined') {
						modules.each(function (moduleName, module) {
							moduleEventHandler = module.getEventHandler();
							if (moduleEventHandler.hasEvent('pageLoaded')) {
								event = moduleEventHandler.getEvent('pageLoaded');
								event.dispatch();
							}
						});
					}
					
					// Trigger Page's isLoaded event
					if (eventHandler.hasEvent('isLoaded')) {
						event = eventHandler.getEvent('isLoaded');
						event.dispatch();
					}
					
					that.loaded = true;
					
					return this;
				},
				enumerable: false,
				configurable: false,
				writable: true
			},
			// TODO: Move save method to base controller
			save: {
				// TODO: Accept callback function
				value: function (event, callback) {
					var that = this,
						config = App.getConfig('pages').get(that.getName()),
						request = that.getRequest(),
						viewModel = that.getBlock(App.getPrimaryBlockName()).getViewModel(),
                        validator = that.getBlock(App.getPrimaryBlockName()).getValidator(),
						eventHandler = that.getEventHandler(),
						errorHandler = that.getErrorHandler(),
						isWebForm = that.isWebForm,
                        isString = true,
						filterData = false,
						// _block and _page properties are assigned to the view-model during Block binding
						// $id is a remnant from JSON.NET serialization
                        filterKeys = ['_block', '_page', '$id'],
                        ajaxMode = 'form',
						ajaxDefaults,
						target,
						data,
                        d,
                        response,
						url;
					
					if (validator.validate()) {						
						if (config.hasOwnProperty('ajax')) {
							if (config.ajax.hasOwnProperty('isString')) {
								isString = (typeof config.ajax.isString === 'boolean') ? config.ajax.isString : isString;
							}

							if (config.ajax.hasOwnProperty('mode')) {
								ajaxMode = config.ajax.mode || ajaxMode;
							}
							
							if (config.ajax.hasOwnProperty('filter')) {
								if (typeof config.ajax.filter === 'function') {
									filterData = true;
								}
							}
						}
						
						if (typeof ajaxMode === 'undefined' || ajaxMode === 'form') {
							// Is the event being passed from a widget?
							if (event.hasOwnProperty('data') && event.data instanceof kendo.data.ObservableObject) {
								target = $('#' + that.getPrimaryBlockName()).closest('form');
							} else if (event.hasOwnProperty('currentTarget') && event.currentTarget.hasOwnProperty('form')) {
								target = $(event.currentTarget.form);
							} else {
								throw new Error('Invalid event object: ');
								App.log(event);
							}
							
							data = target.serializeObject();
						} else if (config.ajax.mode === 'viewModel') {
							// If we're dealing with a view-model convert to JSON to fry any methods & circular references
							if (viewModel instanceof kendo.data.ObservableObject) {
								data = $.extend(true, new kendo.data.ObservableObject(), viewModel);
								
								data.forEach(function (prop, key) {										
									// Fry internal references from the view-model
									if (filterKeys.indexOf(key) > -1) {
										delete data[key];
									}
									
									// Fry any kendo.data.DataSource objects attached to the view-model
									if (prop instanceof kendo.data.DataSource) {
										delete data[key];
									}
								});

								// Convert to a plain object
								data = data.toJSON();
							}
						}

						// Filter data
						if (filterData) {
							config.ajax.filter.call(undefined, data);
						}
													
						if (isString) {
							if (isWebForm) {
								$.map(data, function (obj, idx) {
									if (typeof obj === 'string') {
										// Strip out any junk especially single quotes! Web Forms doesn't like them in the JSON request
										data[idx] = obj.replace("'", "&apos;");
									}
								});

								d = "{\'data\': \'" + kendo.stringify(data) + "\'}";
							} else {
								$.map(data, function (obj, idx) {
									if (typeof obj === 'string') {
										// Strip out any junk especially single quotes! Web Forms doesn't like them in the JSON request
										data[idx] = obj.replace("'", "&apos;");
									}
								});

								d = kendo.stringify({ data: data });
							}
						} else {
							if (isWebForm) {
								d = "{\'data\': " + kendo.stringify(data) + "}";
							} else {
								d = { data: data };
							}
						}
						
						// Set defaults
						ajaxDefaults = {
							type: 'POST',
							contentType: 'application/json; charset=utf-8',
							data: d,
							dataType: 'json',
							async: true,
							processData: false,
							beforeSend: function (xhr, settings) {
								// Trigger the Page's saving event
								if (eventHandler.hasEvent('saving')) {
									event = eventHandler.getEvent('saving');
									event.dispatch(event, settings);
								}
							},
							complete: function (xhr, status) {
								switch (status) {
									case 'success':
										// Trigger the Page's saved event
										if (eventHandler.hasEvent('saved')) {
											event = eventHandler.getEvent('saved');
											event.dispatch(event, status, xhr);
										}
										
										break;
									case 'error':
										// Trigger the Page's saveFailed event
										if (eventHandler.hasEvent('saveFailed')) {
											event = eventHandler.getEvent('saveFailed');
											event.dispatch(event, status, xhr);
										}
										
										break;
								}
							}
						};
						
						// Do we use the string value of the route, or extend the ajax configuration?
						if (config.hasOwnProperty('route') && typeof config.route !== 'undefined') {
							if (config.route.hasOwnProperty('update') && typeof config.route.update !== 'undefined') {
								if (isWebForm) {
									$.extend(true, ajaxDefaults, { url: config.route.update });
								} else {
									url = App.getRootWebsitePath() + '/' + config.route.update.url;
									
									// Check if an ID was set in the request, otherwise try to pull it from the query string
									id = (request.hasOwnProperty('id') && request.id !== '') ? request.id : App.Helpers.URL.getParam('id');

									// If we found an ID, append it to the URL
									// TODO: I'm not sure if this is the best way of going about this...
									// Ideally, each route.{crud} parameter would be a route with a callback for a corresponding page event
									if (id !== null) {
										url = url + '/' + id; 
									}
									
									$.extend(true, ajaxDefaults, config.route.update, { url: url });
								}
								
								response = $.ajax(ajaxDefaults);
							} else {
								if (App.getConfig('debug') === true) {
									throw new Error('The route parameters for this page have been incorrectly configured');
								} else {
									errors[0] = 'The route parameters for this page have been incorrectly configured';
									errorHandler.setErrors('error', errors);
								}
							}
						} else {
							// This is a redundant check, just to be safe
							// A page will not render unless a route configuration has been provided
							if (App.getConfig('debug') === true) {
								throw new Error('The route parameters for this page have not been configured');
							} else {
								errors[0] = 'Please contact your systems administrator: the route parameters for this page have not been configured';
								errorHandler.setErrors('error', errors);
							}
						}
					} else {
						// Trigger the Page's validateFailed event
						if (eventHandler.hasEvent('validateFailed')) {
							event = eventHandler.getEvent('validateFailed');
							event.dispatch(event);
						}
					}
					
					return this;
				},
				enumerable: false,
				configurable: false,
				writable: true
			},
			validate: {
				value: function (event) {
					var eventHandler = this.getEventHandler(),
						validator = this.getBlock(App.getPrimaryBlockName()).getValidator();

					// TODO: Implement validateSuccess callback
					if (validator.validate()) {
						if (true) {
							/* if validateSuccess callback has been defined in config, load it */
						}
					} else {
						// Trigger the Page's validateFailed event
						if (eventHandler.hasEvent('validateFailed')) {
							event = eventHandler.getEvent('validateFailed');
							event.dispatch(event);
						}
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
				_links: {
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
				autoBind:  {
					value: true,
					enumerable: true,
					configurable: false,
					writable: true
				},
				dataBound:  {
					value: false,
					enumerable: true,
					configurable: false,
					writable: true
				},
				init: {
					value: function (page, config) {
						var that = this,
							director;
						
						page = page || '';
						config = config || '';
						
						if (page !== '') {
							that._page = page;
						} else if (config === '') {
							// We can't parse a block that doesn't exist
							if (App.getConfig('debug') === true) {
								App.log('Cannot initialize the block with ID: ' + config.id + '. A config object was not provided!');
							}
							
							return false;
						} else {
							// TODO: Throw error
							if (App.getConfig('debug') === true) {
								throw new Error('Cannot initialize the block with ID: ' + config.id + '. A page object was not provided!');
							}
						}
						
						that._id = config.id;
						that._config = config;
						
						that.autoRender = config.autoRender || that.autoRender;
						that.autoBind = (config.autoBind === false) ? false : that.autoBind;
						
						if (App.getConfig('debug') === true) {
							App.log('Initializing block [' + config.id + ']');
							App.log('Block.init() config: ');
							App.log(config);
							App.log('autoBind: ' + that.autoBind + ' | autoRender: ' + that.autoRender);
						}
						
						// Store a reference to the block's layout configuration
						that._layout = config.layout;
						
						// Initialize hash for storing block instances
						that._blocks = Object.create(App.Utilities.ChainableHash(), {});
						that._links = config.links || that._links;
						
						that._director = director = Object.create(App.Page.Layout.BlockDirector(that, that._page), {});
						that._binder = director.getBinder();
						that._builder = director.getBuilder();
						
						// Auto-render
						if (that.autoRender === true) {
							that.render();
						}
						
						return this;
					},
					enumerable: true,
					configurable: false,
					writable: true
				},
				dataBind: {
					value: function (viewModel) {
						var binder = this._binder,
							id = this._id,
							config = this._config,
							validationConfig = (config.hasOwnProperty('validation')) ? config.validation : false;
							
						// Bind the view-model
						if (viewModel && viewModel instanceof kendo.data.ObservableObject) {
							this._binder.bind('#' + id, viewModel);
						} else {
							this._binder.bind('#' + id);
						}
						
						if (App.getConfig('debug') === true) {
							App.log('Binding block [' + id + ']');
							if (validationConfig) {
								App.log('Block validation config: ');
								App.log(validationConfig);
							}
						}
						
						// Set view-model
						this._viewModel = this._binder.getViewModel();
						
						// Set validator
						this._validator = this._binder.getValidator();
					},
					enumerable: true,
					configurable: false,
					writable: true
				},
				getPage: {
					value: function () {
						return this._page;
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
						
						return this;
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
				getLinks: {
					value: function () {
						return this._links;
					},
					enumerable: true,
					configurable: false,
					writable: true
				},
				getConfig: {
					value: function () {
						return this._config;
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
						var validator = this._validator || null;
						
						if (validator == null) {
							if (this._binder.getValidator() !== null) {
								this._validator = this._binder.getValidator();
							}
						}
						
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
				_errorHandler: {
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
				_links: {
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
					value: false,
					enumerable: true,
					configurable: false,
					writable: true
				},
				autoBind:  {
					value: true,
					enumerable: true,
					configurable: false,
					writable: true
				},
				dataBound:  {
					value: false,
					enumerable: true,
					configurable: false,
					writable: true
				},
				init: {
					value: function (page, config) {
						var that = this,
							director,
							eventHandlerAdapter,
							eventHandler,
							events,
							event;
							
						page = page || '';
						config = config || '';
						
						if (config) {
							that.autoRender = config.autoRender || that.autoRender;
							that.autoBind = (config.autoBind === false) ? false : that.autoBind;
						}
						
						if (page !== '') {
							this._page = page;
						} else if (config === '') {
							// We can't parse a module that doesn't exist
							if (App.getConfig('debug') === true) {
								App.log('Cannot initialize the module with ID: ' + config.id + '. A config object was not provided!');
							}
							
							return false;
						} else {
							// TODO: Throw error
							if (App.getConfig('debug') === true) {
								throw new Error('Cannot initialize the module with ID: ' + config.id + '. A page object was not provided!');
							}
						}
						
						that._id = config.id;
						that._config = config;
						that._links = config.links;
						
						// The autoRender parameter specifies whether or not the parent BlockDirector should render the module as part of the page rendering process
						that.autoRender = config.autoRender || that.autoRender;
						that.autoBind = (config.autoBind === false) ? false : that.autoBind;
						
						if (App.getConfig('debug') === true) {
							App.log('Initializing module [' + config.id + ']');
							App.log('Module.init() config: ');
							App.log(config);
							App.log('autoBind: ' + that.autoBind);
							App.log('autoRender: ' + that.autoRender);
						}
						
						// Store a reference to the module's layout configuration
						that._layout = config.layout;
						
						that._director = director = Object.create(App.Page.Layout.BlockDirector(that, that._page), {});
						that._binder = director.getBinder();
						that._builder = director.getBuilder();
						
						// Register error handler
						that._errorHandler = that._page.getErrorHandler();

						// Register page event handler
						// TODO: Event handler should be configurable
						events = $.extend({}, App.getConfig('moduleEvents'));
						eventHandlerAdapter = App.EventHandlers.Adapters.Signals(events);
						eventHandler = that._eventHandler = Object.create(App.EventHandler(eventHandlerAdapter), {});

						// Register event callbacks
						if (config.hasOwnProperty('events')) {
							$.each(config.events, function (eventName, callback) {			
								if (typeof callback === 'function') {
									event = eventHandler.getEvent(eventName);
									
									if (event) {
										// Don't forget to set the scope!
										eventHandler.addEventListener(eventName, callback, that);
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
						
						return this;
					},
					enumerable: true,
					configurable: false,
					writable: true
				},
				dataBind: {
					value: function (viewModel) {
						var binder = this._binder,
							id = this._id,
							config = this._config,
							validationConfig = (config.hasOwnProperty('validation')) ? config.validation : false,
							eventHandler = this._eventHandler,
							event;
						
						// Bind the view-model
						if (viewModel && viewModel instanceof kendo.data.ObservableObject) {
							this._binder.bind('#' + id, viewModel);
						} else {
							this._binder.bind('#' + id);
						}		
												
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
						var layout = this._layout,
							director = this._director;
						
						director.build(layout);
						
						// Store content
						this._html = director.getDocument();
						
						// Set rendered flag
						this._rendered = true;
						
						return this;
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
				getLinks: {
					value: function () {
						return this._links;
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
				_modules: undefined,
				_blocks: undefined,
				
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
				// (string) type
				// (string) block | module name
				getConfig: function (node) {
					var type = (node.hasOwnProperty('module')) ? 'module' : (node.hasOwnProperty('block')) ? 'block' : null,
						name = null,
						registry = null,
						config = null;
					
					if (type === 'module') this._modules = this._modules || App.getConfig('modules');
					if (type === 'block') this._blocks = this._blocks || App.getConfig('blocks');
					
					registry = (type === 'module') ? this._modules : (type === 'block') ? this._blocks : null;
					if (type !== null) name = node[type];
					
					// Get the configuration 
					if (registry && name && registry.has(name)) {
						config = $.extend({}, registry.get(name));
					} else if (node.hasOwnProperty('config')) {
						config = $.extend({}, node.config);
					} else {
						config = false;
						
						if (App.getConfig('debug') === true) {
							App.log('No configuration was found for the supplied ' + type + '. Make sure the file has been added correctly in the bootstrap.');
						}
					}
					
					return config;
				},
				generateUID: function (type, collection, node, config) {
					var type = type || 'block',
						idRegex,
						matches,
						matchIndex,
						matchIndexes = [],
						suffix = (node.hasOwnProperty('suffix')) ? node.suffix : null,
						name,
						layout,
						templates;
						
					if (type !== 'block' && type !== 'module') throw new Error('UID generation failed - a valid block type was not specified');
					
					suffix = suffix || null;
					name = (suffix !== null) ? [type, node[type], suffix].join('_') : type + '_' + node[type];
					idRegex = new RegExp('^' + name + '_(\\d+)$');
					
					// TODO: We need a way to determine the type of collection provided
					$.each(collection.keys(), function (idx, id) {
						matches = id.match(idRegex);
						
						if (matches !== null) {
							matchIndexes.push(parseInt(matches.pop()));
						}
					});
					
					if (matchIndexes.length > 0) {
						matchIndexes = matchIndexes.sort(function (a,b) { return a-b; } );
						
						// Update the block config object
						config.id = name + '_' + (matchIndexes.pop() + 1).toString();
					} else {
						// Update the block config object
						config.id = name + '_1';
					}
					
					if (App.getConfig('debug') === true) {
						App.log('Assigning ' + type + ' ID: ' + config.id);
					}
				},
				setLayout: function (node, config) {
					var templates = (config.layout.hasOwnProperty('templates')) ? config.layout.templates : false,
						layout;
					
					// We're iterating over the page layout nodes, so we need to repackage them
					if (templates) {
						// Use a custom template, if one has been specified in the block configuration
						if (config.hasOwnProperty('template') && templates.hasOwnProperty(config.template)) {
							layout = templates[config.template];
						} else if (templates.hasOwnProperty('default')) {
							layout = templates.default;
						} else {
							layout = templates;
						}
					} else {
						layout = config.layout;
					}
					
					// Set the ID
					layout.id = config.id;
					
					if (typeof layout !== 'undefined') {
						$.extend(config, { layout: layout });
					}
					
					// TODO: Pull this out
					if (node.hasOwnProperty('links')) {
						$.extend(config, { links: current.links });
					}
					
					if (node.hasOwnProperty('config') && node.config.hasOwnProperty('items')) {
						$.extend(config, { items: node.config.items });
					}
					
					if (node.hasOwnProperty('config') && node.config.hasOwnProperty('params')) {
						$.extend(config, { params: node.config.params });
					}
					// END TODO
				},
				build: function (obj, level, type) {
					var that = this,
						type = type || null,
						builder = this.getBuilder(),
						iterator = Object.create(App.Utilities.RecursiveIterator(obj), {}),
						key,
						current,
						page = this._page,
						module = false, 
						modules,
						moduleConfig,
						modulesConfig,
						moduleLayout,
						block = false,
						blocks,
						blockConfig,
						blocksConfig,
						blockLayout,
						attributes,
						pair,
						parent,
						children,
						isFirst = true,
						isDOMElement = false,
						isBlock = false,
						isModule = false,
						maxNesting = false,
						widget;
						
					do {
						// Get the current node and build it
						current = iterator.current();
						isDOMElement = (current.hasOwnProperty('tag') && current.tag !== '') ? current.tag : false;
						isBlock = (current.hasOwnProperty('block') && current.block !== '') ? current.block : false;
						isModule = (current.hasOwnProperty('module') && current.module !== '') ? current.module : false;
						
						// Is the current node a module?
						if (current.hasOwnProperty('module') && current.module !== '') {
							moduleConfig = that.getConfig(current);
							
							App.log('----------------------------');
							App.log('Creating new ' + current.module + ' module');
							
							if (that._modules.has(current.module) && moduleConfig) {
								registeredModules = page.getModules();
								
								that.generateUID('module', registeredModules, current, moduleConfig);
							}
							
							if (moduleConfig && moduleConfig.hasOwnProperty('layout')) {								
								that.setLayout(current, moduleConfig);
								
								// Create a new module from the module configuration, if it exists
								module = (moduleConfig) ? App.Page.Layout.Module(page, moduleConfig) : false;
							}
						}
						// Is the current node a block?
						else if (current.hasOwnProperty('block') && current.block !== '') {
							blockConfig = that.getConfig(current);
							
							App.log('----------------------------');
							App.log('Creating new ' + current.block + ' block');
							
							if (that._blocks.has(current.block) && blockConfig) {
								registeredBlocks = page.getBlocks();
								that.generateUID('block', registeredBlocks, current, blockConfig);
							}
							
							if (blockConfig && blockConfig.hasOwnProperty('layout')) {
								that.setLayout(current, blockConfig);
								
								// Create a new module from the module configuration, if it exists
								block = (blockConfig) ? App.Page.Layout.Block(page, blockConfig) : false;
							}
							
							/*if (App.getConfig('debug') === true) {
								App.log('-- block config --');
								App.log(blockConfig);
							}
							
							if (App.getConfig('debug') === true) {
								App.log('-- block layout --');
								App.log(blockLayout);
							}*/
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
						
						// Process blocks/modules
						if (block || module) {
							maxNesting = true;
							
							var setLayout = function (type, block, config) {
								// Only blocks have layouts
								if (type === 'block') {
									if (config.hasOwnProperty('setLayout') && typeof config.setLayout === 'function') {
										// Extend the block with the custom setLayout method defined in the config object
										$.extend(true, block, {
											setLayout: config.setLayout
										});
										
										if (config.hasOwnProperty('items')) {
											block.setLayout(config.items);
										}
									}
								}
							};
							
							var setAttributes = function (block, attributes) {
								// TODO: This needs a better check
								if (typeof attributes === 'undefined' || typeof attributes !== 'object') {
									throw new Error('Invalid attribute object provided');
								}
								
								$.each(block.getLayout(), function(key, value) {
									if (that._attributes.indexOf(key) !== -1) {
										attributes[key] = value;
									}
								});
							};
							
							if (module) {
								attributes = {};
								setAttributes(module, attributes);
								
								module.getBuilder().setRoot(module.getLayout().tag, attributes);
								
								if (isFirst === true) {
									if (module.autoRender === true) {
										builder.append(module.render().html());
									} else {
										builder.append(module.getLayout().tag, {
											id: module._id,
											data: {
												module: current.module,
											}
										});
									}
									
									isFirst = false;
								} else {
									if (module.autoRender === true) {
										builder.add(module.render().html());
									} else {
										builder.add(module.getLayout().tag, {
											id: module._id,
											data: {
												module: current.module
											}
										});
									}
								}
								
								// Store the module instance
								page.setModule(module._id, module);
							}
							
							if (block) {
								setLayout('block', block, blockConfig);
								
								attributes = {};
								setAttributes(block, attributes);
								
								block.getBuilder().setRoot(block.getLayout().tag, attributes);
								
								if (isFirst === true) {
									builder.append(block.render().html());
									
									isFirst = false;
								} else {
									builder.add(block.render().html());
								}
								
								// Store the block instance
								page.setBlock(block._id, block);
							}
						} else if (isDOMElement) {							
							if (App.getConfig('debug') === true) {
								//App.log('-- current element --');
								//App.log(current);
							}
							
							maxNesting = (this.isVoid(current.tag)) ? true : false;
							
							// MOVE: To Metadata Validation WI
							// TODO: Refactor this into a kPaged plugin - which also involves adding plugin functionality!
							var validationAttributes = {},
								entities = page._entities,
								primary = (typeof entities !== 'undefined' && entities.hasOwnProperty('primary')) ? entities.primary : null;
								//that._entities.set(entityConfig.entityName, entityMetadata);
								
							// TODO: Bindings should be parsed by a reusable function
							// TODO: Override page attributes using entity metadata
							if (typeof App.Config.Metadata.map === 'function') {
								//current.tag = 'newtag';
								//current.type = 'newtype';
							}
							
							//this.setEntityValidations(bindings);
							
							//this.setShorthandValidations(shorthandValidations, current);
							
							//this.setValidations();
							
							if (isFirst === true) {
								builder.append(current.tag, attributes);
								
								isFirst = false;
							} else {
								builder.add(current.tag, attributes);
							}
							
							// MOVE: To Metadata Validation WI
							// TODO: Refactor this into a kPaged plugin - which also involves adding plugin functionality!
							var validation;
							
							if (current.hasOwnProperty('validation')) {
								builder.setAttributes(builder.getCurrent(), validationAttributes);
								validationAttributes = {};
								
								validation = builder.addAfter(builder.getCurrent(), 'span', {
									class: 'k-invalid-msg',
									data: {
										for: builder.getCurrent().id
									}
								});
							}
							
							if (attributes.hasOwnProperty('data') && attributes.data.hasOwnProperty('role')) {
								if (attributes.data.role === 'semantictabstrip' && current.hasOwnProperty('tabs')) {
									if (App.getConfig('debug') === true) {
										App.log('Building tabs [' + current.id + ']');
										App.log(current.tabs);
									}
									
									App.Widgets.Helpers.SemanticTabStrip.build(builder, current.tabs);
								}
								
								if (attributes.data.role === 'panelbar' || attributes.data.role === 'eventpanelbar') {
									if (current.data.hasOwnProperty('items')) {
										App.Widgets.Helpers.PanelBar.build(builder, current.data.items);
									}
								}
							}
							
							that.applyShortcuts(builder, current);
							
							// Clear attributes or stuff will bomb!
							attributes = {};
							
							// END TODO
						}
						
						// Are there child nodes? If so, recurse...
						if (iterator.hasChildren()) {
							children = iterator.getChildren();							
							
							if (maxNesting === false) {				
								// Recurse
								level = (isDOMElement) ? level + 1 : level;
								that.build(children, level);
							}
						}
						
						// Reset variables for reuse
						block = false;
						module = false;
						
						// Move to the next node
						iterator.next();
					} while (iterator.hasNext());
					
					if (isDOMElement || isBlock || isModule) {
						console.log('has next? ' + iterator.hasNext().toString());
						
						if (iterator.hasNext() === false) {
							builder.parent();
						}
					}
				},
				setValidations: function (bindings) {
					if (current.hasOwnProperty('validation')) {
						if (!current.validation.hasOwnProperty('messages') && !current.validation.hasOwnProperty('rules')) {
							setShorthandValidations(current.validation);
						}
						
						if (attributes.hasOwnProperty('data') && typeof attributes.data !== 'undefined') {
							if (attributes.data.hasOwnProperty('bind') && typeof attributes.data.bind !== 'undefined') {
								if (typeof entities !== 'undefined') {
									setEntityValidations(attributes.data);
								}
							}
						}
						
						if (current.validation.hasOwnProperty('messages') || current.validation.hasOwnProperty('rules')) {
							if (current.validation.hasOwnProperty('messages') && typeof current.validation.messages !== 'undefined') {
								$.each(current.validation.messages, function (rule, message) {
									validationAttributes['data-' + rule + '-msg'] = message;
								});
							}
							
							if (current.validation.hasOwnProperty('rules') && typeof current.validation.rules !== 'undefined') {
								var constraintType = 'undefined';
								
								$.each(current.validation.rules, function (rule, constraint) {
									constraintType = typeof constraint;
									
									// TODO: Implement functionality to define custom rules
									if (constraintType === 'string' || constraintType === 'number' || constraintType === 'boolean') {
										validationAttributes[rule] = constraint;
									}
								});
							}
						}
						
						if (typeof attributes === 'undefined') {
							attributes = {};
						}
						
						$.extend(true, attributes, validationAttributes);
					}
				},
				// Questions?
				// 1. Has a value binding been set? Automatic entity binding should *not* work unless a value has been defined
				// 2. Has a widget role been defined?
				setEntityValidations: function (bindings) {
					var info,
						entityMetadata,
						fieldMetadata,
						metadataConfig = App.Config.Metadata,
						arrayRegex = /(?:^.*?)(\[\d+\])/;
						
					info = {
						entity: null, // Get from binding
						fieldName: null, // Get from binding
						bindPath: null, // Get from binding
						role: null
					};
					var bindPath,
						chunkIndex,
						currentChunk;
					
					for (var prop in bindings) {
						switch (prop) {
							case 'role':
								info.role = bindings.role;
								break;
								
							case 'bind':
								// Empty data attributes will crash Kendo
								if (App.Helpers.isEmpty(bindings.bind) === false) {
									// TODO: Could be using strategy pattern to process data attributes
									if (typeof bindings.bind === 'string') {
										if (typeof bindings.bind === 'string' && bindings.bind !== '' && bindings.bind !== null) {
											chunkIndex = null; // Reset the match index
											// TODO: Throw an error if null
											bindPath = bindings.bind.split('.'); // Split by namespace
											
											if (App.getConfig('debug') === true) {
												App.log('bind path');
												App.log(bindPath);
											}

											// TODO: Make this recursive so we can support multiple levels of nesting
											if (bindPath.length > 1) {
												currentChunk = bindPath.shift();
												matches = arrayRegex.exec(bindings.bind);
												currentChunk = matches.shift();

												// We only care about the first match
												chunkIndex = matches[0].replace('[', '').replace(']', ''); // Strip brackets
												chunkIndex = parseInt(chunkIndex);

												// Get the name of the current chunk of the binding path
												currentChunk = currentChunk.replace('[' + chunkIndex.toString() + ']', '')

												if (currentChunk !== '' && chunkIndex !== null) {
													//that._viewModel.set(currentChunk, new kendo.data.ObservableArray([]));
													//oa = that._viewModel.get(currentChunk);
													//oa.push(new kendo.data.ObservableObject());
												}
											} else {
												currentChunk = bindPath.shift();
												
												// Primary entity
												entityMetadata = entities.get(primary);
												
												if (typeof entityMetadata !== 'undefined' && entityMetadata.has(currentChunk)) {
													// Attach validations and override
													fieldMetadata = entityMetadata.get(currentChunk);
													
													// Set validation
													if (current.hasOwnProperty('validation')) {
														current.validation = metadataConfig.mapValidations(fieldMetadata, current.validation);
													}
												}
											}
										}				
									} else {
										$.each(bindings.bind, function (type, binding) {
											switch (type) {
												case 'value':
													// Set nested bindings
													if (typeof binding === 'string' && binding !== '' && binding !== null) {
														chunkIndex = null; // Reset the match index
														// TODO: Throw an error if null
														bindPath = binding.split('.'); // Split by namespace
														//App.log('bind path');
														//App.log(bindPath);

														// TODO: Make this recursive so we can support multiple levels of nesting
														if (bindPath.length > 1) {
															currentChunk = bindPath.shift();
															matches = arrayRegex.exec(binding);
															currentChunk = matches.shift();

															// We only care about the first match
															chunkIndex = matches[0].replace('[', '').replace(']', ''); // Strip brackets
															chunkIndex = parseInt(chunkIndex);

															// Get the name of the current chunk of the binding path
															currentChunk = currentChunk.replace('[' + chunkIndex.toString() + ']', '')

															if (currentChunk !== '' && chunkIndex !== null) {
																//that._viewModel.set(currentChunk, new kendo.data.ObservableArray([]));
																//oa = that._viewModel.get(currentChunk);
																//oa.push(new kendo.data.ObservableObject());
															}
														} else {
															currentChunk = bindPath.shift();
															
															// Primary entity
															entityMetadata = entities.get(primary);
															
															if (typeof entityMetadata !== 'undefined' && entityMetadata.has(currentChunk)) {
																// Attach validations and override
																fieldMetadata = entityMetadata.get(currentChunk);
																
																// Set validation
																if (current.hasOwnProperty('validation')) {
																	current.validation = metadataConfig.mapValidations(fieldMetadata, current.validation);
																}
															}
														}
													}
													break;
													
												default:
													break;
											}
										});
									}
								}
								break;
								
							default:
								break;
						}
					}
					
					return info;
				},
				setShorthandValidations: function (shorthandValidations, current) {
					// Reformat shorthand validations
					var validations = {};
					
					if (shorthandValidations.hasOwnProperty('message') && shorthandValidations.message !== '') {
						validationAttributes['validationMessage'] = shorthandValidations.message;
						
						delete shorthandValidations.message;
					}
					
					validations.rules = {};
					
					$.each(shorthandValidations, function (key, value) {
						if (attributes.length > 0) {
							if (attributes.indexOf(key) !== -1) {
								validations.rules[key] = value;
							}
						} else {
							validations.rules[key] = value;
						}
					});
					
					current.validation = validations;
				},
				applyShortcuts: function (builder, current) {
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
				_rootNode: null,
				_currentNode: null,
                _currentFrag: null,

				
				init: function () {
					var doc, rootNode;
					
					this._document = doc = document.createDocumentFragment();
					this._rootNode = rootNode = this.appendNode(doc, 'div');
					
					var rootAttr = document.createAttribute('data-root');
					rootAttr.nodeValue = 'true';
					
					rootNode.setAttributeNode(rootAttr);
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
					var node = (typeof element === 'string') ? document.createElement(element) : element,
						childNodes;

					if (node instanceof DocumentFragment) {
						childNodes = node.childNodes;
						node = ref.appendChild(childNodes[0]);
                    } else {
                        node = ref.appendChild(node);
                    }
					
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
					var node = (typeof element === 'string') ? document.createElement(element) : element,
						childNodes;
					
                    if (node instanceof DocumentFragment) {
						childNodes = node.childNodes;
						node = ref.parentNode.insertBefore(childNodes[0], ref);
                    } else {
                        node = ref.parentNode.insertBefore(node, ref);
                    }
					
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
					var node = (typeof element === 'string') ? document.createElement(element) : element,
						childNodes;

					if (node instanceof DocumentFragment) {
						childNodes = node.childNodes;
						node = ref.parentNode.insertBefore(childNodes[0], ref.nextSibling);
                    } else {
                        node = ref.parentNode.insertBefore(node, ref.nextSibling);
                    }
					
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
					var node = (typeof element === 'string') ? document.createElement(element) : element,
						ref = ref || this._currentNode,
						childNodes,
						debugModules = false,
						debugBlocks = false;
					
					if (node instanceof DocumentFragment) {
						if (debugModules || debugBlocks) {
							if (node instanceof DocumentFragment) {
								App.log('frag childnodes: ');
								App.log(node.childNodes);
							}
						}
						
						childNodes = node.childNodes;
						node = ref.appendChild(childNodes[0]);
                    } else {
                        node = ref.appendChild(node);
                    }
					
					this._currentNode = node;
					this.setAttributes(node, attributes);
					
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
					var node = (typeof element === 'string') ? document.createElement(element) : element,
						ref = ref || this._currentNode,
						childNodes,
						debugModules = false,
						debugBlocks = false;
					
					if (node instanceof DocumentFragment) {
						if (debugModules || debugBlocks) {
							if (node instanceof DocumentFragment) {
								App.log('frag childnodes: ');
								App.log(node.childNodes[0]);
							}
						}
						
						childNodes = node.childNodes;
						
						node = ref.parentNode.insertBefore(childNodes[0], ref.nextSibling);
                    } else {
                        node = ref.parentNode.insertBefore(node, ref.nextSibling);
                    }
					
					this._currentNode = node;
					this.setAttributes(node, attributes);
					
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
					var node = (typeof element === 'string') ? document.createElement(element) : element,
						ref = ref || this._currentNode,
						childNodes,
						debugModules = false,
						debugBlocks = false;
					
                    if (node instanceof DocumentFragment) {
						if (debugModules || debugBlocks) {
							if (node instanceof DocumentFragment) {
								App.log('frag childnodes: ');
								App.log(node.childNodes);
							}
						}
						
						childNodes = node.childNodes;
						node = ref.parentNode.insertBefore(childNodes[0], ref);
                    } else {
                        node = ref.parentNode.insertBefore(node, ref);
                    }
					
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
				setRoot: {
					value: function (tag, attributes) {						
						var doc, rootNode;
						
						this._document = doc = document.createDocumentFragment();
						this._rootNode = rootNode = this.appendNode(doc, tag);
						this._currentNode = rootNode;
						
						this.setAttributes(rootNode, attributes);
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
							widget = false,
							role = false;
							
						attributes = attributes || '';
						
						if (attributes) {
							// We're dealing with a Kendo UI widget, so invoke method 
							// to ensure that we don't miss any widget specific parameters
							// ie: The combobox widget and dropdownlist widgets require
							// the data-text-field and data-value-field attributes
							if (attributes.hasOwnProperty('data') && typeof attributes.data !== 'undefined') {
								if (attributes.data.hasOwnProperty('role') && typeof attributes.data.role !== 'undefined') {
									role = attributes.data.role;
									widget = that._widgets[role];
									
									if (widget.hasOwnProperty('kendoRole') && typeof widget.kendoRole !== 'undefined') {
										role = widget.kendoRole;
									}
									
									// Merge the data attributes
									if (widget.hasOwnProperty('attributes') && widget.attributes.hasOwnProperty('data')) {
										$.extend(true, attributes.data, widget.attributes.data);
									}
								}
							}
							
							// If this behavior needs to be changed, create an inheriting object
							$.each(attributes, function (key, value) {
								switch (key) {
									// Parse Kendo UI specific attributes so we can bind our elements
									case 'data':
										for (var prop in value) {
											switch (prop) {
												case 'role':
													node.setAttribute('data-role', role);
													break;
													
												case 'bind':
													if (App.getConfig('profile') !== false) {
														//console.profile('Profiling binding for node: { id: ' + node.id + ', name: ' + node.name + '} | binding: ' + JSON.stringify(value.template));
														that.getBinder().bindNode(node, value.bind);
														//console.profileEnd();
													} else {
														// Bind the DOM element to the View-Model
														that.getBinder().bindNode(node, value.bind);
													}
													
													break;
													
												case 'items':
													// Do something?
													break;
													
												case 'template':
													// TODO: WTF template is hardcoded - sucky!
													// Don't use Kendo's declarative binding syntax for templates! Use App.Loader, or template binding will fail miserably
													if (App.getConfig('profile') !== false) {
														//console.profile('Profiling template loading for node: { id: ' + node.id + ', name: ' + node.name + '} | binding: ' + JSON.stringify(value.template));
														App.load('template', App.getConfig('templateUrl') + value.template.source, { id: node.id, template: value.template.id });
														//console.profileEnd();
													} else {
														App.load('template', App.getConfig('templateUrl') + value.template.source, { id: node.id, template: value.template.id });
													}
													
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
							
							// Clear widget
							widget = false;
							role = false;
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
		// Added autoBind parameter so we can bind later when building nested blocks
		KendoDOMBinder: function (director, viewModel) {
			// TODO: this should inherit from the App.Page.Layout.DOMBinder
			var binder = Object.create({
				_director: {},
				_viewModel: {},
				_validator: {},
				_widgets: {},
				_root: {},
				autoBind: true,
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
						director = that.getDirector(),
						block = director.getBlock(),
						links = block.getLinks(),
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
						callbackName,
						callback,
						fn,
						oa, // ObservableArray reference
						oo, // ObservableObject reference
						bindPath,
						currentChunk,
						chunkIndex,
						arrayRegex = /(?:^.*?)(\[\d+\])/,
						matches;
					
					// Empty data attributes will crash Kendo
					if (App.Helpers.isEmpty(bindings) === false) {
						// TODO: Could be using strategy pattern to process data attributes
						if (typeof bindings === 'string') {
							// Data-bind the value
							// Make sure the property doesn't exist before adding it
							if (that._viewModel.hasOwnProperty(bindings) === false) {
								// Add the property
								val.push('value: ' + bindings);

								// Set nested bindings
								if (typeof bindings === 'string' && bindings !== '' && bindings !== null) {
									chunkIndex = null; // Reset the match index
									// TODO: Throw an error if null
									bindPath = bindings.split('.'); // Split by namespace

									// TODO: Make this recursive so we can support multiple levels of nesting
									if (bindPath.length > 1) {
										currentChunk = bindPath.shift();
										matches = arrayRegex.exec(bindings);
										currentChunk = matches.shift();

										// We only care about the first match
										chunkIndex = matches[0].replace('[', '').replace(']', ''); // Strip brackets
										chunkIndex = parseInt(chunkIndex);

										// Get the name of the current chunk of the binding path
										currentChunk = currentChunk.replace('[' + chunkIndex.toString() + ']', '')

										if (currentChunk !== '' && chunkIndex !== null) {
											that._viewModel.set(currentChunk, new kendo.data.ObservableArray([]));
											oa = that._viewModel.get(currentChunk);
											oa.push(new kendo.data.ObservableObject());
										}
									} else {
										that._viewModel.set(bindings, '');
									}
								}
							} else {
								val.push('value: ' + bindings);
							}						
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

											// Set nested bindings
											if (typeof binding === 'string' && binding !== '' && binding !== null) {
												chunkIndex = null; // Reset the match index
												// TODO: Throw an error if null
												bindPath = binding.split('.'); // Split by namespace

												// TODO: Make this recursive so we can support multiple levels of nesting
												if (bindPath.length > 1) {
													currentChunk = bindPath.shift();
													matches = arrayRegex.exec(binding);
													currentChunk = matches.shift();

													// We only care about the first match
													chunkIndex = matches[0].replace('[', '').replace(']', ''); // Strip brackets
													chunkIndex = parseInt(chunkIndex);

													// Get the name of the current chunk of the binding path
													currentChunk = currentChunk.replace('[' + chunkIndex.toString() + ']', '')

													if (currentChunk !== '' && chunkIndex !== null) {
														that._viewModel.set(currentChunk, new kendo.data.ObservableArray([]));
														oa = that._viewModel.get(currentChunk);
														oa.push(new kendo.data.ObservableObject());
													}
												} else {
													that._viewModel.set(binding, '');
												}
												// TODO: accept function
											}
										} else {
											val.push(type + ': ' + binding);
										}
										break;
										
									case 'checked':
										// Make sure the property doesn't exist before adding it
										if (that._viewModel.hasOwnProperty(binding) === false) {
											// Add the property
											val.push(type + ': ' + binding);

											// Set nested bindings
											if (typeof binding === 'string' && binding !== '' && binding !== null) {
												chunkIndex = null; // Reset the match index
												// TODO: Throw an error if null
												bindPath = binding.split('.'); // Split by namespace

												// TODO: Make this recursive so we can support multiple levels of nesting
												if (bindPath.length > 1) {
													currentChunk = bindPath.shift();
													matches = arrayRegex.exec(binding);
													currentChunk = matches.shift();

													// We only care about the first match
													chunkIndex = matches[0].replace('[', '').replace(']', ''); // Strip brackets
													chunkIndex = parseInt(chunkIndex);

													// Get the name of the current chunk of the binding path
													currentChunk = currentChunk.replace('[' + chunkIndex.toString() + ']', '')

													if (currentChunk !== '' && chunkIndex !== null) {
														that._viewModel.set(currentChunk, new kendo.data.ObservableArray([]));
														oa = that._viewModel.get(currentChunk);
														oa.push(new kendo.data.ObservableObject());
													}
												} else {
													that._viewModel.set(binding, '');
												}
												// TODO: accept function
											}
										} else {
											val.push(type + ': ' + binding);
										}
										break;

									case 'events':
										// TODO: Make sure events are supported!
										$.each(binding, function (event, fn) {											
											if (fn !== 'undefined' && typeof fn === 'function') {
												callbackName = App.Helpers.String.camelize(node.getAttribute('name')) + 'On' + event[0].toUpperCase() + event.slice(1);
												
												// Add the property
												events.push(event + ': ' + callbackName);
												
												// Wrap the function in a generic handler so we can pass in custom args
												callback = fn;
												fn = function () {													
													var args = Array.prototype.slice.call(arguments, 0);
													args.push(block);
													args.push(links);
													
													callback.apply(that._viewModel, args);
												};
												
												that._viewModel.set(callbackName, fn);
											}
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
														
														callbackName = App.Helpers.String.camelize('pageSubscribe_' + node.getAttribute('name'));
														App.getCurrent().subscribe(callbackName, obj);
													};
													break;
													
												case 'module':
													fn = function () {
														var obj = $('#' + node.getAttribute('id')).data('kendoObservingListView');
														
														callbackName = App.Helpers.String.camelize('moduleSubscribe_' + observable.name + '_' + node.getAttribute('name'));
														if (typeof App.getCurrent().getModule(observable.name) !== 'undefined') {
															App.getCurrent().getModule(observable.name).subscribe(callbackName, obj);
														}
													};
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
				bind: function (selector, viewModel) {
					var block = this.getDirector().getBlock(),
						page = this.getDirector().getPage(),
						bindInjected = false;
					
					selector = selector || 'body';
					
					if (viewModel instanceof kendo.data.ObservableObject && block.autoBind === false) {
						bindInjected = true;
					} else {
						viewModel = this._viewModel;
					}
					
					if (App.getConfig('debug') === true) {
						App.log('Attempting to bind selector "' + selector + '" to ' + ((bindInjected) ? 'supplied ' : '') + 'view-model:');
					}
					
					if (block.autoBind && block.dataBound === false) {
						viewModel.set('_block', block);
						viewModel.set('_page', page);
					}
					
					if (block.autoBind || (bindInjected && block.dataBound === false)) {
						if (block.autoBind) {
							kendo.bind($(selector), viewModel);
						} else {
							$.each(this._viewModel, function (key, prop) {
								if (typeof prop !== 'undefined') {
									if (['_events'].indexOf(key) === -1) {
										viewModel.set(key, prop); // Don't overwrite 'protected' properties
									} else {
										viewModel.set(key, $.extend(viewModel[key], prop));
									}
								}
							});
							
							this._viewModel = viewModel;
							
							// TODO: Fix this
							if (viewModel.get('_block')) {
								kendo.unbind($('#' + viewModel.get('_block').getId()));
								kendo.bind($('#' + viewModel.get('_block').getId()), viewModel);
							} else {
								App.log('The supplied view-model does not contain a block reference');
							}
						}
						
						block.dataBound = true;
					} else {
						// TODO: Nested block binding still isn't working right in modules
						kendo.bind($(selector), viewModel);
						block.dataBound = true;
					}
					
					if (App.getConfig('debug') === true) {
						App.log(viewModel);
					}
                    
					//selector = selector || 'body';
					//kendo.bind($(selector), this._viewModel);
					
					return this;
				},
				bindValidation: function (selector, rules) {
					selector = selector || 'body';
					rules = rules || {};
					
					// TODO: Enable/disable SilentValidator
					//this._validator = $(selector).kendoSilentValidator(rules).data('kendoSilentValidator'); // TODO: This property really belongs to the block
					this._validator = $(selector).kendoValidator(rules).data('kendoValidator'); // TODO: This property really belongs to the block
					
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
				App.log(e);
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
		},
		widgetize: function (element, role, settings, viewModel) {
			// TODO: Store widget defaults in initialized App config
			var widgetsConfig = App.Config.Widgets.defaults(),
				widgetConfig = widgetsConfig[role],
				widget,
				bindings,
				node = element.get(0) || undefined,
				viewModel = (viewModel instanceof kendo.data.DataSource) ? viewModel : App.getCurrent().getBlock(App.getPrimaryBlockName()).getViewModel();
				
			settings = settings || {};
			
			if (typeof element === 'undefined') {
				throw new Error('A valid element to widgetize was not provided');
			}
			
			if (widgetConfig.hasOwnProperty('kendoRole') && typeof widgetConfig.kendoRole !== 'undefined') {
				role = widgetConfig.kendoRole;
			}
			
			// Merge the data attributes
			if (widgetConfig.hasOwnProperty('attributes') && widgetConfig.attributes.hasOwnProperty('data')) {
				if (widgetConfig.attributes.data.hasOwnProperty('bind') && typeof widgetConfig.attributes.data.bind !== 'undefined') {
					bindings = widgetConfig.attributes.data.bind || {};
					delete widgetConfig.attributes.data.bind;
				}
				
				$.extend(true, settings, widgetConfig.attributes.data);
			}
			
			// TODO: This should be an internal method/property - we're already using this code-block elsewhere
			$.each(bindings, function (type, binding) {
				switch (type) {
					case 'source':
						if (typeof binding === 'string') {
							// Not sure if I can do this...
							//val.push(type + ': ' + binding);
							//viewModel.set(binding, '');
						} else {
							// TODO: relying on a name attribute is kind of retarded. IDs aren't much better... auto-naming?
							identifier = node.getAttribute('name');
							method = App.Helpers.String.camelize(identifier) + type[0].toUpperCase() + type.slice(1);
					
							ds = App.Data.DataSource.Factory(binding);
							//val.push(type + ': ' + method);
							viewModel.set(method, ds);
							
							// Extend the settings object
							$.extend(true, settings, {
								dataSource: ds
							});
							
							//ds.read();
						}
						break;

					case 'value':
						// Make sure the property doesn't exist before adding it
						if (viewModel.hasOwnProperty(binding) === false) {
							// Add the property
							val.push(type + ': ' + binding);

							// Set nested bindings
							if (typeof binding === 'string' && binding !== '' && binding !== null) {
								chunkIndex = null; // Reset the match index
								// TODO: Throw an error if null
								bindPath = binding.split('.'); // Split by namespace

								// TODO: Make this recursive so we can support multiple levels of nesting
								if (bindPath.length > 1) {
									currentChunk = bindPath.shift();
									matches = arrayRegex.exec(binding);
									currentChunk = matches.shift();

									// We only care about the first match
									chunkIndex = matches[0].replace('[', '').replace(']', ''); // Strip brackets
									chunkIndex = parseInt(chunkIndex);

									// Get the name of the current chunk of the binding path
									currentChunk = currentChunk.replace('[' + chunkIndex.toString() + ']', '')

									if (currentChunk !== '' && chunkIndex !== null) {
										viewModel.set(currentChunk, new kendo.data.ObservableArray([]));
										oa = viewModel.get(currentChunk);
										oa.push(new kendo.data.ObservableObject());
									}
								} else {
									viewModel.set(binding, '');
								}
								// TODO: accept function
							}
						} else {
							//val.push(type + ': ' + binding);
						}
						break;
						
					case 'checked':
						// Make sure the property doesn't exist before adding it
						if (viewModel.hasOwnProperty(binding) === false) {
							// Add the property
							//val.push(type + ': ' + binding);

							// Set nested bindings
							if (typeof binding === 'string' && binding !== '' && binding !== null) {
								chunkIndex = null; // Reset the match index
								// TODO: Throw an error if null
								bindPath = binding.split('.'); // Split by namespace

								// TODO: Make this recursive so we can support multiple levels of nesting
								if (bindPath.length > 1) {
									currentChunk = bindPath.shift();
									matches = arrayRegex.exec(binding);
									currentChunk = matches.shift();

									// We only care about the first match
									chunkIndex = matches[0].replace('[', '').replace(']', ''); // Strip brackets
									chunkIndex = parseInt(chunkIndex);

									// Get the name of the current chunk of the binding path
									currentChunk = currentChunk.replace('[' + chunkIndex.toString() + ']', '')

									if (currentChunk !== '' && chunkIndex !== null) {
										viewModel.set(currentChunk, new kendo.data.ObservableArray([]));
										oa = viewModel.get(currentChunk);
										oa.push(new kendo.data.ObservableObject());
									}
								} else {
									viewModel.set(binding, '');
								}
								// TODO: accept function
							}
						} else {
							//val.push(type + ': ' + binding);
						}
						break;

					case 'events':
						// TODO: Make sure events are supported!
						$.each(binding, function (event, fn) {											
							if (fn !== 'undefined' && typeof fn === 'function') {
								callbackName = App.Helpers.String.camelize(node.getAttribute('name')) + 'On' + event[0].toUpperCase() + event.slice(1);
								
								// Add the property
								events.push(event + ': ' + callbackName);
								
								// Wrap the function in a generic handler so we can pass in custom args
								callback = fn;
								fn = function () {													
									var args = Array.prototype.slice.call(arguments, 0);
									args.push(block);
									args.push(links);
									
									callback.apply(viewModel, args);
								}
								
								viewModel.set(callbackName, fn);
							}
						});

						if (events.length > 0) {
							//val.push('events: { ' + events.join(', ') + ' }');
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
										
										callbackName = App.Helpers.String.camelize('pageSubscribe_' + node.getAttribute('name'));
										App.getCurrent().subscribe(callbackName, obj);
									}
									break;
									
								case 'module':
									fn = function () {
										var obj = $('#' + node.getAttribute('id')).data('kendoObservingListView');
										
										callbackName = App.Helpers.String.camelize('moduleSubscribe_' + observable.name + '_' + node.getAttribute('name'));
										if (typeof App.getCurrent().getModule(observable.name) !== 'undefined') {
											App.getCurrent().getModule(observable.name).subscribe(callbackName, obj);
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
						//val.push(type + ': ' + binding);
						viewModel.set(binding, '');
						break;
				}
			});
			
			element[widgetConfig.type].call(element, settings);
			
			widget = element.data(widgetConfig.type);
			
			return widget;
		}
	};

	App.Behavior = function () {
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
		App.log(e);
	}
});