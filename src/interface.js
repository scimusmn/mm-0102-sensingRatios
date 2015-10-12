// Interface.js

var zeroPadding = 4;

var currentActivity = 0;
var numActivities = 5;

var graph = _S('#trace');
var gOffsetX = $('#trace').offset().left;
var gOffsetY = $('#trace').offset().top;

// Hook into graph drawing loop
graph.customFGDraw = drawGraphOverlays;
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

// Default to stairs overlay
var currentOverlayMode = OVERLAY_STAIRS;

// Callback to export tooltip data.
var tipCallback = function() {};

/**
 * Update frequency readout text
 */
function updateFrequencyReadouts(inLeft, inRight) {

  // Update left frequency readout
  var newLeft = zeroPad(inLeft, zeroPadding);
  $('#fLeft').text(newLeft);

  // Update right frequency readout
  var newRight = zeroPad(inRight, zeroPadding);
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
  setOverlayMode(currentActivity, function(tipData) {

    // Update tooltips
    for (var i = 0; i < tipData.length; i++) {

      // Update position
      $(tipDivs[i]).css('left', tipData[i].x + gOffsetX + 65);
      $(tipDivs[i]).css('top', tipData[i].y + gOffsetY + 0);

      // Update text
      $(tipDivs[i]).children('.tiptext.en').text(tipData[i].enText);
      $(tipDivs[i]).children('.tiptext.es').text(tipData[i].esText);
      if (tipData[i].esText === '') {
        $(tipDivs[i]).children('.tiptext.es').hide();
      } else {
        $(tipDivs[i]).children('.tiptext.es').show();
      }

    };

  });

  // Hide/show tooltips based on activity
  $('.tooltip').hide();
  if (currentActivity === 0) {

    tipDivs[0].show();
    tipDivs[1].show();

  } else if (currentActivity === 4) {

    tipDivs[0].show();

  }

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
 * Graph Overlays
 */
function setOverlayMode(mode, _tipCallback) {

  currentOverlayMode = mode;
  tipCallback = _tipCallback;

};

function drawGraphOverlays() {

  var ctx = graph.getContext('2d');
  ctx.lineWidth = overlayWidth;
  ctx.strokeStyle = overlayColor;

  switch (currentOverlayMode) {
    case OVERLAY_STAIRS:
      drawStairs(ctx);
    break;
    case OVERLAY_RATIOS:
      drawRatios(ctx);
    break;
    case OVERLAY_OCTAVES:
      drawOctaves(ctx);
    break;
    case OVERLAY_CIRCLE:
      drawCircle(ctx);
    break;
    case OVERLAY_INTERACTIVE_RATIOS:
      drawInteractiveRatios(ctx);
    break;
    default:

    // Don't draw an overlay.
  }

};

function drawStairs(ctx) {

  var stepX = 0;
  var stepY = graph.height;

  ctx.beginPath();
  ctx.moveTo(stepX, stepY);

  // Draw staircase
  for (var i = 0; i < graph.range.x.divs; i++) {

    ctx.lineTo(stepX, stepY);

    stepX += graph.cellWidth;

    ctx.lineTo(stepX, stepY);

    stepY -= graph.cellWidth;

    ctx.lineTo(stepX, stepY);

  }

  ctx.stroke();

  var unison = graph.getPixelCoords(4, 4);
  var octave = graph.getPixelCoords(4, 3);

  tipCallback([{x:unison.x, y:unison.y, enText:'Unison', esText:'Unisono'},
                {x:octave.x, y:octave.y, enText:'Octave Difference', esText:'Diferencia de octava'},
                ]);

};

function drawRatios(ctx) {

  drawLineByRatio(1 / 2, ctx);
  drawLineByRatio(2 / 1, ctx);

};

function drawOctaves(ctx) {

  var cellHeight = graph.height / graph.range.y.divs;

  // Octave line
  ctx.beginPath();
  ctx.moveTo(0, graph.height - cellHeight);
  ctx.lineTo(graph.width, 0 - cellHeight);
  ctx.stroke();

  // Unison Line
  ctx.beginPath();
  ctx.moveTo(0, graph.height);
  ctx.lineTo(graph.width, 0);
  ctx.stroke();

};

function drawCircle(ctx) {

  var cellWidth = graph.width / graph.range.x.divs;

  // Frame
  ctx.beginPath();
  ctx.moveTo(cellWidth, graph.height - cellWidth);
  ctx.lineTo(cellWidth, cellWidth);
  ctx.lineTo(graph.width - cellWidth, cellWidth);
  ctx.lineTo(graph.width - cellWidth, graph.height - cellWidth);
  ctx.closePath();
  ctx.stroke();

  // Circle
  ctx.beginPath();
  ctx.arc(graph.width / 2, graph.height / 2, graph.width / 2 - (cellWidth), 0, 2 * Math.PI);
  ctx.stroke();

};

function drawInteractiveRatios(ctx) {

  // Get nearest X and Y coordinate on grid
  var gridX = Math.round(map(graph.mouse.x, 0, 1, 0, graph.range.x.divs));
  var gridY = Math.round(map(graph.mouse.y, 1, 0, 0, graph.range.y.divs));

  // Find closest 'whole' ratio
  var ratio = gridX / gridY;
  var snapped = graph.getPixelCoords(gridX, gridY);

  var reduced = reduce(gridX, gridY);

  var tipTxt = reduced[0] + ':' + reduced[1] + ' ratio';
  tipCallback([{x:snapped.x, y:snapped.y, enText:tipTxt, esText:''}]);
  drawLineByRatio(ratio, ctx);

  // Draw snapped coordinate
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(snapped.x, snapped.y, 5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

};

function drawLineByRatio(ratio, ctx) {

  var endX = Math.max(0, graph.width * ratio);
  var endY = Math.min(0, graph.height * ratio);

  ctx.beginPath();
  ctx.moveTo(0, graph.height);
  ctx.lineTo(endX, endY);
  ctx.stroke();

}

/**
 * Set inital interface state.
 */
setTimeout(function() {
  cycleActivity(true);
}, 1000);

$('.overlay').hide();

