var MouseMoniter = new function() {
	this.mosueX = 0;
	this.mouseY = 0;
	this.sprites = undefined;
	this.activeSprite = undefined;
};

MouseMoniter.setSprites = function(sprites) {
	MouseMoniter.sprites = sprites;
}

MouseMoniter.listenToMouseEvent = function() {
	canvas.onmousemove = function(e) {
		MouseMoniter.mouseX = e.pageX - canvas.offsetLeft;
		MouseMoniter.mouseY = e.pageY - canvas.offsetTop;
		MouseMoniter.checkMouse();
	}

	canvas.onclick = function(e) {
		if(MouseMoniter.activeSprite) {
			var id = MouseMoniter.activeSprite.id;
			var person = Network.persons[id];
			Network.showContacts(person, id);
		}
	}
}

MouseMoniter.checkMouse = function() {
	var activeSprite = undefined;
	var length = MouseMoniter.sprites.length;

	for(var i = 0; i < MouseMoniter.sprites.length; ++i) {
		if(MouseMoniter.sprites[i].isPointInPath({
			x: MouseMoniter.mouseX,
			y: MouseMoniter.mouseY})) {

			activeSprite = i;
		}
	}

	// MouseIn和MouseOut是同时发生的，注意必须先处理MouseOut，再处理MouseIn
	if(MouseMoniter.activeSprite) {
		if(activeSprite == undefined || MouseMoniter.sprites[activeSprite] != MouseMoniter.activeSprite)
			Graph.onMouseOut();
	}

	if(activeSprite != undefined && MouseMoniter.sprites[activeSprite] != MouseMoniter.activeSprite) {
		MouseMoniter.activeSprite = MouseMoniter.sprites[activeSprite];
		Graph.onMouseIn();
	}

	if(activeSprite == undefined)
		MouseMoniter.activeSprite = undefined;
}