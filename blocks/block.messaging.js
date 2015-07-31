define({
    name: 'messaging',
	id: 'messaging',
	autoRender: false,
	/**
	 * Override the default setBlocks function
	 * 
	 * @element String: A valid HTML5 element or DOM DocumentFragment
	 * @attributes Object: An object containing key-value pairs of attributes and values
	 * @ref DOM Node: A reference node for inserting the new node
	 *
	 * @return DOMBuilder: this
	 */
	layout: {
		tag: 'div',
		class: 'messaging alert',
		role: 'alert',
		style: 'display: none',
	}
});