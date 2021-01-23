module.exports = {
  plugins: [
    require('postcss-hexrgba'),
    require('postcss-custom-properties'),
    require('postcss-selector-namespace')({namespace: ''}), // add a custom namespace here
    require('autoprefixer'),
  ],
};
