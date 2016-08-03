$(document).ready(function(){
  var checkerBoard = [new Array(8),new Array(8),new Array(8),new Array(8),new Array(8),new Array(8),new Array(8),new Array(8)];

  function boardSetup () {
    for(var i = 0, row; i < 8; i++){
      row = $('<div class="row">');
      $('#board').append(row);
      for(var j = 0, color, cell; j < 8; j++){
        color = (i + j) % 2 === 0 ? 'black' : 'white';
        cell = cellSetup(i, j, color);
        row.append(cell);
        if (i < 3 && cell.hasClass("white")) {
          cell.addClass("redPiece");
          createPiece(i, j, 'red');
        }else if (i > 4 && cell.hasClass("white")) {
          cell.addClass("blackPiece");
          createPiece(i, j, 'black');
        }
      }
    }
  }
  boardSetup();

  function createPiece(row, col, color){
    var piece = {
      color:color,
      king:false
    };
    checkerBoard[row][col] = piece;
  }
  function cellSetup(row, col, color) {
    return $('<div id="' + row.toString() + col.toString() + '">').addClass('cell').addClass(color);
  }
  function clearHighlight(){
    $('.highlight').removeClass('highlight');
    $('.highlight-select').removeClass('highlight-select');
  }
  var currTurn = 'red';
  var isFirstMove = true;

  $('.white').click(function(){
    var getId = $(this).attr('id');
    var firstSelection = getSelectedId();
    var piece = getPiece(getId[0], getId[1]);
    if (!isEmpty(getId[0], getId[1]) && getPiece(getId[0], getId[1]).color === currTurn) {
      clearHighlight();
      $(this).addClass('highlight-select');
      showMoves(getId);
    }
    if ($(this).hasClass('highlight') && getPiece(firstSelection[0], firstSelection[1]).color === currTurn) {
      movePiece(firstSelection[0], firstSelection[1], getId[0], getId[1]);
      var hasBecomeKing = shouldBecomeKing(getId[0], getId[1], getPiece(getId[0], getId[1]).color);
      if (Math.abs(getId[0] - firstSelection[0]) === 2) {
        captureEnemy(firstSelection[0], firstSelection[1], getId[0], getId[1]);
      }
      clearHighlight();
      didIwin();
      if (hasJumped(firstSelection[0], getId[0]) && canJumpAgain(getId[0], getId[1]) && !hasBecomeKing) {
        $('#' + getId).addClass('highlight-select');
        showMoves(getId);
      }else {
        currTurn = currTurn === 'red' ? 'black' : 'red';
        isFirstMove = true;
      }
    }
  });
  // =======================TARGETING========================= //
  function getPiece(row, col) {
    return checkerBoard[row][col];
  }
  function getSelectedId() {
    var oldId = $('.highlight-select').attr('id');
    return oldId;
  }
  function isEmpty(row, col) {
    return getPiece(row, col) == undefined;
  }
  function shouldBecomeKing(row, col, color){
    var piece = getPiece(row, col);
    if (piece.king === true) {
      return;
    }
      if ((row == 0 && color === 'black') || (row == 7 && color === 'red')) {
        piece.king = true;
        $('#' + row + col).addClass('king-' + color);
        $('#' + row + col).removeClass(color + 'Piece');
        return true;
      }
  }
  function onBoard(row, col) {
    return row >= 0 && row <= 7 && col >= 0 && col <= 7;
  }
  function getDir(color) {
    if (color === 'red') {
      return 1;
    }else {
      return -1;
    }
  }
  function highlight(target){
    $('#' + target.row.toString() + target.col.toString()).addClass('highlight');
  }
  function canMoveTo(row, col) {
    if (onBoard(row, col) && isEmpty(row, col)) {
      return true;
    }
    return false;
  }
  function getSingleMoves(row, col, dir) {
    var targetRow = Number(row) + Number(dir);
    var leftCol = Number(col) - 1;
    var rightCol = Number(col) + 1;
    var targets = [];
    if (canMoveTo(targetRow, leftCol)) {
      targets.push({row:targetRow, col:leftCol});
    }
    if (canMoveTo(targetRow, rightCol)) {
      targets.push({row:targetRow, col:rightCol});
    }
    return targets;
  }
  function canJumpTo(oldRow, oldCol, row, col) {
    var inbetweenCell = getInbetweenCell(oldRow, oldCol, row, col);
    if (onBoard(row, col) && isEmpty(row, col) && isEnemy(inbetweenCell.row, inbetweenCell.col)) {
      return true;
    }
    return false;
  }
  function hasJumped(oldRow, newRow) {
    var diff = Math.abs(Number(newRow) - Number(oldRow));
    if (diff === 2) {
      return true;
    }
  }
  function canJumpAgain(row, col){
    return !!getJumpTargets(row, col).length;
  }
  function getJumpMoves(row, col, dir) {
    if (dir === 1 ) {
      dir = dir + 1;
    }else {
      dir = dir - 1;
    }
    var targetRow = Number(row) + dir;
    var leftCol = Number(col) - 2;
    var rightCol = Number(col) + 2;
    var targets = [];
    if (canJumpTo(row, col, targetRow, leftCol)) {
      targets.push({row:targetRow, col:leftCol});
    }
    if (canJumpTo(row, col, targetRow, rightCol)) {
      targets.push({row:targetRow, col:rightCol});
    }
    return targets;
  }
  function getInbetweenCell(oldRow, oldCol, newRow, newCol) {
    var row = (Number(oldRow) + Number(newRow)) / 2;
    var col = (Number(oldCol) + Number(newCol)) /2;
    return {
      row: row,
      col: col,
      color: onBoard(row,col) && checkerBoard[row][col] && checkerBoard[row][col].color ? checkerBoard[row][col].color : null
    };
  }
  function getTargets(row, col) {
    var targets= [];
    var piece = getPiece(row, col);
    if (piece) {
      if (piece.king) {
        targets.push.apply(targets, getSingleMoves(row, col, 1));
        targets.push.apply(targets, getSingleMoves(row, col, -1));
      } else {
        var dir = getDir(piece.color);
        targets.push.apply(targets, getSingleMoves(row, col, dir));
      }
    }
    return targets;
  }
  function getJumpTargets(row, col) {
    var targets= [];
    var piece = getPiece(row, col);
    if (piece) {
      if (piece.king) {
        targets.push.apply(targets, getJumpMoves(row, col, 1));
        targets.push.apply(targets, getJumpMoves(row, col, -1));
      } else {
        var dir = getDir(piece.color);
        targets.push.apply(targets, getJumpMoves(row, col, dir));
      }
    }
    return targets;
  }
  function highlightTargets(targets){
    for (var i = 0; i < targets.length; i++) {
      highlight(targets[i]);
    }
  }
  function showMoves(id) {
    var targets = [];
    if (isFirstMove) {
      targets.push.apply(targets, getTargets(id[0], id[1]));
    }
    targets.push.apply(targets, getJumpTargets(id[0], id[1]));
    highlightTargets(targets);
  }
  function deletePiece(row, col) {
    checkerBoard[row][col] = null;
  }
  function removePiece(row, col) {
    deletePiece(row, col);
    $('#' + row + col).attr('class', 'cell white');
  }

  function didIwin(){
    if (($('.redPiece').length === 0 && $('.king-red').length === 0) || ($('.blackPiece').length === 0 && $('.king-black').length === 0)) {
      alert('You Just Won, Congrats!');
      $('.blackPiece').solitaireVictory();
    }
  }
  // ==============================MOVES==================================== //
  function movePiece(oldRow, oldCol, newRow, newCol) {
    isFirstMove = false;
    var piece = getPiece(oldRow, oldCol);
    var divClasses = $('#' + oldRow + oldCol).attr('class');
    removePiece(oldRow, oldCol);
    checkerBoard[newRow][newCol] = piece;
    $('#' + newRow + newCol).attr('class', divClasses);
  }
  function captureEnemy(oldRow, oldCol, newRow, newCol) {
    var enemy = getInbetweenCell(oldRow, oldCol, newRow, newCol);
    removePiece(enemy.row, enemy.col);
  }
  function isEnemy(row, col) {
    var piece = getPiece(row, col);
    if (isEmpty(row, col) || currTurn === piece.color) {
      return false;
    }else {
      return true;
    }
  }
});
