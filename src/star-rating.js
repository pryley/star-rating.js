/**!
 * Star Rating
 *
 * Version: 1.0.0
 * Author: Paul Ryley (http://geminilabs.io)
 * URL: https://github.com/geminilabs/star-rating.js
 * License: MIT
 */

;(function( $, window, document, undefined )
{
	"use strict";

	var Plugin = function( el, options )
	{
		this.el = el;
		this.$el = $( el );
		this.options = options;
		this.metadata = this.$el.data( "options" );
		this.stars = 0;
	};

	Plugin.prototype = {

		defaults: {
			clearable  : true,
			clickFn    : null,
			initialText: "Click to Rate",
		},

		init: function()
		{
			if( this.el.tagName !== 'SELECT' )return;

			for( var i = 0; i < this.el.length; i++ ) {
				if( this.el[i].value === '' )continue;
				// abort if any value is not numerical
				if( isNaN( parseFloat( this.el[i].value ) ) || !isFinite( this.el[i].value ) )return;
				this.stars++;
			}

			// abort if number of stars is outside the 1-10 range
			if( this.stars < 1 || this.stars > 10 )return;

			this.config = $.extend( {}, this.defaults, this.options, this.metadata );

			this.build();

			this.$el.on( "change", this.change.bind( this ) );
			this.$wrap.on( "mouseenter", this.enter.bind( this ) );
			this.$wrap.on( "mouseleave", this.leave.bind( this ) );
			this.$wrap.on( "click", this.select.bind( this ) );

			this.current = this.el.options[ this.el.selectedIndex ].value;
			this.selected = this.current;
			this.width = this.wrap.offsetWidth;
			this.star = Math.round( this.width / this.stars );

			this.select();

			return this;
		},

		build: function()
		{
			var ordered = {};
			var unordered = {};

			this.$el.wrap( '<span class="gl-star-rating" data-star-rating/>' ).after( '<span class="gl-star-rating-stars"/><span class="gl-star-rating-text"/>');

			this.wrap = this.el.nextSibling;
			this.$wrap = $( this.wrap );
			this.text = this.wrap.nextSibling;

			for( var i = 0; i < this.el.length; i++ ) {
				if( this.el[i].value !== '' ) {
					unordered[ this.el[i].value ] = this.el[i].text;
				}
			}

			Object.keys( unordered ).sort().forEach( function( key ) {
				ordered[key] = unordered[key];
			});

			for( var key in ordered ) {
				this.$wrap.append( '<span data-value="' + key + '" data-text="' + ordered[ key ] + '"/>' );
			}
		},

		change: function()
		{
			this.show( this.el.options[ this.el.selectedIndex ].value );
		},

		clear: function( reset )
		{
			if( this.config.clearable ) {
				this.el.value = "";
				this.selected = "";
				this.show(0);
			}
		},

		enter: function()
		{
			this.$wrap.on( "mousemove", this.move.bind( this ) );
			this.offsetLeft = this.wrap.offsetLeft;
		},

		getIndexFromPosition: function( pageX )
		{
			return Math.min(
				Math.ceil( Math.max( pageX - this.offsetLeft, 1 ) / this.star ),
				this.stars
			);
		},

		leave: function()
		{
			this.$wrap.off( "mousemove" );
			this.show( this.selected );
		},

		move: function( ev )
		{
			this.show( this.getIndexFromPosition( ev.pageX ) );
		},

		select: function( ev )
		{
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

			this.show( index );

			if( ev !== undefined && typeof this.config.clickFn === 'function' ) {
				this.config.clickFn( this.selected );
			}
		},

		show: function( index )
		{
			if( index < 0 || index === "" ) {
				index = 0;
			}
			if( index > this.stars ) {
				index = this.stars;
			}

			this.$wrap.removeClass( 's' + ( 10 * this.current )).addClass( 's' + ( 10 * index ));
			this.text.textContent = index < 1 ? this.config.initialText : this.wrap.childNodes[ index - 1 ].dataset.text;
			this.current = index;
		},
	};

	Plugin.defaults = Plugin.prototype.defaults;

	$.fn.starrating = function( options ) {
		return this.each( function() {
			if( !$.data( this, "plugin_starrating" )) {
				$.data( this, "plugin_starrating", new Plugin( this, options ).init());
			}
		});
	};

	window.StarRating = Plugin;

})( jQuery, window, document );
