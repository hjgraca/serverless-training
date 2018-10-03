/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';

	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;
	$.ajaxSetup({
		async: false
	});
	var deleteAll = false;

	var util = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				if(deleteAll){
					deleteAll = false;
					
					$.ajax("https://functionportalcp.azurewebsites.net/api/DeleteTrigger?action=deleteall&code=fzs5GYOBxQvVYUuScgcBfBQUzDH3cnUQmsi3tCeVSttuBksndCqLNg==", {
						contentType : 'application/json',
						type : 'POST',
						async: true,
					});
				}
				$.each(data, function( index, value ) {
					var url = "";
					
					if(value.delete){
						url = "https://functionportalcp.azurewebsites.net/api/DeleteTrigger?code=fzs5GYOBxQvVYUuScgcBfBQUzDH3cnUQmsi3tCeVSttuBksndCqLNg==";
					}
					else if(value.create){
						url = "https://functionportalcp.azurewebsites.net/create";
					}
					else if(value.update) {
						url = "https://functionportalcp.azurewebsites.net/api/UpdateTrigger?code=UWGvZTzuTfCKC722B9IEPGVocDYerdlJxELJVKT0ryHXDcjt6JFuSg==";
						value.update = null;
					}else{
						return data;
					}
					
					$.ajax(url, {
						data : JSON.stringify(value),
						contentType : 'application/json',
						type : 'POST',
						//async: true,
						context: {data: data, val: value},
						success: function (msg) 
                			{ 
								if(msg != ""){
									//console.log(msg);
									//$.isNumeric(value.id)
									var item = this.data.find(item => item.id == this.val.id);
									item.id = msg;
									item.create  = null;
								}
							}
					});
				});

				data = $.map(data, function (item, index) {
					if (item.delete == true) return null;
					return item;
				});

			return data;
			} else {
				
				return JSON.parse($.getJSON( "https://functionportalcp.azurewebsites.net/api/GetTrigger?code=VaNCVzXlhh6KxmPQXCGYISOb6a0rzPKab2L1MUc06uHJRR5/6CjAFg==",  function( returnVal ) {
					return returnVal || [];
				}).responseText);	
			}
		}
	};

	var App = {
		init: function () {
			this.todos = util.store('todos-jquery');
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.bindEvents();

			new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');
		},
		bindEvents: function () {
			$('.new-todo').on('keyup', this.create.bind(this));
			$('.toggle-all').on('change', this.toggleAll.bind(this));
			$('.footer').on('click', '.clear-completed', this.destroyCompleted.bind(this));
			$('.todo-list')
				.on('change', '.toggle', this.toggle.bind(this))
				.on('dblclick', 'label', this.editingMode.bind(this))
				.on('keyup', '.edit', this.editKeyup.bind(this))
				.on('focusout', '.edit', this.update.bind(this))
				.on('click', '.destroy', this.destroy.bind(this));
		},
		render: function () {
			var todos = this.getFilteredTodos();
			$('.todo-list').html(this.todoTemplate(todos));
			$('.main').toggle(todos.length > 0);
			$('.toggle-all').prop('checked', this.getActiveTodos().length === 0);
			this.renderFooter();
			$('.new-todo').focus();

			var resp = util.store('todos-jquery', this.todos);
			this.todos = resp || todos;
			
			$('.todo-list').html(this.todoTemplate(this.todos));
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.getActiveTodos().length;
			var template = this.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			$('.footer').toggle(todoCount > 0).html(template);
		},
		toggleAll: function (e) {
			var isChecked = $(e.target).prop('checked');

			this.todos.forEach(function (todo) {
				todo.completed = isChecked;
			});

			this.render();
		},
		getActiveTodos: function () {
			return this.todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) {
				return todo.completed;
			});
		},
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				return this.getActiveTodos();
			}

			if (this.filter === 'completed') {
				return this.getCompletedTodos();
			}

			return this.todos;
		},
		destroyCompleted: function () {
			this.todos = this.getActiveTodos();
			deleteAll = true;
			this.render();
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
		getIndexFromEl: function (el) {
			var id = $(el).closest('li').data('id');
			var todos = this.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
		create: function (e) {
			var $input = $(e.target);
			var val = $input.val().trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			this.todos.push({
				id: util.uuid(),
				title: val,
				completed: false,
				create: true
			});

			$input.val('');

			this.render();
		},
		toggle: function (e) {
			var i = this.getIndexFromEl(e.target);
			this.todos[i].completed = !this.todos[i].completed;
			this.todos[i].update = true;
			this.render();
		},
		editingMode: function (e) {
			var $input = $(e.target).closest('li').addClass('editing').find('.edit');
			// puts caret at end of input
			var tmpStr = $input.val();
			$input.val('');
			$input.val(tmpStr);
			$input.focus();
		},
		editKeyup: function (e) {
			if (e.which === ENTER_KEY) {
				e.target.blur();
			}

			if (e.which === ESCAPE_KEY) {
				$(e.target).data('abort', true).blur();
			}
		},
		update: function (e) {
			var el = e.target;
			var $el = $(el);
			var val = $el.val().trim();
			
			if ($el.data('abort')) {
				$el.data('abort', false);
			} else if (!val) {
				this.destroy(e);
				return;
			} else {
				this.todos[this.getIndexFromEl(el)].title = val;
			}

			this.render();
		},
		destroy: function (e) {
			//this.todos.splice(this.getIndexFromEl(e.target), 1);
			this.todos[this.getIndexFromEl(e.target)].delete = true;
			this.render();
		}
	};

	App.init();
});