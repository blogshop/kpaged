define({
    name: 'companyInfo',
	id: 'companyInfo',
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
		id: 'company-information',
		legend: 'Company Information',
		fieldgroups: [
			{
				block: 'autorow',
				config: {
					items: [
						{
							id: 'companyName',
							name: 'companyName',
							label: 'Company Name',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'lastName'
							}
						},
						{
							id: 'contactPerson',
							name: 'contactPerson',
							label: 'Contact Person',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'contactPerson'
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
							id: 'companyEmailAddress',
							name: 'companyEmailAddress',
							label: 'Email',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'emailAddress'
							}
						},
						{
							id: 'companyWebPage',
							name: 'companyWebPage',
							label: 'Web Page',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'webPage'
							}
						}
					]
				}
			}
		]
	}
});