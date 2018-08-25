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

class WeChatController extends Controller {
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
}

module.exports = WeChatController;