/*           _
      __  __(_)___  ____ _____ ____
     / / / / / __ \/ __ `/ __ `/ _ \
    / /_/ / / /_/ / /_/ / /_/ /  __/
    \__, /_/ .___/\__,_/\__, /\___/
   /____/ /_/          /____/

*/

'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    require('./router/admin')(app);
    require('./router/api')(app);
};