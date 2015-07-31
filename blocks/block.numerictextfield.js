define({
    name: 'numerictextfield',
    id: 'numerictextfield',
	layout: {
		tag: 'input', // Types: any standard HTML5 form element or Kendo UI widget
		type: 'text',
		data: {
			role: 'numerictextbox',
			bind: '@name',
		},
		disabled: true
	}
});