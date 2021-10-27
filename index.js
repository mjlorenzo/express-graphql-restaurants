const { graphqlHTTP } = require('express-graphql');
const { buildSchema, assertInputType } = require('graphql');
const express = require('express');

// our predefined seed database
const restaurants = [
  {
    "id": 0,
    "name": "WoodsHill ",
    "description": "American cuisine, farm to table, with fresh produce every day",
    "dishes": [
      {
        "name": "Swordfish grill",
        "price": 27
      },
      {
        "name": "Roasted Broccily ",
        "price": 11
      }
    ]
  },
  {
    "id": 1,
    "name": "Fiorellas",
    "description": "Italian-American home cooked food with fresh pasta and sauces",
    "dishes": [
      {
        "name": "Flatbread",
        "price": 14
      },
      {
        "name": "Carbonara",
        "price": 18
      },
      {
        "name": "Spaghetti",
        "price": 19
      }
    ]
  },
  {
    "id": 2,
    "name": "Karma",
    "description": "Malaysian-Chinese-Japanese fusion, with great bar and bartenders",
    "dishes": [
      {
        "name": "Dragon Roll",
        "price": 12
      },
      {
        "name": "Pancake roll ",
        "price": 11
      },
      {
        "name": "Cod cakes",
        "price": 13
      }
    ]
  }
];

// define our GraphQL schema
const schema = buildSchema(`
type Query {
  restaurant(id: Int): Restaurant,
  restaurants: [Restaurant]
}
type Restaurant {
  id: Int,
  name: String,
  description: String,
  dishes: [Dish]
},
type Dish {
  name: String,
  price: Float
},
input DishInput {
  name: String,
  price: Float
},
input RestaurantInput {
  name: String,
  description: String,
  dishes: [DishInput]
},
type Mutation {
  setRestaurant(input: RestaurantInput) : Restaurant
}
`);

// resolver object for each API endpoint
let root = {
  // 'restaurants' query returns the whole array
  restaurants: () => restaurants,
  // 'restaurant' query singles out a specific id
  restaurant: ({id}) => {
    console.log(id);
    let restaurant = restaurants.find((restaurant) => restaurant.id === id);
    if (!restaurant)
      throw new Error("Restaurant does not exist");
    
    return restaurant;
  },
  // 'setRestaurant' mutation adds a new restaurant
  setRestaurant: ({input}) => {
    let newRestaurant = { id: restaurants.length, ...input };
    restaurants.push(newRestaurant);
    return newRestaurant;
  }
};

// create our Express app
const app = express();
// insert the GraphQL middleware on the /graphql route
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

// listen on port 4000
const PORT = 4000;
app.listen(PORT);
// echo to console
console.log(`GraphQL API running on port ${PORT}`);