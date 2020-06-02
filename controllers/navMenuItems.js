const { db, headers } = require('./config');

module.exports.getCategories = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
	Promise.all([categories(), subCategories(), searchTerms()])
		.then(([categories, subCategories, searchTerms]) => {
			const menuItems = categories.map((category) => {
				return {
					...category,
					subcategories: subCategories.reduce((acc, subCategory) => {
						if (subCategory.category_id === category.category_id) {
							acc.push({
								...subCategory,
								searchTerms: searchTerms.reduce((arr, term) => {
									if (term.subcategory_id === subCategory.subcategory_id) {
										arr.push(term);
									}
									return arr
								}, [])
							})
						}
						return acc;
					}, [])
				}
			})
			callback(null, {
				statusCode: 200,
				headers,
                body: JSON.stringify(menuItems)
            })
		})
		.catch(e => {
            console.log(e);
            callback(null, {
                statusCode: e.statusCode || 500,
                body: 'Error: Could not find Menu Items: ' + e
            })
        })
}

const categories = async () => {
	return db
		.many("SELECT * FROM categories ORDER BY categories.category_id ASC;")
		.then(categories => {

			return categories;
		})
}

const subCategories = async () => {
	return db
		.many("SELECT * FROM subCategories;")
		.then(subCategories => {

			return subCategories;
		})
}

const searchTerms = async () => {
	return db
		.many("SELECT * FROM search_terms;")
		.then(searchTerms => {
			return searchTerms;
		})
}

// module.exports.addCategory = (req, res, next) => {
// 	db.one(
// 		'CREATE TABLE categories (category_id: SERIAL PRIMARY KEY, category_name: VARCHAR)'
// 	).then(() => {
// 		"INSERT INTO categories	(category_name)	VALUES('PlayStation')"
// 	}).then((category) => {
// 		res.send(category)
// 	}).catch(next)
// }