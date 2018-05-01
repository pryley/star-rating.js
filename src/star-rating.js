/**!
 * Star Rating
 *
 * Version: 2.0.0
 * Author: Paul Ryley (http://geminilabs.io)
 * URL: https://github.com/geminilabs/star-rating.js
 * License: MIT
 */

;(function( window, document, undefined )
{
	"use strict";

	var Plugin = function( el, options )
	{
		this.el = this.isString( el ) ? document.querySelector( el ) : el;
		this.options = options || {};
		this.widgets = [];
		this.init();
	};

	Plugin.prototype = {

		defaults: {
			clearable: true,
			initialText: 'Click to Rate',
			onClick: null,
			showText: true,
		},

		/** @return void */
		init: function() {
			this.initEvents();
			this.loopEl( function( el, i ) {
				var stars = this.countStars( el );
				if( stars < 1 || stars > 10 )return;
				var selected = el.options[el.selectedIndex].value;
				this.wrap( el );
				this.widgets[i] = {
					config: this.extend( {}, this.defaults, this.options, JSON.parse( el.getAttribute( 'data-options' ))),
					current: selected,
					el: el,
					selected: selected,
					stars: stars,
					textEl: null,
					widgetEl: this.buildWidgetEl(),
				};
				this.buildLabelEl();
				this.handleEvents();
				this.onClick();
			});
		},

		/** @return void */
		initEvents: function() {
			this.events = {
				mousemove: this.onMousemove.bind( this ),
			};
		},

		/** @return HTMLElement */
		buildLabelEl: function() {
			var current = this.current();
			if( current.config.showText ) {
				this.widgets[this.i].textEl = this.insertEl( current.widgetEl, 'span', {
					class: 'gl-star-rating-text',
				}, true );
			}
		},

		/** @return HTMLElement */
		buildWidgetEl: function() {
			var el = this.el[this.i];
			var ordered = {};
			var unordered = {};
			var widgetEl = this.insertEl( el, 'span', {
				class: 'gl-star-rating-stars',
			}, true );
			for( var i = 0; i < el.length; i++ ) {
				if( el[i].value === '' )continue;
				unordered[el[i].value] = el[i].text;
			}
			Object.keys( unordered ).sort().forEach( function( key ) {
				ordered[key] = unordered[key];
			});
			for( var key in ordered ) {
				if( !ordered.hasOwnProperty( key ))continue;
				var newEl = this.createEl( 'span', {
					'data-value': key,
					'data-text': ordered[key],
				});
				widgetEl.innerHTML += newEl.outerHTML;
			}
			return widgetEl;
		},

		/** @return void */
		clear: function( widget ) {
			if( widget.config.clearable ) {
				widget.el.value = "";
				widget.selected = "";
				this.show(0);
			}
		},

		/** @return int */
		countStars: function( el ) {
			var stars = 0;
			for( var i = 0; i < el.length; i++ ) {
				if( el[i].value === '' )continue;
				if( isNaN( parseFloat( el[i].value )) || !isFinite( el[i].value )) {
					return 0;
				}
				stars++;
			}
			return stars;
		},

		/** @return HTMLElement */
		createEl: function( tag, attributes ) {
			var el = ( typeof tag === 'string' ) ? document.createElement( tag ) : tag;
			attributes = attributes || {};
			for( var key in attributes ) {
				if( !attributes.hasOwnProperty( key ))continue;
				el.setAttribute( key, attributes[key] );
			}
			return el;
		},

		/** @return mixed */
		current: function( key ) {
			var current = this.widgets[this.i];
			return key ? current[key] : current;
		},

		/** @return object */
		extend: function() {
			var args = [].slice.call( arguments );
			var result = args[0];
			var extenders = args.slice(1);
			Object.keys( extenders ).forEach( function( i ) {
				for( var key in extenders[i] ) {
					if( !extenders[i].hasOwnProperty( key ))continue;
					result[key] = extenders[i][key];
				}
			});
			return result;
		},

		/** @return void */
		forEach: function( array, callback, scope ) {
			for( var i = 0; i < array.length; i++ ) {
				callback.call( scope, array[i], i );
			}
		},

		/** @return int */
		getIndexFromPosition: function( pageX ) {
			var current = this.current();
			var width = current.widgetEl.offsetWidth;
			return Math.min(
				Math.ceil( Math.max( pageX - this.offsetLeft, 1 ) / Math.round( width / current.stars )),
				current.stars
			);
		},

		/** @return void */
		handleEvents: function() {
			var el = this.current( 'el' );
			var formEl = el.closest( 'form' );
			var widgetEl = this.current( 'widgetEl' );
			el.addEventListener( 'change', this.onChange.bind( this ));
			widgetEl.addEventListener( 'click', this.onClick.bind( this ));
			widgetEl.addEventListener( 'mouseenter', this.onMouseenter.bind( this ));
			widgetEl.addEventListener( 'mouseleave', this.onMouseleave.bind( this ));
			if( formEl ) {
				formEl.addEventListener( 'reset', this.onReset.bind( this ));
			}
		},

		/** @return HTMLElement */
		insertEl: function( el, tag, attributes, after ) {
			var newEl = this.createEl( tag, attributes );
			el.parentNode.insertBefore( newEl, after === true ? el.nextSibling : el );
			return newEl;
		},

		/** @return bool */
		isCloneable: function( obj ) {
			return Array.isArray( obj ) || {}.toString.call( obj ) == '[object Object]';
		},

		/** @return bool */
		isString: function( str ) {
			return Object.prototype.toString.call( str ) === "[object String]";
		},

		/** @return void */
		loopEl: function( callback ) {
			for( var i = 0; i < this.el.length; ++i ) {
				if( this.el[i].tagName !== 'SELECT' || typeof callback !== 'function' )continue;
				this.i = i;
				callback.call( this, this.el[i], i );
			}
		},

		/** @return void */
		onChange: function( ev ) {
			var el = this.current( 'el' );
			this.show( el.options[el.selectedIndex].value );
		},

		/** @return void */
		onClick: function( ev ) {
			var widget = this.current();
			var index = widget.current;
			if( ev !== undefined ) {
				index = this.getIndexFromPosition( ev.pageX );
				if( widget.current !== '' && parseFloat( widget.selected ) === index ) {
					this.clear( widget );
					return;
				}
			}
			widget.el.value = index;
			widget.selected = index;
			this.show( index );
			if( ev !== undefined && typeof widget.config.onClick === 'function' ) {
				widget.config.onClick.call( this, widget.el );
			}
		},

		/** @return void */
		onMouseenter: function( ev ) {
			this.i = Object.keys( this.widgets ).filter( function( key ) {
				return this.widgets[key].widgetEl == ev.target;
			}.bind( this ));

			var widget = this.current();
			var rect = widget.widgetEl.getBoundingClientRect();
			widget.widgetEl.addEventListener( 'mousemove', this.events.mousemove );
			this.offsetLeft = rect.left + document.body.scrollLeft;
		},

		/** @return void */
		onMouseleave: function( ev ) {
			var widget = this.current();
			widget.widgetEl.removeEventListener( 'mousemove', this.events.mousemove );
			this.show( widget.selected );
		},

		/** @return void */
		onMousemove: function( ev ) {
			this.show( this.getIndexFromPosition( ev.pageX ));
		},

		/** @return void */
		onReset: function( ev ) {
			console.log( ev );
			if( ev === undefined )return;
			this.forEach( ev.target.querySelectorAll( 'select' ), function( el ) {
				var index = this.searchIndex( el );
				if( index === -1 )return;
				this.clear( this.widgets[index] );
			}, this );
		},

		/** @return int */
		searchIndex: function( el ) {
			return Object.keys( this.widgets ).filter( function( key ) {
				return this.widgets[key].el == el;
			}.bind( this ));
		},

		/** @return void */
		show: function( index ) {
			var widget = this.current();
			if( index < 0 || index === "" ) {
				index = 0;
			}
			if( index > widget.stars ) {
				index = widget.stars;
			}
			widget.widgetEl.classList.remove( 's' + ( 10 * widget.current ));
			widget.widgetEl.classList.add( 's' + ( 10 * index ));
			if( widget.config.showText ) {
				widget.textEl.textContent = index < 1 ? widget.config.initialText : widget.widgetEl.childNodes[index - 1].dataset.text;
			}
			widget.current = index;
		},

		/** @return void */
		wrap: function( el ) {
			var wrapEl = this.insertEl( el, 'span', {
				'class': 'gl-star-rating',
				'data-star-rating': '',
			});
			wrapEl.appendChild( el );
		},
	};

	Plugin.defaults = Plugin.prototype.defaults;

	if( typeof define === "function" && define.amd ) {
		define( [], function() { return Plugin; });
	}
	else if( typeof module === "object" && module.exports ) {
		module.exports = Plugin;
	}
	else {
		window.StarRating = Plugin;
	}

})( window, document );
