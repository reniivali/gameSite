const d = document

let gravity = 0.5;
let fps = 60;
let physFPS = 60;
let frame = 0;

const physMultiplier = physFPS / fps;

let obstacles = [ {
		x: 300,
		y: 410,
		w: 100,
		h: 20,
		obj: undefined,
		type: 'platform',
	},
	{
		x: 100,
		y: 300,
		w: 100,
		h: 20,
		obj: undefined,
		type: 'platform',
	},
	{
		x: 100,
		y: 200,
		w: 20,
		h: 100,
		obj: undefined,
		type: 'wall',
	}
]

let container = {
	width: 500,
	height: 500,
}

let player = {
	x: 0,
	y: 0,
	width: 20,
	height: 40,
	obj: undefined,
	yVel: 0,
	xVel: 0,
	xCap: 10,
	friction: 0.9,
	jumpHeight: 15,
	movSpeed: 2.5,
	moving: {
		l: false,
		r: false,
	},
	grounded: false
}

d.addEventListener('DOMContentLoaded', () => {
	player.obj = d.getElementById('player');
	player.obj.style.width = (player.width - 6) + 'px';
	player.obj.style.height = (player.height - 6) + 'px';
	player.obj.style.left = player.x + 'px';
	player.obj.style.top = player.y + 'px';

	//instance obstacles
	for (let i = 0; i < obstacles.length; i++) {
		obstacles[i].obj = d.createElement('div');
		obstacles[i].obj.classList.add('gameOBJ');
		obstacles[i].obj.classList.add('obstacle');
		obstacles[i].obj.style.width = (obstacles[i].w - 6) + 'px';
		obstacles[i].obj.style.height = (obstacles[i].h - 6) + 'px';
		obstacles[i].obj.style.left = obstacles[i].x + 'px';
		obstacles[i].obj.style.top = obstacles[i].y + 'px';
		d.getElementById('container').appendChild(obstacles[i].obj);
	}

	// render a grid
	/*for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 5; j++) {
			let obj = d.createElement('div');
			obj.classList.add('grid');
			obj.style.left = (j * 100) + 'px';
			obj.style.top = (i * 100) + 'px';
			d.getElementById('container').appendChild(obj);
		}
	}*/

	function mainLoop() {
		// moving code
		if (player.moving.l) {
			player.xVel -= player.movSpeed;
			if (player.xVel < -player.xCap) player.xVel = -player.xCap;
		}

		if (player.moving.r) {
			player.xVel += player.movSpeed;
			if (player.xVel > player.xCap) player.xVel = player.xCap;
		}

		if (!player.grounded) player.yVel += gravity * physMultiplier;
		if (!player.moving.l || !player.moving.r) player.xVel *= player.friction;
		if (player.xVel < 0.1 && player.xVel > -0.1) player.xVel = 0;
		player.y += player.yVel * physMultiplier;
		player.x += player.xVel * physMultiplier;

		//collisions with Other Stuff
		d.getElementById('logs').innerHTML = `
		Grounded? ${player.grounded}<br>
		Player X: ${player.x} | Player Y: ${player.y}<br>
		Player W: ${player.width} | Player H: ${player.height}<br>`

		let onPlatform = false;
		for (let i = 0; i < obstacles.length; i++) {
			if (Math.ceil(player.x + player.width) >= obstacles[i].x && Math.ceil(player.x) <= obstacles[i].x + obstacles[i].w) {
			if (Math.ceil(player.y + player.height) >= obstacles[i].y && Math.ceil(player.y) <= obstacles[i].y + obstacles[i].h) {
			if (obstacles[i].type === 'platform') {
				if (Math.ceil(player.y) >= obstacles[i].y) {
					//player is colliding with the bottom of the obstacle
					player.y = obstacles[i].y + obstacles[i].h;
					player.yVel = 0;
				} else if (Math.ceil(player.y) <= obstacles[i].y) {
					//player is colliding with the top of the obstacle
					player.y = obstacles[i].y - player.height;
					player.yVel = 0;
					player.grounded = true;
					onPlatform = true;
				}
			} else {
				if (Math.ceil(player.x) >= obstacles[i].x) {
					//player is colliding with the right of the obstacle
					player.x = obstacles[i].x + obstacles[i].w;
					player.xVel = 0;
				} else if (Math.ceil(player.x) <= obstacles[i].x) {
					//player is colliding with the left of the obstacle
					player.x = obstacles[i].x - player.width;
					player.xVel = 0;
				}
			} } } else if (!onPlatform) player.grounded = false;
		}

		// collisions with bounds
		if (player.y + player.height >= container.height) {
			player.y = container.height - player.height;
			player.yVel = 0;
			player.grounded = true;
		}
		if (player.x + player.width >= container.width) {
			player.x = container.width - player.width;
			player.xVel = 0;
		}
		if (player.x <= 0) {
			player.x = 0;
			player.xVel = 0;
		}
		if (player.y <= 0) {
			player.y = 0;
			player.yVel = 0;
		}

		//update object
		player.obj.style.left = player.x + 'px';
		player.obj.style.top = player.y + 'px';

		frame++;
		if (frame >= fps) { frame = 0; }
		setTimeout(mainLoop, 1000 / fps);
	}
	setTimeout(mainLoop, 1000 / fps);

	d.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowLeft') player.moving.l = true;
		if (e.key === 'ArrowRight') player.moving.r = true;
		if (e.key === 'ArrowUp' && player.grounded) if (player.grounded || onPlatform) {
			player.yVel -= player.jumpHeight;
			player.grounded = false;
		}
	});

	d.addEventListener('keyup', (e) => {
		if (e.key === 'ArrowLeft') player.moving.l = false;
		if (e.key === 'ArrowRight') player.moving.r = false;
	});
});