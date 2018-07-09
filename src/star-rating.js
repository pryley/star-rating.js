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

	/** @return object */
	var Plugin = function( selector, options ) { // string|object, object
		this.selects = {}.toString.call( selector ) === '[object String]' ? document.querySelectorAll( selector ) : [selector];
		this.destroy = function() {
			this.widgets.forEach( function( widget ) {
				widget.destroy_();
			});
		};
		this.rebuild = function() {
			this.widgets.forEach( function( widget ) {
				widget.rebuild_();
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
		this.options_ = this.extend_( {}, this.defaults, options || {}, JSON.parse( el.getAttribute( 'data-options' )));
		this.setStarCount_();
		if( this.stars < 1 || this.stars > this.options_.maxStars )return;
		this.init_();
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
		init_: function() {
			this.initEvents_();
			this.current = this.selected = this.getSelectedValue_();
			this.wrapEl_();
			this.buildWidgetEl_();
			this.setDirection_();
			this.setValue_( this.current );
			this.handleEvents_( 'add' );
		},

		/** @return void */
				class: 'gl-star-rating-text',
		buildLabelEl_: function() {
			if( !this.options_.showText )return;
			this.textEl = this.insertSpanEl_( this.widgetEl, {
			}, true );
		},

		/** @return void */
				class: 'gl-star-rating-stars',
		buildWidgetEl_: function() {
			var values = this.getOptionValues_();
			var widgetEl = this.insertSpanEl_( this.el, {
			}, true );
			for( var key in values ) {
				if( !values.hasOwnProperty( key ))continue;
				var newEl = this.createSpanEl_({
					'data-value': key,
					'data-text': values[key],
				});
				widgetEl.innerHTML += newEl.outerHTML;
			}
			this.widgetEl = widgetEl;
			this.buildLabelEl_();
		},

		/** @return void */
		changeTo_: function( index ) { // int
			if( index < 0 || index === '' ) {
				index = 0;
			}
			if( index > this.stars ) {
				index = this.stars;
			}
			this.widgetEl.classList.remove( 's' + ( 10 * this.current ));
			this.widgetEl.classList.add( 's' + ( 10 * index ));
			if( this.options_.showText ) {
				this.textEl.textContent = index < 1 ? this.options_.initialText : this.widgetEl.childNodes[index - 1].dataset.text;
			}
			this.current = index;
		},

		/** @return HTMLElement */
		createSpanEl_: function( attributes ) { // object
			var el = document.createElement( 'span' );
			attributes = attributes || {};
			for( var key in attributes ) {
				if( !attributes.hasOwnProperty( key ))continue;
				el.setAttribute( key, attributes[key] );
			}
			return el;
		},

		/** @return void */
		destroy_: function() {
			this.handleEvents_( 'remove' );
			var wrapEl = this.el.parentNode;
			wrapEl.parentNode.replaceChild( this.el, wrapEl );
		},

		/** @return void */
		eventListener_: function( el, action, events ) { // HTMLElement, string, array
			events.forEach( function( event ) {
				el[action + 'EventListener']( event, this.events[event] );
			}.bind( this ));
		},

		/** @return object */
		extend_: function() { // ...object
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
		getIndexFromPosition_: function( pageX ) { // int
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
		getOptionValues_: function() {
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
		getSelectedValue_: function() {
			return parseInt( this.el.options[Math.max( this.el.selectedIndex, 0 )].value ) || 0;
		},

		/** @return void */
		handleEvents_: function( action ) { // string
			var formEl = this.el.closest( 'form' );
			this.eventListener_( this.el, action, ['change', 'keydown'] );
			this.eventListener_( this.widgetEl, action, ['click', 'mouseenter', 'mouseleave'] );
			if( formEl ) {
				this.eventListener_( formEl, action, ['reset'] );
			}
		},

		/** @return void */
		initEvents_: function() {
			this.events = {
				change: this.onChange_.bind( this ),
				click: this.onClick_.bind( this ),
				keydown: this.onKeydown_.bind( this ),
				mouseenter: this.onMouseenter_.bind( this ),
				mouseleave: this.onMouseleave_.bind( this ),
				mousemove: this.onMousemove_.bind( this ),
				reset: this.onReset_.bind( this ),
			};
		},

		/** @return void */
		insertSpanEl_: function( el, attributes, after ) { // HTMLElement, object, bool
			var newEl = this.createSpanEl_( attributes );
			el.parentNode.insertBefore( newEl, after === true ? el.nextSibling : el );
			return newEl;
		},

		/** @return bool */
		isCloneable: function( obj ) { // mixed
			return Array.isArray( obj ) || {}.toString.call( obj ) == '[object Object]';
		},

		/** @return void */
		onChange_: function() {
			this.changeTo_( this.getSelectedValue_() );
		},

		/** @return void */
		onClick_: function( ev ) { // MouseEvent
			var index = this.getIndexFromPosition_( ev.pageX );
			if( this.current !== 0 && parseFloat( this.selected ) === index && this.options_.clearable ) {
				return this.onReset_();
			}
			this.setValue_( index );
			if( typeof this.options_.onClick === 'function' ) {
				this.options_.onClick.call( this, this.el );
			}
		},

		/** @return void */
		onKeydown_: function( ev ) { // KeyboardEvent
			if( ['ArrowLeft', 'ArrowRight'].indexOf( ev.key ) === -1 )return;
			var increment = ev.key === 'ArrowLeft' ? -1 : 1;
			if( this.direction === 'rtl' ) {
				increment *= -1;
			}
			this.setValue_( Math.min( Math.max( this.getSelectedValue_() + increment, 0 ), this.stars ));
		},

		/** @return void */
		onMouseenter_: function() {
			var rect = this.widgetEl.getBoundingClientRect();
			this.offsetLeft = rect.left + document.body.scrollLeft;
			this.widgetEl.addEventListener( 'mousemove', this.events.mousemove );
		},

		/** @return void */
		onMouseleave_: function() {
			this.widgetEl.removeEventListener( 'mousemove', this.events.mousemove );
			this.changeTo_( this.selected );
		},

		/** @return void */
		onMousemove_: function( ev ) { // MouseEvent
			this.changeTo_( this.getIndexFromPosition_( ev.pageX ));
		},

		/** @return void */
		onReset_: function() {
			var originallySelected = this.el.querySelector( '[selected]' );
			var value = originallySelected ? originallySelected.value : '';
			this.el.value = value;
			this.selected = parseInt( value ) || 0;
			this.changeTo_( value );
		},

		/** @return void */
			if( this.el.parentNode.classList.contains( 'gl-star-rating' )) {
		rebuild_: function() {
				this.destroy_();
			}
			this.init_();
		},

		/** @return void */
		setDirection_: function() {
			var wrapEl = this.el.parentNode;
			this.direction = window.getComputedStyle( wrapEl, null ).getPropertyValue( 'direction' );
			wrapEl.classList.add( 'gl-star-rating-' + this.direction );
		},

		/** @return void */
		setValue_: function( index ) {
			this.el.value = index;
			this.selected = index;
			this.changeTo_( index );
		},

		/** @return void */
		setStarCount_: function() {
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
				class: 'gl-star-rating',
		wrapEl_: function() {
			var wrapEl = this.insertSpanEl_( this.el, {
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
