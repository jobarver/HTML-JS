function Board(w, h, winAmount) 
{
	this.width = w;
	this.height = h;
	this.spaces = new Array(w * h);
	this.winAmount = winAmount;
	
	for(var i = 0; i < w * h; i++) this.spaces[i] = 0;
}

Board.build = function(data) 
{
	var board = new Board( data.width, data.height, data.winAmount );

	board.spaces = data.spaces;

	return board;
}

Board.prototype.reset = function() {
	
	for(var i = 0; i < this.width * this.height; i++) this.spaces[i] = 0;
	
}

Board.prototype.getSpace = function(x, y) {
	
	var offset = this.pointOffset(x, y);
	
	return this.spaces[offset];
	
}

Board.prototype.setSpace = function(x, y, value) {
	
	var offset = this.pointOffset(x, y);
	
	this.spaces[offset] = value;
	
}

Board.prototype.pointOffset = function(x, y) {
	
	return y * this.width + x;
	
}

Board.prototype.pointToCell = function(px, py) {
	
	var cx = Math.floor( px * this.width );
	var cy = Math.floor( py * this.height );
	
	return { x : cx, y : cy };
	
}

Board.prototype.place = function(column, value) {
	
	for(var y = this.height - 1; y >= 0; y--) {
	
	if( this.getSpace(column, y) == 0 ) {
		
		this.setSpace(column, y, value);
		
		return true;
		
	}
	
	}
	
	return false;
	
}

Board.prototype.checkForWin = function() {
	
	//
	// Check rows
	//
	for(var row = 0; row < this.height; row++) {
	
		var x = 0;
		var y = row;
		var inARow = 0;
		var lastValue = 0;
		
		for(var i = 0; i < this.width; i++) {
			
			var value = this.getSpace(x + i, y);
			
			if(value != lastValue || value == 0) {
			
				inARow = 1;
			
			}else{
			
				inARow++;
			
			}
			
			if(inARow == this.winAmount) {
			
				return value;
			
			}
			
			if(this.winAmount - inARow > this.width - i - 1) {
			
				break;
			
			}
			
			lastValue = value;
			
		}
		
	}
	
	//
	// Check columns
	//
	for(var col = 0; col < this.width; col++) {
	
		var x = col;
		var y = 0;
		var inARow = 0;
		var lastValue = 0;
		
		for(var i = 0; i < this.height; i++) {
			
			var value = this.getSpace(x, y + i);
			
			if(value != lastValue || value == 0) {
			
				inARow = 1;
			
			}else{
			
				inARow++;
			
			}
			
			if(inARow == this.winAmount) {
			
				return value;
			
			}
			
			if(this.winAmount - inARow > this.height - i - 1) {
			
				break;
			
			}
			
			lastValue = value;
			
		}
	
	}
	
	//
	// Check downward diagonals
	//
	for(i = 0; i < this.width + this.height; i++) {
	
		var x, y;
		var inARow = 0;
		var lastValue = 0;
		
		if(i < this.height) {
			
			x = 0;
			y = this.height - i - 1;
			
		}else{
			
			x = i - this.height;
			y = 0;
			
		}
		
		while(x < this.width && y < this.height) {
			
			var value = this.getSpace(x, y);
			
			if(value != lastValue || value == 0) {
			
				inARow = 1;
			
			}else{
			
				inARow++;
			
			}
			
			if(inARow == this.winAmount) {
			
				return value;
			
			}
			
			x++;
			y++;
			lastValue = value;
			
		}
	
	}
	
	//
	// Check upward diagonals
	//
	for(i = 0; i < this.width + this.height; i++) {
	
		var x, y;
		var inARow = 0;
		var lastValue = 0;
		
		if(i < this.height) {
			
			x = 0;
			y = i;
			
		}else{
			
			x = i - this.height;
			y = this.height - 1;
			
		}
		
		while(x < this.width && y >= 0) {
			
			var value = this.getSpace(x, y);
			
			if(value != lastValue || value == 0) {
			
				inARow = 1;
			
			}else{
			
				inARow++;
			
			}
			
			if(inARow == this.winAmount) {
			
				return value;
			
			}
			
			x++;
			y--;
			lastValue = value;
			
		}
	
	}
	
	return false;
	
}

if(typeof module != "undefined") module.exports = Board;
function NetworkMessage(type, data) {

	this.type = type || null;
	this.data = data || {};

}

NetworkMessage.decode = function(data) {

	try {

		var payload = JSON.parse(data);

		return new NetworkMessage(payload.type, payload.data);

	} catch(e) {

		return new NetworkMessage();

	}

}

NetworkMessage.prototype.encode = function() {

	return JSON.stringify( this );

}

NetworkMessage.prototype.toString = function() {

	return this.encode();

}

if(typeof module != "undefined") module.exports = NetworkMessage;
function Net(address) {

	this.address = address;
	this.socket = null;
	this.connected = false;
	this.listeners = {};

}

Net.prototype.connect = function() {

	var self = this;

	this.socket = new WebSocket( this.address, "connect4-protocol" );
	this.socket.addEventListener("open", this.handleOpenedSocket.bind( this ));
	this.socket.addEventListener("message", this.handleMessage.bind( this ));
	this.socket.addEventListener("close", this.handleClosedSocket.bind( this ));
	this.socket.addEventListener("error", this.handleSocketError.bind( this ));

}

Net.prototype.reconnect = function() {

	var self = this;

	setTimeout(function() {

		self.connect();

	}, 3000);

}

Net.prototype.disconnect = function() {

	this.socket.close();

}

Net.prototype.handleOpenedSocket = function(openEvent) {

	console.log("[client] Connected to server");

	this.connected = true;

	this.emit("connect");

}

Net.prototype.handleMessage = function(messageEvent) {

	console.log("[server] " + messageEvent.data);

	this.emit("message", [ NetworkMessage.decode( messageEvent.data ) ]);

}

Net.prototype.handleClosedSocket = function(closeEvent) {

	console.log("[client] Disonnected from server");

	this.connected = false;

	this.emit("disconnect");

}

Net.prototype.handleSocketError = function(errorEvent) {

	console.log("[client] Socket error");

	this.emit("error");

}

Net.prototype.send = function(message) {

	this.socket.send(message);

}

Net.prototype.on = function(event, callback) {

	this.listeners[event] = this.listeners[event] || [];

	this.listeners[event].push(callback);

}

Net.prototype.emit = function(event, params) {

	var listeners = this.listeners[event] || [];

	params = params || [];

	for(var i = 0; i < listeners.length; i++) {

		listeners[i].apply( this, params );

	}

}
function GameState(game) {

	this.game = game;
	this.updateCallbacks = [];
	this.drawCallbacks = [];
	this.networkMessageHandlers = [];

}

GameState.prototype.addUpdateCallback = function(callback) {

	this.updateCallbacks.push( callback );

}

GameState.prototype.addDrawCallback = function(callback) {

	this.drawCallbacks.push( callback );

}

GameState.prototype.addNetworkMessageHandler = function(callback) {

	this.networkMessageHandlers.push( callback );

}

GameState.prototype.update = function() {

	for(var i = 0; i < this.updateCallbacks.length; i++) {

		this.updateCallbacks[i].call(this);

	}

}

GameState.prototype.draw = function() {

	for(var i = 0; i < this.drawCallbacks.length; i++) {

		this.drawCallbacks[i].call(this);

	}

}

GameState.prototype.handleNetworkMessage = function(message) {

	for(var i = 0; i < this.networkMessageHandlers.length; i++) {

		this.networkMessageHandlers[i].call( this, message );

	}

}
var Game = {
	state: "starting",
	playerTurn: 1,
	thinkingColumn: 0,
	localThinkingColumn: 0,
	states: {}
};

var Player = {
	number: 0
};

var Screensaver = {
	number: 40,
	pieces: []
};

Game.settings = {
	width: window.innerHeight - 40,
	height: window.innerHeight - 40,
	boardColor: "hsl(60, 80%, 70%)",
	playerColors: {
		0: "#000",
		1: "hsl(200, 100%, 50%)",
		2: "hsl(0, 100%, 50%)"
	},
	font: "100 16px sans-serif",
	serverURL: "wss://guarded-stream-8635.herokuapp.com"
};

//
// Connecting to server state
//
var startingState = addGameState("starting");

startingState.addDrawCallback(function() {

	this.game.context.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

	this.game.context.fillStyle = "#eee";
	this.game.context.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

	drawScreensaver();

	drawMessage("Click to join a game!");

});

startingState.addUpdateCallback(function() {

	updateScreensaver();

});

var connectingState = addGameState("connecting");

connectingState.addDrawCallback(function() {

	this.game.context.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

	this.game.context.fillStyle = "#eee";
	this.game.context.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

	drawScreensaver();

	drawMessage("Connecting to server");

});

connectingState.addUpdateCallback(function() {

	updateScreensaver();

});

//
// Waiting for other player state
//
var waitingState = addGameState("waiting");

waitingState.addDrawCallback(function() {

	this.game.context.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

	this.game.context.fillStyle = "#eee";
	this.game.context.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

	drawScreensaver();

	drawMessage("Waiting on another player to connect");

});

waitingState.addNetworkMessageHandler(function( networkMessage ) {

	if( networkMessage.type == "assignPlayer" ) {

		Player.number = networkMessage.data.number;

	}

	if( networkMessage.type == "roomReady" ) {

		Game.state = "active";

	}

});

waitingState.addUpdateCallback(function() {

	updateScreensaver();

});

//
// Disconnected state
//
var disconnectedState = addGameState("disconnected");

disconnectedState.addDrawCallback(function() {

	this.game.context.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

	this.game.context.fillStyle = "#eee";
	this.game.context.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

	drawScreensaver();

	drawMessage("Disconnected from server :( - Refresh to reconnect!");

});

disconnectedState.addUpdateCallback(function() {

	updateScreensaver();

});

//
// Active state
//
var activeState = addGameState("active");

activeState.addDrawCallback( drawActiveGame );

activeState.addUpdateCallback(function() {

	var mouseCell = Game.board.pointToCell( Game.mx, Game.my );

	if(Game.playerTurn == Player.number && mouseCell.x != Game.localThinkingColumn) {

		Game.localThinkingColumn = mouseCell.x;

		Game.network.send( new NetworkMessage("thinkingColumn", { player : Player.number, column : Game.localThinkingColumn } ) );

	}
	
});

activeState.addNetworkMessageHandler(function(networkMessage) {

	if( networkMessage.type == "startGame" ) {

		Game.board = Board.build( networkMessage.data.board );
		Game.playerTurn = networkMessage.data.turn;

	}

	if( networkMessage.type == "boardUpdate" ) {

		Game.board = Board.build( networkMessage.data.board );

	}

	if( networkMessage.type == "playerUpdate" ) {

		Game.playerTurn = networkMessage.data.player;

	}

	if( networkMessage.type == "thinkingColumn" ) {

		var player = networkMessage.data.player;
		var column = networkMessage.data.column;

		if(player == Game.playerTurn) {

			Game.thinkingColumn = column;

		}

	}

	if( networkMessage.type == "win" ) {

		Game.winner = networkMessage.data.winner;

		Game.state = "over";

	}

});

//
// Game over state
//
var gameOverState = addGameState("over");

gameOverState.addDrawCallback(function() {

	this.game.context.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

	this.game.context.fillStyle = "#eee";
	this.game.context.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

	drawMessage("Game Over - Player " + Game.winner + " wins!");

});

function addGameState(name) {

	Game.states[ name ] = new GameState( Game );

	return Game.states[ name ];

}

function drawBoard(board) {
	
	for(var x = 0; x < board.width; x++) {
	
		for(var y = 0; y < board.height; y++) {
			
			var value = board.getSpace(x, y);
			
			drawCell(board, x, y);
			
			if(value != 0) drawPiece(board, x, y, value);
			
		}
	
	}
	
}

function drawCell(board, x, y) {
	
	var cw = Game.canvas.width / board.width;
	var ch = Game.canvas.height / board.height;
	var hcw = cw / 2;
	var hch = ch / 2;
	
	Game.context.fillStyle = Game.settings.boardColor;
	Game.context.fillRect(x * cw, y * ch, cw, ch);
	
	Game.context.save();
	Game.context.globalCompositeOperation = "destination-out";
	drawPiece(board, x, y, 0);
	Game.context.restore();
	
}

function drawPiece(board, x, y, value) {
	
	var cw = Game.canvas.width / board.width;
	var ch = Game.canvas.height / board.height;
	var hcw = cw / 2;
	var hch = ch / 2;  
	var color = Game.settings.playerColors[ value ];
	
	Game.context.fillStyle = color;
	Game.context.beginPath();
	Game.context.arc(x * cw + hcw, y * ch + hch, hcw / 1.5, 0, 2 * Math.PI, false);
	Game.context.fill();
	
}

function drawActiveGame() {

	Game.context.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
	
	Game.context.fillStyle = "#ccc";
	Game.context.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
	
	drawBoard( Game.board );

	//
	// Thinking piece
	//
	Game.context.save();
	Game.context.globalCompositeOperation = "destination-over";
	drawPiece(Game.board, Game.thinkingColumn, -0.25, Game.playerTurn);
	Game.context.restore();

	if(Game.playerTurn != Player.number) {

		drawMessage("Waiting on other player to play");

	}

}

function drawMessage(text, color) {

	var textSize = Game.context.measureText( text );
	var p = 10;
	var cx = Game.canvas.width / 2;
	var cy = Game.canvas.height / 2;
	var fontSize = 16;

	var boxWidth = textSize.width + (p * 2);
	var boxHeight = fontSize + (p * 2);

	Game.context.save();

	Game.context.translate(cx - boxWidth / 2, cy - boxHeight / 2);

	Game.context.fillStyle = color || "rgba(0, 0, 0, 0.8)";
	Game.context.fillRect(0, 0, boxWidth, boxHeight);

	Game.context.fillStyle = "#fff";
	Game.context.textBaseline = "top";
	Game.context.fillText(text, p, p);

	Game.context.restore();

}

function initScreensaver() {

	for(var i = 0; i < Screensaver.number; i++) {

		Screensaver.pieces.push({
			x : Game.canvas.width * Math.random(),
			y : Game.canvas.height * Math.random(),
			player : (i % 2) + 1,
			speed : Math.random() * 3 + 1,
			size : Game.canvas.width / 10
		});

	}

}

function updateScreensaver() {

	for(var i = 0; i < Screensaver.number; i++) {

		var piece = Screensaver.pieces[ i ];

		piece.y += piece.speed;

		if(piece.y > Game.canvas.height + piece.size) piece.y = -Math.random() * 100;

	}

}

function drawScreensaver() {

	for(var i = 0; i < Screensaver.number; i++) {

		var piece = Screensaver.pieces[ i ];

		var color = Game.settings.playerColors[ piece.player ];
	
		Game.context.fillStyle = color;
		Game.context.beginPath();
		Game.context.arc(piece.x, piece.y, piece.size / 2, 0, 2 * Math.PI, false);
		Game.context.fill();

	}

}

function init() {

	//
	// Game
	//
	Game.network = new Net( Game.settings.serverURL );
	
	//
	// Init graphics
	//
	Game.canvas = document.querySelector("#game-canvas");
	Game.canvas.width = Game.settings.width;
	Game.canvas.height = Game.settings.height;
	Game.context = Game.canvas.getContext("2d");
	Game.context.font = Game.settings.font;

	initScreensaver();
	
	//
	// Event Listeners
	//
	Game.canvas.addEventListener("click", onBoardClick);
	Game.canvas.addEventListener("mousemove", onBoardMouseMove);

	Game.network.on("connect", onNetworkConnected);
	Game.network.on("disconnect", onNetworkDisconnected);
	Game.network.on("message", onNetworkMessage);
	
	//
	// Start game loop
	//
	loop();
	
}

function loop() {
	
	requestAnimationFrame( loop );
	
	update();
	
	draw();
	
}

function update() {

	var gameState = Game.states[ Game.state ];

	gameState.update();
	
}

function draw() {

	var gameState = Game.states[ Game.state ];

	gameState.draw();
	
}

function onNetworkConnected() {

	Game.state = "waiting";

}

function onNetworkDisconnected() {

	Game.state = "disconnected";

}

function onNetworkMessage(message) {

	var gameState = Game.states[ Game.state ];

	gameState.handleNetworkMessage(message);

}

function onBoardClick(e) {

	if(Game.state == "starting") {

		Game.network.connect();

		Game.state = "connecting";

		return;

	}

	if(Game.state == "active") {
	
		var x = e.offsetX / Game.canvas.width;
		var y = e.offsetY / Game.canvas.height;
		
		var p = Game.board.pointToCell(x, y);

		Game.network.send( new NetworkMessage("makePlay", { player : Player.number, column : p.x }) );

	}
	
}

function onBoardMouseMove(e) {

	if(Game.state != "active") return;
	
	Game.mx = e.offsetX / Game.canvas.width;
	Game.my = e.offsetY / Game.canvas.height;
	
}

document.addEventListener("DOMContentLoaded", function() {
	
	init();
	
});
