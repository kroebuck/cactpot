let canvas, context, game, loc, userLineChosen, userScore, arrowImage;

const payoutArray = {
			6: 10000,
			7: 36,
			8: 720,
			9: 360,
			10: 80,
			11: 252,
			12: 108,
			13: 72,
			14: 54,
			15: 180,
			16: 72,
			17: 180,
			18: 119,
			19: 36,
			20: 306,
			21: 1080,
			22: 144,
			23: 1800,
			24: 3600
		};

class CactpotBoard {
	constructor() {
		this.boardLength = 3;
		this.boxTotal = this.boardLength * this.boardLength;
		this.board = this.setup();
		this.playerBoard = Array(this.boxTotal).fill(0);
		this.remaining = Array.from({length: 9}, (x, i) => i + 1);
		this.revealed = 0;
		this.firstBox = null;
		this.startGame();
		this.nextRevealScore = Array(this.boxTotal).fill(0);
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
		this.firstBox = Math.floor(this.boxTotal * Math.random());
		this.playerBoard[this.firstBox] = this.board[this.firstBox];
		this.removeElement(this.remaining, this.playerBoard[this.firstBox]);
		this.revealed += 1;
	}

	removeElement(array, val) {
		for(var i in array) {
		    if(array[i] == val) {
		        array.splice(i, 1);
		        break;
		    }
		}
	}

	numberReveal(position) {
		if (this.playerBoard[position] == 0) {
			this.playerBoard[position] = this.board[position];
			this.removeElement(this.remaining, this.playerBoard[position]);
			this.revealed += 1;
		}
	}

	scoreCalc(line) {
		let trueSum = 0;
		let playerSum = 0;
		let emptyPosCount = 0; // track number of unrevealed positions for score prediction
		var pos;

		// diagonal (top-left to bottom-right)
		if (line == 0) {
			for (i = 0; i < 3; i++) {
				pos = this.boardLength * i + i;
				if (this.playerBoard[pos] == 0) {
					emptyPosCount += 1;
				}
				trueSum += this.board[pos];
				playerSum += this.playerBoard[pos];
			}
		}

		// diagonal (top-right to bottom-left)
		if (line == 4) {
		for (i = 0; i < 3; i++) {
				pos = this.boardLength * (i + 1) - i - 1;
				if (this.playerBoard[pos] == 0) {
					emptyPosCount += 1;
				}
				trueSum += this.board[pos];
				playerSum += this.playerBoard[pos];
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
				trueSum += this.board[pos];
				playerSum += this.playerBoard[pos];
			}
		}

		// rows
		if (4 < line) {
			let j = line - 5; // corresponds to which row it is
			for (i = 0; i < 3; i++) {
				pos = this.boardLength * j + i;
				if (this.playerBoard[pos] == 0) {
					emptyPosCount += 1;
				}
				trueSum += this.board[pos];
				playerSum += this.playerBoard[pos];
			}
		}

		return {'playerSum': playerSum, 'score': this.payout(trueSum), 'emptyPosCount': emptyPosCount};
	}

	predictScore() {
		let revealedSum = null;
		let emptyPosCount = null;
		let currentVal = 0;
		let pos = null;
		let maxLineVal = 0;
		let maxLineIndex = 0;
		let maxBoxVal = 0;
		let maxBoxIndex = 0;

		for (let k = 0; k < 8; k++) {
			revealedSum = this.scoreCalc(k).playerSum;
			emptyPosCount = this.scoreCalc(k).emptyPosCount;
			currentVal = this.lineValue(revealedSum, emptyPosCount);

			if (k == 0) {
				for (i = 0; i < 3; i++) {
					pos = this.boardLength * i + i
					this.nextRevealScore[pos] += currentVal;
				}
			} else if (0 < k && k < 4) {
				i = k - 1; // column number (0-2)
				for  (j = 0; j < 3; j++) {
					pos = this.boardLength * j + i;
					this.nextRevealScore[pos] += currentVal;
				}
			} else if (k == 4) {
				for (i = 0; i < 3; i++) {
					pos = this.boardLength * (i + 1) - i - 1;
					this.nextRevealScore[pos] += currentVal;
				}
			} else if (4 < k) {
				j = k - 5; // row number (0-2)
				for (i = 0; i < 3; i++) {
					pos = this.boardLength * j + i;
					this.nextRevealScore[pos] += currentVal;
				}
			}

			if (currentVal > maxLineVal) {
				maxLineVal = currentVal;
				maxLineIndex = k;
			}
		}

		// Find which box is the best to uncover next, or say which line is best
		if (this.revealed < 4) {
			for (i = 0; i < this.nextRevealScore.length; i++) {
				// console.log("pos, score", i+1, this.nextRevealScore[i]);
				if (this.nextRevealScore[i] > maxBoxVal) {
					if (this.playerBoard[i] == 0) {
						maxBoxVal = this.nextRevealScore[i];
						maxBoxIndex = i;
					}
				}
			}
			console.log("The best box to reveal is", maxBoxIndex + 1);
		} else {
			console.log("The best line choice is:", maxLineIndex);
		}

		return {'boxSuggest': maxBoxIndex, 'lineSuggest': maxLineIndex};
	}

	lineValue(initSum, emptyCount) {
		let totalScore = 0;
		var tempSum;
		let length = this.remaining.length;
		let probabilityMass = 1;

		if (emptyCount == 0) {
			totalScore = this.payout(initSum);
		} else if (emptyCount === 1) {
			for (i = 0; i < length; i++) {
				tempSum = initSum + this.remaining[i];
				totalScore += this.payout(tempSum);
			}
			totalScore = totalScore / length;
		} else if (emptyCount == 2) {
			for (i = 0; i < length - 1; i++) {
				for (j = 1; j < length; j++) {
					if (i < j) {
						tempSum = initSum + this.remaining[i] + this.remaining[j];
						totalScore += this.payout(tempSum);
						probabilityMass = 2 / length / (length - 1);
					}
				}
			}
			totalScore = 0.1 * totalScore;
		} else if (emptyCount == 3) {
			for (i = 0; i < length - 2; i++) {
				for (j = 1; j < length - 1; j++) {
					for (let k = 2; k < length; k++) {
						if (i < j && j < k) {
							tempSum = initSum + this.remaining[i] + this.remaining[j] + this.remaining[k];
							totalScore += this.payout(tempSum);
							probabilityMass = 6 / length / (length - 1) / (length - 2);
						}
					}
				}
			}
			totalScore = probabilityMass * totalScore;
		}

		return totalScore;
	}

	static get payoutArray() {
		return payoutArray;
	}

	payout(lineSum) {
		return CactpotBoard.payoutArray[lineSum];
	}
}


window.onload = function () {
	canvas = document.getElementById("cact-canvas");
	context = canvas.getContext("2d");

	canvas.addEventListener("mousedown", mouseDownHandler);

	game = new CactpotBoard();
	userLineChosen = false;

	arrowImage = new Image();
	arrowImage.src = "arrow.png";
	arrowImage.onload = () => {
		draw();
	}

	document.getElementById("start-game").onclick = function() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		game = new CactpotBoard();
		userLineChosen = false;
		draw();
	}

	document.getElementById("predict-score").onclick = function() {
		if (game.revealed < 4) {
			let bestPos = game.predictScore().boxSuggest;
			draw(null, bestPos, true);
		} else if (game.revealed == 4) {
			let bestLine = game.predictScore().lineSuggest;
			draw(bestLine, null, true);
		}
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
	let initX = 100, initY = 100, rad = 50; // (initX, initY) is the center of the initial circle.
	var lineChoice = null, loc = null; // keep null until the user selects a scoring line or board location

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
		    }
		}
	}

	if (loc != null && game.revealed < 4) {
		loc = loc - 1;
		game.numberReveal(loc);
	}

	if (lineChoice != null && game.revealed > 3 && userLineChosen == false) {
		lineChoice = lineChoice - 1;
		userScore = game.scoreCalc(lineChoice).score;

		// Display score on page
		scoreDisplay = document.getElementById("user-score");
		scoreDisplay.innerHTML += userScore;
	}

	draw(lineChoice, loc);
}

function draw(line, pos, isPrediction) {
	// Highlight suggested next reveal or line choice
	if (isPrediction != null) {
		drawSuggest(line, pos);
		drawBoard();
		for (i = 0; i < game.boxTotal; i++) {
			if (game.playerBoard[i] != 0) {
				drawNumber(i);
			}
		}
	} else {
		// Highlight the line chosen
		if(line != null) {
			if (game.revealed > 3) {
				if (userLineChosen == false) {
					drawLineBG(line);
				}
			}
		}

		// Draw the board (does not include numbers revealed)
		drawBoard();

		// Draw all revealed numbers. Else, once a line has been chosen, reveal the rest of the board
		if (userLineChosen == false) {
			for (i = 0; i < game.boxTotal; i++) {
				if (game.playerBoard[i] != 0) {
					drawNumber(i);
				}
			}
		} else {
			for (i = 0; i < game.boxTotal; i++) {
				drawNumber(i);
			}
		}
	}
}

function drawNumber(position) {
	let i = position % 3;
	let j = Math.floor(position/3);
	let initX = 100, initY = 100;
	let locX = (1 + 1.5 * (i+1)) * initX - 12, locY = (1 + 1.5 * (j+1)) * initY + 15;

	context.fillStyle = "#000000";
	context.font = "45px Arial";
	var num = context.fillText(game.board[position], locX, locY);
}

function drawBoard() {
	let initX = 100, initY = 100, rad = 50;
	var centerX, centerY;
	let imageWidth = 60, imageHeight = 60;
	var posX, posY;

	// Draw arrows within circles to choose lines for scoring
	context.fillStyle = "Black";
	centerY = initY;
	for (i = 0; i < 5; i++) {
		context.beginPath();
		centerX = (1 + 1.5 * i) * initX;
		context.arc(centerX, centerY, rad, 0, 2 * Math.PI);
		context.stroke();

		// draw rotated arrow
		if (i == 0) {
			context.save();
			posX = centerX - 0.5*imageWidth, posY = centerY - 0.5*imageHeight;
			context.translate(centerX, centerY);
			context.rotate(Math.PI / 4);
			context.translate(-centerX, -centerY);
			context.drawImage(arrowImage, posX, posY, imageWidth, imageHeight);
			context.restore();
		}

		// draw rotated arrows
		if (0 < i && i < 4) {
			context.save();
			posX = centerX - 0.5*imageWidth, posY = centerY - 0.5*imageHeight;
			context.translate(centerX, centerY);
			context.rotate(Math.PI / 2);
			context.translate(-centerX, -centerY);
			context.drawImage(arrowImage, posX, posY, imageWidth, imageHeight);
			context.restore();
		}

		// draw rotated arrow
		if (i == 4) {
			context.save();
			posX = centerX - 0.5*imageWidth, posY = centerY - 0.5*imageHeight;
			context.translate(centerX, centerY);
			context.rotate(3* Math.PI / 4);
			context.translate(-centerX, -centerY);
			context.drawImage(arrowImage, posX, posY, imageWidth, imageHeight);
			context.restore();
		}
	}

	centerX = initX;
	for (i = 1; i < 4; i++) {
		context.beginPath();
		centerY = (1 + 1.5 * i) * initY;
		context.arc(centerX, centerY, rad, 0, 2 * Math.PI);
		context.stroke();
		
		// draw arrow
		posX = centerX - 0.5*imageWidth, posY = centerY - 0.5*imageHeight;
		context.drawImage(arrowImage, posX, posY, imageWidth, imageHeight);
	}

	// Draw board for values
	context.fillStyle = "#e3c34f";
	for (i = 1; i < 4; i++) {
		for (j = 1; j < 4; j++) {
		    context.beginPath();
		    centerX = (1 + 1.5 * i) * initX, centerY = (1 + 1.5 * j) * initY; // coords of circle centers
		    context.arc(centerX, centerY, rad, 0, 2 * Math.PI);
		    context.fill();
		}
	}

	context.fillStyle = "#f7e8b2";
	for (i = 1; i < 4; i++) {
		for (j = 1; j < 4; j++) {
		    context.beginPath();
		    centerX = (1 + 1.5 * i) * initX, centerY = (1 + 1.5 * j) * initY; // coords of circle centers
		    context.arc(centerX, centerY, 0.9*rad, 0, 2 * Math.PI);
		    context.fill();
		}
	}
}

function drawLineBG(line) {
	if (line != null) {
		// Highlights background
		let initX = 100, initY = 100, rad = 50;
		let rectWidth = 3*initX, rectHeight = 110;
		var pos = null, i = null, j = null;
		context.fillStyle = "#5edcff";

		// diagonal (top-left to bottom-right)
		if (line == 0) {
			// Endcap circles
			for (k = 0; k < 3; k += 2) {
				pos = game.boardLength * k + k;
				i = pos % 3;
				j = Math.floor(pos/3);
				context.beginPath();
			    let centerX = (1 + 1.5 * (i+1)) * initX, centerY = (1 + 1.5 * (j+1)) * initY; // coords of circle centers
			    context.arc(centerX, centerY, 1.1*rad, 0, 2 * Math.PI);
			    context.fill();
			}

			// Rotated rectangle
			context.save();
			rectWidth = 1.414*rectWidth;
			let rectPosX = 4*initX - 0.5*rectWidth, rectPosY = 4*initY - 0.5*rectHeight;
			context.translate(rectPosX + 0.5*rectWidth, rectPosY + 0.5*rectHeight);
			context.rotate(Math.PI / 4);
			context.translate(-rectPosX - 0.5*rectWidth, -rectPosY - 0.5*rectHeight);
			context.fillRect(rectPosX, rectPosY, rectWidth, rectHeight);
			context.restore();
		}

		// diagonal (top-right to bottom-left)
		if (line == 4) {
			// Endcap circles
			for (k = 0; k < 3; k += 2) {
				pos = game.boardLength * (k + 1) - k - 1;
				i = pos % 3;
				j = Math.floor(pos/3);
				context.beginPath();
			    let centerX = (1 + 1.5 * (i+1)) * initX, centerY = (1 + 1.5 * (j+1)) * initY; // coords of circle centers
			    context.arc(centerX, centerY, 1.1*rad, 0, 2 * Math.PI);
			    context.fill();
			}

			// Rotated rectangle
			context.save();
			rectWidth = 1.414*rectWidth;
			let rectPosX = 4*initX - 0.5*rectWidth, rectPosY = 4*initY - 0.5*rectHeight;
			context.translate(rectPosX + 0.5*rectWidth, rectPosY + 0.5*rectHeight);
			context.rotate(-Math.PI / 4);
			context.translate(-rectPosX - 0.5*rectWidth, -rectPosY - 0.5*rectHeight);
			context.fillRect(rectPosX, rectPosY, rectWidth, rectHeight);
			context.restore();
		}

		// columns
		if (0 < line && line < 4) {
		// Endcap circles
			for (k = 0; k < 3; k += 2) {
				i = line - 1; // corresponds to which column it is
				pos = i + game.boardLength * j;
				context.beginPath();
			    let centerX = (1 + 1.5 * (i+1)) * initX, centerY = (1 + 1.5 * (k+1)) * initY; // coords of circle centers
			    context.arc(centerX, centerY, 1.1*rad, 0, 2 * Math.PI);
			    context.fill();

			    if (k == 0) {
	    			// Rotated rectangle
					context.fillRect(centerX - 0.5 * rectHeight, centerY, rectHeight, rectWidth);
			    }
			}
		}

		// rows
		if (line > 4) {
		// Endcap circles
			for (k = 0; k < 3; k += 2) {
				j = line - 5; // corresponds to which column it is
				context.beginPath();
			    let centerX = (1 + 1.5 * (k+1)) * initX, centerY = (1 + 1.5 * (j+1)) * initY; // coords of circle centers
			    context.arc(centerX, centerY, 1.1*rad, 0, 2 * Math.PI);
			    context.fill();

			    if (k == 0) {
	    			// Rotated rectangle
					context.fillRect(centerX, centerY - 0.5*rectHeight, rectWidth, rectHeight);
			    }
			}
		}

		userLineChosen = true;
	}
}

function drawSuggest(line, pos) {
	console.log("DRAWING SUGGESTION...");
	let initX = 100, initY = 100, rad = 50;
	let centerX = null, centerY = null;
	context.fillStyle = "#38ff6a";

	if (pos != null) {
		// get location of suggested next reveal
		pos = game.predictScore().boxSuggest;
		let i = pos % 3;
		let j = Math.floor(pos/3);

		// highlight suggested next reveal
	    context.beginPath();
	    centerX = (1 + 1.5 * (i+1)) * initX, centerY = (1 + 1.5 * (j+1)) * initY; // coords of circle center
	    context.arc(centerX, centerY, 1.1*rad, 0, 2 * Math.PI);
	    context.fill();
	}

	if (line != null) {
		let i = game.predictScore().lineSuggest;
		console.log("line suggest", i)
		if (i < 5) {
			// highlight suggested next reveal
		    context.beginPath();
		    centerX = (1 + 1.5 * i) * initX, centerY = initY; // coords of circle center
		    context.arc(centerX, centerY, rad, 0, 2 * Math.PI);
		    context.fill();
		} else {
			// highlight suggested next reveal
		    context.beginPath();
		    centerX = initX, centerY = (1 + 1.5 * (i-4)) * initY; // coords of circle center
		    context.arc(centerX, centerY, rad, 0, 2 * Math.PI);
		    context.fill();
		}
	}
}
