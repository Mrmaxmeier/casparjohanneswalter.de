module.exports = {
	entry: './research/kithara_calc.js',
	output: {
		filename: './static/kithara_calc_bundle.js'
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
