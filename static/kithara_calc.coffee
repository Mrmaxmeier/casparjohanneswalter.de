gcd = (a, b, depth=0) ->
	if depth > 100
		return [0, 0]
	if b == 0 then a else gcd(b, a % b, depth+1)

reduce = (numerator, denominator) ->
	gcd_ = gcd(numerator, denominator)
	[numerator / gcd_, denominator / gcd_]

mul = (a, b) ->
	reduce(a[0] * b[0], a[1] * b[1])

swp = (f) ->
	[f[1], f[0]]

div = (a, b) ->
	mul(a, swp(b))

repr = (f) ->
	f[0] + "/" + f[1]



apply = (l, index, frac) ->
	while (frac[0] / frac[1]) < (l[index][0] / l[index][1])
		frac[0] *= 2
	frac = div frac, l[index]
	nl = (mul f, frac for f in l)
	subs = (0 for f in l)
	for frac, i in nl
		while (frac[0] / frac[1]) > 2
			subs[i]++
			frac[1] *= 2
		while (frac[0] / frac[1]) < 1
			subs[i]--
			frac[0] *= 2

	[(reduce f[0], f[1] for f in nl), subs]


base = [3, 2]

l = [base, [1, 1], [3, 2], [5, 4], [7, 4], [11, 8], [3, 2]]


[nl, subs] = apply(l, 3, [6, 5])
for f, i in nl
	console.log repr(f) + "  " + subs[i]
console.log "\n"



getfract = (table, index) ->
	num = $(table).find("tr:eq(0) > td:eq(#{index * 2}) > input")
	den = $(table).find("tr:eq(1) > td:eq(#{index * 2}) > input")
	[ Number.parseInt(num.val()),
	  Number.parseInt(den.val()) ]

setfract = (table, index, frac) ->
	$(table).find("tr:eq(0) > td:eq(#{index * 2}) > input").val(frac[0])
	$(table).find("tr:eq(1) > td:eq(#{index * 2}) > input").val(frac[1])
	$(table).find("tr:eq(2) > td:eq(#{index * 2}) > div:eq(1)").text(Math.round(frac_to_cent(frac)))

setimg = (table, index, frac, sum) ->
	a = (frac_to_cent(frac) + 100 / 12) * 72 / 1200
	a = Math.round(a)
	x = 4 + a // 72
	y = (a + 42) %% 72
	url = location.origin + "/static/kithara_calc/#{x}_#{y}.png"
	console.log(url)
	$(table).find("tr:eq(2) > td:eq(#{index * 2}) > img").attr("src", url)

window.getfract = getfract

for row in [0..6]
	nom_ti = row * 2 + 1
	den_ti = row * 2 + 2
	ti_sep = 2 * 7
	$("#ut > tr:eq(0)").append("""
	<td>
		<input type="text" tabindex="#{nom_ti}">
	</td>
	<td class="hidden"></td>
	""")
	$("#ut > tr:eq(1)").append("""
	<td>
		<input type="text" tabindex="#{den_ti}">
	</td>
	<td class="hidden"></td>
	""")
	$("#ut > tr:eq(2)").append("""
	<td>
		<div></div>
	</td>
	<td class="hidden"></td>
	""")
	$("#lt > tr:eq(0)").append("""
	<td>
		<input type="text" tabindex="#{ti_sep + nom_ti}" data-row="#{row}">
	</td>
	<td class="hidden"></td>
	""")
	$("#lt > tr:eq(1)").append("""
	<td>
		<input type="text" tabindex="#{ti_sep + den_ti}" data-row="#{row}">
	</td>
	<td class="hidden"></td>
	""")
	$("#lt > tr:eq(2)").append("""
	<td>
		<div></div>
		<div></div>
		<a href="#" data-row="#{row}">apply</a>
		<img style="max-width: 5em"/>
	</td>
	<td class="hidden"></td>
	""")


$("#ut > tr:eq(0) > td:eq(1)").css("padding-right", "3em")
$("#lt > tr:eq(0) > td:eq(1)").css("padding-right", "3em")

apply_ui = (index) ->
	frac = getfract("#lt", index)
	if isNaN(frac[0]) or isNaN(frac[1])
		return
	console.log index
	l = (getfract("#ut", i) for i in [0..6])
	nl = []
	for f, i in l
		if not isNaN(f[0]) and not isNaN(f[1])
			nl.push(f)
			setfract("#ut", i, f)
	console.log(nl)

	console.log frac
	[nl, subs] = apply(nl, index, frac)
	for frac, i in nl
		setfract("#lt", i, frac)
		if subs[i] > 0
			$("#lt").find("tr:eq(2) > td:eq(#{i * 2}) > div:eq(0)").text("+" + subs[i])
		else
			$("#lt").find("tr:eq(2) > td:eq(#{i * 2}) > div:eq(0)").text(subs[i])
		setimg("#lt", i, frac, subs[i])

apply_ui_on_elem = () ->
	console.log($(this).attr("data-row"))
	apply_ui $(this).attr("data-row")

frac_to_cent = (frac) ->
	Math.log(frac[0] / frac[1]) / Math.log(Math.pow(2, 1/1200))


#$("#lt > tr:eq(0) > td > input").on("keyup", apply_ui_on_elem)
#$("#lt > tr:eq(1) > td > input").on("keyup", apply_ui_on_elem)
$("#lt > tr:eq(2) > td > a").on("click", apply_ui_on_elem)

for frac, i in l
	setfract("#ut", i, frac)
setfract("#lt", 0, [5, 2])
apply_ui(0)
