var NUM_HEIGHT = 55;
var Y_OFFSET = 50;
var SPINNER_HEIGHT = 150;

var targetPosition = 0;
var currentPosition = 0;
var deltaY = 0;

function targetReached() {
  deltaY = 0;
  currentPosition = targetPosition;
  document.getElementById("value").innerHTML = "Value: " + currentPosition;
}

function move() {
  var yPosition = -currentPosition * NUM_HEIGHT + deltaY + Y_OFFSET;
  document.getElementById("number").style.backgroundPosition = "0px " + yPosition + "px";

  if (targetPosition > currentPosition) {
    if (deltaY > -NUM_HEIGHT) {
      deltaY = deltaY - 5;
      setTimeout(move, 10);
    } else {
      targetReached();
    }
  } else if (targetPosition < currentPosition) {
    if (deltaY < NUM_HEIGHT) {
      deltaY = deltaY + 5;
      setTimeout(move, 10);
    } else {
      targetReached();
    }
  }
}
move();

function getClickPosition(e) {
  // Click position handling.
  // xPosition and yPosition are relative to element bounds.
  // Source: http://www.kirupa.com/html5/getting_mouse_click_position.htm
  var parentPosition = getPosition(e.currentTarget);
  var xPosition = e.clientX - parentPosition.x;
  var yPosition = e.clientY - parentPosition.y;

  if (yPosition > SPINNER_HEIGHT / 2 && currentPosition != 10) {
    targetPosition = currentPosition + 1;
  } else if (yPosition < SPINNER_HEIGHT / 2 && currentPosition != 0) {
    targetPosition = currentPosition - 1;
  }
  move();
}

function getPosition(element) {
  // Helper function
  // Source: http://www.kirupa.com/html5/getting_mouse_click_position.htm
  var xPosition = 0;
  var yPosition = 0;
  while (element) {
    xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
    yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
    element = element.offsetParent;
  }
  return {
    x: xPosition,
    y: yPosition
  };
}

// document.getElementById("number").addEventListener("click", getClickPosition, false);
document.getElementById("number").addEventListener("mousedown", getClickPosition, false);
