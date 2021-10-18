const args = require('minimist')(process.argv.slice(2), { boolean: ['s', 't'] })
const fs = require('fs')
const Handlebars = require('handlebars')

Handlebars.registerHelper('toLowerCase', function (str) {
	return str.toLowerCase();
});

const createRoute = (name, model, slug, nameLocale) => {
	if (model && !fs.existsSync(`./models/${model}.js`)) {
		createModel(model, true)
	}
	const data = fs.readFileSync('./templates/rest.route.template', { encoding: 'utf8', flag: 'r' })
	const template = Handlebars.compile(data)
	const contents = template({ modelName: model, hasSlug: slug, modelNameLocale: nameLocale })
	fs.writeFile(`./routes/${name}.router.js`, contents, err => {
		if (err) return console.error(`\u001b[31m Error during create route: ${err.message}.\u001b[0m`);
		console.log('\u001b[32mSaved route!\u001b[0m');
	})
}

const createModel = (name, timestamp) => {
	const data = fs.readFileSync('./templates/model.template', { encoding: 'utf8', flag: 'r' })
	const template = Handlebars.compile(data)
	const contents = template({ name, timestamp })
	fs.writeFile(`./models/${name}.js`, contents, err => {
		if (err) return console.error(`\u001b[31m Error during create model: ${err.message}.\u001b[0m`);
		console.log('\u001b[32mSaved model!\u001b[0m');
	})
}

switch (args._[0]) {
	case 'route':
		args._.splice(0, 1)
		createRoute(args._[0], args.m || null, args.s, args.name || args.m || null)
		break
	case 'model':
		args._.splice(0, 1)
		createModel(args._[0], args.t)
		break
}