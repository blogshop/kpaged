define({
	name: 'address',
	id: 'address', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: false,
	setAddress: function () {
		var	that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			block = page.getBlock('center-pane'),
			viewModel = that.getViewModel(),
			data = page.getFormData(),
			addressEventHandler = that.getEventHandler(),
			addressValidator = block.getValidator(),
			addressEditPopup,
			addressLookupPopup,
			addressEditWindow,
			addressLookupWindow,
			addressEditTrigger,
			addressLookupTrigger,
			addressDisplay,
			overrideAddress,
			overrideAddressReason,
			addressReviewDate,
			sources = {},
			tabs = that.tabs,
			tab,
			fields = {},
			address = [],
			addressString = [],
			current;
			
		if (typeof tabs !== 'undefined') tab = tabs.select();
		fields = {
			// Civic address fields
			civic: {
				suiteNumber: $.trim(viewModel.get('address.suiteNumber')),
				streetNumber: $.trim(viewModel.get('address.streetNumber')),
				streetName: $.trim(viewModel.get('address.streetName')),
				streetType: $.trim(viewModel.get('address.streetType')),
				streetDirection: $.trim(viewModel.get('address.streetDirection')),
				poBox: (viewModel.get('address.poBox')) ? 'PO BOX ' + $.trim(viewModel.get('address.poBox')) : ''
				
			},
			// Rural address fields
			rural: {
				rr: (viewModel.get('address.rr')) ? 'RR ' + $.trim(viewModel.get('address.rr')) : '',
				site: (viewModel.get('address.site')) ? 'SITE ' + $.trim(viewModel.get('address.site')) : '',
				comp: (viewModel.get('address.comp')) ? 'COMP ' + $.trim(viewModel.get('address.comp')) : '',
				box: (viewModel.get('address.box')) ? 'BOX ' + $.trim(viewModel.get('address.box')) : '',
				lotNumber: (viewModel.get('address.lotNumber')) ? 'LOT ' + $.trim(viewModel.get('address.lotNumber')) : '',
				concessionNumber: (viewModel.get('address.concessionNumber')) ? 'CONCESSION ' + $.trim(viewModel.get('address.concessionNumber')) : ''
			},
			common: {
				station: (viewModel.get('address.station')) ? 'STN ' + $.trim(viewModel.get('address.station')) : '',
				city: $.trim(viewModel.get('address.city')),
				zone: $.trim(viewModel.get('address.zone')),
				postcode: $.trim(viewModel.get('address.postcode')),
				country: $.trim(viewModel.get('address.country'))
			}
		};
		
		if (typeof tab !== 'undefined') {
			// Create a string representation of the address fields
			if (tab.index() === 0) {
				// Civic address selected
				// Clear all rural values
				$.each(fields.rural, function (key, value) {
					viewModel.set(key, '');
				});
				
				if (fields.civic.suiteNumber !== '') {
					address.push('{suiteNumber}-{streetNumber} {streetName} {streetType} {streetDirection}');
				} else {
					address.push('{streetNumber} {streetName} {streetType} {streetDirection}');
				}
				address.push('{poBox} {station}');
			} else if (tab.index() === 1) {
				// Rural address selected
				// Clear all civic values
				$.each(fields.civic, function (key, value) {
					viewModel.set(key, ''); 
				});
				
				if (fields.rural.lot !== '' && fields.rural.concession !== '') {
					address.push('{lotNumber} {concessionNumber}');
				}
				if (fields.rural.site !== '' && fields.rural.comp !== '') {
					address.push('{site} {comp} {box}');
				}
				address.push('{rr} {station}');
			}
			
			// Append city/municipality, zone and postal code
			address.push('{city} {zone} {postcode}');

			if (fields.common.country == "USA") {
				address.push('{country}');
			}
			
			// Replace formatting keys with form values
			$.each(address, function (idx, format) {
				current = format;
				if (tab.index() === 0) {
					$.each(fields.civic, function (key, value) {
						current = current.replace('{' + key + '}', value);
					});
				} else if (tab.index() === 1) {
					$.each(fields.rural, function (key, value) {
						current = current.replace('{' + key + '}', value);
					});
				}
				
				$.each(fields.common, function (key, value) {
					current = current.replace('{' + key + '}', value);
				});
				
				if ($.trim(current) !== '') {
					addressString.push($.trim(current));
				}
			});
			
			// Join address strings
			addressString = addressString.join('\r\n');
			
			that.addressDisplay.attr('readonly', false).val(addressString).attr('readonly', true);
			$('div[name=addressEditPopup]').data('kendoWindow').close();
		}
	},
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
			
			// Register any custom methods
			that.setAddress = that.setAddress || that.getConfig().setAddress;
		},
		dataBound: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
				
			// Register any custom methods
			that.setAddress = that.setAddress || that.getConfig().setAddress;
			
			that.setAddress();
		},
		rendered: function (e) {
			// TODO: This is temporary until I figure out a more permanent solution
			if ((this._viewModel instanceof kendo.data.ObservableObject) === false) {
				this._viewModel = new kendo.data.ObservableObject();
			}
			
			console.log('rendering address module [' + this._id + ']');
			var	that = this,
				moduleElement = $('#' + that.getId()),
				page = that.getPage(),
				block = page.getBlock('center-pane'),
				//viewModel = block.getViewModel()
				viewModel = that.getViewModel(),
				data = page.getFormData(),
				addressEventHandler = that.getEventHandler(),
                addressViewModel = viewModel,
				addressValidator = block.getValidator(),
				addressEditPopup,
				addressLookupPopup,
				addressEditWindow,
				addressLookupWindow,
				addressEditTrigger,
				addressLookupTrigger,
				addressDisplay,
				overrideAddress,
				overrideAddressReason,
				addressReviewDate,
				sources = {},
				tabs,
				tab,
				fields = {},
				address = [],
				addressString = [],
				current;
			
			try {
				that.dataBind(addressViewModel);
			} catch (e) {
				App.log(e);
			}
			
			// Bind popups, and set module props so they can be accessed from layout
			that.addressEditPopup = addressEditPopup = moduleElement.find('[name=addressEditPopup]');
			that.addressLookupPopup = addressLookupPopup = moduleElement.find('[name=addressLookupPopup]');
			
			kendo.bind(addressEditPopup, addressViewModel);
			kendo.bind(addressLookupPopup, addressViewModel);
			
			// Bind triggers
			addressEditTrigger = moduleElement.find('[name=addressEditTrigger]').first();
			addressLookupTrigger = moduleElement.find('[name=addressLookupTrigger]').first();
			
			kendo.bind(addressEditTrigger, addressViewModel);
			kendo.bind(addressLookupTrigger, addressViewModel);
			
			addressEditTrigger = addressEditTrigger.data('kendoButton'); // Watch out - changing types!
			addressLookupTrigger = addressLookupTrigger.data('kendoButton'); // Watch out - changing types!
			
			// Bind tabs
			tabs = addressEditPopup.find('.address-tabs').first();
			kendo.bind(tabs, addressViewModel);
			
			that.tabs = tabs = tabs.data('kendoSemanticTabStrip'); // Watch out - changing types!
			
			// Bind form buttons
			var addressEditSelect = $(document.body).find('[name=addressEditSelect]').first();
			addressEditSelect = addressEditSelect.data('kendoButton');
			addressEditSelect.bind('click', function (e) {
				that.setAddress();
			});
			
			// Initialize windows from popups
			that.addressEditWindow = addressEditWindow = addressEditPopup.data('kendoWindow');
			that.addressLookupWindow = addressLookupWindow = addressLookupPopup.data('kendoWindow');
			
			// We have to use name attr because initializing widgets can replace the class name
			that.overrideAddress = overrideAddress = moduleElement.find('[name=overrideAddress]').first();
			that.overrideAddressReason = overrideAddressReason = moduleElement.find('[name=overrideAddressReason]').first();
			that.addressReviewDate = addressReviewDate = moduleElement.find('[name=addressReviewDate]').first();
			that.addressDisplay = addressDisplay = moduleElement.find('[name=addressDisplay]').first();
			
			// Bind preview
			kendo.bind(addressDisplay, addressViewModel);
			
			// TODO: This if f***ing stupid I should be able to bind from layout
			addressEditTrigger.bind('click', function (e) {
				var moduleElement = e.sender.element.closest('[id^=module_address_]'),
					module = page.getModule(moduleElement.attr('id')),
					//editWindow = module.addressEditPopup.data('kendoWindow');
					editWindow = addressEditWindow;
				
				console.log(moduleElement);
				console.log(module);
				console.log(editWindow);
				
				editWindow.center().open();
				
			});
			
			addressLookupTrigger.bind('click', function (e) {
				var moduleElement = e.sender.element.closest('[id^=module_address_]'),
					module = page.getModule(moduleElement.attr('id')),
					//lookupWindow = module.addressLookupPopup.data('kendoWindow');
					lookupWindow = addressLookupWindow;
				
				console.log(moduleElement);
				console.log(module);
				console.log(lookupWindow);
				
				lookupWindow.center().open();
			});
			
			// Set values to view-model
			/*for (prop in data) {
				if (addressViewModel.hasOwnProperty(prop)) {
					value = data[prop] || '';
					
					console.log('setting prop: ' + prop + ' | value: ' + value);
					addressViewModel.set(prop, value);
				}
			}
			
			overrideAddress.click(function (e) {
				var behavior = App.Widgets.Behaviors.OnCheckedEnableWidget(e, {
					target: [
						addressEditTrigger, 
						addressLookupTrigger
					]
				});
				
				behavior.execute();
				
				behavior = App.Behaviors.OnCheckedDisplayFieldGroup(e, {
					target: [overrideAddressReason, addressReviewDate]
				});
				
				behavior.execute();
			});
			
			tab = tabs.select();
			
			try {
				fields = {
					// Civic address fields
					civic: {
						suiteNumber: $.trim(addressViewModel.get('address.suiteNumber')),
						streetNumber: $.trim(addressViewModel.get('address.streetNumber')),
						streetName: $.trim(addressViewModel.get('address.streetName')),
						streetType: $.trim(addressViewModel.get('address.streetType')),
						streetDirection: $.trim(addressViewModel.get('address.streetDirection')),
						poBox: (addressViewModel.get('address.poBox')) ? 'PO BOX ' + $.trim(addressViewModel.get('address.poBox')) : ''
						
					},
					// Rural address fields
					rural: {
						rr: (addressViewModel.get('address.rr')) ? 'RR ' + $.trim(addressViewModel.get('address.rr')) : '',
						site: (addressViewModel.get('address.site')) ? 'SITE ' + $.trim(addressViewModel.get('address.site')) : '',
						comp: (addressViewModel.get('address.comp')) ? 'COMP ' + $.trim(addressViewModel.get('address.comp')) : '',
						box: (addressViewModel.get('address.box')) ? 'BOX ' + $.trim(addressViewModel.get('address.box')) : '',
						lotNumber: (addressViewModel.get('address.lotNumber')) ? 'LOT ' + $.trim(addressViewModel.get('address.lotNumber')) : '',
						concessionNumber: (addressViewModel.get('address.concessionNumber')) ? 'CONCESSION ' + $.trim(addressViewModel.get('address.concessionNumber')) : ''
					},
					common: {
						station: (addressViewModel.get('address.station')) ? 'STN ' + $.trim(addressViewModel.get('address.station')) : '',
						city: $.trim(addressViewModel.get('address.city')),
						zone: $.trim(addressViewModel.get('address.zone')),
						postcode: $.trim(addressViewModel.get('address.postcode'))
					}
				};
			} catch (e) {
				App.log(e);
			}
			
			// Create a string representation of the address fields
			if (tab.index() === 0) {
				// Civic address selected
				// Clear all rural values
				$.each(fields.rural, function (key, value) {
					addressViewModel.set(key, '');
				});
				
				if (fields.civic.suiteNumber !== '') {
					address.push('{suiteNumber}-{streetNumber} {streetName} {streetType} {streetDirection}');
				} else {
					address.push('{streetNumber} {streetName} {streetType} {streetDirection}');
				}
				address.push('{poBox} {station}');
			} else if (tab.index() === 1) {
				// Rural address selected
				// Clear all civic values
				$.each(fields.civic, function (key, value) {
					addressViewModel.set(key, ''); 
				});
				
				if (fields.rural.lot !== '' && fields.rural.concession !== '') {
					address.push('{lotNumber} {concessionNumber}');
				}
				if (fields.rural.site !== '' && fields.rural.comp !== '') {
					address.push('{site} {comp} {box}');
				}
				address.push('{rr} {station}');
			}
			
			// Append city/municipality, zone and postal code
			address.push('{city} {zone} {postcode}');
			
			// Replace formatting keys with form values
			$.each(address, function (idx, format) {
				current = format;
				if (tab.index() === 0) {
					$.each(fields.civic, function (key, value) {
						current = current.replace('{' + key + '}', value);
					});
				} else if (tab.index() === 1) {
					$.each(fields.rural, function (key, value) {
						current = current.replace('{' + key + '}', value);
					});
				}
				
				$.each(fields.common, function (key, value) {
					current = current.replace('{' + key + '}', value);
				});
				
				if ($.trim(current) !== '') {
					addressString.push($.trim(current));
				}
			});
			
			// Join address strings
			addressString = addressString.join('\r\n');
			
			addressDisplay.attr('readonly', false).val(addressString).attr('readonly', true);
			addressEditWindow.close();*/
			// Create hidden fields in the parent form (if it exists)
			
			// Only if autoBind is true...
			/*try {
				that.dataBind(addressViewModel);
			} catch (e) {
				App.log(e);
			}*/
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				// START ADDRESS
				// Replace with address module
				{
					tag: 'div',
					class: 'kpaf-row clearfix',
					fields: [
						{
							tag: 'input',
							type: 'hidden',
							id: 'suiteNumber_hidden',
							name: 'suiteNumber',
							data: {
								bind: 'address.suiteNumber'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'streetNumber_hidden',
							name: 'streetNumber',
							data: {
								bind: 'address.streetNumber'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'streetName_hidden',
							name: 'streetName',
							data: {
								bind: 'address.streetName'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'streetType_hidden',
							name: 'streetType',
							data: {
								bind: 'address.streetType'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'streetDirection_hidden',
							name: 'streetDirection',
							data: {
								bind: 'address.streetDirection'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'poBox_hidden',
							name: 'poBox',
							data: {
								bind: 'address.poBox'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'rr_hidden',
							name: 'rr',
							data: {
								bind: 'address.rr'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'site_hidden',
							name: 'site',
							data: {
								bind: 'address.site'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'comp_hidden',
							name: 'comp',
							data: {
								bind: 'address.comp'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'box_hidden',
							name: 'box',
							data: {
								bind: 'address.box'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'lotNumber_hidden',
							name: 'lotNumber',
							data: {
								bind: 'address.lotNumber'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'concessionNumber_hidden',
							name: 'concessionNumber',
							data: {
								bind: 'address.concessionNumber'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'station_hidden',
							name: 'station',
							data: {
								bind: 'address.station'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'city_hidden',
							name: 'city',
							data: {
								bind: 'address.city'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'zone_hidden',
							name: 'zone',
							data: {
								bind: 'address.zone'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'country_hidden',
							name: 'country',
							data: {
								bind: 'address.country'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'postcode_hidden',
							name: 'postcode',
							data: {
								bind: 'address.postcode'
							}
						}
					],
					fieldgroups: [
						{
							tag: 'div',
							class: 'fieldgroup',
							group: [{
								name: 'addressDisplay',
								tag: 'textarea',
								label: 'Current Address',
								style: 'width: 306px; height: 60px; border: 1px solid #ddd',
								readonly: true
							}]
						},
						{
							tag: 'div',
							class: 'fieldgroup',
							group: [
								{
									name: 'addressLookupTrigger',
									tag: 'button',
									type: 'button',
									label: '\u00a0',
									text: 'Search for an Address',
									class: 'k-button',
									data: {
										role: 'button',
										// TODO: This is f***ed -- I don't know why it's not working
										/*bind: {
											events: {
												click: function (e) {
													// TODO: Make two helpers for this, getWidget/getWindow?
													// TODO: Or better yet, make a behavior?
													// Get the module
													var moduleElement = e.sender.element.closest('[id^=module_address_]'),
														module = App.getCurrent().getModule(moduleElement.attr('id')),
														lookupWindow = module.addressLookupPopup.data('kendoWindow');
														
													console.log(moduleElement);
													console.log(module);
													console.log(lookupWindow);
													
													lookupWindow.center().open();
												}
											}
										}*/
									}
								},
								{
									name: 'addressEditTrigger',
									tag: 'button',
									type: 'button',
									label: '\u00a0',
									text: 'Edit Current Address',
									class: 'k-button',
									data: {
										role: 'button',
										// TODO: This is f***ed -- I don't know why it's not working
										/*bind: {
											events: {
												click: function (e) {
													// TODO: Make two helpers for this, getWidget/getWindow?
													// Get the module
													var moduleElement = e.sender.element.closest('[id^=module_address_]'),
														module = App.getCurrent().getModule(moduleElement.attr('id')),
														editWindow = module.addressEditPopup.data('kendoWindow');
													
													console.log(moduleElement);
													console.log(module);
													console.log(editWindow);
													
													editWindow.center().open();
												}
											}
										}*/
									}
								}
							]
						},
						{
							tag: 'div',
							class: 'fieldgroup',
							group: [
								{
									class: 'overrideAddress',
									name: 'overrideAddress',
									tag: 'input',
									type: 'checkbox',
									label: 'Override',
									data: {
										bind: {
											checked: 'overrideAddress'
										}
									}
								}
							]
						}
					]
				},
				{
					tag: 'div',
					class: 'kpaf-row clearfix',
					fieldgroups: [
						{
							tag: 'div',
							class: 'fieldgroup',
							style: 'display: none',
							group: [{
								id: 'overrideAddressReason',
								name: 'overrideAddressReason',
								tag: 'textarea',
								label: 'Address Override Reason',
								style: 'width: 306px; height: 60px; border: 1px solid #ddd'
							}]
						},
						{
							tag: 'div',
							class: 'fieldgroup',
							style: 'display: none',
							group: [{
								id: 'addressReviewDate',
								name: 'addressReviewDate',
								tag: 'input',
								type: 'text',
								label: 'Review Date',
								data: {
									role: 'datepicker',
									culture: 'en-CA',
									format: 'dd/MM/yyyy',
									parseFormats: ['yyyy-MM-dd', 'dd/MM/yyyy', 'd/MM/yyyy', 'd/M/yyyy']
								}
							}]
						}
					]
				},
				{
					tag: 'div',
					name: 'addressEditPopup',
					data: {
						role: 'window',
						//appendTo: 'form',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Edit Current Address',
						width: '50%',
						bind: {
							events: {
								open: function (e) {
									e.sender.element.data('kendoWindow').center();

									// Make sure Canadian fields are displayed if address lookup was used
									$('#country').data('kendoDropDownList').trigger('change');
								},
							}
						}
					},
					fieldgroups: [
						{
							tag: 'div',
							name: 'address-tabs',
							class: 'address-tabs',
							data: {
								role: 'semantictabstrip',
								animation: false
							},
							tabs: ['Enter Civic', 'Enter Rural'],
							fieldsets: [
								{
									tag: 'fieldset',
									class: 'address-civic',
									legend: 'Civic',
									fieldgroups: [
										{
											tag: 'div',
											class: 'kpaf-row field',
											fields: [
												{
													tag: 'div',
													class: 'fieldgroup',
													group: [{
														id: 'suiteNumber',
														name: 'suiteNumber_form',
														label: 'Apt/Suite #',
														tag: 'input',
														type: 'text',
														class: 'tiny k-textbox',
														data: {
															bind: {
																value: 'address.suiteNumber',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			suiteNumber = viewModel.get('address.suiteNumber');

																		if (suiteNumber) {
																			viewModel.set('address.suiteNumber', suiteNumber.toUpperCase());
																			$('#suiteNumber_hidden').val(suiteNumber.toUpperCase());
																		}
																	}
																}
															}
														}
													}]
												},
												{
													tag: 'div',
													class: 'fieldgroup',
													group: [{
														id: 'streetNumber',
														name: 'streetNumber_form',
														label: 'Street #',
														tag: 'input',
														type: 'text',
														class: 'small k-textbox',
														data: {
															bind: {
																value: 'address.streetNumber',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			streetNumber = viewModel.get('address.streetNumber');
																			
																		if (streetNumber) {
																			viewModel.set('address.streetNumber', streetNumber.toUpperCase());
																			$('#streetNumber_hidden').val(streetNumber.toUpperCase());
																		}
																	}
																}
															}
														}
													}]
												},
												{
													tag: 'div',
													class: 'fieldgroup',
													group: [{
														id: 'streetName',
														name: 'streetName_form',
														label: 'Street Name',
														tag: 'input',
														type: 'text',
														class: 'medium k-textbox',
														data: {
															bind: {
																value: 'address.streetName',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			streetName = viewModel.get('address.streetName');
																		
																		if (streetName)  {
																			viewModel.set('address.streetName', streetName.toUpperCase());
																			$('#streetName_hidden').val(streetName.toUpperCase());
																		}
																	}
																}
															}
														}
													}]
												},
												{
													tag: 'div',
													class: 'fieldgroup',
													group: [{
														id: 'streetType',
														name: 'streetType_form',
														label: 'Street Type',
														tag: 'input',
														type: 'text',
														class: 'small k-textbox',
														data: {
															bind: {
																value: 'address.streetType',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			streetType = viewModel.get('address.streetType');
																		
																		if (streetType) {
																			viewModel.set('address.streetType', streetType.toUpperCase());
																			$('#streetType_hidden').val(streetType.toUpperCase());
																		}
																	}
																}
															}
														}
													}]
												},
												{
													tag: 'div',
													class: 'fieldgroup',
													group: [{
														id: 'streetDirection',
														name: 'streetDirection_form',
														label: 'Street Direction',
														tag: 'input',
														type: 'text',
														class: 'small',
														style: 'width: 108px',
														data: {
															role: 'dropdownlist',
															bind: {
																source: {
																	type: 'custom',
																	config: {
																		data: [
																			{ Key: 'NE', Value: 'NE' },
																			{ Key: 'NW', Value: 'NW' },
																			{ Key: 'SE', Value: 'SE' },
																			{ Key: 'SW', Value: 'SW' },
																			{ Key: 'N', Value: 'N' },
																			{ Key: 'S', Value: 'S' },
																			{ Key: 'W', Value: 'W' },
																			{ Key: 'E', Value: 'E' },
																			{ Key: '', Value: '' }
																		]
																	}
																},
																value: 'address.streetDirection',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			streetDirection = viewModel.get('address.streetDirection') != null ? viewModel.get('address.streetDirection').Value.toUpperCase() : "";
																			
																		viewModel.set('address.streetDirection', streetDirection);
																		$('#streetDirection_hidden').val(streetDirection);
																	}
																}
															},
															optionLabel: ' '
														}
													}]
												},
												{
													tag: 'div',
													class: 'fieldgroup',
													group: [{
														id: 'poBox',
														name: 'poBox_form',
														label: 'P.O. Box',
														tag: 'input',
														type: 'text',
														class: 'small k-textbox',
														data: {
															bind: {
																value: 'address.poBox',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			poBox = viewModel.get('poBox');
																			
																		if (poBox) {
																			viewModel.set('poBox', poBox.toUpperCase());
																			$('#poBox_hidden').val(poBox.toUpperCase());
																		}
																	}
																}
															}
														}
													}]
												}
											]
										}
									]
								},
								{
									tag: 'fieldset',
									class: 'address-rural',
									legend: 'Rural',
									fieldgroups: [
										{
											tag: 'div',
											class: 'kpaf-row',
											fields: [
												{
													tag: 'div',
													class: 'fieldgroup',
													group: [{
														id: 'rr',
														name: 'rr_form',
														label: 'RR',
														tag: 'input',
														type: 'text',
														class: 'small k-textbox',
														data: {
															bind: {
																value: 'address.rr',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			rr = viewModel.get('address.rr');
																		
																		if (rr) {
																			viewModel.set('address.rr', rr.toUpperCase());
																			$('#rr_hidden').val(rr.toUpperCase());
																		}
																	}
																}
															}
														}
													}]
												},
												{
													tag: 'div',
													class: 'fieldgroup',
													group: [{
														id: 'site',
														name: 'site_form',
														label: 'Site',
														tag: 'input',
														type: 'text',
														class: 'small k-textbox',
														data: {
															bind: {
																value: 'address.site',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			site = viewModel.get('address.site');
																		
																		if (site) {
																			viewModel.set('address.site', site.toUpperCase());
																			$('#site_hidden').val(site.toUpperCase());
																		}
																	}
																}
															}
														}
													}]
												},
												{
													tag: 'div',
													class: 'fieldgroup',
													group: [{
														id: 'comp',
														name: 'comp_form',
														label: 'Comp',
														tag: 'input',
														type: 'text',
														class: 'small k-textbox',
														data: {
															bind: {
																value: 'address.comp',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			comp = viewModel.get('address.comp');
																		
																		if (comp) {
																			viewModel.set('address.comp', comp.toUpperCase());
																			$('#comp_hidden').val(comp.toUpperCase());
																		}
																	}
																}
															}
														}
													}]
												},
												{
													tag: 'div',
													class: 'fieldgroup',
													group: [{
														id: 'box',
														name: 'box_form',
														label: 'Box',
														tag: 'input',
														type: 'text',
														class: 'small k-textbox',
														data: {
															bind: {
																value: 'address.box',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			box = viewModel.get('address.box');
																		
																		if (box) {
																			viewModel.set('address.box', box.toUpperCase());
																			$('#box_hidden').val(box.toUpperCase());
																		}
																	}
																}
															}
														}
													}]
												},
												{
													tag: 'div',
													class: 'fieldgroup',
													group: [{
														id: 'lotNumber',
														name: 'lotNumber_form',
														label: 'Lot #',
														tag: 'input',
														type: 'text',
														class: 'small k-textbox',
														data: {
															bind: {
																value: 'address.lotNumber',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			lotNumber = viewModel.get('address.lotNumber');
																		
																		if (lotNumber) {
																			viewModel.set('address.lotNumber', lotNumber.toUpperCase());
																			$('#lotNumber_hidden').val(lotNumber.toUpperCase());
																		}
																	}
																}
															}
														}
													}]
												},
												{
													tag: 'div',
													class: 'fieldgroup',
													group: [{
														id: 'concessionNumber',
														name: 'concessionNumber_form',
														label: 'Concession #',
														tag: 'input',
														type: 'text',
														class: 'small k-textbox',
														data: {
															bind: {
																value: 'address.concessionNumber',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			concessionNumber = viewModel.get('address.concessionNumber');
																		
																		if (concessionNumber) {
																			viewModel.set('address.concessionNumber', concessionNumber.toUpperCase());
																			$('#concessionNumber_hidden').val(concessionNumber.toUpperCase());
																		}
																	}
																}
															}
														}
													}]
												}
											]
										}
									]
								} // END fieldset
							] // END fieldsets
						},
						{
							tag: 'div',
							class: 'kpaf-row',
							fields: [
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'station',
										name: 'station_form',
										label: 'Station',
										tag: 'input',
										type: 'text',
										class: 'small k-textbox',
										data: {
											bind: {
												value: 'address.station',
												events: {
													change: function (e) {
														var viewModel = this,
															station = viewModel.get('address.station');
														
														if (station) {
															viewModel.set('address.station', station.toUpperCase());
															$('#station_hidden').val(station.toUpperCase());
														}
													}
												}
											}
										}
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'city',
										name: 'city_form',
										label: 'City',
										tag: 'input',
										type: 'text',
										class: 'medium k-textbox',
										data: {
											bind: {
												value: 'address.city',
												events: {
													change: function (e) {
														var viewModel = this,
															city = viewModel.get('address.city');
														
														if (city) {
															viewModel.set('address.city', city.toUpperCase());
															$('#city_hidden').val(city.toUpperCase());
														}
													}
												}
											}
										}
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'zone',
										name: 'zone_form',
										label: 'Province',
										tag: 'input',
										type: 'text',
										class: 'small',
										style: 'width: 108px',
										data: {
											role: 'dropdownlist',
											bind: {
												source: {
													type: 'custom',
													config: {
														data: [
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
															{ Key: 'SK', Value: 'SK' },
															{ Key: 'YT', Value: 'YT' }
														]
													}
												},
												value: 'address.zone',
												events: {
													change: function (e) {
														var viewModel = this,
															zone = viewModel.get('address.zone') !== null ? viewModel.get('address.zone').Value.toUpperCase() : '';
															
														viewModel.set('address.zone', zone);
														$('#zone_hidden').val(zone);
													}
												}
											},
											optionLabel: ' '
										}
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'postcode',
										name: 'postcode_form',
										label: 'Postal Code',
										tag: 'input',
										type: 'text',
										class: 'small k-textbox',
										data: {
											bind: {
												value: 'address.postcode',
												events: {
													change: function (e) {
														var viewModel = this,
															postcode = viewModel.get('address.postcode');
															
														if (postcode)  {
															viewModel.set('address.postcode', postcode.toUpperCase());
															$('#postcode_hidden').val(postcode.toUpperCase());
														}
													}
												}
											}
										}
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'country',
										name: 'country_form',
										label: 'Country',
										tag: 'input',
										type: 'text',
										class: 'small',
										style: 'width: 108px',
										data: {
											role: 'dropdownlist',
											bind: {
												source: {
													type: 'custom',
													config: {
														data: [
															{ Key: 'CANADA', Value: 'CANADA' },
															{ Key: 'USA', Value: 'USA' }
														]
													}
												},
												value: 'address.country',
												events: {
													change: function (e) {
														var viewModel = this,
															country = viewModel.get('address.country') !== null ? viewModel.get('address.country').toUpperCase() : '',
															dataSource;
															
														viewModel.set('address.country', country);
														$('#country_hidden').val(country);

														var dropdownlist = $('#zone').data('kendoDropDownList'),
															dataItem = e.sender.dataItem();
														
														var dataSource;
														
														if (dataItem.Key == 'USA') { 
															$('label[for=zone]').html('State');
															$('label[for=postcode]').html('Zip Code');

															dataSource = new kendo.data.DataSource({
																data: [
																	{ Key: 'AK', Value: 'AK' },
																	{ Key: 'AL', Value: 'AL' },
																	{ Key: 'AR', Value: 'AR' },
																	{ Key: 'AZ', Value: 'AZ' },
																	{ Key: 'CA', Value: 'CA' },
																	{ Key: 'CO', Value: 'CO' },
																	{ Key: 'CT', Value: 'CT' },
																	{ Key: 'DC', Value: 'DC' },
																	{ Key: 'DE', Value: 'DE' },
																	{ Key: 'FL', Value: 'FL' },
																	{ Key: 'GA', Value: 'GA' },
																	{ Key: 'HI', Value: 'HI' },
																	{ Key: 'IA', Value: 'IA' },
																	{ Key: 'ID', Value: 'ID' },
																	{ Key: 'IL', Value: 'IL' },
																	{ Key: 'IN', Value: 'IN' },
																	{ Key: 'KS', Value: 'KS' },
																	{ Key: 'KY', Value: 'KY' },
																	{ Key: 'LA', Value: 'LA' },
																	{ Key: 'MA', Value: 'MA' },
																	{ Key: 'MD', Value: 'MD' },
																	{ Key: 'ME', Value: 'ME' },
																	{ Key: 'MI', Value: 'MI' },
																	{ Key: 'MN', Value: 'MN' },
																	{ Key: 'MO', Value: 'MO' },
																	{ Key: 'MS', Value: 'MS' },
																	{ Key: 'MT', Value: 'MT' },
																	{ Key: 'NC', Value: 'NC' },
																	{ Key: 'ND', Value: 'ND' },
																	{ Key: 'NE', Value: 'NE' },
																	{ Key: 'NH', Value: 'NH' },
																	{ Key: 'NJ', Value: 'NJ' },
																	{ Key: 'NM', Value: 'NM' },
																	{ Key: 'NV', Value: 'NV' },
																	{ Key: 'NY', Value: 'NY' },
																	{ Key: 'OH', Value: 'OH' },
																	{ Key: 'OK', Value: 'OK' },
																	{ Key: 'OR', Value: 'OR' },
																	{ Key: 'PA', Value: 'PA' },
																	{ Key: 'RI', Value: 'RI' },
																	{ Key: 'SC', Value: 'SC' },
																	{ Key: 'SD', Value: 'SD' },
																	{ Key: 'TN', Value: 'TN' },
																	{ Key: 'TX', Value: 'TX' },
																	{ Key: 'UT', Value: 'UT' },
																	{ Key: 'VA', Value: 'VA' },
																	{ Key: 'VT', Value: 'VT' },
																	{ Key: 'WA', Value: 'WA' },
																	{ Key: 'WI', Value: 'WI' },
																	{ Key: 'WV', Value: 'WV' },
																	{ Key: 'WY', Value: 'WY' }
																]
															});
														} else {
															$('label[for=zone]').html('Province');
															$('label[for=postcode]').html('Postal Code');

															dataSource = new kendo.data.DataSource({
																data: [
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
																	{ Key: 'SK', Value: 'SK' },
																	{ Key: 'YT', Value: 'YT' }
																]
															});
														}

														dropdownlist.setDataSource(dataSource);
													}
												}
											},
											optionLabel: ' '
										}
									}]
								}
							]
						},
						{
							tag: 'div',
							class: 'kpaf-row',
							fields: [
								{
									name: 'addressEditSelect',
									tag: 'button',
									type: 'button',
									label: '\u00a0',
									text: 'Update Current Address',
									class: 'k-button right',
									data: {
										role: 'button'
									}
								}
							]
						}
					]
				},
				{
					tag: 'div',
					name: 'addressLookupPopup',
					data: {
						role: 'window',
						//appendTo: 'form',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Address Search',
						width: 960,
						bind: {
							events: {
								open: function (e) {
									e.sender.element.data('kendoWindow').center();
								}
							}
						}
					},
					fieldgroups: [
						{
							tag: 'div',
							class: 'kpaf-row',
							fields: [
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										class: 'lookupPostalCode',
										name: 'lookupPostalCode',
										label: 'Postal Code',
										tag: 'input',
										type: 'text',
										class: 'k-textbox',
										data: {
											bind: 'lookupPostalCode'
										}
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										class: 'addressLookupSearch',
										name: 'addressLookupSearch',
										tag: 'button',
										type: 'button',
										label: '\u00a0',
										text: 'Search',
										class: 'k-button right',
										data: {
											role: 'button',
											bind: {
												events: {
													click: function (e) {
														$('#lookupPostalCode').val($('#lookupPostalCode').val().toUpperCase().replace(/\s/g,''));
														$('#addressLookupGrid').data('kendoGrid').dataSource.read();
													}
												}
											}
										}
									}]
								}
							]
						},
						{
							tag: 'div',
							class: 'kpaf-row',
							fields: [
								{
									tag: 'div',
									class: 'addressLookupGrid',
									name: 'addressLookupGrid',
									class: 'max-height-300 scroll-y',
									data: {
										role: 'grid',
										bind: {
											source: {
												type: 'method',
												config: {
													transport: {
														read: {
															// TODO: these should be configured
															url:'Insured.aspx/GetAddress',
															type: 'POST',
															data: function () {
																var lookupPostalCode = $("#lookupPostalCode").val();
																
																return {
																	lookupPostalCode: lookupPostalCode
																};
															},
															dataType: 'json',
															contentType: 'application/json'
														}
													},
													schema: {
														data: function (data) {
															return data.d;
														},
														total: function (data) {
															return data.d.length;
														}
													},
													pageSize: 10
												}
											}
										},
										autoBind: false, 
										filterable: true,
										sortable: true,
										scrollable: true,
										pageable: {
											pageSize: 10, 
											pageSizes: [ 10 , 25, 50 ]
										},
										selectable: true, 
										columns: [
											{
												field: 'MinStreetNum',
												title: 'Min Street #'
											},
											{
												field: 'MaxStreetNum',
												title: 'Max Street #'
											},
											{
												field: 'StreetName',
												title: 'Street Name'
											},
											{
												field: 'StreetType',
												title: 'Street Type'
											},
											{
												field: 'City',
												title: 'City'
											},
											{
												field: 'Jurisdiction'
											},
											{
												field: 'PostalCode',
												title: 'Postal Code'
											},
											{
												field: 'Direction'
											}
										]
									}
								}
							]
						},
						{
							tag: 'div',
							class: 'kpaf-row',
							fields: [
								{
									class: 'addressLookupSelect',
									name: 'addressLookupSelect',
									tag: 'button',
									type: 'button',
									label: '\u00a0',
									text: 'Select',
									class: 'k-button right',
									data: {
										role: 'button',
										bind: {
											events: {
												click: function (e) {
													var addressLookupGrid = $("#addressLookupGrid").data("kendoGrid"),
														selectedItem = addressLookupGrid.dataItem(addressLookupGrid.select()),
														viewModel = this,
														fields = {
															// Civic address fields
															civic: {
																suiteNumber: $.trim(viewModel.get('address.suiteNumber')),
																streetNumber: $.trim(viewModel.get('address.streetNumber')),
																streetName: $.trim(viewModel.get('address.streetName')),
																streetType: $.trim(viewModel.get('address.streetType')),
																streetDirection: $.trim(viewModel.get('address.streetDirection')),
																poBox: (viewModel.get('address.poBox')) ? 'PO BOX ' + $.trim(viewModel.get('address.poBox')) : ''
															},
															// Rural address fields
															rural: {
																rr: (viewModel.get('address.rr')) ? 'RR ' + $.trim(viewModel.get('address.rr')) : '',
																site: (viewModel.get('address.site')) ? 'SITE ' + $.trim(viewModel.get('address.site')) : '',
																comp: (viewModel.get('address.comp')) ? 'COMP ' + $.trim(viewModel.get('address.comp')) : '',
																box: (viewModel.get('address.box')) ? 'BOX ' + $.trim(viewModel.get('address.box')) : '',
																lotNumber: (viewModel.get('address.lotNumber')) ? 'LOT ' + $.trim(viewModel.get('address.lotNumber')) : '',
																concessionNumber: (viewModel.get('address.concessionNumber')) ? 'CONCESSION ' + $.trim(viewModel.get('address.concessionNumber')) : ''
															},
															common: {
																station: (viewModel.get('address.station')) ? 'STN ' + $.trim(viewModel.get('address.station')) : '',
																city: $.trim(viewModel.get('address.city')),
																zone: $.trim(viewModel.get('address.zone')),
																postcode: $.trim(viewModel.get('address.postcode')),
																country: $.trim(viewModel.get('address.country'))
															}
														};
														
													if (selectedItem !== null) {
														// Clear the address fields
														$.each(fields, function (key, value) {
															$.each(fields[key], function (key, value) {
																viewModel.set(key, ''); 
															});
														});

														viewModel.set('address.streetName', selectedItem.StreetName);
														viewModel.set('address.streetType', selectedItem.StreetType);
														viewModel.set('address.streetDirection', selectedItem.Direction);
														viewModel.set('address.city', selectedItem.City);
														viewModel.set('address.zone', selectedItem.Jurisdiction);
														viewModel.set('address.postcode', selectedItem.PostalCode);
														viewModel.set('address.country', "CANADA");
														
														// Clear the street number
														viewModel.set('address.streetNumber', '');
														
														$("div#addressLookupPopup").data("kendoWindow").close();
														$("div#addressEditPopup").data("kendoWindow").open();
													}
												}
											}
										}
									}
								}
							]
						}
					]
				}
				// END ADDRESS
			]	
		}
	}
});