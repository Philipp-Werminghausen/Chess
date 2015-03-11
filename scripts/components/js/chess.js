/* 
    Chess AI
    by Philipp Werminghausen
    1/17/2015
    
*/
$(function () {
	//currently active board
	window.data= {
		board:[
		    [5.1, 3.2, 3.33, 8.8, 41, 3.33, 3.2, 5.1],
		    [1, 1, 1, 1, 1, 1, 1, 1],
		    [0, 0, 0, 0, 0, 0, 0, 0],
		    [0, 0, 0, 0, 0, 0, 0, 0],
		    [0, 0, 0, 0, 0, 0, 0, 0],
		    [0, 0, 0, 0, 0, 0, 0, 0],
		    [-1, -1, -1, -1, -1, -1, -1, -1],
		    [-5.1, -3.2, -3.33, -8.8, -41, -3.33, -3.2, -5.1]
		],
		progression:[],
		selectedPiece:[],
		turn:1,//1 = white first
		king:{
			'white':'',
			'black':''
		},
		danger:{
			'white':'',
			'black':''
		},
		special:{
			'casteling':true,
			'en passant':true,
			'promotion':false
		},
		possibleMoves:{
			'white':0,
			'black':0
		}
	}
	module.board.updateKingPosition();
	module.board.updateDangerMap();
	module.board.updatePossibleMoves();
	module.ui.drawBoard(data.board);
	module.ui.updateUi();

	$(document).on('click', '.piece', function() {
		if($(this).parent().hasClass('possibility')){
			return;
		}
		var j = $('.row .tile').index($(this).parent()) % 8;
	    var i = Math.floor($('.row .tile').index($(this).parent()) / 8);
	    if(!module.board.pieceHasTurn(data.board,[i,j])){return;}
		if(module.board.hasSelected()){
			module.ui.hidePossibleMoves();
			module.ui.unSelect();
		}
	    var possibilities = module.possibilities.getPossibleMoves(data.board,i,j);
	    if(possibilities){
	    	module.ui.showPossibleMoves(possibilities);
	    }
	    module.ui.selectPiece([i,j]);
	});
	$(document).on('click', '.possibility', function() {
		if(module.board.hasSelected()){
		    var j = $('.row .tile').index(this) % 8;
		    var i = Math.floor($('.row .tile').index(this) / 8);
		    module.board.moveTo(data.board,data.selectedPiece,[i,j]);
			if($(this).hasClass('casteling')){
				$(this).removeClass('casteling');
				//down (white)
				if(i == 7){
					//left
					if(j>4){
						module.board.moveTo(data.board,[7,7],[i,j-1]);
					}else{//right
						module.board.moveTo(data.board,[7,0],[i,j+1]);
					}
				}else if(i == 0){//up (black)
					//left
					if(j>4){
						module.board.moveTo(data.board,[0,7],[i,j-1]);
					}else{//right
						module.board.moveTo(data.board,[0,0],[i,j+1]);
					}
				}
			}
			if($(this).hasClass('en-passant')){
				$(this).removeClass('en-passant');
				var side = module.ui.getSide(data.board[i][j]);
				if(side == 'white'){
					module.board.removePiece(data.board,[i+1,j]);
				}else{
					module.board.removePiece(data.board,[i-1,j]);
				}
			}
			if($(this).hasClass('promotion')){
				$(this).removeClass('promotion');
				$('.choose').show();
				$('.choose').data('i',i);
				$('.choose').data('j',j);
				$('.choose').on('change',function () {
					$('.choose').off('change').hide();
					$('.choose option').each(function () {
						if($(this).is(':selected')){
							module.board.placePiece(data.board,[$(this).parent().data('i'),$(this).parent().data('j')],$(this).val(),module.ui.getSide(data.board[$(this).parent().data('i')][$(this).parent().data('j')]));
						}
						$(this).attr('selected',false);
					})
				});
			}
			module.board.swapTurn();
			if(data.turn && !data.possibleMoves.white){
				module.ui.endGame(1);
			}else if(!data.turn && !data.possibleMoves.black){
				module.ui.endGame(-1);
			}
			module.ui.updateUi();
		}
	});
});
var module = {};
module.ai = {};
//first AI Ace!
module.ai.ace = {
	defensive: {
		//if it is in threat by how much/many?
		threat:function () {
			// body...
		},
		//its value
		value:function () {
			// body...
		},
		//how many pieces are covering it and how valuable are they
		protection:function () {
			// body...
		},
		//how this piece is defending other pieces, but being in the way or covering them
		defending:function () {
			// body...
		}
	},
	attack: {
		//pieces endangered by it the more and the more valuable this goes up
		threatening: function () {
			// body...
		},
		//if locking a piece because it is protecting the piece behind
		threatLock: function () {
			// body...
		},
		//the amount of fields on the board covered 
		threatCover: function () {
			// body...
		}
	}

};

module.ui = {
	drawBoard: function(board) {
	    for (var i = 0; i < board.length; i++) {
	        for (var j = 0; j < board[i].length; j++) {
	            switch (Math.abs(board[i][j])) {
	                case 0:
	                    module.ui.removePiece(i, j);
	                    break;
	                case 1:
	                    module.ui.setPeice(i, j, "pawn " + module.ui.getSide(board[i][j]));
	                    break;
	                case 5.1:
	                    module.ui.setPeice(i, j, "rook " + module.ui.getSide(board[i][j]));
	                    break;
	                case 3.33:
	                    module.ui.setPeice(i, j, "bishop " + module.ui.getSide(board[i][j]));
	                    break;
	                case 3.2:
	                    module.ui.setPeice(i, j, "knight " + module.ui.getSide(board[i][j]));
	                    break;
	                case 8.8:
	                    module.ui.setPeice(i, j, "queen " + module.ui.getSide(board[i][j]));
	                    break;
	                case 41:
	                    module.ui.setPeice(i, j, "king " + module.ui.getSide(board[i][j]));
	                    break;
	            }
	        };
	    };
	},
	removePiece: function(i, j) {
	    $('.row:eq(' + i + ') .tile:eq(' + j + ')').html('');
	},
	setPeice: function(i, j, classes) {
	    $('.row:eq(' + i + ') .tile:eq(' + j + ')').html('<div class="piece ' + classes + '"></div>');
	},
	getSide: function (piece) {
		if (piece > 0) {
			return 'black';
		}else{
			return 'white';
		}
	},
	selectPiece: function(target) {
		$('.row:eq(' + target[0] + ') .tile:eq(' + target[1] + ')').addClass('selected');
		data.selectedPiece = target;
	},
	unSelect: function() {
		$('.selected').removeClass('selected');
		data.selectedPiece = [];
	},
	getBoardTileHuman: function (coordinates) {
		var j = ['A','B','C','D','E','F','G','H'];
		var i = ['1','2','3','4','5','6','7','8'];
		return j[coordinates[1]] + i[coordinates[0]];
	},
	displayProgression: function(){
		var lastMove = data.progression[data.progression.length-1];
		$('.progression').append('<div class="tracked-move">' + module.ui.getSide(lastMove[0]) + ' ' + module.ui.getPiece(lastMove[0]) + ' moved ' + module.ui.getBoardTileHuman(lastMove[1]) + ' -> ' + module.ui.getBoardTileHuman(lastMove[2]) + '</div>');
	},
	getPiece: function(piece) {
		switch(Math.abs(piece)){
			case 1:
				return 'Pesant';
				break;
			case 3.2:
				return 'Knight';
				break;
			case 3.33:
				return 'Bishop';
				break;
			case 5.1:
				return 'Rook';
				break;
			case 8.8:
				return 'Queen';
				break;
			case 41:
				return 'King';
				break;
			default:
				return 'Nothing';
		}
	},
	endGame: function(piece) {
		$(document).off('click', '.piece');
		$('body').prepend(module.ui.getSide(piece) + ' won the game! Congrats!');
	},
	showDangerMap: function(map) {
		for (var i = map.length - 1; i >= 0; i--) {
			for (var j = map.length - 1; j >= 0; j--) {
				if(map[i][j] == 1){
					$('.row:eq(' + i + ') .tile:eq(' + j + ')').addClass('danger-map');
				}
			};
		};
	},
	hideDangerMap: function(map) {
		$('.danger-map').removeClass('danger-map');
	},
	showPossibleMoves: function (possibilities) {
	    for (var i = possibilities.length - 1; i >= 0; i--) {
	        $('.row:eq(' + possibilities[i][0] + ') .tile:eq(' + possibilities[i][1] + ')').addClass('possibility');
	        if(possibilities[i].length > 2){
	        	$('.row:eq(' + possibilities[i][0] + ') .tile:eq(' + possibilities[i][1] + ')').addClass(possibilities[i][2]);
	        }
	    };
	},
	hidePossibleMoves: function () {
	    $('.possibility').removeClass('possibility');
	},
	showWhosTurnItIs:function () {
		if(data.turn){
			$('.turn').html('It\'s Whites turn to make a move! White has <strong>' + data.possibleMoves.white + '</strong> possible moves!');
		}else{
			$('.turn').html('It\'s Blacks turn to make a move! Black has <strong>' + data.possibleMoves.black + '</strong> possible moves!');
		}
	},
	updateUi:function () {
		module.ui.showWhosTurnItIs();
	}
}
module.board = {
	getSide: function (piece) {
		if(!piece){return 'not a piece';}
		if (piece < 0) {
			return 1;
		}
		return 0;
	},
	removePiece: function (board, target) {
		board[target[0]][target[1]] = 0;
		module.board.updateDangerMap(data);
		module.ui.drawBoard(board);
	},
	placePiece: function(board,target,piece,side) {
		if(side == 'white'){
			board[target[0]][target[1]] = -piece;
		}else{
			board[target[0]][target[1]] = piece;
		}
		module.board.updateDangerMap(data);
		module.ui.drawBoard(board);
	},
	movePiece: function(board,from,to) {
		var piece = board[from[0]][from[1]];
		var value = board[to[0]][to[1]];
		board[from[0]][from[1]] = 0;
		board[to[0]][to[1]] = piece;
		return value;
	},
	hasSelected: function() {
		if(data.selectedPiece.length){
			return true;
		}
		return false;
	},
	pieceHasTurn: function(board,target) {
		if(module.board.getSide(board[target[0]][target[1]]) == data.turn){
				return true;
		}
		return false;
	},
	swapTurn: function() {
		if(data.turn){
			data.turn = 0;
		}else{
			data.turn = 1;
		}
	},
	moveTo: function(board, from, to) {
		if(module.board.isKing(board[to[0]][to[1]])){
			module.ui.endGame(board[to[0]][to[1]]);
		}
		module.board.trackProgression(board, from, to);
		module.ui.displayProgression();
		module.board.movePiece(board,from,to);
		module.ui.hidePossibleMoves();
		module.ui.unSelect();
		module.board.updateDangerMap(data);
		module.board.updateKingPosition();
		module.board.updatePossibleMoves();
		module.ui.drawBoard(board);
	},
	trackProgression: function(board, from, to) {
		data.progression.push([board[from[0]][from[1]],from,to]);
	},
	isKing: function(piece) {
		if(Math.abs(piece) == 41){
			return true;
		}
		return false;
	},
	cloneBoard: function(board) {
		var result = [];
		var temp = [];
		for (var i = 0; i < board.length; i++) {
			temp = [];
			for (var j = 0; j < board[i].length; j++) {
				temp.push(board[i][j]);
			};
			result.push(temp);
		};
		return result;
	},
	updateDangerMap: function() {
		data.danger.white = module.board.getDangerMap(data.board,1);
		data.danger.black = module.board.getDangerMap(data.board,0);
	},
	updateKingPosition: function() {
		data.king.white = module.board.getKingPos(data.board,1);
		data.king.black = module.board.getKingPos(data.board,0);
	},
	updatePossibleMoves: function() {
		data.possibleMoves.white = module.board.getMoves(data.board,1);
		data.possibleMoves.black = module.board.getMoves(data.board,0);
	},
	getMoves:function (board,side) {
		var dangerTiles = [];
		for (var i = board.length - 1; i >= 0; i--) {
			for (var j = board[i].length - 1; j >= 0; j--) {
				var temp = module.board.getSide(board[i][j]);
				if(side == temp){
					dangerTiles = dangerTiles.concat(module.possibilities.getPossibleMoves(board,i,j));
				}
			};
		};
		return dangerTiles.length;
	},
	getDangerMap: function(board,side) {
		var dangerMap = [
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0]
			]
		var dangerTiles = [];
		for (var i = board.length - 1; i >= 0; i--) {
			for (var j = board[i].length - 1; j >= 0; j--) {
				var temp = module.board.getSide(board[i][j]);
				if(side != temp && temp != "not a piece"){
					dangerTiles = dangerTiles.concat(module.possibilities.getPossibleMoves(board,i,j,true));
				}
			};
		};
		for (var i = 0; i < dangerTiles.length; i++) {
			dangerMap[dangerTiles[i][0]][dangerTiles[i][1]] = 1;
		};
		return dangerMap;
	},
	getKingPos: function(board,side) {
		var king = 41;
		if(side){
			king = -41;
		}
		for (var i = 0; i < board.length; i++) {
			for (var j = 0; j < board[i].length; j++) {
				if(board[i][j] == king){
					return [i,j];
				}
			};
		};
	},
	inDanger: function(side,dangerMap,pos) {
		if(!pos){
			pos = data.king[side];
		}
		if(dangerMap[pos[0]][pos[1]]){
			return true;
		}
		return false;
	},
	putsKingInDanger: function(from,to) {
		//clone board
		var tempBoard = module.board.cloneBoard(data.board);
		var sideBoard = module.board.getSide(tempBoard[from[0]][from[1]]);
		var sideUi = module.ui.getSide(tempBoard[from[0]][from[1]]);
		//move piece
		module.board.movePiece(tempBoard,from,to);
		//check if king in danger
		var tempDangerMap = module.board.getDangerMap(tempBoard,sideBoard);
		module.ui.showDangerMap(tempDangerMap);
		module.ui.drawBoard(tempBoard);
		module.ui.hideDangerMap();
		module.ui.drawBoard(data.board);
		var result;
		if(module.board.isKing(data.board[from[0]][from[1]])){
			result = module.board.inDanger(sideUi,tempDangerMap,[to[0],to[1]]);
		}else{
			result = module.board.inDanger(sideUi,tempDangerMap);
		}
		tempBoard = null;
		tempDangerMap = null;
		return result;
	},
	hasMoved: function (piece,from) {
		for (var i = data.progression.length - 1; i >= 0; i--) {
			if(data.progression[i][0] == piece){
				if(from){
					var fromCompare = data.progression[i][1];
					if(fromCompare[0] == from[0] && fromCompare[1] == from[1]){
						return true;
					}
				}else{
					return true;
				}
			}
		};
		return false;
	}
}
module.possibilities = {
	getPossibleMoves: function(board,i,j,danger) {
		if(danger){
	   		switch(Math.abs(board[i][j])){
		        case 1:
		            return module.possibilities.getPossiblePawnMoveDanger(board,i,j);
		            break;
		        case 5.1:
		        	return module.possibilities.getPossibleRookMoveDanger(board,i,j);
		        	break;
		        case 3.33:
		        	return module.possibilities.getPossibleBishopMoveDanger(board,i,j);
		        	break;
		        case 3.2:
		        	return module.possibilities.getPossibleKnightMoveDanger(board,i,j);
		        	break;
		        case 8.8:
		        	return module.possibilities.getPossibleQueenMoveDanger(board,i,j);
		        	break;
		        case 41:
		        	return module.possibilities.getPossibleKingMoveDanger(board,i,j);
		    }
		}else{
		    switch(Math.abs(board[i][j])){
		        case 1:
		            return module.possibilities.getPossiblePawnMove(board,i,j);
		            break;
		        case 5.1:
		        	return module.possibilities.getPossibleRookMove(board,i,j);
		        	break;
		        case 3.33:
		        	return module.possibilities.getPossibleBishopMove(board,i,j);
		        	break;
		        case 3.2:
		        	return module.possibilities.getPossibleKnightMove(board,i,j);
		        case 8.8:
		        	return module.possibilities.getPossibleQueenMove(board,i,j);
		        	break;
		        case 41:
		        	return module.possibilities.getPossibleKingMove(board,i,j);
		    }
		}
	},
	//pawn
	getPossiblePawnMove: function(board,i,j) {
	    if(Math.abs(board[i][j]) != 1){return;}
	    var possibilities = [];
	    //move one step forward
	    if((i>0 && i<7) && board[i+board[i][j]][j] == 0){
	        if(!module.board.putsKingInDanger([i,j],[i+board[i][j],j])){
	        	if((i+board[i][j]) == 0 || (i+board[i][j]) == 7){
	        		possibilities.push([i+board[i][j],j,'promotion']);
	        	}else{
	        		possibilities.push([i+board[i][j],j]);
	        	}
	        }
	    }
	    //move two steps forward
	    if((board[i][j]>0?i==1:i==6) && board[i+board[i][j]][j] == 0 && board[i+(board[i][j]*2)][j] == 0){
	        if(!module.board.putsKingInDanger([i,j],[i+(board[i][j]*2),j])){
	        	possibilities.push([i+(board[i][j]*2),j]);
	        }
	    }
	    //move one step diagonal
	    if((i>0 && i<7)){
	        if((j>0) && board[i+board[i][j]][j-1] != 0 && ((board[i+board[i][j]][j-1]*board[i][j])<0)){
	            if(!module.board.putsKingInDanger([i,j],[i+board[i][j],j-1])){
		        	if((i+board[i][j]) == 0 || (i+board[i][j]) == 7){
		        		possibilities.push([i+board[i][j],j-1,'promotion']);
		        	}else{
		        		possibilities.push([i+board[i][j],j-1]);
		        	}
	            }
	        }
	        if ((j<7) && board[i+board[i][j]][j+1] && ((board[i+board[i][j]][j+1]*board[i][j])<0)) {
	            if(!module.board.putsKingInDanger([i,j],[i+board[i][j],j+1])){
		        	if((i+board[i][j]) == 0 || (i+board[i][j]) == 7){
		        		possibilities.push([i+board[i][j],j+1,'promotion']);
		        	}else{
		        		possibilities.push([i+board[i][j],j+1]);
		        	}
	            }
	        };
	    }
	    //En Passant
	    if(data.special['en passant']){
	    	var side = module.ui.getSide(board[i][j]);
	    	if(side == 'white'){
	    		if(i == 3){
	    			//left
	    			if(j>0){
	    				if(board[i][j-1] == 1){
	    					var lastMove = data.progression[data.progression.length-1];
	    					var from = lastMove[1];
	    					var to = lastMove[2];
	    					if(to[0] == i && to[1] == j-1 && from[0] == i-2 && from[1] == j-1){
	    						possibilities.push([i-1,j-1,'en-passant']);
	    					}
	    				}
	    			}
	    			//right
	    			if(j<7){
	    				if(board[i][j+1] == 1){
	    					var lastMove = data.progression[data.progression.length-1];
	    					var from = lastMove[1];
	    					var to = lastMove[2];
	    					if(to[0] == i && to[1] == j+1 && from[0] == i-2 && from[1] == j+1){
	    						possibilities.push([i-1,j+1,'en-passant']);
	    					}
	    				}
	    			}
	    		}
	    	}else{//black
	    		if(i == 4){
	    			//left
	    			if(j>0){
	    				if(board[i][j-1] == -1){
	    					var lastMove = data.progression[data.progression.length-1];
	    					var from = lastMove[1];
	    					var to = lastMove[2];
	    					if(to[0] == i && to[1] == j-1 && from[0] == i+2 && from[1] == j-1){
	    						possibilities.push([i+1,j-1,'en-passant']);
	    					}
	    				}
	    			}
	    			//right
	    			if(j<7){
	    				if(board[i][j+1] == -1){
	    					var lastMove = data.progression[data.progression.length-1];
	    					var from = lastMove[1];
	    					var to = lastMove[2];
	    					if(to[0] == i && to[1] == j+1 && from[0] == i+2 && from[1] == j+1){
	    						possibilities.push([i+1,j+1,'en-passant']);
	    					}
	    				}
	    			}
	    		}
	    	}
	    }
	    return possibilities;
	},
	//pawn danger
	getPossiblePawnMoveDanger: function(board,i,j) {
	    if(Math.abs(board[i][j]) != 1){return;}
	    var possibilities = [];
	    //move one step diagonal
	    if((i>0 && i<7)){
	        if((j>0)){
	            possibilities.push([i+board[i][j],j-1]);
	        }
	        if ((j<7)) {
	            possibilities.push([i+board[i][j],j+1]);
	        };
	    }
	    return possibilities;
	},
	//rook
	getPossibleRookMove: function(board,i,j) {
	    if(Math.abs(board[i][j]) != 5.1){return;}
	    var possibilities = [];
	    //move up
	    var up = 1;
	    var stop = false;
	    while(i-up >= 0 && !stop){
	    	//empty
	    	if(board[i-up][j] == 0){
	    		if(!module.board.putsKingInDanger([i,j],[i-up,j])){
	        		possibilities.push([i-up,j]);
	        	}
	    	}else if ((board[i-up][j]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!module.board.putsKingInDanger([i,j],[i-up,j])){
	        		possibilities.push([i-up,j]);
	        	}
	    		stop = true;
	    	}
	    	up++;
	    }
	    //move down
	    var down = 1;
	    stop = false;
	    while(i+down <= 7 && !stop){
	    	//empty
	    	if(board[i+down][j] == 0){
	    		if(!module.board.putsKingInDanger([i,j],[i+down,j])){
	        		possibilities.push([i+down,j]);
	        	}
	    	}else if ((board[i+down][j]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!module.board.putsKingInDanger([i,j],[i+down,j])){
	        		possibilities.push([i+down,j]);
	        	}
	    		stop = true;
	    	}
	    	down++;
	    }
	    //move left
	    var left = 1;
	    stop = false;
	    while(j-left >= 0 && !stop){
	    	//empty
	    	if(board[i][j-left] == 0){
	    		if(!module.board.putsKingInDanger([i,j],[i,j-left])){
	        		possibilities.push([i,j-left]);
	        	}
	    	}else if ((board[i][j-left]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!module.board.putsKingInDanger([i,j],[i,j-left])){
	        		possibilities.push([i,j-left]);
	        	}
	    		stop = true;
	    	}
	    	left++;
	    }
	    //move right
	    var right = 1;
	    stop = false;
	    while(j+right <= 7 && !stop){
	    	//empty
	    	if(board[i][j+right] == 0){
	    		if(!module.board.putsKingInDanger([i,j],[i,j+right])){
	        		possibilities.push([i,j+right]);
	        	}
	    	}else if ((board[i][j+right]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!module.board.putsKingInDanger([i,j],[i,j+right])){
	        		possibilities.push([i,j+right]);
	        	}
	    		stop = true;
	    	}
	    	right++;
	    }
	    return possibilities;
	},
	//rook danger
	getPossibleRookMoveDanger: function(board,i,j) {
	    if(Math.abs(board[i][j]) != 5.1){return;}
	    var possibilities = [];
	    //move up
	    var up = 1;
	    var stop = false;
	    while(i-up >= 0 && !stop){
	    	//empty
	    	if(board[i-up][j] == 0){
	    		possibilities.push([i-up,j]);
	    	}else if ((board[i-up][j]*board[i][j]) > 0) {//own piece
	    		possibilities.push([i-up,j]);
	    		stop = true;
	    	}else{//enemie piece
	    		possibilities.push([i-up,j]);
	    		stop = true;
	    	}
	    	up++;
	    }
	    //move down
	    var down = 1;
	    stop = false;
	    while(i+down <= 7 && !stop){
	    	//empty
	    	if(board[i+down][j] == 0){
	    		possibilities.push([i+down,j]);
	    	}else if ((board[i+down][j]*board[i][j]) > 0) {//own piece
	    		possibilities.push([i+down,j]);
	    		stop = true;
	    	}else{//enemie piece
	    		possibilities.push([i+down,j]);
	    		stop = true;
	    	}
	    	down++;
	    }
	    //move left
	    var left = 1;
	    stop = false;
	    while(j-left >= 0 && !stop){
	    	//empty
	    	if(board[i][j-left] == 0){
	    		possibilities.push([i,j-left]);
	    	}else if ((board[i][j-left]*board[i][j]) > 0) {//own piece
	    		possibilities.push([i,j-left]);
	    		stop = true;
	    	}else{//enemie piece
	    		possibilities.push([i,j-left]);
	    		stop = true;
	    	}
	    	left++;
	    }
	    //move right
	    var right = 1;
	    stop = false;
	    while(j+right <= 7 && !stop){
	    	//empty
	    	if(board[i][j+right] == 0){
	    		possibilities.push([i,j+right]);
	    	}else if ((board[i][j+right]*board[i][j]) > 0) {//own piece
	    		possibilities.push([i,j+right]);
	    		stop = true;
	    	}else{//enemie piece
	    		possibilities.push([i,j+right]);
	    		stop = true;
	    	}
	    	right++;
	    }
	    return possibilities;
	},
	//bishop
	getPossibleBishopMove: function(board,i,j) {
	    if(Math.abs(board[i][j]) != 3.33){return;}
	    var possibilities = [];
	    //left
	    var left = 1,
	    	up = 1,
	    	down = 1;
	    var stopUp = false,
	    	stopDown = false;
	    while(j-left >= 0 && (!stopUp || !stopDown)){
	    	//up
	    	if(i-up >=0 && !stopUp){
	    		if(board[i-up][j-left] == 0){//empty
		    		if(!module.board.putsKingInDanger([i,j],[i-up,j-left])){
		        		possibilities.push([i-up,j-left]);
		        	}
	    		}else if((board[i-up][j-left]*board[i][j]) > 0) {//own piece
	    			stopUp = true;
	    		}else{//enemie piece
		    		if(!module.board.putsKingInDanger([i,j],[i-up,j-left])){
		        		possibilities.push([i-up,j-left]);
		        	}
	    			stopUp = true;
	    		}
	    	}else{
	    		stopUp = true;
	    	}
	    	up++;
	    	//down
	    	if(i+down <= 7 && !stopDown){
	    		if(board[i+down][j-left] == 0){//empty
		    		if(!module.board.putsKingInDanger([i,j],[i+down,j-left])){
		        		possibilities.push([i+down,j-left]);
		        	}
	    		}else if((board[i+down][j-left]*board[i][j]) > 0) {//own piece
	    			stopDown = true;
	    		}else{//enemie piece
		    		if(!module.board.putsKingInDanger([i,j],[i+down,j-left])){
		        		possibilities.push([i+down,j-left]);
		        	}
	    			stopDown = true;
	    		}
	    	}else{
	    		stopDown = true;
	    	}
	    	down++;
	    	left++;
	    }
	    //right
	    var right = 1;
	    left = 1;
	    up = 1;
	    down = 1;
	    stopUp = false,
	    stopDown = false;
	    while(j+right <= 7 && (!stopUp || !stopDown)){
	    	//up
	    	if(i-up >=0 && !stopUp){
	    		if(board[i-up][j+right] == 0){//empty
		    		if(!module.board.putsKingInDanger([i,j],[i-up,j+right])){
		        		possibilities.push([i-up,j+right]);
		        	}
	    		}else if((board[i-up][j+right]*board[i][j]) > 0) {//own piece
	    			stopUp = true;
	    		}else{//enemie piece
		    		if(!module.board.putsKingInDanger([i,j],[i-up,j+right])){
		        		possibilities.push([i-up,j+right]);
		        	}
	    			stopUp = true;
	    		}
	    	}else{
	    		stopUp = true;
	    	}
	    	up++;
	    	//down
	    	if(i+down <= 7 && !stopDown){
	    		if(board[i+down][j+right] == 0){//empty
		    		if(!module.board.putsKingInDanger([i,j],[i+down,j+right])){
		        		possibilities.push([i+down,j+right]);
		        	}
	    		}else if((board[i+down][j+right]*board[i][j]) > 0) {//own piece
	    			stopDown = true;
	    		}else{//enemie piece
		    		if(!module.board.putsKingInDanger([i,j],[i+down,j+right])){
		        		possibilities.push([i+down,j+right]);
		        	}
	    			stopDown = true;
	    		}
	    	}else{
	    		stopDown = true;
	    	}
	    	down++;
	    	right++;
	    }
	    return possibilities;
	},
	//bishop danger
	getPossibleBishopMoveDanger: function(board,i,j) {
	    if(Math.abs(board[i][j]) != 3.33){return;}
	    var possibilities = [];
	    //left
	    var left = 1,
	    	up = 1,
	    	down = 1;
	    var stopUp = false,
	    	stopDown = false;
	    while(j-left >= 0 && (!stopUp || !stopDown)){
	    	//up
	    	if(i-up >=0 && !stopUp){
	    		if(board[i-up][j-left] == 0){//empty
	    			possibilities.push([i-up,j-left]);
	    		}else if((board[i-up][j-left]*board[i][j]) > 0) {//own piece
	    			possibilities.push([i-up,j-left]);
	    			stopUp = true;
	    		}else{//enemie piece
	    			possibilities.push([i-up,j-left]);
	    			stopUp = true;
	    		}
	    	}else{
	    		stopUp = true;
	    	}
	    	up++;
	    	//down
	    	if(i+down <= 7 && !stopDown){
	    		if(board[i+down][j-left] == 0){//empty
	    			possibilities.push([i+down,j-left]);
	    		}else if((board[i+down][j-left]*board[i][j]) > 0) {//own piece
	    			possibilities.push([i+down,j-left]);
	    			stopDown = true;
	    		}else{//enemie piece
	    			possibilities.push([i+down,j-left]);
	    			stopDown = true;
	    		}
	    	}else{
	    		stopDown = true;
	    	}
	    	down++;
	    	left++;
	    }
	    //right
	    var right = 1;
	    left = 1;
	    up = 1;
	    down = 1;
	    stopUp = false,
	    stopDown = false;
	    while(j+right <= 7 && (!stopUp || !stopDown)){
	    	//up
	    	if(i-up >=0 && !stopUp){
	    		if(board[i-up][j+right] == 0){//empty
	    			possibilities.push([i-up,j+right]);
	    		}else if((board[i-up][j+right]*board[i][j]) > 0) {//own piece
	    			possibilities.push([i-up,j+right]);
	    			stopUp = true;
	    		}else{//enemie piece
	    			possibilities.push([i-up,j+right]);
	    			stopUp = true;
	    		}
	    	}else{
	    		stopUp = true;
	    	}
	    	up++;
	    	//down
	    	if(i+down <= 7 && !stopDown){
	    		if(board[i+down][j+right] == 0){//empty
	    			possibilities.push([i+down,j+right]);
	    		}else if((board[i+down][j+right]*board[i][j]) > 0) {//own piece
	    			possibilities.push([i+down,j+right]);
	    			stopDown = true;
	    		}else{//enemie piece
	    			possibilities.push([i+down,j+right]);
	    			stopDown = true;
	    		}
	    	}else{
	    		stopDown = true;
	    	}
	    	down++;
	    	right++;
	    }
	    return possibilities;
	},
	//queen
	getPossibleQueenMove: function(board,i,j) {
	    if(Math.abs(board[i][j]) != 8.8){return;}
	    var possibilities = [];
	    	    //move up
	    var up = 1;
	    var stop = false;
	    while(i-up >= 0 && !stop){
	    	//empty
	    	if(board[i-up][j] == 0){
	    		if(!module.board.putsKingInDanger([i,j],[i-up,j])){
	        		possibilities.push([i-up,j]);
	        	}
	    	}else if ((board[i-up][j]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!module.board.putsKingInDanger([i,j],[i-up,j])){
	        		possibilities.push([i-up,j]);
	        	}
	    		stop = true;
	    	}
	    	up++;
	    }
	    //move down
	    var down = 1;
	    stop = false;
	    while(i+down <= 7 && !stop){
	    	//empty
	    	if(board[i+down][j] == 0){
	    		if(!module.board.putsKingInDanger([i,j],[i+down,j])){
	        		possibilities.push([i+down,j]);
	        	}
	    	}else if ((board[i+down][j]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!module.board.putsKingInDanger([i,j],[i+down,j])){
	        		possibilities.push([i+down,j]);
	        	}
	    		stop = true;
	    	}
	    	down++;
	    }
	    //move left
	    var left = 1;
	    stop = false;
	    while(j-left >= 0 && !stop){
	    	//empty
	    	if(board[i][j-left] == 0){
	    		if(!module.board.putsKingInDanger([i,j],[i,j-left])){
	        		possibilities.push([i,j-left]);
	        	}
	    	}else if ((board[i][j-left]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!module.board.putsKingInDanger([i,j],[i,j-left])){
	        		possibilities.push([i,j-left]);
	        	}
	    		stop = true;
	    	}
	    	left++;
	    }
	    //move right
	    var right = 1;
	    stop = false;
	    while(j+right <= 7 && !stop){
	    	//empty
	    	if(board[i][j+right] == 0){
	    		if(!module.board.putsKingInDanger([i,j],[i,j+right])){
	        		possibilities.push([i,j+right]);
	        	}
	    	}else if ((board[i][j+right]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!module.board.putsKingInDanger([i,j],[i,j+right])){
	        		possibilities.push([i,j+right]);
	        	}
	    		stop = true;
	    	}
	    	right++;
	    }
	    //left
	    left = 1;
	    up = 1;
	    down = 1;
	    var stopUp = false,
	    	stopDown = false;
	    while(j-left >= 0 && (!stopUp || !stopDown)){
	    	//up
	    	if(i-up >=0 && !stopUp){
	    		if(board[i-up][j-left] == 0){//empty
		    		if(!module.board.putsKingInDanger([i,j],[i-up,j-left])){
		        		possibilities.push([i-up,j-left]);
		        	}
	    		}else if((board[i-up][j-left]*board[i][j]) > 0) {//own piece
	    			stopUp = true;
	    		}else{//enemie piece
		    		if(!module.board.putsKingInDanger([i,j],[i-up,j-left])){
		        		possibilities.push([i-up,j-left]);
		        	}
	    			stopUp = true;
	    		}
	    	}else{
	    		stopUp = true;
	    	}
	    	up++;
	    	//down
	    	if(i+down <= 7 && !stopDown){
	    		if(board[i+down][j-left] == 0){//empty
		    		if(!module.board.putsKingInDanger([i,j],[i+down,j-left])){
		        		possibilities.push([i+down,j-left]);
		        	}
	    		}else if((board[i+down][j-left]*board[i][j]) > 0) {//own piece
	    			stopDown = true;
	    		}else{//enemie piece
		    		if(!module.board.putsKingInDanger([i,j],[i+down,j-left])){
		        		possibilities.push([i+down,j-left]);
		        	}
	    			stopDown = true;
	    		}
	    	}else{
	    		stopDown = true;
	    	}
	    	down++;
	    	left++;
	    }
	    //right
	    right = 1;
	    left = 1;
	    up = 1;
	    down = 1;
	    stopUp = false,
	    stopDown = false;
	    while(j+right <= 7 && (!stopUp || !stopDown)){
	    	//up
	    	if(i-up >=0 && !stopUp){
	    		if(board[i-up][j+right] == 0){//empty
		    		if(!module.board.putsKingInDanger([i,j],[i-up,j+right])){
		        		possibilities.push([i-up,j+right]);
		        	}
	    		}else if((board[i-up][j+right]*board[i][j]) > 0) {//own piece
	    			stopUp = true;
	    		}else{//enemie piece
		    		if(!module.board.putsKingInDanger([i,j],[i-up,j+right])){
		        		possibilities.push([i-up,j+right]);
		        	}
	    			stopUp = true;
	    		}
	    	}else{
	    		stopUp = true;
	    	}
	    	up++;
	    	//down
	    	if(i+down <= 7 && !stopDown){
	    		if(board[i+down][j+right] == 0){//empty
		    		if(!module.board.putsKingInDanger([i,j],[i+down,j+right])){
		        		possibilities.push([i+down,j+right]);
		        	}
	    		}else if((board[i+down][j+right]*board[i][j]) > 0) {//own piece
	    			stopDown = true;
	    		}else{//enemie piece
		    		if(!module.board.putsKingInDanger([i,j],[i+down,j+right])){
		        		possibilities.push([i+down,j+right]);
		        	}
	    			stopDown = true;
	    		}
	    	}else{
	    		stopDown = true;
	    	}
	    	down++;
	    	right++;
	    }
	    return possibilities;
	},
	//queen danger
	getPossibleQueenMoveDanger: function(board,i,j) {
	    if(Math.abs(board[i][j]) != 8.8){return;}
	    var possibilities = [];
	    	    //move up
	    var up = 1;
	    var stop = false;
	    while(i-up >= 0 && !stop){
	    	//empty
	    	if(board[i-up][j] == 0){
	    		possibilities.push([i-up,j]);
	    	}else if ((board[i-up][j]*board[i][j]) > 0) {//own piece
	    		possibilities.push([i-up,j]);
	    		stop = true;
	    	}else{//enemie piece
	    		possibilities.push([i-up,j]);
	    		stop = true;
	    	}
	    	up++;
	    }
	    //move down
	    var down = 1;
	    stop = false;
	    while(i+down <= 7 && !stop){
	    	//empty
	    	if(board[i+down][j] == 0){
	    		possibilities.push([i+down,j]);
	    	}else if ((board[i+down][j]*board[i][j]) > 0) {//own piece
	    		possibilities.push([i+down,j]);
	    		stop = true;
	    	}else{//enemie piece
	    		possibilities.push([i+down,j]);
	    		stop = true;
	    	}
	    	down++;
	    }
	    //move left
	    var left = 1;
	    stop = false;
	    while(j-left >= 0 && !stop){
	    	//empty
	    	if(board[i][j-left] == 0){
	    		possibilities.push([i,j-left]);
	    	}else if ((board[i][j-left]*board[i][j]) > 0) {//own piece
	    		possibilities.push([i,j-left]);
	    		stop = true;
	    	}else{//enemie piece
	    		possibilities.push([i,j-left]);
	    		stop = true;
	    	}
	    	left++;
	    }
	    //move right
	    var right = 1;
	    stop = false;
	    while(j+right <= 7 && !stop){
	    	//empty
	    	if(board[i][j+right] == 0){
	    		possibilities.push([i,j+right]);
	    	}else if ((board[i][j+right]*board[i][j]) > 0) {//own piece
	    		possibilities.push([i,j+right]);
	    		stop = true;
	    	}else{//enemie piece
	    		possibilities.push([i,j+right]);
	    		stop = true;
	    	}
	    	right++;
	    }
	    //left
	    left = 1;
	    up = 1;
	    down = 1;
	    var stopUp = false,
	    	stopDown = false;
	    while(j-left >= 0 && (!stopUp || !stopDown)){
	    	//up
	    	if(i-up >=0 && !stopUp){
	    		if(board[i-up][j-left] == 0){//empty
	    			possibilities.push([i-up,j-left]);
	    		}else if((board[i-up][j-left]*board[i][j]) > 0) {//own piece
	    			possibilities.push([i-up,j-left]);
	    			stopUp = true;
	    		}else{//enemie piece
	    			possibilities.push([i-up,j-left]);
	    			stopUp = true;
	    		}
	    	}else{
	    		stopUp = true;
	    	}
	    	up++;
	    	//down
	    	if(i+down <= 7 && !stopDown){
	    		if(board[i+down][j-left] == 0){//empty
	    			possibilities.push([i+down,j-left]);
	    		}else if((board[i+down][j-left]*board[i][j]) > 0) {//own piece
	    			possibilities.push([i+down,j-left]);
	    			stopDown = true;
	    		}else{//enemie piece
	    			possibilities.push([i+down,j-left]);
	    			stopDown = true;
	    		}
	    	}else{
	    		stopDown = true;
	    	}
	    	down++;
	    	left++;
	    }
	    //right
	    var right = 1;
	    left = 1;
	    up = 1;
	    down = 1;
	    stopUp = false,
	    stopDown = false;
	    while(j+right <= 7 && (!stopUp || !stopDown)){
	    	//up
	    	if(i-up >=0 && !stopUp){
	    		if(board[i-up][j+right] == 0){//empty
	    			possibilities.push([i-up,j+right]);
	    		}else if((board[i-up][j+right]*board[i][j]) > 0) {//own piece
	    			possibilities.push([i-up,j+right]);
	    			stopUp = true;
	    		}else{//enemie piece
	    			possibilities.push([i-up,j+right]);
	    			stopUp = true;
	    		}
	    	}else{
	    		stopUp = true;
	    	}
	    	up++;
	    	//down
	    	if(i+down <= 7 && !stopDown){
	    		if(board[i+down][j+right] == 0){//empty
	    			possibilities.push([i+down,j+right]);
	    		}else if((board[i+down][j+right]*board[i][j]) > 0) {//own piece
	    			possibilities.push([i+down,j+right]);
	    			stopDown = true;
	    		}else{//enemie piece
	    			possibilities.push([i+down,j+right]);
	    			stopDown = true;
	    		}
	    	}else{
	    		stopDown = true;
	    	}
	    	down++;
	    	right++;
	    }
	    return possibilities;
	},
	//king
	getPossibleKingMove: function(board,i,j) {
		if(Math.abs(board[i][j]) != 41){return;}
	    var possibilities = [];
	    //up
	    if(i>0){
	    	if(board[i-1][j] == 0){//empty
	    		if(!module.board.putsKingInDanger([i,j],[i-1,j])){
	        		possibilities.push([i-1,j]);
	        	}
	    	}else if((board[i-1][j]*board[i][j]) < 0){//enemy piece
	    		if(!module.board.putsKingInDanger([i,j],[i-1,j])){
	        		possibilities.push([i-1,j]);
	        	}
	    	}
	    	//up -> left
	    	if(j>0){
	    		if(board[i-1][j-1] == 0){//empty
		    		if(!module.board.putsKingInDanger([i,j],[i-1,j-1])){
		        		possibilities.push([i-1,j-1]);
		        	}
		    	}else if((board[i-1][j-1]*board[i][j]) < 0){//enemy piece
		    		if(!module.board.putsKingInDanger([i,j],[i-1,j-1])){
		        		possibilities.push([i-1,j-1]);
		        	}
		    	}
	    	}
	    	//up -> right
	    	if(j<7){
	    		if(board[i-1][j+1] == 0){//empty
		    		if(!module.board.putsKingInDanger([i,j],[i-1,j+1])){
		        		possibilities.push([i-1,j+1]);
		        	}
		    	}else if((board[i-1][j+1]*board[i][j]) < 0){//enemy piece
		    		if(!module.board.putsKingInDanger([i,j],[i-1,j+1])){
		        		possibilities.push([i-1,j+1]);
		        	}
		    	}
	    	}
	    }
	    //left
	    if(j>0){
    		if(board[i][j-1] == 0){//empty
	    		if(!module.board.putsKingInDanger([i,j],[i,j-1])){
	        		possibilities.push([i,j-1]);
	        	}
	    	}else if((board[i][j-1]*board[i][j]) < 0){//enemy piece
	    		if(!module.board.putsKingInDanger([i,j],[i,j-1])){
	        		possibilities.push([i,j-1]);
	        	}
	    	}
    	}
    	//right
    	if(j<7){
    		if(board[i][j+1] == 0){//empty
	    		if(!module.board.putsKingInDanger([i,j],[i,j+1])){
	        		possibilities.push([i,j+1]);
	        	}
	    	}else if((board[i][j+1]*board[i][j]) < 0){//enemy piece
	    		if(!module.board.putsKingInDanger([i,j],[i,j+1])){
	        		possibilities.push([i,j+1]);
	        	}
	    	}
    	}
    	//down
    	if(i<7){
	    	if(board[i+1][j] == 0){//empty
	    		if(!module.board.putsKingInDanger([i,j],[i+1,j])){
	        		possibilities.push([i+1,j]);
	        	}
	    	}else if((board[i+1][j]*board[i][j]) < 0){//enemy piece
	    		if(!module.board.putsKingInDanger([i,j],[i+1,j])){
	        		possibilities.push([i+1,j]);
	        	}
	    	}
	    	//down -> left
	    	if(j>0){
	    		if(board[i+1][j-1] == 0){//empty
		    		if(!module.board.putsKingInDanger([i,j],[i+1,j-1])){
		        		possibilities.push([i+1,j-1]);
		        	}
		    	}else if((board[i+1][j-1]*board[i][j]) < 0){//enemy piece
		    		if(!module.board.putsKingInDanger([i,j],[i+1,j-1])){
		        		possibilities.push([i+1,j-1]);
		        	}
		    	}
	    	}
	    	//down -> right
	    	if(j<7){
	    		if(board[i+1][j+1] == 0){//empty
		    		if(!module.board.putsKingInDanger([i,j],[i+1,j+1])){
		        		possibilities.push([i+1,j+1]);
		        	}
		    	}else if((board[i+1][j+1]*board[i][j]) < 0){//enemy piece
		    		if(!module.board.putsKingInDanger([i,j],[i+1,j+1])){
		        		possibilities.push([i+1,j+1]);
		        	}
		    	}
	    	}
	    }
	    if(data.special.casteling){
	    	if(!module.board.hasMoved(board[i][j])){
	    		var rook = (board[i][j]<0?-5.1:5.1);
	    		var side = module.ui.getSide(board[i][j]);
	    		var map = data.danger[side];
	    		if(board[i][7] == rook){//left has rook
	    			if(!module.board.hasMoved(rook,[i,7])){//rook has never been moved
	    				if(board[i][6] == 0 && board[i][5] == 0){//path is free
	    					if(!module.board.inDanger(side,map,[i,5]) && !module.board.inDanger(side,map,[i,6]) && !module.board.inDanger(side,map)){
	    						if(!module.board.putsKingInDanger([i,j],[i,6])){//careful only checks when king only moves
					        		possibilities.push([i,6,'casteling']);
					        	}
	    					}

	    				}
	    			}
	    		}
	    		if(board[i][0] == rook){//right has rook
					if(!module.board.hasMoved(rook,[i,0])){//rook is ok for casteling
	    				if(board[i][1] == 0 && board[i][2] == 0 && board[i][3] == 0){//path is free
	    					if(!module.board.inDanger(side,map,[i,2]) && !module.board.inDanger(side,map,[i,3]) && !module.board.inDanger(side,map)){
	    						if(!module.board.putsKingInDanger([i,j],[i,2])){//careful only checks when king only moves
					        		possibilities.push([i,2,'casteling']);
					        	}
	    					}
	    				}
	    			}
	    		}
	    	}
	    }
	    return possibilities;
	},
	//king danger
	getPossibleKingMoveDanger: function(board,i,j) {
		if(Math.abs(board[i][j]) != 41){return;}
	    var possibilities = [];
	    //up
	    if(i>0){
	    	possibilities.push([i-1,j]);
	    	//up -> left
	    	if(j>0){
	    		possibilities.push([i-1,j-1]);
	    	}
	    	//up -> right
	    	if(j<7){
	    		possibilities.push([i-1,j+1]);
	    	}
	    }
	    //left
	    if(j>0){
    		possibilities.push([i,j-1]);
    	}
    	//right
    	if(j<7){
    		possibilities.push([i,j+1]);
    	}
    	//down
    	if(i<7){
	    	possibilities.push([i+1,j]);
	    	//down -> left
	    	if(j>0){
	    		possibilities.push([i+1,j-1]);
	    	}
	    	//down -> right
	    	if(j<7){
	    		possibilities.push([i+1,j+1]);
	    	}
	    }
	    return possibilities;
	},
	//knight 
	getPossibleKnightMove: function(board,i,j) {
		if(Math.abs(board[i][j]) != 3.2){return;}
	    var possibilities = [];
	    //up one -> left two
	    if(i>0 && j>1){
	    	if(board[i-1][j-2] == 0 || (board[i-1][j-2]*board[i][j]) < 0){//empty or enmy
	    		if(!module.board.putsKingInDanger([i,j],[i-1,j-2])){
	        		possibilities.push([i-1,j-2]);
	        	}
	    	}
	    }
	    //up one -> right two
	    if(i>0 && j<6){
	    	if(board[i-1][j+2] == 0 || (board[i-1][j+2]*board[i][j]) < 0){//empty or enmy
	    		if(!module.board.putsKingInDanger([i,j],[i-1,j+2])){
	        		possibilities.push([i-1,j+2]);
	        	}
	    	}
	    }
	    //up two -> left one
	    if(i>1 && j>0){
	    	if(board[i-2][j-1] == 0 || (board[i-2][j-1]*board[i][j]) < 0){//empty or enmy
	    		if(!module.board.putsKingInDanger([i,j],[i-2,j-1])){
	        		possibilities.push([i-2,j-1]);
	        	}
	    	}
	    }
	    //up two -> right one
	    if(i>1 && j<7){
	    	if(board[i-2][j+1] == 0 || (board[i-2][j+1]*board[i][j]) < 0){//empty or enmy
	    		if(!module.board.putsKingInDanger([i,j],[i-2,j+1])){
	        		possibilities.push([i-2,j+1]);
	        	}
	    	}
	    }
	    //down one -> left two
	    if(i<7 && j>1){
	    	if(board[i+1][j-2] == 0 || (board[i+1][j-2]*board[i][j]) < 0){//empty or enmy
	    		if(!module.board.putsKingInDanger([i,j],[i+1,j-2])){
	        		possibilities.push([i+1,j-2]);
	        	}
	    	}
	    }
	    //down one -> right two
	    if(i<7 && j<6){
	    	if(board[i+1][j+2] == 0 || (board[i+1][j+2]*board[i][j]) < 0){//empty or enmy
	    		if(!module.board.putsKingInDanger([i,j],[i+1,j+2])){
	        		possibilities.push([i+1,j+2]);
	        	}
	    	}
	    }
	    //down two -> left one
	    if(i<6 && j>0){
	    	if(board[i+2][j-1] == 0 || (board[i+2][j-1]*board[i][j]) < 0){//empty or enmy
	    		if(!module.board.putsKingInDanger([i,j],[i+2,j-1])){
	        		possibilities.push([i+2,j-1]);
	        	}
	    	}
	    }
	    //down two -> right one
	    if(i<6 && j<7){
	    	if(board[i+2][j+1] == 0 || (board[i+2][j+1]*board[i][j]) < 0){//empty or enmy
	    		if(!module.board.putsKingInDanger([i,j],[i+2,j+1])){
	        		possibilities.push([i+2,j+1]);
	        	}
	    	}
	    }
	    return possibilities;
	},
	//knight danger
	getPossibleKnightMoveDanger: function(board,i,j) {
		if(Math.abs(board[i][j]) != 3.2){return;}
	    var possibilities = [];
	    //up one -> left two
	    if(i>0 && j>1){
	    	possibilities.push([i-1,j-2]);
	    }
	    //up one -> right two
	    if(i>0 && j<6){
	    	possibilities.push([i-1,j+2]);
	    }
	    //up two -> left one
	    if(i>1 && j>0){
	    	possibilities.push([i-2,j-1]);
	    }
	    //up two -> right one
	    if(i>1 && j<7){
	    	possibilities.push([i-2,j+1]);
	    }
	    //down one -> left two
	    if(i<7 && j>1){
	    	possibilities.push([i+1,j-2]);
	    }
	    //down one -> right two
	    if(i<7 && j<6){
	    	possibilities.push([i+1,j+2]);
	    }
	    //down two -> left one
	    if(i<6 && j>0){
	    	possibilities.push([i+2,j-1]);
	    }
	    //down two -> right one
	    if(i<6 && j<7){
	    	possibilities.push([i+2,j+1]);
	    }
	    return possibilities;
	}
}
