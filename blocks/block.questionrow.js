define({
    name: 'questionrow',
	id: 'questionrow',
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
		var row,
			config;
		
		row = {
			tag: 'div',
			id: this._id,
			class: 'kpaf-row clearfix label-right',
			fields: []
		};
		
		$.each(items, function (idx, item) {
			config = {
				tag: 'div',
				class: 'fieldgroup',
				group: [item]
			};
			
			if (item.hasOwnProperty('show') && item.show === false) {
				config.style = 'display: none';
				delete item.show;
			}
			
			row.fields.push(config);
		});
		
		this._layout = this.layout = row;
	},
	layout: {
		tag: 'div',
		class: 'kpaf-row field'
	}
});