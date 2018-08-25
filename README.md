# egg.js + mysql 后端模板


[![powered by Egg.js][egg-image]][egg]

[egg-image]: https://img.shields.io/badge/Powered%20By-Egg.js-ff69b4.svg?style=flat-square

## 快速入门

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### 环境依赖

- [redis](https://redis.io/)
- [egg-redis](https://www.npmjs.com/package/egg-redis/)
- [mysql](https://www.mysql.com/)
- [egg-sequelize](https://www.npmjs.com/package/egg-sequelize/)

### 本地开发

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### 生产部署

Use `EGG_SERVER_ENV=prod` to enable prod mode

`$ npm run start`

### 内置指令

- 使用 `npm run lint` 来做代码风格检查。
- 使用 `npm test` 来执行单元测试。
- 使用 `npm run autod` 来自动检测依赖更新。

### Docker 部署

```docker
# 打包镜像
docker build -t yipage/padipata:alpine .

# 运行镜像
docker run -d -p 7001:7001 yipage/padipata:alpine

# 查看运行日志
docker ps
docker logs {CONTAINER ID}

# 停止服务
docker ps
docker stop {CONTAINER ID}

# 删除镜像
docker ps -a
docker rm {CONTAINER ID}
docker rmi {IMAGE ID}
```


