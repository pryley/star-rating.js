/*!
 * Star Rating
 * @version: 2.1.1
 * @author: Paul Ryley (http://geminilabs.io)
 * @url: https://github.com/geminilabs/star-rating.js
 * @license: MIT
 */

/** global: define */

;(function( window, document, undefined ) {

	"use strict";

	/** @return array */
	var Plugin = function( selector, options ) { // string|object, object
		this.selects = {}.toString.call( selector ) === '[object String]' ? document.querySelectorAll( selector ) : [selector];
		this.destroy = function() {
			this.widgets.forEach( function( widget ) {
				widget.destroy();
			});
		};
		this.rebuild = function() {
			this.widgets.forEach( function( widget ) {
				widget.rebuild();
			});
		};
		this.widgets = [];
		for( var i = 0; i < this.selects.length; i++ ) {
			if( this.selects[i].tagName !== 'SELECT' )continue;
			var widget = new Widget( this.selects[i], options );
			if( widget.direction === undefined )continue;
			this.widgets.push( widget );
		}
	};

	/** @return void */
	var Widget = function( el, options ) { // HTMLElement, object|null
		this.el = el;
		this.options = this.extend( {}, this.defaults, options || {}, JSON.parse( el.getAttribute( 'data-options' )));
		this.setStarCount();
		if( this.stars < 1 || this.stars > this.options.maxStars )return;
		this.init();
	};

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
			this.initEvents();
			this.current = this.selected = this.getSelectedValue();
			this.wrapEl();
			this.buildWidgetEl();
			this.setDirection();
			this.setValue( this.current );
			this.handleEvents( 'add' );
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
		changeTo: function( index ) { // int
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

		/** @return HTMLElement */
		createSpanEl: function( attributes ) { // object
			var el = document.createElement( 'span' );
			attributes = attributes || {};
			for( var key in attributes ) {
				if( !attributes.hasOwnProperty( key ))continue;
				el.setAttribute( key, attributes[key] );
			}
			return el;
		},

		/** @return void */
		destroy: function() {
			this.handleEvents( 'remove' );
			var wrapEl = this.el.parentNode;
			wrapEl.parentNode.replaceChild( this.el, wrapEl );
		},

		/** @return void */
		eventListener: function( el, action, events ) { // HTMLElement, string, array
			events.forEach( function( event ) {
				el[action + 'EventListener']( event, this.events[event] );
			}.bind( this ));
		},

		/** @return object */
		extend: function() { // ...object
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
		getIndexFromPosition: function( pageX ) { // int
			var direction = {};
			var widgetWidth = this.widgetEl.offsetWidth;
			direction.ltr = Math.max( pageX - this.offsetLeft, 1 );
			direction.rtl = widgetWidth - direction.ltr;
			return Math.min(
				Math.ceil( direction[this.direction] / Math.round( widgetWidth / this.stars )),
				this.stars
			);
		},

		/** @return object */
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
			return parseInt( this.el.options[Math.max( this.el.selectedIndex, 0 )].value ) || 0;
		},

		/** @return void */
		handleEvents: function( action ) { // string
			var formEl = this.el.closest( 'form' );
			this.eventListener( this.el, action, ['change', 'keydown'] );
			this.eventListener( this.widgetEl, action, ['click', 'mouseenter', 'mouseleave'] );
			if( formEl ) {
				this.eventListener( formEl, action, ['reset'] );
			}
		},

		/** @return void */
		initEvents: function() {
			this.events = {
				change: this.onChange.bind( this ),
				click: this.onClick.bind( this ),
				keydown: this.onKeydown.bind( this ),
				mouseenter: this.onMouseenter.bind( this ),
				mouseleave: this.onMouseleave.bind( this ),
				mousemove: this.onMousemove.bind( this ),
				reset: this.onReset.bind( this ),
			};
		},

		/** @return void */
		insertSpanEl: function( el, attributes, after ) { // HTMLElement, object, bool
			var newEl = this.createSpanEl( attributes );
			el.parentNode.insertBefore( newEl, after === true ? el.nextSibling : el );
			return newEl;
		},

		/** @return bool */
		isCloneable: function( obj ) { // mixed
			return Array.isArray( obj ) || {}.toString.call( obj ) == '[object Object]';
		},

		/** @return void */
		onChange: function() {
			this.changeTo( this.getSelectedValue() );
		},

		/** @return void */
		onClick: function( ev ) { // MouseEvent
			var index = this.getIndexFromPosition( ev.pageX );
			if( this.current !== 0 && parseFloat( this.selected ) === index && this.options.clearable ) {
				return this.onReset();
			}
			this.setValue( index );
			if( typeof this.options.onClick === 'function' ) {
				this.options.onClick.call( this, this.el );
			}
		},

		/** @return void */
		onKeydown: function( ev ) { // KeyboardEvent
			if( ['ArrowLeft', 'ArrowRight'].indexOf( ev.key ) === -1 )return;
			var increment = ev.key === 'ArrowLeft' ? -1 : 1;
			if( this.direction === 'rtl' ) {
				increment *= -1;
			}
			this.setValue( Math.min( Math.max( this.getSelectedValue() + increment, 0 ), this.stars ));
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
		onMousemove: function( ev ) { // MouseEvent
			this.changeTo( this.getIndexFromPosition( ev.pageX ));
		},

		/** @return void */
		onReset: function() {
			var originallySelected = this.el.querySelector( '[selected]' );
			var value = originallySelected ? originallySelected.value : '';
			this.el.value = value;
			this.selected = parseInt( value ) || 0;
			this.changeTo( value );
		},

		/** @return void */
		rebuild: function() {
			if( this.el.parentNode.classList.contains( 'gl-star-rating' )) {
				this.destroy();
			}
			this.init();
		},

		/** @return void */
		setDirection: function() {
			var wrapEl = this.el.parentNode;
			this.direction = window.getComputedStyle( wrapEl, null ).getPropertyValue( 'direction' );
			wrapEl.classList.add( 'gl-star-rating-' + this.direction );
		},

		/** @return void */
		setValue: function( index ) {
			this.el.value = index;
			this.selected = index;
			this.changeTo( index );
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
