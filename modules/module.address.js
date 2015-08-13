define({
	name: 'address',
	id: 'address', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: false,
	events: {
		pageLoaded: function (e) {
			var	that = this,
				page = App.getCurrent(),
				eventHandler = that.getEventHandler();
			
			console.log('dispatching address "rendered" event');
			eventHandler.dispatch('rendered');
		},
		rendered: function (e) {
			this.render();
			$('#' + this.getId()).replaceWith(this.html());
			
			// TODO: This is temporary until I figure out a more permanent solution
			if ((this._viewModel instanceof kendo.data.ObservableObject) === false) {
				this._viewModel = new kendo.data.ObservableObject();
			}
			
			console.log('rendering address module [' + this._id + ']');
			var	that = this,
				page = App.getCurrent(),
				block = page.getBlock('center-pane'),
				//viewModel = block.getViewModel()
				viewModel = this.getViewModel(),
				data = page.getFormData(),
				addressEventHandler = that.getEventHandler(),
                addressViewModel = viewModel,
				addressValidator = block.getValidator(),
				sources = {},
				tabs,
				tab,
				fields = {},
				address = [],
				addressString = [],
				current;
			
			// Window widgets append themselves by default to 
			// <body>, even if the appendTo parameter has been
			// specified - Kendo FAIL
			
			// Bind popups
			kendo.bind($('#addressEditPopup'), addressViewModel);
			kendo.bind($('#addressLookupPopup'), addressViewModel);
			
			// Bind triggers
			kendo.bind($('#addressEditTrigger'), addressViewModel);
			kendo.bind($('#addressLookupTrigger'), addressViewModel);
			
			// Bind preview
			kendo.bind($('#addressDisplay'), addressViewModel);
			
			// Set values to view-model
			for (prop in data) {
				if (addressViewModel.hasOwnProperty(prop)) {
					value = data[prop] || '';
					
					console.log('setting prop: ' + prop + ' | value: ' + value);
					addressViewModel.set(prop, value);
				}
			}
			
			$('#overrideAddress').click(function (e) {
				var behavior = App.Widgets.Behaviors.OnCheckedEnableWidget(e, {
					target: [
						$('#addressEditTrigger').data('kendoButton'), 
						$('#addressLookupTrigger').data('kendoButton')
					]
				});
				
				behavior.execute();
				
				behavior = App.Behaviors.OnCheckedDisplayFieldGroup(e, {
					target: $('#overrideAddressReason, #addressReviewDate')
				});
				
				behavior.execute();
			});
			
			tabs = $('#address-tabs').data('kendoSemanticTabStrip');
			tab = tabs.select();
			
			try {
				fields = {
					// Civic address fields
					civic: {
						suiteNumber: $.trim(addressViewModel.get('Addresses[0].suiteNumber')),
						streetNumber: $.trim(addressViewModel.get('Addresses[0].streetNumber')),
						streetName: $.trim(addressViewModel.get('Addresses[0].streetName')),
						streetType: $.trim(addressViewModel.get('Addresses[0].streetType')),
						streetDirection: $.trim(addressViewModel.get('Addresses[0].streetDirection')),
						poBox: (addressViewModel.get('Addresses[0].poBox')) ? 'PO BOX ' + $.trim(addressViewModel.get('Addresses[0].poBox')) : ''
						
					},
					// Rural address fields
					rural: {
						rr: (addressViewModel.get('Addresses[0].rr')) ? 'RR ' + $.trim(addressViewModel.get('Addresses[0].rr')) : '',
						site: (addressViewModel.get('Addresses[0].site')) ? 'SITE ' + $.trim(addressViewModel.get('Addresses[0].site')) : '',
						comp: (addressViewModel.get('Addresses[0].comp')) ? 'COMP ' + $.trim(addressViewModel.get('Addresses[0].comp')) : '',
						box: (addressViewModel.get('Addresses[0].box')) ? 'BOX ' + $.trim(addressViewModel.get('Addresses[0].box')) : '',
						lotNumber: (addressViewModel.get('Addresses[0].lotNumber')) ? 'LOT ' + $.trim(addressViewModel.get('Addresses[0].lotNumber')) : '',
						concessionNumber: (addressViewModel.get('Addresses[0].concessionNumber')) ? 'CONCESSION ' + $.trim(addressViewModel.get('Addresses[0].concessionNumber')) : ''
					},
					common: {
						station: (addressViewModel.get('Addresses[0].station')) ? 'STN ' + $.trim(addressViewModel.get('Addresses[0].station')) : '',
						city: $.trim(addressViewModel.get('Addresses[0].city')),
						province: $.trim(addressViewModel.get('Addresses[0].province')),
						postalCode: $.trim(addressViewModel.get('Addresses[0].postalCode'))
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
			
			// Append city/municipality, province and postal code
			address.push('{city} {province} {postalCode}');
			
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
			
			$('#addressDisplay').attr('readonly', false).val(addressString).attr('readonly', true);
			$('div#addressEditPopup').data('kendoWindow').close();
			// Create hidden fields in the parent form (if it exists)
			
			try {
				this.dataBind(addressViewModel);
			} catch (e) {
				App.log(e);
			}
		},
		initialized: function () {
			// Do something
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
								bind: 'Addresses[0].suiteNumber'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'streetNumber_hidden',
							name: 'streetNumber',
							data: {
								bind: 'Addresses[0].streetNumber'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'streetName_hidden',
							name: 'streetName',
							data: {
								bind: 'Addresses[0].streetName'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'streetType_hidden',
							name: 'streetType',
							data: {
								bind: 'Addresses[0].streetType'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'streetDirection_hidden',
							name: 'streetDirection',
							data: {
								bind: 'Addresses[0].streetDirection'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'poBox_hidden',
							name: 'poBox',
							data: {
								bind: 'Addresses[0].poBox'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'rr_hidden',
							name: 'rr',
							data: {
								bind: 'Addresses[0].rr'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'site_hidden',
							name: 'site',
							data: {
								bind: 'Addresses[0].site'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'comp_hidden',
							name: 'comp',
							data: {
								bind: 'Addresses[0].comp'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'box_hidden',
							name: 'box',
							data: {
								bind: 'Addresses[0].box'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'lotNumber_hidden',
							name: 'lotNumber',
							data: {
								bind: 'Addresses[0].lotNumber'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'concessionNumber_hidden',
							name: 'concessionNumber',
							data: {
								bind: 'Addresses[0].concessionNumber'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'station_hidden',
							name: 'station',
							data: {
								bind: 'Addresses[0].station'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'city_hidden',
							name: 'city',
							data: {
								bind: 'Addresses[0].city'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'province_hidden',
							name: 'province',
							data: {
								bind: 'Addresses[0].province'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'country_hidden',
							name: 'country',
							data: {
								bind: 'Addresses[0].country'
							}
						},
						{
							tag: 'input',
							type: 'hidden',
							id: 'postalCode_hidden',
							name: 'postalCode',
							data: {
								bind: 'Addresses[0].postalCode'
							}
						}
					],
					fieldgroups: [
						{
							tag: 'div',
							class: 'fieldgroup',
							group: [{
								id: 'addressDisplay',
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
									id: 'addressLookupTrigger',
									name: 'addressLookupTrigger',
									tag: 'button',
									type: 'button',
									label: '\u00a0',
									text: 'Search for an Address',
									class: 'k-button',
									data: {
										role: 'button',
										bind: {
											events: {
												click: function (e) {
													$('#addressLookupPopup').data('kendoWindow').center().open();
												}
											}
										}
									}
								},
								{
									id: 'addressEditTrigger',
									name: 'addressEditTrigger',
									tag: 'button',
									type: 'button',
									label: '\u00a0',
									text: 'Edit Current Address',
									class: 'k-button',
									data: {
										role: 'button',
										bind: {
											events: {
												click: function (e) {
													$('#addressEditPopup').data('kendoWindow').center().open();
												}
											}
										}
									}
								}
							]
						},
						{
							tag: 'div',
							class: 'fieldgroup',
							group: [
								{
									id: 'overrideAddress',
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
					id: 'addressEditPopup',
					name: 'addressEditPopup',
					data: {
						role: 'window',
						appendTo: 'form',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Edit Current Address',
						width: 785,
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
							id: 'address-tabs',
							name: 'address-tabs',
							class: 'content-box-only',
							data: {
								role: 'semantictabstrip',
								animation: false
							},
							tabs: ['Enter Civic', 'Enter Rural'],
							fieldsets: [
								{
									tag: 'fieldset',
									id: 'address-civic',
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
														class: 'tiny',
														data: {
															bind: {
																value: 'Addresses[0].suiteNumber',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			suiteNumber = viewModel.get('Addresses[0].suiteNumber');

																		if (suiteNumber) {
																			viewModel.set('Addresses[0].suiteNumber', suiteNumber.toUpperCase());
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
														class: 'small',
														data: {
															bind: {
																value: 'Addresses[0].streetNumber',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			streetNumber = viewModel.get('Addresses[0].streetNumber');
																			
																		if (streetNumber) {
																			viewModel.set('Addresses[0].streetNumber', streetNumber.toUpperCase());
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
														class: 'medium',
														data: {
															bind: {
																value: 'Addresses[0].streetName',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			streetName = viewModel.get('Addresses[0].streetName');
																		
																		if (streetName)  {
																			viewModel.set('Addresses[0].streetName', streetName.toUpperCase());
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
														class: 'small',
														data: {
															bind: {
																value: 'Addresses[0].streetType',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			streetType = viewModel.get('Addresses[0].streetType');
																		
																		if (streetType) {
																			viewModel.set('Addresses[0].streetType', streetType.toUpperCase());
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
																value: 'Addresses[0].streetDirection',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			streetDirection = viewModel.get('Addresses[0].streetDirection') != null ? viewModel.get('Addresses[0].streetDirection').Value.toUpperCase() : "";
																			
																		viewModel.set('Addresses[0].streetDirection', streetDirection);
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
														class: 'small',
														data: {
															bind: {
																value: 'Addresses[0].poBox',
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
									id: 'address-rural',
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
														class: 'small',
														data: {
															bind: {
																value: 'Addresses[0].rr',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			rr = viewModel.get('Addresses[0].rr');
																		
																		if (rr) {
																			viewModel.set('Addresses[0].rr', rr.toUpperCase());
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
														class: 'small',
														data: {
															bind: {
																value: 'Addresses[0].site',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			site = viewModel.get('Addresses[0].site');
																		
																		if (site) {
																			viewModel.set('Addresses[0].site', site.toUpperCase());
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
														class: 'small',
														data: {
															bind: {
																value: 'Addresses[0].comp',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			comp = viewModel.get('Addresses[0].comp');
																		
																		if (comp) {
																			viewModel.set('Addresses[0].comp', comp.toUpperCase());
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
														class: 'small',
														data: {
															bind: {
																value: 'Addresses[0].box',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			box = viewModel.get('Addresses[0].box');
																		
																		if (box) {
																			viewModel.set('Addresses[0].box', box.toUpperCase());
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
														class: 'small',
														data: {
															bind: {
																value: 'Addresses[0].lotNumber',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			lotNumber = viewModel.get('Addresses[0].lotNumber');
																		
																		if (lotNumber) {
																			viewModel.set('Addresses[0].lotNumber', lotNumber.toUpperCase());
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
														class: 'small',
														data: {
															bind: {
																value: 'Addresses[0].concessionNumber',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			concessionNumber = viewModel.get('Addresses[0].concessionNumber');
																		
																		if (concessionNumber) {
																			viewModel.set('Addresses[0].concessionNumber', concessionNumber.toUpperCase());
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
										class: 'small',
										data: {
											bind: {
												value: 'Addresses[0].station',
												events: {
													change: function (e) {
														var viewModel = this,
															station = viewModel.get('Addresses[0].station');
														
														if (station) {
															viewModel.set('Addresses[0].station', station.toUpperCase());
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
										class: 'medium',
										data: {
											bind: {
												value: 'Addresses[0].city',
												events: {
													change: function (e) {
														var viewModel = this,
															city = viewModel.get('Addresses[0].city');
														
														if (city) {
															viewModel.set('Addresses[0].city', city.toUpperCase());
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
										id: 'province',
										name: 'province_form',
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
												value: 'Addresses[0].province',
												events: {
													change: function (e) {
														var viewModel = this,
															province = viewModel.get('Addresses[0].province') !== null ? viewModel.get('Addresses[0].province').Value.toUpperCase() : '';
															
														viewModel.set('Addresses[0].province', province);
														$('#province_hidden').val(province);
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
										id: 'postalCode',
										name: 'postalCode_form',
										label: 'Postal Code',
										tag: 'input',
										type: 'text',
										class: 'small',
										data: {
											bind: {
												value: 'Addresses[0].postalCode',
												events: {
													change: function (e) {
														var viewModel = this,
															postalCode = viewModel.get('Addresses[0].postalCode');
															
														if (postalCode)  {
															viewModel.set('Addresses[0].postalCode', postalCode.toUpperCase());
															$('#postalCode_hidden').val(postalCode.toUpperCase());
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
												value: 'Addresses[0].country',
												events: {
													change: function (e) {
														var viewModel = this,
															country = viewModel.get('Addresses[0].country') !== null ? viewModel.get('Addresses[0].country').toUpperCase() : '',
															dataSource;
															
														viewModel.set('Addresses[0].country', country);
														$('#country_hidden').val(country);

														var dropdownlist = $('#province').data('kendoDropDownList'),
															dataItem = e.sender.dataItem();
														
														var dataSource;
														
														if (dataItem.Key == 'USA') { 
															$('label[for=province]').html('State');
															$('label[for=postalCode]').html('Zip Code');

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
															$('label[for=province]').html('Province');
															$('label[for=postalCode]').html('Postal Code');

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
									id: 'addressEditSelect',
									name: 'addressEditSelect',
									tag: 'button',
									type: 'button',
									label: '\u00a0',
									text: 'Update Current Address',
									class: 'k-button right',
									data: {
										role: 'button',
										bind: {
											events: {
												click: function (e) {
													var viewModel = this,
														widget = $('#address-tabs').data('kendoSemanticTabStrip'),
														tab = widget.select(),
														fields = {
															// Civic address fields
															civic: {
																suiteNumber: $.trim(viewModel.get('Addresses[0].suiteNumber')),
																streetNumber: $.trim(viewModel.get('Addresses[0].streetNumber')),
																streetName: $.trim(viewModel.get('Addresses[0].streetName')),
																streetType: $.trim(viewModel.get('Addresses[0].streetType')),
																streetDirection: $.trim(viewModel.get('Addresses[0].streetDirection')),
																poBox: (viewModel.get('Addresses[0].poBox')) ? 'PO BOX ' + $.trim(viewModel.get('Addresses[0].poBox')) : ''
																
															},
															// Rural address fields
															rural: {
																rr: (viewModel.get('Addresses[0].rr')) ? 'RR ' + $.trim(viewModel.get('Addresses[0].rr')) : '',
																site: (viewModel.get('Addresses[0].site')) ? 'SITE ' + $.trim(viewModel.get('Addresses[0].site')) : '',
																comp: (viewModel.get('Addresses[0].comp')) ? 'COMP ' + $.trim(viewModel.get('Addresses[0].comp')) : '',
																box: (viewModel.get('Addresses[0].box')) ? 'BOX ' + $.trim(viewModel.get('Addresses[0].box')) : '',
																lotNumber: (viewModel.get('Addresses[0].lotNumber')) ? 'LOT ' + $.trim(viewModel.get('Addresses[0].lotNumber')) : '',
																concessionNumber: (viewModel.get('Addresses[0].concessionNumber')) ? 'CONCESSION ' + $.trim(viewModel.get('Addresses[0].concessionNumber')) : ''
															},
															common: {
																station: (viewModel.get('Addresses[0].station')) ? 'STN ' + $.trim(viewModel.get('Addresses[0].station')) : '',
																city: $.trim(viewModel.get('Addresses[0].city')),
																province: $.trim(viewModel.get('Addresses[0].province')),
																postalCode: $.trim(viewModel.get('Addresses[0].postalCode')),
																country: $.trim(viewModel.get('Addresses[0].country'))
															}
														},
														address = [],
														addressString = [],
														current;
													
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
													
													// Append city/municipality, province and postal code
													address.push('{city} {province} {postalCode}');

													if(fields.common.country == "USA") {
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
													
													$('#addressDisplay').attr('readonly', false).val(addressString).attr('readonly', true);
													$('div#addressEditPopup').data('kendoWindow').close();
												}
											}
										}
									}
								}
							]
						}
					]
				},
				{
					tag: 'div',
					id: 'addressLookupPopup',
					name: 'addressLookupPopup',
					data: {
						role: 'window',
						appendTo: 'form',
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
										id: 'lookupPostalCode',
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
										id: 'addressLookupSearch',
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
									id: 'addressLookupGrid',
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
									id: 'addressLookupSelect',
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
																suiteNumber: $.trim(viewModel.get('Addresses[0].suiteNumber')),
																streetNumber: $.trim(viewModel.get('Addresses[0].streetNumber')),
																streetName: $.trim(viewModel.get('Addresses[0].streetName')),
																streetType: $.trim(viewModel.get('Addresses[0].streetType')),
																streetDirection: $.trim(viewModel.get('Addresses[0].streetDirection')),
																poBox: (viewModel.get('Addresses[0].poBox')) ? 'PO BOX ' + $.trim(viewModel.get('Addresses[0].poBox')) : ''
															},
															// Rural address fields
															rural: {
																rr: (viewModel.get('Addresses[0].rr')) ? 'RR ' + $.trim(viewModel.get('Addresses[0].rr')) : '',
																site: (viewModel.get('Addresses[0].site')) ? 'SITE ' + $.trim(viewModel.get('Addresses[0].site')) : '',
																comp: (viewModel.get('Addresses[0].comp')) ? 'COMP ' + $.trim(viewModel.get('Addresses[0].comp')) : '',
																box: (viewModel.get('Addresses[0].box')) ? 'BOX ' + $.trim(viewModel.get('Addresses[0].box')) : '',
																lotNumber: (viewModel.get('Addresses[0].lotNumber')) ? 'LOT ' + $.trim(viewModel.get('Addresses[0].lotNumber')) : '',
																concessionNumber: (viewModel.get('Addresses[0].concessionNumber')) ? 'CONCESSION ' + $.trim(viewModel.get('Addresses[0].concessionNumber')) : ''
															},
															common: {
																station: (viewModel.get('Addresses[0].station')) ? 'STN ' + $.trim(viewModel.get('Addresses[0].station')) : '',
																city: $.trim(viewModel.get('Addresses[0].city')),
																province: $.trim(viewModel.get('Addresses[0].province')),
																postalCode: $.trim(viewModel.get('Addresses[0].postalCode')),
																country: $.trim(viewModel.get('Addresses[0].country'))
															}
														};
														
													if (selectedItem !== null) {
														// Clear the address fields
														$.each(fields, function (key, value) {
															$.each(fields[key], function (key, value) {
																viewModel.set(key, ''); 
															});
														});

														viewModel.set('Addresses[0].streetName', selectedItem.StreetName);
														viewModel.set('Addresses[0].streetType', selectedItem.StreetType);
														viewModel.set('Addresses[0].streetDirection', selectedItem.Direction);
														viewModel.set('Addresses[0].city', selectedItem.City);
														viewModel.set('Addresses[0].province', selectedItem.Jurisdiction);
														viewModel.set('Addresses[0].postalCode', selectedItem.PostalCode);
														viewModel.set('Addresses[0].country', "CANADA");
														
														// Clear the street number
														viewModel.set('Addresses[0].streetNumber', '');
														
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