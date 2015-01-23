var module={};module.ai={},module.ui={drawBoard:function(a){for(var b=0;b<a.length;b++)for(var c=0;c<a[b].length;c++)switch(Math.abs(a[b][c])){case 0:module.ui.removePiece(b,c);break;case 1:module.ui.setPeice(b,c,"pawn "+module.ui.getSide(a[b][c]));break;case 5.1:module.ui.setPeice(b,c,"rook "+module.ui.getSide(a[b][c]));break;case 3.33:module.ui.setPeice(b,c,"bishop "+module.ui.getSide(a[b][c]));break;case 3.2:module.ui.setPeice(b,c,"knight "+module.ui.getSide(a[b][c]));break;case 8.8:module.ui.setPeice(b,c,"queen "+module.ui.getSide(a[b][c]));break;case 41:module.ui.setPeice(b,c,"king "+module.ui.getSide(a[b][c]))}},removePiece:function(a,b){$(".row:eq("+a+") .tile:eq("+b+")").html("")},setPeice:function(a,b,c){$(".row:eq("+a+") .tile:eq("+b+")").html('<div class="piece '+c+'"></div>')},getSide:function(a){return a>0?"black":"white"},selectPiece:function(a){$(".row:eq("+a[0]+") .tile:eq("+a[1]+")").addClass("selected"),data.selectedPiece=a},unSelect:function(){$(".selected").removeClass("selected"),data.selectedPiece=[]},getBoardTileHuman:function(a){var b=["A","B","C","D","E","F","G","H"],c=["1","2","3","4","5","6","7","8"];return b[a[1]]+c[a[0]]},displayProgression:function(){var a=data.progression[data.progression.length-1];$(".progression").append('<div class="tracked-move">'+module.ui.getSide(a[0])+" "+module.ui.getPiece(a[0])+" moved "+module.ui.getBoardTileHuman(a[1])+" -> "+module.ui.getBoardTileHuman(a[2])+"</div>")},getPiece:function(a){switch(Math.abs(a)){case 1:return"Pesant";case 3.2:return"Knight";case 3.33:return"Bishop";case 5.1:return"Rook";case 8.8:return"Queen";case 41:return"King";default:return"Nothing"}},endGame:function(a){$(document).off("click",".piece"),$("body").prepend(module.ui.getSide(a)+" won the game! Congrats!")},showDangerMap:function(a){for(var b=a.length-1;b>=0;b--)for(var c=a.length-1;c>=0;c--)1==a[b][c]&&$(".row:eq("+b+") .tile:eq("+c+")").addClass("danger-map")},hideDangerMap:function(){$(".danger-map").removeClass("danger-map")}},module.board={getSide:function(a){return a?0>a?1:0:"not a piece"},removePiece:function(a,b){a[b[0]][b[1]]=0,module.board.updateDangerMap(data),module.ui.drawBoard(a)},placePiece:function(a,b,c,d){a[b[0]][b[1]]="white"==d?-c:c,module.board.updateDangerMap(data),module.ui.drawBoard(a)},movePiece:function(a,b,c){var d=a[b[0]][b[1]],e=a[c[0]][c[1]];return a[b[0]][b[1]]=0,a[c[0]][c[1]]=d,e},hasSelected:function(){return data.selectedPiece.length?!0:!1},pieceHasTurn:function(a,b){return module.board.getSide(a[b[0]][b[1]])==data.turn?!0:!1},swapTurn:function(){data.turn=data.turn?0:1},moveTo:function(a,b,c){module.board.isKing(a[c[0]][c[1]])&&module.ui.endGame(a[c[0]][c[1]]),module.board.trackProgression(a,b,c),module.ui.displayProgression(),module.board.movePiece(a,b,c),hidePossibleMoves(),module.ui.unSelect(),module.board.updateDangerMap(data),module.board.updateKingPosition(),module.ui.drawBoard(a)},trackProgression:function(a,b,c){data.progression.push([a[b[0]][b[1]],b,c])},isKing:function(a){return 41==Math.abs(a)?!0:!1},cloneBoard:function(a){for(var b=[],c=[],d=0;d<a.length;d++){c=[];for(var e=0;e<a[d].length;e++)c.push(a[d][e]);b.push(c)}return b},updateDangerMap:function(){data.danger.white=module.board.getDangerMap(data.board,1),data.danger.black=module.board.getDangerMap(data.board,0)},updateKingPosition:function(){data.king.white=module.board.getKingPos(data.board,1),data.king.black=module.board.getKingPos(data.board,0)},getDangerMap:function(a,b){for(var c=[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],d=[],e=a.length-1;e>=0;e--)for(var f=a[e].length-1;f>=0;f--)b==module.board.getSide(a[e][f])&&(d=d.concat(module.possibilities.getPossibleMoves(a,e,f,!0)));for(var e=0;e<d.length;e++)c[d[e][0]][d[e][1]]=1;return c},getKingPos:function(a,b){var c=-41;b&&(c=41);for(var d=0;d<a.length;d++)for(var e=0;e<a[d].length;e++)if(a[d][e]==c)return[d,e]},inDanger:function(a,b,c){return c||(c=data.king[a]),b[c[0]][c[1]]?!0:!1},putsKingInDanger:function(a,b){var c=module.board.cloneBoard(data.board),d=module.board.getSide(c[a[0]][a[1]]),e=module.ui.getSide(c[a[0]][a[1]]);module.board.movePiece(c,a,b);var f=module.board.getDangerMap(c,d);module.ui.showDangerMap(f),module.ui.drawBoard(c),module.ui.hideDangerMap(),module.ui.drawBoard(data.board);var g;return g=module.board.isKing(data.board[a[0]][a[1]])?module.board.inDanger(e,f,[b[0],b[1]]):module.board.inDanger(e,f),c=null,f=null,g},hasMoved:function(a,b){for(var c=data.progression.length-1;c>=0;c--)if(data.progression[c][0]==a){if(!b)return!0;var d=data.progression[c][1];if(d[0]==b[0]&&d[1]==b[1])return!0}return!1}},module.possibilities={getPossibleMoves:function(a,b,c,d){if(d)switch(Math.abs(a[b][c])){case 1:return module.possibilities.getPossiblePawnMoveDanger(a,b,c);case 5.1:return module.possibilities.getPossibleRookMoveDanger(a,b,c);case 3.33:return module.possibilities.getPossibleBishopMoveDanger(a,b,c);case 3.2:return module.possibilities.getPossibleKnightMoveDanger(a,b,c);case 8.8:return module.possibilities.getPossibleQueenMoveDanger(a,b,c);case 41:return module.possibilities.getPossibleKingMoveDanger(a,b,c)}else switch(Math.abs(a[b][c])){case 1:return module.possibilities.getPossiblePawnMove(a,b,c);case 5.1:return module.possibilities.getPossibleRookMove(a,b,c);case 3.33:return module.possibilities.getPossibleBishopMove(a,b,c);case 3.2:return module.possibilities.getPossibleKnightMove(a,b,c);case 8.8:return module.possibilities.getPossibleQueenMove(a,b,c);case 41:return module.possibilities.getPossibleKingMove(a,b,c)}},getPossiblePawnMove:function(a,b,c){if(1==Math.abs(a[b][c])){var d=[];if(b>0&&7>b&&0==a[b+a[b][c]][c]&&(module.board.putsKingInDanger([b,c],[b+a[b][c],c])||d.push(b+a[b][c]==0||b+a[b][c]==7?[b+a[b][c],c,"promotion"]:[b+a[b][c],c])),(a[b][c]>0?1==b:6==b)&&0==a[b+a[b][c]][c]&&0==a[b+2*a[b][c]][c]&&(module.board.putsKingInDanger([b,c],[b+2*a[b][c],c])||d.push([b+2*a[b][c],c])),b>0&&7>b&&(c>0&&0!=a[b+a[b][c]][c-1]&&a[b+a[b][c]][c-1]*a[b][c]<0&&(module.board.putsKingInDanger([b,c],[b+a[b][c],c-1])||d.push(b+a[b][c]==0||b+a[b][c]==7?[b+a[b][c],c-1,"promotion"]:[b+a[b][c],c-1])),7>c&&a[b+a[b][c]][c+1]&&a[b+a[b][c]][c+1]*a[b][c]<0&&(module.board.putsKingInDanger([b,c],[b+a[b][c],c+1])||d.push(b+a[b][c]==0||b+a[b][c]==7?[b+a[b][c],c+1,"promotion"]:[b+a[b][c],c+1]))),data.special["en passant"]){var e=module.ui.getSide(a[b][c]);if("white"==e){if(3==b){if(c>0&&1==a[b][c-1]){var f=data.progression[data.progression.length-1],g=f[1],h=f[2];h[0]==b&&h[1]==c-1&&g[0]==b-2&&g[1]==c-1&&d.push([b-1,c-1,"en-passant"])}if(7>c&&1==a[b][c+1]){var f=data.progression[data.progression.length-1],g=f[1],h=f[2];h[0]==b&&h[1]==c+1&&g[0]==b-2&&g[1]==c+1&&d.push([b-1,c+1,"en-passant"])}}}else if(4==b){if(c>0&&-1==a[b][c-1]){var f=data.progression[data.progression.length-1],g=f[1],h=f[2];h[0]==b&&h[1]==c-1&&g[0]==b+2&&g[1]==c-1&&d.push([b+1,c-1,"en-passant"])}if(7>c&&-1==a[b][c+1]){var f=data.progression[data.progression.length-1],g=f[1],h=f[2];h[0]==b&&h[1]==c+1&&g[0]==b+2&&g[1]==c+1&&d.push([b+1,c+1,"en-passant"])}}}return d}},getPossiblePawnMoveDanger:function(a,b,c){if(1==Math.abs(a[b][c])){var d=[];return b>0&&7>b&&(c>0&&d.push([b+a[b][c],c-1]),7>c&&d.push([b+a[b][c],c+1])),d}},getPossibleRookMove:function(a,b,c){if(5.1==Math.abs(a[b][c])){for(var d=[],e=1,f=!1;b-e>=0&&!f;)0==a[b-e][c]?module.board.putsKingInDanger([b,c],[b-e,c])||d.push([b-e,c]):a[b-e][c]*a[b][c]>0?f=!0:(module.board.putsKingInDanger([b,c],[b-e,c])||d.push([b-e,c]),f=!0),e++;var g=1;for(f=!1;7>=b+g&&!f;)0==a[b+g][c]?module.board.putsKingInDanger([b,c],[b+g,c])||d.push([b+g,c]):a[b+g][c]*a[b][c]>0?f=!0:(module.board.putsKingInDanger([b,c],[b+g,c])||d.push([b+g,c]),f=!0),g++;var h=1;for(f=!1;c-h>=0&&!f;)0==a[b][c-h]?module.board.putsKingInDanger([b,c],[b,c-h])||d.push([b,c-h]):a[b][c-h]*a[b][c]>0?f=!0:(module.board.putsKingInDanger([b,c],[b,c-h])||d.push([b,c-h]),f=!0),h++;var i=1;for(f=!1;7>=c+i&&!f;)0==a[b][c+i]?module.board.putsKingInDanger([b,c],[b,c+i])||d.push([b,c+i]):a[b][c+i]*a[b][c]>0?f=!0:(module.board.putsKingInDanger([b,c],[b,c+i])||d.push([b,c+i]),f=!0),i++;return d}},getPossibleRookMoveDanger:function(a,b,c){if(5.1==Math.abs(a[b][c])){for(var d=[],e=1,f=!1;b-e>=0&&!f;)0==a[b-e][c]?d.push([b-e,c]):a[b-e][c]*a[b][c]>0?(d.push([b-e,c]),f=!0):(d.push([b-e,c]),f=!0),e++;var g=1;for(f=!1;7>=b+g&&!f;)0==a[b+g][c]?d.push([b+g,c]):a[b+g][c]*a[b][c]>0?(d.push([b+g,c]),f=!0):(d.push([b+g,c]),f=!0),g++;var h=1;for(f=!1;c-h>=0&&!f;)0==a[b][c-h]?d.push([b,c-h]):a[b][c-h]*a[b][c]>0?(d.push([b,c-h]),f=!0):(d.push([b,c-h]),f=!0),h++;var i=1;for(f=!1;7>=c+i&&!f;)0==a[b][c+i]?d.push([b,c+i]):a[b][c+i]*a[b][c]>0?(d.push([b,c+i]),f=!0):(d.push([b,c+i]),f=!0),i++;return d}},getPossibleBishopMove:function(a,b,c){if(3.33==Math.abs(a[b][c])){for(var d=[],e=1,f=1,g=1,h=!1,i=!1;c-e>=0&&(!h||!i);)b-f>=0&&!h?0==a[b-f][c-e]?module.board.putsKingInDanger([b,c],[b-f,c-e])||d.push([b-f,c-e]):a[b-f][c-e]*a[b][c]>0?h=!0:(module.board.putsKingInDanger([b,c],[b-f,c-e])||d.push([b-f,c-e]),h=!0):h=!0,f++,7>=b+g&&!i?0==a[b+g][c-e]?module.board.putsKingInDanger([b,c],[b+g,c-e])||d.push([b+g,c-e]):a[b+g][c-e]*a[b][c]>0?i=!0:(module.board.putsKingInDanger([b,c],[b+g,c-e])||d.push([b+g,c-e]),i=!0):i=!0,g++,e++;var j=1;for(e=1,f=1,g=1,h=!1,i=!1;7>=c+j&&(!h||!i);)b-f>=0&&!h?0==a[b-f][c+j]?module.board.putsKingInDanger([b,c],[b-f,c+j])||d.push([b-f,c+j]):a[b-f][c+j]*a[b][c]>0?h=!0:(module.board.putsKingInDanger([b,c],[b-f,c+j])||d.push([b-f,c+j]),h=!0):h=!0,f++,7>=b+g&&!i?0==a[b+g][c+j]?module.board.putsKingInDanger([b,c],[b+g,c+j])||d.push([b+g,c+j]):a[b+g][c+j]*a[b][c]>0?i=!0:(module.board.putsKingInDanger([b,c],[b+g,c+j])||d.push([b+g,c+j]),i=!0):i=!0,g++,j++;return d}},getPossibleBishopMoveDanger:function(a,b,c){if(3.33==Math.abs(a[b][c])){for(var d=[],e=1,f=1,g=1,h=!1,i=!1;c-e>=0&&(!h||!i);)b-f>=0&&!h?0==a[b-f][c-e]?d.push([b-f,c-e]):a[b-f][c-e]*a[b][c]>0?(d.push([b-f,c-e]),h=!0):(d.push([b-f,c-e]),h=!0):h=!0,f++,7>=b+g&&!i?0==a[b+g][c-e]?d.push([b+g,c-e]):a[b+g][c-e]*a[b][c]>0?(d.push([b+g,c-e]),i=!0):(d.push([b+g,c-e]),i=!0):i=!0,g++,e++;var j=1;for(e=1,f=1,g=1,h=!1,i=!1;7>=c+j&&(!h||!i);)b-f>=0&&!h?0==a[b-f][c+j]?d.push([b-f,c+j]):a[b-f][c+j]*a[b][c]>0?(d.push([b-f,c+j]),h=!0):(d.push([b-f,c+j]),h=!0):h=!0,f++,7>=b+g&&!i?0==a[b+g][c+j]?d.push([b+g,c+j]):a[b+g][c+j]*a[b][c]>0?(d.push([b+g,c+j]),i=!0):(d.push([b+g,c+j]),i=!0):i=!0,g++,j++;return d}},getPossibleQueenMove:function(a,b,c){if(8.8==Math.abs(a[b][c])){for(var d=[],e=1,f=!1;b-e>=0&&!f;)0==a[b-e][c]?module.board.putsKingInDanger([b,c],[b-e,c])||d.push([b-e,c]):a[b-e][c]*a[b][c]>0?f=!0:(module.board.putsKingInDanger([b,c],[b-e,c])||d.push([b-e,c]),f=!0),e++;var g=1;for(f=!1;7>=b+g&&!f;)0==a[b+g][c]?module.board.putsKingInDanger([b,c],[b+g,c])||d.push([b+g,c]):a[b+g][c]*a[b][c]>0?f=!0:(module.board.putsKingInDanger([b,c],[b+g,c])||d.push([b+g,c]),f=!0),g++;var h=1;for(f=!1;c-h>=0&&!f;)0==a[b][c-h]?module.board.putsKingInDanger([b,c],[b,c-h])||d.push([b,c-h]):a[b][c-h]*a[b][c]>0?f=!0:(module.board.putsKingInDanger([b,c],[b,c-h])||d.push([b,c-h]),f=!0),h++;var i=1;for(f=!1;7>=c+i&&!f;)0==a[b][c+i]?module.board.putsKingInDanger([b,c],[b,c+i])||d.push([b,c+i]):a[b][c+i]*a[b][c]>0?f=!0:(module.board.putsKingInDanger([b,c],[b,c+i])||d.push([b,c+i]),f=!0),i++;h=1,e=1,g=1;for(var j=!1,k=!1;c-h>=0&&(!j||!k);)b-e>=0&&!j?0==a[b-e][c-h]?module.board.putsKingInDanger([b,c],[b-e,c-h])||d.push([b-e,c-h]):a[b-e][c-h]*a[b][c]>0?j=!0:(module.board.putsKingInDanger([b,c],[b-e,c-h])||d.push([b-e,c-h]),j=!0):j=!0,e++,7>=b+g&&!k?0==a[b+g][c-h]?module.board.putsKingInDanger([b,c],[b+g,c-h])||d.push([b+g,c-h]):a[b+g][c-h]*a[b][c]>0?k=!0:(module.board.putsKingInDanger([b,c],[b+g,c-h])||d.push([b+g,c-h]),k=!0):k=!0,g++,h++;for(i=1,h=1,e=1,g=1,j=!1,k=!1;7>=c+i&&(!j||!k);)b-e>=0&&!j?0==a[b-e][c+i]?module.board.putsKingInDanger([b,c],[b-e,c+i])||d.push([b-e,c+i]):a[b-e][c+i]*a[b][c]>0?j=!0:(module.board.putsKingInDanger([b,c],[b-e,c+i])||d.push([b-e,c+i]),j=!0):j=!0,e++,7>=b+g&&!k?0==a[b+g][c+i]?module.board.putsKingInDanger([b,c],[b+g,c+i])||d.push([b+g,c+i]):a[b+g][c+i]*a[b][c]>0?k=!0:(module.board.putsKingInDanger([b,c],[b+g,c+i])||d.push([b+g,c+i]),k=!0):k=!0,g++,i++;return d}},getPossibleQueenMoveDanger:function(a,b,c){if(8.8==Math.abs(a[b][c])){for(var d=[],e=1,f=!1;b-e>=0&&!f;)0==a[b-e][c]?d.push([b-e,c]):a[b-e][c]*a[b][c]>0?(d.push([b-e,c]),f=!0):(d.push([b-e,c]),f=!0),e++;var g=1;for(f=!1;7>=b+g&&!f;)0==a[b+g][c]?d.push([b+g,c]):a[b+g][c]*a[b][c]>0?(d.push([b+g,c]),f=!0):(d.push([b+g,c]),f=!0),g++;var h=1;for(f=!1;c-h>=0&&!f;)0==a[b][c-h]?d.push([b,c-h]):a[b][c-h]*a[b][c]>0?(d.push([b,c-h]),f=!0):(d.push([b,c-h]),f=!0),h++;var i=1;for(f=!1;7>=c+i&&!f;)0==a[b][c+i]?d.push([b,c+i]):a[b][c+i]*a[b][c]>0?(d.push([b,c+i]),f=!0):(d.push([b,c+i]),f=!0),i++;h=1,e=1,g=1;for(var j=!1,k=!1;c-h>=0&&(!j||!k);)b-e>=0&&!j?0==a[b-e][c-h]?d.push([b-e,c-h]):a[b-e][c-h]*a[b][c]>0?(d.push([b-e,c-h]),j=!0):(d.push([b-e,c-h]),j=!0):j=!0,e++,7>=b+g&&!k?0==a[b+g][c-h]?d.push([b+g,c-h]):a[b+g][c-h]*a[b][c]>0?(d.push([b+g,c-h]),k=!0):(d.push([b+g,c-h]),k=!0):k=!0,g++,h++;var i=1;for(h=1,e=1,g=1,j=!1,k=!1;7>=c+i&&(!j||!k);)b-e>=0&&!j?0==a[b-e][c+i]?d.push([b-e,c+i]):a[b-e][c+i]*a[b][c]>0?(d.push([b-e,c+i]),j=!0):(d.push([b-e,c+i]),j=!0):j=!0,e++,7>=b+g&&!k?0==a[b+g][c+i]?d.push([b+g,c+i]):a[b+g][c+i]*a[b][c]>0?(d.push([b+g,c+i]),k=!0):(d.push([b+g,c+i]),k=!0):k=!0,g++,i++;return d}},getPossibleKingMove:function(a,b,c){if(41==Math.abs(a[b][c])){var d=[];if(b>0&&(0==a[b-1][c]?module.board.putsKingInDanger([b,c],[b-1,c])||d.push([b-1,c]):a[b-1][c]*a[b][c]<0&&(module.board.putsKingInDanger([b,c],[b-1,c])||d.push([b-1,c])),c>0&&(0==a[b-1][c-1]?module.board.putsKingInDanger([b,c],[b-1,c-1])||d.push([b-1,c-1]):a[b-1][c-1]*a[b][c]<0&&(module.board.putsKingInDanger([b,c],[b-1,c-1])||d.push([b-1,c-1]))),7>c&&(0==a[b-1][c+1]?module.board.putsKingInDanger([b,c],[b-1,c+1])||d.push([b-1,c+1]):a[b-1][c+1]*a[b][c]<0&&(module.board.putsKingInDanger([b,c],[b-1,c+1])||d.push([b-1,c+1])))),c>0&&(0==a[b][c-1]?module.board.putsKingInDanger([b,c],[b,c-1])||d.push([b,c-1]):a[b][c-1]*a[b][c]<0&&(module.board.putsKingInDanger([b,c],[b,c-1])||d.push([b,c-1]))),7>c&&(0==a[b][c+1]?module.board.putsKingInDanger([b,c],[b,c+1])||d.push([b,c+1]):a[b][c+1]*a[b][c]<0&&(module.board.putsKingInDanger([b,c],[b,c+1])||d.push([b,c+1]))),7>b&&(0==a[b+1][c]?module.board.putsKingInDanger([b,c],[b+1,c])||d.push([b+1,c]):a[b+1][c]*a[b][c]<0&&(module.board.putsKingInDanger([b,c],[b+1,c])||d.push([b+1,c])),c>0&&(0==a[b+1][c-1]?module.board.putsKingInDanger([b,c],[b+1,c-1])||d.push([b+1,c-1]):a[b+1][c-1]*a[b][c]<0&&(module.board.putsKingInDanger([b,c],[b+1,c-1])||d.push([b+1,c-1]))),7>c&&(0==a[b+1][c+1]?module.board.putsKingInDanger([b,c],[b+1,c+1])||d.push([b+1,c+1]):a[b+1][c+1]*a[b][c]<0&&(module.board.putsKingInDanger([b,c],[b+1,c+1])||d.push([b+1,c+1])))),data.special.casteling&&!hasMoved(a[b][c])){var e=a[b][c]<0?-5.1:5.1,f=module.ui.getSide(a[b][c]),g=data.danger[f];a[b][7]==e&&(hasMoved(e,[b,7])||0==a[b][6]&&0==a[b][5]&&(inDanger(f,g,[b,5])||inDanger(f,g,[b,6])||inDanger(f,g)||module.board.putsKingInDanger([b,c],[b,6])||d.push([b,6,"casteling"]))),a[b][0]==e&&(hasMoved(e,[b,0])||0==a[b][1]&&0==a[b][2]&&0==a[b][3]&&(inDanger(f,g,[b,2])||inDanger(f,g,[b,3])||inDanger(f,g)||module.board.putsKingInDanger([b,c],[b,2])||d.push([b,2,"casteling"])))}return d}},getPossibleKingMoveDanger:function(a,b,c){if(41==Math.abs(a[b][c])){var d=[];return b>0&&(d.push([b-1,c]),c>0&&d.push([b-1,c-1]),7>c&&d.push([b-1,c+1])),c>0&&d.push([b,c-1]),7>c&&d.push([b,c+1]),7>b&&(d.push([b+1,c]),c>0&&d.push([b+1,c-1]),7>c&&d.push([b+1,c+1])),d}},getPossibleKnightMove:function(a,b,c){if(3.2==Math.abs(a[b][c])){var d=[];return b>0&&c>1&&(0==a[b-1][c-2]||a[b-1][c-2]*a[b][c]<0)&&(putsKingInDanger([b,c],[b-1,c-2])||d.push([b-1,c-2])),b>0&&6>c&&(0==a[b-1][c+2]||a[b-1][c+2]*a[b][c]<0)&&(putsKingInDanger([b,c],[b-1,c+2])||d.push([b-1,c+2])),b>1&&c>0&&(0==a[b-2][c-1]||a[b-2][c-1]*a[b][c]<0)&&(putsKingInDanger([b,c],[b-2,c-1])||d.push([b-2,c-1])),b>1&&7>c&&(0==a[b-2][c+1]||a[b-2][c+1]*a[b][c]<0)&&(putsKingInDanger([b,c],[b-2,c+1])||d.push([b-2,c+1])),7>b&&c>1&&(0==a[b+1][c-2]||a[b+1][c-2]*a[b][c]<0)&&(putsKingInDanger([b,c],[b+1,c-2])||d.push([b+1,c-2])),7>b&&6>c&&(0==a[b+1][c+2]||a[b+1][c+2]*a[b][c]<0)&&(putsKingInDanger([b,c],[b+1,c+2])||d.push([b+1,c+2])),6>b&&c>0&&(0==a[b+2][c-1]||a[b+2][c-1]*a[b][c]<0)&&(putsKingInDanger([b,c],[b+2,c-1])||d.push([b+2,c-1])),6>b&&7>c&&(0==a[b+2][c+1]||a[b+2][c+1]*a[b][c]<0)&&(putsKingInDanger([b,c],[b+2,c+1])||d.push([b+2,c+1])),d}},getPossibleKnightMoveDanger:function(a,b,c){if(3.2==Math.abs(a[b][c])){var d=[];return b>0&&c>1&&d.push([b-1,c-2]),b>0&&6>c&&d.push([b-1,c+2]),b>1&&c>0&&d.push([b-2,c-1]),b>1&&7>c&&d.push([b-2,c+1]),7>b&&c>1&&d.push([b+1,c-2]),7>b&&6>c&&d.push([b+1,c+2]),6>b&&c>0&&d.push([b+2,c-1]),6>b&&7>c&&d.push([b+2,c+1]),d}}},$(function(){window.data={board:[[5.1,3.2,3.33,8.8,41,3.33,3.2,5.1],[1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[-1,-1,-1,-1,-1,-1,-1,-1],[-5.1,-3.2,-3.33,-8.8,-41,-3.33,-3.2,-5.1]],progression:[],selectedPiece:[],turn:1,king:{white:"",black:""},danger:{white:"",black:""},special:{casteling:!0,"en passant":!0,promotion:!1}},module.board.updateKingPosition(),module.board.updateDangerMap(),module.ui.drawBoard(data.board),$(document).on("click",".piece",function(){if(!$(this).parent().hasClass("possibility")){var a=$(".row .tile").index($(this).parent())%8,b=Math.floor($(".row .tile").index($(this).parent())/8);if(module.board.pieceHasTurn(data.board,[b,a])){module.board.hasSelected()&&(module.ui.hidePossibleMoves(),module.ui.unSelect());var c=module.possibilities.getPossibleMoves(data.board,b,a);c&&module.ui.showPossibleMoves(c),module.ui.selectPiece([b,a])}}}),$(document).on("click",".possibility",function(){if(module.board.hasSelected()){var a=$(".row .tile").index(this)%8,b=Math.floor($(".row .tile").index(this)/8);if(module.board.moveTo(data.board,data.selectedPiece,[b,a]),$(this).hasClass("casteling")&&($(this).removeClass("casteling"),7==b?a>4?module.board.moveTo(data.board,[7,7],[b,a-1]):module.board.moveTo(data.board,[7,0],[b,a+1]):0==b&&(a>4?module.board.moveTo(data.board,[0,7],[b,a-1]):module.board.moveTo(data.board,[0,0],[b,a+1]))),$(this).hasClass("en-passant")){$(this).removeClass("en-passant");var c=getSide(data.board[b][a]);"white"==c?module.board.removePiece(data.board,[b+1,a]):module.board.removePiece(data.board,[b-1,a])}$(this).hasClass("promotion")&&($(this).removeClass("promotion"),$(".choose").show(),$(".choose").data("i",b),$(".choose").data("j",a),$(".choose").on("change",function(){$(".choose").off("change").hide(),$(".choose option").each(function(){$(this).is(":selected")&&module.board.placePiece(data.board,[$(this).parent().data("i"),$(this).parent().data("j")],$(this).val(),getSide(data.board[$(this).parent().data("i")][$(this).parent().data("j")])),$(this).attr("selected",!1)})})),module.board.swapTurn()}})});