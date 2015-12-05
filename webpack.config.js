module.exports = {
	entry: {
		kithara_calc: './research/kithara_calc.js',
		partch_bruch_rechner: './research/partch_bruch_rechner.js'
	},
	output: {
		filename: './static/[name].bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.(js|jsx)$/,
				exclude: /(node_modules)/,
				loader: 'babel',
				query: {
					presets: [
						'react',
						'es2015'
					]
				}
			}
		]
	},
	externals: {},
	resolve: {
		extensions: ['', '.js', '.jsx', '.css']
	}
}
