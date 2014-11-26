
[![NPM](https://nodei.co/npm/node-lru.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/node-lru/)

Node LRU Cache
==================
基于Nodejs开发的LRU Cache, 兼有缓存超时清除功能

### usage

```
var options = {
  expires: 5 * 60 * 1000,
  capacity: 5
};
var LRU = require('node-lru');
var cache = new LRU(2);//var cache = new LRU(options);
cache.set('key1', 'value1');
cache.set('key2', 'value2');
cache.set('key3', 'value3');

var value = cache.get('key2');

cache.on('extrusion', function (tail) {
  console.log(tail.key + ": " + tail.value);
});
cache.on('expired', function (element) {
  console.log(element.key + ": " + element.value);
});

```

### Run tests
```
$ npm test
```
