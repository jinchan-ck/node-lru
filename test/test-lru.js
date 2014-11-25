var test = require('tape');

var LRU = require('../lib/lru');


test('test lru', function (t) {
  var lru = new LRU({capacity: 5, expires: 2000});
  lru.on('extrusion', function (tail) {
    t.equal(tail.key, 'key1', 'extrusion tail');
  });
  lru.on('empty', function () {
    lru.stopCleaner();
    t.equal(lru.length, 0, 'lru must 0 when emit empty');
    t.end();
  });
  lru.set('key1', 'value1');
  lru.set('key2', 'value2');
  lru.set('key3', 'value3');
  lru.set('key4', 'value4');
  lru.set('key5', 'value5');
  setTimeout(function () {
    lru.set('key6', 'value6');
  }, 1000);
  var value = lru.get('key5');
  t.equal(value, 'value5', 'get key5');
  t.equal(5, lru.length, 'lru capacity');
});

test('test capacity', function (t) {
  var lru = new LRU({capacity: 5, expires: 1000});
  lru.on('empty', function () {
    lru.stopCleaner();
    t.end();
  });
  lru.set('key1', 'value1');
  lru.set('key2', 'value2');
  lru.set('key3', 'value3');
  lru.set('key4', 'value4');
  lru.set('key5', 'value5');
  lru.set('key6', 'value6');
  lru.set('key7', 'value7');
  lru.set('key8', 'value8');
  lru.set('key9', 'value9');
  lru.set('key0', 'value0');
  t.equal(5, lru.length, 'lru capacity');
});

test('test header key', function (t) {
  var lru = new LRU({capacity: 5, expires: 1000});
  lru.on('empty', function () {
    lru.stopCleaner();
    t.end();
  });
  lru.set('key1', 'value1');
  lru.set('key2', 'value2');
  lru.set('key3', 'value3');
  lru.set('key4', 'value4');
  lru.set('key5', 'value5');
  lru.set('key1', 'value1');
  t.equal('key1', lru.headerKey, 'newest key is headerKey');
});

test('test get', function (t) {
  var lru = new LRU({capacity: 5, expires: 1000});
  lru.on('empty', function () {
    lru.stopCleaner();
    t.end();
  });
  lru.set('key1', 'value1');
  lru.set('key2', 'value2');
  lru.set('key3', 'value3');
  lru.set('key4', 'value4');
  lru.set('key5', 'value5');
  t.equal(lru.get('key1'), 'value1', 'get value');
  t.equal('key1', lru.headerKey, 'newest key is the last use one');
});

test('test extrusion', function (t) {
  var lru = new LRU({capacity: 5, expires: 1000});
  lru.on('empty', function () {
    lru.stopCleaner();
    t.end();
  });
  lru.on('extrusion', function (tail) {
    t.equal(tail.value, 'value1', 'tail was extrusioned');
  });
  lru.set('key1', 'value1');
  lru.set('key2', 'value2');
  lru.set('key3', 'value3');
  lru.set('key4', 'value4');
  lru.set('key5', 'value5');
  lru.set('key6', 'value6');
  t.equal(lru.get('key2'), 'value2', 'get value');
  t.equal('key2', lru.headerKey, 'newest key is the last use one');
});