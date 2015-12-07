var canvas =document.getElementById("boardCanvas");
var ctx = canvas.getContext("2d");


var Colors = {
	green: 'green',
	red: 'red',
	blue: 'blue',
	pink: 'black',
	orange: 'orange',
	yellow: 'yellow',

	randomColor: function() {
		var choosed = Math.floor((Math.random() * 6));
		var colorMap = [this.green, this.red, this.blue, this.pink, this.orange, this.yellow];
		return colorMap[choosed];
	}
}

var ItemTypes = {
	EMPTY: 0,
	BALL: 1,
}

var Ball = {
	radix: 20,
	color: Colors.green,
	x: 0,
	y: 0,

	draw: function (ctx) {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radix,0, 2* Math.PI, true);
		ctx.closePath();
		ctx.fillStyle = this.color;
		ctx.fill();
	}
}

var ScoreBoard = {

	curScoreSelector: '#curScore',
	highScoreSelector: '#highestScore',

	curScore: 0,
	highestScore: 0,

	restart: function() {
		this.curScore = 0;
		this.showScore();
	},

	addScore: function(score) {
		this.curScore += score;
		this.updateHighestScore(this.curScore);
		this.showScore();
	},

	updateHighestScore: function(score) {
		this.highestScore = Math.max(score, this.highestScore);
	},

	showScore: function() {
		console.log(this.curScore, this.highestScore);
		$(this.curScoreSelector).text(this.curScore);
		$(this.highScoreSelector).text(this.highestScore);
	}

}

var GameBoard = {
	rows: 8,
	cols: 8,
	backgroundColor: '#F1FAD4',
	blockWidth: 50,
	blockHeight: 50,
	lineWidth: 1,
	strokeStyle: '#969C87',

	data: [],

	// mouse select ball
	startIndex: null,
	endIndex: null,

	init: function(ctx) {
		this.ctx = ctx;
		var data = [];
		for(var i =0; i<this.rows; ++i) {
			var row = [];
			for(var j=0;j<this.cols; ++j) {
				row.push(ItemTypes.EMPTY);
			}
			data.push(row);
		}
		this.data = data;
		this.startIndex = null;

	},

	getEmptyCells: function() {
		var emptyCells = [];
		for(var i=0;i<this.rows; ++i) {
			for(var j=0;j<this.cols; ++j) {
				if(this.isEmpty(i,j)) {
					emptyCells.push([i,j]);
				}
			}
		}
		return emptyCells;
	},

	getRandomCells: function(n) {
		var emptyCells = this.getEmptyCells();
		if(emptyCells.length <= n) {
			return emptyCells;
		}
		else {
			var randomCells = getRandomSubarray(emptyCells, n);
			return randomCells;
		}
	},

	putBall: function(row, col, color) {
		if (this.isEmpty(row,col)) {
			var ball = Object.create(Ball);
			var xy = this.getXY(row, col);
			ball.x =xy[0];
			ball.y = xy[1];
			ball.color = color;
			this.data[row][col] = ball;	
			console.log("put ball", ball);
		}
	},

	putRandomBalls: function(n) {
		var cells = this.getRandomCells(n);
		for(var i=0;i<cells.length; ++i) {
			var color = Colors.randomColor();
			var cell = cells[i];
			this.putBall(cell[0],cell[1], color);
		}
	},

	// mouse click 
	selectBall: function(row, col) {
		console.log("row:" + row, "col:"+ col);
		if (this.isEmpty(row, col)) {
			return false; 
		}
		else {
			// record select ball
			this.startIndex = [row, col];
			this.draw();
			return true;
		}
	},

	getCellIndex: function(e) {
		var canvas = this.canvas;
		//console.log(canvas);
		var pageX = e.pageX;
		var pageY = e.pageY;
		var loc = getPointOnCanvas(canvas, pageX, pageY);
		var x = loc[0];
		var y = loc[1];
		var cellIndex = [Math.floor((y-1)/this.blockHeight), Math.floor((x-1)/this.blockWidth)];
		console.log(cellIndex);
		return cellIndex;
	},

	getBall: function(row, col) {
		return this.data[row][col];
	},

	isValidCell: function(row, col) {
		return row>=0 && row <this.rows && col >=0 && col<this.cols;
	},

	// test if there are path between two cells
	// use dfs search
	isConnected: function(fromRow, fromCol, toRow, toCol) {
		var deltas = [[0,-1],[-1,0],[0,1],[1,0]];
		var visited = [];
		for(var i=0; i<this.rows; ++i) {
			var tmp = [];
			for(var j=0; j<this.cols; ++j) {
				tmp.push(false);
			}
			visited.push(tmp);
		}
		var stack = [];
		stack.push([fromRow, fromCol]);
		while(stack.length > 0) {
			var curCell = stack.pop();
			visited[curCell[0]][curCell[1]] = true;
			for(var d=0;d<deltas.length;++d) {
				var delta = deltas[d];
				var adjCell = [curCell[0]+delta[0], curCell[1] + delta[1]];
				if (this.isValidCell(adjCell[0],adjCell[1]) && visited[adjCell[0]][adjCell[1]] == false) {
					if(adjCell[0] == toRow && adjCell[1] == toCol) {
						// connected!
						return true;
					}
					if (this.isEmpty(adjCell[0], adjCell[1])) {
						stack.push(adjCell);
					}
				}
			}
		}
		return false;
	},

	clearBall: function(row, col) {
		console.log('clear:', row, col);
		this.data[row][col] = ItemTypes.EMPTY;
	},

	doMoveBall: function(fromRow, fromCol, toRow, toCol) {
		// TODO:
		var ball = this.getBall(fromRow, fromCol);
		this.putBall(toRow, toCol, ball.color);
		this.clearBall(fromRow, fromCol);
		// clear startindex !!!
		this.startIndex = null;
	},

	moveBall: function(toRow, toCol) {
		var startIndex = this.startIndex;
		if (startIndex == null) {

		}
		else if (toRow == startIndex[0] && toCol == startIndex[1]) {
			console.log('not moved!');
		}
		else if(this.isEmpty(toRow, toCol)) {
			// do move
			var fromRow = startIndex[0];
			var fromCol = startIndex[1];
			if(this.isConnected(fromRow, fromCol, toRow, toCol)) {
				this.doMoveBall(fromRow, fromCol, toRow, toCol);
				// 
				var score = this.clearAllignCells();
				ScoreBoard.addScore(score);
				// update score
				if(this.isGameOver()) {
					// show game over

				}
				else {
					this.draw();
					this.repeat();
				}
			}
			else {
				console.log('no path!');
				alert('No path between these two grid!');
			}
		}
		else {
			console.log('some ball is already here');
		}
	},

	// get center position of cell
	getXY: function(row, col) {
		var y = row * this.blockHeight;
		var x = col * this.blockWidth;
		return [x + parseInt(this.blockWidth/2), y + parseInt(this.blockHeight/2)];
	},

	isEmpty: function(row, col) {
		return this.data[row][col] == ItemTypes.EMPTY;
	},

	draw: function() {
		console.log("redraw");
		this.drawBackGround(this.ctx);
		this.drawBalls(this.ctx);
		this.drawSelect();
	},

	// when select a ball
	drawSelect: function() {
		console.log("startIdex",this.startIndex);
		var cell = this.startIndex;
		if (cell != null) {

			var xy = this.getXY(cell[0], cell[1]);
			var X = xy[0];
			var Y = xy[1];
			console.log("X,Y",X,Y);
			var ctx = this.ctx;
			ctx.beginPath();
			ctx.strokeStyle = "black";
			// left top corner
			ctx.moveTo(X-22,Y-12);
			ctx.lineTo(X-22,Y-22);
			ctx.lineTo(X-12,Y-22);

			// right top corner
			ctx.moveTo(X+12, Y-22);
			ctx.lineTo(X+22, Y-22);
			ctx.lineTo(X+22, Y-12);

			// right bottom corner
			ctx.moveTo(X+22, Y+12);
			ctx.lineTo(X+22, Y+22);
			ctx.lineTo(X+12, Y+22);

			// left buttom corner
			ctx.moveTo(X-12, Y+22);
			ctx.lineTo(X-22, Y+22);
			ctx.lineTo(X-22, Y+12);
			ctx.stroke();
			ctx.closePath();
			
		}
	},

	drawBackGround: function(ctx) {
		ctx.clearRect(0,0,440,440);
		ctx.fillStyle = this.backgroundColor;
		ctx.rect(0, 0, this.blockWidth*this.cols, this.blockHeight*this.rows);
		ctx.fill();

		ctx.lineWidth = this.lineWidth;
		ctx.strokeStyle = this.strokeStyle;

		for(var i=1; i<=8; ++i) {
			var startx = i * this.blockWidth;
			var starty = 0;
			ctx.beginPath();
			ctx.moveTo(startx,starty);
			var endy = this.rows * this.blockHeight;
			ctx.lineTo(startx, endy);
			ctx.closePath();
			ctx.stroke();

			startx = 0;
			starty = i * this.blockHeight;
			ctx.beginPath();
			ctx.moveTo(startx, starty);
			ctx.lineTo(this.cols * this.blockWidth, starty);
			ctx.closePath();
			ctx.stroke();
		}
	},

	drawBalls: function(ctx) {
		for(var i =0; i< this.rows; ++i) {
			for(var j=0; j<this.cols; ++j) {
				if (!this.isEmpty(i, j)) {

					var ball = this.getBall(i, j);
					ball.draw(ctx);
				}
			}
		}
	},

	isGameOver: function() {
		var emptyCells = this.getEmptyCells();
		if (emptyCells.length == 0) {
			console.log("game over!");
			return true;
		}
		else {
			return false;
		}
	},

	isSameColor: function(row1, col1, row2, col2) {
		var cell1 = this.getBall(row1,col1);
		var cell2 = this.getBall(row2,col2);
		return cell1.color == cell2.color;
	},

	collectRowAllignCells: function(n) {
		var cells = [];
		var start = 0;
		var end =0;
		var maxCount = 0;
		var count = 0;
		if (!this.isEmpty(n,0)) {
			count = 1;
		}
		for(var j=1; j<this.cols;++j) {
			var isEmpty = this.isEmpty(n,j);
			
			if (!isEmpty && (this.isSameColor(n,j,n,j-1))){
				count += 1;	
				if(count > maxCount) {
					maxCount = count;
					end = j;
				}
				
			}
			else if(!isEmpty) {
				count = 1;
				if (maxCount < 5) {
					start = j;
					end =j;
					maxCount = 1;
				}
			}
			else {
				count = 0;
			}
		}
		if (maxCount >= 5) {
			// collect allign cells
			var c = start;
			while( c <= end) {
				cells.push([n,c]);
				c+=1;
			}
		}
		return cells;		
	},

	collectColumnAllignCells: function(n) {
		var cells = [];
		var start = 0;
		var end =0;
		var maxCount = 0;
		var count = 0;
		if (!this.isEmpty(0,n)) {
			count = 1;
		}
		for(var j=1; j<this.cols;++j) {
			var isEmpty = this.isEmpty(j,n);
			
			if (!isEmpty && (this.isSameColor(j,n,j-1,n))){
				count += 1;	
				if(count > maxCount) {
					maxCount = count;
					end = j;
				}
				
			}
			else if(!isEmpty) {
				count = 1;
				if (maxCount < 5) {
					start = j;
					end =j;
					maxCount = 1;
				}
			}
			else {
				count = 0;
			}
		}
		if (maxCount >= 5) {
			// collect allign cells
			var c = start;
			while( c <= end) {
				cells.push([c,n]);
				c+=1;
			}
		}
		return cells;		
	},

	collectAllignCells: function() {
		// check if there are five same color balls in a line
		var cells = [];
		for(var i =0; i< this.rows; ++i) {
			var rowCells = this.collectRowAllignCells(i);
			cells = cells.concat(rowCells);
			var colCells = this.collectColumnAllignCells(i);
			cells = cells.concat(colCells);
		}
		return cells;
	},

	clearAllignCells: function() {
		var cells = this.collectAllignCells();
		var emptyCount = this.getEmptyCells().length;
		if(cells.length > 0) {
			for(var i=0;i<cells.length;++i) {
				this.clearBall(cells[i][0], cells[i][1]);
			}
		}
		var emptyCountNew = this.getEmptyCells().length;
		return emptyCountNew - emptyCount;
	},

	repeat: function() {
		console.log("repeat", this);
		this.putRandomBalls(3);
		var clearCount = this.clearAllignCells();
		ScoreBoard.addScore(clearCount);
		if (this.isGameOver()) {
			alert("game over");
			ScoreBoard.restart();
			this.init(this.ctx);
			//console.log('after init', this);
			this.repeat();
		}
		this.draw();
	}
}


var CanvasMouseEvents = {

	canvas: null,

	mouseDownListeners: [],
	mouseMoveListeners: [],
	mouseUpListeners: [],

	addMouseDownListener: function(func) {
		this.mouseDownListeners.push(func);
	},

	addMouseMoveListener: function(func) {
		this.mouseMoveListeners.push(func);
	},

	addMouseUpListener: function(func) {
		this.mouseUpListeners.push(func);
	},


	init: function(canvas) {
		this.canvas = canvas;
	},


	doMouseDown: function(e) {
		var cellIndex = GameBoard.getCellIndex(e);

		var listeners = CanvasMouseEvents.mouseDownListeners;
		this.notifyAll(listeners, cellIndex);
	},

	doMouseMove: function(e) {
		
	},

	doMouseUp: function(e) {
		var cellIndex = GameBoard.getCellIndex(e);
		var listeners = CanvasMouseEvents.mouseUpListeners;
		this.notifyAll(listeners, cellIndex);
	},

	notifyAll: function(listeners, cellIndex) {
		for(var i=0; i<listeners.length; ++i) {
			listeners[i](cellIndex[0], cellIndex[1]);
		}
	}
}

function initCanvas(canvas) {
	// mouse event
	CanvasMouseEvents.init(canvas);  
	canvas.addEventListener("mousedown", CanvasMouseEvents.doMouseDown.bind(CanvasMouseEvents), false);  
	canvas.addEventListener('mousemove', CanvasMouseEvents.doMouseMove.bind(CanvasMouseEvents), false);  
	canvas.addEventListener('mouseup',   CanvasMouseEvents.doMouseUp.bind(CanvasMouseEvents), false);
}


initCanvas(canvas);
GameBoard.canvas = canvas;
var gameBoard = Object.create(GameBoard);
gameBoard.init(ctx);

CanvasMouseEvents.addMouseDownListener(gameBoard.selectBall.bind(gameBoard));
CanvasMouseEvents.addMouseUpListener(gameBoard.moveBall.bind(gameBoard));

gameBoard.repeat();
