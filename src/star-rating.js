/*!
 * Star Rating
 * @version: 3.2.0
 * @author: Paul Ryley (http://geminilabs.io)
 * @url: https://github.com/pryley/star-rating.js
 * @license: MIT
 */
/** global: define, Event */
;(function( window, document, undefined ) {

	"use strict";

	var handle = 'star-rating';

	/** @return object */
	var Plugin = function( selector, options ) { // string|object|NodeList, object
		var selectorType = {}.toString.call(selector);
		if ('[object String]' === selectorType) {
			this.selects = document.querySelectorAll(selector);
		} else if ('[object NodeList]' === selectorType) {
			this.selects = selector;
		} else {
			this.selects = [selector];
		}
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
			if( this.selects[i].tagName !== 'SELECT' || this.selects[i][handle] )continue;
			var widget = new Widget( this.selects[i], options );
			if( widget.direction === undefined )continue;
			this.widgets.push( widget );
		}
	};

	/** @return void */
	var Widget = function( el, options ) { // HTMLElement, object|null
		this.el = el;
		this.options_ = this.extend_( {}, this.defaults_, options || {}, JSON.parse( el.getAttribute( 'data-options' )));
		this.setStarCount_();
		if( this.stars < 1 || this.stars > this.options_.maxStars )return;
		this.rebuild_();
	};

	Widget.prototype = {

		defaults_: {
			classname: 'gl-star-rating',
			clearable: true,
			initialText: 'Select a Rating',
			maxStars: 10,
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
			this.el[handle] = true;
		},

		/** @return void */
		buildLabelEl_: function() {
			if( !this.options_.showText )return;
			this.textEl = this.insertSpanEl_( this.widgetEl, {
				class: this.options_.classname + '-text',
			}, true );
		},

		/** @return void */
		buildWidgetEl_: function() {
			var values = this.getOptionValues_();
			var widgetEl = this.insertSpanEl_( this.el, {
				class: this.options_.classname + '-stars',
			}, true );
			for( var key in values ) {
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
			if( index < 0 || isNaN( index )) {
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
				el.setAttribute( key, attributes[key] );
			}
			return el;
		},

		/** @return void */
		destroy_: function() {
			this.handleEvents_( 'remove' );
			var wrapEl = this.el.parentNode;
			wrapEl.parentNode.replaceChild( this.el, wrapEl );
			delete this.el[handle];
		},

		/** @return void */
		eventListener_: function( el, action, events ) { // HTMLElement, string, array
			events.forEach( function( event ) {
				if (this.events) {
					el[action + 'EventListener']( event, this.events[event] );
				}
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
		getIndexFromEvent_: function( ev ) { // MouseEvent|TouchEvent
			var direction = {};
			var pageX = ev.pageX || ev.changedTouches[0].pageX;
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
				if( this.isValueEmpty_( el[i] ))continue;
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
			if( formEl && formEl.tagName === 'FORM' ) {
				this.eventListener_( formEl, action, ['reset'] );
			}
			if( 'add' === action && this.el.disabled )return;
			this.eventListener_( this.el, action, ['change', 'keydown'] );
			this.eventListener_( this.widgetEl, action, [
				'mousedown', 'mouseleave', 'mousemove', 'mouseover',
				'touchend', 'touchmove', 'touchstart',
			]);
		},

		/** @return void */
		initEvents_: function() {
			this.events = {
				change: this.onChange_.bind( this ),
				keydown: this.onKeydown_.bind( this ),
				mousedown: this.onPointerdown_.bind( this ),
				mouseleave: this.onPointerleave_.bind( this ),
				mousemove: this.onPointermove_.bind( this ),
				mouseover: this.onPointerover_.bind( this ),
				reset: this.onReset_.bind( this ),
				touchend: this.onPointerdown_.bind( this ),
				touchmove: this.onPointermove_.bind( this ),
				touchstart: this.onPointerover_.bind( this ),
			};
		},

		/** @return void */
		insertSpanEl_: function( el, attributes, after ) { // HTMLElement, object, bool
			var newEl = this.createSpanEl_( attributes );
			el.parentNode.insertBefore( newEl, after === true ? el.nextSibling : el );
			return newEl;
		},

		/** @return bool */
		isValueEmpty_: function( el ) { // HTMLElement
			return el.getAttribute( 'value' ) === null || el.value === '';
		},

		/** @return void */
		onChange_: function() {
			this.changeTo_( this.getSelectedValue_() );
		},

		/** @return void */
		onKeydown_: function( ev ) { // KeyboardEvent
			if( !~['ArrowLeft', 'ArrowRight'].indexOf( ev.key ))return;
			var increment = ev.key === 'ArrowLeft' ? -1 : 1;
			if( this.direction === 'rtl' ) {
				increment *= -1;
			}
			this.setValue_( Math.min( Math.max( this.getSelectedValue_() + increment, 0 ), this.stars ));
			this.triggerChangeEvent_();
		},

		/** @return void */
		onPointerdown_: function( ev ) { // MouseEvent|TouchEvent
			ev.preventDefault();
			var index = this.getIndexFromEvent_( ev );
			if( this.current !== 0 && parseFloat( this.selected ) === index && this.options_.clearable ) {
				index = 0;
			}
			this.setValue_( index );
			this.triggerChangeEvent_();
		},

		/** @return void */
		onPointerleave_: function( ev ) { // MouseEvent
			ev.preventDefault();
			this.changeTo_( this.selected );
		},

		/** @return void */
		onPointermove_: function( ev ) { // MouseEvent|TouchEvent
			ev.preventDefault();
			this.changeTo_( this.getIndexFromEvent_( ev ));
		},

		/** @return void */
		onPointerover_: function( ev ) { // MouseEvent|TouchEvent
			ev.preventDefault();
			var rect = this.widgetEl.getBoundingClientRect();
			this.offsetLeft = rect.left + document.body.scrollLeft;
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
		rebuild_: function() {
			if( this.el.parentNode.classList.contains( this.options_.classname )) {
				this.destroy_();
			}
			this.init_();
		},

		/** @return void */
		setDirection_: function() {
			var wrapEl = this.el.parentNode;
			this.direction = window.getComputedStyle( wrapEl, null ).getPropertyValue( 'direction' );
			wrapEl.classList.add( this.options_.classname + '-' + this.direction );
		},

		/** @return void */
		setValue_: function( index ) {
			this.el.value = this.selected = index;
			this.changeTo_( index );
		},

		/** @return void */
		setStarCount_: function() {
			var el = this.el;
			this.stars = 0;
			for( var i = 0; i < el.length; i++ ) {
				if( this.isValueEmpty_( el[i] ))continue;
				if( isNaN( parseFloat( el[i].value )) || !isFinite( el[i].value )) {
					this.stars = 0;
					return;
				}
				this.stars++;
			}
		},

		/** @return void */
		triggerChangeEvent_: function() {
			this.el.dispatchEvent( new Event( 'change' ));
		},

		/** @return void */
		wrapEl_: function() {
			var wrapEl = this.insertSpanEl_( this.el, {
				class: this.options_.classname,
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
