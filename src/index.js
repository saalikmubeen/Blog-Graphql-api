import { GraphQLServer } from 'graphql-yoga';
import { resolvers, fragmentReplacements } from './resolvers/index'
import prisma from './prisma';


const server = new GraphQLServer({typeDefs: './src/schema.graphql',
                resolvers: resolvers,
                context(req){
                    return {
                        prisma: prisma,
                        request: req
                    }
                },
                fragmentReplacements: fragmentReplacements
            });

server.start(() => console.log(`STARTING SERVER....!`))