/*           _
      __  __(_)___  ____ _____ ____
     / / / / / __ \/ __ `/ __ `/ _ \
    / /_/ / / /_/ / /_/ / /_/ /  __/
    \__, /_/ .___/\__,_/\__, /\___/
   /____/ /_/          /____/

*/
'use strict';

const co = require('co');

module.exports = {
    up: co.wrap(function* (db, Sequelize) {

        /**
         * INTEGER 用于id、整数
         * DECIMAL(10, 2) 用于金钱
         *
         * STRING(255) 用于大部分字符
         * TEXT 用于文本
         *
         * DATE 用于时间
         */
        const {INTEGER, DATE, STRING, DECIMAL, TEXT} = Sequelize;

        // 用户表
        yield db.createTable('yp_users', {
            user_id: {type: INTEGER, primaryKey: true, autoIncrement: true},//用户id
            open_id: STRING(32),//微信open_id
            nick_name: {type: STRING(32), allowNull: false},//姓名
            password: {type: STRING(255), allowNull: false},//密码  微信公众号与小程序统一使用'wechat'
            headimg_url: STRING(256),//头像
            mobile: STRING(32),//手机号
            sex: {type: INTEGER, defaultValue: 0}, //值为1时是男性，值为2时是女性，默认值为0时是未知
            birthday: {type: STRING(32), defaultValue: '未设置'},//生日 默认使用当前时间
            created_at: DATE,//创建时间
            updated_at: DATE,//更新时间
        });
    }),

    down: co.wrap(function* (db) {
        yield db.dropTable('yp_users');//用户表
    }),
};