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
		x: 97,
		y: 300,
		w: 103,
		h: 20,
		obj: undefined,
		type: 'platform',
		hide: "L"
	},
	{
		x: 97,
		y: 200,
		w: 103,
		h: 20,
		obj: undefined,
		type: 'platform',
		hide: "L"
	},
	{
		x: 80,
		y: 200,
		w: 20,
		h: 120,
		obj: undefined,
		type: 'wall',
	}
]

world = [
	[ /* top layer*/ ],
	[ /* 2nd layer */ ],
	[
		[{x:97,y:300,w:103,h:20,obj:undefined,type:'platform'}],
		[{x:300,y:410,w:100,h:20,obj:undefined,type:'platform'},{x:97,y:300,w:103,h:20,obj:undefined,type:'platform',hide:"L"},{x:97,y:200,w:103,h:20,obj:undefined,type:'platform',hide:"L"},{x:80,y:200,w:20,h:120,obj:undefined,type:'wall'}],
		[{x:300,y:410,w:100,h:20,obj:undefined,type:'platform'}]
	],
]

let container = {
	width: 500,
	height: 500,
}

let player = {
	wx: 1,
	wy: 2,
	x: 5,
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

	function instanceObstacles() {
		for (let i = 0; i < world[player.wy][player.wx].length; i++) {
			world[player.wy][player.wx][i].obj = d.createElement('div');
			world[player.wy][player.wx][i].obj.classList.add('gameOBJ');
			world[player.wy][player.wx][i].obj.classList.add('obstacle');
			world[player.wy][player.wx][i].obj.style.width = (world[player.wy][player.wx][i].w - 6) + 'px';
			world[player.wy][player.wx][i].obj.style.height = (world[player.wy][player.wx][i].h - 6) + 'px';
			world[player.wy][player.wx][i].obj.style.left = world[player.wy][player.wx][i].x + 'px';
			world[player.wy][player.wx][i].obj.style.top = world[player.wy][player.wx][i].y + 'px';
			d.getElementById('container').appendChild(world[player.wy][player.wx][i].obj);
			if (world[player.wy][player.wx][i].hide) {
				world[player.wy][player.wx][i].obj.style.zIndex = '100';
				if (world[player.wy][player.wx][i].hide === "L") {
					world[player.wy][player.wx][i].obj.style.borderLeft = 'none';
				} else if (world[player.wy][player.wx][i].hide === "R") {
					world[player.wy][player.wx][i].obj.style.borderRight = 'none';
				} else if (world[player.wy][player.wx][i].hide === "T") {
					world[player.wy][player.wx][i].obj.style.borderTop = 'none';
				} else if (world[player.wy][player.wx][i].hide === "B") {
					world[player.wy][player.wx][i].obj.style.borderBottom = 'none';
				}
			}
		}
	}
	instanceObstacles();

	function destroyObstacles() {
		for (let i = 0; i < world[player.wy][player.wx].length; i++) {
			world[player.wy][player.wx][i].obj.remove();
		}
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
		for (let i = 0; i < world[player.wy][player.wx].length; i++) {
			if (Math.ceil(player.x + player.width) >= world[player.wy][player.wx][i].x && Math.ceil(player.x) <= world[player.wy][player.wx][i].x + world[player.wy][player.wx][i].w) {
			if (Math.ceil(player.y + player.height) >= world[player.wy][player.wx][i].y && Math.ceil(player.y) <= world[player.wy][player.wx][i].y + world[player.wy][player.wx][i].h) {
			if (world[player.wy][player.wx][i].type === 'platform') {
				if (Math.ceil(player.y) >= world[player.wy][player.wx][i].y) {
					//player is colliding with the bottom of the obstacle
					player.y = world[player.wy][player.wx][i].y + world[player.wy][player.wx][i].h;
					player.yVel = 0;
				} else if (Math.ceil(player.y) <= world[player.wy][player.wx][i].y) {
					//player is colliding with the top of the obstacle
					player.y = world[player.wy][player.wx][i].y - player.height;
					player.yVel = 0;
					player.grounded = true;
					onPlatform = true;
				}
			} else {
				if (Math.ceil(player.x) >= world[player.wy][player.wx][i].x) {
					//player is colliding with the right of the obstacle
					player.x = world[player.wy][player.wx][i].x + world[player.wy][player.wx][i].w;
					player.xVel = 0;
				} else if (Math.ceil(player.x) <= world[player.wy][player.wx][i].x) {
					//player is colliding with the left of the obstacle
					player.x = world[player.wy][player.wx][i].x - player.width;
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
			if (player.wx === world[player.wy].length - 1) {
				player.x = container.width - player.width;
				player.xVel = 0;
			} else {
				destroyObstacles();
				player.wx++;
				player.x = 1;
				instanceObstacles();
			}
		}
		if (player.x <= 0) {
			if (player.wx === 0) {
				player.x = 0;
				player.xVel = 0;
			} else {
				destroyObstacles();
				player.wx--;
				player.x = container.width - player.width;
				instanceObstacles();
			}
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