const {db, headers} = require('./config');

module.exports.createOrder = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const {user_id, delivery_address, basket, transaction_id} = JSON.parse(event.body);

    db.one(
        "INSERT INTO orders (user_id, delivery_address_1, delivery_address_2, delivery_address_3, delivery_post_code, items, transaction_id) VALUES ($1, $2, $3, $4, $5, $6, $7) returning *",
        [user_id, delivery_address.address1, delivery_address.address2, delivery_address.address3, delivery_address.post_code, basket, transaction_id]
    ).then((order) => {
        callback(null,{
            statusCode: 200,
            headers,
            body: JSON.stringify(order)
          })
    }).catch(next)
}