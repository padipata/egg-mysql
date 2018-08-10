'use strict';

//参数校验
exports.validate = {
    enable: true,
    package: 'egg-validate',
};

//处理跨域
exports.cors = {
    enable: true,
    package: 'egg-cors',
};

//sequelize
exports.sequelize = {
    enable: true,
    package: 'egg-sequelize'
};

//路由划分
exports.routerPlus = {
    enable: true,
    package: 'egg-router-plus',
};

//redis
exports.redis = {
    enable: true,
    package: 'egg-redis',
};

//阿里云监控
exports.alinode = {
    enable: true,
    package: 'egg-alinode',
};