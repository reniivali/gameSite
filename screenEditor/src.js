const d = document

let container = {
	width: 500,
	height: 500,
}

let objects = [];

d.addEventListener('DOMContentLoaded', () => {
	function createObject() {
		let obj = {
			x: 0,
			y: 0,
			w: 10,
			h: 10,
			obj: undefined,
			type: 'platform',
			hide: 'undefined',
		}
		objects.push(obj);
		let id = objects.length - 1;
		let changers = d.createElement('div');
		changers.classList.add('changers');
		changers.innerHTML = `<h3 class="noMargin">X: <span id="${id}xVal">0</span></h3><input type="range" max="505" min="-5" value="0" id="${id}x" /><br>
		<h3 class="noMargin">Y: <span id="${id}yVal">0</span></h3><input type="range" max="505" min="-5" value="0" id="${id}y" /><br>
		<h3 class="noMargin">W: <span id="${id}wVal">10</span></h3><input type="range" max="500" min="5" value="10" id="${id}w" /><br>
		<h3 class="noMargin">H: <span id="${id}hVal">10</span></h3><input type="range" max="500" min="5" value="10" id="${id}h" /><br>
		<br>
		<select id="${id}type">
			<option value="platform">Platform</option>
			<option value="wall">Wall</option>
		</select>
		<br>
		<select id="${id}hide">
			<option value="undefined">Show All</option>
			<option value="L">Hide Left</option>
			<option value="R">Hide Right</option>
			<option value="T">Hide Top</option>
			<option value="B">Hide Bottom</option>
		</select>`
		d.getElementById('optContainer').appendChild(changers);
		objects[id].obj = d.createElement('div');
		objects[id].obj.classList.add('gameOBJ');
		objects[id].obj.classList.add('obstacle');
		objects[id].obj.style.width = (objects[id].w - 6) + 'px';
		objects[id].obj.style.height = (objects[id].h - 6) + 'px';
		objects[id].obj.style.left = objects[id].x + 'px';
		objects[id].obj.style.top = objects[id].y + 'px';
		d.getElementById('container').appendChild(objects[id].obj);
		d.getElementById(`${id}x`).addEventListener('input', () => {
			objects[id].x = d.getElementById(`${id}x`).value;
			objects[id].obj.style.left = objects[id].x + 'px';
			d.getElementById(`${id}xVal`).innerHTML = objects[id].x;
		});
		d.getElementById(`${id}y`).addEventListener('input', () => {
			objects[id].y = d.getElementById(`${id}y`).value;
			objects[id].obj.style.top = objects[id].y + 'px';
			d.getElementById(`${id}yVal`).innerHTML = objects[id].y;
		});
		d.getElementById(`${id}w`).addEventListener('input', () => {
			objects[id].w = d.getElementById(`${id}w`).value;
			objects[id].obj.style.width = (objects[id].w - 6) + 'px';
			d.getElementById(`${id}wVal`).innerHTML = objects[id].w;
		});
		d.getElementById(`${id}h`).addEventListener('input', () => {
			objects[id].height = d.getElementById(`${id}h`).value;
			objects[id].obj.style.height = (objects[id].height - 6) + 'px';
			d.getElementById(`${id}hVal`).innerHTML = objects[id].height;
		});
		d.getElementById(`${id}type`).addEventListener('change', () => {
			objects[id].type = d.getElementById(`${id}type`).value;
		});
		d.getElementById(`${id}hide`).addEventListener('change', () => {
			objects[id].hide = d.getElementById(`${id}hide`).value;
			if (objects[id].hide === "L") {
				objects[id].obj.style.borderLeft = 'none';
				objects[id].obj.style.borderRight = '';
				objects[id].obj.style.borderTop = '';
				objects[id].obj.style.borderBottom = '';
			}
			if (objects[id].hide === "R") {
				objects[id].obj.style.borderLeft = '';
				objects[id].obj.style.borderRight = 'none';
				objects[id].obj.style.borderTop = '';
				objects[id].obj.style.borderBottom = '';
			}
			if (objects[id].hide === "T") {
				objects[id].obj.style.borderLeft = '';
				objects[id].obj.style.borderRight = '';
				objects[id].obj.style.borderTop = 'none';
				objects[id].obj.style.borderBottom = '';
			}
			if (objects[id].hide === "B") {
				objects[id].obj.style.borderLeft = '';
				objects[id].obj.style.borderRight = '';
				objects[id].obj.style.borderTop = '';
				objects[id].obj.style.borderBottom = 'none';
			}
			if (objects[id].hide === "undefined") {
				objects[id].obj.style.borderLeft = '';
				objects[id].obj.style.borderRight = '';
				objects[id].obj.style.borderTop = '';
				objects[id].obj.style.borderBottom = '';
			}
		});
	}

	function destroyObject() {
		objects.pop();
		d.getElementById('optContainer').lastChild.remove();
		d.getElementById('container').lastChild.remove();
	}

	d.getElementById('addObj').addEventListener('click', () => {
		createObject();
	});
	d.getElementById('removeObj').addEventListener('click', () => {
		destroyObject();
	});
	d.getElementById('outputObj').addEventListener('click', () => {
		let out = d.getElementById('output');
		out.innerHTML = '['
		for (let i = 0; i < objects.length; i++) {
			if (objects[i].hide === "undefined") out.innerHTML += `{x:${objects[i].x},y:${objects[i].y},w:${objects[i].w},h:${objects[i].h},type:"${objects[i].type}"},`
			else out.innerHTML += `{x:${objects[i].x},y:${objects[i].y},w:${objects[i].w},h:${objects[i].h},type:"${objects[i].type}",hide:"${objects[i].hide}"},`
		}
		out.innerHTML += ']'
	});

	d.getElementById('importObj').addEventListener('click', () => {
		for (let i = 0; i < objects.length; i++) {
			destroyObject();
		}
		objects = eval(d.getElementById('input').value);
		for (let i = 0; i < objects.length; i++) {
			let id = i;
			let changers = d.createElement('div');
			changers.classList.add('changers');
			changers.innerHTML = `<h3 class="noMargin">X: <span id="${id}xVal">${objects[i].x}</span></h3><input type="range" max="505" min="-5" value="${objects[i].x}" id="${id}x" /><br>
			<h3 class="noMargin">Y: <span id="${id}yVal">${objects[i].y}</span></h3><input type="range" max="505" min="-5" value="${objects[i].y}" id="${id}y" /><br>
			<h3 class="noMargin">W: <span id="${id}wVal">${objects[i].w}</span></h3><input type="range" max="500" min="5" value="${objects[i].w}" id="${id}w" /><br>
			<h3 class="noMargin">H: <span id="${id}hVal">${objects[i].h}</span></h3><input type="range" max="500" min="5" value="${objects[i].h}" id="${id}h" /><br>
			<br>
			<select id="${id}type" selected="${objects[i].type}">
				<option value="platform">Platform</option>
				<option value="wall">Wall</option>
			</select>
			<br>
			<select id="${id}hide">
				<option value="undefined">Show All</option>
				<option value="L">Hide Left</option>
				<option value="R">Hide Right</option>
				<option value="T">Hide Top</option>
				<option value="B">Hide Bottom</option>
			</select>`
			d.getElementById('optContainer').appendChild(changers);
			objects[id].obj = d.createElement('div');
			objects[id].obj.classList.add('gameOBJ');
			objects[id].obj.classList.add('obstacle');
			objects[id].obj.style.width = (objects[id].w - 6) + 'px';
			objects[id].obj.style.height = (objects[id].h - 6) + 'px';
			objects[id].obj.style.left = objects[id].x + 'px';
			objects[id].obj.style.top = objects[id].y + 'px';
			d.getElementById('container').appendChild(objects[id].obj);
			d.getElementById(`${id}x`).addEventListener('input', () => {
				objects[id].x = d.getElementById(`${id}x`).value;
				objects[id].obj.style.left = objects[id].x + 'px';
				d.getElementById(`${id}xVal`).innerHTML = objects[id].x;
			});
			d.getElementById(`${id}y`).addEventListener('input', () => {
				objects[id].y = d.getElementById(`${id}y`).value;
				objects[id].obj.style.top = objects[id].y + 'px';
				d.getElementById(`${id}yVal`).innerHTML = objects[id].y;
			});
			d.getElementById(`${id}w`).addEventListener('input', () => {
				objects[id].w = d.getElementById(`${id}w`).value;
				objects[id].obj.style.width = (objects[id].w - 6) + 'px';
				d.getElementById(`${id}wVal`).innerHTML = objects[id].w;
			});
			d.getElementById(`${id}h`).addEventListener('input', () => {
				objects[id].height = d.getElementById(`${id}h`).value;
				objects[id].obj.style.height = (objects[id].height - 6) + 'px';
				d.getElementById(`${id}hVal`).innerHTML = objects[id].height;
			});
			d.getElementById(`${id}type`).addEventListener('change', () => {
				objects[id].type = d.getElementById(`${id}type`).value;
			});
			d.getElementById(`${id}hide`).addEventListener('change', () => {
				objects[id].hide = d.getElementById(`${id}hide`).value;
				objects[id].obj.style.zIndex = '100';
				if (objects[id].hide === "L") {
					objects[id].obj.style.borderLeft = 'none';
					objects[id].obj.style.borderRight = '';
					objects[id].obj.style.borderTop = '';
					objects[id].obj.style.borderBottom = '';
				}
				if (objects[id].hide === "R") {
					objects[id].obj.style.borderLeft = '';
					objects[id].obj.style.borderRight = 'none';
					objects[id].obj.style.borderTop = '';
					objects[id].obj.style.borderBottom = '';
				}
				if (objects[id].hide === "T") {
					objects[id].obj.style.borderLeft = '';
					objects[id].obj.style.borderRight = '';
					objects[id].obj.style.borderTop = 'none';
					objects[id].obj.style.borderBottom = '';
				}
				if (objects[id].hide === "B") {
					objects[id].obj.style.borderLeft = '';
					objects[id].obj.style.borderRight = '';
					objects[id].obj.style.borderTop = '';
					objects[id].obj.style.borderBottom = 'none';
				}
				if (objects[id].hide === "undefined") {
					objects[id].obj.style.borderLeft = '';
					objects[id].obj.style.borderRight = '';
					objects[id].obj.style.borderTop = '';
					objects[id].obj.style.borderBottom = '';
				}
			});
		}
	})
});