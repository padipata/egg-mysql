/*            _
       __  __(_)___  ____ _____ ____
      / / / / / __ \/ __ `/ __ `/ _ \
     / /_/ / / /_/ / /_/ / /_/ /  __/
     \__, /_/ .___/\__,_/\__, /\___/
    /____/ /_/          /____/

*/

const Subscription = require('egg').Subscription;

module.exports = {
    schedule: {
        cron: '0 0 0 * * *', // 每天的零点执行
        type: 'all', // 指定所有的 worker 都需要执行
    },
    async task(ctx) {
        console.log('**************** 定时任务开始 *****************')

        const users = await ctx.model.User.findAll();
        //...

        console.log('**************** 定时任务结束 *****************')
    },
};