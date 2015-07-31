define({
    name: 'pageActionsToolbar',
	id: 'pageActionsToolbar',
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
		tag: 'div',
		class: 'toolbar-actions-top',
		buttons: [
			{
				id: 'toolbar-button-save',
				name: 'toolbar-button-save',
				tag: 'button',
				type: 'button',
				text: 'Save',
				data: {
					role: 'button',
					icon: 'tick',
					bind: {
						events: {
							click: function (e) {
								App.getCurrent().save(e);
							}
						}
					}
				}
			}
		]
	}
});