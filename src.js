const d = document

let gravity = 0.5;
let fps = 60;
const physFPS = 60;
let frame = 0;
let stopped = false;

let physMultiplier = physFPS / fps;

world = [
	[[/*0-0*/],[/*0-1*/{x:305,y:490,w:200,h:15,type:"platform"}],[/*0-2*/{x:-5,y:490,w:205,h:15,type:"platform"}],[/*0-3*/]],
	[[/*1-0*/{x:300,y:490,w:220,h:20,type:'platform',hide:'R'}],[/*1-1*/{x:305,y:490,w:200,h:15,type:"platform",hide:"R"},{x:0,y:490,w:200,h:20,type:"platform",hide:"L"},{x:100,y:350,w:403,h:20,type:"platform",hide:"R"},{x:485,y:370,w:20,h:120,type:"wall"},{x:10,y:200,w:250,h:20,type:"platform"},{x:360,y:200,w:80,h:20,type:"platform"},{x:125,y:80,w:100,h:20,type:"platform"},{x:300,y:-5,w:203,h:15,type:"platform"},{x:490,y:7,w:20,h:153,type:"wall",hide:"T"}],[/*1-2*/{x:0,y:490,w:200,h:20,type:"platform"},{x:-5,y:350,w:150,h:20,type:"platform"},{x:-5,y:370,w:20,h:120,type:"wall"}],[/*1-3*/]],
	[[/*2-0*/{x:300,y:-5,w:220,h:15,type:'platform',hide:'R'},{x:97,y:300,w:103,h:20,type:'platform'},{x:0,y:490,w:500,h:15,type:"platform"}],[/*2-1*/{x:250,y:100,w:20,h:20,type:'coin'},{x:305,y:-5,w:200,h:15,type:"platform",hide:"R"},{x:0,y:-5,w:200,h:15,type:'platform',hide:'L'},{x:300,y:410,w:100,h:20,type:'platform'},{x:97,y:300,w:103,h:20,type:'platform',hide:"L"},{x:97,y:200,w:103,h:20,type:'platform',hide:"L"},{x:80,y:200,w:20,h:120,type:'wall'},{x:-3,y:490,w:153,h:15,type:"platform"}],[/*2-2*/{x:300,y:410,w:100,h:20,type:'platform'},{x:0,y:490,w:500,h:15,type:"platform"}],[/*2-3*/{x:0,y:490,w:500,h:15,type:"platform"}]],
	[[/*3-0*/],[/*3-1*/{x:97,y:300,w:103,h:20,type:'platform'},{x:300,y:150,w:100,h:20,type:'platform'},{x:300,y:410,w:100,h:20,type:'platform'}],[/*3-2*/],[/*3-3*/]]
]

let frameTimes = [];

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
	airFactor: 0.5,
	coins: 0,
	moving: {
		l: false,
		r: false,
	},
	grounded: false
}

function logFrameTimes() {
	let log = 'frame,frameTime,expectedFrameTime,actualFPS,targetFPS,physFactor\n';
	for (let i = 0; i < frameTimes.length; i++) {
		log += `${frameTimes[i].frame},${frameTimes[i].frameTime},${frameTimes[i].expectedFrameTime},${frameTimes[i].actualFPS},${frameTimes[i].targetFPS},${frameTimes[i].physFactor}\n`;
	}
	console.log(log)
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
			//change color if coin
			if (world[player.wy][player.wx][i].type === 'coin') {
				world[player.wy][player.wx][i].obj.style.backgroundColor = 'var(--yellow)';
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

	let lastDate = 0;
	let physFactor;
	function mainLoop() {
		const frameTime = Date.now() - lastDate;
		const expectedFrameTime = 1000 / fps;
		const actualFPS = 1000 / frameTime;
		physFactor = frameTime / expectedFrameTime;
		frameTimes.push({frame: frame, frameTime: frameTime, expectedFrameTime: expectedFrameTime, actualFPS: actualFPS, targetFPS: fps, physFactor: physFactor});
		// factor based on expected frame time, so physics don't suffer from low fps

		// moving code
		if (player.moving.l) {
			if (player.grounded) player.xVel -= player.movSpeed;
			else player.xVel -= player.movSpeed * player.airFactor;
			if (player.xVel < -player.xCap) player.xVel = -player.xCap;
		}

		if (player.moving.r) {
			if (player.grounded) player.xVel += player.movSpeed;
			else player.xVel += player.movSpeed * player.airFactor;
			if (player.xVel > player.xCap) player.xVel = player.xCap;
		}

		if (!player.grounded) player.yVel += (gravity * physMultiplier) * physFactor;
		if (!player.moving.l || !player.moving.r) player.xVel *= player.friction;
		if (player.xVel < 0.1 && player.xVel > -0.1) player.xVel = 0;
		player.y += (player.yVel * physMultiplier) * physFactor;
		player.x += (player.xVel * physMultiplier) * physFactor;

		//collisions with Other Stuff
		d.getElementById('logs').innerHTML = `
		Actual FPS: ${actualFPS.toLocaleString('en-us', {maximumFractionDigits: 2})}<br>
		Physics Factor: ${physFactor.toLocaleString('en-us', {maximumFractionDigits: 2})}<br>
		Grounded? ${player.grounded}<br>
		Player X : ${player.x.toLocaleString('en-us', {maximumFractionDigits: 2})} <span class="rightText">${player.y.toLocaleString('en-us', {maximumFractionDigits: 2})} : Player Y</span>
		Player xVel : ${player.xVel.toLocaleString('en-us', {maximumFractionDigits: 2})} <span class="rightText">${player.yVel.toLocaleString('en-us', {maximumFractionDigits: 2})} : Player yVel</span>
		Frame Time : ${frameTime.toLocaleString('en-us', {maximumFractionDigits: 2})}ms <span class="rightText">${expectedFrameTime.toLocaleString('en-us', {maximumFractionDigits: 2})}ms : Expected Frame Time</span>`

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
			} else if (world[player.wy][player.wx][i].type === 'wall') {
				if (Math.ceil(player.x) >= world[player.wy][player.wx][i].x) {
					//player is colliding with the right of the obstacle
					player.x = world[player.wy][player.wx][i].x + world[player.wy][player.wx][i].w;
					player.xVel = 0;
				} else if (Math.ceil(player.x) <= world[player.wy][player.wx][i].x) {
					//player is colliding with the left of the obstacle
					player.x = world[player.wy][player.wx][i].x - player.width;
					player.xVel = 0;
				}
			} else if (world[player.wy][player.wx][i].type === 'coin') {
				world[player.wy][player.wx][i].obj.remove();
				world[player.wy][player.wx].splice(i, 1);
				player.coins++;
			} } } else if (!onPlatform) player.grounded = false;
		}

		// collisions with bounds
		if (player.y + player.height >= container.height) {
			if (player.wy === world.length - 1) {
				player.y = container.height - player.height;
				player.yVel = 0;
				player.grounded = true;
			} else {
				destroyObstacles();
				player.wy++;
				player.y = 1;
				instanceObstacles();
			}
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
			if (player.wy === 0) {
				player.y = 0;
				player.yVel = 0;
			} else {
				destroyObstacles();
				player.wy--;
				player.y = container.height - player.height - 1;
				instanceObstacles();
			}
		}

		//update object
		player.obj.style.left = player.x + 'px';
		player.obj.style.top = player.y + 'px';

		//update map coords
		d.getElementById('mapCoord').innerHTML = `Coins: ${player.coins}<br>${player.wy}-${player.wx}`

		frame++;
		if (frame >= fps) { frame = 0; }
		lastDate = Date.now();
		if (!stopped) setTimeout(mainLoop, 1000 / fps);
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

	//fps slider
	d.getElementById('fpsSlider').addEventListener('input', (e) => {
		fps = e.target.value;
		physMultiplier = physFPS / fps
		d.getElementById('fps').innerHTML = fps;
	})
});