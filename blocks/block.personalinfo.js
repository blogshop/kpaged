define({
    name: 'personalInfo',
	id: 'personalInfo',
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
		id: 'basic-information',
		legend: 'Basic Information',
		children: [
			{
				tag: 'div',
				class: 'kpaf-row field',
				fields: [
					{														
						id: 'insuredID',
						name: 'Insured_Id',
						tag: 'input',
						type: 'hidden',
						data: {
							bind: 'Insured_Id'
						}
					},
					{
						id: 'entityLinkRowID',
						name: 'entityLinkRowID',
						tag: 'input',
						type: 'hidden',
						data: {
							bind: 'entityLinkRowID'
						}
					},
					{
						id: 'insuredType',
						name: 'insuredType',
						tag: 'input',
						type: 'hidden',
						data: {
							bind: 'type'
						}
					},
					{
						tag: 'div',
						class: 'fieldgroup',
						group: [
						{
							id: 'prefix',
							name: 'prefix',
							label: 'Prefix',
							tag: 'input',
							type: 'text',
							class: 'medium',
							style: 'width: 208px', 
							data: {
								role: 'dropdownlist',
								bind: {
									source: {
										type: 'custom',
										config: {
											data: [
												{ Key: 'Dr.', Value: 'Dr.' },
												{ Key: 'Miss', Value: 'Miss' },
												{ Key: 'Mr.', Value: 'Mr.' },
												{ Key: 'Mrs.', Value: 'Mrs.' },
												{ Key: 'Ms.', Value: 'Ms.' },
												{ Key: 'Rev.', Value: 'Rev.' },
												{ Key: 'Sir', Value: 'Sir' }
											]
										}
									},
									value: 'prefix'
								},
								optionLabel: ' '
							}
						}]
					},
					{
						tag: 'div',
						class: 'fieldgroup',
						group: [{
							id: 'firstName',
							name: 'firstName',
							label: 'First Name',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'firstName'
							}
						}]
					},
					{
						tag: 'div',
						class: 'fieldgroup',
						group: [{
							id: 'middleName',
							name: 'middleName',
							label: 'Middle Name',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'middleName'
							}
						}]
					},
					{
						tag: 'div',
						class: 'fieldgroup',
						group: [{
							id: 'lastName',
							name: 'lastName',
							label: 'Last Name',
							tag: 'input',
							type: 'text',
							class: 'medium k-textbox',
							data: {
								bind: 'lastName'
							}
						}]
					}
				]
			}
		]
	}
});