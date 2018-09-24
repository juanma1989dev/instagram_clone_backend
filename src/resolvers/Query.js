const {getUserId} = require('../utils/utils');


async function  users(parent, args, context, info) {
    let user = getUserId(context);
    return context.db.query.users({}, info);    
}

async function me(parent, args, context, info){
    let userId = getUserId(context)
    return context.db.query.user({where: { id: userId }}, info)
}

async function photosByUser(parent, args, context, info) {
    let userId = getUserId(context);
    return context.db.query.photos({
        user: userId
    }, info);
}


module.exports = {
    users,
    me,
    photosByUser,
}