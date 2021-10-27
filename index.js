const { graphqlHTTP } = require('express-graphql');
const { buildSchema, assertInputType } = require('graphql');
const express = require('express');

// our predefined seed database
const restaurants = [
  {
    "id": 1,
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
    "id": 2,
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
    "id": 3,
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
type DeleteResponse {
  ok: Boolean
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
  setRestaurant(input: RestaurantInput): Restaurant,
  deleteRestaurant(id: Int): DeleteResponse
  editRestaurant(id: Int, input: RestaurantInput): Restaurant
}
`);

// resolver object for each API endpoint
let root = {
  // 'restaurants' query returns the whole array
  restaurants: () => restaurants,
  // 'restaurant' query singles out a specific id
  restaurant: ({id}) => {
    // search for the restaurant
    let restaurant = restaurants.find((restaurant) => restaurant.id === id);
    // if not found, throw an Error
    if (!restaurant)
      throw new Error("Restaurant does not exist");
    
    // otherwise send it back
    return restaurant;
  },
  // 'setRestaurant' mutation adds a new restaurant
  setRestaurant: ({input}) => {
    // create a new ID which either increments the last ID by 1 or becomes 1 itself
    let newId = (restaurants[restaurants.length - 1].id || 0) + 1;
    // create a new restaurant object with the new ID and input from the mutation
    let newRestaurant = { id: newId, ...input };
    // push it into the restaurant array
    restaurants.push(newRestaurant);
    // return the object
    return newRestaurant;
  },
  // 'deleteRestaurant' mutation deletes a restaurant
  deleteRestaurant: ({id}) => {
    // find the index of the restaurant
    let index = restaurants.findIndex((restaurant) => restaurant.id === id);
    // if it doesn't exist
    if (index < 0)
      // throw an error saying it doesn't exist
      throw new Error("Restaurant does not exist");
    
    // otherwise, splice out that entry from the restaurants array
    restaurants.splice(index, 1);
    return true;
  },
  // 'editRestaurant' mutation merges new data into an existing restaurant
  editRestaurant: ({id, input}) => {
    // find existing restaurant by ID
    let restaurant = restaurants.find((restaurant) => restaurant.id === id);
    
    // error if not in the data
    if (!restaurant)
      throw new Error("Restaurant does not exist");
    
    // merge properties, this is a shallow copy only
    return Object.assign(restaurant, input);
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