const PAUSED = "PAUSED";
const PLAYING = "PLAYING";
const STOPPED = "STOPPED";
const DEFAULT_WORD = "Charadas";

var clock;
var goodWords = 0;
var round;
var team;
var scores;
var teams = 3;
var rounds;
var gameState = STOPPED;
var totalSecs = 5;


// ################## index.html ##################

function initScore() {
	// sessionStorage
	// https://stackoverflow.com/questions/16206322/how-to-get-js-variable-to-retain-value-after-page-refresh

	sessionStorage.teams = document.getElementById("teams").value;
	sessionStorage.rounds = document.getElementById("rounds").value;
}

// ################## game.html ##################

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function newWord(){
	elem = document.getElementById('currentWord');

	if(words.length == 0){
		nWord = 'Reload the webpage.';
	}
	else{
		pos = getRandomInt(0, words.length-1);
		nWord = words[pos];
		words.splice(pos, 1);
	}
	
	
	elem.innerHTML = nWord;
}

function updateTimer() {
	let minutes = parseInt(document.getElementById("minsInput").value);
	let seconds = parseInt(document.getElementById("secsInput").value);

	if (isNaN(minutes) || isNaN(seconds)) return;
	
	totalSecs = seconds + minutes * 60;
	setClock(totalSecs);
}

function pad(val) {
	return val > 9 ? val : "0" + val;
}

function startClock(secs = totalSecs) {
	currentSecs = secs;

	clock = setInterval(function () {
		document.getElementById("seconds").innerHTML = pad(--currentSecs % 60);
		document.getElementById("minutes").innerHTML = pad(parseInt(currentSecs / 60, 10));

		if (currentSecs <= 0) {
			clearInterval(clock);
			timesUp();
		}

	}, 1000);
}

function timesUp() {
	console.log("timesUp");
	gameState = STOPPED;

	document.getElementById('currentWord').innerHTML = DEFAULT_WORD;
	document.getElementById("playBtn").hidden = false;
	document.getElementById("pauseBtn").hidden = true;

	setClock(totalSecs);
	
	document.getElementById("totalRoundScore").innerHTML = goodWords;
	let roundScoreModal = new bootstrap.Modal(document.getElementById('roundScoreModal'), {});
	roundScoreModal.toggle();
}

function endRound() {
	scores[team][round] = goodWords;
	scores[team]["total"] += goodWords;
	goodWords = 0;

	document.getElementById("currentScore").innerHTML = 0;

	if (round == rounds - 1 && team == teams - 1) {
		gameOver();
	}

	if (team == teams - 1) {
		team = 0;
		round++;
	} else {
		team++;
	}

	document.getElementById("teamNumber").innerHTML = team + 1;
	console.log(scores);

	createTable();
}

function gameOver() {

	let winner = 0;
	scores.forEach((t, pos, arr) => {
		if (arr[pos].total > arr[winner].total) {
			winner = pos;
		}
	});

	document.getElementById("winnerName").innerHTML = "Team " + winner + 1;

	let winnerModal = new bootstrap.Modal(document.getElementById('winnerModal'), {
		keyboard: false,
		backdrop: "static"
	});
	winnerModal.toggle();
}

function plus(q=1) {
	goodWords += q;
	document.getElementById("currentScore").innerHTML = goodWords;
	document.getElementById("totalRoundScore").innerHTML = goodWords;

}

function minus(q=1) {
	goodWords-=q;
	document.getElementById("currentScore").innerHTML = goodWords;
	document.getElementById("totalRoundScore").innerHTML = goodWords;
}

function setClock(sec = totalSecs) {
	let seconds = pad(sec % 60);
	let minutes = pad(parseInt(sec / 60, 10));

	document.getElementById("seconds").innerHTML = seconds;
	document.getElementById("minutes").innerHTML = minutes;

	// set inputs in the timerModal
	document.getElementById("secsInput").value = seconds;
	document.getElementById("minsInput").value = minutes;
}

function skip() {
	if (gameState != PLAYING) return;
	newWord();
}

function next() {
	if (gameState != PLAYING) return;

	goodWords++;
	document.getElementById("currentScore").innerHTML = goodWords;
	newWord();
}

function playPause() {
	let prevState = gameState;
	gameState = gameState == PLAYING ? PAUSED : PLAYING;

	if (gameState == PLAYING) {
		if (prevState == STOPPED) play(true);
		else play();
	} else {
		pause();
	}
}

function play(reset=false) {
	document.getElementById("playBtn").hidden = true;
	document.getElementById("pauseBtn").hidden = false;

	// coming from STOPPED state so we need to reset the game
	if (gameState == STOPPED) reset = true;
	gameState = PLAYING;

	if (reset) {
		goodWords = 0;
		document.getElementById("currentScore").innerHTML = goodWords;
		startClock(totalSecs);
	} else {
		startClock(currentSecs);
	}

	newWord();
}

function pause() {
	document.getElementById("playBtn").hidden = false;
	document.getElementById("pauseBtn").hidden = true;
	clearInterval(clock);
}

function startGame() {
	teams = parseInt(document.getElementById("teamsInput").value);
	rounds = parseInt(document.getElementById("roundsInput").value);
	
	if (isNaN(teams) || isNaN(rounds)) return;

	document.getElementById('roundScoreModal').addEventListener('hidden.bs.modal', endRound);

	setClock(totalSecs);

	round = 0;
	team = 0;
	goodWords = 0;

	scores = initArray(teams, { "total": 0 });

	document.getElementById("teamNumber").innerHTML = team + 1;
	document.addEventListener("keydown", keyDownDoc, false); // http://jsfiddle.net/9ZDxw/1/

	createTable();
	
	document.getElementById("newGameDiv").style.display = "none";
}

/*
 *	initArray - helper function to create an array of size=len and initializes every
 *		element to a copy/clone of the obj
 */
function initArray(len, obj) {
	let res = new Array(len).fill(0);
	res.forEach((elem, pos, theArray) => theArray[pos] = {...obj});
	
	return res;
}

function keyDownDoc(e) {
	var keyCode = e.keyCode;
	switch(keyCode){
		case 39: // derecha
		case 38: // arriba
		case 13: // enter
			next();
			break;
		case 40: // abajo
		case 37: // izquierda
		case 8: // delete
			skip();
			break;
		case 80: // p
		case 32: // spacebar
			playPause();
			break;

		default:
			console.log(keyCode);
	}
}

function createTable() {
	let scoresTableDiv = document.getElementById("scoresTableDiv");
	scoresTableDiv.innerHTML = "";

	let scoresTable = document.createElement("table");
	scoresTable.classList.add("table", "table-hover");
	let scoresTableHead = document.createElement("thead");
	let scoresTableHeaderRow = document.createElement("tr");

	for (r = 0; r <= rounds + 1; r++) {

		let header = r;
		if (r == 0) header = "#";
		else if (r == (rounds + 1)) header = "Total";

		let scoreHeader = document.createElement("th");
		scoreHeader.setAttribute("scope", "col");
		scoreHeader.innerText = header;
		scoresTableHeaderRow.append(scoreHeader);
	}

	scoresTableHead.append(scoresTableHeaderRow);
	scoresTable.append(scoresTableHead)

	let scoresTableBody = document.createElement("tbody");

	scores.forEach((teamInfo, pos) => {
		let roundRow = document.createElement("tr");
		
		// adding Team #
		let teamCell = document.createElement("td");
		teamCell.innerText = pos + 1;
		roundRow.append(teamCell);

		// adding score for each round
		for (j = 0; j <= rounds; j++) {
			
			let text = "";
			if (j == rounds) text = teamInfo["total"];
			else text = teamInfo.hasOwnProperty(j) ? teamInfo[j] : "-";

			let scoreCell = document.createElement("td");
			scoreCell.innerText = text;
			roundRow.append(scoreCell);
		}

		scoresTableBody.append(roundRow);
	});

	scoresTable.append(scoresTableBody); // body to table
	scoresTableDiv.append(scoresTable);  // table to div
}