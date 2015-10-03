define({
    name: 'social',
	id: 'social',
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
		tag: 'ul',
		class: 'menu',
		children: [
			{
				/* TODO: Turn font-awesome icons into a block */
				tag: 'li',
				children: [
					{
						tag: 'i',
						class: 'fa fa-facebook',
					}
				]
			},
			{
				/* TODO: Turn font-awesome icons into a block */
				tag: 'li',
				children: [
					{
						tag: 'i',
						class: 'fa fa-twitter',
					}
				]
			},
			{
				tag: 'li',
				children: [
					{
						tag: 'i',
						class: 'fa fa-google-plus',
					}
				]
			},
			{
				tag: 'li',
				children: [
					{
						tag: 'i',
						class: 'fa fa-pinterest',
					}
				]
			},
			{
				tag: 'li',
				children: [
					{
						tag: 'i',
						class: 'fa fa-linkedin',
					}
				]
			}
		]
	}
});