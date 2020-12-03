/* eslint-disable max-len */

// This environment variable is only set in AWS. Local development shouldn't have it.
const isLambda = process.env.IS_LAMBDA;
const { ApolloServer, gql } = isLambda ? require('apollo-server-lambda') : require('apollo-server');

const getMutationResolver = require('./resolvers/mutation');
const getQueryResolver = require('./resolvers/query');
const getDBClient = require('../db/dbClient');

module.exports = (logger) => {
  const mutationResolver = getMutationResolver(logger);
  const queryResolver = getQueryResolver(logger);

  const typeDefs = gql`
    type Query {
        getMeeting(id: Int!): meeting
        getAllMeetings: [meeting]

        getMeetingItem(id: Int!): meeting_item
        getAllMeetingItems: [meeting_item]

        getMeetingWithItems(id: Int!): meeting_with_items
        getAllMeetingsWithItems: [meeting_with_items]

        getSubscription(id: Int!): subscription
        getAllSubscriptions: [subscription]
    }

    type Mutation {
        createMeeting(meeting_start_timestamp: String!, meeting_type: String, status: String, virtual_meeting_url: String): meeting
        updateMeeting(id: Int!, status: String, meeting_type: String, virtual_meeting_url: String, meeting_start_timestamp: String, meeting_end_timestamp: String): meeting
        
        createMeetingItem(meeting_id: Int!, order_number: Int, item_start_timestamp: String, item_end_timestamp: String, status: String, content_categories: String, description_loc_key: String, title_loc_key: String): meeting_item
        updateMeetingItem(id: Int, order_number: Int, status: String, item_start_timestamp: String, item_end_timestamp: String, content_categories: String, description_loc_key: String, title_loc_key: String): meeting_item

        createSubscription(phone_number: String, email_address:String, meeting_item_id: Int, meeting_id: Int): subscription
    }

    type subscription {
        id: Int
        phone_number: String
        email_address: String
        meeting_item_id: Int
        meeting_id: Int
        created_timestamp: String
        updated_timestamp: String
    }

    type meeting_with_items {
        meeting: meeting
        items: [meeting_item]
    }

    type meeting {
        id: Int
        status: String
        meeting_type: String
        created_timestamp: String
        updated_timestamp: String
        meeting_start_timestamp: String
        meeting_end_timestamp: String
        virtual_meeting_url: String
    }

    type meeting_item {
        id: Int
        meeting_id: Int
        parent_meeting_item_id: Int
        order_number: Int
        status: String
        created_timestamp: String
        updated_timestamp: String
        meeting_start_timestamp: String
        meeting_end_timestamp: String
        content_categories: String
        description_loc_key: String
        title_loc_key: String
    }
    `;

  // We are handling the lifecycle of the DB client here rather than inside individual resolver functions because
  // some resolver functions are nested within eachother. (Ex: getAllMeetingsWithItems, getMeetingWithItems and getMeeting)
  // If the resolver functions themselves handled the connections, the logic required to effeciently manage them such that only
  // one DB connection is used per GrapQL request would be unnecessarily complex.
  // So, we'll handle the connection's lifecycle here at the initial function call and throw it downstream.
  const resolverHandler = async (resolverFunc, args) => {
    let dbClient;
    try {
      dbClient = await getDBClient(logger);
      await dbClient.init();
      return await resolverFunc(dbClient, args);
    } catch (err) {
      logger.error(`Resolver error: ${err}`);
      throw err;
    } finally {
      try {
        logger.info('Ending DB connection');
        await dbClient.end();
      } catch (err) {
        logger.error(`Error ending DB connection: ${err.stack}`);
      }
    }
  };

  const resolvers = {
    Query: {
      getAllMeetings: async () => {
        logger.info('Initiating GetAllMeetings Query resolver');
        return resolverHandler(queryResolver.getAllMeetings);
      },
      getMeeting: async (_parent, args) => {
        logger.info('Initiating GetMeeting Query resolver');
        return resolverHandler(queryResolver.getMeeting, args.id);
      },
      getMeetingItem: async (_parent, args) => {
        logger.info('Initiating GetMeetingItem Query resolver');
        return resolverHandler(queryResolver.getMeetingItem, args.id);
      },
      getAllMeetingItems: async () => {
        logger.info('Initiating GetAllMeetingItems Query resolver');
        return resolverHandler(queryResolver.getAllMeetingItems);
      },
      getMeetingWithItems: async (_parent, args) => {
        logger.info('Initiating GetMeetingWithItems Query resolver');
        return resolverHandler(queryResolver.getMeetingWithItems, args.id);
      },
      getAllMeetingsWithItems: async () => {
        logger.info('Initiating GetAllMeetingsWithItems Query resolver');
        return resolverHandler(queryResolver.getAllMeetingsWithItems);
      },
      getSubscription: async (_parent, args) => {
        logger.info('Initiating GetSubscription Query resolver');
        return resolverHandler(queryResolver.getSubscription, args.id);
      },
      getAllSubscriptions: async () => {
        logger.info('Initiating GetAllSubscriptions Query resolver');
        return resolverHandler(queryResolver.getAllSubscriptions);
      },
    },
    Mutation: {
      createMeeting: async (_parent, args, context) => {
        logger.info('Initiating CreateMeeting Mutation resolver');
        return resolverHandler(mutationResolver.createMeeting, args);
      },
      updateMeeting: async (_parent, args, context) => {
        logger.info('Initiating UpdateMeeting Mutation resolver');
        return resolverHandler(mutationResolver.updateMeeting, args);
      },
      createMeetingItem: async (_parent, args, context) => {
        logger.info('Initiating CreateMeetingItem Mutation resolver');
        return resolverHandler(mutationResolver.createMeetingItem, args);
      },
      updateMeetingItem: async (_parent, args, context) => {
        logger.info('Initiating UpdateMeetingItem Mutation resolver');
        return resolverHandler(mutationResolver.updateMeetingItem, args);
      },
      createSubscription: async (_parent, args) => {
        logger.info('Initiating CreateSubscription Mutation resolver');
        return resolverHandler(mutationResolver.createSubscription, args);
      },
    },
  };

  // ApolloServer documentation: https://www.apollographql.com/docs/apollo-server/
  return new ApolloServer({
    typeDefs,
    resolvers,
    playground: {
      endpoint: '/dev/agendapi',
    },
    // Empty implementation for local and deployed dev use:
    // TODO: Auth needs to be refactored for AWS
    context: {},
  });
};