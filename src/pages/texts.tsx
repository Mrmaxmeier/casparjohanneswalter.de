import * as React from 'react'
import { Route, Link, Switch, RouteComponentProps } from 'react-router-dom'
import { _404Page } from './404'
// TODO: code splitting

// require("katex/dist/katex.min.css")
let texts = [
    { slug: "durchscheinende_etueden", title: "Zum Projekt der durchscheinenden Etüden (1992)", source: require("../texts/durchscheinende_etueden.md").default },
    { slug: "fraction_windowing", title: "Fraction Windowing and Continual Fractions", source: require("../texts/fraction_windowing.md").default },
]

let smaller_texts = [
    { slug: "list_of_intervals", title: "List of Intervals", source: require("../texts/list_of_intervals.md").default },
    { slug: "meantone_circles", title: "Meantone Circles", source: require("../texts/meantone_circles.md").default },
    { slug: "meantone_fingerprints", title: "Meantone Fingerprints", source: require("../texts/meantone_fingerprints.md").default },
]

export const route_urls = texts.concat(smaller_texts).map(def => '/texts/' + def.slug)

let processor = require<any>("unified")()
    .use(require<any>("remark-parse"), { footnotes: true })
    .use(require<any>("remark-math"))
    .use(require<any>("remark-rehype"))
    .use(require<any>("rehype-katex"))
    .use(require<any>("rehype-react"), { createElement: React.createElement })

class Markdown extends React.PureComponent<{ source: string }> {
    render() {
        return <section>
            {processor.processSync(this.props.source).contents}
        </section>
    }
}

export class TextsPage extends React.PureComponent<RouteComponentProps<any>, {}> {
    render() {
        return (
            <Switch>
                <Route exact path="/texts">
                    <>
                        <h3>Full Articles</h3>
                        <ul>
                            {texts.map(({ title, slug }) => <li key={slug}>
                                <Link to={`/texts/${slug}`}>{title}</Link>
                            </li>)}
                        </ul>
                        <h3>Smaller Texts / Examples</h3>
                        <ul>
                            {smaller_texts.map(({ title, slug }) => <li key={slug}>
                                <Link to={`/texts/${slug}`}>{title}</Link>
                            </li>)}
                        </ul>
                    </>
                </Route>
                {texts.map(({ source, slug }) =>
                    <Route key={slug} path={`/texts/${slug}`}>
                        <Markdown source={source} />
                    </Route>
                )}
                {smaller_texts.map(({ source, slug }) =>
                    <Route key={slug} path={`/texts/${slug}`}>
                        <Markdown source={source} />
                    </Route>
                )}
              <Route component={_404Page} />
            </Switch>
        )
    }
}
