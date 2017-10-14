/*
 * 传感器类
 * 显示温度文本，温度高于alarmTemperature会闪烁报警
*/
var Sensor = function(temperature) {
	this.blinking = false;							// 是否闪烁
	this.color = Sensor.defaultColor;
	this.temperature = Sensor.defaultTemperature;

	this.setTemperature(temperature);
	this.initialize();
};

Sensor.defaultTemperature	 = 25.0;		// 默认温度25度
Sensor.alarmTemperature		 = 29.5;		// 报警温度29度
Sensor.defaultColor			 = 0x00ff00;	// 默认颜色绿色
Sensor.alarmColor			 = 0xff0000;	// 报警颜色红色

Sensor.prototype.setTemperature = function(temperature) {
	this.temperature = temperature;

	if(temperature > Sensor.alarmTemperature) {
		this.blinking = true;
		this.color = Sensor.alarmColor;
	} else {
		this.blinking = false;
		this.color = Sensor.defaultColor;
	}
};

Sensor.SPARK_TEXTURE = THREE.ImageUtils.loadTexture("../images/spark.png");
Sensor.prototype.initialize = function() {
	this.mesh = new THREE.Object3D();

	var sparkMaterial = new THREE.SpriteMaterial({ map: Sensor.SPARK_TEXTURE, userScreenCoordinates: false });
	var spark = new THREE.Sprite(sparkMaterial);
	spark.scale.set(10, 10, 1.0);
	spark.material.opacity = 0.8;
	spark.material.blending = THREE.AdditiveBlending;
	spark.material.color.set(this.color);

	this.mesh.add(spark);
	// 添加温度文本
	this.addTemperature();

	var sphereGeometry = new THREE.SphereGeometry(2, 10, 10);
	var sphereMaterial = new THREE.MeshBasicMaterial({ color: this.color });
	var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	this.mesh.add(sphere);

	this.mesh.sensor = this;
};

Sensor.prototype.addTemperature = function() {
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	var temperatureText;

	if(this.temperature < 10) {
		temperatureText = "  " + (new Number(this.temperature).toFixed(1));
	} else {
		temperatureText = "" + (new Number(this.temperature).toFixed(1));
	}

	var fontSize = 24;
	var borderWidth = 2;
	var padding = 2;

	context.font = "" + fontSize + "px '微软雅黑'";
	var metrics = context.measureText(temperatureText);
	var textWidth = metrics.width;

	canvas.width = 2 * borderWidth + 2 * padding + textWidth;
	canvas.height = 2 * borderWidth + fontSize * 1.4;

	// 这很重要，canvas调整大小后，context状态会丢失，同时画布清空
	context.font = fontSize + "px '微软雅黑'";

	var color = new THREE.Color(this.color);
	context.fillStyle = "rgba("
		+ Math.floor(1.0 * 100 + 155) + ","
		+ Math.floor(1.0 * 100 + 155) + ","
		+ Math.floor(1.0 * 100 + 155) + ","
		+ 0.8 + ")";
	context.strokeStyle = "rgba("
		+ Math.floor(.2 * 200 + 55) + ","
		+ Math.floor(.2 * 200 + 55) + ","
		+ Math.floor(.2 * 200 + 55) + ","
		+ 1 + ")";
	context.lineWidth = borderWidth;

	var drawRoundRect = function(startX, startY, width, height, radius) {
		context.beginPath();
		context.moveTo(startX + radius, startY);
		context.lineTo(startX + width - radius, startY);
		context.quadraticCurveTo(startX + width, startY, startX + width, startY + radius);
		context.lineTo(startX + width, startY + height - radius);
		context.quadraticCurveTo(startX + width, startY + height, startX + width - radius, startY + height);
		context.lineTo(startX + radius, startY + height);
		context.quadraticCurveTo(startX, startY + height, startX, startY + height - radius);
		context.lineTo(startX, startY + radius);
		context.quadraticCurveTo(startX, startY, startX + radius, startY);
		context.closePath();
		context.fill();
		context.stroke();
	};

	drawRoundRect(borderWidth / 2, borderWidth / 2, textWidth + borderWidth + 2 * padding, fontSize * 1.4 + borderWidth, borderWidth);
	context.fillStyle = "rgba(0, 0, 0, 1)";
	context.fillText(temperatureText, borderWidth + padding, fontSize + borderWidth);
	
	var textTexture = new THREE.Texture(canvas);
	// 这一行很重要，没有会导致纹理变成黑色
	textTexture.needsUpdate = true;
	var textGeometry = new THREE.PlaneGeometry(canvas.width / 2.5, canvas.height / 2.5);
	var textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, side: THREE.DoubleSide, transparent: true });
	var textMesh = new THREE.Mesh(textGeometry, textMaterial);
	textMesh.rotation.x = 0.40 * Math.PI;
	textMesh.position.z = 12;
	textMesh.name = "label";

	this.mesh.add(textMesh);
};

Sensor.step = 0;
Sensor.prototype.blink = function() {
	if(!this.blinking) return;

	var radius = 32;
	this.mesh.children[0].scale.set(
		12 + 8 * (Math.sin(Sensor.step) + 1),
		12 + 8 * (Math.sin(Sensor.step) + 1),
		1.0
	);

	Sensor.step += 0.06;
};

Sensor.prototype.updateTemperature = function(temperature) {
	this.setTemperature(temperature);
	// 删除文本Mesh
	this.mesh.remove(this.mesh.getChildByName("label"));
	this.addTemperature();
};

var width = window.innerWidth - 260;		// 屏幕剩余的宽度
var height = window.innerHeight - 80;		// 屏幕剩余的高度
var camera, scene, renderer, control, raycaster;

(function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
	renderer = new THREE.WebGLRenderer({ antialias: true });

	camera.position.set(0, 600, 500);
	camera.lookAt(scene.position);
	scene.add(camera);

	THREE.Texture.magFilter = THREE.LinearFilter;
	THREE.Texture.minFilter = THREE.LinearFilter;

	var ambientLight = new THREE.AmbientLight(0x0c0c0c);
	scene.add(ambientLight);

	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(1, 1, 1);
	scene.add(directionalLight);

	renderer.setClearColor(0xbbbbbb);
	renderer.setSize(width, height);

	control = new THREE.OrbitControls(camera, renderer.domElement);
	raycaster = new THREE.Raycaster();

	$(".content").append(renderer.domElement);
})();

function drawTransparentText(message, font) {
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	var padding = (font && font.padding) ? font.padding : 2;
	var fontSize = (font && font.fontSize) ? font.fontSize : 18;
	var fontFamily = (font && font.fontFamily) ? font.fontFamily : "微软雅黑";
	var fontColor = (font && font.fontColor) ? font.fontColor : "rgb(0, 0, 0)";

	context.font = fontSize + "px '" + fontFamily + "'";
	var metrics = context.measureText(message);
	var textWidth = metrics.width;

	canvas.width = 2 * padding + textWidth;
	canvas.height = fontSize * 1.4;

	context.font = fontSize + "px '" + fontFamily + "'";
	context.fillStyle = "rgba(0, 0, 0, 0)";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = fontColor;
	context.fillText(message, padding, fontSize);

	return canvas;
}

function createTextMesh(message, font) {
	var canvas = drawTransparentText(message, font);
	var texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;

	var textGeometry = new THREE.PlaneGeometry(canvas.width, canvas.height);
		textGeometry.computeBoundingBox();
	var textMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
	var textMesh = new THREE.Mesh(textGeometry, textMaterial);

	return textMesh;
}

var axis = new THREE.Object3D();
var xAxis = new THREE.ArrowHelper(
	new THREE.Vector3(1, 0, 0),
	new THREE.Vector3(0, 0, 0),
	650, 0xff0000, 10, 4);
axis.add(xAxis);
var yAxis = new THREE.ArrowHelper(
	new THREE.Vector3(0, 1, 0),
	new THREE.Vector3(0, 0, 0),
	290, 0x00ff00, 10, 4);
axis.add(yAxis);
var zAxis = new THREE.ArrowHelper(
	new THREE.Vector3(0, 0, 1),
	new THREE.Vector3(0, 0, 0),
	250, 0x0000ff, 10, 4);
axis.position.x = -300;
axis.add(zAxis);
scene.add(axis);

var xAxisText = createTextMesh("列", { fontSize: 16, fontFamily: "黑体" });
var textWidth = xAxisText.geometry.boundingBox.max.x - xAxisText.geometry.boundingBox.min.x;
var textHeight = xAxisText.geometry.boundingBox.max.y - xAxisText.geometry.boundingBox.min.y;
xAxisText.position.x = 350 - textWidth / 2;
xAxisText.position.y = textHeight / 2;
scene.add(xAxisText);

var yAxisText = createTextMesh("层", { fontSize: 16, fontFamily: "黑体" });
textWidth = yAxisText.geometry.boundingBox.max.x - yAxisText.geometry.boundingBox.min.x;
textHeight = yAxisText.geometry.boundingBox.max.y - yAxisText.geometry.boundingBox.min.y;
yAxisText.position.y = 290 - textHeight;
yAxisText.position.x = -300 + textWidth / 2;
scene.add(yAxisText);

var zAxisText = createTextMesh("行", { fontSize: 16, fontFamily: "黑体" });
textWidth = zAxisText.geometry.boundingBox.max.x - zAxisText.geometry.boundingBox.min.x;
textHeight = zAxisText.geometry.boundingBox.max.y - zAxisText.geometry.boundingBox.min.y;
zAxisText.rotation.y = 0.5 * Math.PI;
zAxisText.position.x = -300;
zAxisText.position.y = textHeight / 2;
zAxisText.position.z = 250 - textWidth / 2;
scene.add(zAxisText);

var planeGeometry = new THREE.PlaneGeometry(600, 200, 30, 10);
var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffff55, opacity: 0.6, side: THREE.DoubleSide, transparent: true });
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotateX(-0.5 * Math.PI);
plane.position.z = 100;
scene.add(plane);

var planeText = createTextMesh("第一层", { fontSize: 20, fontFamily: "宋体", fontColor: "rgba(255, 255, 85, 0.8)" });
textWidth = planeText.geometry.boundingBox.max.x - planeText.geometry.boundingBox.min.x;
textHeight = planeText.geometry.boundingBox.max.y - planeText.geometry.boundingBox.min.y;
planeText.rotateX(-0.5 * Math.PI);
planeText.rotateZ(-0.5 * Math.PI);
planeText.position.x = 300 + textHeight / 2;
planeText.position.z = 100;
planeText.rotation
scene.add(planeText);

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

sensorGroup.rotateX(-0.5 * Math.PI);
sensorGroup.position.y = 5;
sensorGroup.position.z = 100;
scene.add(sensorGroup);

var planeBGeometry = new THREE.PlaneGeometry(600, 200, 30, 10);
var planeBMaterial = new THREE.MeshLambertMaterial({ color: 0x55ffff, opacity: 0.6, side: THREE.DoubleSide, transparent: true });
var planeB = new THREE.Mesh(planeBGeometry, planeBMaterial);
planeB.rotateX(-0.5 * Math.PI);
planeB.position.y = 120;
planeB.position.z = 100;
scene.add(planeB);

var planeBText = createTextMesh("第二层", { fontSize: 20, fontFamily: "宋体", fontColor: "rgba(85, 255, 255, 0.8)" });
textWidth = planeBText.geometry.boundingBox.max.x - planeBText.geometry.boundingBox.min.x;
textHeight = planeBText.geometry.boundingBox.max.y - planeBText.geometry.boundingBox.min.y;
planeBText.rotateX(-0.5 * Math.PI);
planeBText.rotateZ(-0.5 * Math.PI);
planeBText.position.x = 300 + textHeight / 2;
planeBText.position.y = 120;
planeBText.position.z = 100;
planeBText.rotation
scene.add(planeBText);

var sensorGroupB = new THREE.Object3D();
for(var i = 0; i < 15; ++i) {
	for(var j = 0; j < 2; ++j ) {
		var sensor = new Sensor(Math.random() * 5 + 25);
		sensor.mesh.position.set((i + 1) * distX - 300, (j + 1) * distY - 100, 0);
		sensorGroupB.add(sensor.mesh);
	}
}

sensorGroupB.rotateX(-0.5 * Math.PI);
sensorGroupB.position.y = 120 + 5;
sensorGroupB.position.z = 100;
scene.add(sensorGroupB);

var planeCGeometry = new THREE.PlaneGeometry(600, 200, 30, 10);
var planeCMaterial = new THREE.MeshLambertMaterial({ color: 0xff55ff, opacity: 0.6, side: THREE.DoubleSide, transparent: true });
var planeC = new THREE.Mesh(planeCGeometry, planeCMaterial);
planeC.rotateX(-0.5 * Math.PI);
planeC.position.y = 240;
planeC.position.z = 100;
scene.add(planeC);

var planeCText = createTextMesh("第三层", { fontSize: 20, fontFamily: "宋体", fontColor: "rgba(255, 85, 255, 0.8)" });
textWidth = planeCText.geometry.boundingBox.max.x - planeCText.geometry.boundingBox.min.x;
textHeight = planeCText.geometry.boundingBox.max.y - planeCText.geometry.boundingBox.min.y;
planeCText.rotateX(-0.5 * Math.PI);
planeCText.rotateZ(-0.5 * Math.PI);
planeCText.position.x = 300 + textHeight / 2;
planeCText.position.y = 240;
planeCText.position.z = 100;
planeCText.rotation
scene.add(planeCText);

var sensorGroupC = new THREE.Object3D();
for(var i = 0; i < 15; ++i) {
	for(var j = 0; j < 2; ++j ) {
		var sensor = new Sensor(Math.random() * 5 + 25);
		sensor.mesh.position.set((i + 1) * distX - 300, (j + 1) * distY - 100, 0);
		sensorGroupC.add(sensor.mesh);
	}
}

sensorGroupC.rotateX(-0.5 * Math.PI);
sensorGroupC.position.y = 240 + 5;
sensorGroupC.position.z = 100;
scene.add(sensorGroupC);

for(var j = 0; j < 3; ++j) {
	for(var i = 0; i < 15; ++i) {
		var labelX = createTextMesh("" + (i + 1), { fontSize: 10 });
		textHeight = labelX.geometry.boundingBox.max.y - labelX.geometry.boundingBox.min.y;
		labelX.position.x = -300 + (i + 1) * (600 / 16) ;
		labelX.position.y = textHeight / 2 + 120 * j;

		scene.add(labelX);
	}

	for(var i = 0; i < 2; ++i) {
		var labelZ = createTextMesh("第" + (i + 1) + "行", { fontSize: 10 });
		textWidth = labelZ.geometry.boundingBox.max.x - labelZ.geometry.boundingBox.min.x;
		textHeight = labelZ.geometry.boundingBox.max.y - labelZ.geometry.boundingBox.min.y;
		labelZ.rotateY(0.5 * Math.PI);
		labelZ.position.x = -300;
		labelZ.position.y = j * 120 + textHeight / 2;
		labelZ.position.z = (200 / 3) * (i + 1);
		scene.add(labelZ);
	}
}

var mouse = new THREE.Vector2();
var canvas = $("canvas")[0];
canvas.addEventListener("mousemove", function(e) {
	e.preventDefault();
	mouse.x = ((e.pageX - 260) / canvas.width) * 2 - 1;
	mouse.y = -((e.pageY - 80) / canvas.height) * 2 + 1;
}, false);
canvas.addEventListener("click", function(e) {
	if(lastActive != null) {
		console.log("click on " + lastActive.name);
		switch(lastActive.name) {
			case "planeC":
				TweenLite.to(camera.position, 1,
					{
						x: 1.5014352629948784,
						y: 558.4233680870958,
						z: 430.1277719078546,
						ease: Expo.easeInOut,
					});
				break;
			case "planeB":
				TweenLite.to(camera.position, 1,
					{
						x: 5.483791545919557,
						y: 361.1827209336363,
						z: 488.60402864821737,
						ease: Expo.easeInOut,
					});			
				break;
			case "plane":
				TweenLite.to(camera.position, 1,
					{
						x: -13.866880748377941,
						y: 249.0231389476335,
						z: 488.6040286482173,
						ease: Expo.easeInOut,
					});			
				break;
		}
	} else {
		TweenLite.to(camera.position, 1,
			{
				x: 0,
				y: 600,
				z: 500,
				ease: Expo.easeInOut,
			});			
	}
}, false);

window.addEventListener("resize", onResize, false);
function onResize() {
	width = window.innerWidth - 260;
	height = window.innerHeight - 80;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
}

function animateCamera() {
	console.log("animate camera");
	TweenLite.to(
		camera.position,
		1,
		{
			x: Math.random() * 500,
			y: Math.random() * 500,
			z: Math.random() * 500,
			ease: Expo.easeInOut
		}
	);
}

var lastActive = null;
plane.name = "plane";
planeB.name = "planeB";
planeC.name = "planeC";
var planes = [plane, planeB, planeC];
(function render() {
	requestAnimationFrame(render);

	sensorGroup.children.forEach(function(sensor) { sensor.sensor.blink(); });
	sensorGroupB.children.forEach(function(sensor) { sensor.sensor.blink(); });
	sensorGroupC.children.forEach(function(sensor) { sensor.sensor.blink(); });

	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObjects(planes);
	if(intersects.length > 0) {
		if(lastActive != intersects[0].object) {
			lastActive = intersects[0].object;
			console.log(lastActive.name);
		}
	} else {
		if(lastActive != null) {
			lastActive = null;
			console.log("null");
		}
	}

	control.update();
	renderer.render(scene, camera);
})();