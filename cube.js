
"use strict";

//________________________________________________________________________
//---------------TEXTURES-------------------------------------------------
var im1, im2, im3;
const _tx = new Uint8Array([0, 0, 255, 255]);

function loadtexture(src) {
	const tx = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tx);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
		gl.RGBA, gl.UNSIGNED_BYTE, _tx);

	const im = new Image();
	im.crossOrigin = "anonymous";
	im.onload = function potat() {
		gl.bindTexture(gl.TEXTURE_2D, tx);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	};
	im.src = src;
	return tx;
}
function textureinit() {
	im1 = loadtexture("https://sun9-39.userapi.com/s/v1/ig2/RgYRqyXnfcYmhsBbpH5fC5DBOc15X_pe9IbwtwwvUQtDyXI_YGkaZR9b8tEzy7DNXIPWyi9xUMb5_aJgDdfR1lqh.jpg?size=832x609&quality=96&type=album");
	im2 = loadtexture("https://sun9-2.userapi.com/s/v1/ig2/5-gz8tzKQwFZIiw-ME_kbIfpJCVSdLfOnDKEXcAwH1HEVpVMOuN-4JSxyAfrE4Mhk0DI737SYe2KUxTuq0dcV1p0.jpg?size=750x515&quality=95&type=album");
	//im3 = loadtexture("pictures/amoung.png");
	im3 = loadtexture("pictures/f.jpg");
}

//________________________________________________________________________
//---------------PROGRAMS-------------------------------------------------

function initProgram(vssrc, fssrc, name) {
	const vs = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vs, vssrc);
	gl.compileShader(vs);

	const fs = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fs, fssrc);
	gl.compileShader(fs);

	const prog = gl.createProgram();
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);

	return {
		name: name,
		prog: prog,
		vposloc: gl.getAttribLocation(prog, '_pos'),
		vnorloc: gl.getAttribLocation(prog, '_nor'),
		vtxyloc: gl.getAttribLocation(prog, '_txy'),

		m4ptloc: gl.getUniformLocation(prog, 'm4pt'),
		m3ntloc: gl.getUniformLocation(prog, 'm3nt'),
		projloc: gl.getUniformLocation(prog, 'proj'),


		tx00loc: gl.getUniformLocation(prog, 'tx00'),
		yrotloc: gl.getUniformLocation(prog, 'yrot'),

		_tx1loc: gl.getUniformLocation(prog, '_tx1'),
	};
}

var info_1p;
var vssrc_1p =
	`#version 300 es
	in vec4 _pos;
	in vec3 _nor;
	in vec2 _txy;

	uniform mat4 m4pt;
	uniform mat3 m3nt;
	uniform mat4 proj;

	out vec4 pos;
	out vec3 nor;
	out vec2 txy;

	void main() {
		vec4 p = proj * (m4pt * _pos);
		gl_Position = p;

		pos = p;
		nor = _nor * m3nt;
		txy = _txy;
	}
`;
var fssrc_1p =
	`#version 300 es
	precision mediump float;

	uniform sampler2D _tx1;

	uniform vec2 tx00;
	uniform float yrot;

	in vec4 pos;
	in vec3 nor;
	in vec2 txy;
	out vec4 _col;

	void main() {
		vec2 t=txy-tx00;
		float ph=length(t)*yrot;
		float c=cos(ph);
		float s=sin(ph);
		
		vec2 _txy;
		_txy.x=t.x*c-t.y*s + tx00.x;
		_txy.y=t.x*s+t.y*c + tx00.y;

		_txy.x=_txy.x<0.0f?0.0f:_txy.x>1.0f?1.0f:_txy.x;
		_txy.y=_txy.y<0.0f?0.0f:_txy.y>1.0f?1.0f:_txy.y;

		_col = texture(_tx1, _txy);
	}
`;


//_____________________________________________________________________
//---------------MAIN--------------------------------------------------

var gl;
var h1;
var canv
var curinfo;
window.onload = function main() {
	h1 = document.querySelector("#oof");
	canv = document.querySelector("#canvas1");
	gl = canv.getContext("webgl2");

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.enable(gl.DEPTH_TEST);


	info_1p = initProgram(vssrc_1p, fssrc_1p, "OOOOOOOOOOOOOOOOF");
	curinfo = info_1p;
	h1.textContent = "хорошо что это сундуки вот эти наверху остались";


	textureinit();
	spaceinit();

	update();
}

window.onkeydown = (e) => {
	if (e.code == "KeyQ") yrot += 0.1;
	if (e.code == "KeyE") yrot -= 0.1;

	if (e.code == "ArrowLeft")		tx00[0] -= 0.1;
	if (e.code == "ArrowRight")		tx00[0] += 0.1;
	if (e.code == "ArrowDown")		tx00[1] -= 0.1;
	if (e.code == "ArrowUp")		tx00[1] += 0.1;

	if(e.code=="Space")
	{
		yrot=0;
		tx00=[0.5, 0.5];
	}
}

//_____________________________________________________________________
//---------------SPACE-------------------------------------------------

function transform(v, m) {
	const t = 1 / (v[0] * m[3] + v[1] * m[7] + v[2] * m[11] + v[3] * m[15]);
	const x = (v[0] * m[0] + v[1] * m[4] + v[2] * m[8] + v[3] * m[12]) * t;
	const y = (v[0] * m[1] + v[1] * m[5] + v[2] * m[9] + v[3] * m[13]) * t;
	const z = (v[0] * m[2] + v[1] * m[6] + v[2] * m[10] + v[3] * m[14]) * t;
	return [x, y, z, 1];
}

var yrot = 0.0; // это ускорение угла
var tx00 = [0.5, 0.5]; // это точка вращения

class figure {
	constructor(size, posbuf, txybuf, norbuf, tx) {
		this.size = size;
		this.posbuf = posbuf;
		this.txybuf = txybuf;
		this.norbuf = norbuf;
		this.tx = tx;

		this.m4pt = mat4.create();
		this.m3nt = mat3.create();
		this.m4tm = mat4.create();
	}

	//--------main----------
	render() {
		const info = curinfo;
		//----------------attributes--------------
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posbuf);
		gl.vertexAttribPointer(info.vposloc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(info.vposloc);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.norbuf);
		gl.vertexAttribPointer(info.vnorloc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(info.vnorloc);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.txybuf);
		gl.vertexAttribPointer(info.vtxyloc, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(info.vtxyloc);


		//----------------uniforms--------------
		gl.useProgram(info.prog);
		gl.uniformMatrix4fv(info.m4ptloc, false, this.m4pt);
		gl.uniformMatrix3fv(info.m3ntloc, false, this.m3nt);
		gl.uniformMatrix4fv(info.projloc, false, proj);

		gl.uniform2fv(info.tx00loc, tx00);
		gl.uniform1f(info.yrotloc, yrot);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.tx);
		gl.uniform1i(info._tx1loc, 0);

		gl.drawArrays(gl.TRIANGLES, 0, this.size);
	}
	update() {
	}

	//--------transform----------

	back() {
		mat4.copy(this.m4pt, this.m4tm);
	}

	apply(mat) {
		mat4.copy(this.m4tm, this.m4pt);
		mat4.multiply(this.m4pt, this.m4pt, mat);
		mat3.normalFromMat4(this.m3nt, this.m4pt);
	}
	selfapply(mat) {
		mat4.copy(this.m4tm, this.m4pt);
		const m = this.m4pt;
		const x = m[12], y = m[13], z = m[14];
		m[12] -= x; m[13] -= y; m[14] -= z;
		mat4.multiply(this.m4pt, this.m4pt, mat);
		mat3.normalFromMat4(this.m3nt, this.m4pt);
		m[12] += x; m[13] += y; m[14] += z;
	}


	scale(val) {
		mat4.copy(this.m4tm, this.m4pt);
		this.m4pt[15] *= val;
	}
	move(dx, dy, dz) {
		mat4.copy(this.m4tm, this.m4pt);
		this.m4pt[12] += dx;
		this.m4pt[13] += dy;
		this.m4pt[14] += dz;
	}
	moveto(x, y, z) {
		mat4.copy(this.m4tm, this.m4pt);
		this.m4pt[12] = x;
		this.m4pt[13] = y;
		this.m4pt[14] = z;
	}
}

class banner extends figure {
	constructor(tx) {
		const p00 = [-1, -1, 0], p01 = [-1, 1, 0];
		const p10 = [1, -1, 0], p11 = [1, 1, 0];
		const pos = [
			p00, p01, p10,
			p01, p10, p11
		].flat(2);
		const n = [0, 0, 1];
		const nor = [
			n, n, n,
			n, n, n
		].flat(2);
		const t00 = [0, 0], t01 = [0, 1];
		const t10 = [1, 0], t11 = [1, 1];
		const txy = [
			t00, t01, t10,
			t01, t10, t11
		].flat(2);

		const posbuf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, posbuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
		const txybuf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, txybuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(txy), gl.STATIC_DRAW);
		const norbuf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, norbuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nor), gl.STATIC_DRAW);

		super(pos.length, posbuf, txybuf, norbuf, tx);
	}
}


const figures = [];
function update() {
	tx00[0]+=-0.05+Math.random()*0.1;
	tx00[1]+=-0.05+Math.random()*0.1;
	yrot+=-0.05+Math.random()*0.1;

	figures.forEach((f) => { f.update() })
	drawScene();
	requestAnimationFrame(update);
}

const proj = mat4.create(), cam = mat4.create();
function basisinit() {
}


async function spaceinit() {
	basisinit();

	const f3 = new banner(im3);
	figures.push(f3);
	f3.move(0, 0, 0);
}

//_______________________________________________________________________
//---------------RENDER--------------------------------------------------

function drawScene() {
	gl.clearColor(0.5, 0.5, 0.5, 1.0);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	figures.forEach((f) => { f.render() });
}