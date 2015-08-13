define({
    name: 'autorow',
	id: 'autorow',
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
			config,
			params;
		
		if (this.getConfig().hasOwnProperty('params')) {
			params = this.getConfig().params;
		}
		
		row = {
			tag: 'div',
			id: this._id,
			class: 'kpaf-row clearfix',
			fields: []
		};
		
		if (typeof params !== 'undefined') {
			if (params.hasOwnProperty('style')) {
				/*row = {
					tag: 'div',
					id: this._id,
					class: 'kpaf-row clearfix',
					style: params.style,
					fields: []
				};*/
				row.style = params.style;
				console.log('has style');
				console.log(params.style);
			}
			
			if (params.hasOwnProperty('class')) {
				row.class = [row.class, params.class].join(' ');
			}
		}
		
		$.each(items, function (idx, item) {
			config = {
				tag: 'div',
				class: 'fieldgroup'
			};
			
			if (item.hasOwnProperty('show') && item.show === false) {
				config.style = 'display: none';
				delete item.show;
			}
			
			if (item.hasOwnProperty('data') && Object.keys(item.data).length > 0) {
				if (item.data.hasOwnProperty('bind') && item.data.bind !== null) {
					if (typeof item.data.bind !== 'string' && Object.keys(item.data.bind).length > 0) {
						if (item.data.bind.hasOwnProperty('groupVisible')) {
							// The visible binding needs to be set on the fieldgroup instead!
							config['data'] = {
								bind: {
									visible: item.data.bind.groupVisible
								}
							}
							
							delete item.data.bind.groupVisible;
							if (!(Object.keys(item.data.bind).length > 0)) {
								delete item.data.bind;
							}
						}
					}
				}
				
			}
			
			config['group'] = [item];
			
			row.fields.push(config);
		});
		
		this._layout = this.layout = row;
	},
	layout: {
		tag: 'div',
		class: 'kpaf-row field'
	}
});