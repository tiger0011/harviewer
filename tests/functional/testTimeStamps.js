/**
 * Check custom time stamps generated by console.timeStamp() method.
 */
define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  './DriverUtils',
  'intern/dojo/node!leadfoot/helpers/pollUntil'
], function(intern, registerSuite, assert, require, DriverUtils, pollUntil) {
  var harViewerBase = intern.config.harviewer.harViewerBase;
  var testBase = intern.config.harviewer.testBase;

  registerSuite({
    name: 'testTimeStamps',

    'testTimeStamps': function() {
      // Some of these tests need a larger timeout for finding DOM elements
      // because we need the HAR to parse/display fully before we query the DOM.
      var timeout = 10 * 1000;
      var r = this.remote;
      var utils = new DriverUtils(r);

      // Example of the result URL:
      // http://legoas/har/viewer/?path=http://legoas/har/viewer/selenium/tests/hars/time-stamps.har
      var url = harViewerBase + "?path=" + testBase + "tests/hars/time-stamps.har";

      return r
        .setFindTimeout(timeout)
        .get(url)
        .findByCssSelector(".PreviewTab.selected")
        // Make sure we are in the Preview tab.
        .then(utils.cbAssertElementContainsText("css=.PreviewTab.selected", "Preview"))
        // There must be 6 time stamps bars (3 per request * 2 requests)
        .then(DriverUtils.waitForElements(".netTimeStampBar.netBar", 6, timeout))
        // Check position on the waterfall graph
        .execute(function() {
          var bars = window.document.querySelectorAll(".netTimeStampBar.netBar");
          return (bars) && (bars.length === 6) &&
            ([bars[0].style.left,
              bars[1].style.left,
              bars[2].style.left,
              bars[3].style.left,
              bars[4].style.left,
              bars[5].style.left
            ]);
        })
        .then(function(barsResult) {
          assert.isArray(barsResult);
          // gitgrimbo
          // IE11 Gives "77.51%" and not "77.515%" like FF-37, Chrome-43, PhantomJS-2.0.0
          assert.strictEqual(barsResult[0], '55.03%');
          assert.include(['77.515%', '77.51%'], barsResult[1]);
          assert.strictEqual(barsResult[2], '100%');
          assert.strictEqual(barsResult[3], '55.03%');
          assert.include(['77.515%', '77.51%'], barsResult[4]);
          assert.strictEqual(barsResult[5], '100%');
        });
    }
  });
});
