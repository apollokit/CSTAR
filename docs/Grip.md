# Grip.js
[Grip](https://en.wikipedia.org/wiki/Grip_(job)) allows you to record and play back sequences of camera movements.

## Overview

Grip allows you to "capture" the position of the camera and build a "storyboard" consisting of multiple time-linked shots. Each shot is a tween between the start and end camera positions (as captured), an [easing](http://easings.net/) algorithm to use, and some display options. This storyboard is defined in JSON, and is loaded in.

## Usage

_Please refer to the [readme](../README.md) for instructions on how to install CSTAR._

### Setup

Link the `studio.js` script somewhere in your HTML, as well as the prerequisite [easing algorthms](https://github.com/danro/easing-js):

```html
<script src="path/to/cstar/js/easings.js"></script>
<script src="path/to/cstar/js/studio.js"></script>
```

Then, later in your javascript, instantiate and attach the exposed `Grip` object:

```javascript
var grip = new Grip();

// load zero or more storyboards
grip.load('/path/to/storyboard.json');

grip.attach();
```

Read on to find out what goes in the storyboard.json file:


### Storyboards

Grip has the ability to load a storyboard file from somewhere, and process that into camera movements. Here's an example (with comments, which are not valid JSON):

```javascript
{
	// top level shots key
	"shots": [
		{ // each shot is represented as an object
			"description": "optional description key, though it's recommended to keep track of which shot this is",
			"options": {
				// all keys in this object (and this object as a whole) is optional
				"uiVisible": true,
				"clockMulitpllier": 60
			},
			// see below for a list of supported easings
			"easing": "linear",
			// paste in a capture here ...
			"start": {
				"position": {
					"x": 21412767.63262456,
					"y": -19966663.903309148,
					"z": 12345685.569661142
				},
				"orientation": {
					"heading": 6.283185307179586,
					"pitch": -1.5700421681107133,
					"roll": 0
				},
				"timestamp": "2012-03-15T10:02:00Z"
			},
			// ... and also here
			"end": {
				"position": {
					"x": 6125115.16081661,
					"y": 2438510.7915905886,
					"z": 367593.22577986855
				},
				"orientation": {
					"heading": 0.9394149246942654,
					"pitch": -1.0578853641709802,
					"roll": 0.20124793957855136
				},
				"timestamp": "2012-03-15T10:20:31.4067697674181545Z"
			}
		}
	],
}
```

Some things to note:

 - Shots should not overlap
 - Shots can be defined in any order
 - seting `options.clockMultiplier` to zero will stop the simulation, and you will need to manually restart it (grip operates on the cesium internal clock)

### Creating captures

Press `c` to create a capture of the current timestamp. The capture will pop up, and look something like this:

```javascript
{
	"position": {
		"x": 6125115.16081661,
		"y": 2438510.7915905886,
		"z": 367593.22577986855
	},
	"orientation": {
		"heading": 0.9394149246942654,
		"pitch": -1.0578853641709802,
		"roll": 0.20124793957855136
	},
	"timestamp": "2012-03-15T10:20:31.4067697674181545Z"
}
```

Easiest thing to do would be to copy/paste that into a storyboard file, under the `shot.start` or `shot.end` keys.

### Supported easings

```
linear
swingFromTo
swingFrom
swingTo
easeFromTo
easeFrom
easeTo
easeInQuad
easeOutQuad
easeInOutQuad
easeInCubic
easeOutCubic
easeInOutCubic
easeInQuart
easeOutQuart
easeInOutQuart
easeInQuint
easeOutQuint
easeInOutQuint
easeInSine
easeOutSine
easeInOutSine
easeInExpo
easeOutExpo
easeInOutExpo
easeInCirc
easeOutCirc
easeInOutCirc
easeOutBounce
easeInBack
easeOutBack
easeInOutBack
bounce
bouncePast
elastic
```
