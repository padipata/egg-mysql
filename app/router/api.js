/*            _
       __  __(_)___  ____ _____ ____
      / / / / / __ \/ __ `/ __ `/ _ \
     / /_/ / / /_/ / /_/ / /_/ /  __/
     \__, /_/ .___/\__,_/\__, /\___/
    /____/ /_/          /____/

*/
'use strict';

module.exports = app => {
    const apiV2Router = app.router.namespace('/api/v2');
    const {controller, middleware} = app;
    const {wechat, qiniu, user} = controller.api;
    const auth = middleware.auth();//校验用户token中间件

    //******************** 公众号  ********************
    apiV2Router.get('/user/gzhLogin/:code', wechat.gzhLogin); // 小程序授权

    //******************** 小程序  ********************
    apiV2Router.get('/user/xcxLogin/:code', wechat.xcxLogin); // 小程序授权

    //******************** h5  ********************
    apiV2Router.post('/user/register', user.register); // 注册
    apiV2Router.post('/user/login', user.login); // 登录
    apiV2Router.put('/user/findPwd', user.findPwd); // 找回密码

    //******************** 公共部分  ********************
    apiV2Router.get('/qiniu', qiniu.getToken);//七牛云信息

    apiV2Router.post('/user/getCode', user.getCode); // 获取验证码
    apiV2Router.put('/user/Bind', auth, user.Bind); // 绑定手机

    apiV2Router.get('/user/userInfo', auth, user.userInfo); // 用户信息

};
