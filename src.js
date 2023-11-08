const d = document

let gravity = 0.5;
let fps = 60;
const physFPS = 60;
let frame = 0;
let stopped = false;

let physMultiplier = physFPS / fps;

world = [[
[/*0-0*/],
[/*0-1*/{x:300,y:490,w:203,h:15,type:"platform"}],
[/*0-2*/{x:-5,y:490,w:205,h:15,type:"platform"}],
[/*0-3*/],
[/*0-4*/]],[
[/*1-0*/{x:300,y:490,w:220,h:20,type:'platform',hide:'R'}],
[/*1-1*/{x:305,y:490,w:200,h:15,type:"platform",hide:"R"},{x:0,y:490,w:200,h:20,type:"platform",hide:"L"},{x:100,y:350,w:403,h:20,type:"platform",hide:"R"},{x:485,y:370,w:20,h:120,type:"wall"},{x:10,y:200,w:250,h:20,type:"platform"},{x:360,y:200,w:80,h:20,type:"platform"},{x:125,y:80,w:100,h:20,type:"platform"},{x:300,y:-5,w:203,h:15,type:"platform"},{x:490,y:7,w:20,h:153,type:"wall",hide:"T"}],
[/*1-2*/{x:60,y:420,w:20,h:20,type:'coin'},{x:-10,y:7,w:20,h:153,type:"wall",hide:"T"},{x:-5,y:-5,w:205,h:15,type:"platform"},{x:-5,y:490,w:205,h:20,type:"platform"},{x:-5,y:350,w:150,h:20,type:"platform"},{x:-5,y:370,w:20,h:120,type:"wall"}],
[/*1-3*/],
[/*1-4*/]],[
[/*2-0*/{x:300,y:-5,w:220,h:15,type:'platform',hide:'R'},{x:100,y:300,w:100,h:20,type:'platform',mov:{y:{min:200,max:450,speed:2,l:true}}},{x:-5,y:490,w:510,h:15,type:"platform"}],
[/*2-1*/{x:250,y:100,w:20,h:20,type:'coin'},{x:305,y:-5,w:200,h:15,type:"platform",hide:"R"},{x:0,y:-5,w:200,h:15,type:'platform',hide:'L'},{x:300,y:410,w:100,h:20,type:'platform',mov:{x:{min:100,max:390,speed:2,l:true}}},{x:97,y:300,w:103,h:20,type:'platform',hide:"L"},{x:97,y:200,w:103,h:20,type:'platform',hide:"L"},{x:80,y:200,w:20,h:120,type:'wall'},{x:-3,y:490,w:153,h:15,type:"platform"}],
[/*2-2*/{x:-5,y:-10,w:205,h:20,type:"platform"},{x:300,y:200,w:100,h:20,type:'platform'},{x:0,y:490,w:500,h:15,type:"platform"}],
[/*2-3*/{x:0,y:490,w:500,h:15,type:"platform"}],
[/*2-4*/]],[
[/*3-0*/{x:20,y:-5,w:460,h:25,type:"platform"},{x:480,y:0,w:20,h:20,type:"platform"},{x:480,y:20,w:25,h:460,type:"wall"},{x:480,y:480,w:20,h:20,type:"platform"},{x:20,y:480,w:460,h:25,type:"platform"},{x:0,y:0,w:20,h:20,type:"platform"},{x:0,y:480,w:20,h:20,type:"platform"},{x:-5,y:20,w:25,h:460,type:"wall"}],
[/*3-1*/{x:300,y:490,w:210,h:15,type:"platform"},{x:7,y:-5,w:146,h:15,type:"platform",hide:"L"},{x:-5,y:-5,w:15,h:510,type:"wall"},{x:97,y:300,w:103,h:20,type:'platform'},{x:300,y:150,w:100,h:20,type:'platform'},{x:300,y:410,w:100,h:20,type:'platform'}],
[/*3-2*/{x:0,y:-5,w:500,h:15,type:"platform"},{x:0,y:490,w:510,h:15,type:"platform"},{x:25,y:7,w:20,h:336,type:"wall",hide:"T"},{x:42,y:320,w:283,h:20,type:"platform",hide:"L"},{x:180,y:200,w:326,h:20,type:"platform",hide:"R"},{x:490,y:220,w:15,h:276,type:"wall",hide:"B"}],
[/*3-3*/{x:0,y:490,w:500,h:15,type:"platform"},{x:499,y:240,w:10,h:250,type:"wall"},{x:0,y:-5,w:500,h:15,type:"platform"},{x:-5,y:200,w:15,h:290,type:"wall"},{x:30,y:10,w:20,h:430,type:"wall"},{x:50,y:420,w:428,h:20,type:"platform"},{x:458,y:310,w:20,h:110,type:"wall"},{x:71,y:290,w:407,h:20,type:"platform"},{x:71,y:220,w:429,h:20,type:"platform"}],
[/*3-4*/{x:0,y:490,w:500,h:15,type:"platform"},{x:0,y:240,w:20,h:250,type:"wall"}]]]

//3-0 coin room
for (let i = 0; i < 15; i++) {
	for (let j=0; j < 15; j++) {
		world[3][0].push({x: (j * 25) + 62.5, y: (i * 25) + 62.5, w: 20, h: 20, type: 'coin'})
	}
}

//2-3 stairs
for (let i = 1; i < 21; i++) {
	world[2][3].push({x: 20 + (i * 20), y: 490 - (i * 20), w: 480 - (i * 20), h: 26, type: 'platform', hide: "B"})
}

//1-3 stairs
for (let i = 1; i < 15; i++) {
	world[1][3].push({x: 300 - (i * 20), y: 490 - (i * 20), w: 100, h: 20, type: 'platform'})
}

let frameTimes = [];

let container = {
	width: 500,
	height: 500,
}

let player = {
	wx: 1,
	wy: 2,
	x: 5,
	y: 400,
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
	grounded: true
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

	const space = ((window.innerWidth - 10) - 502) / 2;
	const vSpace = ((window.innerHeight - 10) - 502) / 2;
	const vMov = (502 - vSpace) + 73;
	const mov = 502 - space;
	d.getElementById('gameFlex').style.left = -mov + 'px'
	d.getElementById('gameFlex').style.top = -vMov + 'px'

	function createObstacle(wy, wx, i, container) {
		world[wy][wx][i].obj = d.createElement('div');
		world[wy][wx][i].obj.classList.add('gameOBJ');
		world[wy][wx][i].obj.classList.add('obstacle');
		world[wy][wx][i].obj.style.width = (world[wy][wx][i].w - 6) + 'px';
		world[wy][wx][i].obj.style.height = (world[wy][wx][i].h - 6) + 'px';
		world[wy][wx][i].obj.style.left = world[wy][wx][i].x + 'px';
		world[wy][wx][i].obj.style.top = world[wy][wx][i].y + 'px';
		d.getElementById(container).appendChild(world[wy][wx][i].obj);
		if (world[wy][wx][i].hide) {
			world[wy][wx][i].obj.style.zIndex = '100';
			if (world[wy][wx][i].hide === "L") {
				world[wy][wx][i].obj.style.borderLeft = 'none';
			} else if (world[wy][wx][i].hide === "R") {
				world[wy][wx][i].obj.style.borderRight = 'none';
			} else if (world[wy][wx][i].hide === "T") {
				world[wy][wx][i].obj.style.borderTop = 'none';
			} else if (world[wy][wx][i].hide === "B") {
				world[wy][wx][i].obj.style.borderBottom = 'none';
			}
		}
		//change color if coin
		if (world[wy][wx][i].type === 'coin') {
			world[wy][wx][i].obj.style.backgroundColor = 'var(--yellow)';
		}
	}

	function setInactive(obj) {
		d.getElementById(obj).style.borderColor = 'rgba(0,0,0,0)';
		d.getElementById(obj).style.backgroundColor = 'rgba(0,0,0,0)';
		d.getElementById(obj).style.boxShadow = 'none';
	}

	function setActive(obj) {
		d.getElementById(obj).style.borderColor = 'var(--sf0)';
		d.getElementById(obj).style.backgroundColor = 'var(--bg-darkest)';
		d.getElementById(obj).style.boxShadow = '';
	}

	function instanceObstacles() {
		for (let i = 0; i < world[player.wy][player.wx].length; i++) {
			createObstacle(player.wy, player.wx, i, 'container');
		}
		//literally all the code for the submaps
		for (let i = 0; i < 8; i++) {
			switch (i) {
				case 0: //top left
					if (player.wy === 0 || player.wx === 0) {
						setInactive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = '';
					} else {
						setActive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = `${player.wy - 1}-${player.wx - 1}`
						for (let j = 0; j < world[player.wy - 1][player.wx - 1].length; j++) {
							createObstacle(player.wy - 1, player.wx - 1, j, `subContainer${i}`);
						}
					}
					break;
				case 1: //top-middle
					if (player.wy === 0) {
						setInactive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = '';
					} else {
						setActive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = `${player.wy - 1}-${player.wx}`
						for (let j = 0; j < world[player.wy - 1][player.wx].length; j++) {
							createObstacle(player.wy - 1, player.wx, j, `subContainer${i}`);
						}
					}
					break;
				case 2: //top-right
					if (player.wy === 0 || player.wx === world[player.wy].length - 1) {
						setInactive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = '';
					} else {
						setActive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = `${player.wy - 1}-${player.wx + 1}`
						for (let j = 0; j < world[player.wy - 1][player.wx + 1].length; j++) {
							createObstacle(player.wy - 1, player.wx + 1, j, `subContainer${i}`);
						}
					}
					break;
				case 3: //middle-left
					if (player.wx === 0) {
						setInactive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = '';
					}
					else {
						setActive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = `${player.wy}-${player.wx - 1}`
						for (let j = 0; j < world[player.wy][player.wx - 1].length; j++) {
							createObstacle(player.wy, player.wx - 1, j, `subContainer${i}`);
						}
					}
					break;
				case 4: //middle-right
					if (player.wx === world[player.wy].length - 1) {
						setInactive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = '';
					}
					else {
						setActive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = `${player.wy}-${player.wx + 1}`
						for (let j = 0; j < world[player.wy][player.wx + 1].length; j++) {
							createObstacle(player.wy, player.wx + 1, j, `subContainer${i}`);
						}
					}
					break;
				case 5: //bottom-left
					if (player.wy === world.length - 1 || player.wx === 0) {
						setInactive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = '';
					} else {
						setActive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = `${player.wy + 1}-${player.wx - 1}`
						for (let j = 0; j < world[player.wy + 1][player.wx - 1].length; j++) {
							createObstacle(player.wy + 1, player.wx - 1, j, `subContainer${i}`);
						}
					}
					break;
				case 6: //bottom-middle
					if (player.wy === world.length - 1) {
						setInactive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = '';
					}
					else {
						setActive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = `${player.wy + 1}-${player.wx}`
						for (let j = 0; j < world[player.wy + 1][player.wx].length; j++) {
							createObstacle(player.wy + 1, player.wx, j, `subContainer${i}`);
						}
					}
					break;
				case 7: //bottom-right
					if (player.wy === world.length - 1 || player.wx === world[player.wy].length - 1) {
						setInactive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = '';
					} else {
						setActive(`subContainer${i}`)
						d.getElementById(`subMapCoord${i}`).innerHTML = `${player.wy + 1}-${player.wx + 1}`
						for (let j = 0; j < world[player.wy + 1][player.wx + 1].length; j++) {
							createObstacle(player.wy + 1, player.wx + 1, j, `subContainer${i}`);
						}
					}
					break;
			}
		}
	}
	instanceObstacles();

	function destroyObstacles() {
		for (let i = 0; i < world[player.wy][player.wx].length; i++) {
			world[player.wy][player.wx][i].obj.remove();
		}
		for (let i = 0; i < 8; i++) {
			let els = d.getElementById(`subContainer${i}`).children;
			for (let j = els.length - 1; j > 0; j--) {
				els[j].remove();
			}
		}
	}

	let gridDivisions = 5;
	const renderGrid = false;
	// render a grid
	if (renderGrid)
	for (let i = 0; i < gridDivisions; i++) {
		for (let j = 0; j < gridDivisions; j++) {
			let obj = d.createElement('div');
			obj.classList.add('grid');
			obj.style.left = (j * (500 / gridDivisions)) + 'px';
			obj.style.top = (i * (500 / gridDivisions)) + 'px';
			d.getElementById('container').appendChild(obj);
		}
	}

	let lastDate = 0;
	let physFactor;
	function mainLoop() {
		const frameTime = Date.now() - lastDate;
		const expectedFrameTime = 1000 / fps;
		const actualFPS = 1000 / frameTime;
		// factor based on expected frame time, so physics don't suffer from low fps
		physFactor = frameTime / expectedFrameTime;
		frameTimes.push({frame: frame, frameTime: frameTime, expectedFrameTime: expectedFrameTime, actualFPS: actualFPS, targetFPS: fps, physFactor: physFactor});

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
		//move objects
		for (let i = 0; i < world[player.wy][player.wx].length; i++) {
			if (world[player.wy][player.wx][i].mov) {
				let obj = world[player.wy][player.wx][i];
				if (world[player.wy][player.wx][i].mov.x) {
					let change = obj.mov.x.speed * physMultiplier * physFactor;
					if (obj.mov.x.l) {
						obj.x += change;
						if (obj.x >= obj.mov.x.max) {
							obj.x = obj.mov.x.max;
							obj.mov.x.l = false;
						}
					} else {
						obj.x -= change;
						if (obj.x <= obj.mov.x.min) {
							obj.x = obj.mov.x.min;
							obj.mov.x.l = true;
						}
					}
				}

				if (world[player.wy][player.wx][i].mov.y) {
					let change = obj.mov.y.speed * physMultiplier * physFactor;
					if (obj.mov.y.l) {
						obj.y += change;
						if (obj.y >= obj.mov.y.max) {
							obj.y = obj.mov.y.max;
							obj.mov.y.l = false;
						}
					} else {
						obj.y -= change;
						if (obj.y <= obj.mov.y.min) {
							obj.y = obj.mov.y.min;
							obj.mov.y.l = true;
						}
					}
				}

				obj.obj.style.left = obj.x + 'px';
				obj.obj.style.top = obj.y + 'px';
			}
			
			// detect collision with objects
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
					if (world[player.wy][player.wx][i].mov) {
						if (world[player.wy][player.wx][i].mov.x) {
							let obj = world[player.wy][player.wx][i];
							if (obj.mov.x.l) {
								player.x += obj.mov.x.speed * physMultiplier * physFactor;
							} else {
								player.x -= obj.mov.x.speed * physMultiplier * physFactor;
							}
						} 
						if (world[player.wy][player.wx][i].mov.y) {
							let obj = world[player.wy][player.wx][i];
							if (obj.mov.y.l) {
								player.y += obj.mov.y.speed * physMultiplier * physFactor;
							} else {
								player.y -= obj.mov.y.speed * physMultiplier * physFactor;
							}
						}
					}
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
				player.grounded = false;
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
				player.grounded = false;
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
				player.grounded = false;
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
				player.grounded = false;
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