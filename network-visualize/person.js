Person.radius = 15;
Person.colors = [
	"#DC0048", "#F14646", "#4AE6A9",
	"#7CFF3F", "#4EC9D9", "#4EC9D9"];

function Person() {
	var random = Math.random() * Person.colors.length;
	this.color = Person.colors[Math.floor(random)];

	this.setState("normal");
}

Person.prototype.setState = function(state) {
	switch(state) {
		case "normal":
			this.state = {stateFlag: "normal"};
			break;
		case "fadeIn":
			this.state = {
				alpha: 0.1,
				speed: 0.06,
				targetAlpha: 1,
				stateFlag: "fadeIn",
			};
			break;
		case "fadeOut":
			this.state = {
				alpha: 1,
				speed: -0.06,
				targetAlpha: 0.1,
				stateFlag: "fadeOut",
			};
			break;
		case "linked1":
			this.state = {
				speed: 5,
				lineWidth: 6,
				radius: Person.radius,
				targetRadius: 1.5 * Person.radius,
				stateFlag: "linked1",
			};
			break;
		case "linked2":
			this.state = {
				speed: 5,
				lineWidth: 2,
				radius: Person.radius,
				targetRadius: 1.2 * Person.radius,
				stateFlag: "linked2",
			};
			break;
		case "active":
			this.state = {
				speed: 5,
				lineWidth: 10,
				radius: Person.radius,
				targetRadius: 2 * Person.radius,
				stateFlag: "active",
			};
			break;
	}
}

Person.prototype.update = function() {
	switch(this.state.stateFlag) {
		case "normal":
			break;
		case "fadeIn":
			if(this.state.alpha < this.state.targetAlpha) {
				this.state.alpha += this.state.speed;
			}
			break;
		case "fadeOut":
			if(this.state.alpha > this.state.targetAlpha) {
				this.state.alpha += this.state.speed;
			}else {
				this.state.alpha = this.state.targetAlpha;
			}
			break;
		case "active":
		case "linked1":
		case "linked2":
			if(Math.abs(this.state.speed) > 0.01) {
				var a = (this.state.targetRadius - this.state.radius) / 10;
				this.state.speed += a;
				this.state.radius += this.state.speed;
				this.state.speed *= 0.8;
			}
			break;
	}
}

Person.prototype.draw = function() {

}

Person.prototype.drawCircle = function() {
	context.save();
	context.beginPath();
	context.fillStyle = this.color;
	context.globalCompositeOperation = "lighter";
	context.globalAlpha = 0.8;

	switch(this.state.stateFlag) {
		case "fadeIn":
		case "fadeOut":
			context.globalAlpha = this.state.alpha;
			break;
	}

	context.arc(this.x, this.y, Person.radius, 0, Math.PI * 2, false);
	context.fill();
	context.restore();
}

Person.prototype.drawNumber = function() {
	context.save();
	context.beginPath();
	context.fillStyle = "white";
	context.font = "10px Monaco";
	context.textBaseline = "middle";
	context.globalAlpha = this.state.alpha;

	var message = "" + this.id;
	var metrices = context.measureText(message);
	context.fillText(message, this.x - (metrices.width / 2), this.y);
	context.fill();
	context.restore();
}

Person.prototype.drawStroke = function() {
	switch(this.state.stateFlag) {
		case "active":
		case "linked1":
		case "linked2":

			context.save();
			context.globalAlpha = 0.4;
			context.strokeStyle = "white";
			context.lineWidth = this.state.lineWidth;
			context.beginPath();
			context.arc(this.x, this.y, this.state.radius, 0, Math.PI * 2, false);
			context.stroke();
			context.restore();
			break;
	}
}

Person.prototype.drawLinks = function(a, b) {
	var distx = b.x - a.x;
	var disty = b.y - a.y;
	var angle = Math.atan2(disty, distx);

	var ax = a.x + Person.radius * Math.cos(angle);
	var ay = a.y + Person.radius * Math.sin(angle);
	var bx = a.x + (Person.radius + 5) * Math.cos(angle);
	var by = a.y + (Person.radius + 5) * Math.sin(angle);

	context.save();
	context.lineWidth = 1;
	context.strokeStyle = "white";
	context.globalAlpha = this.state.alpha;

	context.beginPath();
	context.arc(ax, ay, 1, 0, Math.PI * 2, false);
	context.stroke();

	context.lineWidth = 0.8;
	context.beginPath();
	context.moveTo(ax, ay);
	context.lineTo(bx, by);
	context.stroke();

	context.restore();
}

Person.prototype.draw = function() {
	this.drawCircle();
	this.drawStroke();
	this.drawNumber();
	
	var len = this.contacts.length;
	for(var i = 0; i < len; ++i) {
		var a = {
			x: this.x,
			y: this.y,
		};

		var b = {
			x: Graph.persons[this.contacts[i]].x,
			y: Graph.persons[this.contacts[i]].y,
		};

		this.drawLinks(a, b);
	}

	this.update();
}

Person.prototype.isPointInPath = function(mouse) {
	// create path
	var isInPath = false;
	if(Math.abs(mouse.x - this.x) < Person.radius
		&& Math.abs(mouse.y - this.y) < Person.radius) {
		var distx = mouse.x - this.x;
		var disty = mouse.y - this.y;
		var dist = Math.sqrt(distx * distx + disty * disty);

		if(dist < Person.radius)
			isInPath = true;
	}

	return isInPath;
}

Person.prototype.hasContact = function(id) {
	var len = this.contacts.length;
	for(var i = 0; i < len; ++i) {
		if(this.contacts[i] == id)
			return true;
	}

	return false;
}