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
const SMSClient = require('@alicloud/sms-sdk');

module.exports = app => {
    class User extends app.Service {

        //---------------------------------------------
        ////////////////  公众号 · 小程序  //////////////
        //---------------------------------------------

        /**
         * 该账号是否已经注册
         *
         * @param open_id
         * @return {Promise<*>}
         */
        async wxHasRegister(open_id) {
            const user = await this.ctx.model.User.findOne(
                {
                    where: {open_id: open_id}
                }
            );
            if (user && user.dataValues.open_id) {
                return user;
            }
            return false;
        }

        /**
         * 新用户注册
         */
        async wxRegister(user) {
            const userInfo = await this.ctx.model.User.create(user);
            return userInfo.dataValues;
        }


        //---------------------------------------------
        /////////////////////  H5   ///////////////////
        //---------------------------------------------

        //注册
        async register(user) {
            if (await this.hasRegister(user.mobile)) {
                this.ctx.throw(404, '该手机号已注册');
            }
            user.password = crypto.createHash('md5').update(user.password).digest('hex');
            const userInfo = await this.ctx.model.User.create(user);
            return userInfo.dataValues;
        }

        //验证手机号
        async hasRegister(mobile) {
            const user = await this.ctx.model.User.findOne(
                {
                    where: {mobile: mobile}
                }
            );
            if (user && user.dataValues.user_id) {
                return true;
            }
            return false;
        }

        //登录
        async login(mobile, password) {
            const pwd = crypto.createHash('md5').update(password).digest('hex');
            const userInfo = await this.checkUser(mobile, pwd);
            if (userInfo === false) {
                this.ctx.throw(404, '用户名或密码错误');
            }
            const token = jwt.sign({user_id: userInfo.user_id,}, app.config.jwtSecret, {expiresIn: '7d'});
            return token;

        }

        // 验证账号密码是否正确
        async checkUser(mobile, password) {
            const user = await this.ctx.model.User.findOne(
                {
                    where: {mobile: mobile, password: password}
                }
            );
            if (user && user.dataValues.user_id) {
                return user;
            }
            return false;
        }

        // 找回密码
        async findPwd({mobile, updates}) {
            const user = await this.ctx.model.User.findOne(
                {
                    where: {mobile: mobile}
                }
            );
            if (!user) {
                this.ctx.throw(404, '该用户不存在');
            }
            return user.update(updates);
        }

        //---------------------------------------------
        /////////////////////公共部分///////////////////
        //---------------------------------------------

        //发送验证码 (type=0 注册, type=1 找回密码, type=2 绑定手机)
        async getCode(mobile, type) {
            const accessKeyId = app.config.accessKeyId;
            const secretAccessKey = app.config.secretAccessKey;

            //初始化sms_client
            let smsClient = new SMSClient({accessKeyId, secretAccessKey});

            let templateCode;//短信模板

            switch (type) {
                case '0':
                    templateCode = 'SMS_140210001';
                    break;
                case '1':
                    templateCode = 'SMS_140235019';
                    break;
                case '2':
                    templateCode = 'SMS_140235019';
                    break;
            }

            let code = "";
            for (let i = 0; i < 4; i++) {
                code += Math.floor(Math.random() * 10)
            }

            //发送短信
            let {Code} = await smsClient.sendSMS({
                PhoneNumbers: mobile,
                SignName: '一页科技',
                TemplateCode: templateCode,
                TemplateParam: `{"code":${code}}`
            }).catch(function (err) {
                console.log(err);
                return false;
            });
            if (Code === 'OK') {
                //短信发送成功，将验证码存在redis
                await this.service.cache.setex(`code_${mobile}_${type}`, code, 60 * 5); // 五分钟
                return true;
            } else {
                return false;
            }
        }

        //校验验证码
        async checkCode(mobile, code, type) {
            const data = await this.service.cache.get(`code_${mobile}_${type}`);
            if (code == data) {
                return true
            } else {
                return false
            }
        }

        //绑定手机
        async Bind(user_id, updates) {
            const user = await this.ctx.model.User.findOne(
                {
                    where: {user_id: user_id}
                }
            );
            if (!user) {
                this.ctx.throw(404, '该用户不存在');
            }
            return user.update(updates);
        }

        // 获取用户列表
        async list({offset = 0, limit = 10, order_by = 'created_at', order = 'ASC'}) {
            const users = await this.ctx.model.User.findAndCountAll({
                offset,
                limit,
                order: [[order_by, order.toUpperCase()]],
            });
            if (!users || users.length === 0) {
                this.ctx.throw(404, '暂无用户');
            }
            return users;
        }

        // 获取用户信息
        async find(open_id) {
            const user = await this.ctx.model.User.findById(open_id);
            if (!user) {
                this.ctx.throw(404, '用户不存在');
            }
            return user;
        }
    }

    return User;
};