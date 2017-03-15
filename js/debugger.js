class Debugger {
	constructor(track) {

		// set the grip to track
		this.track = (track === undefined) ? 'grip' : track;

		this.injectStyle();

		this.el = document.createElement('div');
		this.el.className = 'debugPane';

		this.el.innerHTML = 'test!';

		document.body.appendChild(this.el);

		this.backlog = [];

		this.tick();

	}

	injectStyle() {
		this.styleBlock = document.createElement('style');
		var style = ['.debugPane {',
			'display: block;',
			'position: absolute;',
			'top: 0;',
			'left: 0;',
			'height: 25vh;',
			'width: 32em;',
			'font-size: 10px;',
			'color: white;',
			'background-color: rgba(0,0,0,0.8);',
			'font-family: monospace;',
			'z-index: 10000;',
			'}'
		];

		this.styleBlock.innerHTML = style.join('\n');

		document.head.appendChild(this.styleBlock);
	}

	clear() {
		this.backlog = [];
	}

	log(str) {
		this.backlog.push(str);
	}

	draw() {
		this.el.innerHTML = this.backlog.join('<br>');
	}

	tick() {
		this.clear();

		this.log('debugging...');
		this.log('time: ' + viewer.clock.currentTime);

		var isTweening = (window[this.track].getActiveShot() === undefined) ? 'no' : 'yes';

		this.log('tweening: ' + isTweening);

		var pos = viewer.camera.position;
		this.log('position.x: ' + pos.x);
		this.log('position.y: ' + pos.y);
		this.log('position.z: ' + pos.z);

		var dir = viewer.camera.direction;
		this.log('direction.x: ' + dir.x);
		this.log('direction.y: ' + dir.y);
		this.log('direction.z: ' + dir.z);

		var up = viewer.camera.up;
		this.log('up.x: ' + up.x);
		this.log('up.y: ' + up.y);
		this.log('up.z: ' + up.z);

		// HPR
		this.log('heading: ' + viewer.camera.heading);
		this.log('pitch: ' + viewer.camera.pitch);
		this.log('roll: ' + viewer.camera.roll);



		this.draw();
		requestAnimationFrame(this.tick.bind(this));
	}
}
