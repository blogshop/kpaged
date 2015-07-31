define({
    name: 'fieldgroup',
	id: 'fieldgroup',
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
	setLayout: function (items) {
		this._layout.group = [];
		this._layout.group.push(items);
	},
	layout: {
		tag: 'div',
		class: 'fieldgroup'
	}
});