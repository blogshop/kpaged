define({
	name: 'autoplus',
	id: 'autoplus', // This can be improved... the double ID reference isn't the greatest
	events: {
		// TODO: This should be registered as a default event handler for all pages
		// For now, include this function in all page scripts
		pageLoaded: function (e) {
			var	that = this,
				page = App.getCurrent(),
				viewModel = page.getBlock('center-pane').getViewModel(),
				
				autoplusEventHandler = that.getEventHandler(),
                autoplusViewModel = that.getViewModel(),
				autoplusValidator = that.getValidator(),
				sources = {},
				xmlData,
				entities = ['insureds', 'drivers', 'vehicles', 'claims', 'journals'],
                widgetTypes = App.Config.Widgets.defaults(),
                widgets,
				autoplusPoliciesGrid = $('#autoplusPoliciesGrid').data('kendoGrid'),
				autoplusPolicyClaimsGrid = $('#autoplusPolicyClaimsGrid').data('kendoGrid'),
				autoplusPolicyDriversGrid = $('#autoplusDriversGrid').data('kendoGrid'),
				autoplusPolicyVehiclesGrid = $('#autoplusVehiclesGrid').data('kendoGrid'),
                autoplusClaimSummaryGrid = $('#autoplusClaimSummaryGrid').data('kendoGrid'),
				autoplusPolicyClaimLossesGrid,
				autoplusPolicyClaimDriversGrid,
				autoplusPolicyClaimThirdPartyDriversGrid,
				autoplusPolicyClaimVehiclesGrid,
				policiesSource,
				policyClaimsSource,
				policyDriversSource,
				policyVehiclesSource,
                claimSummarySource,
				summaryInfoSource,
				selectedClaims,
				selectedPolicies;
			
			// TODO: Remove this once AutoPlus is ready for production
			// For now, we want to hide the AutoPlus button in production mode!
			if (window.environment === 'prod') {
				$('#toolbar-button-autoplus').hide();
			}
				
			// Window widgets append themselves by default to 
			// <body>, even if the appendTo parameter has been
			// specified - Kendo FAIL
			kendo.bind($('#autoplus'), autoplusViewModel);
			
			// Trigger pageLoaded event on widgets
			$.each(widgetTypes, function (widgetRole, widgetConfig) {
				if (widgetConfig.hasOwnProperty('type')) {
					widgets = $('.k-widget').find('[data-role=' + widgetRole + ']');
					
					if (widgets) {
						widgets.each(function (idx, widget) {
							$(widget).data(widgetConfig.type).trigger('pageLoaded');
						});
					}
				}
			});
			
			// Policy claims
			var policyClaimsDetailInit = function (e) {
				var policyClaimsDetailRow = e.detailRow;

				policyClaimsDetailRow.find('#autoplusPolicyClaimsTabs').kendoTabStrip({
					animation: false
				});
				
				policyClaimsDetailRow.find('#autoplusThirdPartyClaimsTabs').kendoTabStrip({
					animation: false
				});

				policyClaimsDetailRow.find('.autoplusPolicyClaimDriversGrid').each(function (idx) {
					$(this).kendoGrid({
						dataSource: {
							transport: {
								read: function (e) {
									e.success(xmlData);
								}
							},
							schema: {
								type: 'xml',
								data: '/DriverClaimHistoryGoldDS/PolicyClaimFirstPartyAccidentDriverDT',
								model: { // define the model of the data source. Required for validation and property types.
									fields: {
										claimID: 'ClaimId/text()',
										policyDriverID: 'PolicyDriverId/text()',
										companyCode: 'CompanyCode/text()',
										policyNumber: 'PolicyNumber/text()',
										//deletedInd: 'DeletedInd/text()',
										//licenceNumberStatus: 'LicenceNumberStatus/text()',
										driverRelationshipCode: 'DriverRelationshipCode/text()', // SHOW IN GRID
										principalOperatorInd: 'PrincipalOperatorInd/text()', // SHOW IN GRID
										policyVehicleID: 'PolicyVehicleId/text()',
										//licenceProvinceCode: 'LicenceProvinceCode/text()',
										//licenceNumber: 'LicenceNumber/text()',
										//yearsLicenced: 'YearsLicenced/text()',
										//yearsLicencedExp: 'YearsLicencedExp/text()',
										//driverTrainingInd: 'DriverTrainingInd/text()',
										firstName: 'FirstName/text()',  // SHOW IN GRID
										middleName: 'MiddleName/text()',  // SHOW IN GRID
										lastName: 'LastName/text()',  // SHOW IN GRID
										//unstructuredName: 'UnstructuredName/text()',
										//structuredNameInd: 'StructuredNameInd/text()',
										//companyInd: 'CompanyInd/text()',
										//birthYear: 'BirthYear/text()',
										//birthMonth: 'BirthMonth/text()',
										//birthDay: 'BirthDay/text()',
										//gender: 'Gender/text()',
										//nameAvailableInd: 'NameAvailableInd/text()',
										atFaultInd: 'AtFaultInd/text()', // SHOW IN GRID
										atFaultPct: 'AtFaultPct/text()', // SHOW IN GRID
										//policyDriverClaimCode: 'PolicyDriverClaimCode/text()',
										//lastUpdateDate: 'LastUpdateDate/text()'
									}
								}
							},
							filter: { field: 'claimID', operator: 'eq', value: e.data.claimID }
						},
						autoBind: false,
						scrollable: false,
						sortable: true,
						pageable: false,
						columns: [
							{
								field: 'firstName',
								title: 'First Name'
							},
							{
								field: 'middleName',
								title: 'Middle Name'
							},
							{
								field: 'lastName',
								title: 'Last Name'
							},
							{
								field: 'principalOperatorInd',
								title: 'Principal Operator'
							},
							/*{
								field: 'atFaultInd',
								title: 'At Fault'
							},*/
							{
								field: 'atFaultPct',
								title: 'At Fault %'
							}
						]
					});
				});
				
				policyClaimsDetailRow.find('.autoplusPolicyClaimVehiclesGrid').each(function (idx) {
					$(this).kendoGrid({
						dataSource: {
							transport: {
								read: function (e) {
									e.success(xmlData);
								}
							},
							schema: {
								type: 'xml',
								data: '/DriverClaimHistoryGoldDS/PolicyClaimVehicleDT',
								model: { // define the model of the data source. Required for validation and property types.
									fields: {
										claimID: 'ClaimId/text()',
										policyVehicleID: 'PolicyVehicleId/text()',
										companyCode: 'CompanyCode/text()',
										policyNumber: 'PolicyNumber/text()',
										vin: 'VIN/text()',
										vinStatus: 'VINStatus/text()',
										vehicleType: 'VehicleType/text()',
										vehicleCode: 'VehicleCode/text()',
										bodyTypeCode: 'BodyTypeCode/text()',
										driveTypeCode: 'DriveTypeCode/text()',
										carCode: 'CarCode/text()',
										modelYear: 'ModelYear/text()',
										makeEng: 'MakeEng/text()',
										//makeFre: 'MakeFre/text()',
										modelEng: 'ModelEng/text()',
										//modelFre: 'ModelFre/text()',
										vehicleDescEng: 'VehicleDescEng/text()',
										//vehicleDescFre: 'VehicleDescFre/text()',
										vehicleDescInd: 'VehicleDescInd/text()',
										vehicleFixableInd: 'VehicleFixableInd/text()',
										classTypeOfUseCode: 'ClassTypeOfUseCode/text()',
										useCode: 'UseCode/text()'
									}
								}
							},
							filter: { field: 'claimID', operator: 'eq', value: e.data.claimID }
						},
						autoBind: false,
						scrollable: false,
						sortable: true,
						pageable: false,
						columns: [
							{
								field: null,
								title: 'Vehicle',
								template: '# var vehicle = [modelYear, makeEng, modelEng].join(" "); # #= vehicle #'
							},/*
							{
								field: 'carCode',
								title: 'Car Code',
								width: '100px'
							},*/
							{
								field: 'vin',
								title: 'VIN',
								width: '180px'
							}
						]
					});
				});

				policyClaimsDetailRow.find('.autoplusPolicyClaimThirdPartyDriversGrid').each(function (idx) {
					$(this).kendoGrid({
						dataSource: {
							transport: {
								read: function (e) {
									e.success(xmlData);
								}
							},
							schema: {
								type: 'xml',
								data: '/DriverClaimHistoryGoldDS/PolicyClaimThirdPartyAccidentDriverDT',
								model: { // define the model of the data source. Required for validation and property types.
									fields: {
										claimID: 'ClaimId/text()',
										policyDriverID: 'PolicyDriverId/text()',
										companyCode: 'CompanyCode/text()',
										policyNumber: 'PolicyNumber/text()',
										//deletedInd: 'DeletedInd/text()',
										//licenceNumberStatus: 'LicenceNumberStatus/text()',
										driverRelationshipCode: 'DriverRelationshipCode/text()', // SHOW IN GRID
										principalOperatorInd: 'PrincipalOperatorInd/text()', // SHOW IN GRID
										policyVehicleID: 'PolicyVehicleId/text()',
										//licenceProvinceCode: 'LicenceProvinceCode/text()',
										//licenceNumber: 'LicenceNumber/text()',
										//yearsLicenced: 'YearsLicenced/text()',
										//yearsLicencedExp: 'YearsLicencedExp/text()',
										//driverTrainingInd: 'DriverTrainingInd/text()',
										firstName: 'FirstName/text()',  // SHOW IN GRID
										middleName: 'MiddleName/text()',  // SHOW IN GRID
										lastName: 'LastName/text()',  // SHOW IN GRID
										//unstructuredName: 'UnstructuredName/text()',
										//structuredNameInd: 'StructuredNameInd/text()',
										//companyInd: 'CompanyInd/text()',
										//birthYear: 'BirthYear/text()',
										//birthMonth: 'BirthMonth/text()',
										//birthDay: 'BirthDay/text()',
										//gender: 'Gender/text()',
										//nameAvailableInd: 'NameAvailableInd/text()',
										atFaultInd: 'AtFaultInd/text()', // SHOW IN GRID
										atFaultPct: 'AtFaultPct/text()', // SHOW IN GRID
										//policyDriverClaimCode: 'PolicyDriverClaimCode/text()',
										//lastUpdateDate: 'LastUpdateDate/text()'
									}
								}
							},
							filter: { field: 'claimID', operator: 'eq', value: e.data.claimID }
						},
						autoBind: false,
						scrollable: false,
						sortable: true,
						pageable: false,
						columns: [
							{
								field: 'firstName',
								title: 'First Name'
							},
							{
								field: 'middleName',
								title: 'Middle Name'
							},
							{
								field: 'lastName',
								title: 'Last Name'
							},
							{
								field: 'principalOperatorInd',
								title: 'Principal Operator'
							},
							/*{
								field: 'atFaultInd',
								title: 'At Fault'
							},*/
							{
								field: 'atFaultPct',
								title: 'At Fault %'
							}
						]
					});
				});
				
				policyClaimsDetailRow.find('.autoplusPolicyClaimLossesGrid').each(function (idx) {
					$(this).kendoGrid({
						dataSource: {
							transport: {
								read: function (e) {
									e.success(xmlData);
								}
							},
							schema: {
								type: 'xml',
								data: '/DriverClaimHistoryGoldDS/PolicyClaimKindOfLossDT',
								model: { // define the model of the data source. Required for validation and property types.
									fields: {
										claimID: 'ClaimId/text()',
										kindOfLossCode: 'KindOfLossCode/text()',
										//kindOfLossCodeExp: 'KindOfLossCode/text()',
										vehicleLossCode: 'VehicleLossCode/text()',
										lossAmtTotal: 'LossAmtTotal/text()',
										lastUpdateDate: 'LastUpdateDate/text()'
									}
								}
							},
							filter: { field: 'claimID', operator: 'eq', value: e.data.claimID }
						},
						autoBind: false,
						scrollable: false,
						sortable: true,
						pageable: false,
						columns: [
							{
								field: 'kindOfLossCode',
								title: 'Type/Code'
							},
							{
								field: 'lossAmtTotal',
								title: 'Paid'
							},
							{
								field: 'vehicleLossCode',
								title: 'Loss'
							},
							/*{
								field: 'lastUpdateDate',
								title: 'Last Updated'
							}*/
						]
					});
				});
				
				/*policyClaimsDetailRow.find('#autoplusThirdPartyClaimVehiclesGrid').each(function (idx) {
					$(this).kendoGrid({
						dataSource: {
							transport: {
								read: function (e) {
									e.success(xmlData);
								},
								parameterMap: function (data, type) {
									if (type == 'read') {
										return 'id=' + 1;
									}
								}
							},
							schema: {
								type: 'xml',
								data: '/DriverClaimHistoryGoldDS/ThirdPartyClaimVehicleDT',
								model: { // define the model of the data source. Required for validation and property types.
									fields: {
										claimID: 'ClaimId/text()',
										policyVehicleID: 'PolicyVehicleId/text()',
										companyCode: 'CompanyCode/text()',
										policyNumber: 'PolicyNumber/text()',
										vin: 'VIN/text()',
										vinStatus: 'VINStatus/text()',
										vehicleType: 'VehicleType/text()',
										vehicleCode: 'VehicleCode/text()',
										bodyTypeCode: 'BodyTypeCode/text()',
										driveTypeCode: 'DriveTypeCode/text()',
										carCode: 'CarCode/text()',
										modelYear: 'ModelYear/text()',
										makeEng: 'MakeEng/text()',
										//makeFre: 'MakeFre/text()',
										modelEng: 'ModelEng/text()',
										//modelFre: 'ModelFre/text()',
										vehicleDescEng: 'VehicleDescEng/text()',
										//vehicleDescFre: 'VehicleDescFre/text()',
										vehicleDescInd: 'VehicleDescInd/text()',
										vehicleFixableInd: 'VehicleFixableInd/text()',
										classTypeOfUseCode: 'ClassTypeOfUseCode/text()',
										useCode: 'UseCode/text()'
									}
								}
							}	
						},
						scrollable: false,
						sortable: true,
						pageable: false,
						columns: [
							{
								field: null,
								title: 'Vehicle',
								template: '# var vehicle = [modelYear, makeEng, modelEng].join(" "); # #= vehicle #'
							},
							{
								field: 'carCode',
								title: 'Car Code',
								width: '100px'
							},
							{
								field: 'vin',
								title: 'VIN',
								width: '180px'
							}
						]
					});
				});*/
				
				var grids = {},
					grid;
				
				grids.autoplusPolicyClaimLossesGrids = $('.autoplusPolicyClaimLossesGrid');
				grids.autoplusPolicyClaimDriversGrids = $('.autoplusPolicyClaimDriversGrid');
				grids.autoplusPolicyClaimThirdPartyDriversGrids = $('.autoplusPolicyClaimThirdPartyDriversGrid');
				grids.autoplusPolicyClaimVehiclesGrids = $('.autoplusPolicyClaimVehiclesGrid');
				
				$.each(grids, function (idx, collection) {
					collection.each(function () {
						grid = $(this).data('kendoGrid');
						if (grid && (typeof grid.dataSource !== 'undefined')) {
							$(this).data('kendoGrid').dataSource.read();
						}
					});
				});
			};
			
			// TODO: Something is wrong with the Kendo Grid hierarchy rendering...
			// For now, just add the missing columns/cells
			var grids = $('#autoplusPolicyClaimsGrid'),
				grid;
			
			$.each(grids, function (idx, el) {
				grid = $(el);
				
				grid.find('.k-grid-header colgroup, .k-grid-content colgroup').prepend('<col class="k-hierarchy-col">');
				grid.find('.k-grid-header thead tr').first().prepend('<th class="k-hierarchy-cell k-header"></th>');
				grid.find('.k-grid-content tbody tr.k-master-row').prepend('<th class="k-hierarchy-cell"></th>');
			});
			
			var autoplusPolicyClaimsDetail = $('.autoplusPolicyClaimsDetail').wrap('<script id="autoplusPolicyClaimsDetailScript" type="text/x-kendo-template"></script>');
			
			autoplusViewModel.set('selectedClaims', new kendo.data.ObservableObject());
			
			// Load policy details when selecting a new policy
			var loadPolicyDetails = function (e) {
				var policyPrefix = 'policy_', // This can be set to whatever, but make sure it starts with a letter! Javascript doesn't like using numbers as keys (even if they're cast to string)
					claimPrefix = 'claim_', // This can be set to whatever, but make sure it starts with a letter! Javascript doesn't like using numbers as keys (even if they're cast to string)
					dataItem = e.sender.dataItem(e.sender.select()), // Return the data item to which the specified table row is bound				
					subgridSources = ['policyClaims', 'policyDrivers', 'policyVehicles'],
					policyNumber,
					policyKey;
				
				// Get the currently selected claims, if they exist
				selectedClaims = autoplusViewModel.get('selectedClaims');
				
				// Make sure there's actually a dataItem
				if (typeof dataItem !== 'undefined') {
					policyNumber = dataItem.policyNumber;
					policyKey = policyPrefix + policyNumber;
					
					// Use the prefix!
					if (!selectedClaims.get(policyKey)) {
						selectedClaims.set(policyKey, new kendo.data.ObservableObject());
					}
					
					autoplusViewModel.set('companyName', dataItem.companyName);
					autoplusViewModel.set('policyNumber', dataItem.policyNumber);
					autoplusViewModel.set('policyStatus', dataItem.policyStatus);
					
					// Read and filter sub-grids
					$.each(subgridSources, function (idx, source) {
						if (typeof sources[source] !== 'undefined') {
							// Update the grids
							sources[source].read();
							sources[source].filter({ field: 'policyNumber', operator: 'eq', value: dataItem.policyNumber });
						}
					});
					
					autoplusPolicyClaimsGrid.setOptions({
						detailTemplate: kendo.template(autoplusPolicyClaimsDetail.html()),
						detailInit: policyClaimsDetailInit,
						dataBound: function (e) {
							var data = e.sender.dataSource.data(),
								selectedPolicyClaims,
								claimID,
								claimKey;
							
							if (typeof policyKey !== 'undefined') {
								selectedPolicyClaims = selectedClaims.get(policyKey);
								
								if (!selectedPolicyClaims) {
									for (var i = 0; i < data.length; i++) {
										if (typeof selectedPolicyClaims !== 'undefined') {
											claimID = data[i].claimID;
											claimKey = claimPrefix + claimID;
											
											if (!selectedPolicyClaims.get(claimKey)) {
												// Claim ID must be a string - using an integer will cause an error
												selectedPolicyClaims.set(claimKey, false);
											}
										}
									}
								}
								
								//this.expandRow(this.tbody.find('tr.k-master-row').first()); // Do this if you want to expand the first row
								this.tbody.find('input[type=checkbox]').each(function (idx) {
									var uid = $(this).closest('[role=row]').attr('data-uid'),
										model;

									if (uid) {
										model = e.sender.dataSource.getByUid(uid);
										claimID = model.claimID;
										claimKey = claimPrefix + claimID;
										
										$(this).attr('data-bind', 'checked: ' + claimKey);
									}
								});
								
								kendo.bind(this.tbody, selectedPolicyClaims);
							}
						}
					});
					
					var getDate = function (year, month, day) {
						var dateArr = [year, month, day],
							date;

						date = dateArr.filter(function (n) {
							return (n === 0) ? false : n
						});
						
						return kendo.toString(kendo.parseDate(date.join('-'), ['yyyy-MM-dd', 'dd/MM/yyyy', 'd/MM/yyyy', 'd/M/yyyy']), 'dd/MM/yyyy');
					};
					
					var coverageDate = getDate(dataItem.policyCoverageYear, dataItem.policyCoverageMonth, dataItem.policyCoverageDay),
						expiryDate = getDate(dataItem.coverageExpiryYear, dataItem.coverageExpiryMonth, dataItem.coverageExpiryDay); 
						
					autoplusViewModel.set('coverageDate', coverageDate);
					autoplusViewModel.set('expiryDate', expiryDate);
					
					autoplusPolicyClaimsGrid.dataSource.read();
				}
			};
			
			var hidePoliciesGridColumns = function (e) {
				for (var i = 0; i < autoplusPoliciesGrid.columns.length; i++) {
					autoplusPoliciesGrid.showColumn(i);
				}
                
                autoplusPoliciesGrid.hideColumn('companyName');
				
				autoplusPoliciesGrid.element.find('div.k-group-indicator').each(function (i,v) {
					autoplusPoliciesGrid.hideColumn($(v).data('field'));
				});
			};
			
			autoplusViewModel.set('selectedPolicies', new kendo.data.ObservableObject());
			
			var bindPolicyCheckboxes = function (e) {
				var data = e.sender.dataSource.data(),
					policyPrefix = 'policy_',
					policyNumber,
					policyKey;
				
				selectedPolicies = autoplusViewModel.get('selectedPolicies');
				kendo.unbind(e.sender.tbody, selectedPolicies);
				
				//this.expandRow(this.tbody.find('tr.k-master-row').first()); // Do this if you want to expand the first row
				e.sender.tbody.find('input[type=checkbox]').each(function (idx) {
					var uid = $(this).closest('[role=row]').attr('data-uid'),
						model;

					if (uid) {
						model = e.sender.dataSource.getByUid(uid);
						policyNumber = model.policyNumber;
						policyKey = policyPrefix + policyNumber;
						
						$(this).attr('data-bind', 'checked: ' + policyKey);
					}
				});
				
				kendo.bind(e.sender.tbody, selectedPolicies);
			};
			
			var updateSummary = function (e) {
				var info;
				
				if (summaryInfoSource instanceof kendo.data.DataSource) {
					summaryInfoSource.read();
					info = summaryInfoSource.data()[0];
					
					autoplusViewModel.set('totalClaims', info.firstPartyClaims);
					autoplusViewModel.set('totalThirdPartyClaims', info.thirdPartyClaims);
					autoplusViewModel.set('totalPaid', info.totalLossAmount);
					autoplusViewModel.set('totalExp', info.totalExpenseAmount);
				}
			};

            var populateClaimSummary = function (e) {
                var policies; 

                if (policiesSource instanceof kendo.data.DataSource) {
                    policies = policiesSource.data();

                    claimSummarySource = new kendo.data.DataSource();
                    claimSummarySource.group({ field: 'companyName' });
                
                    for (var i = 0; i < policies.length; i++) {
                        claimSummarySource.add({
                            companyName: policies[i].companyName, 
                            policyNumber: policies[i].policyNumber,
                            claimsSelected: ''
                        });
                    }

                    autoplusClaimSummaryGrid.setDataSource(claimSummarySource);
                    autoplusClaimSummaryGrid.refresh();
                }
            };

            autoplusPolicyClaimsGrid.element.on('click', '.k-grid-SelectClaim', function (e) {
                var claimDate = $($(e.target).parent().next()[0]).html(),
                    companyName = autoplusViewModel.get('companyName'),
                    policyNumber = autoplusViewModel.get('policyNumber'),
                    claimSummary = claimSummarySource.data();
                    
                for (var i = 0; i < claimSummary.length; i++) {
                    var row = claimSummary[i];

                    if (row.companyName == companyName && row.policyNumber == policyNumber) {
                        var claims = row.claimsSelected.split(',');

                        if(e.target.checked) {
                            if (row.claimsSelected == '')
                                row.claimsSelected = claimDate;
                            else {
                                claims.push(claimDate);
                                row.claimsSelected = claims.join(',');
                            }
                        }
                        else {
                            if (claims.length == 1) 
                                row.claimsSelected = '';
                            else {
                                for (var j = 0; j < claims.length; j++) {
                                    if(claims[j] == claimDate) {
                                        claims.splice(j, 1);
                                        break;
                                    }
                                }
                                
                                row.claimsSelected = claims.join(',');
                            }
                        }
                    }
                }
                
                autoplusClaimSummaryGrid.refresh();
            });
			
			autoplusPoliciesGrid.bind('dataBinding', hidePoliciesGridColumns);
			autoplusPoliciesGrid.bind('dataBound', updateSummary);
            autoplusPoliciesGrid.bind('dataBound', populateClaimSummary);
			autoplusPoliciesGrid.bind('change', updateSummary);
			autoplusPoliciesGrid.bind('change', bindPolicyCheckboxes);
			autoplusPoliciesGrid.bind('change', loadPolicyDetails);
			
			// Open the AutoPlus window
			$('[name=button-autoplus]').click(function (e) {
				$('#' + that.getId()).data('kendoWindow').center().open();
			});
			
			// Handler for the AutoPlus search button's click event
			$('#autoplusSearchButton').click(function (e) {
                var licenceQuery = {};

                // Fields are required! Set the data attribute
				// This has to be done before validating!
				//$('#autoplusLicenceNumber').prop('required', true);
				//$('#autoplusJurisdiction').prop('required', true);
				
				if (autoplusValidator.validate()) {
                    licenceQuery = {
						id: viewModel.get('Driver_Id'),
                        query: {
                            licenceNumber: autoplusViewModel.get('autoplusLicenceNumber'),
					        prov: autoplusViewModel.get('autoplusJurisdiction')
                        }
					};
					
					// Load data
					$.ajax({
						url: App.getRootWebsitePath() + '/Api/AutoPlus',
						contentType: 'application/json; charset=utf-8',
						type: 'GET',
						dataType: 'xml',
						data: licenceQuery,
						beforeSend: function () {
							var noDataRow = autoplusPoliciesGrid.element.find('.custom-no-data-row');
							
							if (noDataRow) noDataRow.remove();
							
							$('<div class="k-loading-mask" style="width: 100%; height: 100%; top: 0px; left: 0px;"><span class="k-loading-text">Loading...</span><div class="k-loading-image"></div><div class="k-loading-color"></div></div>')
								.appendTo('#autoplusPoliciesGrid .k-grid-content');
						},
						error: function (xhr, status, message) {
                            autoplusPoliciesGrid.element.find('.k-loading-mask').remove();
							autoplusPoliciesGrid.tbody.empty();
							
							autoplusPoliciesGrid.dataSource.data({});
							
							$(autoplusPoliciesGrid.tbody).append(
								kendo.format("<tr class='custom-no-data-row'><td colspan='{0}' style='text-align:center'>" + xhr.responseText + "</td></tr>", 5)
							);
						},
						success: function (data, status, xhr) {
							xmlData = data;
                            $('#driverName').val(xmlData.getElementsByTagName('InsuredDT')[0].getElementsByTagName('FirstName')[0].textContent.toString() + ' ' + xmlData.getElementsByTagName('InsuredDT')[0].getElementsByTagName('LastName')[0].textContent.toString());

							var sourceOptions = {
								transport: {
									read: function (e) {
										e.success(xmlData);
									}
								}
							};
							
							// Policy info
							policiesSource = new kendo.data.DataSource($.extend({}, sourceOptions, {
								schema: {
									type: 'xml',
									data: '/DriverClaimHistoryGoldDS/PolicyBaseInfoDT',
									model: { // define the model of the data source. Required for validation and property types.
										fields: {
											companyCode: 'CompanyCode/text()',
											policyNumber: 'PolicyNumber/text()', // SHOW IN GRID
											companyName: 'CompanyName/text()', // SHOW IN GRID
											policyStatus: 'PolicyStatus/text()', // SHOW IN GRID
											policyCoverageYear: 'PolicyCoverageYear/text()', // SHOW IN GRID
											policyCoverageMonth: 'PolicyCoverageMonth/text()', // SHOW IN GRID
											policyCoverageDay: 'PolicyCoverageDay/text()', // SHOW IN GRID
											processYear: 'ProcessYear/text()',
											processMonth: 'ProcessMonth/text()',
											processDay: 'ProcessDay/text()',
											originalEffectiveYear: 'OriginalEffectiveYear/text()',
											originalEffectiveMonth: 'OriginalEffectiveMonth/text()',
											currentEffectiveYear: 'CurrentEffectiveYear/text()',
											currentEffectiveMonth: 'CurrentEffectiveMonth/text()',
											currentExpiryYear: 'CurrentExpiryYear/text()',
											currentExpiryMonth: 'CurrentExpiryMonth/text()',
											currentExpiryDay: 'CurrentExpiryDay/text()',
											coverageExpiryYear: 'CoverageExpiryYear/text()', // SHOW IN GRID
											coverageExpiryMonth: 'CoverageExpiryMonth/text()', // SHOW IN GRID
											coverageExpiryDay: 'CoverageExpiryDay/text()', // SHOW IN GRID
											//numberOfPreviousInquiries: 'NumberOfPreviousInquiries/text()',
											policyHolderID: 'PolicyHolderId/text()',
											policyOnHoldInd: 'PolicyOnHoldInd/text()',
											mostRecentPolicyInd: 'MostRecentPolicyInd/text()',
											originalEffectiveDay: 'OriginalEffectiveDay/text()',
											currentEffectiveDay: 'CurrentEffectiveDay/text()',
											commercialPolicyInd: 'CommercialPolicyInd/text()',
											lineOfBusinessCode: 'LineOfBusinessCode/text()',
											//noFrillPolicy: 'NoFrillPolicy/text()',
											//faRejectedCompany: 'FARejectedCompany/text()',
											//marketingGroup: 'MarketingGroup/text()'
										}
									}
								},
								group: { field: 'companyName' }
							}));
							
							policyClaimsSource = new kendo.data.DataSource($.extend({}, sourceOptions, {
								schema: {
									type: 'xml',
									data: '/DriverClaimHistoryGoldDS/PolicyClaimDT',
									model: { // define the model of the data source. Required for validation and property types.
										fields: {
											claimID: 'ClaimId/text()',
											companyCode: 'CompanyCode/text()',
											policyNumber: 'PolicyNumber/text()', // SHOW IN GRID
											claimYear: 'ClaimYear/text()', // SHOW IN GRID
											claimMonth: 'ClaimMonth/text()', // SHOW IN GRID
											claimDay: 'ClaimDay/text()', // SHOW IN GRID
											expenseAmt: 'ExpenseAmt/text()', // SHOW IN GRID
											//classTypeOfUseCode: 'ClassTypeOfUseCode/text()',
											//useCode: 'UseCode/text()',
											//tplClaimFreeYears: 'TPLClaimFreeYears/text()',
											//collClaimFreeYears: 'CollClaimFreeYears/text()',
											//driverBirthYear: 'DriverBirthYear/text()',
											//driverYearsLicenced: 'DriverYearsLicenced/text()',
											//driverYearsLicencedExp: 'DriverYearsLicencedExp/text()',
											//driverTrainingInd: 'DriverTrainingInd/text()',
											//driverGender: 'DriverGender/text()',
											//excludedDriverInd: 'ExcludedDriverInd/text()',
											//lastUpdateDate: 'LastUpdateDate/text()',
											policyVehicleID: 'PolicyVehicleId/text()',
											//iaoCompanyInd: 'IAOCompanyInd/text()',
											source: 'Source/text()'
										}
									}
								}
							}));
							
							// Policy drivers
							policyDriversSource = new kendo.data.DataSource($.extend({}, sourceOptions, {
								schema: {
									type: 'xml',
									data: '/DriverClaimHistoryGoldDS/PolicyDriverDT',
									model: { // define the model of the data source. Required for validation and property types.
										fields: {
											companyCode: 'CompanyCode/text()',
											policyNumber: 'PolicyNumber/text()', // SHOW IN GRID
											policyDriverID: 'PolicyDriverId/text()',
											deletedInd: 'DeletedInd/text()',
											//licenceNumberStatus: 'LicenceNumberStatus/text()',
											driverRelationshipCode: 'DriverRelationshipCode/text()',
											principalOperatorInd: 'PrincipalOperatorInd/text()',
											policyVehicleID: 'PolicyVehicleId/text()',
											licenceProvinceCode: 'LicenceProvinceCode/text()',
											licenceNumber: 'LicenceNumber/text()',
											yearsLicenced: 'YearsLicenced/text()', 
											yearsLicencedExp: 'YearsLicencedExp/text()', // SHOW IN GRID
											driverTrainingInd: 'DriverTrainingInd/text()',
											firstName: 'FirstName/text()', // SHOW IN GRID
											lastName: 'LastName/text()', // SHOW IN GRID
											//unstructuredName: 'UnstructuredName/text()',
											//structuredNameInd: 'StructuredNameInd/text()',
											//companyInd: 'CompanyInd/text()',
											birthYear: 'BirthYear/text()', // SHOW CONCAT IN GRID 1
											birthMonth: 'BirthMonth/text()', // SHOW CONCAT IN GRID 2
											birthDay: 'BirthDay/text()', // SHOW CONCAT IN GRID 3
											gender: 'Gender/text()', // SHOW IN GRID
											//icpbWarningPossibleMatchInd: 'ICPBWarningPossibleMatchInd/text()',
											//policyVehicleCode: 'PolicyVehicleCode/text()',
											age: 'Age/text()'
										}
									}
								}
							}));
							
							// Policy vehicles
							policyVehiclesSource = new kendo.data.DataSource($.extend({}, sourceOptions, {
								schema: {
									type: 'xml',
									data: '/DriverClaimHistoryGoldDS/PolicyVehicleDT',
									model: { // define the model of the data source. Required for validation and property types.
										fields: {
											companyCode: 'CompanyCode/text()',
											policyNumber: 'PolicyNumber/text()', // SHOW IN GRID
											policyVehicleID: 'PolicyVehicleId/text()',
											policyDriverID: 'PolicyDriverId/text()',
											territoryCode: 'TerritoryCode/text()',
											territoryDesc: 'TerritoryDesc/text()',
											typeOfBusinessCode: 'TypeOfBusinessCode/text()',
											classTypeOfUseCode: 'ClassTypeOfUseCode/text()',
											useCode: 'UseCode/text()',
											//principalOperatorBirthYear: 'PrincipalOperatorBirthYear/text()',
											//principalOperatorYearsLicenced: 'PrincipalOperatorYearsLicenced/text()',
											//principalOperatorYearsLicencedExp: 'PrincipalOperatorYearsLicencedExp/text()',
											//principalOperatorGender: 'PrincipalOperatorGender/text()',
											//yearsClaimFree: 'YearsClaimFree/text()',
											//yearsClaimFreeExp: 'YearsClaimFreeExp/text()',
											//yearsClaimFreeTP: 'YearsClaimFreeTP/text()',
											//yearsClaimFreeColl: 'YearsClaimFreeColl/text()',
											//yearsOtherClaimFreeTO: 'YearsOtherClaimFreeTO/text()',
											//yearsOtherClaimFreeColl: 'YearsOtherClaimFreeColl/text()',
											//facilityAccidentCount: 'FacilityAccidentCount/text()',
											//facilityAConvictionCount: 'FacilityAConvictionCount/text()',
											//facilityBConvictionCount: 'FacilityBConvictionCount/text()',
											//facilityCConvictionCount: 'FacilityCConvictionCount/text()',
											vin: 'VIN/text()', // SHOW IN GRID
											vinStatus: 'VINStatus/text()',
											//vehicleCode: 'VehicleCode/text()',
											modelYear: 'ModelYear/text()', // SHOW IN GRID
											//icpbReportReference: 'ICPBReportReference/text()',
											vehicleFixableInd: 'VehicleFixableInd/text()',
											vehicleType: 'VehicleType/text()', // SHOW IN GRID
											bodyTypeCode: 'BodyTypeCode/text()',
											driveTypeCode: 'DriveTypeCode/text()',
                                            primaryOperatorName: 'PrimaryOperatorName/text()',
											carCode: 'CarCode/text()', // SHOW IN GRID
											makeEng: 'MakeEng/text()', // SHOW IN GRID
											//makeFre: 'MakeFre/text()',
											modelEng: 'ModelEng/text()', // SHOW IN GRID
											//modelFre: 'ModelFre/text()',
											vehicleDescEng: 'VehicleDescEng/text()',
											//vehicleDescFre: 'VehicleDescFre/text()',
											vehicleDescInd: 'VehicleDescInd/text()',
											//checkPointReportNumber: 'CheckPointReportNumber/text()',
											//reportYear: 'ReportYear/text()',
											//reportMonth: 'ReportMonth/text()',
											//reportDay: 'ReportDay/text()',
											//alertCodes: 'AlertCodes/text()',
											//numberOfCheckPointInspections: 'NumberOfCheckPointInspections/text()',
											//iaoSubClassType: 'IAOSubClassType/text()',
											driverTrainingInd: 'DriverTrainingInd/text()',
											numberOfClaims: 'NumberOfClaims/text()', // SHOW IN GRID
											//otherOperatorCode: 'OtherOperatorCode/text()',
											//otherOperatorMinimumYearsLicenced: 'OtherOperatorMinimumYearsLicenced/text()',
											//iaoUseCode: 'IAOUseCode/text()',
											policyDriverCode: 'PolicyDriverCode/text()',
											//rin: 'RIN/text()',
											//territoryFSA: 'TerritoryFSA/text()',
											//manditoryCoverage: 'ManditoryCoverage/text()',
											trailerIndicator: 'TrailerIndicator/text()',
											//newDriverDiscount: 'NewDriverDiscount/text()',
											//retirementDiscount: 'RetirementDiscount/text()',
											//cleanDriverDiscount: 'CleanDriverDiscount/text()',
											//faDriverTrainingCode: 'FADriverTrainingCode/text()',
											//lastUpdateDate: 'LastUpdateDate/text()',
											//afterMarketSecurityDevice: 'AfterMarketSecurityDevice/text()',
											//leasedVehicle: 'LeasedVehicle/text()'
										}
									}
								}
							}));
							
							// Policy summary info
							summaryInfoSource = new kendo.data.DataSource($.extend({}, sourceOptions, {
								schema: {
									type: 'xml',
									data: '/DriverClaimHistoryGoldDS/SummaryInfoDT',
									model: { // define the model of the data source. Required for validation and property types.
										fields: {
											yearsOnAutoPlus: 'YearsOnAutoPlus/text()',
											yearsClaimFree: 'YearsClaimFree/text()', // SHOW IN GRID
											claimsInLast6Years: 'ClaimsInLast6Years/text()', // SHOW IN GRID
											atFaultClaims: 'AtFaultClaims/text()', // SHOW IN GRID
											firstPartyClaims: 'FirstPartyClaims/text()', // SHOW IN GRID
											thirdPartyClaims: 'ThirdPartyClaims/text()', // SHOW IN GRID
											totalLossAmount: 'TotalLossAmount/text()', // SHOW IN GRID
											totalExpenseAmount: 'TotalExpenseAmount/text()',
											autoPlusCheckResult: 'AutoPlusCheckResult/text()',
											policyDriverCurrentAge: 'PolicyDriverCurrentAge/text()',
										}
									}
								}
							}));
							
							autoplusPoliciesGrid.setDataSource(policiesSource);
							autoplusPolicyClaimsGrid.setDataSource(policyClaimsSource);
							autoplusPolicyDriversGrid.setDataSource(policyDriversSource);
							autoplusPolicyVehiclesGrid.setDataSource(policyVehiclesSource);
							
							autoplusViewModel.set('autoplusPoliciesGridSource', policiesSource);
							autoplusViewModel.set('autoplusPolicyClaimsGridSource', policyClaimsSource);
							autoplusViewModel.set('autoplusDriversGridSource', policyDriversSource);
							autoplusViewModel.set('autoplusVehiclesGridSource', policyVehiclesSource);
							
							sources.policies = policiesSource;
							sources.policyClaims = policyClaimsSource;
							sources.policyDrivers = policyDriversSource;
							sources.policyVehicles = policyVehiclesSource;
							sources.summaryInfo = summaryInfoSource;
							
							var clearPolicyDetails = function (e) {
								// Clear grids if their DataSource has already been bound
								if (autoplusPolicyClaimsGrid.hasOwnProperty('dataSource')) autoplusPolicyClaimsGrid.dataSource.data([]);
								if (autoplusDriversGrid.hasOwnProperty('dataSource')) autoplusDriversGrid.dataSource.data([]);
								if (autoplusVehiclesGrid.hasOwnProperty('dataSource')) autoplusVehiclesGrid.dataSource.data([]);
								
								// Clear policy details
								autoplusViewModel.set('companyName', '');
								autoplusViewModel.set('policyNumber', '');
								autoplusViewModel.set('policyStatus', '');
								autoplusViewModel.set('coverageDate', '');
								autoplusViewModel.set('expiryDate', '');
							};
							
							clearPolicyDetails();
							
							policiesSource.read();
						}
					});
				}
			});
			
			// Bind the import button's click event to the AutoPlus import handler
			// Bind the import button's click event to the AutoPlus import handler
			$('#autoplusImportButton').click(function (e) {
				// START AutoPlus Import Handler
				var window = $(e.target).closest('[data-role=window]'),
					widget = window.data('kendoWindow'),
					map = App.Utilities.ChainableHash({
						PolicyBaseInfoDT: [],
						PolicyDriverDT: [],
						//PolicyVehicleDT: [],
						PolicyHolderDT: [],
						PolicyClaimDT: [],
						PolicyClaimVehicleDT: [],
						PolicyClaimFirstPartyAccidentDriverDT: [],
						PolicyClaimKindOfLossDT: [],
						SummaryInfoDT: [],
						RequestDT: []
					}),
					serializer = new XMLSerializer(),
					xml,
					response,
					policies = [],
                    claims = [];
					
				selectedPolicies.forEach(function (idx, policyKey) {
					var policyNumber = policyKey.split('policy_')[1];
						
					if (policyNumber) {
						policies.push(policyNumber);
					}
					
					policyNumber = null;
				});
				
				// TODO: create the rules property if it doesn't already exist
				map.each(function (key, obj) {
					if (key === 'PolicyBaseInfoDT') {
						obj.push({ tagName: 'PolicyNumber', match: policies, mode: 'any' }); // mode: any | all
					}
				});
					
				// Set filters 
				selectedClaims.forEach(function (policy, policyKey) {
					var policyNumber = policyKey.split('policy_')[1],
						claimID = null;
					
					map.each(function (key, obj) {
						if (key === 'PolicyBaseInfoDT' || key === 'PolicyClaimDT' || key === 'PolicyDriverDT' || key === 'RequestDT') {
							// Do nothing
						} else {
							obj.push({ tagName: 'PolicyNumber', match: policyNumber });
						}
					});
					
					policy.forEach(function (claim, claimKey) {
						claimID = claimKey.split('claim_')[1];
						
						if (claim) {
							claims.push(claimID);
						}
						
						claimID = null;
					});
					
					// TODO: create the rules property if it doesn't already exist
					map.each(function (key, obj) {
						if (key === 'PolicyClaimDT' /*|| key === 'PolicyClaimVehicleDT'*/ || key === 'PolicyClaimFirstPartyAccidentDriverDT' || key === 'PolicyClaimKindOfLossDT') {
							if (claims.length > 0) {
								obj.push({ tagName: 'ClaimId', match: claims, mode: 'any' }); // mode: any | all | none
							} else {
								obj.push({ tagName: 'ClaimId', mode: 'ignore' }); // mode: any | all | ignore
							}
						}
					});
				});
					
				if (e.preventDefault) {
					e.preventDefault();
				} else {
					e.returnValue = false;
				}
				
				// TODO: Would this be better adapted in App.Utilities?
				var createXmlFromMap = function (xml, map) {
					var xmlDoc = document.implementation.createDocument(null, 'DriverClaimHistoryGoldDS', null), // An empty XML document for the request
						xmlNode = xmlDoc.documentElement,
						child = xml.documentElement.firstChild,
						rules,
						isMatch;
					
					var injectNode = function (node, targetNode) {	
						clone = node.cloneNode(true);
						targetNode.appendChild(clone);
					};
					
					var checkRule = function (rule) {
						var match = false,
							mode,
							textNode,
							pattern,
							matches;
						
						if (rule.hasOwnProperty('tagName')) {
							tags = child.getElementsByTagName(rule.tagName); // Returns an HTML Collection/DOM NodeList	
							
							if (tags.length > 0) {												
								for (var j = 0; j < tags.length; j++) {
									textNode = tags.item(j).childNodes[0];
									
									if (rule.mode === 'ignore') {
										match = false;
									} else if ($.type(rule.match) === 'string') {
										// Match a single value
										if (textNode.nodeValue === rule.match) {
											match = true;
										}
									} else if ($.type(rule.match) === 'array') {
										// Match an array of values
										pattern = new RegExp('(' + rule.match.join('|') + ')', 'g');
										matches = textNode.nodeValue.match(pattern);
										
										if (matches) {
											switch (rule.mode) {
												case 'any':
													match = (matches.length > 0) ? true : false;
													break;
												case 'all':
													match = (matches.length === rule.match.length) ? true : false;
													break;
											}
										}
									}
								}								
							}
						}
						
						return match;
					}
					
					while (child) {
						isMatch = false;
						
						if (child.nodeType == 1) {
							// Skip text nodes for now
							rules = map.get(child.tagName);
							if (typeof rules !== 'undefined') {
								if (Object.keys(rules).length > 0) {									
									$.each(rules, function (i, rule) {
										isMatch = checkRule(rule);
									});
									
									if (isMatch === true) {
										injectNode(child, xmlNode);
									}
									
								} else {
									// No rules have been specified, just include the node
									injectNode(child, xmlNode);
								}
							}
							
						} else if (child.nodeName == '#text') {
							// Do nothing
						}
						
						child = child.nextSibling;
					}
					
					return xmlDoc;
				};
				
				// Generate an XML document
				xml = createXmlFromMap(xmlData, map);
				
				// TESTING: Enable these lines
				//console.log(serializer.serializeToString(xml));
				//return false;
				
				var id = viewModel.get('Driver_Id');

				response = $.ajax({
					type: 'PUT',
					url: App.getRootWebsitePath() + '/Api/AutoPlus/' + id,
                    contentType: 'text/xml; charset=utf-8',
					dataType: 'xml',
					data: serializer.serializeToString(xml),
					beforeSend: function (xhr, settings) {
						OpenGeneralDialog('Importing AutoPlus information...');
					},
					success: function (data, status, xhr) {
						// Call the autoplus saved event handler, which updates the summary module
						// Trigger initialized event
						if (autoplusEventHandler.hasEvent('saved')) {
							event = autoplusEventHandler.getEvent('saved');
							
							if (event.hasOwnProperty('dispatch')) {
								event.dispatch(); // This is triggering an error in IE - the fix is below!
							} else {
								// HACK: Internet Explorer is stupid
								location.reload(true);
							}
						}
						
						// Close the window
						widget.close();
					},
					error: function (xhr, status, message) {						
						CloseGeneralDialog();
					},
					complete: function (xhr, status) {
						CloseGeneralDialog();
					}
				});
				
				// END AutoPlus Import Handler
			});
		},
		initialized: function () {
			// Do something
		},
		saved: function () {
			var	that = this,
				page = App.getCurrent(),
				viewModel = page.getBlock('center-pane').getViewModel();
				
			// TODO: Notify subscribers - something's not right with this
			// For now just refresh the page
			//module.notify('update')
			
			location.reload(true);
		}
	},
	validation: {
		messages: {
			validLicence: 'Please enter a valid licence number | <small><strong>eg: 123456-789</strong></small>',
			requiredJurisdiction: 'Please select a jurisdiction to continue'
		},
		rules: {
			// VALIDATION: Check licence number
			validLicence: function (input) {
				if (input.is('[name=autoplusLicenceNumber]')) {
					var patterns = [
							/^\d{6}-\d{3}$/i, // Matches ######-###
							/^\d{4}$/i, // Matches ######
							/^\d{5}$/i, // Matches ######
							/^\d{6}$/i, // Matches ######
							/^\w{1}\d{5,}$/i // Matches [A-Z]#####
						],
						isMatch = false;
					
					//input.attr('validationmessage', 'Please enter a valid licence number | <small><strong>eg: 123456-789</strong></small>');
					
					$.each(patterns, function (idx, pattern) {
						isMatch = pattern.test(input.val());
						if (isMatch) return false; // We have a match - exit the loop
					});
					
					return isMatch;
				}
				
				return true;
			},
			requiredJurisdiction: function (input) {
				var checkbox, value;
				
				if (input.is('[name=autoplusJurisdiction]')) {
					checkbox = input.filter("[type=checkbox]").length && input.attr("checked") !== "checked";
                    value = input.val();
						
					//input.attr('validationmessage', 'Please select a jurisdiction to continue');
                   
				   return !(value === "" || !value  || checkbox);
				}
				
				return true;
			}
		}
	},
	layout: {
		templates: {
			tag: 'div',
			name: 'autoplus',
			data: {
				role: 'window',
				appendTo: '#summary',
				modal: true,
				visible: false,
				resizable: false,
				draggable: true,
				title: 'AutoPlus | Import Data',
				width: '95%',
				height: '85%'
			},
			sections: [
				// PolicyBaseDT/Sidebar
				{
					tag: 'div',
					style: 'float: left; max-width: 25%; padding: 0 10px; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box',
					fieldgroups: [
						{
							tag: 'div',
							class: 'kpaf-row',
							legend: 'Search Licence',
							text: 'Please enter a driver\'s licence number.',
							style: 'margin: 10px 0 20px'
						},
						{
							tag: 'div',
							class: 'kpaf-row',
							fields: [
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										tag: 'select',
										id: 'autoplusJurisdiction',
										name: 'autoplusJurisdiction',
										label: 'Jurisdiction',
										style: 'width: 100px',
										data: {
											role: 'dropdownlist',
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
															{ Key: 'SK', Value: 'SK' },
															{ Key: 'YK', Value: 'YK' },
															{ Key: 'US', Value: 'US' },
															{ Key: 'Other', Value: 'Other' }
														]
													}
												},
												value: 'autoplusJurisdiction'
											}
										}
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'autoplusLicenceNumber',
										name: 'autoplusLicenceNumber',
										label: 'Licence Number',
										tag: 'input',
										type: 'text',
										class: 'large',
										value: '',
										data: {
											role: 'combobox',
											bind: {									
												value: 'autoplusLicenceNumber'
											}
										}
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'autoplusSearchButton',
										name: 'autoplusSearchButton',
										tag: 'button',
										type: 'button',
										label: '\u00a0',
										text: 'Get Info',
										class: 'k-button'
									}]
								},
                                {
							        tag: 'div',
							        class: 'fieldgroup',
							        group: [{
								        id: 'driverName',
								        name: 'driverName',
								        label: 'Driver Name',
								        tag: 'input',
								        type: 'text',
								        class: 'medium',
								        disabled: true
							        }]
						        },
							]
						},
						{
							tag: 'div',
							class: 'kpaf-row',
							group: [{
								tag: 'div',
								legend: 'Insurance Policies',
								text: 'Select the insurance policy to view the policy and claims information.',
								style: 'margin: 10px 0 38px',
							}]
						},
						{
							tag: 'div',
							class: 'kpaf-row',
							fields: [
								{
									tag: 'div',
									id: 'autoplusPoliciesGrid',
									name: 'autoplusPoliciesGrid',
									class: '',
									data: {
										role: 'grid',
										autoBind: false,
										sortable: true,
										scrollable: true,
										pageable: false,
										/*pageable: {
											pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
											pageSizes: [10, 25, 50],
											refresh: false
										},*/
										//groupable: true,
										selectable: true,
										columns: [
											{
												field: 'companyName',
												title: 'Insurance Company',
                                                hidden: true,
												groupHeaderTemplate: '#= value #'
											},
											{
												field: 'policyNumber',
												title: 'Policy Number',
												width: '140px'
											},
											/*{
												field: null,
												title: 'Coverage Date',
												template: '# var date = [policyCoverageYear, policyCoverageMonth, policyCoverageDay].filter(function(n){return (n===0)?false:n}); # #= kendo.toString(kendo.parseDate(date.join("-"), ["yyyy-MM-dd", "dd/MM/yyyy", "d/MM/yyyy", "d/M/yyyy"]), "dd/MM/yyyy") #',
												width: '140px'
											},
											{
												field: null,
												title: 'Expiry Date',
												template: '# var date = [coverageExpiryYear, coverageExpiryMonth, coverageExpiryDay].filter(function(n){return (n===0)?false:n}); # #= kendo.toString(kendo.parseDate(date.join("-"), ["yyyy-MM-dd", "dd/MM/yyyy", "d/MM/yyyy", "d/M/yyyy"]), "dd/MM/yyyy") #',
												width: '140px'
											},
											{
												field: 'policyStatus',
												title: 'Status',
												width: '60px'
											}*/
										]
									}
								}
							]
						},
						{
							tag: 'div',
							class: 'kpaf-row',
							legend: 'Import Insurance Policies and Claims',
							text: 'Claim Summary',
							style: 'margin: 10px 0 38px'
						},
						{
							tag: 'div',
							class: 'kpaf-row',
							fields: [
								{
									tag: 'div',
									id: 'autoplusClaimSummaryGrid',
									name: 'autoplusClaimSummaryGrid',
									class: '',
									data: {
										role: 'grid',
										autoBind: false,
										sortable: true,
										scrollable: true,
										pageable: false,
										selectable: true,
										columns: [
											{
												field: 'companyName',
												title: 'Insurance Company',
                                                hidden: true,
												groupHeaderTemplate: '#= value #'
											},
											{
												field: 'policyNumber',
												title: 'Policy Number',
												width: '110px'
											},
											{
												field: 'claimsSelected',
												title: 'Claims Selected'
											}
										]
									}
								}
							]
						},
						// Toolbar
						{
							tag: 'div',
							class: 'kpaf-row',
							fields: [
								{
									id: 'autoplusImportButton',
									name: 'autoplusImportButton',
									tag: 'button',
									type: 'button',
									label: '\u00a0',
									text: 'Import Data',
									class: 'k-button'
								}
							]
						}
					]
				},
				// Main pane
				{
					tag: 'div',
					style: 'float: right; max-width: 75%; margin-bottom: 50px',
					parts: [
						{
							tag: 'div',
							class: 'kpaf-row',
							legend: 'Claims',
							text: 'Total number of claims and expenses paid on all policies.',
							style: 'margin: 10px 0 20px'
						},
						{
							tag: 'div',
							class: 'kpaf-row',
							fields: [
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'totalClaims',
										name: 'totalClaims',
										label: 'Insurer Claims',
										tag: 'input',
										type: 'text',
										class: 'small',
										data: {
											bind: 'totalClaims'
										},
										disabled: true
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'totalThirdPartyClaims',
										name: 'totalThirdPartyClaims',
										label: 'Third Party Claims',
										tag: 'input',
										type: 'text',
										class: 'small',
										data: {
											bind: 'totalThirdPartyClaims'
										},
										disabled: true
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'totalPaid',
										name: 'totalPaid',
										label: 'Paid',
										tag: 'input',
										type: 'text',
										class: 'small',
										data: {
											bind: 'totalPaid'
										},
										disabled: true
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'totalExp',
										name: 'totalExp',
										label: 'Expenses Paid',
										tag: 'input',
										type: 'text',
										class: 'small',
										data: {
											bind: 'totalExp'
										},
										disabled: true
									}]
								}
							]
						},
						{
							tag: 'div',
							class: 'kpaf-row',
							legend: 'Policy and Claims Details',
							text: 'Please review the policy information and select the claims to be imported.',
							style: 'margin: 10px 0 20px'
						},
						{
							tag: 'div',
							class: 'kpaf-row',
							fields: [
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'companyName',
										name: 'companyName',
										label: 'Company Name',
										tag: 'input',
										type: 'text',
										class: 'large',
										data: {
											bind: 'companyName'
										},
										disabled: true
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'policyNumber',
										name: 'policyNumber',
										label: 'Policy Number',
										tag: 'input',
										type: 'text',
										class: 'small',
										data: {
											bind: 'policyNumber'
										},
										disabled: true
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'policyStatus',
										name: 'policyStatus',
										label: 'Policy Status',
										tag: 'input',
										type: 'text',
										class: 'small',
										data: {
											bind: 'policyStatus'
										},
										disabled: true
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'coverageDate',
										name: 'coverageDate',
										label: 'Start Date',
										tag: 'input',
										type: 'text',
										data: {
											role: 'datepicker',
											bind: 'coverageDate'
										},
										disabled: true
									}]
								},
								{
									tag: 'div',
									class: 'fieldgroup',
									group: [{
										id: 'expiryDate',
										name: 'expiryDate',
										label: 'Expiry Date',
										tag: 'input',
										type: 'text',
										data: {
											role: 'datepicker',
											bind: 'expiryDate'
											/*bind: {
												value: function () {
												// TODO: Implement this as a behavior
													var dateArr = [coverageExpiryYear, coverageExpiryMonth, coverageExpiryDay],
														date;
														
													date = dateArr.filter(function (n) {
														return (n === 0) ? false : n
													});
													
													return kendo.toString(kendo.parseDate(date.join('-'), ['yyyy-MM-dd', 'dd/MM/yyyy', 'd/MM/yyyy', 'd/M/yyyy']), 'dd/MM/yyyy');
												}
											}*/
										},
										disabled: true
									}]
								}
							]
						}
					],
					tabstrip: {
						tag: 'div',
						class: 'kpaf-row',
						id: 'autoplusTabs',
						name: 'autoplusTabs',
						data: {
							role: 'semantictabstrip'
						},
						tabs: ['Drivers', 'Policy Claims', 'Vehicles'],
						fieldsets: [
							// PolicyDriverDT
							{
								tag: 'fieldset',
								id: 'drivers-tab',
								legend: 'Drivers',
								fields: [
									{
										tag: 'div',
										id: 'autoplusDriversGrid',
										name: 'autoplusDriversGrid',
										class: '',
										data: {
											role: 'grid',
											sortable: true,
											scrollable: true,
											pageable: {
												pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
												pageSizes: [10, 25, 50],
												refresh: false
											},
											selectable: true,
											columns: [
												/*{
													template: '<input type="checkbox" />',
													width: '30px'
												},*/
												{
													field: 'firstName',
													title: 'First Name',
                                                    template: '#:(data.deletedInd==="Y")?((data.firstName)?"*" + data.firstName:"*"):((data.firstName)?data.firstName:"")#',
                                                    width: '80px'
												},
												{
													field: 'lastName',
													title: 'Last Name',
                                                    width: '80px'
												},
							                    {
								                    field: 'driverRelationshipCode',
								                    title: 'Relationship',
                                                    width: '90px'
							                    },
							                    {
								                    field: 'driverTrainingInd',
								                    title: 'Driver\'s Training',
                                                    width: '110px'
							                    },
												{
													field: null,
													title: 'Birth Date',
													template: '# var date = [birthYear, birthMonth, birthDay].filter(function(n){return (n===0)?false:n}); # #= kendo.toString(kendo.parseDate(date.join("-"), ["yyyy-MM-dd", "dd/MM/yyyy", "d/MM/yyyy", "d/M/yyyy"]), "dd/MM/yyyy") #',
													width: '90px'
												},
												{
													field: 'gender',
													title: 'Gender',
													width: '65px'
												},
												{
													field: 'yearsLicencedExp',
													title: 'Yrs. Licenced',
													width: '85px'
												},
												{
													field: 'policyNumber',
													title: 'Policy Number',
													width: '100px'
												}
											]
										}
									}
								]
							},
							// PolicyClaimDT
							{
								tag: 'fieldset',
								id: 'claims-tab',
								legend: 'Claim History',
								fields: [
									{
										tag: 'div',
										id: 'autoplusPolicyClaimsGrid',
										name: 'autoplusPolicyClaimsGrid',
										class: '',
										data: {
											role: 'grid',
											autoBind: false,
											sortable: true,
											scrollable: true,
											pageable: {
												pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
												pageSizes: [10, 25, 50],
												refresh: false
											},
											selectable: true,
											columns: [
												{
													field: null,
													template: '<input class="k-grid-SelectClaim" type="checkbox" />',
													width: '30px'
												},/*
												{
													field: 'claimID',
													title: 'Claim ID'
												},
												{
													field: 'policyNumber',
													title: 'Policy Number',
													width: '140px'
												},*/
												{
													field: null,
													title: 'Claim Date',
													template: '# var date = [claimYear, claimMonth, claimDay].filter(function(n){return (n===0)?false:n}); # #= kendo.toString(kendo.parseDate(date.join("-"), ["yyyy-MM-dd", "dd/MM/yyyy", "d/MM/yyyy", "d/M/yyyy"]), "dd/MM/yyyy") #',
													width: '200px'
												},
												{
													field: 'expenseAmt',
													title: 'Expense Amount'
												},
												{
													field: 'source',
													title: 'Source',
													width: '160px' 
												}
											]
										}
									}
								]
							},
							// PolicyVehicleDT
							{
								tag: 'fieldset',
								id: 'vehicles-tab',
								legend: 'Vehicles',
								fields: [
									{
										tag: 'div',
										id: 'autoplusVehiclesGrid',
										name: 'autoplusVehiclesGrid',
										class: '',
										data: {
											role: 'grid',
											autoBind: false,
											sortable: true,
											scrollable: true,
											pageable: {
												pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
												pageSizes: [10, 25, 50],
												refresh: false
											},
											selectable: true,
											columns: [
												/*{
													template: '<input type="checkbox" />',
													width: '30px'
												},*/
												{
													field: 'primaryOperatorName',
													title: 'Operator',
													width: '150px'
												},
												{
													field: null,
													title: 'Vehicle',
													template: '# var vehicle = [modelYear, makeEng, modelEng].join(" "); # #= vehicle #'//,
                                                    //width: '180px'
												},
												{
													field: 'carCode',
													title: 'Car Code',
													width: '80px'
												},
												{
													field: 'vin',
													title: 'VIN',
													width: '160px'
												},
												{
													field: 'numberOfClaims',
													title: 'Claims',
													width: '80px'
												},
												{
													field: 'policyNumber',
													title: 'Policy Number',
													width: '100px'
												}
											]
										}
									}
								]
							}
						]
					}
				},
				{
					tag: 'div',
					class: 'autoplusPolicyClaimsDetail',
					// TODO: For some reason I can't use my kendoSemanticTabStrip widget...
					parts: [
						{
							tag: 'h3',
							text: 'Loss Details'
						},
						{
							tag: 'div',
							fields: [
								{
									tag: 'div',
									class: 'autoplusPolicyClaimLossesGrid'
								}
							]
						},
						{
							tag: 'h3',
							text: 'Drivers'
						},
						{
							tag: 'div',
							legend: 'First-Party',
							fields: [
								{
									tag: 'div',
									class: 'autoplusPolicyClaimDriversGrid'
								}
							]
						},
						{
							tag: 'div',
							legend: 'Third-Party',
							fields: [
								{
									tag: 'div',
									class: 'autoplusPolicyClaimThirdPartyDriversGrid'
								}
							]
						},
						{
							tag: 'h3',
							text: 'Vehicles'
						},
						{
							tag: 'div',
							legend: 'First-Party',
							fields: [
								{
									tag: 'div',
									class: 'autoplusPolicyClaimVehiclesGrid'
								}
							]
						}
					]
				}
			]
		}
	}
});