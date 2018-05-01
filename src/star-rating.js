/**
 * Star Rating
 * Version: 2.0.0
 * Author: Paul Ryley (http://geminilabs.io)
 * URL: https://github.com/geminilabs/star-rating.js
 * @license: MIT
 */

;(function( window, document, undefined )
{
	"use strict";

	/** @return array */
	var Plugin = function( selector, options ) {
		this.selects = {}.toString.call( selector ) === '[object String]' ? document.querySelectorAll( selector ) : [selector];
		this.destroy = function() {}; // destroy all widgets
		this.rebuild = function() {}; // rebuild all widgets
		this.widgets = [];
		for( var i = 0; i < this.selects.length; i++ ) {
			if( this.selects[i].tagName !== 'SELECT' )continue;
			this.widgets.push( new Widget( this.selects[i], options ));
		}
	};

	var Widget = function( el, options ) {
		this.el = el;
		this.options = this.extend( {}, this.defaults, options || {}, JSON.parse( el.getAttribute( 'data-options' ))),
		this.init();
	}

	Widget.prototype = {

		defaults: {
			clearable: true,
			initialText: 'Select a Rating',
			maxStars: 10,
			onClick: null,
			showText: true,
		},

		/** @return void */
		init: function() {
			this.setStarCount();
			if( this.stars < 1 || this.stars > this.options.maxStars )return;
			this.current = this.selected = this.getSelectedValue();
			this.wrapEl();
			this.buildWidgetEl();
			this.setDirection();
			this.handleEvents();
			this.onClick();
		},

		/** @return void */
		buildLabelEl: function() {
			if( !this.options.showText )return;
			this.textEl = this.insertSpanEl( this.widgetEl, {
				class: 'gl-star-rating-text',
			}, true );
		},

		/** @return void */
		buildWidgetEl: function() {
			var values = this.getOptionValues();
			var widgetEl = this.insertSpanEl( this.el, {
				class: 'gl-star-rating-stars',
			}, true );
			for( var key in values ) {
				if( !values.hasOwnProperty( key ))continue;
				var newEl = this.createSpanEl({
					'data-value': key,
					'data-text': values[key],
				});
				widgetEl.innerHTML += newEl.outerHTML;
			}
			this.widgetEl = widgetEl;
			this.buildLabelEl();
		},

		/** @return void */
		changeTo: function( index ) {
			if( index < 0 || index === '' ) {
				index = 0;
			}
			if( index > this.stars ) {
				index = this.stars;
			}
			this.widgetEl.classList.remove( 's' + ( 10 * this.current ));
			this.widgetEl.classList.add( 's' + ( 10 * index ));
			if( this.options.showText ) {
				this.textEl.textContent = index < 1 ? this.options.initialText : this.widgetEl.childNodes[index - 1].dataset.text;
			}
			this.current = index;
		},

		/** @return void */
		clear: function() {
			if( this.options.clearable ) {
				this.el.value = this.selected = '';
				this.changeTo(0);
			}
		},

		/** @return HTMLElement */
		createSpanEl: function( attributes ) {
			var el = document.createElement( 'span' );
			attributes = attributes || {};
			for( var key in attributes ) {
				if( !attributes.hasOwnProperty( key ))continue;
				el.setAttribute( key, attributes[key] );
			}
			return el;
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

		/** @return int */
		getIndexFromPosition: function( pageX ) {
			var direction = {};
			var widgetWidth = this.widgetEl.offsetWidth;
			direction.ltr = Math.max( pageX - this.offsetLeft, 1 );
			direction.rtl = widgetWidth - direction.ltr;
			return Math.min(
				Math.ceil( direction[this.direction] / Math.round( widgetWidth / this.stars )),
				this.stars
			);
		},

		/** @return array */
		getOptionValues: function() {
			var el = this.el;
			var unorderedValues = {};
			var orderedValues = {};
			for( var i = 0; i < el.length; i++ ) {
				if( el[i].value === '' )continue;
				unorderedValues[el[i].value] = el[i].text;
			}
			Object.keys( unorderedValues ).sort().forEach( function( key ) {
				orderedValues[key] = unorderedValues[key];
			});
			return orderedValues;
		},

		/** @return int */
		getSelectedValue: function() {
			return this.el.options[this.el.selectedIndex].value;
		},

		/** @return void */
		handleEvents: function() {
			var el = this.el;
			var formEl = el.closest( 'form' );
			var widgetEl = this.widgetEl;
			this.events = {
				mousemove: this.onMousemove.bind( this ),
			};
			el.addEventListener( 'change', this.onChange.bind( this ));
			widgetEl.addEventListener( 'click', this.onClick.bind( this ));
			widgetEl.addEventListener( 'mouseenter', this.onMouseenter.bind( this ));
			widgetEl.addEventListener( 'mouseleave', this.onMouseleave.bind( this ));
			if( formEl ) {
				formEl.addEventListener( 'reset', this.onReset.bind( this ));
			}
		},

		/** @return HTMLElement */
		insertSpanEl: function( el, attributes, after ) {
			var newEl = this.createSpanEl( attributes );
			el.parentNode.insertBefore( newEl, after === true ? el.nextSibling : el );
			return newEl;
		},

		/** @return bool */
		isCloneable: function( obj ) {
			return Array.isArray( obj ) || {}.toString.call( obj ) == '[object Object]';
		},

		/** @return void */
		onChange: function() {
			this.changeTo( this.getSelectedValue() );
		},

		/** @return void */
		onClick: function( ev ) {
			var index = this.current;
			if( ev !== undefined ) {
				index = this.getIndexFromPosition( ev.pageX );
				if( this.current !== '' && parseFloat( this.selected ) === index ) {
					this.clear();
					return;
				}
			}
			this.el.value = index;
			this.selected = index;
			this.changeTo( index );
			if( ev !== undefined && typeof this.options.onClick === 'function' ) {
				this.options.onClick.call( this, this.el );
			}
		},

		/** @return void */
		onMouseenter: function() {
			var rect = this.widgetEl.getBoundingClientRect();
			this.offsetLeft = rect.left + document.body.scrollLeft;
			this.widgetEl.addEventListener( 'mousemove', this.events.mousemove );
		},

		/** @return void */
		onMouseleave: function() {
			this.widgetEl.removeEventListener( 'mousemove', this.events.mousemove );
			this.changeTo( this.selected );
		},

		/** @return void */
		onMousemove: function( ev ) {
			this.changeTo( this.getIndexFromPosition( ev.pageX ));
		},

		/** @return void */
		onReset: function() {
			this.clear();
		},

		/** @return void */
		setDirection: function() {
			var wrapEl = this.el.parentNode;
			this.direction = window.getComputedStyle( wrapEl, null ).getPropertyValue( 'direction' );
			wrapEl.classList.add( 'gl-star-rating-' + this.direction );
		},

		/** @return void */
		setStarCount: function() {
			var el = this.el;
			this.stars = 0;
			for( var i = 0; i < el.length; i++ ) {
				if( el[i].value === '' )continue;
				if( isNaN( parseFloat( el[i].value )) || !isFinite( el[i].value )) {
					this.stars = 0;
					return;
				}
				this.stars++;
			}
		},

		/** @return void */
		wrapEl: function() {
			var wrapEl = this.insertSpanEl( this.el, {
				class: 'gl-star-rating',
				'data-star-rating': '',
			});
			wrapEl.appendChild( this.el );
		},
	};

	if( typeof define === 'function' && define.amd ) {
		define( [], function() { return Plugin; });
	}
	else if( typeof module === 'object' && module.exports ) {
		module.exports = Plugin;
	}
	else {
		window.StarRating = Plugin;
	}

})( window, document );
