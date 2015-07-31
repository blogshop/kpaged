define({
    name: 'summary',
    id: 'summary',
    events: {
        // TODO: This should be registered as a default event handler for all pages
        // For now, include this function in all page scripts
        pageLoaded: function (e) {
            var that = this,
				moduleId = that.getId(),
				module = $('#' + moduleId),
				page = App.getCurrent(),
				summaryViewModel = that.getViewModel(),
				data,
				sources = {},
				entities = ['insureds', 'drivers', 'vehicles', 'claims'],
                widgetTypes = App.Config.Widgets.defaults(),
                widgets;

            // Get sources for use in the pageLoaded event handler
            sources.insureds = summaryViewModel.get('summaryInsuredsSource');
            sources.drivers = summaryViewModel.get('summaryDriversSource');
            sources.vehicles = summaryViewModel.get('summaryVehiclesSource');
            sources.claims = summaryViewModel.get('summaryClaimsSource');
            sources.journals = summaryViewModel.get('summaryJournalsSource');

            // Window widgets append themselves by default to 
            // <body>, even if the appendTo parameter has been
            // specified - Kendo FAIL
            kendo.bind($('#insuredSearchPopup'), summaryViewModel);
            kendo.bind($('#driverSearchPopup'), summaryViewModel);
            kendo.bind($('#vehicleRiskTypePopup'), summaryViewModel);
            kendo.bind($('#policyCoveragePopup'), summaryViewModel);

            $('#insuredSearchPopup').find('.k-toolbar').prepend('Create New Insured ');

            var insuredSearchPopup = $('#insuredSearchPopup').data('kendoWindow');
            insuredSearchPopup.bind('activate', function (e) {
                var windowEvent = e,
					window = $(windowEvent.sender.element).closest('[data-role=window]'),
					kendoWindow = window.data('kendoWindow'),
					insuredSearchGrid = window.find('#insuredSearchGrid').data('kendoGrid');

                // Clear the search fields
                summaryViewModel.set('insuredFirstName');
                summaryViewModel.set('insuredLastName');

                if (insuredSearchGrid.hasOwnProperty('dataSource')) {
                    insuredSearchGrid.dataSource.data([]);
                }
                // New Insured Person or Company
                insuredSearchGrid.element.on('click', '.k-grid-Person, .k-grid-Company', function (e) {
                    var window = $(e.target).closest('[data-role=window]'),
						kendoWindow = window.data('kendoWindow'),
						grid = $(e.delegateTarget).data('kendoGrid'),
						params = window.find('input[type=text]'),
						queryString = '';

                    if ($(e.currentTarget).hasClass('k-grid-Company')) {
                        queryString = 'type=company';
                    } else if ($(e.currentTarget).hasClass('k-grid-Person')) {
                        queryString = 'type=person';
                    }
                    //Upper case the First and Last name
                    $.each(params, function (i, val) {
                        params[i].value = params[i].value.toUpperCase();
                    });

                    if (queryString !== '' && params.length > 0) {
                        queryString += '&' + params.serialize();
                    }

                    if (queryString !== '') {
                        OpenGeneralDialog('Creating insured...');
                        kendoWindow.close();

                        parent.location = 'Insured.aspx?' + queryString;

                        // TODO: Implement a proper AJAX solution - parent.location is weak														
                        /*$.ajax({
                        url: App.getRootWebsitePath() + '/Api/Insured',
                        contentType: 'application/json; charset=utf-8',
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify(model),
                        beforeSend: function () {
                        OpenGeneralDialog('Adding insured...');
                        },
                        error: function (xhr, status, message) {
                        CloseGeneralDialog();
                        },
                        success: function (data, status, xhr) {
                        CloseGeneralDialog();
                        },
                        complete: function () {
                        kendoWindow.close();
                        }
                        });*/
                    }
                });

                insuredSearchGridDataSource = new kendo.data.DataSource({
                    pageSize: 10, // The pageSize option must be specified here or paging will not work correctly
                    transport: {
                        read: {
                            url: App.getRootWebsitePath() + '/Api/Entities',
                            type: 'GET',
                            dataType: 'json',
                            contentType: 'application/json; charset=utf-8'
                        },
                        parameterMap: function (data, type) {
                            var firstName = summaryViewModel.get('insuredFirstName') || '',
								lastName = summaryViewModel.get('insuredLastName') || '';

                            if (type !== 'read') {
                                data = data.models;
                            } else {
                                data = {
                                    firstName: firstName,
                                    lastName: lastName
                                };
                            }

                            return data;
                        }
                    },
                    schema: {
                        model: { // Define the model of the data source. Required for validation and property types.
                            id: 'rowid',
                            fields: {
                                rowid: { type: 'string' },
                                firstName: { type: 'string' },
                                lastName: { type: 'string' },
                                membership: { type: 'string' },
                                birthDate: { type: 'date' }
                            }
                        }
                    },
                    requestStart: function (e) {
                        var grid = insuredSearchGrid,
							noDataRow = $(grid.tbody).find('custom-no-data-row');

                        if (noDataRow) {
                            $(grid.tbody).find('.custom-no-data-row').remove();
                        }
                    }
                });

                insuredSearchGrid.setDataSource(insuredSearchGridDataSource);

                // New Insured for Selected Entity
                insuredSearchGrid.element.on('click', '.k-grid-CreateInsured', function (gridEvent) {
                    var selectedItem = insuredSearchGrid.dataItem(insuredSearchGrid.select()),
						uid = $(gridEvent.target).closest('tr').attr('data-uid'),
						model = insuredSearchGrid.dataSource.getByUid(uid);

                    if (selectedItem !== null) {
                        OpenGeneralDialog('Adding insured...');
                        kendoWindow.close();

                        parent.location = 'Insured.aspx?entity=' + selectedItem.rowid;
                    }
                });
            });

            var driverSearchPopup = $('#driverSearchPopup').data('kendoWindow');
            driverSearchPopup.bind('activate', function (e) {
                var windowEvent = e,
					window = $(windowEvent.sender.element).closest('[data-role=window]'),
					kendoWindow = window.data('kendoWindow'),
					driverSearchGrid = window.find('#driverSearchGrid').data('kendoGrid');

                // Clear the search fields
                summaryViewModel.set('driverFirstName');
                summaryViewModel.set('driverLastName');

                if (driverSearchGrid.hasOwnProperty('dataSource')) {
                    driverSearchGrid.dataSource.data([]);
                }

                // New Driver
                driverSearchGrid.element.on('click', '.k-grid-CreateNewDriver', function (e) {
                    var window = $(e.target).closest('[data-role=window]'),
						kendoWindow = window.data('kendoWindow'),
						grid = $(e.delegateTarget).data('kendoGrid'),
						params = window.find('input[type=text]');

                    OpenGeneralDialog('Creating driver...');
                    //Upper case the First and Last name
                    $.each(params, function (i, val) {
                        params[i].value = params[i].value.toUpperCase();
                    });

                    kendoWindow.close();

                    parent.location = 'Drivers.aspx?' + params.serialize();
                });

                driverSearchGridDataSource = new kendo.data.DataSource({
                    pageSize: 10, // The pageSize option must be specified here or paging will not work correctly
                    transport: {
                        read: {
                            url: App.getRootWebsitePath() + '/Api/Entities',
                            type: 'GET',
                            dataType: 'json',
                            contentType: 'application/json; charset=utf-8'
                        },
                        parameterMap: function (data, type) {
                            var firstName = summaryViewModel.get('driverFirstName') || '',
								lastName = summaryViewModel.get('driverLastName') || '';

                            if (type !== 'read') {
                                data = data.models;
                            } else {
                                data = {
                                    firstName: firstName,
                                    lastName: lastName
                                };
                            }

                            return data;
                        }
                    },
                    schema: {
                        model: { // Define the model of the data source. Required for validation and property types.
                            id: 'rowid',
                            fields: {
                                rowid: { type: 'string' },
                                firstName: { type: 'string' },
                                lastName: { type: 'string' },
                                membership: { type: 'string' },
                                birthDate: { type: 'date' }
                            }
                        }
                    },
                    requestStart: function (e) {
                        var grid = driverSearchGrid,
							noDataRow = $(grid.tbody).find('custom-no-data-row');

                        if (noDataRow) {
                            $(grid.tbody).find('.custom-no-data-row').remove();
                        }
                    }
                });

                driverSearchGrid.setDataSource(driverSearchGridDataSource);

                // New Driver for Selected Entity
                driverSearchGrid.element.on('click', '.k-grid-CreateDriver', function (gridEvent) {
                    var selectedItem = driverSearchGrid.dataItem(driverSearchGrid.select()),
						uid = $(gridEvent.target).closest('tr').attr('data-uid'),
						model = driverSearchGrid.dataSource.getByUid(uid);

                    if (selectedItem !== null) {
                        OpenGeneralDialog('Adding driver...');
                        kendoWindow.close();

                        parent.location = 'Drivers.aspx?entity=' + selectedItem.rowid;
                    }
                });
            });

            //Load Document Repository URL
            var docuRepoLink = $('#NavigationContent_DocumentRepositoryLink');
            docuRepoLink.click(function () {
                $.ajax({
                    type: 'POST',
                    url: 'Summary.aspx/GetDocumentRepoURL',
                    contentType: 'application/json; charset=utf-8',
                    async: true,
                    success: function (data) {
                        if (data.d !== 'error') {
                            window.open(data.d);
                        } else {
                            OpenErrorDialog('No documents are available for viewing. Please prepare a document first.');
                        }
                    },
                    error: function () {
                        OpenErrorDialog('No documents are available for viewing. Please prepare a document first.');
                    }
                });
            });

            //Policy Coverage Screen
            var policyCoverage = $('#NavigationContent_PolicyCoverageLink');
            policyCoverage.click(function (e) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }

                // Open the 'Insured Search' popup window
                $('#policyCoveragePopup').data('kendoWindow').center().open();
            });

            var policyCoveragePopup = $('#policyCoveragePopup').data('kendoWindow');
            policyCoveragePopup.bind('activate', function (e) {
                var windowEvent = e,
					window = $(windowEvent.sender.element).closest('[data-role=window]'),
					kendoWindow = window.data('kendoWindow'),
					policyCoverageGrid = window.find('#policyCoverageGrid').data('kendoTotalTopGrid'),

                policyCoverageGridDataSource = new kendo.data.DataSource({
                    pageSize: 100, // The pageSize option must be specified here or paging will not work correctly
                    transport: {
                        read: {
                            url: 'Summary.aspx/GetPolicyCoverage',
                            type: 'POST',
                            dataType: 'json',
                            contentType: 'application/json; charset=utf-8'
                        }
                    },
                    group: [
                        {
                            field: "quoteName",
                            aggregates: [
                                {
                                    field: "basePremium",
                                    aggregate: "sum"
                                },
                                {
                                    field: "rated",
                                    aggregate: "sum"
                                },
                                {
                                    field: "adjusted",
                                    aggregate: "sum"
                                },
                                {
                                    field: "transaction",
                                    aggregate: "sum"
                                },
                                {
                                    field: "termPremium",
                                    aggregate: "sum"
                                }
                            ]
                        },
                        {
                            field: "vehicleName",
                            aggregates: [
                                {
                                    field: "basePremium",
                                    aggregate: "sum"
                                },
                                {
                                    field: "rated",
                                    aggregate: "sum"
                                },
                                {
                                    field: "adjusted",
                                    aggregate: "sum"
                                },
                                {
                                    field: "transaction",
                                    aggregate: "sum"
                                },
                                {
                                    field: "termPremium",
                                    aggregate: "sum"
                                }
                            ]
                        },
                        {
                            field: "type",
                            aggregates: [
                                {
                                    field: "basePremium",
                                    aggregate: "sum"
                                },
                                {
                                    field: "rated",
                                    aggregate: "sum"
                                },
                                {
                                    field: "adjusted",
                                    aggregate: "sum"
                                },
                                {
                                    field: "transaction",
                                    aggregate: "sum"
                                },
                                {
                                    field: "termPremium",
                                    aggregate: "sum"
                                }
                            ]
                        }
                    ],
                    schema: {
                        parse: function (response) {
                            var data = $.parseJSON(response.d);

                            $.each(data, function (idx, obj) {
                                if (obj.hasOwnProperty('ChangeTracker')) {
                                    delete obj.ChangeTracker;
                                }

                                if (obj.hasOwnProperty('$id')) {
                                    delete obj.$id;
                                }
                            });

                            return data;
                        },
                        model: { // Define the model of the data source. Required for validation and property types.
                            id: 'id',
                            fields: {
                                id: { type: 'string' },
                                quoteName: { type: 'string' },
                                vehicleName: { type: 'string' },
                                order: { type: 'string' },
                                type: { type: 'string' },
                                code: { type: 'string' },
                                description: { type: 'string' },
                                deductibles: { type: 'string' },
                                limits: { type: 'string' },
                                basePremium: { type: 'number' },
                                rated: { type: 'number' },
                                adjusted: { type: 'number' },
                                transaction: { type: 'number' },
                                termPremium: { type: 'number' }
                            }
                        }
                    },
                    requestStart: function (e) {
                        var grid = policyCoverageGrid,
							noDataRow = $(grid.tbody).find('custom-no-data-row');

                        if (noDataRow) {
                            $(grid.tbody).find('.custom-no-data-row').remove();
                        }
                    }
                });

                policyCoverageGrid.setDataSource(policyCoverageGridDataSource);
                policyCoverageGrid.dataSource.read();
            });


            // Load summary details
            $.ajax({
                type: 'POST',
                url: 'Summary.aspx/GetDetails',
                contentType: 'application/json; charset=utf-8',
                async: true,
                success: function (result, status, xhr) {
                    data = $.parseJSON(result.d);

                    summaryViewModel.set('userName', data.userName);
                    summaryViewModel.set('userNumber', data.userNumber);
                    summaryViewModel.set('quoteNumberLiteral', data.quoteNumber);
                    summaryViewModel.set('quoteVersionLiteral', data.quoteVersion);
                    summaryViewModel.set('quoteStatusLiteral', data.quoteStatus);
                    summaryViewModel.set('lineOfBusinessLiteral', data.lineOfBusiness);
                    summaryViewModel.set('quoteEffectiveDateLiteral', data.effectiveDate);
                    summaryViewModel.set('quoteEffectiveTimeLiteral', data.effectiveTime);
                    summaryViewModel.set('termDateLiteral', data.termDate);
                    summaryViewModel.set('brokerID', data.brokerID);
                    summaryViewModel.set('quoteId', data.quoteId);

                    if (window.location.pathname.split('/').pop() == 'ProducerAgent.aspx') {
                        // Trigger initialized event
                        var eventHandler = that.getEventHandler();

                        if (eventHandler.hasEvent('quoteDetailsLoaded')) {
                            var event = eventHandler.getEvent('quoteDetailsLoaded');
                            event.dispatch(data.quoteNumber);
                        }
                    }

                    $('#quotelink').attr('href', App.getRootWebsitePath() + '/Auto/Quote.aspx?id=' + summaryViewModel.get('quoteId'));
                }
            });

            var getAgent = function (quoteNumber) {
                $.ajax({
                    type: "POST",
                    async: true,
                    url: 'ProducerAgent.aspx/GetAgent',
                    contentType: 'application/json; charset=utf-8',
                    data: kendo.stringify({ quoteNumber: quoteNumber }),
                    dataType: 'json',
                    success: function (result, status, xhr) {
                        var viewModel = page.getBlock(page.getPrimaryBlockName()).getViewModel();

                        data = $.parseJSON(result.d);

                        viewModel.set('agentID', data.AgentInfoes[0].agentId);
                        viewModel.set('employeeNumber', data.EntityInfoes[0].employeeNumber);
                        viewModel.set('firstName', data.firstName);
                        viewModel.set('middleName', data.middleName);
                        viewModel.set('lastName', data.lastName);
                        viewModel.set('businessPhone', data.businessPhone);
                        viewModel.set('businessPhoneExtension', data.businessPhoneExtension);
                        viewModel.set('tollFreeNumber', data.tollFreeNumber);
                        viewModel.set('faxNumber', data.faxNumber);
                        viewModel.set('emailAddress', data.emailAddress);
                    }
                });
            }

            that.getEventHandler().addEventListener('quoteDetailsLoaded', getAgent, that);

            // Load summary
            $.ajax({
                type: 'POST',
                url: 'Summary.aspx/GetSummary',
                contentType: 'application/json; charset=utf-8',
                //data: kendo.stringify(entities),
                async: true,
                success: function (result, status, xhr) {
                    data = $.parseJSON(result.d);

                    $.each(entities, function (idx, entity) {
                        if (typeof sources[entity] !== 'undefined') {
                            sources[entity].data(data[entity]);
                        }
                    });

                    if (sources.insureds.total() > 0 || sources.drivers.total() > 0) {
                        $('#buttonAddDriver').addClass('sprite-plus').removeClass('sprite-plus-disabled').removeAttr('disabled');
                    }

                    if (sources.drivers.total() > 0 || sources.vehicles.total() > 0) {
                        $('#buttonAddVehicle').addClass('sprite-plus').removeClass('sprite-plus-disabled').removeAttr('disabled');
                    }

                    if (sources.vehicles.total() == 0) {
                        $('#NavigationContent_PolicyCoverageLink').attr('Visible', false);
                    }

                    if (sources.vehicles.total() > 0 || sources.claims.total() > 0) {
                        $('#buttonAddClaim').addClass('sprite-plus').removeClass('sprite-plus-disabled').removeAttr('disabled');
                    }
                }
            });

            // Trigger pageLoaded event on widgets
            /*$.each(widgetTypes, function (widgetRole, widgetConfig) {
            if (widgetConfig.hasOwnProperty('type')) {
            widgets = module.find('.k-widget [data-role=' + widgetRole + ']');

            if (widgets) {
            widgets.each(function (idx, widget) {
            $(widget).data(widgetConfig.type).trigger('pageLoaded');
            });
            }
            }
            });*/

            var router = App.getRouter(),
				l = window.location,
				url = l.protocol + '//' + l.hostname + l.pathname + l.search + l.hash,
				firstName,
				lastName,
				newInsured;

            $.each(router.routes(), function (idx, route) {
                if (route.match('Quote.aspx')) {
                    // Do something
                } else if (route.match('Auto/Insured.aspx') && route.match(url)) {
                    firstName = getParameter('insuredSearchFirstName');
                    lastName = getParameter('insuredSearchLastName');
                    newInsured = getParameter('newInsured');

                    if (firstName !== null) {
                        viewModel.set('firstName', firstName);
                        $('#firstName').val(firstName);
                    }

                    if (lastName !== null) {
                        viewModel.set('lastName', lastName);
                        $('#lastName').val(lastName);
                    }

                    if (newInsured !== null) {
                        messaging = $('#messaging');

                        messaging.find('.messaging-left').find('img').attr('src', '../Images/kuba_ok.png');
                        messaging.find('.messaging-right').first().find('h2').text('Success').end()
								.next('.messaging-right').text('Your changes have been saved!');

                        messaging.show();
                    }
                } else if (route.match('Auto/Drivers.aspx') && route.match(url)) {
                    firstName = getParameter('driverSearchFirstName');
                    lastName = getParameter('driverSearchLastName');

                    if (firstName !== null) {
                        viewModel.set('firstName', firstName);
                        $('#firstName').val(firstName);
                    }

                    if (lastName !== null) {
                        viewModel.set('lastName', lastName);
                        $('#lastName').val(lastName);
                    }
                } else if (route.match('Auto/Vehicles.aspx') && route.match(url)) {
                    // Do something
                } else if (route.match('Auto/Claims.aspx') && route.match(url)) {
                    // Do something
                } else if (route.match('Auto/Journals.aspx') && route.match(url)) {
                    // Do something
                } else if (route.match('Auto/RelatedPolicies.aspx') && route.match(url)) {
                    // Do something
                }
            });

            module.on('click', '.control.delete', function (e) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }

                var el = $(this),
					itemId = el.attr('data-id'),
					url = el.attr('data-url'),
                    type = el.attr('data-entity-type'),
                    targetPage = type + '.aspx',
					message = el.attr('data-message');


                $.ajax({
                    type: 'POST',
                    url: url,
                    async: true,
                    data: kendo.stringify({ id: itemId }),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    beforeSend: function () {
                        OpenGeneralDialog(message);
                    },
                    complete: function () {
                        CloseGeneralDialog();
                    },
                    success: function (result, status, xhr) {
                        var listview = el.closest('.k-listview').data('kendoObservingListView'),
							item = el.closest('[role=option]'),
							id = App.Helpers.URL.getParam('id'),
							page = App.getCurrent(),
							viewModel = page.getBlock('center-pane').getViewModel();

                        listview.remove(item);

                        if (listview.dataSource._data.length == 0) {
                            $('#NavigationContent_PolicyCoverageLink').hide();
                        }

                        // Are we deleting the current, active page?
                        if ((id === itemId && id !== null) ||
                            (id === null && location.pathname.split('/').pop() === targetPage)) {
                            // Redirect to Quote on success
                            window.location = App.getRootWebsitePath() + '/Auto/Quote.aspx?id=' + summaryViewModel.get('quoteId');
                        }

                        // If the primary insured was deleted, another primary will be set. We need to refresh the data to reflect the icon change.
                        if (type === 'Insured') {
                            $('#summary-insureds').data('kendoObservingListView').dataSource.read();
                        }
                    }
                });
            });

            that.getEventHandler().addEventListener('update', function () {
                var viewModel = that.getViewModel(),
					source = viewModel.get('summaryDriversSource'),
					total = 0;

                source.read();
                total = source._data.length; // TODO: drivers.total() should work!

                if (total > 0) {
                    $('#buttonAddVehicle').addClass('sprite-plus').removeClass('sprite-plus-disabled').removeAttr('disabled');
                }
            });

            page.subscribe(that.getId(), that);
        },
        initialized: function () {
            // Do something
        }
    },
    layout: {
        templates: {
            tag: 'section',
            class: 'summary clearfix',
            parts: [
				{
				    tag: 'ul',
				    class: 'summary-header title',
				    items: [
						{
						    tag: 'li',
						    class: 'title',
						    text: 'Details'
						},
						{
						    tag: 'li',
						    class: 'link',
						    items: [
								{
								    tag: 'a',
								    class: 'link',
								    id: 'quotelink',
								    href: 'Quote.aspx',
								    text: 'View Details'
								}
							]
						}
					]
				},
				{
				    tag: 'div',
				    id: 'summary-details',
				    class: 'summary-detail',
				    items: [
						{
						    tag: 'li',
						    items: [
								{
								    tag: 'span',
								    class: 'detail',
								    items: [
										{
										    tag: 'span',
										    id: 'quoteStatus',
										    name: 'quoteStatus',
										    data: {
										        bind: {
										            text: 'quoteStatusLiteral'
										        }
										    }
										}
									]
								},
								{
								    tag: 'span',
								    class: 'detail',
								    style: 'margin-left: 5px',
								    items: [
										{
										    tag: 'span',
										    id: 'quoteNumber',
										    name: 'quoteNumber',
										    data: {
										        bind: {
										            text: 'quoteNumberLiteral'
										        }
										    }
										}
									]
								},
								{
								    tag: 'span',
								    class: 'detail',
								    style: 'margin-left: 5px',
								    text: 'Ver: ',
								    items: [
										{
										    tag: 'span',
										    id: 'quoteVersion',
										    name: 'quoteVersion',
										    data: {
										        bind: {
										            text: 'quoteVersionLiteral'
										        }
										    }
										}
									]
								},
								{
								    tag: 'span',
								    class: 'detail',
								    style: 'margin-left: 5px',
								    items: [
										{
										    tag: 'span',
										    id: 'lineOfBusiness',
										    name: 'lineOfBusiness',
										    data: {
										        bind: {
										            text: 'lineOfBusinessLiteral'
										        }
										    }
										}
									]
								}
							]
						},
						{
						    tag: 'li',
						    items: [
								{
								    tag: 'span',
								    class: 'detail',
								    text: 'Effective Date: ',
								    items: [
										{
										    tag: 'span',
										    id: 'effectiveDate',
										    name: 'effectiveDate',
										    data: {
										        bind: {
										            text: 'quoteEffectiveDateLiteral'
										        }
										    }
										}
									]
								},
								{
								    tag: 'span',
								    class: 'detail',
								    style: 'margin-left: 5px',
								    items: [
										{
										    tag: 'span',
										    id: 'effectiveTime',
										    name: 'effectiveTime',
										    data: {
										        bind: {
										            text: 'quoteEffectiveTimeLiteral'
										        }
										    }
										}
									]
								}
							]
						},
						{
						    tag: 'li',
						    items: [
								{
								    tag: 'span',
								    class: 'detail',
								    text: 'Term Date: ',
								    items: [
										{
										    tag: 'span',
										    id: 'termDate',
										    name: 'termDate',
										    data: {
										        bind: {
										            text: 'termDateLiteral'
										        }
										    }
										}
									]
								}
							]
						}
					]
				},
				{
				    tag: 'ul',
				    class: 'summary-header title',
				    items: [
						{
						    tag: 'li',
						    class: 'title',
						    text: 'Producer & Agent'
						},
						{
						    tag: 'li',
						    class: 'link',
						    items: [
								{
								    tag: 'button',
								    type: 'button',
								    id: 'buttonProducerAgent',
								    name: 'buttonOpenProducerAgent',
								    class: 'sprite sprite-open',
								    data: {
								        bind: {
								            events: {
								                click: function (e) {
								                    var viewModel = e.data;

								                    if (e.preventDefault) {
								                        e.preventDefault();
								                    } else {
								                        e.returnValue = false;
								                    }

								                    parent.location = 'ProducerAgent.aspx?id=' + viewModel.get('brokerID');
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
				    tag: 'ul',
				    class: 'summary-header title',
				    items: [
						{
						    tag: 'li',
						    class: 'title',
						    text: 'Insured'
						},
						{
						    tag: 'li',
						    class: 'link',
						    items: [
								{
								    tag: 'button',
								    type: 'button',
								    id: 'buttonAddInsured',
								    name: 'buttonAddInsured',
								    class: 'sprite sprite-plus',
								    data: {
								        bind: {
								            events: {
								                click: function (e) {
								                    var params = App.Helpers.URL.getParams(),
														page = App.getCurrent();

								                    if (e.preventDefault) {
								                        e.preventDefault();
								                    } else {
								                        e.returnValue = false;
								                    }

								                    // Open the 'Insured Search' popup window
								                    $('#insuredSearchPopup').data('kendoWindow').center().open();
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
				    id: 'summary-insureds',
				    name: 'summary-insureds',
				    class: 'summary-detail',
				    data: {
				        role: 'observinglistview',
				        bind: {
				            source: {
				                type: 'method',
				                config: {
				                    transport: {
				                        read: {
				                            url: 'Summary.aspx/GetInsureds'
				                        }
				                    }
				                }
				            },
				            observables: [
								{
								    type: 'page'
								},
				            /*{
				            type: 'module',
				            name: 'autoplus'
				            }*/
							]
				        },
				        template: {
				            id: 'summary-item-template',
				            source: 'summary-item.tmpl.htm'
				        },
				        autoBind: false
				    }
				},
				{
				    tag: 'ul',
				    class: 'summary-header title',
				    items: [
						{
						    tag: 'li',
						    class: 'title',
						    text: 'Drivers'
						},
						{
						    tag: 'li',
						    class: 'link',
						    items: [
								{
								    tag: 'button',
								    type: 'button',
								    id: 'buttonAddDriver',
								    name: 'buttonAddDriver',
								    class: 'sprite sprite-plus-disabled',
								    data: {
								        bind: {
								            events: {
								                click: function (e) {
								                    var params = App.Helpers.URL.getParams(),
														page = App.getCurrent();

								                    if (e.preventDefault) {
								                        e.preventDefault();
								                    } else {
								                        e.returnValue = false;
								                    }

								                    // Open the 'Driver Search' popup window
								                    $('#driverSearchPopup').data('kendoWindow').center().open();
								                }
								            }
								        }
								    },
								    disabled: true
								}
							]
						}
					]
				},
				{
				    tag: 'div',
				    id: 'summary-drivers',
				    name: 'summary-drivers',
				    class: 'summary-detail',
				    data: {
				        role: 'observinglistview',
				        bind: {
				            source: {
				                type: 'method',
				                config: {
				                    transport: {
				                        read: {
				                            url: 'Summary.aspx/GetDrivers'
				                        }
				                    }
				                }
				            },
				            observables: [
								{
								    type: 'page'
								},
				            /*{
				            type: 'module',
				            name: 'autoplus'
				            }*/
							]
				        },
				        template: {
				            id: 'summary-item-template',
				            source: 'summary-item.tmpl.htm'
				        },
				        autoBind: false
				    }
				},
				{
				    tag: 'ul',
				    class: 'summary-header title',
				    items: [
						{
						    tag: 'li',
						    class: 'title',
						    text: 'Vehicles'
						},
						{
						    tag: 'li',
						    class: 'link',
						    items: [
								{
								    tag: 'button',
								    type: 'button',
								    id: 'buttonAddVehicle',
								    name: 'buttonAddVehicle',
								    class: 'sprite sprite-plus-disabled',
								    data: {
								        bind: {
								            events: {
								                click: function (e) {
								                    var params = App.Helpers.URL.getParams(),
														page = App.getCurrent();

								                    if (e.preventDefault) {
								                        e.preventDefault();
								                    } else {
								                        e.returnValue = false;
								                    }

								                    // Open the 'Vehicle Risk Type' popup window
								                    $('#vehicleRiskTypePopup').data('kendoWindow').center().open();
								                }
								            }
								        }
								    },
								    disabled: true
								}
							]
						}
					]
				},
				{
				    tag: 'div',
				    id: 'summary-vehicles',
				    name: 'summary-vehicles',
				    class: 'summary-detail',
				    data: {
				        role: 'observinglistview',
				        bind: {
				            source: {
				                type: 'method',
				                config: {
				                    transport: {
				                        read: {
				                            url: 'Summary.aspx/GetVehicles'
				                        }
				                    }
				                }
				            },
				            observables: [
								{
								    type: 'page'
								},
				            /*{
				            type: 'module',
				            name: 'autoplus'
				            }*/
							]
				        },
				        template: {
				            id: 'summary-item-vehicle-template',
				            source: 'summary-item-vehicle.tmpl.htm'
				        },
				        autoBind: false
				    }
				},
				{
				    tag: 'ul',
				    class: 'summary-header title',
				    items: [
						{
						    tag: 'li',
						    class: 'title',
						    text: 'Claim History'
						},
						{
						    tag: 'li',
						    class: 'link',
						    items: [
								{
								    tag: 'button',
								    type: 'button',
								    id: 'buttonAddClaim',
								    name: 'buttonAddClaim',
								    class: 'sprite sprite-plus-disabled',
								    data: {
								        bind: {
								            events: {
								                click: function (e) {
								                    if (e.preventDefault) {
								                        e.preventDefault();
								                    } else {
								                        e.returnValue = false;
								                    }

								                    OpenGeneralDialog('Creating claim...');
								                    parent.location = 'Claims.aspx';
								                }
								            }
								        }
								    },
								    disabled: true
								}
							]
						}
					]
				},
				{
				    tag: 'div',
				    id: 'summary-claims',
				    name: 'summary-claims',
				    class: 'summary-detail',
				    data: {
				        role: 'observinglistview',
				        bind: {
				            source: {
				                type: 'method',
				                config: {
				                    transport: {
				                        read: {
				                            url: 'Summary.aspx/GetClaims'
				                        }
				                    }
				                }
				            },
				            observables: [
								{
								    type: 'page'
								},
				            // TODO: Fix observables!
				            /*{
				            type: 'module',
				            name: 'autoplus'
				            }*/
							]
				        },
				        template: {
				            id: 'summary-item-template',
				            source: 'summary-item.tmpl.htm'
				        },
				        autoBind: false
				    }
				},
				{
				    tag: 'ul',
				    class: 'summary-header title',
				    items: [
						{
						    tag: 'li',
						    class: 'title',
						    text: 'Journals'
						},
						{
						    tag: 'li',
						    class: 'link',
						    items: [
								{
								    tag: 'button',
								    type: 'button',
								    id: 'buttonAddJournal',
								    name: 'buttonAddJournal',
								    class: 'sprite sprite-open',
								    data: {
								        bind: {
								            events: {
								                click: function (e) {
								                    if (e.preventDefault) {
								                        e.preventDefault();
								                    } else {
								                        e.returnValue = false;
								                    }

								                    OpenGeneralDialog('Loading journals...');
								                    parent.location = 'Journals.aspx';
								                }
								            }
								        }
								    }
								}
							]
						}
					]
				},
            // MOD: Use if editing journals in entity (ListView) mode
            // NOTE: Editing journals in entity mode has not been implemented server-side
            // Enabling this change will simply display a ListView item for each journal entry
            /*
            {
            tag: 'ul',
            class: 'summary-header title',
            items: [
            {
            tag: 'li',
            class: 'title',
            text: 'Journals'
            },
            {
            tag: 'li',
            class: 'link',
            items: [
            {
            tag: 'button',
            id: 'buttonAddJournal',
            name: 'buttonAddJournal',
            class: 'sprite sprite-plus',
            data: {
            bind: {
            events: {
            click: function (e) {
            if (e.preventDefault) {
            e.preventDefault();
            } else {
            e.returnValue = false;
            }

            OpenGeneralDialog('Creating journal...');
            parent.location = 'Journals.aspx';
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
            id: 'summary-journals',
            name: 'summary-journals',
            class: 'summary-detail',
            data: {
            role: 'observinglistview',
            bind: {
            source: {
            type: 'method',
            config: {
            transport: {
            read: {
            url: 'Summary.aspx/GetJournals'
            }
            }
            }
            }
            },
            template: {
            id: 'summary-item-template',
            source: 'summary-item.tmpl.htm'
            },
            autoBind: false
            }
            },*/
				{
				tag: 'ul',
				class: 'summary-header title',
				items: [
						{
						    tag: 'li',
						    class: 'title',
						    text: 'Related Policies'
						},
						{
						    tag: 'li',
						    class: 'link',
						    items: [
								{
								    tag: 'button',
								    type: 'button',
								    id: 'buttonRelatedPolicies',
								    name: 'buttonOpenRelatedPolicies',
								    class: 'sprite sprite-open',
								    data: {
								        bind: {
								            events: {
								                click: function (e) {
								                    if (e.preventDefault) {
								                        e.preventDefault();
								                    } else {
								                        e.returnValue = false;
								                    }

								                    OpenGeneralDialog('Loading related policies...');
								                    parent.location = 'RelatedPolicies.aspx';
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
                    tag: 'ul',
                    class: 'summary-header title',
                    items: [
						{
						    tag: 'li',
						    class: 'title',
						    text: 'Documents'
						},
						{
						    tag: 'li',
						    class: 'link',
						    items: [
								{
								    tag: 'button',
								    type: 'button',
								    id: 'buttonDocuments',
								    name: 'buttonOpenDocuments',
								    class: 'sprite sprite-open',
								    data: {
								        bind: {
								            events: {
								                click: function (e) {
								                    if (e.preventDefault) {
								                        e.preventDefault();
								                    } else {
								                        e.returnValue = false;
								                    }

								                    OpenGeneralDialog('Loading documents...');
								                    parent.location = 'DocumentsPackage.aspx';
								                }
								            }
								        }
								    }
								}
							]
						}
					]
                },
            // TODO: Blocks elements with binding parameters that are
            // nested in modules need to be databound to the module
            // Blocks are fully functional within pages
            /*{
            tag: 'section',
            id: 'test-blocks',
            blocks: [
            {
            block: 'fieldgrouprow',
            config: {
            items: [
            {
            id: 'testfield1',
            name: 'testfield1',
            label: 'Test Field 1',
            tag: 'input', // Types: any standard HTML5 form element or Kendo UI widget
            type: 'text',
            data: {
            bind: 'testfield1'
            }
            },
            {
            id: 'testfield2',
            name: 'testfield2',
            label: 'Test Field 2',
            tag: 'input',
            type: 'text',
            data: {
            bind: 'testfield2'
            }
            },
            {
            id: 'testfield3',
            name: 'testfield3',
            label: 'Test Field 3',
            tag: 'input',
            type: 'text',
            data: {
            bind: 'testfield3'
            }
            }
            ]
            }
            },
            {
            block: 'autorow',
            config: {
            items: [
            {
            id: 'testfield10',
            name: 'testfield10',
            label: 'Test Field 10',
            tag: 'input', // Types: any standard HTML5 form element or Kendo UI widget
            type: 'text'
            },
            {
            id: 'testfield11',
            name: 'testfield11',
            label: 'Test Field 11',
            tag: 'input',
            type: 'text'
            },
            {
            id: 'testfield12',
            name: 'testfield12',
            label: 'Test Field 12',
            tag: 'input',
            type: 'text'
            }
            ]
            }
            }
            ]
            },*/
            // START Popups
            // Popup - Insured Search
				{
				tag: 'div',
				id: 'insuredSearchPopup',
				name: 'insuredSearchPopup',
				//style: 'display: none',
				data: {
				    role: 'window',
				    appendTo: '#module_summary_1',
				    modal: true,
				    visible: false,
				    resizable: false,
				    draggable: true,
				    title: 'Insured Search',
				    width: 860
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
								        id: 'insuredSearchFirstName',
								        name: 'insuredSearchFirstName',
								        label: 'First Name',
								        tag: 'input',
								        type: 'text',
								        class: 'medium',
								        data: {
								            bind: 'insuredFirstName'
								        }
								    }]
								},
								{
								    tag: 'div',
								    class: 'fieldgroup',
								    group: [{
								        id: 'insuredSearchLastName',
								        name: 'insuredSearchLastName',
								        label: 'Last/Company Name',
								        tag: 'input',
								        type: 'text',
								        class: 'medium',
								        data: {
								            bind: 'insuredLastName'
								        }
								    }]
								},
								{
								    tag: 'div',
								    class: 'fieldgroup',
								    group: [{
								        id: 'insuredSearchButton',
								        name: 'insuredSearchButton',
								        tag: 'button',
								        type: 'button',
								        label: '\u00a0',
								        text: 'Search',
								        class: 'k-button right',
								        data: {
								            bind: {
								                events: {
								                    click: function (e) {
								                        var grid = $('#insuredSearchGrid').data('kendoGrid');

								                        e.preventDefault();
								                        e.stopPropagation();

								                        // Clear the grid and reset the pagination
								                        grid.dataSource.data([]);
								                        grid.dataSource.page(1);
								                        grid.dataSource.read();
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
								    id: 'insuredSearchGrid',
								    name: 'insuredSearchGrid',
								    class: 'max-height-350 scroll-y',
								    data: {
								        role: 'grid',
								        bind: {
								            events: {
								                dataBound: function (e) {
								                    var grid = e.sender,
                                                        dataSource = e.sender.dataSource,
                                                        insuredFirstName = this.get('insuredFirstName') || '',
                                                        insuredLastName = this.get('insuredLastName') || '',
                                                        columnCount;

								                    if (dataSource.data().length === 0) {
								                        // Did the user execute a search?
								                        if (!(insuredFirstName === '' && insuredLastName === '')) {
								                            columnCount = $(grid.thead.get(0)).children('tr').first().children('th').length;

								                            $(grid.tbody.get(0)).append(
															    kendo.format("<tr class='custom-no-data-row'><td colspan='{0}' style='text-align:center'>No existing insured were found.</td></tr>", columnCount)
														    );
								                        }
								                    }

								                }
								            }
								        },
								        autoBind: false,
								        filterable: true,
								        sortable: true,
								        scrollable: true,
								        pageable: {
								            pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
								            pageSizes: [10, 25, 50]
								        },
								        selectable: true,
								        toolbar: [{ text: 'Person' }, { text: 'Company'}],
								        columns: [
											{
											    field: 'firstName',
											    title: 'First Name'
											},
											{
											    field: 'lastName',
											    title: 'Last/Company Name'
											},
											{
											    field: 'membership',
											    title: 'Membership'
											},
											{
											    field: 'birthDate',
											    title: 'Birth Date',
											    template: '#= kendo.toString(birthDate, "dd/MM/yyyy") #'
											},
											{
											    command: [{ text: 'Create Insured'}],
											    title: '&nbsp;',
											    width: '165px'
											}
										]
								    }
								}
							]
						}
					]
},
            // Popup - Driver Search
				{
				tag: 'div',
				id: 'driverSearchPopup',
				name: 'driverSearchPopup',
				//style: 'display: none',
				data: {
				    role: 'window',
				    appendTo: '#module_summary_1',
				    modal: true,
				    visible: false,
				    resizable: false,
				    draggable: true,
				    title: 'Driver Search',
				    width: 640
				},
				fieldgroups: [
						{
						    tag: 'div',
						    text: 'Search to see if the person already exists in the AMA system.',
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
								        id: 'driverSearchFirstName',
								        name: 'driverSearchFirstName',
								        label: 'First Name',
								        tag: 'input',
								        type: 'text',
								        class: 'medium',
								        value: '',
								        data: {
								            bind: 'driverFirstName'
								        }
								    }]
								},
								{
								    tag: 'div',
								    class: 'fieldgroup',
								    group: [{
								        id: 'driverSearchLastName',
								        name: 'driverSearchLastName',
								        label: 'Last Name',
								        tag: 'input',
								        type: 'text',
								        class: 'medium',
								        data: {
								            bind: 'driverLastName'
								        }
								    }]
								},
								{
								    tag: 'div',
								    class: 'fieldgroup',
								    group: [{
								        id: 'driverSearchButton',
								        name: 'driverSearchButton',
								        tag: 'button',
								        type: 'button',
								        label: '\u00a0',
								        text: 'Search',
								        class: 'k-button right',
								        data: {
								            bind: {
								                events: {
								                    click: function (e) {
								                        var grid = $('#driverSearchGrid').data('kendoGrid');

								                        e.preventDefault();
								                        e.stopPropagation();

								                        // Clear the grid and reset the pagination
								                        grid.dataSource.data([]);
								                        grid.dataSource.page(1);
								                        grid.dataSource.read();
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
								    id: 'driverSearchGrid',
								    name: 'driverSearchGrid',
								    class: 'max-height-350 scroll-y',
								    data: {
								        role: 'grid',
								        bind: {
								            events: {
								                dataBound: function (e) {
								                    var grid = e.sender,
                                                        dataSource = e.sender.dataSource,
                                                        driverFirstName = this.get('driverFirstName') || '',
                                                        driverLastName = this.get('driverLastName') || '',
                                                        columnCount;

								                    if (dataSource.data().length === 0) {
								                        // Did the user execute a search?
								                        if (!(driverFirstName === '' && driverLastName === '')) {
								                            columnCount = $(grid.thead.get(0)).children('tr').first().children('th').length;

								                            $(grid.tbody.get(0)).append(
															    kendo.format("<tr class='custom-no-data-row'><td colspan='{0}' style='text-align:center'>No existing drivers were found.</td></tr>", columnCount)
														    );
								                        }
								                    }
								                }
								            }
								        },
								        autoBind: false,
								        filterable: true,
								        sortable: true,
								        scrollable: true,
								        pageable: {
								            pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
								            pageSizes: [10, 25, 50]
								        },
								        selectable: true,
								        toolbar: [{ text: 'Create New Driver'}],
								        columns: [
											{
											    field: 'firstName',
											    title: 'First Name'
											},
											{
											    field: 'lastName',
											    title: 'Last Name'
											},
											{
											    field: 'birthDate',
											    title: 'Birth Date',
											    template: '#= kendo.toString(birthDate, "dd/MM/yyyy") #'
											},
											{
											    command: [{ text: 'Create Driver'}],
											    title: '&nbsp;',
											    width: '165px'
											}
										]
								    }
								}
							]
						}
					]
},
            // Popup - Vehicle Risk Type
				{
				tag: 'div',
				id: 'vehicleRiskTypePopup',
				name: 'vehicleRiskTypePopup',
				//style: 'display: none',
				data: {
				    role: 'window',
				    appendTo: '#module_summary_1',
				    modal: true,
				    visible: false,
				    resizable: false,
				    draggable: true,
				    title: 'Vehicle Risk Type',
				    width: 640
				},
				fieldgroups: [
						{
						    tag: 'div',
						    text: 'Please choose a risk type.',
						    style: 'margin: 10px 0 20px'
						},
						{
						    tag: 'div',
						    class: 'kpaf-row',
						    fields: [
								{
								    id: 'vehicleRiskTypes',
								    name: 'vehicleRiskTypes',
								    tag: 'ul',
								    data: {
								        role: 'vehiclerisktype',
								        selectable: true,
								        template: {
								            id: 'default-listview-item-template',
								            source: 'default-listview-item.tmpl.htm'
								        }
								    }
								}
							]
						},
						{
						    tag: 'div',
						    class: 'kpaf-row',
						    fields: [
								{
								    id: 'vehicleRiskTypeSelect',
								    name: 'vehicleRiskTypeSelect',
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
								                    var window = $(e.sender.element).closest('[data-role=window]'),
														kendoWindow = window.data('kendoWindow'),
														vehicleRiskTypes = window.find('#vehicleRiskTypes').data('kendoListView'),
														selectedItem = vehicleRiskTypes.select(),
														riskType;

								                    if (selectedItem !== null) {
								                        riskType = selectedItem.attr('data-value');

								                        $.ajax({
								                            url: App.getRootWebsitePath() + '/Api/Vehicle',
								                            contentType: 'application/json; charset=utf-8',
								                            type: 'POST',
								                            dataType: 'json',
								                            data: JSON.stringify({ riskType: riskType }),
								                            beforeSend: function () {
								                                OpenGeneralDialog('Please wait while we create a new vehicle...');
								                                kendoWindow.close();
								                            },
								                            error: function (xhr, status, message) {
								                                CloseGeneralDialog();
								                            },
								                            success: function (data, status, xhr) {
								                                CloseGeneralDialog();

								                                parent.location = 'Vehicles.aspx?id=' + data.Vehicle_Id;
								                            }
								                        });
								                    }
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
                    id: 'policyCoveragePopup',
                    name: 'policyCoveragePopup',
                    //style: 'display: none',
                    data: {
                        role: 'window',
                        appendTo: '#module_summary_1',
                        modal: true,
                        visible: false,
                        resizable: false,
                        draggable: true,
                        title: 'Policy Coverages',
                        width: 1080
                    },
                    fieldgroups: [
						{
						    tag: 'div',
						    text: '',
						    style: 'margin: 10px 0 20px'
						},
						{
						    tag: 'div',
						    class: 'kpaf-row',
						    fields: [
                                {
                                    tag: 'div',
                                    name: 'policyCoverageGrid',
                                    id: 'policyCoverageGrid',
                                    class: '',
                                    data: {
                                        role: 'totaltopgrid',
                                        autoBind: false,
                                        bind: {
                                            events: {
                                                dataBound: function (e) {
                                                    var grid = $("#policyCoverageGrid").data("kendoTotalTopGrid"),
                                                        dataSource = e.sender.dataSource;

                                                    if (dataSource.group().length > 0) {
                                                        var groups = $(".k-grouping-row:contains('Vehicle')");
                                                        groups.each(function (index, element) {
                                                            grid.collapseGroup(element);
                                                        });

                                                    }
                                                }
                                            }
                                        },
                                        groupable: false,
                                        sortable: false,
                                        scrollable: true,
                                        width: 1000,
                                        height: 500,
                                        selectable: false,
                                        columns: [
                                            {
                                                field: 'quoteName',
                                                hidden: true,
                                                groupHeaderTemplate: "<strong>#= value #</strong>"
                                            },
                                            {
                                                field: 'vehicleName',
                                                hidden: true,
                                                groupHeaderTemplate: "<strong>#= value #</strong>"
                                            },
                                            {
                                                field: 'type',
                                                hidden: true,
                                                groupHeaderTemplate: "<strong>#= value #</strong>"
                                            },
                                            {
                                                field: 'order',
                                                hidden: true
                                            },
                                            {
                                                field: 'description',
                                                title: 'Coverage',
                                                width: '400px'
                                            },
										    {
										        field: 'limits',
										        title: 'Limit',
										        width: '100px',
										        template: '#=kendo.toString(limits, "c0")#'
										    },
										    {
										        field: 'deductibles',
										        title: 'Deduct',
										        width: '100px',
										        template: '#=kendo.toString(deductibles, "c0")#'
										    },
                                            {
                                                field: 'basePremium',
                                                title: 'Base Prem',
                                                width: '100px',
                                                template: '#=kendo.toString(kendo.parseInt(basePremium), "c0")#'
                                            },
                                            {
                                                field: 'rated',
                                                title: 'Rated',
                                                width: '100px',
                                                template: '#=kendo.toString(kendo.parseInt(rated), "c0")#'
                                            },
                                            {
                                                field: 'adjusted',
                                                title: 'Adjusted',
                                                width: '100px',
                                                template: '#=kendo.toString(kendo.parseInt(adjusted), "c0")#'
                                            },
                                            {
                                                field: 'transaction',
                                                title: 'Transaction Premium',
                                                width: '160px',
                                                template: '#=kendo.toString(kendo.parseInt(transaction), "c0")#'
                                            },
                                            {
                                                field: 'termPremium',
                                                title: 'Total Term Premium',
                                                width: '160px',
                                                template: '#=kendo.toString(kendo.parseInt(termPremium), "c0")#'
                                            }

									    ]
                                    }
                                }
							]
						}
					]
                }
			]
        }
    }
});

var getParameter = function(name) {
    name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
        results = regex.exec(location.search);

    if (results !== null) {
        decodeURIComponent(results[1].replace(/\+/g, " "));
        return results[1];
    }
        
    return null;
};