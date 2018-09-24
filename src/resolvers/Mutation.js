const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const {getUserId} = require('../utils/utils');
const {APP_SECRET} =  require('../const');


const getId = `{ id }`

const queryUser = `{
    id,
    email,
    name,
    lastname,
    birth_date,
    suscription{
        id,
        end_date,
        suscription_type,
        price
    }
}`

Date.prototype.addDays = function(days){
    var date = new Date(this.valueOf())
    date.setDate(date.getDate() +days)
    return date;
}

async function signup(parent, args, context, info) {
    const password = await bcrypt.hash(args.password, 10)

    const user =  await context.db.mutation.createUser(
        {data: {...args, password,suscription:{
            create : {
                suscription_type : "FREE",
                price: 0,
                end_date: new Date().addDays(30)
            }
        }}}, queryUser)

    const token = await jsonwebtoken.sign({userId: user.id}, APP_SECRET)

    return {
        token,
        user
    }
}

async function login (parent, args, context, info) {
    const user = await context.db.query.user({
        where: {email: args.email}
    })

    if(!user) throw new Error("Not such user find");

    const validPassword = await bcrypt.compare(args.password, user.password);

    if(!validPassword) throw new Error("Invalid password");

    const token = await jsonwebtoken.sign({userId:user.id},APP_SECRET)

    return {
        token,
        user
    }
}


async function updateUser(parent, args, context, info){
    let user_id = getUserId(context)

    if(args.password) args.password = bcrypt.hash(args.password, 10)

    let updateUser = await context.db.mutation.updateUser({
        data:{
            ...args
        },
        where: {
            id: user_id
        }
    })
    return updateUser
}  

async function publicPhoto(parent, args, context, info){
    let userId = getUserId(context)
    
    let publicPhoto = await context.db.mutation.createPhoto({
        data:{
            path_photo: args.path_photo,
            user: { connect: { id: userId } }
        }
    }, info)
    
    return publicPhoto
}


async function likePhoto(parent, args, context, info){
    let userId = getUserId(context)

    let like = await  context.db.mutation.createLikes({
        data:{
            photo: { connect: { id: args.photo }},
            user: { connect: { id: userId }}
        }
    }, info)
    return like
}

async function follow(parent, args, context, info){
    let userId = getUserId(context)

    let follow = await context.db.mutation.createFollowers({
        data: {
            follower: { connect: { id: userId }},
            following: { connect: { id: args.following }}
        }
    }, info)
    return follow
}

module.exports = {
    signup,
    login,
    updateUser,
    publicPhoto,
    likePhoto, 
    follow
}
