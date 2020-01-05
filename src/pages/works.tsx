import * as React from 'react'
import { NavLink, Link, match, RouteComponentProps } from 'react-router-dom'
import { filter, find } from 'lodash'

import { rows, sorted as sortedWorks, Work } from '../works'
import { tags, groups as tagGroups, slugify } from '../tags'

class MenuTag extends React.PureComponent<{
  tag: {
    show: boolean,
    name: string,
    subtags: string[]
  }
}, {}> {
  render () {
    let tag = this.props.tag
    if (!tag.show) {
      return null
    }
    return (
      <li style={{width: (tag.name === 'by Genre') ? '11em' : undefined}}>
        <a>{tag.name}</a>
        <ul>
          {tag.subtags.map((subtag) => {
            let slug = slugify(subtag)
            return <Link key={slug} to={'/works/' + slug}>{subtag}</Link>
          })}
        </ul>
      </li>
    )
  }
}

class WorkSummary extends React.PureComponent<{ work: Work }, {}> {
  render () {
    let work = this.props.work
    function tagif<T, O> (data: T, f: (d: T) => O): O | null {
      if (data !== undefined) {
        return f(data)
      } else {
        return null
      }
    }
    let p = (data: any) => <p>{data}</p>
    return (
      <div className='work'>
        <h3>
          {work.title}
          {tagif(work.year, (year) => <em> ({year})</em>)}
        </h3>
        {tagif(work.subtitle, p)}
        {tagif(work.instrumentation, p)}
        {tagif(work.text, p)}
        {tagif(work.duration, p)}
        {tagif(work.commision, p)}
        {tagif(work.dedication, p)}
        {tagif(work.wp, p)}
        {tagif(work.documentation, p)}
        {tagif(work.content, (content) => <div>Content; TODO: markdown</div>)}
        {tagif(work.media, (media) => (media || []).map(
          (m, i) => (
            <span key={i}>
              <a href={m[1]}>{m[0]}</a>
              {i !== (media || []).length - 1 ? <span> - </span> : null}
            </span>
          )
        ))}
      </div>
    )
  }
}

export class WorksPage extends React.PureComponent<RouteComponentProps<any>, {}> {
  render () {
    let works = sortedWorks()
    let slug = this.props.match && this.props.match.params.tag

    let taggedAs = tags().find((tag) => slugify(tag) === slug)

    if (taggedAs) {
      // TODO: label
      works = works.filter((w) =>
        w.tags.map(slugify).indexOf(slug) !== -1
      )
    }

    return (
      <div className='works'>
        <nav className='dropdown'>
          <ul>
              <li>
                  <NavLink to='/works' exact activeClassName='active'>All</NavLink>
              </li>
              {tagGroups().map((tag) => <MenuTag key={tag.name} tag={tag} />)}
          </ul>
        </nav>
        {taggedAs ? (
          works.length > 0 ? (
            <h4>Works tagged as '{taggedAs}':</h4>
          ) : (
            <h4>No works tagged as '{taggedAs}'</h4>
          )
        ) : null}
        {rows(works).map((row, i) => {
          if (row.length < 2) {
            return (
              <div className='one' key={i}>
                <WorkSummary work={row[0]}/>
              </div>
            )
          } else {
            return (
              <div className='two' key={i}>
                <WorkSummary work={row[0]}/>
                <WorkSummary work={row[1]}/>
              </div>
            )
          }
        })}
      </div>
    )
  }
}
