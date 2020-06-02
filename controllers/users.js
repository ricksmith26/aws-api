const { db, headers } = require('./config');
const randtoken = require('rand-token');

module.exports.registerUser = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const {
        user_first_name,
        user_last_name,
        user_email,
        user_password,
        user_phone_number,
        user_address1,
        user_address2,
        user_address3,
        user_post_code
     }  = JSON.parse(event.body)
    db.one(
        "SELECT EXISTS(SELECT * FROM users WHERE user_email = $1)",
        [user_first_name]
    ).then((exists) => {
        if (exists) {
            callback(null,{
                statusCode: 200,
                headers, 
                body: JSON.stringify({error: 'email already exists'})
              })
        } else {
            db
            .one(
              "INSERT INTO users (user_first_name, user_last_name, user_email, user_password, user_phone_number, user_address1, user_address2, user_address3, user_post_code, last_login, login_token) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
              [ user_first_name,
                user_last_name,
                user_email,
                user_password,
                user_phone_number,
                user_address1,
                user_address2,
                user_address3,
                user_post_code,
                Date.now(),
                randtoken.generate(16)
            ]
            ).then(user => {
                callback(null,{
                    statusCode: 200,
                    headers, 
                    body: JSON.stringify(user)
                })
            })
        }
    })
    .callback(null,{
    statusCode: e.statusCode || 500,
    headers, 
    body: "Could not get register user" + e
  })
}

module.exports.loginFromToken = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const token = event.pathParameters.token;
    db.one(
        'SELECT * FROM users WHERE users.login_token = $1;', [token]
    ).then((user) => {
        const currentTime = Date.now();
        if ((currentTime - user.last_login) < 14400000){
            db.one(
                `UPDATE users SET last_login = ${currentTime} WHERE user_email = $1 RETURNING *;`,
                [user.user_email]
            ).then((updatedUser) => {
                callback(null,{
                    statusCode: 200,
                    headers, 
                    body: JSON.stringify({valid: true, user: updatedUser})
                  })
            })
        } else {
            callback(null,{
                statusCode: 200,
                headers, 
                body: JSON.stringify({valid: false})
              })
        }
    })
    callback(null,{
        statusCode: e.statusCode || 500,
        headers, 
        body: "Could not login from token" + e
      })
}

module.exports.loginFromEmail = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const { user_email, user_password } = JSON.parse(event.body);
    db.one(
        'SELECT * FROM users WHERE users.user_email = $1;', [user_email]
    ).then((user) => {
        if (user.user_password === user_password) {
            const currentTime = Date.now();
            db.one(
                `UPDATE users SET login_token = '${randtoken.generate(16)}', last_login = ${currentTime} WHERE user_email = $1 RETURNING *;`, [user_email]
            ).then((user) => {
                callback(null,{
                    statusCode: 200,
                    headers, 
                    body: JSON.stringify({valid: true, user})
                })
            })
        } else {
            callback(null,{
                statusCode: 200,
                headers, 
                body: JSON.stringify({valid: false})
            })
        }
    })
    .catch(e => {
        callback(null,{
          statusCode: e.statusCode || 500,
          headers, 
          body: "Could not login from email" + e
        })
    }) 
}