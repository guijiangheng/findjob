var Network = new function() {
	this.nums = 100;
	this.activeRate = 0.25;
	this.commonRate = 0.60;
	this.inactiveRate = 0.15;
	this.partionRate = 0;
	this.linksPerActive = 15;
	this.linksPerCommon = 10;
	this.linksPerInactive = 5;
	this.persons = null;
	this.links = null;
};

Network.generatePersons = function() {
	Network.persons = [];
	for(var i = 0; i < Network.nums; ++i) {
		var random = Math.random();

		if(random < Network.activeRate) {
			// active person
			Network.persons[i] = {
				flag: "active",
				links: Math.ceil(Math.random() * 6) + Network.linksPerActive - 3,
				contacts: [],
			};
		} else if(random < Network.activeRate + Network.commonRate) {
			// common person
			Network.persons[i] = {
				flag: "common",
				links: Math.ceil(Math.random() * 4) + Network.linksPerCommon - 2,
				contacts: [],
			};
		} else {
			// inactive person
			Network.persons[i] = {
				flag: "inactive",
				links: Math.ceil(Math.random() * 4) + Network.linksPerInactive - 2,
				contacts: [],
			};
		}
	}
};

// 前面70%的很少发生碰撞，为了提高性能可以直接插入
// 万一发生了碰撞陷入死循环，刷新一下即可
// 后面30%发生碰撞的概率原来越大，此后每插一个联系都要
// 判断是否可以插入，能插入就插入，不能就跳过处理下一个
Network.generateLinks = function() {
	var i = 0;
	var majorPart = Math.floor(Network.nums * Network.partionRate);
	Network.links = [];

	for(; i < majorPart; ++i) {
		var personA = Network.persons[i];
		for(var j = personA.contacts.length; j < personA.links;) {
			var num = i + 1 + Math.floor(Math.random() * (Network.nums - i - 1));
			var personB = Network.persons[num];

			if(personB.contacts.length < personB.links
				&& !isInContacts(personA, num)) {
				personA.contacts.push(num);
				personB.contacts.push(i);
				Network.links.push({a: i, b: num});
				++j;
			}
		}
	}

	for(; i < Network.nums; ++i) {
		var personA = Network.persons[i];
		for(var j = personA.contacts.length; j < personA.links;) {
			if(hasOptions(i)) {
				var num = Math.floor(Math.random() * hasOptions.options.length);
				var id = hasOptions.options[num];
				var personB = Network.persons[id];
				personA.contacts.push(id);
				personB.contacts.push(i);
				Network.links.push({a: i, b: id});
				++j;
			} else {
				personA.links = personA.contacts.length;
				break;
			}
		}
	}
};

Network.showContacts = function(person, id) {
	if(table) {
		table.deleteTableFrom(panel);
	}

	table = new Table(2);
	table.addHead("联系人", "通话次数");

	var contacts = person.contacts;
	var len = contacts.length;
	for(var i = 0; i < len; ++i) {
		table.addRow(contacts[i], "2");
	}

	table.setDescription(id + "的通讯录");
	table.setColor("red");
	panel.appendChild(table.domElement);
}

function isInContacts(person, id) {
	for(var i = 0; i < person.contacts.length; ++i) {
		if(id == person.contacts[i]) {
			return true;
		}
	}

	return false;
}

function hasOptions(id) {
	var options = [];
	var personA = Network.persons[id];

	var len = Network.persons.length;
	for(var i = id + 1; i < len; ++i) {
		var personB = Network.persons[i];

		if(personB.contacts.length < personB.links && !isInContacts(personA, i)) {
			options.push(i);
		}
	}

	hasOptions.options = options;

	if(hasOptions.options.length > 0)
		return true;
	else
		return false;
}