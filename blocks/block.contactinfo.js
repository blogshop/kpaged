define({
    name: 'contactInfo',
	id: 'contactInfo',
	autoRender: true,
	autoBind: false,
	/**
	 * Override the default setBlocks function
	 * 
	 * @element String: A valid HTML5 element or DOM DocumentFragment
	 * @attributes Object: An object containing key-value pairs of attributes and values
	 * @ref DOM Node: A reference node for inserting the new node
	 *
	 * @return DOMBuilder: this
	 */
	setLayout: function () {
		this._layout = this.layout;
	},
	layout: {
		tag: 'fieldset',
		id: 'phone-and-fax',
		legend: 'Contact Info',
		children: [
			{
				block: 'autorow',
				config: {
					items: [
						{
							id: 'emailAddress',
							name: 'emailAddress',
							label: 'Email',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'email'
							}
						},
						{
							id: 'website',
							name: 'website',
							label: 'Website',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'website'
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
							id: 'homePhone',
							name: 'homePhone',
							label: 'Home Phone',
							tag: 'input',
							type: 'number',
							class: 'medium k-textbox',
							data: {
								bind: 'telephone'
							},
							validation: {
								pattern: '[\+]\d{2}[\(]\d{2}[\)]\d{4}[\-]\d{4}'
							}
						},
						{
							id: 'mobilePhone',
							name: 'mobilePhone',
							label: 'Mobile Phone',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'mobile'
							},
							validation: {
								pattern: '[\+]\d{2}[\(]\d{2}[\)]\d{4}[\-]\d{4}'
							}
						}
					]
				}
			},
			/*{
				block: 'autorow',
				config: {
					items: [
						{
							id: 'businessPhone',
							name: 'businessPhone',
							label: 'Work/Business',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'businessPhone'
							}
						},
						{
							id: 'businessPhoneExtension',
							name: 'businessPhoneExtension',
							label: 'ext.',
							tag: 'input',
							type: 'text',
							class: 'small k-textbox',
							data: {
								bind: 'businessPhoneExtension'
							}
						}
					]
				}
			},*/
			{
				block: 'autorow',
				config: {
					items: [
						{
							id: 'faxNumber',
							name: 'faxNumber',
							label: 'Fax',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'fax'
								// TODO: setLayout + config to set bindings
								// That should be done with *some* of the other blocks too
							}
						}
					]
				}
			}
		]
	}
});