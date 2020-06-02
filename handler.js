// 'use strict';
// const {}

// module.exports.getAllTodos = (event, context, callback) => {
//   context.callbackWaitsForEmptyEventLoop = false;
//   db.getAll('todo')
//     .then(res => {
//       callback(null, {
//         statusCode: 200,
//         body: JSON.stringify(res)
//       })
//     })
//     .catch(e => {
//       console.log(e);
//       callback(null, {
//         statusCode: e.statusCode || 500,
//         body: 'Error: Could not find Todos: ' + e
//       })
//     })
// };

//   // Use this code if you don't use the http event with the LAMBDA-PROXY integration
//   // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };

