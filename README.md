# Star Rating v1.0.0

This plugin transforms a select with numerical-range values (i.e. 1-5) into a dynamic star rating element.

For production, use the files from the `dist/` folder.

## Usage Example

```html
<link href="css/star-rating.css" rel="stylesheet">

<script src="js/jquery.min.js"></script>
<script src="js/star-rating.min.js"></script>
<script>
	jQuery( 'select.star-rating' ).starrating({
		clickFn: function( selected ) {
			console.log( 'I clicked star #' + selected );
		},
	});
</script>

<select class="star-rating">
	<option value="">Select a rating</option>
	<option value="5">Excellent</option>
	<option value="4">Very Good</option>
	<option value="3">Average</option>
	<option value="2">Poor</option>
	<option value="1">Terrible</option>
</select>
```

## Options

Here are the default options

```js
{
    clearable  : true,
    clickFn    : null,
    initialText: "Click to Rate",
}
```

### clearable:

This value determines whether the star rating can be cleared by clicking on the preselected star.

Acceptable values are: `false`, `true`, `"reset"`.

Default: `true`

### clickFn:

This value determines the custom function that is triggered after you click on a star.

Default: `null`

### initialText:

This value determines the initial text when no value is selected.

Default: `"Click to Rate"`

## Build

Star Rating uses `gulp` to build from src.

```bash
$ npm install
$ gulp
```

The compiled files will be saved in the `dist/` folder.

## Contributing

All changes should be committed to the files in `src/`.

## Changelog

`v1.0.0 - [06/10/2016]`

- Initial release

## License

[MIT](/LICENSE)
