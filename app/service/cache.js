/*            _
       __  __(_)___  ____ _____ ____
      / / / / / __ \/ __ `/ __ `/ _ \
     / /_/ / / /_/ / /_/ / /_/ /  __/
     \__, /_/ .___/\__,_/\__, /\___/
    /____/ /_/          /____/

*/

'use strict';

const Service = require('egg').Service;

class CacheService extends Service {
    async get(key) {
        const {redis} = this.app;
        let data = await redis.get(key);
        if (!data) return;
        data = JSON.parse(data);
        return data;
    }

    //EX为秒级，PX为毫秒级
    async setex(key, value, seconds) {
        const {redis} = this.app;
        value = JSON.stringify(value);
        await redis.set(key, value, 'EX', seconds);
    }

    async destroy(key) {
        const {redis} = this.app;
        await redis.del(key);
    }

    async incr(key, seconds) {
        const {redis} = this.app;
        const result = await redis.multi().incr(key).expire(key, seconds)
            .exec();
        return result[0][1];
    }
}

module.exports = CacheService;
