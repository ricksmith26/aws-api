const {pgp, db} = require('./config');

const stripe = require('stripe')('sk_test_G3vurnxjtg2gZRf6lQMT8YwA00fCJKlgLx');

exports.addToken = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const {user_id, payment_token} = JSON.parse(event.body);
    db.many(
        "INSERT INTO payment_tokens (user_id, payment_token) VALUES (user_id, payment_token)  RETURNING *;"
    ).then((games) => {
        callback(null,{
            statusCode: 200,
            headers,
            body: games
          })
    })
    .catch(e => {
        callback(null,{
          statusCode: e.statusCode || 500,
          body: "Could not add token " + e
        })
      }) 
}

exports.createIntent = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const [basket, id] = JSON.parse(event.body);

    const ids = Object.values(basket).map(item => {
        return item.product_id
    });

    const query = Object.values(basket).reduce((acc, item, i) => {
        acc+= `${i !== 0 ? ' UNION ' : ''}SELECT product_id, product_price FROM products WHERE products.product_id = $${i + 1}`;
        return acc;
    }, '')

    db.many(
        query,
        ids
    ).then( async (items) => {

        const total = items.reduce((acc, item) => {
            acc+= item.product_price * basket[item.product_id].qty;
            return acc;
        }, 0).toFixed(2)

        const intent = await stripe.paymentIntents.create({
            amount: Math.floor(total * 100),
            currency: 'gbp',
            setup_future_usage: 'off_session'
          });

        callback(null,{
            statusCode: 200,
            headers,
            body: intent
          })

    })
    .catch(e => {
        callback(null,{
          statusCode: e.statusCode || 500,
          body: "Could not create intent " + e
        })
      }) 
}