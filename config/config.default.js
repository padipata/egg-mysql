/*           _
      __  __(_)___  ____ _____ ____
     / / / / / __ \/ __ `/ __ `/ _ \
    / /_/ / / /_/ / /_/ / /_/ /  __/
    \__, /_/ .___/\__,_/\__, /\___/
   /____/ /_/          /____/

*/

'use strict';

module.exports = appInfo => {
    const config = {};

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_yipage';

    // 部署环境
    config.domain = 'http://127.0.0.1:7001';

    // -------------------------微信相关---------------------------
    config.gzh_appId = 'wxe10ee0351418654f';
    config.gzh_appSecret = 'c61e0f7200814a68060290dd59252cd8';

    config.xcx_appId = 'wxea52628c53c37185';
    config.xcx_appSecret = '2f0c58c9f8f9f37adf53c0c2a100f7f1';
    // -----------------------------------------------------------

    // -------------------------阿里云sms---------------------------
    config.accessKeyId = 'LTAIGkMohKW5cLtN';
    config.secretAccessKey = 'ghAk7j6iFRaL3lwJBD2ykUX3z9WXyr';
    // -----------------------------------------------------------

    // token凭证
    config.jwtSecret = 'yipage';

    // 使用koa的中间件
    config.middleware = ['errorHandler'];

    config.auth = {
        test: 'tst',
    };

    // mysql
    config.sequelize = {
        dialect: 'mysql',//db类型
        database: 'template',//数据库名
        host: 'localhost',//主机
        port: '3306',//端口
        username: 'root',
        password: '123456',
    };

    // redis
    config.redis = {
        client: {
            host: '127.0.0.1',
            port: 6379,
            password: '',
            db: '0',
        },
    };

    // 异常捕获路由
    config.errorHandler = {
        match: '/api/v2',
    };

    // 关闭安全威胁csrf的防范
    config.security = {
        csrf: {
            ignore: '/api/*/*',
        },
    };

    // 解决跨域
    config.cors = {
        origin: '*',
        allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    };

    // 阿里云监控
    config.alinode = {
        enable: true,
        appid: '67709',
        secret: '107ed152e36ddcda86cfb05c3988d73286f6c2d0',
    };

    return config;
};
