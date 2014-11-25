var util = require('util');
var assert = require('assert');
var events = require('events');
var debug = require('debug')('LRU');

var DEFAULT_CAPACITY = 5;
var DEFAULT_EXPIRES = 5 * 60 * 1000;

/**
 * Node LRU Cache
 * @param {Object||Integer} options capacity and expires
 */
function LRU(options) {
  events.EventEmitter.call(this);
  options = options || {};
  if (typeof options === 'number') {
    options = {capacity: options};
  }
  this.expires = options.expires || DEFAULT_EXPIRES;
  this.capacity = options.capacity || DEFAULT_CAPACITY;
  this.list = {};
  this.length = 0;
  this._cleanExpired();
}
util.inherits(LRU, events.EventEmitter);

LRU.prototype.get = function (key) {
  var element = this.list[key];
  if (!element) { return; }
  this.set(key, element.value);
  return element.value;
};

LRU.prototype.set = function (key, value) {
  var element = this.remove(key) || {};

  this.length++;
  element.key = key;
  element.value = value;
  element.next = null;
  element.previous = this.headerKey ? this.list[this.headerKey] : null;
  element.date = Date.now();

  this.list[key] = element;

  if (this.headerKey && this.list[this.headerKey]) {
    this.list[this.headerKey].next = element;
  }
  this.headerKey = key;
  if (!this.tailKey) {
    this.tailKey = key;
  }

  if (this.length > this.capacity) {
    this._extrusion();
  }
};

LRU.prototype._extrusion = function () {
  assert(this.tailKey, 'LRU BUG: tailKey must be exist when excute extrusion');
  var tail = this.remove(this.tailKey);
  this.emit('extrusion', tail);
};

LRU.prototype._cleanExpired = function () {
  var self = this;
  self.intervalId = setInterval(function () {
    var key, element;
    for (key in self.list) {
      if (self.list.hasOwnProperty(key)) {
        element = self.list[key];
        assert(element, 'LRU BUG: this can not happen! Element must be exist when cleanExpired');
        if ((Date.now() - element.date) > self.expires) {
          self.remove(key);
          self.emit('expired', element);
        }
      }
    }
  }, self.expires / 2);
};

LRU.prototype.remove = function (key) {
  var element = this.list[key];
  if (element) {
    delete this.list[key];
    --this.length;
    if (element.previous) {
      element.previous.next = element.next;
    }
    if (element.next) {
      element.next.previous = element.previous;
    }
    if (this.headerKey === key) {
      this.headerKey = element.previous ? element.previous.key : null;
    }
    if (this.tailKey === key) {
      this.tailKey = element.next ? element.next.key : null;
    }
    if (this.length === 0) {
      debug('LRU EMPTY');
      this.emit('empty', element);
    }
  }
  return element;
};

LRU.prototype.stopCleaner = function () {
  if (!this.intervalId) { return; }
  clearInterval(this.intervalId);
};

module.exports = LRU;