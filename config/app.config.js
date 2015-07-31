/**********************************************************
 *	Namespace: App.Config
 **********************************************************/
 
App.Config = App.Config || {
	defaults: function () {
		return {
			// The four RESTful route verbs
			verbs: ['get', 'post', 'put', 'delete'],
			// An array of the default events triggered by the application during its lifecycle
			// TODO: Actually implement (at least some of) these events
			events: ['run', 'unloaded', 'lookup-route', 'route-executed', 'route-found', 'event-context-before', 'event-context-after', 'changed', 'location-changed', 'redirected', 'error', 'validation-error'],
			// An array of the default events triggered by the application page
			pageEvents: ['executing', 'initialized', 'beforePopulate', 'loading', 'loaded', 'isLoaded', 'loadFailed', 'changed', 'saving', 'saved', 'saveFailed', 'validateFailed'],
			// An array of the default events triggered by application modules
			moduleEvents: ['initialized', 'dataBound', 'pageLoaded', 'saved'],
			// Layout configuration tags representing collections of elements - there is no DOM equivalent
			// Warning: DO NOT use HTML element or attribute names, or you might get unexpected behavior!
			validCollection: ['layout', 'blocks', 'panels', 'forms', 'fieldsets', 'fieldgroups', 'fields', 'group', 'modules', 'children'],
			validInputElements: ['hidden', 'text', 'url', 'email', 'select', 'radio', 'checkbox', 'textarea', 'datepicker', 'yesno'],
			validVoidElements: ['base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source'],
			validAttributes: ['id', 'name', 'type', 'value', 'class', 'style', 'data', 'for', 'min', 'max', 'pattern', 'step', 'required', 'requiredIf', 'requiredIfEmpty', 'readonly', 'disabled', 'href', 'src', 'target', 'rel', 'block', 'rows', 'cols', 'maxlength', 'role']
		};
	}
};

// TODO: Enforce this structure
App.Config.Metadata = App.Config.Metadata || {
	schema: {
		model: {
			id: 'fieldName',
			type: 'dataType',
			fields: {
				// TODO: Implement required flag
				fieldName: { type: 'string', required: true },
				dataType: { type: 'string', required: true }, 
				dataTypeMessage: { type: 'string', required: true },
				isRequired: { type: 'boolean' },
				requiredMessage: { type: 'string' },
				maximumCharacters: { type: 'number' },
				maximumCharactersMessage: { type: 'string' }
			}
		}
	},
	mapValidations: function (field, validations) {
		validations.rules = validations.rules || {};
		
		// This only works with the kendoSilentValidator widget
		if (field.hasOwnProperty('maximumCharacters') && typeof field.maximumCharacters === 'number') {
			// If set to 0, don't limit the field
			if (parseInt(field.maximumCharacters) > 0) {
				validations.rules.maxlength = field.maximumCharacters;
			}
		}
		
		if (field.hasOwnProperty('isRequired') && typeof field.isRequired === 'boolean') {
			if (field.isRequired === true) {
				// Don't set the required flag if isRequired is false
				validations.rules.required = field.isRequired;
			}
		}
		
		validations.messages = validations.messages || {};
		
		// It's still ok to set default messages even if the corresponding rules haven't been set
		// These messages can be overriden in the Page's object-model
		if (field.hasOwnProperty('maximumCharactersMessage') && field.maximumCharactersMessage !== '') {
			validations.messages.maxlength = field.maximumCharactersMessage;
		}
		
		
		if (field.hasOwnProperty('isRequiredMessage') && field.isRequiredMessage !== '') {
			validations.messages.required = field.isRequiredMessage;
		}
		
		return validations;
	}
};

App.Config.Page = App.Config.Page || {
	base: function () {
		return {
			events: {
				/*loaded: [{
					callback: function (xhr, status) {
						OpenGeneralDialog('Loading...');
					}
				}],*/
				loadFailed: [{
					callback: function (xhr, status) {
						// TODO: Success/error methods should be implemented as callbacks
						var that = this,
							isWebForm = that.isWebForm,
							splitter = $('#horizontal').data('kendoSplitter'),
							page = App.getCurrent(),
							errorHandler = page.getErrorHandler(),
							errors = [],
							message,
							type = 'error';
						
						// Expand the right-hand side panel
						/*splitter.expand('#right-pane');*/
						
						switch (xhr.status) {
							case 404:
								if (isWebForm) {
									message = [error + ': ', config.route.read];
								} else {
									message = [error + ': ', config.route.read.url];
								}
								
								if (App.getConfig('debug') === true) {
									message.unshift(xhr.status);
									App.log(message);
								}
								
								errors[0] = message.join(' ');
								
								break;
							
							// Used for validation errors
							case 400:
								type = 'validation';
								console.log(xhr);
								if (isWebForm) {
									$.each($.parseJSON(xhr.responseJSON.d), function (idx, obj) {
										if (obj.hasOwnProperty('id')) {
											errors[App.Helpers.String.camelize(obj.id)] = obj.message;
										}
									});
								} else {

									$.each($.parseJSON(xhr.responseJSON.Message), function (idx, obj) {
										if (obj.hasOwnProperty('id')) {
											errors[App.Helpers.String.camelize(obj.id)] = obj.message;
										}
									});
								}
								
								break;
							
							// Used for validation errors
							case 412:
								type = 'validation';
								
								if (isWebForm) {
									$.each($.parseJSON(xhr.responseJSON.d), function (idx, obj) {
										if (obj.hasOwnProperty('id')) {
											errors[App.Helpers.String.camelize(obj.id)] = obj.message;
										}
									});
								} else {

									$.each($.parseJSON(xhr.responseJSON.Message), function (idx, obj) {
										if (obj.hasOwnProperty('id')) {
											errors[App.Helpers.String.camelize(obj.id)] = obj.message;
										}
									});
								}
								
								break;
						
							case 500:			
								if (App.getConfig('debug') === true) {
									if (xhr.hasOwnProperty('responseJSON')) {
										message = [xhr.status, xhr.statusText + ': ', xhr.responseJSON.ExceptionType, xhr.responseJSON.ExceptionMessage].join(' ');
									} else {
										message = [xhr.status, xhr.statusText].join(' ');
									}
									
									App.log(message);
								} else {
									message = [xhr.statusText + ': ', 'Please contact your systems administrator!'].join(' ');
								}
								
								errors[0] = message;
								
								break;
						}
						
						// Set errors
						errorHandler.setErrors(type, errors);
					}
				}],
				saving: [{
					callback: function (e, settings) {
						OpenGeneralDialog('Saving...');
					}
				}],
				saved: [{
					callback: function (e, status, xhr) {
						var that = this,
							isWebForm = that.isWebForm,
							splitter = $('#horizontal').data('kendoSplitter'),
							page = App.getCurrent(),
							eventHandler = page.getEventHandler(),
							errorHandler = page.getErrorHandler();
							
						CloseGeneralDialog(function () {
							messaging = ($('#messaging').length > 0) ? $('#messaging') : $('#' + page.getPrimaryBlockName()).find('.messaging').first();

							switch (status) {
								case 'success':
									messaging.removeClass('alert-info alert-warning alert-danger');
									messaging.addClass('alert-success').html('<strong>Success!</strong> Your changes have been saved!');
									messaging.show().delay(5000).slideUp();
									break;
								case 'error':
									messaging.removeClass('alert-success alert-info alert-warning');
									messaging.addClass('alert-danger').html('<strong>Sorry!</strong> Please check for errors and try again.');
									messaging.show();
									break;
							}
							
							// Clear errors
							errorHandler.setErrors('error', {});
							errorHandler.setErrors('validation', {});
							
							// Collapse the right-hand side panel
							/*splitter.collapse('#right-pane');*/

							// Notify subscribers
							page.notify('update');
						});
					}
				}],
				saveFailed: [{
					callback: function (e, status, xhr) {
						var that = this,
							isWebForm = that.isWebForm,
							splitter = $('#horizontal').data('kendoSplitter'),
							page = App.getCurrent(),
							errorHandler = page.getErrorHandler(),
							errors = [],
							message,
							type = 'error';
							
						CloseGeneralDialog(function () {				
							// Expand the right-hand side panel
							/*splitter.expand('#right-pane');*/
							
							switch (xhr.status) {
								case 404:
									if (isWebForm) {
										message = [error + ': ', config.route.update];
									} else {
										message = [error + ': ', config.route.update.url];
									}
									
									if (App.getConfig('debug') === true) {	
										message.unshift(xhr.status);
										App.log(message);
									}
									
									errors[0] = message.join(' ');
									errorHandler.setErrors('error', errors);
									break;
									
								// Used for concurrency errors
								case 409:
									if (isWebForm) {
										message = [error + ': ', config.route.update];
									} else {
										message = [error + ': ', config.route.update.url];
									}
									
									if (App.getConfig('debug') === true) {	
										message.unshift(xhr.status);
										App.log(message);
									}
									
									errors[0] = message.join(' ');
									errorHandler.setErrors('error', errors);
									break;
									
								// Used for validation errors
								case 400:
									type = 'validation';
									
									if (isWebForm) {
										$.each($.parseJSON(xhr.responseJSON.d), function (idx, obj) {
											if (obj.hasOwnProperty('id')) {
												errors[App.Helpers.String.camelize(obj.id)] = obj.message;
											}
										});
									} else {

										$.each($.parseJSON(xhr.responseJSON.Message), function (idx, obj) {
											if (obj.hasOwnProperty('id')) {
												errors[App.Helpers.String.camelize(obj.id)] = obj.message;
											}
										});
									}
									
									errorHandler.setErrors('validation', errors);
									break;
								
								// Used for validation errors
								case 412:
									type = 'validation';
									
									if (isWebForm) {
										$.each($.parseJSON(xhr.responseJSON.d), function (idx, obj) {
											if (obj.hasOwnProperty('id')) {
												errors[App.Helpers.String.camelize(obj.id)] = obj.message;
											}
										});
									} else {

										$.each($.parseJSON(xhr.responseJSON.Message), function (idx, obj) {
											if (obj.hasOwnProperty('id')) {
												errors[App.Helpers.String.camelize(obj.id)] = obj.message;
											}
										});
									}
									
									errorHandler.setErrors('validation', errors);
									break;
								
								case 500:
									var parseResponse,
										response;
										
									parseResponse = function (responseData) {
										if (responseData.hasOwnProperty('d') && typeof responseData.d === 'string') {
											return $.parseJSON(responseData.d);
										} else {
											return responseData;
										}
									}
									
									if (App.getConfig('debug') === true) {
										if (xhr.hasOwnProperty('responseJSON')) {
											if (xhr.responseJSON.hasOwnProperty('d') && typeof xhr.responseJSON.d === 'string') {
												response = parseResponse(xhr.responseJSON);	
												message = [xhr.status, xhr.statusText + ': ', response.Message, response.Operation, response.Timestamp].join(' ');
											} else {
												message = [xhr.status, xhr.statusText + ': ', xhr.responseJSON.Message, xhr.responseJSON.ExceptionType, xhr.responseJSON.ExceptionMessage].join(' ');
											}
										} else {
											message = [xhr.status, xhr.statusText].join(' ');
										}
										
										App.log(message);
									} else {
										message = [xhr.statusText + ': ', 'Please contact your systems administrator!'].join(' ');
									}
									
									errors[0] = message;
									errorHandler.setErrors('error', errors);
									break;
							}
						});
					}
				}],
				validateFailed: [{
					callback: function (event) {
						// TODO: Success/error methods should be implemented as callbacks
						var splitter = $('#horizontal').data('kendoSplitter'),
							page = App.getCurrent(),
							errorHandler = page.getErrorHandler(),
							validator = page.getBlock(App.getPrimaryBlockName()).getValidator(),
							messaging = ($('#messaging').length > 0) ? $('#messaging') : $('#' + page.getPrimaryBlockName()).find('.messaging').first();
														
						// Expand the right-hand side panel
						/*splitter.expand('#right-pane');*/
						$('#main').attr('class', 'col-xs-12 col-md-8 col-lg-10').next('aside')
							.attr('class', 'hidden-xs col-md-4 col-lg-2').show();
						
						errorHandler.setErrors('validation', validator._errors);
						
						messaging.removeClass('alert-success alert-info alert-warning');
						messaging.addClass('alert-danger').html('<strong>Validation Error(s):</strong> Please check for errors and try again.');
						messaging.show();
					}
				}]
			}
		};
	}
};
	
App.Config.DataSource = App.Config.DataSource || {
	defaults: function () {
		return {
			transport: {
				create: {
					url: '',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json; charset=utf-8'
				},
				read: {
					url: '',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json; charset=utf-8'
				},
				update: {
					url: '',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json; charset=utf-8'
				},
				destroy: {
					url: '',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json; charset=utf-8'
				},
				parameterMap: function (options) {
					return kendo.stringify(options); // kendo.stringify serializes to JSON string
				}
			},
			schema: {
				data: function (data) {
					if (data.hasOwnProperty('d') && typeof data.d === 'string') {
						return $.parseJSON(data.d);
					} else {
						return data;
					}
				},
				total: function (data) {
					if (data.hasOwnProperty('d') && typeof data.d === 'string') {
						return $.parseJSON(data.d).length;
					} else {
						return data.length;
					}
				}
			}
		}
	}
};

App.Config.HierarchicalDataSource = App.Config.HierarchicalDataSource || {
	defaults: function () {
		return {
			transport: {
				create: {
					url: '',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json; charset=utf-8'
				},
				read: {
					url: '',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json; charset=utf-8'
				},
				update: {
					url: '',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json; charset=utf-8'
				},
				destroy: {
					url: '',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json; charset=utf-8'
				}
			},
			schema: {
				data: function (data) {
					if (data.hasOwnProperty('d') && typeof data.d === 'string') {
						return $.parseJSON(data.d);
					} else {
						return data;
					}
				},
				total: function (data) {
					if (data.hasOwnProperty('d') && typeof data.d === 'string') {
						return $.parseJSON(data.d).length;
					} else {
						return data.length;
					}
				},
				model: {
					hasChildren: false,
					children: 'Items'
				}
			}
		}
	}
};

App.Config.DataSets = App.Config.DataSets || {};

App.Config.DataSources = App.Config.DataSources || {};

/**
 *	Default Kendo UI widget parameters and attributes
 *	Convention over configuration!
 */
App.Config.Widgets = App.Config.Widgets || {
	defaults: function () {
		return {
			// Custom widgets
			ajaxloader: {
				type: 'kendoAjaxLoader'
			},
			// Lowercase keys are easier to find when iterating!
			autocomplete: {
				type: 'kendoAutoComplete',
				attributes: {
					data: {
						textField: 'Value'
					}
				}
			},
			button: {
				type: 'kendoButton'
			},
			calendar: {
				type: 'kendoCalendar'
			},
			colorpicker: {
				type: 'kendoColorPicker'
			},
			combobox: {
				type: 'kendoComboBox',
				attributes: {
					data: {
						textField: 'Value',
						valueField: 'Key'
					}
				}
			},
			datepicker: {
				type: 'kendoDatePicker'
			}, 
			datetimepicker: {
				type: 'kendoDateTimePicker'
			},
			// DropDownList configurations
			dropdownlist: {
				type: 'kendoDropDownList',
				attributes: {
					data: {
						textField: 'Value',
						valueField: 'Key'
					}
				}
			},
			provincedropdown: {
				type: 'kendoDropDownList',
				kendoRole: 'dropdownlist',
				attributes: {
					data: {
						bind: {
							source: {
								type: 'custom',
								config: {
									data: [
										{ Key: '', Value: '' },
										{ Key: 'AB', Value: 'AB' },
										{ Key: 'BC', Value: 'BC' },
										{ Key: 'MB', Value: 'MB' },
										{ Key: 'NB', Value: 'NB' },
										{ Key: 'NL', Value: 'NL' },
										{ Key: 'NS', Value: 'NS' },
										{ Key: 'NT', Value: 'NT' },
										{ Key: 'NU', Value: 'NU' },
										{ Key: 'ON', Value: 'ON' },
										{ Key: 'PE', Value: 'PE' },
										{ Key: 'QC', Value: 'QC' },
										{ Key: 'SK', Value: 'SK' }
									]
								}
							}
						},
						valuePrimitive: true,
						textField: 'Value',
						valueField: 'Key'
					}
				}
			},
			provincemultiselect: {
				type: 'kendoMultiSelect',
				kendoRole: 'multiselect',
				attributes: {
					data: {
						bind: {
							source: {
								type: 'custom',
								config: {
									data: [
										//{ Key: '', Value: '' },
										{ Key: 'AB', Value: 'AB' },
										{ Key: 'BC', Value: 'BC' },
										{ Key: 'MB', Value: 'MB' },
										{ Key: 'NB', Value: 'NB' },
										{ Key: 'NL', Value: 'NL' },
										{ Key: 'NS', Value: 'NS' },
										{ Key: 'NT', Value: 'NT' },
										{ Key: 'NU', Value: 'NU' },
										{ Key: 'ON', Value: 'ON' },
										{ Key: 'PE', Value: 'PE' },
										{ Key: 'QC', Value: 'QC' },
										{ Key: 'SK', Value: 'SK' }
									]
								}
							}
						},
						valuePrimitive: true,
						textField: 'Value',
						valueField: 'Key'
					}
				}
			},
			yesno: {
				type: 'kendoDropDownList',
				kendoRole: 'dropdownlist',
				attributes: {
					style: 'width: 108px',
					data: {
						bind: {
							source: {
								type: 'custom',
								config: {
									data: [
										{ Key: '', Value: '' },
										{ Key: 'No', Value: 'No' },
										{ Key: 'Yes', Value: 'Yes' }
									]
								}
							}
						},
						valuePrimitive: true,
						textField: 'Value',
						valueField: 'Key'
					}
				}
			},
			truefalse: {
				type: 'kendoDropDownList',
				kendoRole: 'dropdownlist',
				attributes: {
					data: {
						bind: {
							source: {
								type: 'custom',
								config: {
									data: [
										{ Key: '', Value: '' },
										{ Key: 'false', Value: 'No' },
										{ Key: 'true', Value: 'Yes' }
									]
								}
							}
						},
						valuePrimitive: true,
						textField: 'Value',
						valueField: 'Key'
					}
				}
			},
			editor: {
				type: 'kendoEditor'
			},
			grid: {
				type: 'kendoGrid'
			},
			listview: {
				type: 'kendoListView'
			},
			map: {
				type: 'kendoMap'
			},
			menu: {
				type: 'kendoMenu'
			},
			multiselect: {
				type: 'kendoMultiSelect'
			},
			numerictextbox: {
				type: 'kendoNumericTextBox'
			},
			observinglistview: {
				type: 'kendoObservingListView',
				attributes: {
					data: {
						bind: {
							events: {
								pageLoaded: function (e) {
								}
							}
						}
					}
				}
			},
			observingpanelbar: {
				type: 'kendoObservingPanelBar'
			},
			panelbar: {
				type: 'kendoPanelBar'
			},
			slider: {
				type: 'kendoSlider'
			},
			splitter: {
				type: 'kendoSplitter'
			},
			tabstrip: {
				type: 'kendoTabStrip'
			},
			semantictabstrip: {
				type: 'kendoSemanticTabStrip',
				attributes: {
					data: {
						tabContainer: 'ul',
						tabElement: 'li',
						contentElement: 'fieldset'
					}
				}
			},
            silentvalidator: {
				type: 'kendoSilentValidator'
			},
			timepicker: {
				type: 'kendoTimePicker'
			},
			tooltip: {
				type: 'kendoTooltip'
			},
            totaltopgrid: {
				type: 'kendoTotalTopGrid'
			},
			treeview: {
				type: 'kendoTreeView',
				attributes: {
					data: {
						animation: false,
						dragAndDrop: false,
						textField: 'Value',
						urlField: 'Key'
					}
				}
			},
			upload: {
				type: 'kendoUpload'
			},
            validator: {
                type: 'kendoValidator',
                constants: {
                    NS: '.kendoValidator',
                    INVALIDMSG: 'k-invalid-msg',
                    INVALIDINPUT: 'k-invalid',
                    INPUTSELECTOR: ':input:not(:button,[type=submit],[type=reset],[disabled],[readonly])',
                    CHECKBOXSELECTOR: ':checkbox:not([disabled],[readonly])',
                    NUMBERINPUTSELECTOR: '[type=number],[type=range]',
                    BLUR: 'blur',
                    NAME: 'name',
                    FORM: 'form',
                    NOVALIDATE: 'novalidate'
                }
            },
			window: {
				type: 'kendoWindow'
			}
		}
	}
};