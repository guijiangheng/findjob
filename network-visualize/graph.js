var Graph = {};

Graph.generateGraph = function(persons, links) {
	Graph.level = 1;
	Graph.links = [];
	Graph.persons = [];
	Graph.nums = persons.length;

	var len = Graph.nums;
	for(var i = 0; i < len; ++i) {
		var person = new Person();

		person.id = i;
		person.flag = persons[i].flag;
		person.contacts = persons[i].contacts;
		person.x = Math.random() * canvas.width;
		person.y = Math.random() * canvas.height;

		Graph.persons[i] = person;
	}

	var len = links.length;
	for(var i = 0; i < len; ++i) {
		Graph.links[i] = new Link(Graph.persons[links[i].a],
			Graph.persons[links[i].b]);
	}
}

Graph.onMouseIn = function() {
	Graph.activePerson = MouseMoniter.activeSprite;
	Graph.findPersonsLinked(Graph.level);

	for(var i = 0; i < Graph.nums; ++i) {
		Graph.persons[i].setState("fadeOut");
	}

	var len = Graph.links.length;
	for(var i = 0; i < len; ++i) {
		Graph.links[i].setState("hidden");
	}

	var len = Graph.personsLinked.length;
	for(var i = 0; i < len; ++i) {
		var person = Graph.personsLinked[i];
		Graph.persons[person.id].setState("linked" + person.level);
		Graph.pathLinked[i].setState("linked");
	}

	Graph.activePerson.setState("active");
}

Graph.onMouseOut = function() {
	Graph.activePerson.setState("normal");

	for(var i = 0; i < Graph.nums; ++i) {
		Graph.persons[i].setState("fadeIn");
	}

	var len = Graph.links.length;
	for(var i = 0; i < len; ++i) {
		Graph.links[i].setState("normal");
	}

	var len = Graph.personsLinked.length;
	for(var i = 0; i < len; ++i) {
		var person = Graph.personsLinked[i];
		Graph.persons[person.id].setState("normal");
	}

	Graph.personsLinked = null;
	Graph.pathLinked = null;
}

Graph.findPersonsLinked = function() {
	var flags = [];
	flags[Graph.activePerson.id] = -1;
	findLinked(Graph.level, Graph.activePerson.id);

	Graph.personsLinked = [];
	for(var i = 0; i < Graph.nums; ++i) {
		if(flags[i] != undefined && flags[i] != -1) {
			Graph.personsLinked.push(flags[i]);
		}
	}

	Graph.pathLinked = [];
	var len = Graph.personsLinked.length;
	for(var i = 0; i < len; ++i) {
		var a = Graph.personsLinked[i].from;
		var b = Graph.personsLinked[i].id;
		
		Graph.pathLinked.push(Graph.findLink(a, b));
	}

	function findLinked(level, start) {
		if(level > 0) {
			var levelPersons = [];
			var person = Graph.persons[start];

			var len = person.contacts.length;
			for(var i = 0; i < len; ++i) {
				var id = person.contacts[i];
				if(flags[id] == undefined) {
					flags[id] = {
						id: id,
						from: start,
						level: Graph.level - level + 1,
					}

					levelPersons.push(id);
				}
			}

			var len = levelPersons.length;
			for(var i = 0; i < len; ++i) {
				findLinked(level - 1, levelPersons[i]);
			}
		}
	}
}

Graph.findShortestPath = function(from, to) {
	var flag = [];

	if(Graph.startToSearch != from) {
		Graph.startToSearch = from;
		Graph.dist = [];
		Graph.path = [];

		dijkstra(from);
	}

	// set pathFind before offShow
	if(Graph.pathFind) {
		var len = Graph.pathFind.length;
		for(var i = 0; i < len - 1; ++i) {
			Graph.findLink(Graph.pathFind[i], Graph.pathFind[i + 1]).setState("offShow");
		}
	}

	findPath(to);

	function dijkstra(from) {
		var person = Graph.persons[from];

		for(var i = 0; i < Graph.nums; ++i) {
			flag[i] = 0;
			Graph.path[i] = -1;
			Graph.dist[i] = Number.MAX_VALUE;
		}

		var len = person.contacts.length;
		for(var i = 0; i < len; ++i) {
			Graph.dist[person.contacts[i]] = 1;
			Graph.path[person.contacts[i]] = from;
		}

		flag[from] = 1;

		for(var i = 0; i < Graph.nums - 1; ++i) {
			var k, min = Number.MAX_VALUE;

			for(var j = 0; j < Graph.nums; ++j) {
				if(flag[j] == 0 && Graph.dist[j] < min) {
					k = j;
					min = Graph.dist[i];
				}
			}

			flag[k] = 1;
			for(var j = 0; j < Graph.nums; ++j) {
				if(flag[j] == 0) {
					var distkj;
					var personk = Graph.persons[k];

					if(!personk.hasContact(j)) {
						distkj = Number.MAX_VALUE;
					} else {
						distkj = 1;
					}

					if(Graph.dist[k] + distkj < Graph.dist[j]) {
						Graph.dist[j] = Graph.dist[k] + distkj;
						Graph.path[j] = k;
					}
				}
			}
		}
	}

	function findPath(dest) {
		var path = [];
		while(Graph.path[dest] != -1) {
			path.push(dest);
			dest = Graph.path[dest];
		}

		path.push(from);

		Graph.pathFind = [];
		var len = path.length;
		for(var i = 0; i < len; ++i) {
			Graph.pathFind[i] = path[len - i - 1];
		}
	}
}

Graph.showPath = function(from, to) {
	Graph.findShortestPath(from, to);

	var len = Graph.pathFind.length - 1;
	for(var i = 0; i < len; ++i) {
		Graph.findLink(Graph.pathFind[i], Graph.pathFind[i + 1]).setState("onShow");
	}
}

Graph.findLink = function(a, b) {
	var len = Graph.links.length;
	for(var i = 0; i < len; ++i) {
		var link = Graph.links[i];
		var _a = link.personA.id;
		var _b = link.personB.id;

		if(_a == a && _b == b) {
			return link;
		} else if(_a == b && _b == a) {
			var stateFlag = link.stateFlag;
			var temp = new Link(link.personB, link.personA);
			temp.stateFlag = stateFlag;
			Graph.links[i] = temp;

			return temp;
		}
	}
}

Graph.draw = function() {
	var len = Graph.links.length;
	for(var i = 0; i < len; ++i) {
		Graph.links[i].draw();
	}

	for(var i = 0; i < Graph.nums; ++i) {
		Graph.persons[i].draw();
	}
}
