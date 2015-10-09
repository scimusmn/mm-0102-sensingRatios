// Interface.js

var zeroPadding = 4;

var currentActivity = 0;
var numActivities = 4;

var titles = [{en:'Try to Trace the Lines', es:'Tratar de trazar las lineas'},
              {en:'Constant ratio', es:'Diferencia constante'},
              {en:'Can you trace the circle?', es:'Se puede trazar el circulo?'},
              {en:'Ratios', es:'Ratios'},
              ];

/**
 * Update frequency readout text
 */
function updateFrequencyReadouts(inLeft, inRight) {

  // Update left frequency readout
  var newLeft = zeroPad(inLeft, zeroPadding);
  $('#fLeft').innerHTML = newLeft;

  // Update right frequency readout
  var newRight = zeroPad(inRight, zeroPadding);
  $('#fRight').innerHTML = newRight;

}

/**
 * Increment or reset pattern overlay
 */
function cycleActivity(reset) {

  // Do NOT reset by default.
  reset = typeof reset !== 'undefined' ? reset : false;

  // Increment pattern
  if (reset === true || currentActivity >= numActivities) {
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

}

/**
 * When applicable, update activity visuals
 */
function activityUpdate() {

  if (currentActivity === 3) {
    // Get angle of line
    return;
  } else {
    return;
  }

}

/**
 * Reset for new user
 */
function resetForNewUser() {

  // Show first activity
  cycleActivity(true);

  // Show new user dialog
  $('.overlay').show();

  // Fade out after delay
  setTimeout(function() {
    $('.overlay').fadeOut('slow');
  }, 5000);

}
