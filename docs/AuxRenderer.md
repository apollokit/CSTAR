# AuxRender.js

Adds the ability to "annotate" an entity in the cesium viewer


## Overview

`auxrender.js` contains a class AuxRender that allows you to define a custom renderer for each ID (from czml) loaded into the cesium viewer. These renderers are defined as ES6 classes, and are mapped onto IDs with a json file.

## Usage

_Please refer to the [readme](../README.md) for instructions on how to install CSTAR._

### Setup

Link the `auxrender.js` script somewhere in your HTML:

```html
<script src="path/to/cstar/js/auxrender.js"></script>
```

Then, later in your javascript, instantiate and attach the exposed `AuxRenderer` object:

```javascript
var ar = new AuxRenderer();
ar.load('path/to/description.json');
ar.attach();
```

Read on to find out what goes in the description.json file:

### Extension

At the core of the AuxRenderer is the description file--the json file that lists the renderers to load and the IDs to map those renderers onto. This is the basic format:

```json
{
	"renderers": [
		"path/to/renderer1.js",
		"path/to/renderer2.js"
	],
	"renderMapping": {
		"Entities/Entity1ID": ["Renderer1"],
		"Entities/Entity2ID": ["Renderer1", "Renderer2"]
	}
}
```

A breakdown of what's going on here: Under the `renderers` key, we've defined a list of paths of javascript files to load. These will be asynchronously loaded in the background, and as soon as they're ready the renderers contained inside them will be applied to the entities specified under the `renderMapping` key. There can be multiple renderers associated to a single entity. Note as well that the renderers can be sourced from anywhere, local or remote.

Renderers themselves are written as ES6 classes. Here's a bare-bones renderer:

```javascript
class TestAuxRenderer {
	/**
	 * Render method
	 * @param ctx canvas 2d render context
	 * @param ent the entity to bind to
	 * @param pos the position of that entity (window-space coordinates)
	 * @param visible boolean, true if visible (not occluded)
	 */
	render(ctx, ent, pos, visible) {
		// do something
	}
}

// register with the auxrenderer
AuxRenderers.Test = TestAuxRenderer
```

Important things to note:

- Each renderer runs on it's own instance for each entity--that is to say, every entity with this renderer mapped to it will get a unique instance of this class.
- The render method gets called once per frame, and the frame is cleared every time. Be aware that your draw calls should be performant.
- When you register your class with AuxRenderers.<something> the name that you register it with is the name you need to use with `renderMapping`, not the defined class name (if they're different).

### Further reading

[Canvas API on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

[Canvas Tutorial on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
