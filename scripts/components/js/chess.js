/* 
    Chess AI
    by Philipp Werminghausen
    1/17/2015
    
*/

$(function () {
	window.board = [
	    [5.1, 3.2, 3.33, 8.8, 41, 3.33, 3.2, 5.1],
	    [1, 1, 1, 1, 1, 1, 1, 1],
	    [0, 0, 0, 0, 0, 0, 0, 0],
	    [0, 0, 0, 0, 0, 0, 0, 0],
	    [0, 0, 0, 0, 0, 0, 0, 0],
	    [0, 0, 0, 0, 0, 0, 0, 0],
	    [-1, -1, -1, -1, -1, -1, -1, -1],
	    [-5.1, -3.2, -3.33, -8.8, -41, -3.33, -3.2, -5.1]
	];
	window.dangerMapWhite = getDangerMap(board,'white');
	window.dangerMapBlack = getDangerMap(board,'black');
	var whiteKingPos = getKingPos('white');
	var blackKingPos = getKingPos('black');
	var selected = [];
	var turn = 1;//0 = black first
	drawBoard(board);

	function drawBoard(board) {
	    for (var i = 0; i < board.length; i++) {
	        for (var j = 0; j < board[i].length; j++) {
	            switch (Math.abs(board[i][j])) {
	                case 0:
	                    removePiece(i, j);
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
	    if(turn == 0 && board[i][j] < 0){ return; }
	    if(turn == 1 && board[i][j] > 0){ return; }
		if(!selected.length){
		    var possibilities = getPossibleMoves(board,i,j);
		    if(possibilities){
		    	showPossibleMoves(possibilities);
		    }
		    selected = [i,j];
		}else{
			hidePossibleMoves();
			selected = [];
		    var possibilities = getPossibleMoves(board,i,j);
		    if(possibilities){
		    	showPossibleMoves(possibilities);
		    }
		    selected = [i,j];
		}
	});
	$(document).on('click', '.possibility', function() {
		if(selected.length){
		    var j = $('.row .tile').index(this) % 8;
		    var i = Math.floor($('.row .tile').index(this) / 8);
			var piece = board[selected[0]][selected[1]];
			board[selected[0]][selected[1]] = 0;
			if(Math.abs(board[i][j]) == 41){
				$(document).off('click', '.piece');
				$('body').prepend((board[i][j]>0?'White':'Black') + ' won the game! Congrats!');
			}
			board[i][j] = piece;
			selected = [];
			hidePossibleMoves();
			if(turn){
				turn = 0;
			}else{
				turn = 1;
			}
			window.dangerMapWhite = getDangerMap(board,'black');
			window.dangerMapBlack = getDangerMap(board,'white');
			whiteKingPos = getKingPos('white');
			blackKingPos = getKingPos('black');
			drawBoard(board);
		}
	});
	// $(document).on('mouseenter', '.piece', function() { 
	//     var j = $('.row .tile').index($(this).parent()) % 8;
	//     var i = Math.floor($('.row .tile').index($(this).parent()) / 8);
	//     var possibilities = getPossibleMoves(board,i,j);
	//     if(possibilities){
	//     	showPossibleMoves(possibilities);
	//     }
	// }).on('mouseleave', ".piece", function() { 
	//     hidePossibleMoves();
	// });
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
			for (var i = board.length - 1; i >= 0; i--) {
				for (var j = board.length - 1; j >= 0; j--) {
					if(board[i][j]<0){
						dangerTiles = dangerTiles.concat(getPossibleMoves(board,i,j,true));
					}
				};
			};
		}else{
			for (var i = board.length - 1; i >= 0; i--) {
				for (var j = board.length - 1; j >= 0; j--) {
					if(board[i][j]>0){
						dangerTiles = dangerTiles.concat(getPossibleMoves(board,i,j,true));
					}
				};
			};
		}
		for (var i = dangerTiles.length - 1; i >= 0; i--) {
			dangerMap[dangerTiles[i][0]][dangerTiles[i][1]] = 1;
		};
		return dangerMap;
	}
	function setPeice(i, j, classes) {
	    $('.row:eq(' + i + ') .tile:eq(' + j + ')').html('<div class="piece ' + classes + '"></div>');
	}
	function getKingPos(side) {
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
	function removePiece(i, j) {
	    $('.row:eq(' + i + ') .tile:eq(' + j + ')').html('');
	}
	function isKingInDanger(side,map,pos) {
		if(side == 'black') {
			if(map[(pos?pos[0]:blackKingPos[0])][(pos?pos[1]:blackKingPos[1])]){
				return true;
			}
			return false;
		}else{
			if(map[(pos?pos[0]:whiteKingPos[0])][(pos?pos[1]:whiteKingPos[1])]){
				return true;
			}
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
	function putsKingInDanger(from,to,side) {
		var tempBoard = cloneBoard(board);
		var fromPiece = tempBoard[from[0]][from[1]];
		tempBoard[from[0]][from[1]] = 0;
		tempBoard[to[0]][to[1]] = fromPiece;
		side = (side=='black'?'white':'black');
		var tempDangerMap = getDangerMap(tempBoard,side);
		var result;
		if(Math.abs(board[from[0]][from[1]]) == 41){
			result = isKingInDanger(side,tempDangerMap,[to[0],to[1]]);
		}else{
			result = isKingInDanger(side,tempDangerMap);
		}
		showDangerMap(tempDangerMap);
		hideDangerMap();
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
	    if((i>0 || i<7) && board[i+board[i][j]][j] == 0){
	        if(!putsKingInDanger([i,j],[i+board[i][j],j],(board[i][j]<0?'black':'white'))){
	        	possibilities.push([i+board[i][j],j]);
	        }
	    }
	    //move two steps forward
	    if((board[i][j]>0?i==1:i==6) && board[i+board[i][j]][j] == 0 && board[i+(board[i][j]*2)][j] == 0){
	        if(!putsKingInDanger([i,j],[i+(board[i][j]*2),j],(board[i][j]<0?'black':'white'))){
	        	possibilities.push([i+(board[i][j]*2),j]);
	        }
	    }
	    //move one step diagonal
	    if((i>0 || i<7)){
	        if((j>0) && board[i+board[i][j]][j-1] != 0 && ((board[i+board[i][j]][j-1]*board[i][j])<0)){
	            if(!putsKingInDanger([i,j],[i+board[i][j],j-1],(board[i][j]<0?'black':'white'))){
	            	possibilities.push([i+board[i][j],j-1]);
	            }
	        }
	        if ((j<7) && board[i+board[i][j]][j+1] && ((board[i+board[i][j]][j+1]*board[i][j])<0)) {
	            if(!putsKingInDanger([i,j],[i+board[i][j],j+1],(board[i][j]<0?'black':'white'))){
	            	possibilities.push([i+board[i][j],j+1]);
	            }
	        };
	    }
	    return possibilities;
	}
	//pawn danger
	function getPossiblePawnMoveDanger(board,i,j) {
	    if(Math.abs(board[i][j]) != 1){return;}
	    var possibilities = [];
	    //move one step diagonal
	    if((i>0 || i<7)){
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
	    		if(!putsKingInDanger([i,j],[i-up,j],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i-up,j]);
	        	}
	    	}else if ((board[i-up][j]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i-up,j],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i-up,j]);
	        	}
	    		stop = true;
	    	}
	    	up++;
	    }
	    //move down
	    var down = 1;
	    stop = false;
	    while(i+down < 7 && !stop){
	    	//empty
	    	if(board[i+down][j] == 0){
	    		if(!putsKingInDanger([i,j],[i+down,j],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i+down,j]);
	        	}
	    	}else if ((board[i+down][j]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i+down,j],(board[i][j]<0?'black':'white'))){
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
	    		if(!putsKingInDanger([i,j],[i,j-left],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i,j-left]);
	        	}
	    	}else if ((board[i][j-left]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i,j-left],(board[i][j]<0?'black':'white'))){
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
	    		if(!putsKingInDanger([i,j],[i,j+right],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i,j+right]);
	        	}
	    	}else if ((board[i][j+right]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i,j+right],(board[i][j]<0?'black':'white'))){
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
	    while(i+down < 7 && !stop){
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
		    		if(!putsKingInDanger([i,j],[i-up,j-left],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i-up,j-left]);
		        	}
	    		}else if((board[i-up][j-left]*board[i][j]) > 0) {//own piece
	    			stopUp = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i-up,j-left],(board[i][j]<0?'black':'white'))){
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
		    		if(!putsKingInDanger([i,j],[i+down,j-left],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i+down,j-left]);
		        	}
	    		}else if((board[i+down][j-left]*board[i][j]) > 0) {//own piece
	    			stopDown = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i+down,j-left],(board[i][j]<0?'black':'white'))){
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
		    		if(!putsKingInDanger([i,j],[i-up,j+right],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i-up,j+right]);
		        	}
	    		}else if((board[i-up][j+right]*board[i][j]) > 0) {//own piece
	    			stopUp = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i-up,j+right],(board[i][j]<0?'black':'white'))){
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
		    		if(!putsKingInDanger([i,j],[i+down,j+right],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i+down,j+right]);
		        	}
	    		}else if((board[i+down][j+right]*board[i][j]) > 0) {//own piece
	    			stopDown = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i+down,j+right],(board[i][j]<0?'black':'white'))){
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
	    		if(!putsKingInDanger([i,j],[i-up,j],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i-up,j]);
	        	}
	    	}else if ((board[i-up][j]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i-up,j],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i-up,j]);
	        	}
	    		stop = true;
	    	}
	    	up++;
	    }
	    //move down
	    var down = 1;
	    stop = false;
	    while(i+down < 7 && !stop){
	    	//empty
	    	if(board[i+down][j] == 0){
	    		if(!putsKingInDanger([i,j],[i+down,j],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i+down,j]);
	        	}
	    	}else if ((board[i+down][j]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i+down,j],(board[i][j]<0?'black':'white'))){
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
	    		if(!putsKingInDanger([i,j],[i,j-left],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i,j-left]);
	        	}
	    	}else if ((board[i][j-left]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i,j-left],(board[i][j]<0?'black':'white'))){
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
	    		if(!putsKingInDanger([i,j],[i,j+right],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i,j+right]);
	        	}
	    	}else if ((board[i][j+right]*board[i][j]) > 0) {//own piece
	    		stop = true;
	    	}else{//enemie piece
	    		if(!putsKingInDanger([i,j],[i,j+right],(board[i][j]<0?'black':'white'))){
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
		    		if(!putsKingInDanger([i,j],[i-up,j-left],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i-up,j-left]);
		        	}
	    		}else if((board[i-up][j-left]*board[i][j]) > 0) {//own piece
	    			stopUp = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i-up,j-left],(board[i][j]<0?'black':'white'))){
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
		    		if(!putsKingInDanger([i,j],[i+down,j-left],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i+down,j-left]);
		        	}
	    		}else if((board[i+down][j-left]*board[i][j]) > 0) {//own piece
	    			stopDown = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i+down,j-left],(board[i][j]<0?'black':'white'))){
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
		    		if(!putsKingInDanger([i,j],[i-up,j+right],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i-up,j+right]);
		        	}
	    		}else if((board[i-up][j+right]*board[i][j]) > 0) {//own piece
	    			stopUp = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i-up,j+right],(board[i][j]<0?'black':'white'))){
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
		    		if(!putsKingInDanger([i,j],[i+down,j+right],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i+down,j+right]);
		        	}
	    		}else if((board[i+down][j+right]*board[i][j]) > 0) {//own piece
	    			stopDown = true;
	    		}else{//enemie piece
		    		if(!putsKingInDanger([i,j],[i+down,j+right],(board[i][j]<0?'black':'white'))){
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
	    while(i+down < 7 && !stop){
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
	    		if(!putsKingInDanger([i,j],[i-1,j],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i-1,j]);
	        	}
	    	}else if((board[i-1][j]*board[i][j]) < 0){//enemy piece
	    		if(!putsKingInDanger([i,j],[i-1,j],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i-1,j]);
	        	}
	    	}
	    	//up -> left
	    	if(j>0){
	    		if(board[i-1][j-1] == 0){//empty
		    		if(!putsKingInDanger([i,j],[i-1,j-1],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i-1,j-1]);
		        	}
		    	}else if((board[i-1][j-1]*board[i][j]) < 0){//enemy piece
		    		if(!putsKingInDanger([i,j],[i-1,j-1],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i-1,j-1]);
		        	}
		    	}
	    	}
	    	//up -> right
	    	if(j<7){
	    		if(board[i-1][j+1] == 0){//empty
		    		if(!putsKingInDanger([i,j],[i-1,j+1],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i-1,j+1]);
		        	}
		    	}else if((board[i-1][j+1]*board[i][j]) < 0){//enemy piece
		    		if(!putsKingInDanger([i,j],[i-1,j+1],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i-1,j+1]);
		        	}
		    	}
	    	}
	    }
	    //left
	    if(j>0){
    		if(board[i][j-1] == 0){//empty
	    		if(!putsKingInDanger([i,j],[i,j-1],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i,j-1]);
	        	}
	    	}else if((board[i][j-1]*board[i][j]) < 0){//enemy piece
	    		if(!putsKingInDanger([i,j],[i,j-1],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i,j-1]);
	        	}
	    	}
    	}
    	//right
    	if(j<7){
    		if(board[i][j+1] == 0){//empty
	    		if(!putsKingInDanger([i,j],[i,j+1],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i,j+1]);
	        	}
	    	}else if((board[i][j+1]*board[i][j]) < 0){//enemy piece
	    		if(!putsKingInDanger([i,j],[i,j+1],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i,j+1]);
	        	}
	    	}
    	}
    	//down
    	if(i<7){
	    	if(board[i+1][j] == 0){//empty
	    		if(!putsKingInDanger([i,j],[i+1,j],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i+1,j]);
	        	}
	    	}else if((board[i+1][j]*board[i][j]) < 0){//enemy piece
	    		if(!putsKingInDanger([i,j],[i+1,j],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i+1,j]);
	        	}
	    	}
	    	//down -> left
	    	if(j>0){
	    		if(board[i+1][j-1] == 0){//empty
		    		if(!putsKingInDanger([i,j],[i+1,j-1],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i+1,j-1]);
		        	}
		    	}else if((board[i+1][j-1]*board[i][j]) < 0){//enemy piece
		    		if(!putsKingInDanger([i,j],[i+1,j-1],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i+1,j-1]);
		        	}
		    	}
	    	}
	    	//down -> right
	    	if(j<7){
	    		if(board[i+1][j+1] == 0){//empty
		    		if(!putsKingInDanger([i,j],[i+1,j+1],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i+1,j+1]);
		        	}
		    	}else if((board[i+1][j+1]*board[i][j]) < 0){//enemy piece
		    		if(!putsKingInDanger([i,j],[i+1,j+1],(board[i][j]<0?'black':'white'))){
		        		possibilities.push([i+1,j+1]);
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
	    		if(!putsKingInDanger([i,j],[i-1,j-2],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i-1,j-2]);
	        	}
	    	}
	    }
	    //up one -> right two
	    if(i>0 && j<6){
	    	if(board[i-1][j+2] == 0 || (board[i-1][j+2]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i-1,j+2],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i-1,j+2]);
	        	}
	    	}
	    }
	    //up two -> left one
	    if(i>1 && j>0){
	    	if(board[i-2][j-1] == 0 || (board[i-2][j-1]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i-2,j-1],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i-2,j-1]);
	        	}
	    	}
	    }
	    //up two -> right one
	    if(i>1 && j<7){
	    	if(board[i-2][j+1] == 0 || (board[i-2][j+1]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i-2,j+1],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i-2,j+1]);
	        	}
	    	}
	    }
	    //down one -> left two
	    if(i<7 && j>1){
	    	if(board[i+1][j-2] == 0 || (board[i+1][j-2]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i+1,j-2],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i+1,j-2]);
	        	}
	    	}
	    }
	    //down one -> right two
	    if(i<7 && j<6){
	    	if(board[i+1][j+2] == 0 || (board[i+1][j+2]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i+1,j+2],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i+1,j+2]);
	        	}
	    	}
	    }
	    //down two -> left one
	    if(i<6 && j>0){
	    	if(board[i+2][j-1] == 0 || (board[i+2][j-1]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i+2,j-1],(board[i][j]<0?'black':'white'))){
	        		possibilities.push([i+2,j-1]);
	        	}
	    	}
	    }
	    //down two -> right one
	    if(i<6 && j<7){
	    	if(board[i+2][j+1] == 0 || (board[i+2][j+1]*board[i][j]) < 0){//empty or enmy
	    		if(!putsKingInDanger([i,j],[i+2,j+1],(board[i][j]<0?'black':'white'))){
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
	function showPossibleMoves(possibilities) {
	    for (var i = possibilities.length - 1; i >= 0; i--) {
	        $('.row:eq(' + possibilities[i][0] + ') .tile:eq(' + possibilities[i][1] + ')').addClass('possibility');
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