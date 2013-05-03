(function() {
	"use strict";

init();

function init() {
	window.addEventListener("load", function() {

		assembleObj();
		addEventListenerToButtons()

	}, false);
}
function assembleObj() {
	Maze.addObserver(MazeView);

	MazeView.setEventHandlers({
		"clickRect": function(rectId, type) {
			clickRect(rectId, type);
		}
	});
}
function addEventListenerToButtons() {
	document.getElementById("btnDraw").addEventListener("click", function(event) {
		clickDraw(event);
	}, false);
	document.getElementById("btnGo").addEventListener("click", function(event) {
		clickGo(event);
	}, false);
	document.getElementById("btnClear").addEventListener("click", function(event) {
		clickClear(event);
	}, false);
}

//--------------------------------------------------
function disabledBtn(id) {
	var btn = document.getElementById(id);
	btn.disabled = true;
	if (id !== "btnDraw") {
		btn.className = "";
	}
}
function enabledBtn(id) {
	var btn = document.getElementById(id);
	btn.disabled = false;
	btn.className = "btn";
}

function clearViewMsg(id) {
	var viewMsg = document.getElementById(id);
	viewMsg.innerText = "";
}
function showMsg(id, msg) {
	var viewMsg = document.getElementById(id);
	viewMsg.innerText = msg;
}

//--------------------------------------------------
function clickDraw() {
	disabledBtn("btnDraw");
	clearViewMsg("viewMsg1");

	var textMaze = document.getElementById("textMaze").value;
	try {
		Maze.createGraph(textMaze);

	} catch(e) {
		showMsg("viewMsg1", e.message);
		enabledBtn("btnDraw");
		return;
	}

	showAreaSVG();
}

//--------------------------------------------------
function clickGo() {
	disabledBtn("btnGo");
	clearViewMsg("viewMsg2");

	var shortestPath;
	try {
		shortestPath = Maze.getShortestPath();
	} catch(e) {
		showMsg("viewMsg2", e.message);
		enabledBtn("btnGo");
		return;
	}

	//debug
//	MazeView.showShortestPath(shortestPath);

	var callback = function() {
		enabledBtn("btnClear");
	};
	MazeView.go(shortestPath, callback);
}

function clickClear() {
	MazeView.clear();

	disabledBtn("btnClear");
	enabledBtn("btnGo");
}

function clickRect(rectId, type) {
//	alert("ノード ID: " +  nodeId + " をクリックしましたね！");
	if (type === "wall") {
		Maze.switchToNode(rectId);
	} else if (type === "node") {
		Maze.switchToWall(rectId);
	}
}

//--------------------------------------------------
function showAreaSVG() {
	disabledBtn("btnClear");

	var hideArea = $("#areaTextarea");
	hideArea.children().fadeOut("normal", function() {
		hideArea.slideUp("normal", function() {
			//hideArea.remove();

			var showArea = $("#areaSVG");
			showArea.slideDown("slow", function() {
				showArea.children().fadeIn("slow", function() {
				});
			});
		});
	});
}

})();
