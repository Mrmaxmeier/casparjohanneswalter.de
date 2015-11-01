gcd = (a, b, depth=0) ->
	if depth > 100
		return [0, 0]
	if b == 0 then a else gcd(b, a % b, depth+1)

reduce = (numerator, denominator) ->
	if $.isArray(numerator) && denominator == undefined
		return reduce(numerator[0], numerator[1])
	gcd_ = gcd(numerator, denominator)
	[numerator / gcd_, denominator / gcd_]

mul = (a, b) ->
	reduce(a[0] * b[0], a[1] * b[1])

swp = (f) ->
	[f[1], f[0]]

div = (a, b) ->
	mul(a, swp(b))

cpy = (f) ->
	[f[0], f[1]]

repr = (f) ->
	f[0] + "/" + f[1]

frac_to_num = (f) ->
	f[0] / f[1]


getfract = (table, index) ->
	num = $(table).find("tr:eq(0) > td:eq(#{index * 2}) > input")
	den = $(table).find("tr:eq(1) > td:eq(#{index * 2}) > input")
	[ parseInt(num.val()),
	  parseInt(den.val()) ]

setfract = (table, index, frac) ->
	$(table).find("tr:eq(0) > td:eq(#{index * 2}) > input").val(frac[0])
	$(table).find("tr:eq(1) > td:eq(#{index * 2}) > input").val(frac[1])
	$(table).find("tr:eq(2) > td:eq(#{index * 2}) > .cents").text(Math.round(frac_to_cent(frac)))

setimg = (table, index, frac, sum) ->
	a = (frac_to_cent(frac) + 100 / 12) * 72 / 1200
	a = Math.floor(a)
	x = sum + a // 72
	y = (a + 42) %% 72
	url = location.origin + "/static/kithara_calc/#{x}_#{y}.png"
	$(table).find("tr:eq(2) > td:eq(#{index * 2}) > img").attr("src", url)

setsubs = (table, index, sub) ->
	$(table).find("tr:eq(2) > td:eq(#{index * 2}) > .subs > input").val(sub)

getsubs = (table, index) ->
	parsed = parseInt($(table).find("tr:eq(2) > td:eq(#{index * 2}) > .subs > input").val())
	if isNaN(parsed)
		return 3
	return parsed

calcsubs = (frac) ->
	f = frac_to_num(frac)
	console.log(repr(frac), f, Math.log(f) / Math.log(2))
	return Math.floor(Math.log(f) / Math.log(2))

magic_number = (table, index) ->
	x = getfract(table, index)[0]
	if frac_to_num(getfract(table, index)) < 4/3
		x *= 2
	[ x * 2 ** getsubs(table, index),
	  getfract(table, index)[1] ]

apply_ui = (index) ->
	utmul = magic_number("#ut", index)
	utmul = reduce(utmul)
	console.log("sollte sein", repr(utmul))
	newsub = calcsubs(utmul)
	console.log("neue octave", newsub)

	ltmul = magic_number("#lt", index)
	ltmul = reduce(ltmul)
	console.log("sollte sein", repr(ltmul))
	console.log("neue octave", calcsubs(ltmul))

	multiplier = div(ltmul, utmul)
	console.log("mein multiplier", repr(multiplier))

	frac = getfract("#lt", index)
	if isNaN(frac[0]) or isNaN(frac[1])
		return

	console.log(multiplier, magic_number("#lt", index), magic_number("#ut", index), index)

	for i in [0..6]
		setimg("#ut", i, getfract("#ut", i), getsubs("#ut", i))

		f = mul(magic_number("#ut", i), multiplier)
		sub = calcsubs(f)
		f = div(f, [2 ** sub, 1])
		f = reduce(f)
		if frac_to_num(f) < 4/3
			sub--

		if i == 0
			while frac_to_num(f) >= 2
				f[1] *= 2
			f = reduce(f)

		console.log(sub, f, i)
		setfract("#lt", i, f)
		setsubs("#lt", i, sub)
		if i > 0
			setimg("#lt", i, f, sub)

apply_ui_on_elem = () ->
	apply_ui parseInt($(this).attr("data-row"))

frac_to_cent = (frac) ->
	Math.log(frac[0] / frac[1]) / Math.log(Math.pow(2, 1/1200))

apply_preset = (name) ->
	for d, i in presets[name]
		f = [d[0], d[1]]
		setfract("#ut", i, cpy(f))
		if i > 0
			setsubs("#ut", i, d[2])

for row in [0..6]
	nom_ti = row * 2 + 1
	den_ti = row * 2 + 2
	ti_sep = 2 * 7
	$("#ut > tr:eq(0)").append("""
	<td>
		<input type="text" tabindex="#{nom_ti}">
	</td>
	<td class="hidden"></td>""")
	$("#ut > tr:eq(1)").append("""
	<td>
		<input type="text" tabindex="#{den_ti}">
	</td>
	<td class="hidden"></td>""")
	$("#ut > tr:eq(2)").append("""
	<td>
		<span class="subs">
			Octave:
			<input type="text" tabindex="#{den_ti}" style="width: 3.5em; height: 1.5em;" placeholder="3">
		</span>
		<div class="cents"></div>
		<img style="max-width: 5em"/>
	</td>
	<td class="hidden"></td>""")
	$("#lt > tr:eq(0)").append("""
	<td>
		<input type="text" tabindex="#{ti_sep + nom_ti}" data-row="#{row}">
	</td>
	<td class="hidden"></td>""")
	$("#lt > tr:eq(1)").append("""
	<td>
		<input type="text" tabindex="#{ti_sep + den_ti}" data-row="#{row}">
	</td>
	<td class="hidden"></td>""")
	$("#lt > tr:eq(2)").append("""
	<td>
		<span class="subs">
			<input type="text" style="width: 3.5em; height: 1.5em;" placeholder="3">
		</span>
		<div class="cents"></div>
		<a href="#" data-row="#{row}">apply</a>
		<img style="max-width: 5em"/>
	</td>
	<td class="hidden"></td>""")


$("#ut > tr:eq(2) > td:eq(0)").addClass("hidden")
$("#lt > tr:eq(2) > td:eq(0)").addClass("hidden")

$("#ut > tr:eq(0) > td:eq(2)").css("padding-right", "3em")
$("#lt > tr:eq(0) > td:eq(2)").css("padding-right", "3em")

$("#lt > tr:eq(2) > td > a").on("click", apply_ui_on_elem)


presets = {
	"Hexad 1, green": [[8, 7, "o"], [12, 7, 3], [1, 1, 3], [9, 7, 3], [10, 7, 4], [12, 7, 4], [8, 7, 4]],
	"Hexad 6, middle-green": [[7, 4, "u"], [7, 6, 2], [7, 6, 3], [7, 5, 4], [7, 4, 4], [7, 4, 4], [7, 6, 4]],
	"Hexad 7, middle-orange": [[4, 3, "o"], [1, 1, 2], [4, 3, 3], [5, 3, 3], [3, 2, 4], [5, 3, 4], [7, 6, 4]],
	"Hexad 12, orange": [[3, 2, "u"], [12, 7, 3], [1, 1, 3], [6, 5, 3], [3, 2, 4], [12, 7, 4], [6, 5, 4]]
}


apply_preset("Hexad 12, orange")
setfract("#lt", 2, [3, 2])
apply_ui(2)
