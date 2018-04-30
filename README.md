# star-rating.js

[![GitHub version](https://badge.fury.io/gh/geminilabs%2Fstar-rating.js.svg)](https://badge.fury.io/gh/geminilabs%2Fstar-rating.js)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/geminilabs/star-rating.js/blob/master/LICENSE)

This zero-dependency plugin transforms a select with numerical-range values (i.e. 1-5) into a dynamic star rating element.

For convenience, this plugin can also be used as a jQuery plugin (see examples below).

For production, use the files from the `dist/` folder.

## Usage Example

```html
<link href="css/star-rating.css" rel="stylesheet">

<select id="star-rating">
	<option value="">Select a rating</option>
	<option value="5">Excellent</option>
	<option value="4">Very Good</option>
	<option value="3">Average</option>
	<option value="2">Poor</option>
	<option value="1">Terrible</option>
</select>

<script src="js/star-rating.min.js"></script>
<script>
	// Using vanilla javascript:
	var starrating = new StarRating( document.getElementById( 'star-rating' ));
	// OR - Using jQuery:
	$( '#star-rating' ).starrating();
</script>
```

by default, the images are located in the following relative path from the stylesheet: <code>../img/star-*.svg</code>. To change this location, either import the SCSS file into your project and change the default SCSS variables, or override the CSS directly in your stylesheet.

## Options

Here are the default options

```js
{
    clearable  : true,
    initialText: "Click to Rate",
    onClick    : null,
    showText   : true,
}
```

### clearable:

This boolean value determines whether the star rating can be cleared by clicking on an already pre-selected star.

### onClick:

This value determines the custom function that is triggered after you click on a star. The custom function argument is the select HTMLElement.

### initialText:

This string value determines the initial text when no value is selected. This has no effect if `showText` is set to false.

### showText:

This boolean value determines whether or not the rating text is shown.

## Build

Star Rating uses `gulp` to build from src.

```sh
$ npm install
$ gulp
```

The compiled files will be saved in the `dist/` folder.

## Contributing

All changes should be committed to the files in `src/`.

## Changelog

`v2.0.0 [02-05-2018]`

- Removed jQuery plugin as it's unnecessary
- Removed IE9 support

`v1.3.3 [11-04-2017]`

- [Bugfix]: JS race conditions sometimes prevent correct element.outerWidth calculation

`v1.3.1 [22-12-2016]`

- [Bugfix]: Check existence of parent form element before attaching an event to it.
- [Bugfix]: Correctly unattach mousemove event.

`v1.3.0 [10-10-2016]`

- [Modified]: Renamed `clickFn` to `onClick` which now passes the select HTMLElement as the argument.

`v1.2.2 [10-10-2016]`

- [Bugfix]: Reset star rating when the parent form is reset, even if the `clearable` option is false.

`v1.2.1 [09-10-2016]`

- [Bugfix]: Reset star rating when the parent form is reset.

`v1.2.0 [09-10-2016]`

- [Feature]: Zero-dependencies.
- [Bugfix]: Use "clip-path" instead of hiding select (fixes HTML5 “required” attribute validation).

`v1.1.0 [06-10-2016]`

- [Added]: `showText` option.

`v1.0.1 [06-10-2016]`

- [Bugfix]: Get the correct left offset.

`v1.0.0 [06-10-2016]`

- Initial release.

## License

[MIT](/LICENSE)
