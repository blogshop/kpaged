define({
    name: 'fieldgrouprow',
	id: 'fieldgrouprow',
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
		var row;
		
		row = {
			tag: 'div',
			class: 'kpaf-row',
			fields: []
		};
		
		$.each(items, function (idx, item) {
			row.fields.push({
				tag: 'div',
				class: 'fieldgroup',
				group: [item]
			});
		});
		
		this._layout = this.layout = row;
	},
	layout: {
		tag: 'div',
		class: 'kpaf-row field'
	}
});