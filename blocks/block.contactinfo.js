define({
    name: 'contactInfo',
	id: 'contactInfo',
	autoRender: false,
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
		legend: 'Phone and Fax',
		children: [
			{
				block: 'autorow',
				config: {
					items: [
						{
							id: 'homePhone',
							name: 'homePhone',
							label: 'Home',
							tag: 'input',
							type: 'number',
							class: 'medium k-textbox',
							data: {
								bind: 'homePhone'
							},
							validation: {
								pattern: '[\+]\d{2}[\(]\d{2}[\)]\d{4}[\-]\d{4}'
							}
						},
						{
							id: 'homePhoneExtension',
							name: 'homePhoneExtension',
							label: 'ext.',
							tag: 'input',
							type: 'text',
							class: 'small k-textbox',
							data: {
								bind: 'homePhoneExtension'
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
			},
			{
				block: 'autorow',
				config: {
					items: [
						{
							id: 'cellPhone',
							name: 'cellPhone',
							label: 'Cell',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'cellPhone'
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
							id: 'faxNumber',
							name: 'faxNumber',
							label: 'Fax',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'faxNumber'
							}
						}
					]
				}
			}
		]
	}
});