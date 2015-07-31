/*
* Kendo UI Web v2013.1.319 (http://kendoui.com)
* Copyright 2013 Telerik AD. All rights reserved.
*
* Kendo UI Web commercial licenses may be obtained at
* https://www.kendoui.com/purchase/license-agreement/kendo-ui-web-commercial.aspx
* If you do not own a commercial license, this file shall be governed by the
* GNU General Public License (GPL) version 3.
* For GPL requirements, please review: http://www.gnu.org/copyleft/gpl.html
*/
/*kendo_module({
    id: "silentvalidator",
    name: "SilentValidator",
    category: "web",
    description: "The Silent Validator offers an easy way to do a client-side form validation.",
    depends: ["core"]
});*/

// Not quite sure how kendo's doing their require stuff soo...
// F*** require for now!

(function(f, define) {
    //define([ "framework/lib/kendo/builds/kendo-ui-core-master/src/kendo.core" ], f);
})(function() {

var __meta__ = {
    id: "silentvalidator",
    name: "SilentValidator",
    category: "web",
    description: "The Silent Validator offers an easy way to do a client-side form validation.",
    depends: ["core"]
};

(function ($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = kendo.ui.Widget,
        NS = ".kendoSilentValidator",
        INVALIDMSG = "k-invalid-msg",
        INVALIDINPUT = "k-invalid",
        emailRegExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
        urlRegExp = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
        INPUTSELECTOR = ":input:not(:button,[type=submit],[type=reset],[disabled],[readonly])",
        CHECKBOXSELECTOR = ":checkbox:not([disabled],[readonly])",
        NUMBERINPUTSELECTOR = "[type=number],[type=range]",
        BLUR = "blur",
        NAME = "name",
        FORM = "form",
        NOVALIDATE = "novalidate",
        proxy = $.proxy,
        patternMatcher = function (value, pattern) {
            if (typeof pattern === "string") {
                pattern = new RegExp('^(?:' + pattern + ')$');
            }
            return pattern.test(value);
        },
        matcher = function (input, selector, pattern) {
            var value = input.val();

            if (input.filter(selector).length && value !== "") {
                return patternMatcher(value, pattern);
            }
            return true;
        },
        hasAttribute = function (input, name) {
            if (input.length)  {
                return input[0].attributes[name] !== undefined;
            }
            return false;
        },
        nameSpecialCharRegExp = /("|'|\[|\]|\$|\.|\:|\+)/g;

    function decode(value) {
        return value.replace(/&amp/g, '&amp;')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }
	
	var SilentValidator = kendo.ui.Validator.extend({
        init: function (element, options) {
            var that = this;
			
			ui.Validator.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;
        },
		silentValidate: function () {
            var that = this,
                inputs,
                idx,
				length,
                input,
				result,
                messageText,
                fieldName,
                invalid = false;

            that._errors = {};

            if (!that.element.is(INPUTSELECTOR)) {
                inputs = that.element.find(INPUTSELECTOR);

                for (idx = 0, length = inputs.length; idx < length; idx++) {
					input = inputs.eq(idx);
                    result = that._checkValidity(input);
					
					if (!result.valid) {
                        fieldName = (input.attr(NAME) || "");
						messageText = that._extractMessage(input, result.key);
						that._errors[fieldName] = messageText;
                        
						invalid = true;
                    }
                }
                return !invalid;
            }
            return that.validateInput(that.element);
        },
		validateInputRule: function (input, rule) {
            input = $(input);

            var that = this,
                template = that._errorTemplate,
                result = that._checkRuleValidity(input, rule),
                valid = result.valid,
                className = "." + INVALIDMSG,
                fieldName = (input.attr(NAME) || ""),
                lbl = that._findMessageContainer(fieldName).add(input.next(className)).hide(),
                messageText;

            input.removeAttr("aria-invalid");

            if (!valid) {
                messageText = that._extractMessage(input, result.key);
                that._errors[fieldName] = messageText;
                var messageLabel = $(template({ message: decode(messageText) }));

                that._decorateMessageContainer(messageLabel, fieldName);

                if (!lbl.replaceWith(messageLabel).length) {
                    messageLabel.insertAfter(input);
                }
                messageLabel.show();

                input.attr("aria-invalid", true);
            }

            input.toggleClass(INVALIDINPUT, !valid);

            return valid;
        },
		_checkRuleValidity: function (input, rule) {
            var rules = this.options.rules;

			if (!rules[rule](input)) {
				return { valid: false, key: rule };
			}

            return { valid: true };
        },
        options: {
            name: "SilentValidator",
            errorTemplate: '<span class="k-widget k-tooltip k-tooltip-validation">' +
                '<span class="k-icon k-warning"> </span> #=message#</span>',
            messages: {
                required: "{0} is required",
				requiredIf: "{0} is required",
				requiredIfEmpty: "{0} is required",
                pattern: "{0} is not valid",
                min: "{0} should be greater than or equal to {1}",
                max: "{0} should be smaller than or equal to {1}",
                step: "{0} is not valid",
                email: "{0} is not valid email",
                url: "{0} is not valid URL",
                date: "{0} is not valid date"
            },
            rules: {
                required: function (input) {
                    var checkbox = input.filter("[type=checkbox]").length && input.attr("checked") !== "checked",
                        value = input.val();

                    return !(hasAttribute(input, "required") && (value === "" || !value  || checkbox));
                },
				requiredIf: function (input) {
                    var checkbox = input.filter("[type=checkbox]").length && input.attr("checked") !== "checked",
						
                        value = input.val();

                    return !(hasAttribute(input, "requiredIf") && (value === "" || !value || checkbox));
                },
				requiredIfEmpty: function (input) {
                    var page = App.getCurrent(),
						requiredIfEmpty = hasAttribute(input, "requiredifempty"),
						checkbox = input.filter("[type=checkbox]").length && input.attr("checked") !== "checked",
						value = input.val(),
						valueEmpty = (value === "" || !value  || checkbox) ? true : false,
						target = (requiredIfEmpty) ? $("[name=" + input.attr('requiredIfEmpty') + "]") : false,
						targetValue = (target) ? target.val() : "",
						targetEmpty = (targetValue === "" || !targetValue),
						blockID = hasAttribute(input, "block") ? input.attr("block") : false,
						block = (blockID && page.hasBlock(blockID)) ? page.getBlock(blockID) : false, 
						validator = (block) ? block.getValidator() : false,
						valid = false,
						targetValid = false,
						template,
						className,
						targetName,
						lbl,
						messageText,
						messageLabel;
					
					// If there's no validator, fail silently - it's not gonna work!
					if (!validator) return true;
					
					// Does the input have the requiredIfEmpty attribute?
					if (requiredIfEmpty) {
						target.removeAttr("aria-invalid");
						
						className = "." + INVALIDMSG;
						targetName = (target.attr(NAME) || "");
						lbl = validator._findMessageContainer(targetName).add(input.next(className)).hide();
						
						if ((valueEmpty && !targetEmpty) || (!valueEmpty && targetEmpty)) {
							valid = true;
							validator._findMessageContainer(targetName).add(input.next(className)).hide();
						} else {
							template = validator._errorTemplate;
							messageText = validator._extractMessage(target, 'requiredIfEmpty');
							validator._errors[targetName] = messageText;
							messageLabel = $(template({ message: decode(messageText) }));

							validator._decorateMessageContainer(messageLabel, targetName);

							if (!lbl.replaceWith(messageLabel).length) {
								messageLabel.insertAfter(input);
							}
							messageLabel.show();

							target.attr("aria-invalid", true);
						}
						
						target.toggleClass(INVALIDINPUT, !valid);
					}
					
                    return (requiredIfEmpty && valid);
                },
				
                pattern: function (input) {
                    if (input.filter("[type=text],[type=email],[type=url],[type=tel],[type=search],[type=password]").filter("[pattern]").length && input.val() !== "") {
                        return patternMatcher(input.val(), input.attr("pattern"));
                    }
                    return true;
                },
                min: function (input) {
                    if (input.filter(NUMBERINPUTSELECTOR + ",[" + kendo.attr("type") + "=number]").filter("[min]").length && input.val() !== "") {
                        var min = parseFloat(input.attr("min")) || 0,
                            val = parseFloat(input.val());

                        return min <= val;
                    }
                    return true;
                },
                max: function (input) {
                    if (input.filter(NUMBERINPUTSELECTOR + ",[" + kendo.attr("type") + "=number]").filter("[max]").length && input.val() !== "") {
                        var max = parseFloat(input.attr("max")) || 0,
                            val = parseFloat(input.val());

                        return max >= val;
                    }
                    return true;
                },
                step: function (input) {
                    if (input.filter(NUMBERINPUTSELECTOR + ",[" + kendo.attr("type") + "=number]").filter("[step]").length && input.val() !== "") {
                        var min = parseFloat(input.attr("min")) || 0,
                            step = parseFloat(input.attr("step")) || 1,
                            val = parseFloat(input.val()),
                            decimals = numberOfDecimalDigits(step),
                            raise;

                        if (decimals) {
                            raise = Math.pow(10, decimals);
                            return (((val-min)*raise)%(step*raise)) / Math.pow(100, decimals) === 0;
                        }
                        return ((val-min)%step) === 0;
                    }
                    return true;
                },
                email: function (input) {
                    return matcher(input, "[type=email],[" + kendo.attr("type") + "=email]", emailRegExp);
                },
                url: function (input) {
                    return matcher(input, "[type=url],[" + kendo.attr("type") + "=url]", urlRegExp);
                },
                date: function (input) {
                    if (input.filter("[type^=date],[" + kendo.attr("type") + "=date]").length && input.val() !== "") {
                        return kendo.parseDate(input.val(), input.attr(kendo.attr("format"))) !== null;
                    }
                    return true;
                }
            },
            validateOnBlur: true
        }
    });

    kendo.ui.plugin(SilentValidator);
})(jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(_, f){ f(); });