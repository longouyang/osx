Phoenix.set({
  'openAtLogin': true
})

// idea: make editing commands modal like vim (need to press ctrl-esc to get into editing mode first)

/*

  ideas: 1 2 3 are first third, second third, third third horizontally

  / 5 1 is first fifth

  / 5 r 2 3 is horizonal second fifth through third fifth

  , / 5 r 2 4 / 1 2 is horizontal 2/5 through 4/5

  , / 5 r 1 3 / 7 r 2 4 is horizontal 2/5-4/5, vertical 2/7-4/7

  _ means current value

  so

  , _ / 1 2 means current half

*/

// ----------------------- alswel ------------------------------

/**
 * Phoenix
 * doc: https://github.com/jasonm23/phoenix/wiki/JavaScript-API-documentation
 *
 * Global Settings
 */

function alert(message, duration) {

  var win = Window.focused();

  var scrF = Screen.main().frameInRectangle();
  // var modal = new Modal();
  // modal.message = message;
  // modal.duration = duration || 1;
  // modal.show();
  Modal.build({
    message: message,
    duration: duration || 1,
    origin: function(foo) {
      return {x: 0, y: 0}
    }
  }).show()
}


function assert(condition, message) {
  if (!condition) {
    throw message || "Assertion failed";
  }
}

if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
      ? args[number]
      : match
      ;
    });
  };
}

var kh = [];
var controlShift = [ 'ctrl', 'shift' ];
var controlAltShift = [ 'ctrl', 'alt', 'shift' ];
var margin = 10;
var increment = 0.1;

/* Position */

var Position = {

    central: function (frame, window) {

        return {

            x: frame.x + ((frame.width - window.width) / 2),
            y: frame.y + ((frame.height - window.height) / 2)

        };
    },

    top: function (frame, window) {

        return {

            x: window.x,
            y: frame.y

        };
    },

    bottom: function (frame, window) {

        return {

            x: window.x,
            y: (frame.y + frame.height) - window.height

        };
    },

    left: function (frame, window) {

        return {

            x: frame.x,
            y: window.y

        };
    },

    right: function (frame, window) {

        return {

            x: (frame.x + frame.width) - window.width,
            y: window.y

        };
    },

    topLeft: function (frame, window, margin) {

        return {

            x: Position.left(frame, window).x + margin,
            y: Position.top(frame, window).y + margin

        };
    },

    topRight: function (frame, window, margin) {

        return {

            x: Position.right(frame, window).x - margin,
            y: Position.top(frame, window).y + margin

        };
    },

    bottomLeft: function (frame, window, margin) {

        return {

            x: Position.left(frame, window).x + margin,
            y: Position.bottom(frame, window).y - margin

        };
    },

    bottomRight: function (frame, window, margin) {

        return {

            x: Position.right(frame, window).x - margin,
            y: Position.bottom(frame, window).y - margin

        };
    }
};

/* Grid */

var Frame = {

    width: 1,
    height: 1,

    half: {

        width: 0.5,
        height: 0.5

    }
};

/* Window Functions */

Window.prototype.to = function (position) {

    this.setTopLeft(position(this.screen().visibleFrameInRectangle(), this.frame(), margin));
}

Window.prototype.grid = function (x, y, reverse) {

    var frame = this.screen().visibleFrameInRectangle();

    var newWindowFrame = _(this.frame()).extend({

        width: (frame.width * x) - (2 * margin),
        height: (frame.height * y) - (2 * margin)

    });

    var position = reverse ? Position.topRight(frame, newWindowFrame, margin) :
                             Position.topLeft(frame, newWindowFrame, margin);

    this.setFrame(_(newWindowFrame).extend(position));
}

Window.prototype.reverseGrid = function (x, y) {

    this.grid(x, y, true);
}

Window.prototype.resize = function (multiplier) {

    var frame = this.screen().visibleFrameInRectangle();
    var newSize = this.size();

    if (multiplier.x) {
        newSize.width += frame.width * multiplier.x;
    }

    if (multiplier.y) {
        newSize.height += frame.height * multiplier.y;
    }

    this.setSize(newSize);
}

Window.prototype.increaseWidth = function () {

    this.resize({ x: increment });
}

Window.prototype.decreaseWidth = function () {

    this.resize({ x: -increment });
}

Window.prototype.increaseHeight = function () {

    this.resize({ y: increment });
}

Window.prototype.decreaseHeight = function () {

    this.resize({ y: -increment });
}

var inMode = false;

var modal;

var exitMode = function() {
  for(var k in kh) {
    if (k.indexOf('start') == -1) {
      kh[k].disable()
    }
  }
  kh.start.enable();
  modal.close();
}

var enterMode = function() {
  initRestKeys();
  kh.start.disable();

  var origin = {x: 0, y: 0};
  var win = Window.focused();
  if (win) {
    var screenF = win.frame();
    origin.x = screenF.x;
    origin.y = screenF.y;
  }

  modal = Modal.build({
    message: '🐓',
    duration: 0,
    origin: function(foo) {
      return {x: 0, y: 0}
    },
    appearance: 'dark'
  });

  modal.show()

  for(var k in kh) {
    if (k !== 'start') {
      kh[k].enable()
    }
  }
}

var didRestKeysInit = false;

var initRestKeys = function() {
  if (didRestKeysInit) {
    return;
  }

  didRestKeysInit = true;
  kh.end = new Key('escape', [], function() {
    exitMode();
  })

  kh.max = new Key('m',[], function() {
    win_max();
    exitMode()
  })

  kh.center = new Key('c',[], function() {
    win_center();
    exitMode()
  })


  kh['1'] = new Key('1', [], function() {
    modal.message += ' 1';
    var win = Window.focused()
    if (win) {

      var winF = win.frame();
      var scrF = win.screen().visibleFrameInRectangle();

      win.setFrame(
        {x: scrF.x + 0,
         y: scrF.y + 0,
         width: Math.ceil(scrF.width * 1/3),
         height: scrF.height
        }
      )
    }
    exitMode()
  })

  kh['2'] = new Key('2', [], function() {
    modal.message += ' 2';
    var win = Window.focused()
    if (win) {

      var winF = win.frame();
      var scrF = win.screen().visibleFrameInRectangle();

      win.setFrame(
        {x: scrF.x + Math.ceil(scrF.width * 1/3),
         y: scrF.y + 0,
         width: Math.ceil(scrF.width * 1/3),
         height: scrF.height
        }
      )
    }
    exitMode()
  })

  kh['3'] = new Key('3', [], function() {
    modal.message += ' 3';
    var win = Window.focused()
    if (win) {

      var winF = win.frame();
      var scrF = win.screen().visibleFrameInRectangle();

      win.setFrame(
        {x: scrF.x + Math.ceil(scrF.width * 2/3),
         y: scrF.y + 0,
         width: Math.ceil(scrF.width * 1/3),
         height: scrF.height
        }
      )
    }
    exitMode()
  })

  kh['4'] = new Key('4', [], function() {
    modal.message += ' 4';
    var win = Window.focused()
    if (win) {

      var winF = win.frame();
      var scrF = win.screen().visibleFrameInRectangle();

      win.setFrame(
        {x: scrF.x + 0,
         y: scrF.y + 0,
         width: Math.ceil(scrF.width * 2/3),
         height: scrF.height
        }
      )
    }
    exitMode()
  })

  kh['5'] = new Key('5', [], function() {
    modal.message += ' 5';
    var win = Window.focused()
    if (win) {

      var winF = win.frame();
      var scrF = win.screen().visibleFrameInRectangle();

      win.setFrame(
        {x: scrF.x + Math.ceil(scrF.width * 1/3),
         y: scrF.y + 0,
         width: Math.ceil(scrF.width * 2/3),
         height: scrF.height
        }
      )
    }
    exitMode()
  })

  kh.l = new Key('l',[], function() {
    win_left()
    exitMode()
  });

  kh.r = new Key('r',[], function() {
    win_right()
    exitMode()
  });

  kh.i = new Key('i',[], function() {
    alert(Screen.main().frameInRectangle().y)
    exitMode()
  })

  kh.n = new Key('n', [], function() {
    var win = Window.focused()
    if (win) {
      var frame = win.frame();
      var oldScreen = win.screen();
      var allScreens = Screen.all();
      var oldScreenIndex = allScreens.indexOf(oldScreen);
      var newScreenIndex = (oldScreenIndex + 1) % allScreens.length;
      var newScreen = allScreens[newScreenIndex];

      var oldScreenRect = oldScreen.visibleFrameInRectangle();
      var newScreenRect = newScreen.frameInRectangle();

      var resizeWindow = (frame.width > newScreenRect.width  ||
                          frame.height > newScreenRect.height);

      // TODO: tweak
      var newWidth = resizeWindow
          ? Math.round((frame.width / oldScreenRect.width) * newScreenRect.width)
          : frame.width;

      var newHeight = resizeWindow
          ? Math.round((frame.height / oldScreenRect.height) * newScreenRect.height)
          : frame.height;

      var oldRelativeX = (frame.x - oldScreenRect.x) / oldScreenRect.width;
      var oldRelativeY = (frame.y - oldScreenRect.y) / oldScreenRect.height;

      win.setFrame({
        x: newScreenRect.x + oldRelativeX * newScreenRect.width,
        y: newScreenRect.y + oldRelativeY * newScreenRect.height,
        width: newWidth,
        height: newHeight
      });

    }
    exitMode()
  })

  kh.div = new Key('/', [], function() {
    modal.message += ' /'
    var fraction = [];

    [1,2,3,4,5,6,7,8,9].forEach(function(num) {
      kh[num + ''] = new Key(num + '',[], function() {
        modal.message += (' ' + num)
        fraction.push(num)
        if (fraction.length == 2) {
          var win = Window.focused()
          if (win) {
            exitMode()

            var winF = win.frame();
            var scrF = win.screen().visibleFrameInRectangle();

            win.setFrame(
              {x: scrF.x + scrF.width * (fraction[0] - 1)/fraction[1],
               y: scrF.y + 0,
               width: scrF.width / fraction[1],
               height: scrF.height
              }
            )
          }
        }

      })
    })
  })
}

kh.start = new Key('/',['alt'], enterMode)
kh.startCtrl = new Key('/',['ctrl'], enterMode)

var win_info = function() {
  var win
}

var win_max = function () {
  var win = Window.focused();
  if (win) {

    var screenF = win.screen().visibleFrameInRectangle();

    win.setFrame({
      x: screenF.x + 0,
      y: screenF.y + 0,
      width: screenF.width,
      height: screenF.height
    })
  }
}

var win_center = function () {
  var win = Window.focused();
  if (win) {

    var screenF = win.screen().visibleFrameInRectangle();

    win.setFrame({
      x: screenF.x + screenF.width / 4,
      y: screenF.y + 0,
      width: screenF.width / 2,
      height: screenF.height
    })
  }
}


// non grammatical
// for this to work, have to change alt cmd space spotlight open finder window shortcut
Key.on('space', ['alt','cmd'], win_max);

var win_left = function() {
  var win = Window.focused();

  if (win) {
    var screenF = win.screen().visibleFrameInRectangle();

    win.setFrame({
      x: screenF.x + 0,
      y: screenF.y + 0,
      width: Math.ceil(screenF.width/2),
      height: screenF.height
    })
  }
}

var win_right = function() {
  var win = Window.focused();

  if (win) {
    var screenF = win.screen().visibleFrameInRectangle();

    win.setFrame({
      x: screenF.x + Math.floor(screenF.width/2),
      y: screenF.y + 0,
      width: Math.ceil(screenF.width/2),
      height: screenF.height
    })
  }
}

var win_up = function() {
  var win = Window.focused();

  if (win) {
    var screenF = win.screen().visibleFrameInRectangle();

    win.setFrame({
      x: screenF.x + 0,
      y: screenF.y + 0,
      width: screenF.width,
      height: Math.floor(screenF.height/2)
    })
  }
}

var win_down = function() {
  var win = Window.focused();

  if (win) {
    var screenF = win.screen().visibleFrameInRectangle();

    win.setFrame({
      x: screenF.x + 0,
      y: screenF.y + Math.floor(screenF.height/2),
      width: screenF.width,
      height: Math.floor(screenF.height/2)
    })
  }
}



var ngLeft = Key.on('left', ['alt','cmd'], win_left);

var ngRight = Key.on('right', ['alt','cmd'], win_right);

var ngUp = Key.on('up', ['alt','cmd'], win_up);
var ngDown = Key.on('down', ['alt','cmd'], win_down);


// if current screen is smaller, proportionally resize it
var nextScreen = function() {

}


// https://github.com/kasper/phoenix/blob/master/API.md#1-keys
// https://github.com/kgrossjo/phoenix-config/blob/master/phoenix.js

var bootModal = new Modal();
bootModal.message = 'loaded';
bootModal.duration = 1;
bootModal.show();
//bootModal.close()
