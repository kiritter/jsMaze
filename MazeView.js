var MazeView = function() {
	"use strict";

	var handlers = null;
	var usedShortestPath = null;

	//--------------------------------------------------------------------------------
	var SN = "http://www.w3.org/2000/svg";
	var g1 = null;
	var SVG_WIDTH = 690;
//	var SVG_HEIGHT = 455;
	var SVG_HEIGHT = 0;

	var BLOCK_SIDE = 20;

	var startNodeIdForOctocat;
	var OCTOCAT_OFFSET_X = (44 / 4) * -1;
	var OCTOCAT_OFFSET_Y = (44 / 6) * -2;

	var drawMaze = function(graph, mazeRowNum, wallList, startNodeId, goalNodeId) {
		if (!document.createElementNS) {
			return;
		}

		//------------------------------
		var root = document.getElementById("svgRoot");
		SVG_HEIGHT = mazeRowNum * BLOCK_SIDE + 35;
		drawSvgAndGroup(root);

		//------------------------------
		var wall = null;
		var len = wallList.length;
		for (var i = 0; i < len; i++) {
			wall = wallList[i];
			drawWall(wall.id, wall.border);
		}

		//------------------------------
		var node = null;
		len = graph.length;
		for (var i = 0; i < len; i++) {
			node = graph[i];
			drawNode(node.id, node.border);
		}

		//------------------------------
		drawStartAndGoal(startNodeId, goalNodeId);

		//------------------------------
		startNodeIdForOctocat = startNodeId;
		drawOctocat();
	};

	//--------------------------------------------------------------------------------
	var getPosFromId = function(id) {
		var pos = id.split("_");
		return {
			x: (parseInt(pos[1],10) + 1) * BLOCK_SIDE
			, y: (parseInt(pos[0],10) + 1) * BLOCK_SIDE
		};
	};

	var drawWall = function(id, border) {
		var pos = getPosFromId(id);
		drawRect(id, "wall", pos.x, pos.y, "#228b22", border);
	}
	var drawNode = function(id, border) {
		var pos = getPosFromId(id);
		drawRect(id, "node", pos.x, pos.y, "#ffffcc", border);
		drawText(id + "caption", pos.x, pos.y, "", "#000000", 10);
	}
	var removeWall = function(id) {
		removeRect(id);
	}
	var removeNode = function(id) {
		removeRect(id);
		removeText(id + "caption");
	}

	var resetNodeStyle = function(id, border) {
		changeRectStyle(id, "#ffffcc", border);
	}
	var switchNodeStyleOfShortestPath = function(id) {
		changeRectStyle(id, "#ff8080", false);
	}

	var drawStartAndGoal = function(startNodeId, goalNodeId) {
		document.getElementById(startNodeId + "caption").textContent = "S";
		document.getElementById(goalNodeId + "caption").textContent = "G";
	};

	var drawOctocat = function() {
		var elem = document.getElementById("octocat");
		if (elem !== null) {
			g1.removeChild(elem);
		}
		var pos = getPosFromId(startNodeIdForOctocat);
		drawImage("octocat", pos.x, pos.y, 44, "img/bat_128.png");
	};
	var moveOctocat = function(id) {
		var pos = getPosFromId(id);
		moveImage("octocat", pos.x, pos.y);
	};

	//--------------------------------------------------------------------------------
	var setAttrs = function(elem, attrs) {
		for(var key in attrs) {
			var value = attrs[key];
			elem.setAttribute(key, value);
		}
	};

	var drawSvgAndGroup = function(root) {
		var elem = document.createElementNS(SN, "svg");
		var attrs = {
			"width": SVG_WIDTH
			, "height": SVG_HEIGHT
			, "viewBox": "-5 0 " + SVG_WIDTH + " " + SVG_HEIGHT
		};
		setAttrs(elem, attrs);
		root.appendChild(elem);

		g1 = document.createElementNS(SN, "g");
		elem.appendChild(g1);
	};

	//------------------------------
	var drawRect = function(id, type, posX, posY, color, border) {
		var elem = document.createElementNS(SN, "rect");
		var attrs = {
			"id": id
			, "x": posX
			, "y": posY
			, "width": BLOCK_SIDE
			, "height": BLOCK_SIDE
		};
		setAttrs(elem, attrs);

		if (border === false) {
			elem.setAttribute("style", "fill:" + color + "; stroke:none; cursor:pointer;");
		} else {
			elem.setAttribute("style", "fill:" + color + "; stroke:none;");
		}

		if (border === false) {
			elem.addEventListener("click", function(event) {
				handlers.clickRect(event.currentTarget.id, type);
			}, false);
		}
		g1.appendChild(elem);
	};
	var removeRect = function(id) {
		var elem = document.getElementById(id);
		g1.removeChild(elem);
	};
	var changeRectStyle = function(id, color, border) {
		var elem = document.getElementById(id);
		if (border === false) {
			elem.setAttribute("style", "fill:" + color + "; stroke:none; cursor:pointer;");
		} else {
			elem.setAttribute("style", "fill:" + color + "; stroke:none;");
		}
	};

	//------------------------------
	var drawText = function(id, posX, posY, Caption, fontColor, fontSize) {
		var elem = document.createElementNS(SN, "text");
		var attrs = {
			"id": id
			, "fill": fontColor
			, "font-size": fontSize
			, "x": parseInt(posX,10) + (BLOCK_SIDE/2)
			, "y": parseInt(posY,10) + (BLOCK_SIDE/3*2)
			, "text-anchor": "middle"
		};
		setAttrs(elem, attrs);
		elem.textContent = Caption;
		g1.appendChild(elem);
	};
	var removeText = function(id) {
		var elem = document.getElementById(id);
		g1.removeChild(elem);
	};

	//------------------------------
	var drawImage = function(id, posX, posY, size, url) {
		var elem = document.createElementNS(SN, "image");
		var attrs = {
			"id": id
			, "x": posX + OCTOCAT_OFFSET_X
			, "y": posY + OCTOCAT_OFFSET_Y
			, "width": size
			, "height": size
		};
		setAttrs(elem, attrs);
		elem.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", url);
		g1.appendChild(elem);
	};
	var moveImage = function(id, posX, posY) {
		var elem = document.getElementById(id);
		var attrs = {
			"x": posX + OCTOCAT_OFFSET_X
			, "y": posY + OCTOCAT_OFFSET_Y
		};
		setAttrs(elem, attrs);
	};

	//------------------------------
	var drawCoverForDisabled = function() {
		var elem = document.createElementNS(SN, "rect");
		var attrs = {
			"id": "cover"
			, "style": "fill:#000000 ;opacity:0;"
			, "x": 0
			, "y": 0
			, "width": SVG_WIDTH
			, "height": SVG_HEIGHT
		};
		setAttrs(elem, attrs);
		g1.appendChild(elem);
	};
	var removeCoverForDisabled = function() {
		var elem = document.getElementById("cover");
		g1.removeChild(elem);
	};


	//--------------------------------------------------------------------------------
	var switchToNode = function(wallId) {
		removeWall(wallId);
		drawNode(wallId, false);
	};

	//--------------------------------------------------------------------------------
	var switchToWall = function(nodeId) {
		removeNode(nodeId);
		drawWall(nodeId, false);
	};

	//--------------------------------------------------------------------------------
	var go = function(shortestPath, callback) {
		drawCoverForDisabled();
		drawOctocat();

		usedShortestPath = shortestPath;

		var drawUpdate = function(i) {
			switchNodeStyleOfShortestPath(shortestPath[i].id);
			moveOctocat(shortestPath[i].id);
		};

		var i = shortestPath.length - 1;
		var timerId = setInterval(function() {
			if (i < 0) {
				if (timerId !== null) {
					clearInterval(timerId);
					timerId = null;
					callback();
				}
				return;
			}
			drawUpdate(i);
			i--;
		}, 150);
	};

	//--------------------------------------------------------------------------------
	var clear = function() {
		var len = usedShortestPath.length;
		for (var i = 0; i < len; i++) {
			resetNodeStyle(usedShortestPath[i].id, usedShortestPath[i].border);
		}

		drawOctocat();
		removeCoverForDisabled();
	};

	//--------------------------------------------------------------------------------
	//debug
	var showShortestPath = function(shortestPath) {
		var node = null;
		var minCost = null;
		var nodeCaption = null;
		for (var i = 0; i < shortestPath.length; i++) {
			node = shortestPath[i];
			minCost = "" + node.minCost;
			document.getElementById(node.id + "caption").textContent = minCost;
		}
	};

	//--------------------------------------------------------------------------------
	return {
		setEventHandlers: function(obj) {
			handlers = obj;
		}

		, updateForCreate: function(graph, mazeRowNum, wallList, startNodeId, goalNodeId) {
			drawMaze(graph, mazeRowNum, wallList, startNodeId, goalNodeId);
		}

		, updateForSwitchToNode: function(wallId) {
			switchToNode(wallId);
		}

		, updateForSwitchToWall: function(nodeId) {
			switchToWall(nodeId);
		}

		, go: function(shortestPath, callback) {
			go(shortestPath, callback);
		}

		, clear: function() {
			clear();
		}

		//debug
		, showShortestPath: function(shortestPath) {
			showShortestPath(shortestPath);
		}

	};

}();
