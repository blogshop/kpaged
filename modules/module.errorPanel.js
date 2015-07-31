define({
	name: 'errorPanel',
	id: 'errorPanel',
	layout: {
		templates: {
			name: 'ErrorPanel',
			class: 'error-panel',
			title: 'Errors',
			tag: 'ul',
			data: {
				role: 'observingpanelbar',
				bind: {
					events: {
						select: function (e) {
							var hasher = App.getRouter().adapter().hasher(),
								items,
								slug;

							e.preventDefault();

							items = $(e.item).find('a.k-link');
							if (items.length > 0) {
								$.each(items, function (idx, item) {
									slug = $(item).attr('href') || '';

									if (slug !== '') {
										slug = slug.replace(/\#/, '');
										hasher.setHash('field', 'name', slug);
									}
								});
							}
						}
					}
				}
			}
		}
	}
});