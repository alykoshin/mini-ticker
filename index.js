/**
 * Created by alykoshin on 17.09.15.
 */


'use strict';

//if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
//
//}

var methodNotSupported = function() {
  throw 'Method not supported';
};

var optionNotSupported = function() {
  throw 'Option not supported';
};

// MiniTicker

/**
 *
 * @param [options]                             - Options
 * @param {number}  [options.interval  = 1000]  - Tick interval in milliseconds
 * @param {boolean} [options.autoStart = false] - Auto start ticker after creation
 * @param {boolean} [options.autoAdjust = true] - Timer auto adjustment enabled
 * @param {string}  [options.format]            - Not supported (elapsed time format string)
 * @param {callback} onChange                   - Callback
 * @constructor
 */

var MiniTicker = function (options, onChange) {
  var self = this;

  if (arguments.length === 1) {
    options  = {};
    onChange = arguments[0];
  }

  //options = options || {};
  options.interval   = options.interval   || 1000;
  options.autoStart  = options.autoStart  || false;
  options.autoAdjust = options.autoAdjust || true;
  if (options.format) { optionNotSupported(); }
  self.options = options;

  self.onChange = (typeof onChange === 'function') ? onChange : function() {}; // Sanitize callback

  self.intervalId = null;

  self.accumulated = 0;
  self.thisRunStartTime  = null;
  self.thisRunCount      = 0;
  self._totalCount = 0;
  //self.lastTickTime = null; // Time of last tick
  self.adjustment = 0;      // Adjustment needed to compensate setTimeout() error for autoadjusting

  //

  self._getDiffMsec = function() {
    return Date.now() - self.thisRunStartTime;
  };

  self._format = function(diffMsec) {
    var diffDate = new Date(diffMsec);
    return diffDate.toISOString().substr(11, 8); // 'YYYY-MM-DDTHH:mm:ss.sssZ' -> 'HH:mm:ss'
  };

  self._processInterval = function() {
    self._totalCount++;
    self.thisRunCount++;
    var currTime = Date.now();                              // Current time
    if (self.thisRunStartTime !== null) {
      var errorMsec = currTime - self.thisRunStartTime;      // Last tick duration by fact
      self.adjustment = options.interval * self.thisRunCount - errorMsec; // Difference between tick duration needed and by fact
    } else {
      self.adjustment = 0;
    }
  };

  self._triggerOnChange = function() {
    self.onChange(self);
  };

  self._onInterval = function () {
    self._processInterval();
    self._setTimeout();
    self._triggerOnChange();
  };

  //self._setInterval = function () {
  //  self.intervalId = setInterval(self._onInterval, self.options.interval - (options.autoAdjust ? self.lastTickError : 0) );
  //};

  self._setTimeout = function () {
    //console.log('self.lastTickError:', self.lastTickError);
    self.intervalId = setTimeout(self._onInterval, self.options.interval + (options.autoAdjust ? self.adjustment : 0) );
  };

  self._start = function () {
    self._setTimeout();
  };

  self.start = function (restart) {
    if (typeof restart === 'undefined') { restart = true; }
    //console.log('self.active():', self.active(), '; restart:', restart);
    if (restart) {
      self.restart();
    } else if (!self._getActive()) {
      self._start();
    }
  };

  self.restart = function () {
    self.stop();
    self.reset();
    self._start();
  };

  self._stop = function() {
    clearInterval(self.intervalId);
    self.intervalId = null;
    self.accumulated += self._getDiffMsec(); // Store diff for this ticker run
  };

  self.stop = function () {
    if (self._getActive()) {
      self._stop();
    }
  };

  self.pause    = self.stop;
  self.continue = function () { self.start(false); };

  self._reset = function() {
    self.thisRunStartTime = Date.now();
    self.accumulated = 0;
    self._totalCount = 0;
    self.thisRunCount = 0;
  };

  self.reset = function () {
    self._reset();
    self._triggerOnChange();
  };

  self._getActive = function() {
    return !!self.intervalId;
  };

  self._setActive = function(val) {
    if (val) { self.start(); }
    else { self.stop(); }
    return val;
  };

  self.active = function (val) {
    return (typeof val === 'undefined') ? self._getActive() : self._setActive(val);
  };

  self.getElapsedMsec = function() {
    var res = self.accumulated;
    if (self._getActive()) { res += self._getDiffMsec(); }
    return res;
  };

  self.getElapsedString = function () {
    return self._format( self.getElapsedMsec() );
  };

  self.getCount = function() {
    return self._totalCount;
  };

  //

  if (options.autoStart) {
    self.start(true);
  }

};


if (typeof module !== 'undefined') {
  module.exports  = MiniTicker;
}

if (typeof window !== 'undefined') {
  window.MiniTicker  = MiniTicker;
}

