# star-rating.js

[![npm version](https://badge.fury.io/js/star-rating.js.svg)](https://badge.fury.io/js/star-rating.js)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/geminilabs/star-rating.js/blob/master/LICENSE)

A zero-dependency plugin that transforms a select with numerical-range values (i.e. 1-5) into a dynamic star rating element.

For production, use the files from the `dist/` folder.

## Installation

Use one of the following methods to add the plugin to your project:

- [Download ZIP](https://github.com/geminilabs/star-rating.js/zipball/master)
- `yarn add star-rating.js`
- `npm install star-rating.js`
- `bower install star-rating.js`

## Usage

```html
<link href="css/star-rating.css" rel="stylesheet">

<select class="star-rating">
    <option value="">Select a rating</option>
    <option value="5">Excellent</option>
    <option value="4">Very Good</option>
    <option value="3">Average</option>
    <option value="2">Poor</option>
    <option value="1">Terrible</option>
</select>

<script src="js/star-rating.min.js"></script>
<script>
    var starRatingControls = new StarRating( '.star-rating' );
</script>
```

To rebuild all star rating controls (e.g. after form fields have changed with ajax):

```js
starRatingControls.rebuild();
```

To fully remove all star rating controls, including all attached Event Listeners:

```js
starRatingControls.destroy();
```

## Options

Here are the default options

```js
{
    clearable: true,
    initialText: "Select a Rating",
    maxStars: 10,
    onClick: null,
    showText: true,
}
```

### clearable:

Type: `Boolean`

Determines whether the star rating can be cleared by clicking on an already pre-selected star.

### initialText:

Type: `String`

Determines the initial text when no value is selected. This has no effect if `showText` is set to false.

### maxStars:

Type: `Integer`

Determines the maximum number of stars allowed in a star rating.

### onClick:

Type: `Function`

This is triggered after you click on a star. The function argument is the select HTMLElement.

### showText:

Type: `Boolean`

Determines whether or not the rating text is shown.

## Build

Star Rating uses [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/) to manage package dependencies and [gulp](http://gulpjs.com/) to build from `src/`.

```sh
yarn
gulp
```

The compiled files will be saved in the `dist/` folder.

### Style Customization

Sass is used to build the stylesheet so you can `@import` the `src/star-rating.scss` file to compile it directly into your Sass project.

Following are the default sass values for Star Rating, they are contained in a map variable.

```sass
$star-rating-defaults: (
    base-display   : block,
    base-height    : 26px,
    font-size      : 0.8em,
    font-weight    : 600,
    star-empty     : '../img/star-empty.svg',
    star-filled    : '../img/star-filled.svg',
    star-half      : '../img/star-half.svg',
    star-size      : 24px,
    text-background: #1a1a1a,
    text-color     : #fff,
);
```

To override any values with your own, simply create a new `$star-rating` map variable and include only the values you wish to change.

Important: Make sure you define `$star-rating` before you import the `src/star-rating.scss` file:

```sass
$star-rating: (
    base-height: 32px,
    star-size  : 30px,
);

@import "../../node_modules/star-rating.js/src/star-rating"
```

## Compatibility

- All modern browsers
- IE 10+

## Contributing

All changes should be committed to the files in `src/`.

## Changelog

`v2.1.1 - [2018-05-25]`

- Fixed jshint warnings

`v2.1.0 - [2018-05-11]`

- Added support for the keyboard
- Fixed accessibility support
- Fixed RTL support

`v2.0.0 - [2018-05-02]`

- Major rewrite of plugin
- Added support for loading as a module
- Added support for RTL
- Removed jQuery plugin
- Removed IE9 support

`v1.3.3 - [2017-04-11]`

- Fixed race conditions preventing correct element.outerWidth calculation

`v1.3.1 - [2016-12-22]`

- Fixed checking existence of parent form element before attaching an event to it
- Fixed mousemove event not correctly unattaching

`v1.3.0 - [2016-10-10]`

- Changed `clickFn` to `onClick` which now passes the select HTMLElement as the argument

`v1.2.2 - [2016-10-10]`

- Fixed "reset" event when the `clearable` option is false

`v1.2.1 - [2016-10-09]`

- Fixed resetting the star-rating when a form "reset" event is triggered

`v1.2.0 - [2016-10-09]`

- Removed plugin dependencies
- Fixed HTML5 “required” attribute validation

`v1.1.0 - [2016-10-06]`

- Added `showText` option

`v1.0.1 - [2016-10-06]`

- Fixed using the wrong left offset

`v1.0.0 - [2016-10-06]`

- Initial release

## License

[MIT](/LICENSE)
