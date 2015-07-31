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
App.Controller = function (properties) {
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
		beforeFilter:function () {
			return (new $.Deferred()).resolve();
		},

		afterRender:function () {
			return (new $.Deferred()).resolve();
		},

		checkSession:function () {
			//if not defined, then always succeed
			return (new $.Deferred()).resolve(true);
		},

		'default':function () {
			//TODO: this function will list all the actions of the controller
			//intend to be overridden in most of the cases
			return true;
		}
	},
	instance: function () {
		return new App.Controller.Base();
	}
}