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
		    [1, -1, 1, 1, 1, 1, 1, -1],
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
		}
	}
	updateKingPosition();
	updateDangerMap();
	drawBoard(data.board);

	function drawBoard(board) {
	    for (var i = 0; i < board.length; i++) {
	        for (var j = 0; j < board[i].length; j++) {
	            switch (Math.abs(board[i][j])) {
	                case 0:
	                    removePieceVisual(i, j);
	                    break;
	                case 1:
	                    setPeice(i, j, "pawn " + (board[i][j] > 0 ? "black" : "white"));
	                    break;
	                case 5.1:
	                    setPeice(i, j, "rook " + (board[i][j] > 0 ? "black" : "white"));
	                    break;
	                case 3.33:
	                    setPeice(i, j, "bishop " + (board[i][j] > 0 ? "black" : "white"));
	                    break;
	                case 3.2:
	                    setPeice(i, j, "knight " + (board[i][j] > 0 ? "black" : "white"));
	                    break;
	                case 8.8:
	                    setPeice(i, j, "queen " + (board[i][j] > 0 ? "black" : "white"));
	                    break;
	                case 41:
	                    setPeice(i, j, "king " + (board[i][j] > 0 ? "black" : "white"));
	                    break;
	            }

	        };
	    };

	}
	$(document).on('click', '.piece', function() {
		if($(this).parent().hasClass('possibility')){
			return;
		}
		var j = $('.row .tile').index($(this).parent()) % 8;
	    var i = Math.floor($('.row .tile').index($(this).parent()) / 8);
	    if(!pieceHasTurn(data.board,[i,j])){return;}
		if(hasSelected()){
			hidePossibleMoves();
			unSelect();
		}
	    var possibilities = getPossibleMoves(data.board,i,j);
	    if(possibilities){
	    	showPossibleMoves(possibilities);
	    }
	    selectPiece([i,j]);
	});
	$(document).on('click', '.possibility', function() {
		if(hasSelected()){
		    var j = $('.row .tile').index(this) % 8;
		    var i = Math.floor($('.row .tile').index(this) / 8);
		    moveTo(data.board,data.selectedPiece,[i,j]);
			if($(this).hasClass('casteling')){
				$(this).removeClass('casteling');
				//down (white)
				if(i == 7){
					//left
					if(j>4){
						moveTo(data.board,[7,7],[i,j-1]);
						swapTurn();
					}else{//right
						moveTo(data.board,[7,0],[i,j+1]);
						swapTurn();
					}
				}else if(i == 0){//up (black)
					//left
					if(j>4){
						moveTo(data.board,[0,7],[i,j-1]);
						swapTurn();
					}else{//right
						moveTo(data.board,[0,0],[i,j+1]);
						swapTurn();
					}
				}
			}
			if($(this).hasClass('en-passant')){
				$(this).removeClass('en-passant');
				var side = getSide(data.board[i][j]);
				if(side == 'white'){
					removePiece(data.board,[i+1,j]);
				}else{
					removePiece(data.board,[i-1,j]);
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
							placePiece(data.board,[$(this).parent().data('i'),$(this).parent().data('j')],$(this).val(),getSide(data.board[$(this).parent().data('i')][$(this).parent().data('j')]));
						}
						$(this).attr('selected',false);
					})
				})
			}
		}
	});
	function pieceHasTurn(board,target) {
		if(getSide(board[target[0]][target[1]]) == 'white'){
			if(data.turn){
				return true
			}
		}else{
			if(!data.turn){
				return true;
			}
		}
		return false;
	}
	function swapTurn() {
		if(data.turn){
			data.turn = 0;
		}else{
			data.turn = 1;
		}
	}
	function removePiece(board, target) {
		board[target[0]][target[1]] = 0;
		updateDangerMap(data);
		drawBoard(board);
	}
	function placePiece(board,target,piece,side) {
		if(side == 'white'){
			board[target[0]][target[1]] = -piece;
		}else{
			board[target[0]][target[1]] = piece;
		}
		updateDangerMap(data);
		drawBoard(board);
	}
	function moveTo(board, from, to) {
		if(isWon(board,to)){
			endGame(board,to);
		}
		trackProgression(board, from, to);
		displayProgression();
		movePiece(board,from,to);
		hidePossibleMoves();
		unSelect();
		swapTurn();
		updateDangerMap(data);
		updateKingPosition();
		drawBoard(board);
	}
	function trackProgression(board, from, to) {
		var j = ['A','B','C','D','E','F','G','H'];
		var i = ['1','2','3','4','5','6','7','8'];
		data.progression.push([board[from[0]][from[1]],getBoardTileHuman(from),getBoardTileHuman(to)]);
	}
	function getBoardTileHuman(coordinates) {
		var j = ['A','B','C','D','E','F','G','H'];
		var i = ['1','2','3','4','5','6','7','8'];
		return j[coordinates[1]] + i[coordinates[0]];
	}
	function getBoardTileAi(str) {
		var j = ['A','B','C','D','E','F','G','H'];
		return [parseInt(str.substr(1,2))-1,j.indexOf(str.substr(0,1))];
	}
	function displayProgression(){
		var lastMove = data.progression[data.progression.length-1];
		$('.progression').append('<div class="tracked-move">' + getSide(lastMove[0]) + ' ' + getPiece(lastMove[0]) + ' moved ' + lastMove[1] + ' -> ' + lastMove[2] + '</div>');
	}
	function movePiece(board,from,to) {
		var piece = board[from[0]][from[1]];
		var value = board[to[0]][to[1]];
		board[from[0]][from[1]] = 0;
		board[to[0]][to[1]] = piece;
		return value;
	}
	function isWon(board,target) {
		if(Math.abs(board[target[0]][target[1]]) == 41){
			return true;
		}
		return false;
	}
	function endGame(board,to) {
		$(document).off('click', '.piece');
		$('body').prepend(getSide(board[to[0]][to[1]]) + ' won the game! Congrats!');
	}
	function selectPiece(target) {
		$('.row:eq(' + target[0] + ') .tile:eq(' + target[1] + ')').addClass('selected');
		data.selectedPiece = target;
	}
	function hasSelected() {
		if(data.selectedPiece.length){
			return true;
		}
		return false;
	}
	function unSelect() {
		$('.selected').removeClass('selected');
		data.selectedPiece = [];
	}
	function updateDangerMap() {
		data.danger.white = getDangerMap(data.board,'white');
		data.danger.black = getDangerMap(data.board,'black');
	}
	function updateKingPosition() {
		data.king.white = getKingPos(data.board,'white');
		data.king.black = getKingPos(data.board,'black');
	}
	function getDangerMap(board,side) {
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
		if(side == 'black'){
			// for (var i = 0; i < board.length; i++) {
			// 	for (var j = 0; j < board[i].length; j++) {
			// 		if(board[i][j]<0){
			// 			dangerTiles = dangerTiles.concat(getPossibleMoves(board,i,j,true));
			// 		}
			// 	};
			// };
			for (var i = board.length - 1; i >= 0; i--) {
				for (var j = board[i].length - 1; j >= 0; j--) {
					if(board[i][j]<0){
						dangerTiles = dangerTiles.concat(getPossibleMoves(board,i,j,true));
					}
				};
			};
		}else{
			for (var i = board.length - 1; i >= 0; i--) {
				for (var j = board[i].length - 1; j >= 0; j--) {
					if(board[i][j]>0){
						dangerTiles = dangerTiles.concat(getPossibleMoves(board,i,j,true));
					}
				};
			};
		}
		for (var i = 0; i < dangerTiles.length; i++) {
			dangerMap[dangerTiles[i][0]][dangerTiles[i][1]] = 1;
		};
		return dangerMap;
	}
	function setPeice(i, j, classes) {
	    $('.row:eq(' + i + ') .tile:eq(' + j + ')').html('<div class="piece ' + classes + '"></div>');
	}
	function getKingPos(board,side) {
		if (side == 'black') {
			for (var i = 0; i < board.length; i++) {
				for (var j = 0; j < board[i].length; j++) {
					if(board[i][j] == 41){
						return [i,j];
					}
				};
			};
		}else{
			for (var i = 0; i < board.length; i++) {
				for (var j = 0; j < board[i].length; j++) {
					if(board[i][j] == -41){
						return [i,j];
					}
				};
			};
		}
	}
	function cloneBoard(board) {
		var result = [];
		var temp = []
		for (var i = 0; i < board.length; i++) {
			temp = [];
			for (var j = 0; j < board[i].length; j++) {
				temp.push(board[i][j]);
			};
			result.push(temp);
		};
		return result;
	}
	function removePieceVisual(i, j) {
	    $('.row:eq(' + i + ') .tile:eq(' + j + ')').html('');
	}
	function inDanger(side,map,pos) {
		//default check is king
		if(!pos){
			pos = data.king[side];
		}
		if(map[pos[0]][pos[1]]){
			return true;
		}
		return false;
	}
	function getPossibleMoves(board,i,j,danger) {
		if(danger){
	   		switch(Math.abs(board[i][j])){
		        case 1:
		            return getPossiblePawnMoveDanger(board,i,j);
		            break;
		        case 5.1:
		        	return getPossibleRookMoveDanger(board,i,j);
		        	break;
		        case 3.33:
		        	return getPossibleBishopMoveDanger(board,i,j);
		        	break;
		        case 3.2:
		        	return getPossibleKnightMoveDanger(board,i,j);
		        	break;
		        case 8.8:
		        	return getPossibleQueenMoveDanger(board,i,j);
		        	break;
		        case 41:
		        	return getPossibleKingMoveDanger(board,i,j);
		    }
		}else{
		    switch(Math.abs(board[i][j])){
		        case 1:
		            return getPossiblePawnMove(board,i,j);
		            break;
		        case 5.1:
		        	return getPossibleRookMove(board,i,j);
		        	break;
		        case 3.33:
		        	return getPossibleBishopMove(board,i,j);
		        	break;
		        case 3.2:
		        	return getPossibleKnightMove(board,i,j);
		        case 8.8:
		        	return getPossibleQueenMove(board,i,j);
		        	break;
		        case 41:
		        	return getPossibleKingMove(board,i,j);
		    }
		}
	}
	function getPiece(piece) {
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

	}
	function getSide(piece) {
		//var eval = (piece?piece > 0:board[from[0]][from[1]] > 0);
		if (piece > 0) {
			return 'black';
		}else{
			return 'white';
		}
	}
	function putsKingInDanger(from,to) {
		//clone board
		var tempBoard = cloneBoard(data.board);
		var side = getSide(tempBoard[from[0]][from[1]]);
		//move piece
		movePiece(tempBoard,from,to);
		//check if king in danger
		var tempDangerMap = getDangerMap(tempBoard,side);
		showDangerMap(tempDangerMap);
		drawBoard(tempBoard);
		hideDangerMap();
		drawBoard(data.board);
		var result;
		if(Math.abs(data.board[from[0]][from[1]]) == 41){
			result = inDanger(side,tempDangerMap,[to[0],to[1]]);
		}else{
			result = inDanger(side,tempDangerMap);
		}
		tempBoard = null;
		tempDangerMap = null;
		return result;
	}
	
	/* Possible Moves */
	//pawn
	function getPossiblePawnMove(board,i,j) {
	    if(Math.abs(board[i][j]) != 1){return;}
	    var possibilities = [];
	    //move one step forward
	    if((i>0 && i<7) && board[i+board[i][j]][j] == 0){
	        if(!putsKingInDanger([i,j],[i+board[i][j],j])){
	        	if((i+board[i][j]) == 0 || (i+board[i][j]) == 7){
	        		possibilities.push([i+board[i][j],j,'promotion']);
	        	}else{
	        		possibilities.push([i+board[i][j],j]);
	        	}
	        }
	    }
	    //move two steps forward
	    if((board[i][j]>0?i==1:i==6) && board[i+board[i][j]][j] == 0 && board[i+(board[i][j]*2)][j] == 0){
	        if(!putsKingInDanger([i,j],[i+(board[i][j]*2),j])){
	        	possibilities.push([i+(board[i][j]*2),j]);
	        }
	    }
	    //move one step diagonal
	    if((i>0 && i<7)){
	        if((j>0) && board[i+board[i][j]][j-1] != 0 && ((board[i+board[i][j]][j-1]*board[i][j])<0)){
	            if(!putsKingInDanger([i,j],[i+board[i][j],j-1])){
		        	if((i+board[i][j]) == 0 || (i+board[i][j]) == 7){
		        		possibilities.push([i+board[i][j],j-1,'promotion']);
		        	}else{
		        		possibilities.push([i+board[i][j],j-1]);
		        	}
	            }
	        }
	        if ((j<7) && board[i+board[i][j]][j+1] && ((board[i+board[i][j]][j+1]*board[i][j])<0)) {
	            if(!putsKingInDanger([i,j],[i+board[i][j],j+1])){
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
	    	var side = getSide(board[i][j]);
	    	if(side == 'white'){
	    		if(i == 3){
	    			//left
	    			if(j>0){
	    				if(board[i][j-1] == 1){
	    					var lastMove = data.progression[data.progression.length-1];
	    					var from = getBoardTileAi(lastMove[1]);
	    					var to = getBoardTileAi(lastMove[2]);
	    					if(to[0] == i && to[1] == j-1 && from[0] == i-2 && from[1] == j-1){
	    						possibilities.push([i-1,j-1,'en-passant']);
	    					}
	    				}
	    			}
	    			//right
	    			if(j<7){
	    				if(board[i][j+1] == 1){
	    					var lastMove = data.progression[data.progression.length-1];
	    					var from = getBoardTileAi(lastMove[1]);
	    					var to = getBoardTileAi(lastMove[2]);
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
	    					var from = getBoardTileAi(lastMove[1]);
	    					var to = getBoardTileAi(lastMove[2]);
	    					if(to[0] == i && to[1] == j-1 && from[0] == i+2 && from[1] == j-1){
	    						possibilities.push([i+1,j-1,'en-passant']);
	    					}
	    				}
	    			}
	    			//right
	    			if(j<7){
	    				if(board[i][j+1] == -1){
	    					var lastMove = data.progression[data.progression.length-1];
	    					var from = getBoardTileAi(lastMove[1]);
	    					var to = getBoardTileAi(lastMove[2]);
	    					if(to[0] == i && to[1] == j+1 && from[0] == i+2 && from[1] == j+1){
	    						possibilities.push([i+1,j+1,'en-passant']);
	    					}
	    				}
	    			}
	    		}
	    	}
	    }
	    return possibilities;
	}
	//pawn danger
	function getPossiblePawnMoveDanger(board,i,j) {
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
	}
	//rook
	function getPossibleRookMove(board,i,j) {
	    if(Math.abs(board[i][j]) != 5.1){return;}
	    var possibilities = [];
	    //move up
	    var up = 1;
	    var stop = false;
	    while(i-up >= 0 && !stop){
	    	//empty
	    	if(board[i-up][j] == 0){
	    		if(!putsKingInDanger([i,j],[i-up,j])){
	        		possibilities.push([i-up,j]);
	        	}
	    	}else if ((board[i-up][j]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i-up,j])){
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
	    		if(!putsKingInDanger([i,j],[i+down,j])){
	        		possibilities.push([i+down,j]);
	        	}
	    	}else if ((board[i+down][j]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i+down,j])){
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
	    		if(!putsKingInDanger([i,j],[i,j-left])){
	        		possibilities.push([i,j-left]);
	        	}
	    	}else if ((board[i][j-left]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i,j-left])){
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
	    		if(!putsKingInDanger([i,j],[i,j+right])){
	        		possibilities.push([i,j+right]);
	        	}
	    	}else if ((board[i][j+right]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i,j+right])){
	        		possibilities.push([i,j+right]);
	        	}
	    		stop = true;
	    	}
	    	right++;
	    }
	    return possibilities;
	}
	//rook danger
	function getPossibleRookMoveDanger(board,i,j) {
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
	}
	//bishop
	function getPossibleBishopMove(board,i,j) {
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
		    		if(!putsKingInDanger([i,j],[i-up,j-left])){
		        		possibilities.push([i-up,j-left]);
		        	}
	    		}else if((board[i-up][j-left]*board[i][j]) > 0) {//own piece
	    			stopUp = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i-up,j-left])){
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
		    		if(!putsKingInDanger([i,j],[i+down,j-left])){
		        		possibilities.push([i+down,j-left]);
		        	}
	    		}else if((board[i+down][j-left]*board[i][j]) > 0) {//own piece
	    			stopDown = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i+down,j-left])){
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
		    		if(!putsKingInDanger([i,j],[i-up,j+right])){
		        		possibilities.push([i-up,j+right]);
		        	}
	    		}else if((board[i-up][j+right]*board[i][j]) > 0) {//own piece
	    			stopUp = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i-up,j+right])){
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
		    		if(!putsKingInDanger([i,j],[i+down,j+right])){
		        		possibilities.push([i+down,j+right]);
		        	}
	    		}else if((board[i+down][j+right]*board[i][j]) > 0) {//own piece
	    			stopDown = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i+down,j+right])){
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
	}
	//bishop danger
	function getPossibleBishopMoveDanger(board,i,j) {
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
	}
	//queen
	function getPossibleQueenMove(board,i,j) {
	    if(Math.abs(board[i][j]) != 8.8){return;}
	    var possibilities = [];
	    	    //move up
	    var up = 1;
	    var stop = false;
	    while(i-up >= 0 && !stop){
	    	//empty
	    	if(board[i-up][j] == 0){
	    		if(!putsKingInDanger([i,j],[i-up,j])){
	        		possibilities.push([i-up,j]);
	        	}
	    	}else if ((board[i-up][j]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i-up,j])){
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
	    		if(!putsKingInDanger([i,j],[i+down,j])){
	        		possibilities.push([i+down,j]);
	        	}
	    	}else if ((board[i+down][j]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i+down,j])){
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
	    		if(!putsKingInDanger([i,j],[i,j-left])){
	        		possibilities.push([i,j-left]);
	        	}
	    	}else if ((board[i][j-left]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i,j-left])){
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
	    		if(!putsKingInDanger([i,j],[i,j+right])){
	        		possibilities.push([i,j+right]);
	        	}
	    	}else if ((board[i][j+right]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i,j+right])){
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
		    		if(!putsKingInDanger([i,j],[i-up,j-left])){
		        		possibilities.push([i-up,j-left]);
		        	}
	    		}else if((board[i-up][j-left]*board[i][j]) > 0) {//own piece
	    			stopUp = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i-up,j-left])){
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
		    		if(!putsKingInDanger([i,j],[i+down,j-left])){
		        		possibilities.push([i+down,j-left]);
		        	}
	    		}else if((board[i+down][j-left]*board[i][j]) > 0) {//own piece
	    			stopDown = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i+down,j-left])){
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
		    		if(!putsKingInDanger([i,j],[i-up,j+right])){
		        		possibilities.push([i-up,j+right]);
		        	}
	    		}else if((board[i-up][j+right]*board[i][j]) > 0) {//own piece
	    			stopUp = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i-up,j+right])){
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
		    		if(!putsKingInDanger([i,j],[i+down,j+right])){
		        		possibilities.push([i+down,j+right]);
		        	}
	    		}else if((board[i+down][j+right]*board[i][j]) > 0) {//own piece
	    			stopDown = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i+down,j+right])){
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
	}
	//queen danger
	function getPossibleQueenMoveDanger(board,i,j) {
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
	}
	//king
	function getPossibleKingMove(board,i,j) {
		if(Math.abs(board[i][j]) != 41){return;}
	    var possibilities = [];
	    //up
	    if(i>0){
	    	if(board[i-1][j] == 0){//empty
	    		if(!putsKingInDanger([i,j],[i-1,j])){
	        		possibilities.push([i-1,j]);
	        	}
	    	}else if((board[i-1][j]*board[i][j]) < 0){//enemy piece
	    		if(!putsKingInDanger([i,j],[i-1,j])){
	        		possibilities.push([i-1,j]);
	        	}
	    	}
	    	//up -> left
	    	if(j>0){
	    		if(board[i-1][j-1] == 0){//empty
		    		if(!putsKingInDanger([i,j],[i-1,j-1])){
		        		possibilities.push([i-1,j-1]);
		        	}
		    	}else if((board[i-1][j-1]*board[i][j]) < 0){//enemy piece
		    		if(!putsKingInDanger([i,j],[i-1,j-1])){
		        		possibilities.push([i-1,j-1]);
		        	}
		    	}
	    	}
	    	//up -> right
	    	if(j<7){
	    		if(board[i-1][j+1] == 0){//empty
		    		if(!putsKingInDanger([i,j],[i-1,j+1])){
		        		possibilities.push([i-1,j+1]);
		        	}
		    	}else if((board[i-1][j+1]*board[i][j]) < 0){//enemy piece
		    		if(!putsKingInDanger([i,j],[i-1,j+1])){
		        		possibilities.push([i-1,j+1]);
		        	}
		    	}
	    	}
	    }
	    //left
	    if(j>0){
    		if(board[i][j-1] == 0){//empty
	    		if(!putsKingInDanger([i,j],[i,j-1])){
	        		possibilities.push([i,j-1]);
	        	}
	    	}else if((board[i][j-1]*board[i][j]) < 0){//enemy piece
	    		if(!putsKingInDanger([i,j],[i,j-1])){
	        		possibilities.push([i,j-1]);
	        	}
	    	}
    	}
    	//right
    	if(j<7){
    		if(board[i][j+1] == 0){//empty
	    		if(!putsKingInDanger([i,j],[i,j+1])){
	        		possibilities.push([i,j+1]);
	        	}
	    	}else if((board[i][j+1]*board[i][j]) < 0){//enemy piece
	    		if(!putsKingInDanger([i,j],[i,j+1])){
	        		possibilities.push([i,j+1]);
	        	}
	    	}
    	}
    	//down
    	if(i<7){
	    	if(board[i+1][j] == 0){//empty
	    		if(!putsKingInDanger([i,j],[i+1,j])){
	        		possibilities.push([i+1,j]);
	        	}
	    	}else if((board[i+1][j]*board[i][j]) < 0){//enemy piece
	    		if(!putsKingInDanger([i,j],[i+1,j])){
	        		possibilities.push([i+1,j]);
	        	}
	    	}
	    	//down -> left
	    	if(j>0){
	    		if(board[i+1][j-1] == 0){//empty
		    		if(!putsKingInDanger([i,j],[i+1,j-1])){
		        		possibilities.push([i+1,j-1]);
		        	}
		    	}else if((board[i+1][j-1]*board[i][j]) < 0){//enemy piece
		    		if(!putsKingInDanger([i,j],[i+1,j-1])){
		        		possibilities.push([i+1,j-1]);
		        	}
		    	}
	    	}
	    	//down -> right
	    	if(j<7){
	    		if(board[i+1][j+1] == 0){//empty
		    		if(!putsKingInDanger([i,j],[i+1,j+1])){
		        		possibilities.push([i+1,j+1]);
		        	}
		    	}else if((board[i+1][j+1]*board[i][j]) < 0){//enemy piece
		    		if(!putsKingInDanger([i,j],[i+1,j+1])){
		        		possibilities.push([i+1,j+1]);
		        	}
		    	}
	    	}
	    }
	    if(data.special.casteling){
	    	if(!hasMoved(board[i][j])){
	    		var rook = (board[i][j]<0?-5.1:5.1);
	    		var side = getSide(board[i][j]);
	    		var map = data.danger[side];
	    		if(board[i][7] == rook){//left has rook
	    			if(!hasMoved(rook,[i,7])){//rook has never been moved
	    				if(board[i][6] == 0 && board[i][5] == 0){//path is free
	    					if(!inDanger(side,map,[i,5]) && !inDanger(side,map,[i,6]) && !inDanger(side,map)){
	    						if(!putsKingInDanger([i,j],[i,6])){//careful only checks when king only moves
					        		possibilities.push([i,6,'casteling']);
					        	}
	    					}

	    				}
	    			}
	    		}
	    		if(board[i][0] == rook){//right has rook
					if(!hasMoved(rook,[i,0])){//rook is ok for casteling
	    				if(board[i][1] == 0 && board[i][2] == 0 && board[i][3] == 0){//path is free
	    					if(!inDanger(side,map,[i,2]) && !inDanger(side,map,[i,3]) && !inDanger(side,map)){
	    						if(!putsKingInDanger([i,j],[i,2])){//careful only checks when king only moves
					        		possibilities.push([i,2,'casteling']);
					        	}
	    					}
	    				}
	    			}
	    		}
	    	}
	    }
	    return possibilities;
	}
	//king danger
	function getPossibleKingMoveDanger(board,i,j) {
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
	}
	//knight 
	function getPossibleKnightMove(board,i,j) {
		if(Math.abs(board[i][j]) != 3.2){return;}
	    var possibilities = [];
	    //up one -> left two
	    if(i>0 && j>1){
	    	if(board[i-1][j-2] == 0 || (board[i-1][j-2]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i-1,j-2])){
	        		possibilities.push([i-1,j-2]);
	        	}
	    	}
	    }
	    //up one -> right two
	    if(i>0 && j<6){
	    	if(board[i-1][j+2] == 0 || (board[i-1][j+2]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i-1,j+2])){
	        		possibilities.push([i-1,j+2]);
	        	}
	    	}
	    }
	    //up two -> left one
	    if(i>1 && j>0){
	    	if(board[i-2][j-1] == 0 || (board[i-2][j-1]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i-2,j-1])){
	        		possibilities.push([i-2,j-1]);
	        	}
	    	}
	    }
	    //up two -> right one
	    if(i>1 && j<7){
	    	if(board[i-2][j+1] == 0 || (board[i-2][j+1]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i-2,j+1])){
	        		possibilities.push([i-2,j+1]);
	        	}
	    	}
	    }
	    //down one -> left two
	    if(i<7 && j>1){
	    	if(board[i+1][j-2] == 0 || (board[i+1][j-2]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i+1,j-2])){
	        		possibilities.push([i+1,j-2]);
	        	}
	    	}
	    }
	    //down one -> right two
	    if(i<7 && j<6){
	    	if(board[i+1][j+2] == 0 || (board[i+1][j+2]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i+1,j+2])){
	        		possibilities.push([i+1,j+2]);
	        	}
	    	}
	    }
	    //down two -> left one
	    if(i<6 && j>0){
	    	if(board[i+2][j-1] == 0 || (board[i+2][j-1]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i+2,j-1])){
	        		possibilities.push([i+2,j-1]);
	        	}
	    	}
	    }
	    //down two -> right one
	    if(i<6 && j<7){
	    	if(board[i+2][j+1] == 0 || (board[i+2][j+1]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i+2,j+1])){
	        		possibilities.push([i+2,j+1]);
	        	}
	    	}
	    }
	    return possibilities;
	}
	//knight danger
	function getPossibleKnightMoveDanger(board,i,j) {
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
	function hasMoved(piece,from) {
		for (var i = data.progression.length - 1; i >= 0; i--) {
			if(data.progression[i][0] == piece){
				if(from){
					var fromCompare = getBoardTileAi(data.progression[i][1]);
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
	function showPossibleMoves(possibilities) {
	    for (var i = possibilities.length - 1; i >= 0; i--) {
	        $('.row:eq(' + possibilities[i][0] + ') .tile:eq(' + possibilities[i][1] + ')').addClass('possibility');
	        if(possibilities[i].length > 2){
	        	$('.row:eq(' + possibilities[i][0] + ') .tile:eq(' + possibilities[i][1] + ')').addClass(possibilities[i][2]);
	        }
	    };
	}
	function hidePossibleMoves() {
	    $('.possibility').removeClass('possibility');
	}
});
function showDangerMap(map) {
	for (var i = map.length - 1; i >= 0; i--) {
		for (var j = map.length - 1; j >= 0; j--) {
			if(map[i][j] == 1){
				$('.row:eq(' + i + ') .tile:eq(' + j + ')').addClass('danger-map');
			}
		};
	};
}
function hideDangerMap(map) {
	$('.danger-map').removeClass('danger-map');
}