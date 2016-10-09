# star-rating.js

This plugin transforms a select with numerical-range values (i.e. 1-5) into a dynamic star rating element.

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

<script src="js/jquery.min.js"></script>
<script src="js/star-rating.min.js"></script>
<script>
	jQuery( '#star-rating' ).starrating({
		clickFn: function( selected ) {
			console.log( 'I clicked star #' + selected );
		},
	});
</script>
```

by default, the images are located in the following relative path from the stylesheet: <code>../img/star-*.svg</code>. To change this location, either import the SCSS file into your project and change the default SCSS variables, or override the CSS directly in your stylesheet.

## Options

Here are the default options

```js
{
    clearable  : true,
    clickFn    : null,
    initialText: "Click to Rate",
    showText   : true,
}
```

### clearable:

This boolean value determines whether the star rating can be cleared by clicking on an already pre-selected star.

### clickFn:

This value determines the custom function that is triggered after you click on a star.

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

[Full changelog](/CHANGELOG.md)

## License

[MIT](/LICENSE)
