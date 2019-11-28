var clock;
var goodWords;
var round;
var team;
var scoreArr;
var equipos;
var rounds;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function nuevaPalabra(){
	elem = document.getElementById('palabra')

	if(palabras.length == 0){
		nPalabra = 'Reload the webpage.'
	}
	else{
		pos = getRandomInt(0, palabras.length-1)
		nPalabra = palabras[pos]
		palabras.splice(pos, 1)
	}
	
	
	elem.innerHTML = nPalabra
}

function init(){
	console.log(sessionStorage.equipos);
	console.log(sessionStorage.rounds);
	console.log("en init");
	
	equipos = Number(sessionStorage.equipos);
	rounds = Number(sessionStorage.rounds);

	round = 1;
	team = 1;

	scoreArr = new Array(equipos+1).fill(0);
	// for(var h = 0; h < scoreArr.length; h++){
		// console.log("item " + h + ": " + scoreArr[h]);
	// }

	nuevaPalabra();
	createScoreTable();
	goodWords = 0;

	document.addEventListener("keydown", keyDownDoc, false); // http://jsfiddle.net/9ZDxw/1/

	clock = $('.clock').FlipClock({
		countdown: true,
		clockFace: 'MinuteCounter',
		autoStart: false,
        callbacks: {
        	stop: function() {
        		if(clock.getTime().time == 0){
        			setTimeout(function(){
        				bootbox.alert({
        					message: "<h1> Stop!!!!! </h1>"+"<h2> Score: " + goodWords + "</h2>",
        					size: "small",
        					className: 'bootboxalert',
        					backdrop: true,
							callback: function () {
								changed();
								$('#startTimerBtn').prop('disabled', false);
								$('#pauseTimerBtn').prop('disabled', true);
								updateScore();
    						}

        				})

        			}, 800); // check again in a second
        		}
        	}
        }
	});


	clock.setTime(60);

	// Change palabra when enter key is pressed
	// $("body").keypress(function(event){
	// 	if(event.charCode == 13){
	// 		console.log("hola");
	// 		$("#nuevaPalabraBtn").click();
	// 	}
		// else if(event.charCode == 40){
		// 	console.log("abajo");
		// }
		// else if(event.charCode == 39){
		// 	console.log("la derecha");
		// }
		// else if(event.charCode == 38){
		// 	console.log("arriba");
		// }
		// else if(event.charCode == 37){
		// 	console.log("la izquierda");
		// }
		// else{
		// 	console.log(event.charCode);
		// }
	// });
}

function keyDownDoc(e) {
	var keyCode = e.keyCode;
	switch(keyCode){
		case 39: // derecha
		case 38: // arriba
		case 13: // enter
			goodWords++;
			console.log(goodWords);
		case 40: // abajo
		case 37: // izquierda
		case 8: // delete
			// $("#nuevaPalabraBtn").click();
			nuevaPalabra();
			break;
		case 80: // p
		case 32: // espacio
			if( $('#pauseTimerBtn').prop('disabled') == true ){
				$("#startTimerBtn").click();
			}
			else{
				$("#pauseTimerBtn").click();
			}
			break;
		case 82: // r
			$("#resetTimerBtn").click();
			break;

		default:
			console.log(keyCode);
	}
}

function changed(){
	min = parseInt(document.getElementById("minInput").value)
	sec = parseInt(document.getElementById("secInput").value)
	
	if(isNaN(sec))
		sec = 0;

	if(isNaN(min))
		min = 0

	newTime = min*60 + sec
	if(newTime == 0)
		newTime = 60
	clock.setTime(newTime)
}

function startTimer(){
	goodWords = 0;
	
	clock.start();
	$('#startTimerBtn').prop('disabled', true);
	$('#pauseTimerBtn').prop('disabled', false);
}

function pauseTimer(){
	clock.stop();
	$('#startTimerBtn').prop('disabled', false);
	$('#pauseTimerBtn').prop('disabled', true);
}

function resetTimer(){
	clock.stop();
	changed();
	$('#startTimerBtn').prop('disabled', false);
	$('#pauseTimerBtn').prop('disabled', true);
}

function initScore(){

	// sessionStorage
	// https://stackoverflow.com/questions/16206322/how-to-get-js-variable-to-retain-value-after-page-refresh
	console.log("hello bb");
	
	// getting value of selects
	// https://www.w3schools.com/jsref/prop_select_value.asp

	sessionStorage.equipos = document.getElementById("equipos").value;
	sessionStorage.rounds = document.getElementById("rounds").value;

	console.log(sessionStorage.equipos);
	console.log(sessionStorage.rounds);

	document.location = "game.html"
}

function createScoreTable(){
	// Para los thead
	// https://stackoverflow.com/questions/14999927/insert-th-in-thead

	// Para insert cell
	// https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_table_insertrow

	var table = document.getElementById("scoreTable");
	var tr = table.tHead.children[0];
	var totalRow = document.getElementById("totalRow")


	// table.rows[1].cells[1].innerHTML = 50;


	for(var e = 1; e <= equipos; e++){
		// creating the header row with each team number
		var th = document.createElement('th');
		th.innerHTML = "Team " + e;
		tr.appendChild(th);

		// initializing the total row with zeros (0)
		var tcell = totalRow.insertCell(e);
		tcell.innerHTML = "<b> 0 </b>";
	}

	// populating the rows for each round
	for(var r = 1; r <= rounds; r++){
		var row = table.insertRow(r);
		row.insertCell(0);

		// one cell per team
		for(var e = 1; e <= equipos; e++){
			var cell = row.insertCell(e);
			cell.innerHTML = "-";
		}
	}
}

function updateScore(){
	var table = document.getElementById("scoreTable");
	var totalRow = document.getElementById("totalRow")
	var oldTotal = scoreArr[team];
	console.log("primero: " + scoreArr[team]);
	console.log("old: " + oldTotal);
	scoreArr[team] = oldTotal + goodWords;
	
	// https://www.codeproject.com/Questions/236281/How-to-change-cell-value-of-an-html-table-through
	table.rows[round].cells[team].innerHTML = goodWords;
	totalRow.cells[team].innerHTML = oldTotal + goodWords;

	if( team == equipos ){
		team = 1;
		round++;
	}
	else{
		team++;
	}

	console.log("team " + team);
	console.log("round " + round);
}

