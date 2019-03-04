# benderjs-pfw

Adds overwrite buttons for CKEditor4 [Paste from Word](https://ckeditor.com/cke4/addon/pastefromword) generated tests allowing to accept test changes by a single click.

## Install

Clone this repository and add `benderjs-pfw` to the plugins array in your `bender.js` configuration file:

```js
var config = {
    applications: {...}

    browsers: [...],

    plugins: [ 'benderjs-yui', '/path/to/cloned/repository/benderjs-pfw' ], // load the plugin

    tests: {...}
};

module.exports = config;
```
