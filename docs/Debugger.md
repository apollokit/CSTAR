# Debugger.js
Debug your Grip storyboards.

## Overview

`debugger.js` contains a basic debugger capable of showing information about the current state of the attached grip instance and the Cesium viewer's camera.

## Usage

_Please refer to the [readme](../README.md) for instructions on how to install CSTAR._

### Setup

Link the `debugger.js` script somewhere in your HTML:

```html
<script src="path/to/cstar/js/debugger.js"></script>
```

Then, later in your javascript, instantiate the exposed `Debugger` object (it auto attaches):

```javascript
var debug = new Debugger();
```

