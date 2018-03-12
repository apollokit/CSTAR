/**
 * Cesiumjs auxillary render layer
 * @author Patrick Kage
 */

class AuxRenderer {
	constructor() {
		this.el = null;
		this.shouldTick = false;
		window.AuxRenderers = {};
		this.description = null;
	}

	/**
	 * Load render description json file
	 * @param path to render description file
	 */
	load(path) {
		fetch(path)
			.then(res => res.json())
			.then(obj => {
				this.description = obj;
				this._loadPlugins();
			});
	}

	/**
	 * Load render plugins - requires description to be loaded
	 */
	_loadPlugins() {
		if (this.description === null) {
			console.warn('No description loaded!');
			return;
		}

		for (let path of this.description.renderers) {
			let script = document.createElement('script');
			script.setAttribute('src', path);
			document.body.appendChild(script);
		}
	}

	/**
	 * Attach the aux renderer, re-attaching if detached
	 */
	attach() {
		if (this.el === null) {
			this.injectLayer();
		} else {
			// re-attach detached
			document.body.appendChild(this.el);
		}

		this.shouldTick = true;
		this.tick();
	}

	/**
	 * Detach the aux render, and freeze render ops (todo)
	 */
	detach() {
		if (this.el !== null) {
			this.el.remove();
		}
		this.shouldTick = false;
	}

	/**
	 * Create the canvas layer to render to
	 * @param zindex the z index of the layer (optional, defaults to 1000)
	 * @return this.el the newly created and configured layer target
	 */
	injectLayer(zindex) {
		// default z index is 1000
		zindex = zindex || 1000;

		var canvas = document.createElement('canvas');

		// configure canvas layer to fill the screen on top of everything
		canvas.style.position = 'fixed';
		canvas.style.top = 0;
		canvas.style.bottom = 0;
		canvas.style.left = 0;
		canvas.style.right = 0;
		canvas.style.zIndex = zindex;

		// non-interactive
		canvas.style.pointerEvents = 'none';

		// fit to window, set up resize events
		this.el = canvas;
		this.fitLayerToWindow();
		window.addEventListener('resize', this.fitLayerToWindow.bind(this));

		// attach
		document.body.appendChild(this.el);

		return this.el;
	}

	/**
	 * Fit the canvas layer to the window size, for resize events/init
	 */
	fitLayerToWindow() {
		this.el.width = window.innerWidth;
		this.el.height = window.innerHeight;
	}

	/**
	 * Tick the render event
	 */
	tick() {
		var ctx = this.el.getContext('2d');
		ctx.clearRect(0,0,this.el.width, this.el.height);


		// renderer things
		if (this.description !== null) {
			for (let id of Object.keys(this.description.renderMapping)) {
				// prep for calling renderer(s) by figuring out the entity info
				let ent = this.resolveEntity(id);
				if (ent == null || !ent.isAvailable(viewer.clock.currentTime)) {
				    // skip renderers if unavailable
				    continue;
				}

                let pos = undefined;

                try  {
					// if the Cesium-canonical "position" property is undefined, then a "position_proxy" may have been added instead
	                if (ent.position === undefined) {
	                    pos = ent.position_proxy.getValue(viewer.clock.currentTime);
	                }
	                else {
					    pos = ent.position.getValue(viewer.clock.currentTime);
	                }
				}
				catch (e)  {
					console.log('auxrender.js,tick(): could not find position or position_proxy attribute for object id: '+id)
				}
                

				let visible = this.isPositionVisible(pos);

				// otherwise, transform the position to window coordinates
				pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, pos);

				// if scene transforms failed then skip this renderer
				if (pos === undefined) continue;

				// run all the renderers
				for (let c in this.description.renderMapping[id]) {
					let renderer = this.description.renderMapping[id][c];

					// check if we still need to load the renderer
					if (typeof(renderer) == 'string') {
						if (AuxRenderers[renderer] !== undefined) {
							this.description.renderMapping[id][c] = new AuxRenderers[renderer]();
						}
						// this renderer has not loaded yet, maybe next frame it will be
						// or we just loaded it, we'll wait until next frame cuz we're lazy
						continue;
					}

					// call the renderer's render function
					renderer.render(ctx, ent, pos, visible);
				}
			}
		}
		// attach toggle
		if (this.shouldTick) requestAnimationFrame(this.tick.bind(this));
	}

	/**
	 * Resolve entity by ID
	 * @param id id of entity to target
	 * @return entity or null
	 */
	resolveEntity(id) {
		for (var c = 0; c < viewer.dataSources.length; c++) {
			var ent = viewer.dataSources.get(c).entities.getById(id);
			if (ent) return ent;
		}
		return null;
	}

	/**
	 * Distance between positions
	 * @param pos1 position 1
	 * @param pos2 position 2
	 * @return distance
	 */
	getDistanceBetweenPoints(pos1, pos2) {
		var pos = Cesium.Cartesian3.clone(pos2);
		try  {
			Cesium.Cartesian3.subtract(pos, pos1, pos);
		}
		catch (e)  {
			console.log('auxrender.js,getDistanceBetweenPoints: error performing position subtraction, entity position Cartesian coordinates in czml might not be defined at this time point')
		}

		return Math.sqrt( Math.pow(pos.x, 2) + Math.pow(pos.y, 2) + Math.pow(pos.z, 2));
	}

	/**
	 * Raycast and find if a position is occluded by the globe
	 * @param position position of entity
	 * @return bool true if visible
	 */
	isPositionVisible(position) {
		// center of the globe
		var globeCenter = new Cesium.Cartesian3(0,-6371,0);

		// if the center of the globe is closer to the camera than the position of the entity
		// then we're assuming that it's behind the globe
		return (this.getDistanceBetweenPoints(globeCenter, viewer.camera.position) > this.getDistanceBetweenPoints(position, viewer.camera.position));
	}

}
