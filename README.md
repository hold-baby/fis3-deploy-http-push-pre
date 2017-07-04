# fis3 http 部署插件

FIS 默认插件fis3-deploy-http-push的扩展插件，在原有插件基础上扩展提供上传前调用借口服务。

## 安装

全局安装或者本地安装都可以。

```
npm install fis3-deploy-http-push-pre --save-dev
```

## 扩展初衷

在使用fis3的远端部署方案时，多次执行上传操作，服务器上的文件会进行覆盖。但是如果上传前文件使用了hash，则会导致多余的文件留存。
如：第一次上传生成one_001.js，第二次上传生成one_002.js,有效文件是one_002.js，one_001.js则是无用文件，需要清除。所以本插件在上传文件前调用一个接口，服务器清除文件夹内容后再执行上传功能

## 使用方法

保留所有原插件功能，在data字段中添加prePath字段

```javascript
fis.match('*.js', {
    deploy: fis.plugin('http-push-pre', {
        //如果配置了receiver，fis会把文件逐个post到接收端上
        receiver: 'http://www.example.com:8080/receiver.php',
        //这个参数会跟随post请求一起发送
        to: '/home/fis/www',
        // 附加参数, 后端通过 $_POST['xx'] 获取
        // 如果 data 中 含有 to 这个 key, 那么上面那个to参数会覆盖掉data里面的to
        //如果data中prePath有值，那么插件在上传文件之前会向receiver地址的服务器发送一个GET请求，服务器返回成功才会执行上传操作
        data: {
            token : 'abcdefghijk',
            user : 'maxming',
            uid : 1,
            prePath : '/clear'
        }
    })
})
```

## 另类使用方法（原插件自带）

比如: 部署时需要 token 输入

举一反三

```javascript
const crypto = require('crypto');
const readlineSync = require('readline-sync');
fis.match('**', {
  deploy: [
    function (options, modified, total, next) {
      var token = readlineSync.question('\r\n请输入授权token : ', {
        hideEchoBack: true
      });
      if (!token) {
        return false;
      }
      var md5 = crypto.createHash('md5');
      fis.set('project.token', md5.update(token).digest('hex'));
      next();
    },
    function () {
      arguments[0] = {
        //如果配置了receiver，fis会把文件逐个post到接收端上
        receiver: 'http://127.0.0.1/receiver.php?debug=false',
        // receiver: 'http://127.0.0.1/receiver.php',
        //这个参数会跟随post请求一起发送
        to: '/home/fis/www',
        // to: '/Users/fis/www',
        // 附加参数, 后端通过 $_POST['xx'] 获取
        data: {
          token: fis.get('project.token')
        }
      };
      require('fis3-deploy-http-push-pre').apply(this, arguments);
    }
  ]
});
```
