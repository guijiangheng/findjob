var Table = function(numofColumn) {
	this.description;
	this.numofColumn = numofColumn;
	this.domElement = document.createElement("div");
	this.domElement.className = "table-wrapper";

	if(!Table.initialized) {
		var style = document.createElement("style");
		style.type = "text/css";
		style.innerHTML = ".table-description {padding: 10px 20px; padding-left: 5px; font-weight: 900; color:white}"
			+ ".table-wrapper{margin: 0 auto; padding: 10px; max-width: 500px; color: black}"
			+ ".table-table{margin: 0 0 40px 0; width: 100%; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); display: table}"
			+ ".table-row:nth-of-type(odd){background: #e9e9e9}"
			+ ".table-row.table-header{font-weight: 900; color: white;}"
			+ ".table-row{ display: table-row; background: #f6f6f6;}"
			+ ".table-cell{padding: 6px 10px; display: table-cell; text-align: center; font: 10px Monaco}"
			+ ".table-row.table-green{background: #27ae60}"
			+ ".table-row.table-blue{background: #2980b9}"
			+ ".table-row.table-red{background: #ea6153;}"
			+ ".table-row.table-black{background: #3a3a3a}";

		document.getElementsByTagName("head")[0].appendChild(style);
		Table.initialized = true;
	}

	var table = document.createElement("div");
	table.className = "table-table";
	this.domElement.appendChild(table);

	var head;
	this.addHead = function() {
		head = document.createElement("div");
		head.className = "table-row table-header table-green";
		table.appendChild(head);

		for(var i = 0; i < this.numofColumn; ++i) {
			var cell = document.createElement("div");
			cell.className = "table-cell";
			cell.innerHTML = this.addHead.arguments[i];
			head.appendChild(cell);
		}
	};

	this.addRow = function() {
		var row = document.createElement("div");
		row.className = "table-row";
		table.appendChild(row);

		for(var i = 0; i < this.numofColumn; ++i) {
			var cell = document.createElement("div");
			cell.className = "table-cell";
			cell.innerHTML = this.addRow.arguments[i];
			row.appendChild(cell);
		}
	};

	this.clearTable = function() {
		while(table.childNodes.length > 1) {
			table.removeChild(table.childNodes[1]);
		}
	};

	this.deleteTableFrom = function(panel) {
		panel.removeChild(this.domElement);
	};

	this.setDescription = function(message) {
		if(this.description == undefined) {
			this.description = document.createElement("div");
			this.description.className = "table-description";
			this.description.innerHTML = message;
			this.domElement.insertBefore(this.description, table);
		} else {
			this.description.innerHTML = message;
		}
	};

	this.setVisible = function(visible) {
		if(visible) {
			this.domElement.style.display = "block";
		} else {
			this.domElement.style.display = "none";
		}
	};

	this.setColor = function(color) {
		if(head != undefined) {
			switch(color) {
				case "green":
					head.className = "table-header table-row table-green";
					break;
				case "red":
					head.className = "table-header table-row table-red";
					break;
				case "blue":
					head.className = "table-header table-row table-blue";
					break;
				case "black":
					head.className = "table-header table-row table-black";
					break;
			}
		}
	};
};

// 静态成员，确保样式表只添加一次
Table.initialized = false;