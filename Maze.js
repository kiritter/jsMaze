var Maze = function() {
	"use strict";

	//--------------------------------------------------------------------------------
	var observers = [];

	var addObserver = function(observer) {
		observers.push(observer);
	};
	var notifyObserversOfCreate = function(graph, wallList, startNodeId, goalNodeId) {
		var len = observers.length;
		for (var i = 0; i < len; i++) {
			observers[i].updateForCreate(graph, wallList, startNodeId, goalNodeId);
		}
	};
	var notifyObserversOfSwitchToNode = function(wallId) {
		var len = observers.length;
		for (var i = 0; i < len; i++) {
			observers[i].updateForSwitchToNode(wallId);
		}
	};
	var notifyObserversOfSwitchToWall = function(nodeId) {
		var len = observers.length;
		for (var i = 0; i < len; i++) {
			observers[i].updateForSwitchToWall(nodeId);
		}
	};

	//--------------------------------------------------------------------------------
	var LINE_SEPARATOR = "\n";
	var MAX_ROW_NUM = 21;
	var MAX_COL_NUM = 32;

	var PATH = "　";	//U+3000 : IDEOGRAPHIC SPACE = UTF-16LE:0x3000 (, UTF-8:0xE38080)
	var WALL = "■";	//U+25A0 : BLACK SQUARE = UTF-16LE:0x25A0 (, UTF-8:0xE296A0)

	function Node() {
		this.id = "";
		this.border = false;
		this.edges = [];
	}
	function Edge() {
		this.id = "";
		this.cost = 0;
		this.nextNodeId = "";
	}
	function Wall() {
		this.id = "";
		this.border = false;
	}

	var textMazeArray = null;
	var heightMaze = 0;
	var widthMaze = 0;

	//Node
	var graph = [];
	var graphHash = {};
	var shortestPath = [];

	var startNodeId = "";
	var goalNodeId = "";

	//Wall
	var wallList = [];

	//--------------------------------------------------------------------------------
	var convertObjectToJSON = function(object) {
		var jsonText = JSON.stringify(object, null, '\t');
		return jsonText;
	}

	//--------------------------------------------------------------------------------
	var validate = function(textMaze) {
		var errMsg = "";

		if (!textMaze) {
			errMsg = "invalid";
			return errMsg;
		}

		textMaze = textMaze.replace(new RegExp(LINE_SEPARATOR + "+$", "g"), "");

		var charNum = MAX_ROW_NUM * (MAX_COL_NUM + LINE_SEPARATOR.length);
		if (textMaze.length > charNum) {
			errMsg = "Rows must be '<= " + MAX_ROW_NUM + "' and Cols must be '<= " + MAX_COL_NUM + "'.";
			return errMsg;
		}

		textMazeArray = textMaze.split(LINE_SEPARATOR);
		heightMaze = textMazeArray.length;

		if (heightMaze > MAX_ROW_NUM) {
			errMsg = "Rows must be '<= " + MAX_ROW_NUM + "'.";
			return errMsg;
		}

		var row;
		var beforeWidth;
		var width;
		var c;
		for (var i = 0; i < heightMaze; i++) {
			row = textMazeArray[i];
			width = row.length;
			if (width > MAX_COL_NUM) {
				errMsg = "Cols must be '<= " + MAX_COL_NUM + "'.";
				return errMsg;
			}
			if (i !== 0 && i !== heightMaze-1 && width !== beforeWidth) {
				errMsg = "Cols must be the same length.";
				return errMsg;
			}
			beforeWidth = width;
			for (var j = 0; j < width; j++) {
				c = row.charAt(j);
				if (c !== PATH && c !== WALL) {
					errMsg = "Chars must be '" + PATH + "' or '" + WALL + "'.";
					return errMsg;
				}
			}
		}

		widthMaze = textMazeArray[0].length;

		if (findStartAndGoal() === false) {
			errMsg = "Start or Goal is not found.";
			return errMsg;
		}

		return errMsg;
	}

	//--------------------------------------------------------------------------------
	var findStartAndGoal = function() {
		var c;
		var sg = {
			sId : ""
			, gId : ""
		};
		var ret = false;

		//Left
		for (var i = 0; i < heightMaze; i++) {
			c = textMazeArray[i].charAt(0);
			if (c === PATH) {
				ret = setSg(sg, "" + i + "_" + "0");
				if (ret === true) {
					return true;
				}
			}
		}
		//Top
		for (var j = 0; j < widthMaze; j++) {
			c = textMazeArray[0].charAt(j);
			if (c === PATH) {
				ret = setSg(sg, "" + "0" + "_" + j);
				if (ret === true) {
					return true;
				}
			}
		}
		//Bottom
		for (var j = 0; j < widthMaze; j++) {
			c = textMazeArray[heightMaze-1].charAt(j);
			if (c === PATH) {
				ret = setSg(sg, "" + (heightMaze-1) + "_" + j);
				if (ret === true) {
					return true;
				}
			}
		}
		//Right
		for (var i = 0; i < heightMaze; i++) {
			c = textMazeArray[i].charAt(widthMaze-1);
			if (c === PATH) {
				ret = setSg(sg, "" + i + "_" + (widthMaze-1));
				if (ret === true) {
					return true;
				}
			}
		}

		return false;
	};
	var setSg = function(sg, id) {
		if (sg.sId === "") {
			sg.sId = id;
			return false;
		} else {
			sg.gId = id;
			startNodeId = sg.sId;
			goalNodeId = sg.gId;
			return true;
		}
	};

	//--------------------------------------------------------------------------------
	var createGraph = function() {
		var c = "";
		var node = null;
		var edge = null;
		var wall = null;

		for (var i = 0; i < heightMaze; i++) {
			for (var j = 0; j < widthMaze; j++) {
				c = textMazeArray[i].charAt(j);

				if (c === PATH) {
					node = new Node();
					node.id = "" + i + "_" + j;

					if (i === 0 || i === heightMaze-1 || j === 0 || j === widthMaze-1) {
						node.border = true;
					} else {
						node.border = false;
					}

					modifyEdges("create", node, i, j);

					graph.push(node);
					graphHash[node.id] = node;

				} else if (c === WALL) {
					wall = new Wall();
					wall.id = "" + i + "_" + j;

					if (i === 0 || i === heightMaze-1 || j === 0 || j === widthMaze-1) {
						wall.border = true;
					} else {
						wall.border = false;
					}

					wallList.push(wall);
				}
			}
		}
	};

	var modifyEdges = function(mode, selfNode, i, j) {
		var node = null;
		var edge = null;
		//Up
		if (i > 0) {
			if (textMazeArray[i-1].charAt(j) === PATH) {
				if (mode === "create") {
					edge = createEdge(i-1, j);
					selfNode.edges.push(edge);
				} else if (mode === "add") {
					edge = createEdge(i, j);
					node = graphHash["" + (i-1) + "_" + j];
					node.edges.push(edge);
				} else {
					node = graphHash["" + (i-1) + "_" + j];
					removeEdge(node.edges, i, j);
				}
			}
		}
		//Down
		if (i < heightMaze-1) {
			if (textMazeArray[i+1].charAt(j) === PATH) {
				if (mode === "create") {
					edge = createEdge(i+1, j);
					selfNode.edges.push(edge);
				} else if (mode === "add") {
					edge = createEdge(i, j);
					node = graphHash["" + (i+1) + "_" + j];
					node.edges.push(edge);
				} else {
					node = graphHash["" + (i+1) + "_" + j];
					removeEdge(node.edges, i, j);
				}
			}
		}
		//Left
		if (j > 0) {
			if (textMazeArray[i].charAt(j-1) === PATH) {
				if (mode === "create") {
					edge = createEdge(i, j-1);
					selfNode.edges.push(edge);
				} else if (mode === "add") {
					edge = createEdge(i, j);
					node = graphHash["" + i + "_" + (j-1)];
					node.edges.push(edge);
				} else {
					node = graphHash["" + i + "_" + (j-1)];
					removeEdge(node.edges, i, j);
				}
			}
		}
		//Right
		if (j < widthMaze-1) {
			if (textMazeArray[i].charAt(j+1) === PATH) {
				if (mode === "create") {
					edge = createEdge(i, j+1);
					selfNode.edges.push(edge);
				} else if (mode === "add") {
					edge = createEdge(i, j);
					node = graphHash["" + i + "_" + (j+1)];
					node.edges.push(edge);
				} else {
					node = graphHash["" + i + "_" + (j+1)];
					removeEdge(node.edges, i, j);
				}
			}
		}
	};
	var createEdge = function(i, j) {
		var edge = new Edge();
		edge.id = "to" + i + "_" + j;
		edge.cost = 1;
		edge.nextNodeId = "" + i + "_" + j;
		return edge;
	};
	var removeEdge = function(edges, i, j) {
		var len = edges.length;
		var id = "to" + i + "_" + j;
		for (var i = 0; i < len; i++) {
			if (edges[i].id === id) {
				edges.splice(i, 1);
				break;
			}
		}
	};

	//--------------------------------------------------------------------------------
	var switchToNode = function(wallId) {
		var id = wallId.split("_");
		id[0] = parseInt(id[0], 10);
		id[1] = parseInt(id[1], 10);

		//------------------------------
		var row = textMazeArray[id[0]];
		var newrow = row.substring(0, id[1]) + PATH + row.substring(id[1]+1, row.length);
		textMazeArray[id[0]] = newrow;

		//------------------------------
		var len = wallList.length;
		for (var i = 0; i < len; i++) {
			if (wallList[i].id === wallId) {
				wallList.splice(i, 1);
				break;
			}
		}

		//------------------------------
		var node = new Node();
		node.id = wallId;
		node.border = false;

		modifyEdges("create", node, id[0], id[1]);
		modifyEdges("add", null, id[0], id[1]);

		graph.push(node);
		graphHash[node.id] = node;

		//------------------------------
		if (shortestPath.length !== 0) {
			shortestPath = [];
		}
	};

	//--------------------------------------------------------------------------------
	var switchToWall = function(nodeId) {
		var id = nodeId.split("_");
		id[0] = parseInt(id[0], 10);
		id[1] = parseInt(id[1], 10);

		//------------------------------
		var row = textMazeArray[id[0]];
		var newrow = row.substring(0, id[1]) + WALL + row.substring(id[1]+1, row.length);
		textMazeArray[id[0]] = newrow;

		//------------------------------
		var wall = new Wall();
		wall.id = nodeId;
		wall.border = false;
		wallList.push(wall);

		//------------------------------
		var len = graph.length;
		for (var i = 0; i < len; i++) {
			if (graph[i].id === nodeId) {
				graph.splice(i, 1);
				break;
			}
		}

		delete graphHash[nodeId];

		modifyEdges("del", null, id[0], id[1]);

		//------------------------------
		if (shortestPath.length !== 0) {
			shortestPath = [];
		}
	};

	//--------------------------------------------------------------------------------
	var dijkstra = function() {
		var INF_COST = 99999;

		var len = graph.length;
		var node = null;
		for (var i = 0; i < len; i++) {
			node = graph[i];
			if (node.id === startNodeId) {
				node.minCost = 0;
				node.fromNodeId = startNodeId;
				node.fixFlg = false;

			} else {
				node.minCost = INF_COST;
				node.fromNodeId = "-";
				node.fixFlg = false;
			}
		}

		infiniteLoop:
		while (true) {
			var minCost = INF_COST;
			var nodeWithMinCost = null;
			len = graph.length;
			for (var i = 0; i < len; i++) {
				if (graph[i].fixFlg === true) {
					continue;
				}
				if (graph[i].minCost < minCost) {
					minCost = graph[i].minCost;
					nodeWithMinCost = graph[i];
				}
			}

			if (nodeWithMinCost === null) {
				throw new Error("The path that reaches the goal is not found.");
			}

			nodeWithMinCost.fixFlg = true;
			if (nodeWithMinCost.id === goalNodeId) {
				break infiniteLoop;
			}

			var nextNode = null;
			var edge = null;
			len = nodeWithMinCost.edges.length;
			for (var i = 0; i < len; i++) {
				edge = nodeWithMinCost.edges[i];
				nextNode = graphHash[edge.nextNodeId];

				if (nextNode.fixFlg === true) {
					continue;
				}
				if (nodeWithMinCost.minCost + edge.cost < nextNode.minCost) {
					nextNode.minCost = nodeWithMinCost.minCost + edge.cost;
					nextNode.fromNodeId = nodeWithMinCost.id;
				}
			}
		}
	};

	var createShortestPath = function() {
		shortestPath = [];

		var node = null;
		var fromNodeId = "";

		node = graphHash[goalNodeId];
		shortestPath.push(node);
		fromNodeId = node.fromNodeId;

		infiniteLoop:
		while (true) {
			node = graphHash[fromNodeId];
			shortestPath.push(node);
			fromNodeId = node.fromNodeId;
			if (node.id === startNodeId) {
				break infiniteLoop;
			}
		}
	}

	//--------------------------------------------------------------------------------
	return {
		addObserver: function(observer) {
			addObserver(observer);
		}

		, createGraph: function(textMaze) {
			var errMsg = validate(textMaze);
			if (errMsg !== "") {
				throw new Error("This maze is invalid : " + errMsg);
			}

			createGraph();
			notifyObserversOfCreate(graph, wallList, startNodeId, goalNodeId);
		}

		, getShortestPath: function() {
			if (shortestPath.length !== 0) {
				return shortestPath;
			}

			dijkstra();
			createShortestPath();

			return shortestPath;
		}

		, switchToNode: function(wallId) {
			switchToNode(wallId);
			notifyObserversOfSwitchToNode(wallId);
		}

		, switchToWall: function(nodeId) {
			switchToWall(nodeId);
			notifyObserversOfSwitchToWall(nodeId);
		}

	};

}();
