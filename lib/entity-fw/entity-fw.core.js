/**
 *	Entity Framework for Kendo UI Paged Applications
 *
 *	@author Lucas Lopatka
 *	@version 1.0
 *
 *	All entities should have the following functions:
 *  	entity_create
 *  	entity_load_json
 *  	entity_update(entity_type, entity_id, values)
 *  	entity_delete(entity_type, entity_id)
 */

(function ($, evil, undefined) {
    // Define helper functions for older browsers
    if (!Object.hasOwnProperty('create')) {
		console.log("no Object.create method");
        Object.create = function (parentObj) {
            function tmpObj() {}
            tmpObj.prototype = parentObj;
            return new tmpObj();
        };
    }
    if (!Object.hasOwnProperty('defineProperties')) {
        Object.defineProperties = function (obj, props) {
            for (var prop in props) {
                Object.defineProperty(obj, prop, props[prop]);
            }
        };
    }
	
	var EntityFramework = window.EntityFramework = window.EntityFramework || {
		init: function () {
        },
        // Create a new entity by supplying an array of arguments. Returns a success/failure response.
        entity_create: function (entity_type, values) {
            Object.create(entity_type);
        },
        // Loads JSON data into an entity, without updating. Creates an entity if no entity_id is provided.
        entity_load_json: function (entity_type, entity_id, data) {
        },
        // This returns a dump of JSON for the entire entity.
        entity_dump_json: function (entity_type, entity_id) {
        },
        // Update an existing entity using an array of arguments. Returns a success/failure response.
        entity_update: function (entity_type, entity_id, values) {
        },
        // Delete an entity by providing its entity type and unique id. Returns a success/failure response. 
        entity_delete: function (entity_type, entity_id) {
        },
        entity_clone: function (entity_type, entity_id) {
        }
	};
	
	EntityFramework.Entities = EntityFramework.Entities || {};
	
	// Let's define some basic entity types
	// First, define a base class to inherit from
    EntityFramework.Entities.Base = {
		type: 'Base',
		map: function () {
			return null;
		},
		init: function() {
			$.each(this.map(), function(i, obj) {
			
				if (!this.hasOwnProperty(obj.type)) {
					//console.log(obj);
				}
				
			});
			
			return this;
		},
		datasource: new kendo.data.DataSource({
			transport: {
				create: '',
				read: '',
				update: '',
				destroy: '',
				// WTF is this anyway?
				parameterMap: function (options, operation) {
					if (operation !== "read" && options.models) {
						return {
							models: kendo.stringify(options.models)
						};
					}
					return options;
				}
			},
			//schema: {},
			/**
			 *	Event: change
			 *	Fired when the data source is populated from a JavaScript array or a remote service, a data item is inserted, updated or removed, the data items are paged, sorted, filtered or grouped.
			 *	The event handler function context (available via the this keyword) will be set to the data source instance.
			 */
			change: function () {
			},
			/**
			 *	Event: error
			 *	Fired when a request to the remote service fails.
			 *	The event handler function context (available via the this keyword) will be set to the data source instance.
			 */
			error: function () {
			},
			/**
			 *	Event: requestEnd
			 *	Fired when a request to the remote service fails.
			 *	The event handler function context (available via the this keyword) will be set to the data source instance.
			 */
			requestEnd: function() {
			},
			/**
			 *	Event: requestStart
			 *	Fired when the data source makes a remote service request.
			 *	The event handler function context (available via the this keyword) will be set to the data source instance.
			 */
			requestStart: function() {
			},
			/**
			 *	Event: sync
			 *	Fired after the data source saves data item changes. The data source saves the data item changes when the sync method is called.
			 *	The event handler function context (available via the this keyword) will be set to the data source instance.
			 */
			sync: function() {
			}
		})
	};
    
    EntityFramework.Entities.AutoInfo = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'AutoInfo'
		}
	});
	
	EntityFramework.Entities.AutoPolicyClaim = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'AutoPolicyClaim'
		},
		map: {
			value: function () {
				return {
					type: 'AutoPolicyClaim',
					id: '',
					lossDate: '',
					amountPaid: '',
					driverID: '',
					driverName: '',
					ratedVehicleID: '',
					claimVehicleID: '',
					ignore: '',
					AutoQuote_Id: '',
					createdOn: '',
					lastModified: '',
					rowid: '',
					claimNumber: '',
					source: '',
					sectionAAmount: '',
					sectionCAmount: '',
					chargesLaid: '',
					chargesLaidDetails: '',
					ignoreReason: '',
					isSectionA: '',
					isSectionC: '',
					lossCause: '',
					lossType: '',
					atFaultPercent: ''
				};
			}
		}
	});
	
	EntityFramework.Entities.AutoQuote = Object.create(EntityFramework.Entities.Base, {
        type: {
			value: 'AutoQuote'
		},
		map: {
			value: function () {
				return {
					AutoQuote_Id: '',
					quoteNumber: '',
					quoteVersion: '',
					quoteStatus: '',
					lineOfBusiness: '',
					termEffectiveDate: '',
					termEffectiveTime: '',
					termExpiryDate: '',
					versionEffectiveDate: '',
					expiryDate: '',
					jurisdiction: '',
					language: '',
					quoteRate: '',
					quoteGroup: '',
					createdOn: '',
					lastModified: '',
					rowid: '',
					term: '',
					promoCode: '',
					annualPremium: '',
					proratedPremium: '',
					termPremium: '',
					tallyPremium: '',
					returnedPremium: '',
					adjustedPremium: '',
					ratedPremium: '',
					fulltermPremium: ''
				};
			}
		}
	});
	
	EntityFramework.Entities.Address = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'Address'
		}
	});
	
	EntityFramework.Entities.AddInterests = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'AddInterests'
		}
	});
	
	EntityFramework.Entities.CarriedMerchandise = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'CarriedMerchandise'
		}
	});
	
	EntityFramework.Entities.Coverage = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'Coverage'
		}
	});
	
	EntityFramework.Entities.CoverageInfo = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'CoverageInfo'
		}
	});
	
	EntityFramework.Entities.DiscountSurcharge = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'DiscountSurcharge'
		}
	});
	
	EntityFramework.Entities.Driver = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'Driver'
		},
		map: {
			value: function () {
				return {
					Driver_Id: { 
						type: 'int', 
						value: ''
					},
					driverNumber: '',
					driverFixedID: '',
					firstName: '',
					middleName: '',
					lastName: '',
					birthDate: '',
					gender: '',
					maritalStatus: '',
					relationship: '',
					yearslicensedInCanada: '',
					yearslicensedInUSA: '',
					yearslicensedWithClass6: '',
					creditYears: '',
					hasDriverTrainingCertificate: '',
					principalGridStep: '',
					gridStepOverride: '',
					AutoQuote_Id: '',
					createdOn: '',
					lastModified: '',
					hasSuspended: '',
					hasCancelled: '',
					rowid: '',
					occupation: '',
					awayAtSchool: '',
					returnFromSchoolDate: '',
					hasMCDriverTrainingCertificate: '',
					awayAtSchoolDetails: '',
					albertaLicensedUnderSixYears: '',
					whereElseLicesed: '',
					livedOutsideAlbertaInLastSixYears: '',
					whereElseLived: '',
					entityLinkRowID: '',
					excluded: ''
				};
			}
		}
	});
	
	EntityFramework.Entities.DriverConviction = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'DriverConviction'
		}
	});
	
	EntityFramework.Entities.DriverLicense = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'DriverLicense'
		}
	});
	
	EntityFramework.Entities.Endorsement = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'Endorsement'
		}
	});
	
	EntityFramework.Entities.Insured = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'Insured'
		}
	});
	
	EntityFramework.Entities.Journal = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'Journal'
		}
	});
	
	EntityFramework.Entities.MountedEquipment = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'MountedEquipment'
		}
	});
	
	EntityFramework.Entities.OtherUses = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'OtherUses'
		}
	});
	
	EntityFramework.Entities.PolicyInfo = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'PolicyInfo'
		}
	});
	
	EntityFramework.Entities.PriorCarrier = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'PriorCarrier'
		}
	});
	
	EntityFramework.Entities.Vehicle = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'Vehicle'
		},
		map: {
			value: function () {
				return {
					Vehicle_Id: '',
					vehicleNumber: '',
					vehicleFixedID: '',
					vehicleCode: '',
					year: '',
					make: '',
					model: '',
					bodyType: '',
					bodyType: '',
					vin: '',
					purchaseDate: '',
					newOrUsed: '',
					ownedOrLeased: '',
					purchasePrice: '',
					listPriceNew: '',
					riskType: '',
					isGrid: '',
					vehicleUse: '',
					commuteKms: '',
					annualKms: '',
					AutoQuote_Id: '',
					createdOn: '',
					lastModified: '',
					rowid: '',
					parkingLocation: '',
					overrideMakeModel: '',
					fuelType: '',
					fuelTypeOther: '',
					valueRated: '',
					valueRatedReason: '',
					valueRatedValue: '',
					inspectionRequired: '',
					usageType: '',
					overrideMakeModelReason: '',
					basePremium: '',
					ratedPremium: '',
					adjustedPremium: '',
					transactionPremium: '',
					termPremium: '',
					provinceRegistered: '',
					distanceUpdateDate: '',
					distanceUpdateSource: '',
					principalGridPremium: '',
					underageGridPremium: '',
					principalAMAPremium: '',
					underageAMAPremium: '',
					overrideGrid: '',
					towingVehicle: '',
					supplementLoad: '',
					engineSize: ''
				};
			}
		}
	});
	
	EntityFramework.Entities.VehicleInfo = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'VehicleInfo'
		}
	});
	
	EntityFramework.Entities.VehicleInspect = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'VehicleInspect'
		}
	});
	
	EntityFramework.Entities.VehicleModification = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'VehicleModification'
		}
	});
	
	EntityFramework.Entities.VehicleUse = Object.create(EntityFramework.Entities.Base, {
		type: {
			value: 'VehicleUse'
		}
	});

})(jQuery);