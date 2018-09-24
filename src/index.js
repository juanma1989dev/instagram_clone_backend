const { GraphQLServer } =  require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const Query = require ('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');

const resolvers = {
    Query,
    Mutation
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: req => ({
        ... req,
        db: new Prisma({
            typeDefs: 'src/generated/prisma.graphql',
            endpoint : 'https://eu1.prisma.sh/juan-manuel-guzman-rodriguez-0b9982/instagram/dev',
            debug : true,
        })
        
    }),
    resolverValidationOption: {
        requireResolversForResolveType: false
    }
})

const PORT =  process.env.PORT || 8000;
server.start(() => console.log('Server is running in htttp://localhost:4000'))