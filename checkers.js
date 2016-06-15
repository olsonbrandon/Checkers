$(document).ready(function(){
  var checkerBoard = [];
  function boardSetup () {
    for(var i = 0, row; i < 8; i++){
      row = $('<div id="row' + i +'" class="row">');
      $('#board').append(row);
      for(var j = 0, color; j < 8; j++){
        color = (i + j) % 2 === 0 ? 'red' : 'black';
        row.append(cellSetup(color));
      }
    }
  }
  function cellSetup(color) {
    return $('<div>').addClass('cell').addClass(color);
  }
});
