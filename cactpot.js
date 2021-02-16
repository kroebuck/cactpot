let canvas, context, game, loc;

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
		this.removeElement(this.remaining, this.playerBoard[firstBox]);
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
		let locX = (1 + 1.5 * (i+1)) * initX - 12, locY = (1 + 1.5 * (j+1)) * initY + 15;

		context.fillStyle = "Green";
		context.font = "45px Arial";
		var num = context.fillText(this.playerBoard[position], locX, locY)
	}

	numberReveal(position) {
		// Make sure user has selected a valid location to reveal
		if (this.revealed < 4) {
			if (this.playerBoard[position] == 0) {
				this.playerBoard[position] = this.board[position];
				this.removeElement(this.remaining, this.playerBoard[position]);
				this.revealed += 1;
				this.drawNumber(position);
			}
		}
	}

	scoreCalc(line) {
		let sum = 0;
		let emptyPosCount = 0; // track number of unrevealed positions for score prediction
		var pos;

		// diagonal (top-left to bottom-right)
		if (line == 0) {
			for (i = 0; i < 3; i++) {
				pos = this.boardLength * i + i;
				if (this.playerBoard[pos] == 0) {
					emptyPosCount += 1;
				}
				sum += this.board[pos];
			}
		}

		// diagonal (top-right to bottom-left)
		if (line == 4) {
		for (i = 0; i < 3; i++) {
				pos = this.boardLength * (i + 1) - i - 1;
				if (this.playerBoard[pos] == 0) {
					emptyPosCount += 1;
				}
				sum += this.board[pos];
			}
		}
		
		// columns
		if (0 < line && line < 4) {
			let i = line - 1; // corresponds to which column it is
			for (j = 0; j < 3; j++) {
				pos = i + this.boardLength * j;
				if (this.playerBoard[pos] == 0) {
					emptyPosCount += 1;
				}
				sum += this.board[pos];
			}
		}

		// rows
		if (4 < line) {
			let j = line - 5; // corresponds to which row it is
			for (i = 0; i < 3; i++) {
				pos = this.boardLength * j + i;
				console.log("pos", pos);
				if (this.playerBoard[pos] == 0) {
					emptyPosCount += 1;
				}
				sum += this.board[pos];
			}
		}

		return {'score': sum, 'emptyPosCount': emptyPosCount};
	}
}


window.onload = function () {
	canvas = document.getElementById("cact-canvas");
	context = canvas.getContext("2d");

	canvas.addEventListener("mousedown", mouseDownHandler);

	drawBoard()
	game = new CactpotBoard();

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
	var lineChoice = null;
	var loc = null;

	// Check if click is on a line selector
	centerY = initY;
	for (i = 0; i < 5; i++) {
		let centerX = (1 + 1.5 * i) * initX;
		let relX = posX - centerX, relY = posY - centerY;
	    let dist = Math.sqrt(relX * relX + relY * relY);
	    if (dist < rad) {
	    	lineChoice = i + 1;
	    }
	}

	centerX = initX;
	for (i = 1; i < 4; i++) {
		let centerY = (1 + 1.5 * i) * initY;
		let relX = posX - centerX, relY = posY - centerY;
	    let dist = Math.sqrt(relX * relX + relY * relY);
	    if (dist < rad) {
	    	lineChoice = 5 + i;
	    }
	}

	// Check if user clicked in one of the board positions. Get that location if yes.
	for (i = 0; i < 3; i++) {
		for (j = 0; j < 3; j++) {
		    let centerX = (1 + 1.5 * (i+1)) * initX, centerY = (1 + 1.5 * (j+1)) * initY; // coords of circle centers
		    let relX = posX - centerX, relY = posY - centerY;
		    let dist = Math.sqrt(relX * relX + relY * relY);
		    if (dist < rad) {
		    	loc = 3 * j + i + 1;
				console.log("loc: ", loc);
		    }
		}
	}

	if(lineChoice != null) {
		if (game.revealed > 3) {
			console.log("lc", lineChoice-1)
			let userScore = game.scoreCalc(lineChoice - 1).score;
			console.log("score:", userScore);
		}
	} else if (loc != null) {
		console.log("loc", loc);
		game.numberReveal(loc - 1);
	}
}

function drawBoard() {
	let initX = 100, initY = 100, rad = 50

	// Draw arrows to choose lines for scoring
	context.fillStyle = "Blue";
	centerY = initY;
	for (i = 0; i < 5; i++) {
		context.beginPath();
		let centerX = (1 + 1.5 * i) * initX;
		context.arc(centerX, centerY, rad, 0, 2 * Math.PI);
		context.fill();
	}

	centerX = initX;
	for (i = 1; i < 4; i++) {
		context.beginPath();
		let centerY = (1 + 1.5 * i) * initY;
		context.arc(centerX, centerY, rad, 0, 2 * Math.PI);
		context.fill();
	}

	// Draw board of values
	context.fillStyle = "#000000";
	for (i = 1; i < 4; i++) {
		for (j = 1; j < 4; j++) {
		    context.beginPath();
		    let centerX = (1 + 1.5 * i) * initX, centerY = (1 + 1.5 * j) * initY; // coords of circle centers
		    context.arc(centerX, centerY, rad, 0, 2 * Math.PI);
		    context.fill();
		}
	}

}
