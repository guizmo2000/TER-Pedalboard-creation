var menu; 
var menuState;
var divs;
var pedalMenu;

function handleJackMenu(elem) {
  elem.addEventListener( "click", function(e) {
    e.preventDefault();
    pedalMenu = pedalboard.findPedalWhoseInputIsHighlighted();
    if (pedalMenu.inputJacks.length > 1) {
      createMenuItems(pedalMenu.inputJacks);
      toggleMenuOn();
      positionMenu(e,pedalMenu);
    }
  });
}

function createMenuItems(jacks) {
  document.getElementById("menu-container").innerHTML = "";
  let len = jacks.length;
  // Approximatively adapts the Y position where the jacks in menu start
  // according to the number of jacks plugged in the pedal, since the
  // menu adapts its position according to the number of item
  let offsetY = -(5*len) + 7 - (2 * len);
  jacks.forEach(function(j) {
    // Adds a menu item for each jack in the pedal
    let ul = document.getElementById("menu-container");
    let li = document.createElement("li");
    li.appendChild(document.createTextNode("")); //"Jack " + j.p1.id.substring(5,6)));
    li.classList.add("context-menu__item");
    ul.appendChild(li);
    li.setAttribute("id", "jack"+j.p1.id.substring(5,6)); 

    // Repositions the current jack so that it feels like it's unplugged 
    // while in the opened menu
    repositionJack(j, offsetY);
    offsetY += 14;

    li.addEventListener( "mousedown", function(e) {
      e.preventDefault();
      e.stopPropagation();
      // first we disconnect the jack before immediatly creating
      // a new one to drag
      pedalboard.disconnect(j.p1, j.p2);
      pedalboard.currentState = "drawingNewJack";
      let x1 = j.p1.getOutputPos().x;
      let y1 = j.p1.getOutputPos().y;
      let x2 = j.p2.getInputPos().x;
      let y2 = j.p2.getInputPos().y;

      pedalboard.currentDraggableJack = createBezierSVGJack("tmpJack", x1, y1, e.clientX, e.clientY);
      pedalboard.currentDraggableJack.end.setAttribute("x", e.clientX - 7);
      pedalboard.currentDraggableJack.end.setAttribute("y", e.clientY - 10);
      pedalboard.currentDraggableJack.sourcePedal = j.p1;
      pedalboard.currentDraggableJack.x1 = x1;
      pedalboard.currentDraggableJack.y1 = y1;
      toggleMenuOff();
      // we update the position of the jack because the default toggle
      // moved the jack back to the menu
      window.addEventListener('mousemove', mouseMoveDraggable, true);
    })
  })
}

function toggleMenuOn() {
  if ( menuState !== 1 ) {
    menuState = 1;
    menu.classList.add("context-menu--active");
  }
}

function toggleMenuOff() {
  if ( menuState !== 0 ) {
    resetJackPosition(pedalMenu.inputJacks);
    pedalMenu = null;
    menuState = 0;
    menu.classList.remove("context-menu--active");
  }
}

function resetJackPosition(jacks) {
  jacks.forEach(function(j) {
    let posPedal1 = j.p1.getOutputPos();
    let posPedal2 = j.p2.getInputPos();
    updateSVGJack(j.jackSVG, posPedal1.x, posPedal1.y, posPedal2.x, posPedal2.y);
  });
}

// Get mouse pointer position
function getPosition(e) {
  var rect = e.target.getBoundingClientRect();
  var posx = e.clientX;// - rect.left;
  var posy = e.clientY;// - rect.top;
  return {
    x: posx,
    y: posy
  };
}

function positionMenu(e,p) {
  var inputCoordsX = p.getInputPos().x;// + e.target.offsetLeft;
  var inputCoordsY = p.getInputPos().y;// + e.target.offsetTop;

  var menuWidth = menu.offsetWidth + 1;
  var menuHeight = menu.offsetHeight + 1;

  var windowWidth = e.target.innerWidth;
  var windowHeight = e.target.innerHeight;

  if ((windowWidth - inputCoordsX) < menuWidth) {
    menu.style.left = windowWidth - menuWidth + "px";
  } else {
    menu.style.left = inputCoordsX - menuWidth + "px";
  }

  if ((windowHeight - inputCoordsY) < menuHeight) {
    menu.style.top = windowHeight - menuHeight + "px";
  } else {
   menu.style.top = inputCoordsY - menuHeight/2 + "px";
  }
}

function resizeListener (elem) {
  window.onresize = function(e) {
    // Hide menu if the window is resized
    toggleMenuOff();
  }
}