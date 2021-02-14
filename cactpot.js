let canvas, context, game;

class CactpotBoard {
	constructor() {
		this.boardLength = 3;
		this.boxTotal = this.boardLength * this.boardLength;
		this.board = this.setup();
		this.playerBoard = Array(this.boxTotal).fill(0);
		this.remaining = Array.from({length: 9}, (x, i) => i + 1);
		this.revealed = 0;
		this.startGame();
	}

	setup() {
		let u = Array.from({length: 9}, (x, i) => i + 1);
		let shuffleCount = 100 * this.boxTotal;
		for (let i = 0; i < shuffleCount; i++) {
			u = this.swap(u);
		}
		return u;
	}

	swap(board) {
		let pos1 = Math.floor(this.boxTotal * Math.random());
		let pos2 = Math.floor(this.boxTotal * Math.random());
		while (pos1 == pos2) {
			pos2 = Math.floor(this.boxTotal * Math.random());
		}
		let temp = board[pos1];
		board[pos1] = board[pos2];
		board[pos2] = temp;
		return board;
	}

	startGame() {
		let firstBox = Math.floor(this.boxTotal * Math.random());
		this.playerBoard[firstBox] = this.board[firstBox];
		this.removeElement(this.remaining, this.board[firstBox]);
		this.revealed += 1;
		console.log(firstBox, this.playerBoard[firstBox]);

		// Need to display revealed number on page
		this.drawNumber(firstBox);

	}

	removeElement(array, val) {
		for(var i in array) {
		    if(array[i] == val) {
		        array.splice(i, 1);
		        break;
		    }
		}
	}

	drawNumber(position) {
		let i = position % 3;
		let j = Math.floor(position/3);
		let initX = 100, initY = 100;
		let locX = (1 + 1.5 * i) * initX - 12, locY = (1 + 1.5 * j) * initY + 15;

		context.fillStyle = "Green";
		context.font = "45px Arial";
		var num = context.fillText(this.playerBoard[position], locX, locY)
	}
}


window.onload = function () {
	canvas = document.getElementById("cact-canvas");
	context = canvas.getContext("2d");

	canvas.addEventListener("mousedown", mouseDownHandler);

	drawBoard()
	//document.getElementById("start-game").onclick = drawBoard;

	document.getElementById("start-game").onclick = function() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawBoard();
		game = new CactpotBoard();
	}
}

function mouseDownHandler(event) {
	console.log(event);
	console.log("event.clientX", event.clientX);
	console.log("event.clientY", event.clientY);

	var rect = canvas.getBoundingClientRect();
	var posX = event.clientX - rect.left;
 	var posY = event.clientY - rect.top;

	console.log("posX, posY", posX, posY);

	checkBoardInteract(posX, posY);
}

function checkBoardInteract(posX, posY) {
	let initX = 100, initY = 100, rad = 50;

	for (i = 0; i < 3; i++) {
		for (j = 0; j < 3; j++) {
		    let centerX = (1 + 1.5 * i) * initX, centerY = (1 + 1.5 * j) * initY; // coords of circle centers
		    let relX = posX - centerX, relY = posY - centerY;
		    let dist = Math.sqrt(relX * relX + relY * relY);
		    if (dist < rad) {
		    	let loc = 3 * j + i;
				console.log("location: ", loc);
		    }
		}
	}
}

function drawBoard() {
	let initX = 100, initY = 100, rad = 50

	for (i = 0; i < 3; i++) {
		for (j = 0; j < 3; j++) {
			context.fillStyle = "#000000";
		    context.beginPath();
		    let centerX = (1 + 1.5 * i) * initX, centerY = (1 + 1.5 * j) * initY // coords of circle centers
		    context.arc(centerX, centerY, rad, 0, 2 * Math.PI);
		    context.fill();
		}
	}

}
