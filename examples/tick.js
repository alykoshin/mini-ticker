/**
 * Created by alykoshin on 13.12.15.
 */

var MiniTicker = require('../index.js');

var ticker = new MiniTicker({ autoStart: true }, function (ticker) {
  console.log('getCount():', ticker.getCount(), ', getElapsedString():', ticker.getElapsedString(), ', getElapsedMsec():', ticker.getElapsedMsec() );
});
