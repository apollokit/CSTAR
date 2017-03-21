/**
 * Cesium camera studio - camera controller
 * @author Patrick Kage
 * @note polyfills/transpilation may be required for ES6, Promises, & Fetch API
 */


// main camera controller
class Grip {
	constructor() {
		// ensure that we have the prerequisites
		if (!('easing' in window)) {
			throw new Error('easings missing - make sure easing.js is linked');
		}

		if (!('viewer' in window)) {
			throw new Error('couldn\'t find viewer');
		}

		// instance variable setup
		this.storyboard = new Cesium.TimeIntervalCollection();


		// add keyboard event listener
		document.addEventListener('keyup', e => {
			if (e.keyCode == 67) {
				this.capture();
				if (e.shiftKey) {
					this.copyCaptureToClipboard();
					this.displayModal('saved capture to clipboard');
				} else {
					this.displayLatestCapture();
				}
			}

			if (e.keyCode == 191) this.toggleAttachment(); 

			if (e.keyCode == 32) this.togglePlayback();
		})

		// inject the ui hiding style
		this.injectStyle();
	}

	togglePlayback() {
		viewer.clock.shouldAnimate = !viewer.clock.shouldAnimate;
	}

	load(path) {
		// note that this may need a polyfill for the Fetch API in older browsers
		fetch(path)
			.then(res => res.json()) // convert the response to json
			.then(obj => {
				// load the response (containing shots) into the storyboard
				for (var i = 0; i < obj.shots.length; i++) {
					this.storyboard.addInterval(new Cesium.TimeInterval({
						start: new Cesium.JulianDate.fromIso8601(obj.shots[i].start.timestamp),
						stop: new Cesium.JulianDate.fromIso8601(obj.shots[i].end.timestamp),
						data: obj.shots[i]
					}))
				}
			})

	}

	// this is a dirty goddamn hack
	displayModal(body) {
		var entity = new Cesium.Entity('camerastudio');
		entity.description = {
			getValue: function() {
				return body;
			}
		};
		viewer.selectedEntity = entity;
	}

	// take a camera capture (bound to keypress)
	displayLatestCapture() {
		this.displayModal('<code>' + JSON.stringify(this.latestCapture) + '</code>');
	}

	// save a capture
	takeCapture() {
		this.latestCapture = this.capture();
	}

	attach() {
		// bind to the clock's tick, & create our unbinder
		// this.detach = viewer.clock.onTick.addEventListener(this.tick.bind(this));
		this.shouldAnimate = true;
		this.tick();
	}


	detach() {
		this.shouldAnimate = false;
	}

	toggleAttachment() {
		this.displayModal((this.shouldAnimate) ? "detaching grip..." : "attaching grip...");
		this.shouldAnimate = !this.shouldAnimate;
		this.tick();
	}

	getActiveShot() {
		return this.storyboard.findIntervalContainingDate(viewer.clock.currentTime);
	}

	// HAX HAX HAX
	copyCaptureToClipboard() {
		var tmpel = document.createElement('div');
		tmpel.innerHTML = JSON.stringify(this.latestCapture);

		// style the temp element
		tmpel.style.opacity = 0;
		tmpel.style.pointerEvents = 'none';

		document.body.appendChild(tmpel);
		
		var range = document.createRange();
		range.selectNode(tmpel);
		window.getSelection().addRange(range);

		// magic
		document.execCommand('copy');

		window.getSelection().removeAllRanges();

		tmpel.remove();

	}

	tick(ev) {
		// find the active shot
		var shot = this.getActiveShot();

		// if there's a shot, execute it
		if (shot !== undefined) {

			// calculate progress through shot
			// progress = (currentTime - shot.start) / (shot.stop - shot.start) 
			var shotLength = Cesium.JulianDate.secondsDifference(shot.stop, shot.start);
			var shotProgress = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, shot.start);

			// calculate tweened position/orientation
			var tweened = this.tweenShots(shot.data.start, shot.data.end, shotProgress / shotLength, easing[shot.data.easing]);

			// set camera to tweened position
			viewer.camera.setView({
				destination: tweened.position,
				orientation: {
					heading: tweened.orientation.heading,
					pitch: tweened.orientation.pitch,
					roll: tweened.orientation.roll
				}
			});

			// apply shot options if they exist
			if ('options' in shot.data) {
				this.applyOptions(shot.data.options);
			}
		}

		if (this.shouldAnimate) requestAnimationFrame(this.tick.bind(this));
	}

	capture() {
		var position = Cesium.Cartesian3.clone(viewer.camera.position);
		var direction = Cesium.Cartesian3.clone(viewer.camera.direction);
		var up = Cesium.Cartesian3.clone(viewer.camera.up);

		this.latestCapture = {
			position: {
				x: position.x,
				y: position.y,
				z: position.z
			},
			orientation: {
				heading: viewer.camera.heading,
				pitch: viewer.camera.pitch,
				roll: viewer.camera.roll
			},
			timestamp: viewer.clock.currentTime.toString() // ISO 8601
		}

		return this.latestCapture;
	}

	// start: start value
	// end: end value
	// percent: 0.0 - 1.0
	// easing: easing function
	tween(start, end, percent, easing) {
		var between = end - start;
		return start + (between * easing(percent));
	}

	// return camera position and direction between start and end shots
	tweenShots(start, end, percent, easing) {
		return {
			position: new Cesium.Cartesian3(
				this.tween(start.position.x, end.position.x, percent, easing),
				this.tween(start.position.y, end.position.y, percent, easing),
				this.tween(start.position.z, end.position.z, percent, easing)
			),
			orientation: {
				heading: this.tween(start.orientation.heading, end.orientation.heading, percent, easing),
				pitch: this.tween(start.orientation.pitch, end.orientation.pitch, percent, easing),
				roll: this.tween(start.orientation.roll, end.orientation.roll, percent, easing)
			}
		}
	}

	quaternionToHPR(quaternion) {
		var ysqr = quaternion.y * quaternion.y;

		var hpr = {}

		// roll (x-axis rotation)
		var t0 = 2.0 * (quaternion.w * quaternion.x + quaternion.y * quaternion.z);
		var t1 = 1.0 - 2.0 * (quaternion.x * quaternion.x + ysqr);
		hpr.roll = Math.atan2(t0, t1);

		// pitch (y-axis rotation)
		var t2 = 2.0 * (quaternion.w * quaternion.y - quaternion.z * quaternion.x);
		t2 = (t2 > 1.0) ? 1.0 : t2;
		t2 = (t2 < -1.0) ? -1.0 : t2;
		hpr.pitch = Math.asin(t2);

		// yaw (z-axis rotation)
		var t3 = 2.0 * (quaternion.w * quaternion.z + quaternion.x * quaternion.y);
		var t4 = 1.0 - 2.0 * (ysqr + quaternion.z * quaternion.z);
		hpr.yaw = Math.atan2(t3, t4);

		return hpr;
	}

	/**
	 * Inject UI hiding style
	 */
	injectStyle() {
		var style = document.createElement('style');
		
		// one lining here - it's a simple style
		style.innerHTML = '#cesiumContainer.grip-uihidden >.cesium-viewer > div:not(.cesium-viewer-cesiumWidgetContainer) {opacity: 0; pointer-events: none;}' + '#cesiumContainer.grip-uihidden {cursor: none;}';

		document.body.appendChild(style);
	}

	/**
	 * Apply options (if necessary)
	 * @param opts shot options
	 */
	applyOptions(opts) {
		if ('clockMultiplier' in opts) {
			viewer.clock.multiplier = opts.clockMultiplier;
		}

		if ('uiVisible' in opts) {
			// this conditional checks whether or not we need to update the class list
			// javascript lacks an XOR function so this is the best soln
			if (!opts.uiVisible != viewer.container.classList.contains('grip-uihidden')) {
				// add the hiding class if the uiVisible is false, otherwise remove it
				if (opts.uiVisible) {
					viewer.container.classList.remove('grip-uihidden')
				} else {
					viewer.container.classList.add('grip-uihidden')
				}
			}
		}

	}
}
