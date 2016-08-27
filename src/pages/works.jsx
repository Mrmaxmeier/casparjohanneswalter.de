import React from 'react'
import { Link } from 'react-router'
import { filter, find, contains, map } from 'underline'

import { rows, sorted as sortedWorks } from '../works.js'
import { tags, groups as tagGroups, slugify } from '../tags.js'

class MenuTag extends React.Component {
  static propTypes = {
    tag: React.PropTypes.object
  }
  render () {
    let tag = this.props.tag
    if (!tag.show) {
      return null
    }
    return (
      <li>
        <a>{tag.name}</a>
        <ul>
          {tag.subtags.map((subtag) => {
            let slug = slugify(subtag)
            return <Link key={slug} to={'/tags/' + slug}>{subtag}</Link>
          })}
        </ul>
      </li>
    )
  }
}

class WorkSummary extends React.Component {
  static propTypes = {
    work: React.PropTypes.object
  }
  render () {
    let work = this.props.work
    let tagif = (key, f) => {
      if (work[key] !== undefined) {
        return f(work[key])
      } else {
        return null
      }
    }
    let p = (data) => <p>{data}</p>
    return (
      <div className='work'>
        <h3>
          {work.title}
          {tagif('dateStr', (dateStr) => <em> ({dateStr})</em>)}
          {tagif('date', (date) => <em> ({date})</em>)}
        </h3>
        {tagif('subtitle', p)}
        {tagif('instrumentation', p)}
        {tagif('text', p)}
        {tagif('dateStr', p)}
        {tagif('duration', p)}
        {tagif('commision', p)}
        {tagif('dedication', p)}
        {tagif('1st performance', p)}
        {tagif('documentation', p)}
        {tagif('content', (content) => <div>Content; TODO: markdown</div>)}
        {tagif('media', (media) => media.map(
          (m, i) => (
            <span key={i}>
              <a href={m[1]}>{m[0]}</a>
              {i !== media.length - 1 ? <span> - </span> : null}
            </span>
          )
        ))}
      </div>
    )
  }
}

export class WorksPage extends React.Component {
  static propTypes = {
    params: React.PropTypes.object
  }
  render () {
    let works = sortedWorks()
    if (this.props.params.tag !== undefined) {
      // TODO: label
      works = works::filter((w) => {
        let tags = w.tags::map(slugify)
        return tags::contains(this.props.params.tag)
      })
    }

    let taggedAs = tags()::find((tag) => slugify(tag) === this.props.params.tag)

    return (
      <div className='works'>
        <nav className='dropdown'>
          <ul>
              <li>
                  <Link to='/works' activeClassName='active'>All</Link>
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
