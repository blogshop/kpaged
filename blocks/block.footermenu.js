define({
    name: 'footerMenu',
	id: 'footerMenu',
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
		children: [
			{
				tag: 'ul',
				class: 'menu',
				/* TODO: Turn font-awesome icons into a block */
				children: [
					{
						tag: 'li',
						children: [
							{
								tag: 'i',
								class: 'fa fa-unlock-alt',
							},
							{
								tag: 'a',
								//href: '#unlock',
								href: App.getRootWebsitePath() + '/',
								text: 'Unlock Now'	
							}
						]
					},
					{
						
						tag: 'li',
						children: [
							{
								tag: 'i',
								class: 'fa fa-leanpub',
							},
							{
								tag: 'a',
								//href: '#learn',
								href: App.getRootWebsitePath() + '/learn.html',
								text: 'Learn Unlocking'	
							}
						]
					},
					{
						tag: 'li',
						children: [
							{
								tag: 'i',
								class: 'fa fa-list-ul',
							},
							{
								tag: 'a',
								//href: '#faqs',
								href: App.getRootWebsitePath() + '/faqs.html',
								text: 'Questions and Answers'
							}
						]
					},
					{
						tag: 'li',
						children: [
							{
								tag: 'i',
								class: 'fa fa-info-circle',
							},
							{
								tag: 'a',
								//href: '#instructions',
								href: App.getRootWebsitePath() + '/guides.html',
								text: 'Unlock Guides'	
							}
						]
					},
					{
						tag: 'li',
						class: 'phone-search',
						children: [
							{
								tag: 'i',
								class: 'fa fa-search'	
							},
							{
								tag: 'a',
								text: 'Phone Search'	
							}
						]
					}
				]
			},
			{
				tag: 'div',
				id: 'searchModal',
				data: {
					role: 'window',
					title: 'Search for your phone!',
					width: '60%',
					height: '80px',
					modal: true,
					pinned: true,
					visible: false
				},
				style: 'background: transparent',
				children: [
					{
						tag: 'input',
						type: 'text',
						style: 'width: 100%; padding: 0 2rem; height: 48px; border-radius: 3px; font-size: 1.3rem; box-sizing: border-box;'
					}
				]
			}
		]
	}
});