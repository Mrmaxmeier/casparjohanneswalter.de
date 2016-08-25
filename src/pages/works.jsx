import React from 'react'
import { Link } from 'react-router'
import { filter, contains } from 'underline'

import { rows, sorted as sortedWorks } from '../works.js'
import { groups as tagGroups } from '../tags.js'

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
            return <Link key={subtag} to={'/tags/' + subtag}>{subtag}</Link>
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
      works = works::filter((w) => {
        return w.tags::contains(this.props.params.tag)
      })
    }
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

/*
{% from 'work.html' import summary with context %}
{% from 'work.html' import summ2 with context %}
{% macro menu(tag) %}
<li>
    {% if tag.isLink %}
    <a style="font-size: 16" {% if name == tag.name %}class="selected"{% endif %} href="{{tag.link}}">{{tag.name}}</a>
    {% else %}
    <a style="font-size: 16">{{tag.name}}</a>
    {% endif %}
    {% if tag.has_subtags %}
    <ul>
        {% for subtag in tag.subtags %}
        {% if subtag.has_entries %}
        <a {% if name == subtag.name %}class="selected"{% endif %} href="{{subtag.link}}">{{subtag.name}}</a>
        {% endif %}
        {% endfor %}
    </ul>
    {% endif %}
</li>
{% endmacro %}
{% block body %}

<nav style="font-size: 0.8em; margin-top: 0px;" id="dropdown">
    <ul>
        <li>
            <a style="font-size: 16" {% if all %}class="selected"{% endif %} href="/works.html">All</a>
        </li>
        {{menu(by_instruments)}}
        {% for tag in tags %}
        {% if not tag.isSubtag and tag.show %}
        {{menu(tag)}}
        {% endif %}
        {% endfor %}
    </ul>
</nav>
*/

