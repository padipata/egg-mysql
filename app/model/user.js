'use strict';

module.exports = app => {
    const {STRING, INTEGER, DATE} = app.Sequelize;

    const User = app.model.define('yp_users', {
        user_id: {type: INTEGER, primaryKey: true, autoIncrement: true},//用户id
        open_id: STRING(32),//微信open_id
        nick_name: {type: STRING(32), allowNull: false},//姓名
        password: {type: STRING(255), allowNull: false},//密码  微信公众号与小程序统一使用'wechat'
        headimg_url: STRING(256),//头像
        mobile: STRING(32),//手机号
        sex: {type: STRING(4), defaultValue: '0'}, //值为1时是男性，值为2时是女性，默认值为0时是未知
        birthday: {type: STRING(32), defaultValue: '未设置'},//生日 默认使用当前时间
        created_at: DATE,//创建时间
        updated_at: DATE,//更新时间
    });

    return User;
};