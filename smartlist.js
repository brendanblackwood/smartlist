// @todo should we build all items and just show/hide or is it faster/better to rebuild on filter/search?
// @todo handle scrolling
// @todo add filter selector
// @todo add sort selector and logic
// @todo handle args to filters
// @todo currently uses jQuery, underscore and Handlebars. Should be able to improve this

var SmartList = (function($) {
	var picker = {
		element: [], // @todo get this at creation
		item: { // example item
			name: "Foo",
			type: "fooberry"
		},
		items: [],
		activeItems: [],
		options: {
			height: 600,
			width: 200,
			title: "Things",
			template: Handlebars.compile("<span>{{name}}</span>"), // using handlebars syntax for now
			filters: {
				type: function(item, type) {
					if (item.type == type) {
						return true;
					}
					return false;
				},
				search: function(item, term) {
					// @todo add search
				}
			},
			sorters: {}
		},

		init: function(selector, options, items) {
			var self = this;

			this.element = $(selector);

			// overwrite any defaults
			$.extend(true, this.options, options);

			// create items and active items
			// @todo make this do something more if needed
			$.each(items, function(key, item) {
				var internalItem = $.extend(true, {_id: key}, item);
				self.items.push(internalItem);
				self.activeItems.push(internalItem);
			});

			this.renderPicker();
		},

		/**
		 * Takes user filters and search terms and applies them to list
		 */
		update: function() {
			var self = this,
				filters = this.element.find('span.filter').data('filter'),
				search = $.trim(this.element.find('.search').val());

			if (search != undefined && search != '') {
				filters.push('search');
				// @todo need to push search term onto args
			}

			// set the active items to be all items before filtering
			this.activeItems = this.items;

			$.each(filters, function(key, filter) {
				self.activeItems = self.applyFilter(filter); // @todo allow us to apply args of some kind
			});

			// @todo show activeItems and hide inactive ones
		},

		renderPicker: function() {
			var $box = this.buildBox(),
				template = this.options.template;
			$.each(this.items, function(key, item) {
				var row = $('<li>' + template(item) + '</li>').attr('data-index', key);
				$box.find('ul').append(row);
			});
			
			this.element.append($box);
		},

		buildBox: function() {
			// @todo move this template somewhere else
			var template = Handlebars.compile('<div class="picker"><div class="header">{{title}}</div><div class="body"><div class="search"><input type="text" autocomplete="off" autocorrect="off"></div><div><ul></ul></div></div></div>');
			return $(template(this.options));
		},

		/**
		 * Add a filter to the search bar and call update()
		 * @todo prepend to input, append to existing terms
		 */
		addFilter: function(filter) {
			var $term = $('<span>'+filter+'</span>').addClass('filter').data('filter', filter);
			this.element.find(".search").prepend($term);

			this.update();
		},

		/**
		 * Remove a filter term from the search bar and call update()
		 * @todo remove only the filter we are looking for
		 */
		removeFilter: function(filter) {
			this.element.find(".search").remove($('span'));

			this.update();
		},

		/**
		 * If filter function exists, return matched elements.
		 * If not, return empty array
		 */
		applyFilter: function(filter, args) {
			var filterFunction = this.options.filters.filter;
			if (filterFunction != undefined && $.isFunction(filterFunction)) {
				// @todo probably remove _. dependancy unless we actually need it
				// @todo apply args to filter function
				return _.filter(this.activeItems, filterFunction); 
			}
			return [];
		},
		sort: function(field) {},
		hideItem: function(item) {
			this.element.find('ul li[data-index='+item._id+']').hide();
		},
		showItem: function(item) {
			this.element.find('ul li[data-index='+item._id+']').show();
		}
	};

	return picker;
})(jQuery);

$(document).ready(function() {
	SmartList.init('#smartlist', {}, [
		{ // example item
			name: "Foo",
			type: "fooberry"
		}, {
			name: "Bar",
			type: "fooberry"
		}
	]);
});