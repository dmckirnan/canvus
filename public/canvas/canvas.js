'use strict';

//Entire document contained in an anonymous function that calls itself
(() => {

  //Creates the socket instance, canvas, colors, and 2d context of the canvas
  let socket = io();
  let canvas = document.getElementsByClassName('whiteboard')[0];
  let colors = document.getElementsByClassName('color');
  let context = canvas.getContext('2d');

  let current = {
    color: 'black',
  };

  //Flag variable initialized at false & used to notify if drawing is occurring
  let drawing = false;

  //Event listeners for clicks, click releases, mouse going off canvas, and movement of mouse
  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

  //Creates a click event listener for each color div written in canvas.html
  for (let i = 0; i < colors.length; i++) {
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  //Socket picks up the emit from socket (line 10) in server.js and passes the data to onDrawingEvent
  socket.on('drawing', onDrawingEvent);

  //Adds an event listener if the window is resized
  window.addEventListener('resize', onResize, false);
  onResize();

  //Responsible for drawing the line, parameters received from onMouseUp or onMouseMove or onDrawingEvent
  function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath();

    //Moves the path to the specified point in the canvas, without creating a line
    context.moveTo(x0, y0);

    //Adds a new point and creates a line TO that point FROM the last specified point
    context.lineTo(x1, y1);
    context.strokeStyle = color;

    //Checks if client has selected the eraser and makes lineWidth larger for faster erasing
    if (context.strokeStyle == '#ffffff') {
      context.lineWidth = 100;
    } else {
      context.lineWidth = 5;
    }

    //Actually draws the path you have defined with all those moveTo() and lineTo() methods
    context.stroke();
    context.closePath();

    //Checks if emit from socket has ended & subsequently ends function
    if (!emit) return;
    let w = canvas.width;
    let h = canvas.height;

    //Emits the the beginning of drawing with the object of values as the callback
    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }

  //When mouse is clicked handler
  const onMouseDown = (e) => {
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;
  }

  //resets flag variable & calls drawline function with values of prev position, new position & color
  const onMouseUp = (e) => {
    if (!drawing) return;
    drawing = false;
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
  }

  //Draws line based on movement of mouse on x & y axis
  const onMouseMove = (e) => {
    if (!drawing) return;
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
    current.x = e.clientX;
    current.y = e.clientY;
  }

  //Retrieves the specific color element from the DOM & sets current variable to new color value
  const onColorUpdate = (e) => {
    current.color = e.target.className.split(' ')[1];
  }

  //This limits the number of events per second. Functional without it, but limits burdening the server with updates
  const throttle = (callback, delay) => {
    let previousCall = new Date().getTime();
    return () => {
      let time = new Date().getTime();
      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  //Takes in data from socket & sets height/width of canvas & draws line based off data received
  const onDrawingEvent = (data) => {
    let w = canvas.width;
    let h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  //Function to adjust canvas to size of window
  const onResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
})();