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

setfract = (table, index, fract) ->
    $(table).find("tr:eq(0) > td:eq(#{index * 2}) > input").val(fract[0])
    $(table).find("tr:eq(1) > td:eq(#{index * 2}) > input").val(fract[1])


window.getfract = getfract

uf_urow = $("#ut > tr:eq(0)")
uf_lrow = $("#ut > tr:eq(1)")

for row in [0..6]
    nom_ti = row * 2 + 1
    den_ti = row * 2 + 2
    ti_sep = 2 * 7
    uf_urow.append("""
    <td>
        <input type="text" tabindex="#{nom_ti}">
    </td>
    <td class="hidden"></td>
    """)
    uf_lrow.append("""
    <td>
        <input type="text" tabindex="#{den_ti}">
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


$("#ut > tr:eq(0) > td:eq(1)").css("padding-right", "3em")
$("#lt > tr:eq(0) > td:eq(1)").css("padding-right", "3em")

apply_ui = (index) ->
    frac = getfract("#lt", index)
    if isNaN(frac[0]) or isNaN(frac[1])
        return
    console.log index
    l = (getfract("#ut", i) for i in [0..6])
    nl = []
    for f in l
        if not isNaN(f[0]) and not isNaN(f[1])
            nl.push(f)
    console.log(nl)

    console.log frac
    [nl, subs] = apply(nl, index, frac)
    for frac, i in nl
        setfract("#lt", i, frac)

apply_ui_on_elem = () ->
    console.log($(this).attr("data-row"))
    apply_ui $(this).attr("data-row")

frac_to_cent = (frac) ->
	Math.log(frac[0] / frac[1]) / Math.log(Math.pow(2, 1/1200))


$("#lt > tr:eq(0) > td > input").on("keyup", apply_ui_on_elem)
$("#lt > tr:eq(1) > td > input").on("keyup", apply_ui_on_elem)
