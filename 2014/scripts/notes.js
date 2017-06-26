var raf, caf;
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    raf = window.requestAnimationFrame;
    caf = window.cancelAnimationFrame;
    for (var x = 0; x < vendors.length && !raf; ++x) {
        raf = window[vendors[x] + 'RequestAnimationFrame'];
        caf = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!raf) {
        raf = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
        caf = function(id) {
            clearTimeout(id);
        };
    }
}());

/*function rand(dur, m) {
    var getVal = function () {
        return (Math.random() - 0.5) * (m || 1);
    };
    var val = getVal(),
        t = new Date().getTime();
    return function () {
        var now = new Date().getTime();
        if (now - t > dur) {
            val = getVal();
            t = now;
        }
        return val;
    };
}*/

function rand(m, n) {
    var r = Math.random();
    return (r + (n || 0)) * (m || 1);
}

function clamp(x, a, b) {
    return x < a ? a : x > b ? b : x;
}

function sign(x) {
    return x / Math.abs(x);
}

function getTime() {
    return new Date().getTime();
}

var notes = [],
    transformProp = 'transform';

function Note() {
    this.t = getTime();
    this.v = {};
    this.a = {};
    this.reset();
    this.img = document.createElement('img');
    this.img.src = '/2014/images/musicnotes.svg';
    this.img.width = this.s;
    this.img.height = this.s;
}

Note.prototype.update = function (time) {
    var elapsed = time - this.t,
        min, max;
    for (var p in this.v) {
        if (this.v.hasOwnProperty(p)) {
            this[p] += elapsed * this.v[p];
            if (this.a[p]) {
                this.v[p] += elapsed * this.a[p] / sign(this.v[p]);
                if (Math.abs(this.v[p]) < 0.03) {
                    this.v[p] = sign(this.v[p]) * 0.03;
                }
            }
        }
    }
    if (this.x !== clamp(this.x, this.minX, window.innerWidth + this.s) ||
        this.y !== clamp(this.y, this.minY, window.innerHeight + this.s) ||
        this.z !== clamp(this.z, this.minZ, this.maxZ * 2) ||
        this.o !== clamp(this.o, this.minO, this.maxO)) {
        this.reset();
    }
    this.t = time;
};
Note.prototype.render = function (time) {
    var n = this;
    this.update(time);
    var transform = 'translate(' + (n.x - (n.s/2)) + 'px,' +( n.y - (n.s/2)) + 'px) scale(' + n.z + ') rotate(' + n.r + 'deg);';
    this.img.setAttribute(
        'style',
        '-webkit-transform: ' + transform +
        'transform: ' + transform +
        'opacity: ' + this.o
    );
};
Note.prototype.reset = function () {
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight - 20;
    this.s = 20;
    this.maxZ = 2;
    this.z = Math.random() * this.maxZ;
    this.r = 0;
    this.o = 1;
    this.v.x = rand(0.15, -0.5);
    this.v.y = rand(0.15, -1);
    this.v.z = rand(0.0001, -1);
    this.v.r = rand(0.01, -0.5);
    this.v.o = rand(0.0002, -1);
    this.a.x = rand(0.00008, -0.8);
    this.a.y = rand(0.00004, -0.8);
    this.minX = -this.s;
    this.minY = -this.s;
    this.minO = 0;
    this.maxO = 100;
    this.minZ = 0;
    this.minR = -90;
    this.maxR = 40;
};

function renderNotes() {
    var i, l,
        now = getTime();

    for (i = 0, l = notes.length; i < l; ++i) {
        notes[i].render(now);
    }

    raf(renderNotes);
}

function addNote(sel) {
    var note = new Note();
    notes.push(note);
    document.querySelector(sel).appendChild(note.img);
    return note;
}

renderNotes();

window.onload = function () {
    function add(sel) {
        return function () {
            addNote(sel);
        };
    }
    for (var i = 0; i < 16; ++i) {
        setTimeout(add('.notes' + (i % 2 ? '.bg' : '.fg')), i * 500 * Math.random() + 250);
    }
};
