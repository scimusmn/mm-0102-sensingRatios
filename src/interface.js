// Interface.js

var zeroPadding = 4;

var currentActivity = 0;
var numActivities = 5;

var graph = µ('#trace');
var gCtx = {}; // Set to graph canvas context
var gOffsetX = $('#trace').offset().left;
var gOffsetY = $('#trace').offset().top;

// Hook into graph drawing loop
graph.customFGDraw = doGraphDrawing;
var overlayWidth = 5;
var overlayColor = 'rgba(255,0,0,.3)';

var tipDivs = [$('#tip1'), $('#tip2')];

var titles = [{en:'Try to Trace the Lines', es:'Tratar de trazar las lineas'},
              {en:'Constant ratio', es:'Diferencia constante'},
              {en:'Constant ratio', es:'Diferencia constante'},
              {en:'Can you trace the circle?', es:'Se puede trazar el circulo?'},
              {en:'Ratios', es:'Ratios'},
              ];

// Overlay modes
var OVERLAY_STAIRS = 0;
var OVERLAY_RATIOS = 1;
var OVERLAY_OCTAVES = 2;
var OVERLAY_CIRCLE = 3;
var OVERLAY_INTERACTIVE_RATIOS = 4;

// Re-usable colors
var xAxisColor = 'rgba(255, 255, 0, 0.35)';
var yAxisColor = 'rgba(122, 255, 122, 0.35)';
var tipLineColor = 'rgba(0, 0, 0, 0.35)';

// Default to stairs overlay
var currentOverlayMode = OVERLAY_STAIRS;

/**
 * Update frequency readout text
 */
function updateFrequencyReadouts(inLeft, inRight) {

  // Update left frequency readout
  var newLeft = zeroPad(Math.round(inLeft), zeroPadding);
  $('#fLeft').text(newLeft);

  // Update right frequency readout
  var newRight = zeroPad(Math.round(inRight), zeroPadding);
  $('#fRight').text(newRight);

}

/**
 * Increment or reset pattern overlay
 */
function cycleActivity(reset) {

  // Do NOT reset by default.
  reset = typeof reset !== 'undefined' ? reset : false;

  // Increment pattern
  if (reset === true || currentActivity >= numActivities - 1) {
    currentActivity = 0;
  } else {
    currentActivity++;
  }

  // Show corresponding titles
  $('.en.title').text(titles[currentActivity].en);
  $('.es.title').text(titles[currentActivity].es);

  // Swap in new code and visual
  $('#activities_container .activity').hide();
  $('#activities_container .activity').eq(currentActivity).show();

  // Tell graph to update overlay mode
  setOverlayMode(currentActivity);

  // Hide/show tooltips based on activity
  $('.tooltip').hide();
  $('.tooltip.a' + (currentActivity + 1)).show();

}

/**
 * Reset for new user
 */
function resetForNewUser() {

  // Show first activity
  cycleActivity(true);

  // Show new user dialog. Fade out after delay
  if ($('.overlay').is(':hidden')) {
    $('.overlay').show().delay(5000).fadeOut('slow');
  }

}

/**
 * Graph Drawing
 */
function doGraphDrawing() {

  gCtx = graph.getContext('2d');

  drawGraphOverlays();

  drawGutters();

  drawCrosshair();

}

function setOverlayMode(mode) {

  currentOverlayMode = mode;

};

function drawCrosshair() {
  gCtx.fillStyle = '#000';
  gCtx.beginPath();
  gCtx.arc(graph.mouse.x * graph.width, graph.mouse.y * graph.height, 10, 0, 2 * Math.PI);
  gCtx.fill();
  gCtx.closePath();
}

function drawGutters() {

  // Draw bold notches
  // gCtx.strokeStyle = '#000';
  // gCtx.lineWidth = 5;
  // var notchSize = 0.1;
  // for (var i = 1; i <= graph.range.x.divs; i++) {
  //   gCtx.beginPath();
  //   gCtx.moveTo(i * graph.cellWidth, graph.height);
  //   gCtx.lineTo(i * graph.cellWidth, graph.height - graph.cellHeight * notchSize);
  //   gCtx.stroke();
  // }

  // for (var i = 0; i < graph.range.y.divs; i++) {
  //   gCtx.beginPath();
  //   gCtx.moveTo(0, i * graph.cellHeight);
  //   gCtx.lineTo(graph.cellWidth * notchSize, i * graph.cellHeight);
  //   gCtx.stroke();
  // }

  var pixelX = graph.mouse.x * graph.width;
  var pixelY = graph.mouse.y * graph.height;

  // X Axis Tracker
  gCtx.strokeStyle = xAxisColor;
  gCtx.fillStyle = xAxisColor;
  gCtx.lineWidth = graph.lineWidth;
  gCtx.beginPath();
  gCtx.moveTo(pixelX, pixelY);
  gCtx.lineTo(pixelX, graph.height);
  gCtx.stroke();
  gCtx.beginPath();
  gCtx.arc(pixelX, graph.height, 10, 0, 2 * Math.PI);
  gCtx.fill();

  // Y Axis Tracker
  gCtx.strokeStyle = yAxisColor;
  gCtx.fillStyle = yAxisColor;
  gCtx.lineWidth = graph.lineWidth;
  gCtx.beginPath();
  gCtx.moveTo(pixelX, pixelY);
  gCtx.lineTo(0, pixelY);
  gCtx.stroke();
  gCtx.beginPath();
  gCtx.arc(0, pixelY, 10, 0, 2 * Math.PI);
  gCtx.fill();

}

function drawGraphOverlays() {

  gCtx.lineWidth = overlayWidth;
  gCtx.strokeStyle = overlayColor;

  switch (currentOverlayMode) {
    case OVERLAY_STAIRS:
      drawStairs();
    break;
    case OVERLAY_RATIOS:
      drawRatios();
    break;
    case OVERLAY_OCTAVES:
      drawOctaves();
    break;
    case OVERLAY_CIRCLE:
      drawCircle();
    break;
    case OVERLAY_INTERACTIVE_RATIOS:
      drawInteractiveRatios();
    break;
    default:

    // Don't draw an overlay.
  }

};

function drawStairs() {

  var stepX = 0;
  var stepY = graph.height;

  gCtx.beginPath();
  gCtx.moveTo(stepX, stepY);

  // Draw staircase
  for (var i = 0; i < graph.range.x.divs; i++) {

    gCtx.lineTo(stepX, stepY);

    stepX += graph.cellWidth;

    gCtx.lineTo(stepX, stepY);

    stepY -= graph.cellWidth;

    gCtx.lineTo(stepX, stepY);

  }

  gCtx.stroke();

  var unison = graph.getPixelCoords(4, 4);
  var octave = graph.getPixelCoords(4, 3);

  // Labels
  var tip1 = $('.a1.tooltip').eq(0);
  var tipOffset = {x:-50, y:-50};

  // Draw line from tip to point of interest
  gCtx.save();
  gCtx.strokeStyle = tipLineColor;
  gCtx.lineWidth = 1;
  gCtx.beginPath();
  gCtx.moveTo(unison.x, unison.y);
  gCtx.lineTo(unison.x + tipOffset.x, unison.y + tipOffset.y);
  gCtx.stroke();
  gCtx.restore();

  // Update position
  $(tip1).css('left', unison.x + gOffsetX + tipOffset.x - $(tip1).width());
  $(tip1).css('top', unison.y + gOffsetY + tipOffset.y - $(tip1).height());

  var tip2 = $('.a1.tooltip').eq(1);
  tipOffset = {x:50, y:50};

  // Draw line from tip to point of interest
  gCtx.save();
  gCtx.strokeStyle = tipLineColor;
  gCtx.lineWidth = 1;
  gCtx.beginPath();
  gCtx.moveTo(octave.x, octave.y);
  gCtx.lineTo(octave.x + tipOffset.x, octave.y + tipOffset.y);
  gCtx.stroke();
  gCtx.restore();

  // Update position
  $(tip2).css('left', octave.x + gOffsetX + tipOffset.x - 20);
  $(tip2).css('top', octave.y + gOffsetY + tipOffset.y - 20);

};

function drawRatios() {

  // Lines
  drawLineByRatio(1 / 2, gCtx);
  drawLineByRatio(2 / 1, gCtx);

  // Labels
  var tip1 = $('.a2.tooltip').eq(0);
  var tip2 = $('.a2.tooltip').eq(1);

  $(tip1).css({'-webkit-transform': 'rotate(-63deg)'});
  $(tip2).css({'-webkit-transform': 'rotate(-26deg)'});

  $(tip1).css('left', 550);
  $(tip1).css('top', 444);

  $(tip2).css('left', 800);
  $(tip2).css('top', 700);

};

function drawOctaves() {

  var cellHeight = graph.height / graph.range.y.divs;

  // Octave line
  gCtx.beginPath();
  gCtx.moveTo(0, graph.height - cellHeight);
  gCtx.lineTo(graph.width, 0 - cellHeight);
  gCtx.stroke();

  // Unison Line
  gCtx.beginPath();
  gCtx.moveTo(0, graph.height);
  gCtx.lineTo(graph.width, 0);
  gCtx.stroke();

  // Labels
  var tip1 = $('.a3.tooltip').eq(0);
  var tip2 = $('.a3.tooltip').eq(1);

  $(tip1).css({'-webkit-transform': 'rotate(-45deg)'});
  $(tip2).css({'-webkit-transform': 'rotate(-45deg)'});

  $(tip1).css('left', 650);
  $(tip1).css('top', 444);

  $(tip2).css('left', 750);
  $(tip2).css('top', 650);

};

function drawCircle() {

  var cellWidth = graph.width / graph.range.x.divs;

  // Frame
  gCtx.beginPath();
  gCtx.moveTo(cellWidth, graph.height - cellWidth);
  gCtx.lineTo(cellWidth, cellWidth);
  gCtx.lineTo(graph.width - cellWidth, cellWidth);
  gCtx.lineTo(graph.width - cellWidth, graph.height - cellWidth);
  gCtx.closePath();
  gCtx.stroke();

  // Circle
  gCtx.beginPath();
  gCtx.arc(graph.width / 2, graph.height / 2, graph.width / 2 - (cellWidth), 0, 2 * Math.PI);
  gCtx.stroke();

};

function drawInteractiveRatios() {

  // Get nearest X and Y coordinate on grid
  var gridX = Math.round(map(graph.mouse.x, 0, 1, 0, graph.range.x.divs));
  var gridY = Math.round(map(graph.mouse.y, 1, 0, 0, graph.range.y.divs));

  // Find closest 'whole' ratio
  var ratio = gridX / gridY;
  var snapped = graph.getPixelCoords(gridX, gridY);

  // Exit if we aren't close enough to a snapped point
  var mCoords = { x:graph.mouse.x * graph.width,
                  y:graph.mouse.y * graph.height,
                };
  var dist = distance(mCoords, snapped);
  if (dist > (graph.cellWidth * 0.3) || (gridX === 0 && gridY === 0)) {
    // Hide tip and exit
    $('.a5.tooltip').eq(0).hide();
    return;
  }

  // Draw ratio line
  drawLineByRatio(ratio, gCtx);

  var reduced = reduce(gridX, gridY);
  var tipTxt = reduced[0] + ':' + reduced[1] + ' octave ratio';

  // Draw snapped coordinate
  gCtx.fillStyle = 'rgba(255,255,255,1)';
  gCtx.strokeStyle = 'rgba(0,0,0,1)';
  gCtx.lineWidth = 1;
  gCtx.beginPath();
  gCtx.arc(snapped.x, snapped.y, 5, 0, 2 * Math.PI);
  gCtx.fill();
  gCtx.stroke();
  gCtx.closePath();

  // Labels
  var tip = $('.a5.tooltip').eq(0);
  $(tip).show();

  var tOffsetX = 50;
  var tOffsetY = -10;
  if (ratio > 1.5) {
    tOffsetX = -150;
    tOffsetY = -100;
  }

  // Draw line from tip to point of interest
  // gCtx.save();
  // gCtx.strokeStyle = tipLineColor;
  // gCtx.lineWidth = 1;
  // gCtx.beginPath();
  // gCtx.moveTo(snapped.x, snapped.y);
  // gCtx.lineTo(snapped.x + tOffsetX, snapped.y + tOffsetY);
  // gCtx.stroke();
  // gCtx.restore();

  // Update text
  $(tip).children('.tiptext.en').text(tipTxt);

  // Update position
  $(tip).css('left', gOffsetX + snapped.x + tOffsetX);
  $(tip).css('top', gOffsetY + snapped.y + tOffsetY);

};

function drawLineByRatio(ratio, gCtx) {

  var endX = Math.max(0, graph.width * ratio);
  var endY = Math.min(0, graph.height * ratio);

  gCtx.beginPath();
  gCtx.moveTo(0, graph.height);
  gCtx.lineTo(endX, endY);
  gCtx.stroke();

}

/**
 * Set inital interface state.
 */
setTimeout(function() {
  cycleActivity(true);
}, 350);

$('.overlay').hide();

