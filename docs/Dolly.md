# Dolly.js
[Dolly](https://en.wikipedia.org/wiki/Camera_dolly) is a tool to allow for precise movement of the camera in Cesium, for use in creating storyboards with the Grip.

## Overview

`dolly.js` adds a pile (yes, that's the technical term) of keybindings to allow the camera to be moved around in Cesium. This allows you to precisely frame shots to later be used in the construction of a storyboard.

## Usage

_Please refer to the [readme](../README.md) for instructions on how to install CSTAR._

### Setup

Link the `dolly.js` script somewhere in your HTML:

```html
<script src="path/to/cstar/js/dolly.js"></script>
```

Then, later in your javascript, instantiate and attach the exposed `Dollyr` object:

```javascript
var dolly = new Dolly();
dolly.attach();
```

## Keybindings

On `Dolly#attach()`, the dolly will register the following key bindings:

Key | Action
--- | ------
`Left arrow` | Pan left
`Right arrow` | Pan right
`Up arrow` | Tilt up
`Down arrow` | Tilt down
`Z` | Roll left
`X` | Roll right
`W` | Dolly forwards
`S` | Dolly backwards
`A` | Truck left
`D` | Truck right
`E` | Pedestal down
`Q` | Pedestal up
`H` | Reset view to home

## Further reading

Handy dandy chart describing camera movement terminology:

![a chart describing 6DOF camera movement](http://i.imgur.com/AgZOdTB.png)
