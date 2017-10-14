var Sensor = function(temperature) {
	this.blinking = false;	// 是否闪烁
	this.temperature = temperature;
	this.initialize();
}

Sensor.SPARK_TEXTURE = THREE.ImageUtils.loadTexture("./images/spark.png");
Sensor.prototype.initialize = function() {
	var mesh = new THREE.Object3D();
	var sparkMaterial = new THREE.SpriteMaterial({ map: Sensor.SPARK_TEXTURE, userScreenCoordinates: false });
	var spark = new THREE.Sprite(sparkMaterial);

	spark.scale.set(10, 10, 1.0);
	spark.material.opacity = 0.8;
	spark.material.blending = THREE.AdditiveBlending;

	var color;
	if(this.temperature > 28) {
		this.blinking = true;
		color = 0xff0000;
	} else if(this.temperature > 26) {
		this.blinking = false;
		color = 0x00ff00;
	} else {
		this.blinking = false;
		color = 0x0000ff;
	}

	spark.material.color.set(color);
	mesh.add(spark);

	var sphereGeometry = new THREE.SphereGeometry(2, 10, 10);
	var sphereMaterial = new THREE.MeshBasicMaterial({ color: color });
	var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	mesh.add(sphere);
	mesh.sensor = this;
	this.mesh = mesh;
}

Sensor.prototype.step = 0;
Sensor.prototype.blink = function() {
	if(!this.blinking) return;

	var radius = 32;
	this.mesh.children[0].scale.set(
		12 + 8 * (Math.sin(this.step) + 1),
		12 + 8 * (Math.sin(this.step) + 1),
		1.0
	);

	this.step += 0.06;
}

var width = window.innerWidth - 260;
var height = window.innerHeight - 80;
var camera, scene, renderer, control;
(function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
	renderer = new THREE.WebGLRenderer({ antialias: true });

	camera.position.set(550, 350, 550);
	camera.lookAt(scene.position);
	scene.add(camera);

	var ambientLight = new THREE.AmbientLight(0x0c0c0c);
	scene.add(ambientLight);

	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(1, 1, 1);
	scene.add(directionalLight);

	renderer.setClearColor(0xbbbbbb);
	renderer.setSize(width, height);

	control = new THREE.OrbitControls(camera, renderer.domElement);
	$(".content").append(renderer.domElement);
})();

var gridHelper = new THREE.GridHelper(400, 10);
gridHelper.setColors(0x888888, 0xaaaaaa);
scene.add(gridHelper);

var axis = new THREE.Object3D();
var xAxis = new THREE.ArrowHelper(
	new THREE.Vector3(1, 0, 0),
	new THREE.Vector3(0, 0, 0),
	600, 0xff0000, 10, 4);
axis.add(xAxis);
var yAxis = new THREE.ArrowHelper(
	new THREE.Vector3(0, 1, 0),
	new THREE.Vector3(0, 0, 0),
	250, 0x00ff00, 10, 4);
axis.add(yAxis);
var zAxis = new THREE.ArrowHelper(
	new THREE.Vector3(0, 0, 1),
	new THREE.Vector3(0, 0, 0),
	200, 0x0000ff, 10, 4);
axis.position.y = 0.5;
axis.position.x = -250;
axis.add(zAxis);

var textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
var zTextGeometry = new THREE.TextGeometry(
	"Row",
	{
		size: 8,
		height: 0.1,
		curveSegments: 2,
		font: "helvetiker"
	}
);
zTextGeometry.computeBoundingBox();
var zTextWith = zTextGeometry.boundingBox.max.x - zTextGeometry.boundingBox.min.x;
var zTextMesh = new THREE.Mesh(zTextGeometry, textMaterial);
zTextMesh.rotateY(0.5 * Math.PI);
zTextMesh.position.z = 200 + zTextWith;

axis.add(zTextMesh);

var yTextGeometry = new THREE.TextGeometry(
	"Layer",
	{
		size: 8,
		height: 0.1,
		curveSegments: 2,
		font: "helvetiker"
	}
);
yTextGeometry.computeBoundingBox();
var yTextMesh = new THREE.Mesh(yTextGeometry, textMaterial);
yTextMesh.position.x = 5;
yTextMesh.position.y = 230;
axis.add(yTextMesh);

var xTextGeometry = new THREE.TextGeometry(
	"Column",
	{
		size: 8,
		height: 0.1,
		curveSegments: 2,
		font: "helvetiker"
	}
);
xTextGeometry.computeBoundingBox();
var xTextMesh = new THREE.Mesh(xTextGeometry, textMaterial);
xTextMesh.position.x = 600;
axis.add(xTextMesh);

for(var i = 0; i < 15; ++i) {
	var distLabelX = 600 / 16;
	var labelGeometry = new THREE.TextGeometry(
		"" + (i + 1),
		{
			size: 6,
			height: 0.1,
			curveSegments: 2,
			font: "helvetiker"
		}
	);
	labelGeometry.computeBoundingBox();
	var labelWidth = labelGeometry.boundingBox.max.x - labelGeometry.boundingBox.min.x;
	var labelMesh = new THREE.Mesh(labelGeometry, textMaterial);
	labelMesh.position.x = distLabelX * (i + 1) - labelWidth / 2;
	labelMesh.position.y = 192;
	axis.add(labelMesh);
}

for(var i = 0; i < 2; ++i) {
	var distLabelY = 200 / 3;
	var labelGeometry = new THREE.TextGeometry(
		"" + (i + 1),
		{
			size: 6,
			height: 0.1,
			curveSegments: 2,
			font: "helvetiker"
		}
	);

	labelGeometry.computeBoundingBox();
	var labelWidth = labelGeometry.boundingBox.max.x - labelGeometry.boundingBox.min.x;
	var labelMesh = new THREE.Mesh(labelGeometry, textMaterial);
	labelMesh.rotateY(0.5 * Math.PI);
	labelMesh.position.z = distLabelY * (i + 1) - labelWidth / 2;
	labelMesh.position.y = 192;
	axis.add(labelMesh);
}
scene.add(axis);

var planeGeometry = new THREE.PlaneGeometry(600, 200, 30, 10);
var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffff55, opacity: 0.6, transparent: true });
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotateX(-0.45 * Math.PI);
plane.position.x = 50;
plane.position.y = 50;
plane.position.z = 100;
scene.add(plane);

var sensorGroup = new THREE.Object3D();
var distX = 600 / 16;
var distY = 200 / 3;

for(var i = 0; i < 15; ++i) {
	for(var j = 0; j < 2; ++j ) {
		var sensor = new Sensor(Math.random() * 5 + 25);
		sensor.mesh.position.set((i + 1) * distX - 300, (j + 1) * distY - 100, 0);
		sensorGroup.add(sensor.mesh);
	}
}

sensorGroup.rotateX(-0.45 * Math.PI);
sensorGroup.position.x = 50;
sensorGroup.position.y = 50 + 6;
sensorGroup.position.z = 100;
scene.add(sensorGroup);

var planeBGeometry = new THREE.PlaneGeometry(600, 200, 30, 10);
var planeBMaterial = new THREE.MeshLambertMaterial({ color: 0x55ffff, opacity: 0.6, transparent: true });
var planeB = new THREE.Mesh(planeBGeometry, planeBMaterial);
planeB.rotateX(-0.48 * Math.PI);
planeB.position.x = 50;
planeB.position.y = 120;
planeB.position.z = 100;
scene.add(planeB);

var sensorGroupB = new THREE.Object3D();
for(var i = 0; i < 15; ++i) {
	for(var j = 0; j < 2; ++j ) {
		var sensor = new Sensor(Math.random() * 5 + 25);
		sensor.mesh.position.set((i + 1) * distX - 300, (j + 1) * distY - 100, 0);
		sensorGroupB.add(sensor.mesh);
	}
}

sensorGroupB.rotateX(-0.48 * Math.PI);
sensorGroupB.position.x = 50;
sensorGroupB.position.y = 120 + 6;
sensorGroupB.position.z = 100;
scene.add(sensorGroupB);

var planeCGeometry = new THREE.PlaneGeometry(600, 200, 30, 10);
var planeCMaterial = new THREE.MeshLambertMaterial({ color: 0xff55ff, opacity: 0.6, transparent: true });
var planeC = new THREE.Mesh(planeCGeometry, planeCMaterial);
planeC.rotateX(-0.5 * Math.PI);
planeC.position.x = 50;
planeC.position.y = 190;
planeC.position.z = 100;
scene.add(planeC);

var sensorGroupC = new THREE.Object3D();
for(var i = 0; i < 15; ++i) {
	for(var j = 0; j < 2; ++j ) {
		var sensor = new Sensor(Math.random() * 5 + 25);
		sensor.mesh.position.set((i + 1) * distX - 300, (j + 1) * distY - 100, 0);
		sensorGroupC.add(sensor.mesh);
	}
}

sensorGroupC.rotateX(0.5 * Math.PI);
sensorGroupC.position.x = 50;
sensorGroupC.position.y = 190 + 6;
sensorGroupC.position.z = 100;
scene.add(sensorGroupC);

var raycaster = new THREE.Raycaster();
console.log(raycaster.setFromCamera);
var mouse = new THREE.Vector2(), lastActive = null;

document.addEventListener("mousemove", onMouseMove, false);
function onMouseMove(e) {
	e.preventDefault();
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("resize", onResize, false);
function onResize() {
	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
}

var children = [];
sensorGroup.children.forEach(function(object) {
	children.push(object.children[1]);
});

(function render() {
	requestAnimationFrame(render);

	sensorGroup.children.forEach(function(sensor) {
		sensor.sensor.blink();
	});
	sensorGroupB.children.forEach(function(sensor) {
		sensor.sensor.blink();
	});
	sensorGroupC.children.forEach(function(sensor) {
		sensor.sensor.blink();
	});

	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObjects(children);
	if(intersects.length > 0) {
		if(lastActive != intersects[0].object) {
			lastActive = intersects[0].object;
			console.log(lastActive.parent.sensor.temperature);
		}
	} else {
		lastActive = null;
	}

	control.update();
	renderer.render(scene, camera);
})();