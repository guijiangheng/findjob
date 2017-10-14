Link.width = 10;
Link.arrowSpeed = 2;
Link.arrowInterval = 50;
Link.arrowBarLength = 20;

function Link (personA, personB) {
	this.displacement = 0;
	this.personA = personA;
	this.personB = personB;
	
	var distx = personA.x - personB.x;
	var disty = personA.y - personB.y;
	this.angle = Math.atan2(-disty, -distx);
	this.distance = Math.sqrt(distx * distx + disty * disty);

	var len = Math.ceil(this.distance / Link.arrowInterval);
	this.alignDistance = len * Link.arrowInterval;

	// 创建离屏canvas，缓存位图
	this.bufferCanvas = document.createElement("canvas");
	this.bufferContext = this.bufferCanvas.getContext("2d");

	this.bufferCanvas.width = this.alignDistance;
	this.bufferCanvas.height = Link.width;
	this.bufferContext.fillStyle = "black";
	this.bufferContext.globalAlpha = 0.8;
	this.bufferContext.beginPath();

	for(var i = 0; i < len; ++i) {
		this.bufferContext.fillRect((i + 1) * Link.arrowInterval - Link.arrowBarLength,
			0, Link.arrowBarLength, Link.width);
	}

	this.stateFlag = "normal";
}

Link.prototype.setState = function(state) {
	if(this.stateFlag == "onShow") {
		// 只接受offShow
		if(state == "offShow")
			this.stateFlag = "offShow";
	} else {
		this.stateFlag = state;
	}
}

Link.prototype.draw = function() {
	switch(this.stateFlag) {
		case "hidden":
			break;
		case "normal":
		case "offShow":
			var distx = this.personB.x - this.personA.x;
			var disty = this.personB.y - this.personA.y;
			var angleA = Math.atan2(disty, distx), angleB;

			if(angleA > 0) {
				angleB = angleA - Math.PI;
			} else {
				angleB = angleA + Math.PI;
			}

			var ax = this.personA.x + Person.radius * Math.cos(angleA);
			var ay = this.personA.y + Person.radius * Math.sin(angleA);
			var bx = this.personB.x + Person.radius * Math.cos(angleB);
			var by = this.personB.y + Person.radius * Math.sin(angleB);

			context.save();
			context.lineWidth = 0.1;
			context.strokeStyle = "white";

			context.beginPath();
			context.moveTo(ax, ay);
			context.lineTo(bx, by);
			context.stroke();
			context.restore();
			break;
		case "linked":
		case "onShow":
			// fill rect of line
			context.save();
			context.fillStyle = "purple";
			context.globalAlpha = 0.8;

			context.beginPath();
			context.translate(this.personA.x, this.personA.y);
			context.rotate(this.angle);
			context.fillRect(0, -(Link.width / 2), this.distance, Link.width);
			context.restore();

			// draw two edge lines
			context.save();
			context.lineWidth = 1;
			context.strokeStyle = "black";
			context.beginPath();
			context.translate(this.personA.x, this.personA.y);
			context.rotate(this.angle);
			context.moveTo(0, -Link.width / 2);

			context.rotate(-this.angle);
			context.translate(this.personB.x - this.personA.x, this.personB.y - this.personA.y);
			context.rotate(this.angle);
			context.lineTo(0, -Link.width / 2);

			context.rotate(-this.angle);
			context.translate(this.personA.x - this.personB.x, this.personA.y - this.personB.y);
			context.rotate(this.angle);
			context.moveTo(0, Link.width / 2);

			context.rotate(-this.angle);
			context.translate(this.personB.x - this.personA.x, this.personB.y - this.personA.y);
			context.rotate(this.angle);
			context.lineTo(0, Link.width / 2);

			context.stroke();
			context.restore();

			// create clip erea
			context.save();
			context.translate(this.personA.x, this.personA.y);
			context.rotate(this.angle);
			context.beginPath();
			var clipWidth = Link.width + 2;
			context.rect(0, -clipWidth / 2, this.distance, clipWidth);
			context.clip();

			// 操纵位图，达到传送带效果
			this.displacement += Link.arrowSpeed;
			if(this.displacement > this.alignDistance)
				this.displacement -= this.alignDistance;

			if(this.displacement == 0 || this.displacement == this.alignDistance) {
				context.drawImage(this.bufferCanvas, 0, -Link.width / 2);
			} else {
				var imageData = this.bufferContext.getImageData(
					0, 0, this.alignDistance, Link.width);
				var imageDataA = this.bufferContext.getImageData(
					0, 0, this.alignDistance - this.displacement, Link.width);
				var imageDataB = this.bufferContext.getImageData(
					this.alignDistance - this.displacement, 0, this.displacement, Link.width);

				this.bufferContext.putImageData(imageDataA, this.displacement, 0);
				this.bufferContext.putImageData(imageDataB, 0, 0);
				context.drawImage(this.bufferCanvas, 0, -Link.width / 2);
				this.bufferContext.putImageData(imageData, 0, 0);
			}

			context.restore();
	}
}