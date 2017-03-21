/**
 * Cesium camera studio - manual camera controller
 * @author Patrick Kage
 */

class Dolly {
	constructor() {
		this.flags = {
			moveForward: false,
			moveBackward: false,
			moveUp: false,
			moveDown: false,
			moveLeft: false,
			moveRight: false,
			lookLeft: false,
			lookUp: false,
			lookRight: false,
			lookDown: false,
			twistLeft: false,
			twistRight: false
		}
	}

	getFlagForKeyCode(keyCode) {
		switch (keyCode) {
			case 'W'.charCodeAt(0):
				return 'moveForward';
			case 'S'.charCodeAt(0):
				return 'moveBackward';
			case 'Q'.charCodeAt(0):
				return 'moveUp';
			case 'E'.charCodeAt(0):
				return 'moveDown';
			case 'D'.charCodeAt(0):
				return 'moveRight';
			case 'A'.charCodeAt(0):
				return 'moveLeft';
			case 'H'.charCodeAt(0):
				return 'flyHome';
			case 'Z'.charCodeAt(0):
				return 'twistLeft';
			case 'X'.charCodeAt(0):
				return 'twistRight';
			case 37:
				return 'lookLeft';
			case 38:
				return 'lookUp';
			case 39:
				return 'lookRight';
			case 40:
				return 'lookDown';
			case 16:
				return 'shifted';
			default:
				return undefined;
		}
	}

	attach() {
		document.addEventListener('keydown', (e) => {
			var flagName = this.getFlagForKeyCode(e.keyCode);
			if (typeof flagName !== 'undefined') {
				this.flags[flagName] = true;
			}
		}, false);

		document.addEventListener('keyup', (e) => {
			var flagName = this.getFlagForKeyCode(e.keyCode);
			if (typeof flagName !== 'undefined') {
				this.flags[flagName] = false;
			}
		}, false);

		this.shouldAnimate = true;
		this.tick();
	}

	detach() {
		this.shouldAnimate = false;
	}

	tick() {
		// Change movement speed based on the distance of the camera to the surface of the ellipsoid.
		var cameraHeight = viewer.scene.globe.ellipsoid.cartesianToCartographic(viewer.camera.position).height;
		var moveRate = cameraHeight / 100.0;
		var lookRate = 0.01;

		if (this.flags.moveForward) {
			viewer.camera.moveForward(moveRate);
		}
		if (this.flags.moveBackward) {
			viewer.camera.moveBackward(moveRate);
		}
		if (this.flags.moveUp) {
			viewer.camera.moveUp(moveRate);
		}
		if (this.flags.moveDown) {
			viewer.camera.moveDown(moveRate);
		}
		if (this.flags.moveLeft) {
			viewer.camera.moveLeft(moveRate);
		}
		if (this.flags.moveRight) {
			viewer.camera.moveRight(moveRate);
		}
		if (this.flags.lookLeft) {
			viewer.camera.lookLeft(lookRate);
		}
		if (this.flags.lookUp) {
			viewer.camera.lookUp(lookRate);
		}
		if (this.flags.lookRight) {
			viewer.camera.lookRight(lookRate);
		}
		if (this.flags.lookDown) {
			viewer.camera.lookDown(lookRate);
		}
		if (this.flags.twistLeft) {
			viewer.camera.twistLeft();
		}
		if (this.flags.twistRight) {
			viewer.camera.twistRight();
		}
		if (this.flags.flyHome) {
			viewer.camera.flyHome(0);
		}

		if (this.flags.shifted) {
			// center of the earth
			var earthCenter = new Cesium.Cartesian3(0, -6371, 0);

			// figure out unit vector
			var vec = viewer.camera.direction.clone();

			// cameraHeight
			cameraHeight += 6371 * 1000;

			Cesium.Cartesian3.negate(vec, vec);
			Cesium.Cartesian3.multiplyByScalar(vec, cameraHeight, vec);

			viewer.camera.position = vec;
		}

		if (this.shouldAnimate) requestAnimationFrame(this.tick.bind(this));
	}
}
