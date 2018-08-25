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

    // 用户信息
    async userInfo() {
        const token = ctx.header.authorization;
        const userInfo = jwt.verify(token.split('Bearer ')[1], this.app.config.jwtSecret);
        this.ctx.body = await this.ctx.service.user.find(userInfo.user_id);
    }
}

module.exports = UserController;