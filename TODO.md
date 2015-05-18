
* 解决combo的问题。
* config 配置的问题。

* 先不要考虑打包的事情。

* 先配置 alias
```js
  // 别名配置
  alias: {
    'es5-safe': 'gallery/es5-safe/0.9.3/es5-safe',
    'json': 'gallery/json/1.0.2/json',
    'jquery': 'jquery/jquery/1.10.1/jquery'
  },
```

* 再配置路径
```js
  // 路径配置
  // 当目录比较深，或需要跨目录调用模块时，可以使用 paths 来简化书写。

  paths: {
    'gallery': 'https://a.alipayobjects.com/gallery',
    'gallery': 'https://a.alipayobjects.com/gallery',
    'app': 'path/to/app',
  },

```

* 映射配置，映射到本地，或者开发机
  // 映射配置
  map: [
    ['http://example.com/js/app/', 'http://localhost/js/app/'],
     [ '.js', '-debug.js' ]
  ],

* 预加载项目
```js
  // 预加载项
  preload: [
    Function.prototype.bind ? '' : 'es5-safe',
    this.JSON ? '' : 'json'
  ],
```

* base
```js
  //基础路径
  base: 'http://example.com/path/to/base/',
```

*
```js
 // 文件编码
  charset: 'utf-8'
```

* var
```js
 vars: {
    'locale': 'zh-cn'
  }

```

* debug
```js
debug:true
```