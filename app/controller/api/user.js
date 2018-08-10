/*           _
      __  __(_)___  ____ _____ ____
     / / / / / __ \/ __ `/ __ `/ _ \
    / /_/ / / /_/ / /_/ / /_/ /  __/
    \__, /_/ .___/\__,_/\__, /\___/
   /____/ /_/          /____/

*/

'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const Controller = require('egg').Controller;

class UserController extends Controller {
    /**
     * 微信公众号
     * @return {Promise<*>}
     */

    // 授权登录
    async gzhLogin() {
        const {ctx, app} = this;

        const code = ctx.params.code;
        if (!code) {
            ctx.throw(404, 'code为空');
        }

        const oauth2_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${app.config.gzh_appId}&secret=${app.config.gzh_appSecret}&code=${code}&grant_type=authorization_code`;
        const oauth2_result = await ctx.curl(oauth2_url, {dataType: 'json'});
        const access_token = oauth2_result.data.access_token;
        const openId = oauth2_result.data.openid;

        if (openId) {
            let userInfo = await ctx.service.user.wxHasRegister(openId);//判断是否新用户
            // 新用户注册
            if (userInfo === false) {
                const user_url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openId}&lang=zh_CN`;
                const user_result = await ctx.curl(user_url, {dataType: 'json'});
                if (!user_result.openid) {
                    ctx.throw(500, '获取用户信息失败')
                }
                // 创建用户并重新赋值用户信息
                userInfo = await ctx.service.user.wxRegister({
                    open_id: user_result.data.openid,
                    nick_name: user_result.data.nickname,
                    password: crypto.createHash('md5').update('wechat').digest('hex'),
                    sex: user_result.data.sex,
                    headimg_url: user_result.data.headimgurl
                });
            }
            // 生成token
            const token = jwt.sign({user_id: userInfo.user_id}, app.config.jwtSecret, {expiresIn: '7d'});
            ctx.body = {token: `Bearer ${token}`};
            ctx.set('authorization', 'Bearer ' + token);
        } else {
            ctx.throw(500, '获取openId失败');
        }

        ctx.status = oauth2_result.status;
    }


    /**
     * 微信小程序
     * @return {Promise<*>}
     */
    async xcxLogin() {
        const {app, ctx} = this;

        const code = ctx.params.code;
        if (!code) {
            ctx.throw(404, 'code为空');
        }

        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${app.config.xcx_appId}&secret=${app.config.xcx_appSecret}&js_code=${code}&grant_type=authorization_code`;
        const result = await ctx.curl(url, {dataType: 'json'});
        const openId = result.data.openid;

        if (openId) {
            let userInfo = await ctx.service.user.wxHasRegister(openId);//判断是否新用户
            // 新用户注册
            if (userInfo === false) {
                userInfo = await ctx.service.user.wxRegister({
                    open_id: openId,
                    nick_name: 'wechat_xcx',
                    password: crypto.createHash('md5').update('wechat').digest('hex'),
                });
            }
            // 生成token
            const token = jwt.sign({user_id: userInfo.user_id}, app.config.jwtSecret, {expiresIn: '7d'});
            ctx.body = {token: `Bearer ${token}`, open_id: openId};
            ctx.set('authorization', 'Bearer ' + token);
        } else {
            ctx.throw(500, '获取openId失败');
        }

        ctx.status = result.status;
    }


    /**
     * H5 注册/登录/找回密码
     * @return {Promise<*>}
     */

    //注册
    async register() {
        const {ctx, app} = this;
        const mobile = ctx.request.body.mobile;
        const password = ctx.request.body.password;
        const code = ctx.request.body.code;
        if (!mobile || !password) {
            ctx.throw(404, '手机号或者密码不能为空');
        } else if (!code) {
            ctx.throw(404, '验证码不能为空');
        }

        //校验验证码
        const checkCode = await ctx.service.user.checkCode(mobile, code, '0');
        if (!checkCode) {
            ctx.throw(404, '验证码校验失败');
        }

        const user = await ctx.service.user.register({
            mobile: mobile,
            nick_name: 'wechat_h5',
            password: password,
        });

        // 生成token
        const token = jwt.sign({user_id: user.user_id}, app.config.jwtSecret, {expiresIn: '7d'});
        ctx.status = 200;
        ctx.body = {token: `Bearer ${token}`};
        ctx.set('authorization', 'Bearer ' + token);
    }

    //登录
    async login() {
        const {ctx} = this;
        const mobile = ctx.request.body.mobile;
        const password = ctx.request.body.password;
        if (!mobile || !password) {
            ctx.throw(404, '手机号或者密码不能为空');
        }
        const token = await this.ctx.service.user.login(mobile, password);
        ctx.status = 200;
        ctx.body = {token: `Bearer ${token}`};
        ctx.set('authorization', 'Bearer ' + token);
    }

    //找回密码
    async findPwd() {
        const {ctx} = this;
        const mobile = ctx.request.body.mobile;
        const code = ctx.request.body.code;

        let updates = {};
        updates.mobile = mobile;
        updates.password = crypto.createHash('md5').update(ctx.request.body.password).digest('hex');

        if (!mobile || !updates.password) {
            ctx.throw(404, '手机号或者密码不能为空');
        } else if (!code) {
            ctx.throw(404, '验证码不能为空');
        }

        //校验验证码
        const checkCode = await ctx.service.user.checkCode(mobile, code, '1');
        if (!checkCode) {
            ctx.throw(404, '验证码校验失败');
        }

        const user = await ctx.service.user.findPwd({mobile, updates});
        ctx.status = 200;
        ctx.body = user;
    }

    /**
     * 公共部分
     * @return {Promise<void>}
     */

    // 获取验证码 (type=0 注册, type=1 找回密码, type=2 绑定手机)
    async getCode() {
        const {ctx} = this;
        const mobile = ctx.request.body.mobile;
        const type = ctx.request.body.type;
        if (!mobile) {
            ctx.throw(404, '请输入合法的手机号');
        }
        if (type !== '0' && type !== '1' && type !== '2') {
            ctx.throw(404, '请输入验证码类型');
        }
        const code = await ctx.service.user.getCode(mobile, type);
        if (!code) {
            ctx.throw(500, '验证码发送失败');
        }
        ctx.status = 200;
        ctx.body = {msg: "验证码已发送"};
    }

    //绑定手机
    async Bind() {
        const {ctx, app} = this;
        const mobile = ctx.request.body.mobile;
        const code = ctx.request.body.code;

        const token = ctx.header.authorization;
        const userInfo = jwt.verify(token.split('Bearer ')[1], app.config.jwtSecret);
        const user_id = userInfo.user_id;

        let updates = {};
        updates.mobile = mobile;

        if (!mobile) {
            ctx.throw(404, '请输入合法的手机号');
        } else if (!code) {
            ctx.throw(404, '验证码不能为空');
        }

        //校验验证码
        const checkCode = await ctx.service.user.checkCode(mobile, code, '2');
        if (!checkCode) {
            ctx.throw(404, '验证码校验失败');
        }

        await ctx.service.user.Bind({user_id, updates});

        ctx.status = 200;
        ctx.body = {msg: "绑定手机成功"};

    }

    // 用户列表
    async userList() {
        this.ctx.body = await this.ctx.service.user.list(this.ctx.query);
    }

    // 用户信息
    async userInfo() {
        this.ctx.body = await this.ctx.service.user.find(this.ctx.params.id);
    }
}

module.exports = UserController;