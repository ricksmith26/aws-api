const {pgp, db, headers} = require('./config');

module.exports.getProductsByTerm = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const id = event.pathParameters.id;
    db.many(
        "SELECT * FROM products WHERE products.search_term_id = $1", [id]
    ).then((games) => {
        callback(null,{
            statusCode: 200,
            headers,
            body: JSON.stringify(games)
          })
    })
    .catch(e => {
        callback(null,{
          statusCode: e.statusCode || 500,
          body: "Could not get products" + e
        })
      }) 
}

module.exports.getProductsBySubcategory = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const id = event.pathParameters.id;
    db.many(
        "SELECT * FROM products WHERE products.subcategory_id = $1", [id]
    ).then((games) => {
        callback(null,{
            statusCode: 200,
            headers, 
            body: JSON.stringify(games)
          })
    })
    .catch(e => {
        callback(null,{
          statusCode: e.statusCode || 500,
          body: "Could not get products" + e
        })
      }) 
}

module.exports.addProduct = (req, res ,next) => {
    const {
        product_name,
        product_description,
        product_more_details,
        product_release_date,
        product_pegi,
        product_genre,
        product_images,
        product_price,
        subcategory_id,
        category_id,
        search_term_id
     } = req.body;
    db
    .one(
      "INSERT INTO products (product_name, product_description, product_more_details, product_release_date, product_pegi, product_genre, product_images, product_price, subcategory_id, category_id, search_term_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
      [product_name,
        product_description,
        product_more_details,
        product_release_date,
        product_pegi,
        product_genre,
        product_images,
        product_price,
        subcategory_id,
        category_id,
        search_term_id
    ]
    ).then(produect => {
        res.send(produect);
    })
    .catch(next)
}

module.exports.getProductById = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const id = event.pathParameters.id;
    db.many(
        "SELECT * FROM products WHERE products.product_id = $1", [id]
    ).then((games) => {
        callback(null,{
            statusCode: 200,
            headers, 
            body: JSON.stringify(games)
          })
    })
    .catch(e => {
        callback(null,{
          statusCode: e.statusCode || 500,
           
          body: "Could not get products" + e
        })
      }) 
}

module.exports.addImg = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const {image, brand} = JSON.parse(event.body);
    db.one(
        'INSERT INTO brand_images (image, brand) VALUES ($1, $2) RETURNING *;',
        [
            image,
            brand
        ]
    ).then((image) => {
        callback(null,{
            statusCode: 200,
            headers,
            body: image
          })
    })
    .catch(e => {
        callback(null,{
          statusCode: e.statusCode || 500,
          body: "Could not add image " + e
        })
      }) 
}

// module.exports.getImg = (req, res, next) => {
//     const brand = req.params.brand;
//     db.one(
//         'SELECT * FROM brand_images WHERE brand = $1;',
//         [brand]
//     ).then((image) => {
//         res.send(image)
//     }).catch(next)
// }

module.exports.getSaleGames = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return Promise.all([
        getPs4Games(),
        getXboxGames()
    ]).then(([ps4Games, xboxGames]) => {
        callback(null,{
            statusCode: 200,
            headers,
            body: JSON.stringify([...ps4Games, ...xboxGames])
          })
    })
    .catch(e => {
        callback(null,{
          statusCode: e.statusCode || 500,
          body: "Could not get sale games" + e
        })
      }) 
}

module.exports.getSaleHardware = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return Promise.all([
        getPs4Console(),
        getPs4Accessories(),
        getPs4VR(),
        getXboxConsole(),
        getXboxAccessories()

    ]).then(([ps4Console, ps4Accessories, ps4Vr, xboxConsole, xboxAccessories]) => {
        callback(null,{
            statusCode: 200,
            headers, 
            body: JSON.stringify([...ps4Console, ...ps4Accessories, ...ps4Vr, ...xboxConsole, ...xboxAccessories])
          })
    })
    .catch(e => {
        callback(null,{
          statusCode: e.statusCode || 500,
          body: "Could not get sale hardware" + e
        })
      }) 
}

module.exports.getTitle = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const { term, subcategory } = JSON.parse(event.body);

    if (term !== 'none') {
        return Promise.all([
            getTermName(term),
            getSubcategoryName(subcategory)

        ]).then(([termName, subcategory]) => {

            const name = `${termName.search_term} ${subcategory.subcategory_name}`
            callback(null,{
                statusCode: 200,
                headers, 
                body: JSON.stringify(name)
              })

        }).catch(e => {

            callback(null,{
              statusCode: e.statusCode || 500,
              body: "Could not get title" + e
            })})

    } else {
        return getSubcategoryName(subcategory)
            .then(subcategory => {
                const name = `${subcategory.subcategory_name}`;
                callback(null,{
                    statusCode: 200,
                    headers, 
                    body: JSON.stringify(name)
                })
            })
            .catch(e => {
                callback(null,{
                  statusCode: e.statusCode || 500,
                  body: "Could not get title" + e
                })
            }) 
    }
}

module.exports.getSearchItems = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const search = event.pathParameters.search;
    db.many(
        `SELECT * FROM products WHERE lower(product_name) LIKE '${search.toLowerCase()}%';`,
    ).then((searchResults) => {
        callback(null,{
            statusCode: 200,
            headers,
            body: JSON.stringify(searchResults)
        })
    })
    .catch(e => {
        callback(null,{
          statusCode: e.statusCode || 500,
          body: "Could not get search items " + e
        })
    }) 
}

module.exports.getMoreLikeThis = (event, context, callback) => {
    const id = event.pathParameters.id;
    return db
        .many('SELECT * FROM products WHERE search_term_id = $1 ORDER BY random() LIMIT 5;',
        id
        ).then((others) => {
            callback(null,{
                statusCode: 200,
                headers,
                body: JSON.stringify(others)
            })
        })
        .catch(e => {
            callback(null,{
              statusCode: e.statusCode || 500,
              headers, 
              body: "Could not get more like this" + e
            })
        }) 
}

const getPs4Games = async () => {
	return db
		.many('SELECT * FROM products WHERE subcategory_id = 1 ORDER BY random() LIMIT 2;')
		.then(games => {
			return games;
		})
}
const getXboxGames = async () => {
	return db
		.many('SELECT * FROM products WHERE subcategory_id = 6 ORDER BY random() LIMIT 3;')
		.then(games => {
			return games;
		})
}

const getPs4Console = async () => {
    return db
		.many('SELECT * FROM products WHERE subcategory_id = 2 ORDER BY random() LIMIT 1;')
		.then(console => {
			return console;
		})
}

const getPs4Accessories = async () => {
    return db
		.many('SELECT * FROM products WHERE subcategory_id = 4 ORDER BY random() LIMIT 1;')
		.then(console => {
			return console;
		})
}

const getPs4VR = async () => {
    return db
		.many('SELECT * FROM products WHERE subcategory_id = 3 ORDER BY random() LIMIT 1;')
		.then(console => {
			return console;
		})
}

const getXboxConsole = async () => {
    return db
		.many('SELECT * FROM products WHERE subcategory_id = 7 ORDER BY random() LIMIT 1;')
		.then(console => {
			return console;
		})
}

const getXboxAccessories =  async () => {
    return db
		.many('SELECT * FROM products WHERE subcategory_id = 8 ORDER BY random() LIMIT 1;')
		.then(console => {
			return console;
		})
}

const getTermName = async (id) => {
    return db
        .one('SELECT * FROM search_terms WHERE search_term_id = $1', [id])
        .then(term => {
            return term;
        })
}

const getSubcategoryName = async (id) => {
    return db
        .one('SELECT * FROM subcategories WHERE subcategory_id = $1', [id])
        .then(subcategory => {
            return subcategory
        })
}

