const PAUSED = "PAUSED";
const PLAYING = "PLAYING";
const STOPPED = "STOPPED";
const DEFAULT_WORD = "Charadas";
const DEFAULT_TRANSLATED_WORD = "Charades";
const DARK_MODE_CLASS = "bi-moon-fill";
const LIGHT_MODE_CLASS = "bi-sun";

var clock;
var round;
var team;
var scores;
var teams = 3;
var rounds;
var gameState = STOPPED;
var totalSecs = 5;
var words;
var currentRound = {
	score: 0,
	words: []
}

function init() {
	document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

	theme = localStorage.getItem("theme");
	setTheme(theme);
	words  = Object.keys(words_dict);
}

// ################## index.html ##################

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function newWord(){
	elem = document.getElementById('currentWord');
	englishElem = document.getElementById('currentTranslatedWord');

	if(words.length == 0){
		nWord = 'Reload the webpage.';
	}
	else{
		pos = getRandomInt(0, words.length-1);
		nWord = words[pos];
		words.splice(pos, 1);
	}

	elem.innerHTML = nWord;
	englishElem.innerHTML = words_dict[nWord]
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
	document.getElementById('currentTranslatedWord').innerHTML = DEFAULT_TRANSLATED_WORD;
	document.getElementById("playBtn").hidden = false;
	document.getElementById("pauseBtn").hidden = true;

	let roundWordsList = document.querySelector("#roundScoreModal .modal-body #roundWords");

	roundWordsList.innerHTML = "";
	currentRound.words.forEach(obj => {
		let good = Object.values(obj)[0];
		let word = Object.keys(obj)[0];

		let li = document.createElement("li");
		li.innerText = word;
		li.className = good ? "goodWord" : "badWord";
		roundWordsList.appendChild(li);
	})

	setClock(totalSecs);
	
	document.getElementById("totalRoundScore").innerHTML = currentRound.score;
	let roundScoreModal = new bootstrap.Modal(document.getElementById('roundScoreModal'), {});
	roundScoreModal.toggle();
}

function endRound() {
	const $table = $("#scoresTable");
	const teamId = team+1;
	const roundName = round+1;
	const teamData = $table.bootstrapTable('getRowByUniqueId', teamId);
	$table.bootstrapTable('updateByUniqueId', {id: teamId, row: {[roundName]: currentRound.score, total: teamData["total"] + currentRound.score}});

	currentRound.score = 0;
	currentRound.words = [];

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
}

function gameOver() {
	const scores = $("#scoresTable").bootstrapTable("getData");

	let winners = [];
	let maxScore = 0;
	scores.forEach((score) => {
		let teamTotal = score.total;
		let teamId = score.id;

		if (teamTotal > maxScore) {
			maxScore = teamTotal;
			winners = [teamId];
		} else if (teamTotal == maxScore) {
			winners.push(teamId);
		}
	});

	let winnersText = winnerWinnersText = isAre = "";
	if (winners.length == 1) {
		isAre = "is";
		winnerWinnersText = "winner"
		winnersText = "Team " + winners[0];
	} else if (winners.length > 1) {
		isAre = "are";
		winnerWinnersText = "winners"
		winners.forEach((winner, idx, arr) => {
			winnersText += "Team " + winner;
			if (idx < arr.length - 1)
				winnersText += ", ";
		});
	}

	$("#winnerWinnersText").text(winnerWinnersText);
	$("#isAreSpan").text(isAre);
	$("h1#winners").text(winnersText);

	createTable("#finalScoresTable", scores);
	$("#mainDiv").hide();
	$("#winnersDiv").show();
}

function plus(q=1) {
	currentRound.score += q;
	document.getElementById("currentScore").innerHTML = currentRound.score;
	document.getElementById("totalRoundScore").innerHTML = currentRound.score;

}

function minus(q=1) {
	currentRound.score-=q;
	document.getElementById("currentScore").innerHTML = currentRound.score;
	document.getElementById("totalRoundScore").innerHTML = currentRound.score;
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
	let currentWord = document.getElementById('currentWord').textContent;
	currentRound.words.push({[currentWord]: false});
	newWord();
}

function next() {
	if (gameState != PLAYING) return;

	currentRound.score++;
	document.getElementById("currentScore").innerHTML = currentRound.score;
	let currentWord = document.getElementById('currentWord').textContent;
	currentRound.words.push({[currentWord]: true});
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
		currentRound.score = 0;
		currentRound.words = [];
		document.getElementById("currentScore").innerHTML = currentRound.score;
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
	$("#mainDiv").show();

	teams = parseInt(document.getElementById("teamsInput").value);
	rounds = parseInt(document.getElementById("roundsInput").value);
	
	if (isNaN(teams) || isNaN(rounds)) return;

	document.getElementById('roundScoreModal').addEventListener('hidden.bs.modal', endRound);

	setClock(totalSecs);

	round = 0;
	team = 0;
	currentRound.score = 0;
	currentRound.words = [];

	scores = initArray(teams, { "total": 0 });

	document.getElementById("teamNumber").innerHTML = team + 1;
	document.addEventListener("keydown", keyDownDoc, false); // http://jsfiddle.net/9ZDxw/1/ 

	createTable("#scoresTable");
	
	$("#newGameDiv").hide();
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
	if (!PLAYING)
		return
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

function createTable(selector, data = []) {
	const $table = $(selector);

	$table.bootstrapTable('refreshOptions', {
			classes: "table table-hover"
	});

	let columns = [{
		field: "id",
		title: "#",
		halign: "center",
		align: "center"
	}];

	for (let r = 0; r <= rounds - 1; r++) {
		columns.push({
			field: (r+1),
			title: r+1,
			halign: "center",
			align: "center"
		});
	}

	columns.push({
		field: "total",
		title: "Total",
		halign: "center",
		align: "center"
	});

	if (data.length == 0) {
		for (let i = 0; i <= teams - 1; i++) {
			data.push({
				id: i+1,
				total: 0
			});
		}
	}

	$table.bootstrapTable({
		columns: columns,
		data: data,
		uniqueId: "id"
	});
}

function setTheme(theme) {
	const selectors = "body, #themeToggleBtn, #wordDiv, .modal-content, .modal .modal-header,.modal-footer";
	const themeToggleBtn = document.getElementById("themeToggleBtn");

	if (theme == "dark" && document.body.classList.contains("light-theme")) {
		document.querySelectorAll(selectors).forEach(elem => {
			elem.classList.remove("light-theme");
		});

		document.querySelectorAll(".modal .btn-close").forEach(elem => {
			elem.classList.add("btn-close-white");
		});

		themeToggleBtn.classList.remove(DARK_MODE_CLASS);
		themeToggleBtn.classList.add(LIGHT_MODE_CLASS);

	} else if (theme == "light" && !document.body.classList.contains("light-theme")) {
		document.querySelectorAll(selectors).forEach(elem => {
			elem.classList.add("light-theme");
		});

		document.querySelectorAll(".modal .btn-close").forEach(elem => {
			elem.classList.remove("btn-close-white");
		});

		themeToggleBtn.classList.remove(LIGHT_MODE_CLASS);
		themeToggleBtn.classList.add(DARK_MODE_CLASS);
	}

	localStorage.setItem("theme", theme);
}

function toggleTheme() {
	let theme = "light";

	if (document.body.classList.contains("light-theme")) {
		theme = "dark";
	}

	setTheme(theme);
}