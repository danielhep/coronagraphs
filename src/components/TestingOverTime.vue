<template>
  <section style="margin-top: 15px">
    <div class="hero is-dark">
      <div class="hero-body">
        <div class="container">
          <h3 class="title is-3">Testing Over Time</h3>
        </div>
      </div>
    </div>
    <div class="columns" style="margin-top: 15px;">
      <div class="column container is-fluid is-one-quarter">
        <b-field :label="singleDay ? 'Date' : 'Date Range'">
          <b-datepicker
            v-if="singleDay"
            v-model="date1"
            :min-date="dateRange[0].toJSDate()"
            :max-date="dateRange[1].toJSDate()"
            placeholder="Click to select..."
            icon="calendar-today"
            :loading="loading"
          ></b-datepicker>
          <b-datepicker
            v-else
            v-model="dates"
            range
            :min-date="dateRange[0].toJSDate()"
            :max-date="dateRange[1].toJSDate()"
            placeholder="Click to select..."
            icon="calendar-today"
            :loading="loading"
          ></b-datepicker>
        </b-field>
        <b-field>
          <div class="control level">
            <b-switch v-model="singleDay">Single day analysis</b-switch>
            <b-tooltip
              type="is-light"
              label="If enabled: only look at the change in data over one day.
              If disabled: select a range in date picker and graph will show change over selected time span."
              multilined
            >
              <b-icon icon="help-circle-outline" size="is-small"></b-icon>
            </b-tooltip>
          </div>
        </b-field>
        <b-field>
          <b-button v-if="!singleDay" @click="selectAllTime()">All Time</b-button>
        </b-field>
        <hr />
        <b-field>
          <div class="control level">
            <b-switch v-model="perCapita">Per capita adjustment</b-switch>
            <b-tooltip
              type="is-light"
              label="Divide all numbers by states' populations divded by 100k."
              multilined
            >
              <b-icon icon="help-circle-outline" size="is-small"></b-icon>
            </b-tooltip>
          </div>
        </b-field>
      </div>
      <div class="column is-paddingless" ref="container" v-resize="onResize">
        <svg :data-id="_uid" style="position: absolute" />
      </div>
    </div>
  </section>
</template>

<script>
import * as d3 from 'd3'
import { Delaunay } from 'd3-delaunay'
import { DateTime } from 'luxon'

import { mapState } from 'vuex'

export default {
  data () {
    return {
      singleDay: true,
      perCapita: true,
      date1: new Date(),
      svgWidth: 600,
      svgHeight: 600,
      dates: [],
      svg: {},
      margin: { top: 25, right: 20, bottom: 35, left: 50 },
      randomID: this._uid
    }
  },
  mounted () {
    this.svg = d3.select('svg[data-id="' + this._uid + '"]')
    this.resize()
    this.create()
  },
  computed: {
    ...mapState(['dateRange', 'loading', 'allDates']),
    data () {
      let adjustedData

      if (this.singleDay) {
        const dateObj = DateTime.fromJSDate(this.date1)
        const data = this.$store.state.stateData.filter(d => d.date.toISODate() === dateObj.toISODate())
        adjustedData = data.map((d) => ({ ...d, x: d.positiveIncrease, y: d.totalTestResultsIncrease }))
      } else {
        const date1 = DateTime.fromJSDate(this.dates[1]) // later date
        const date2 = DateTime.fromJSDate(this.dates[0]) // earlier date
        const data2 = this.$store.state.stateData.filter(d => d.date.toISODate() === date2.toISODate())
        const data1 = this.$store.state.stateData.filter(d => d.date.toISODate() === date1.toISODate())
        // filter out any states that didn't exist in the earlier data set
          .filter(d => data2.find(({ state }) => d.state === state))
        adjustedData = data1.map((d) => ({
          ...d,
          x: d.positive - data2.find(d2 => d2.state === d.state).positive,
          y: d.totalTestResults - data2.find(d2 => d2.state === d.state).totalTestResults
        }))
      }

      if (this.perCapita) {
        adjustedData = adjustedData.map((d) => ({ ...d, x: d.x / (d.population / 100000), y: d.y / (d.population / 100000) }))
      }
      adjustedData.x = 'Positive cases'
      adjustedData.y = 'Tests performed'
      return adjustedData
    }
  },
  methods: {
    selectAllTime () {
      this.dates = this.dateRange.map(d => d.toJSDate())
    },
    onResize ({ width, height }) {
      this.svgWidth = width
      this.svgHeight = width / (4 / 3)
      this.resize()
    },
    resize () {
      this.svg.attr('width', this.svgWidth)
      this.svg.attr('height', Math.round(this.svgHeight))
      d3.select(this.svg.node().parentNode).style('height', `${Math.round(this.svgHeight)}px`)
      this.update()
    },
    update (transition) {
      const width = this.svgWidth
      const height = this.svgHeight
      const data = this.data
      const margin = this.margin
      const svg = this.svg

      const transitionDuration = transition ? 750 : 0
      const t = d3.transition()
        .duration(transitionDuration)

      const adjustedData = this.data

      const x = d3.scaleLinear()
        .domain(d3.extent(adjustedData, d => d.x)).nice()
        .range([margin.left, width - margin.right])

      const y = d3.scaleLinear()
        .domain(d3.extent(adjustedData, d => d.y)).nice()
        .range([height - margin.bottom, margin.top])

      svg.selectAll('g.dots')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('fill', 'none')
        .selectAll('circle')
        .data(adjustedData)
        .join('circle')
        .transition(t)
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .attr('r', 3)

      const delaunay = Delaunay.from(adjustedData, (d) => x(d.x), (d) => y(d.y))
      const voronoi = delaunay.voronoi([this.margin.left, -1, width - 25, height - this.margin.bottom])

      const orient = {
        top: text => text.transition(t).attr('text-anchor', 'middle').attr('y', -6),
        right: text => text.transition(t).attr('text-anchor', 'start').attr('dy', '0.35em').attr('x', 6),
        bottom: text => text.transition(t).attr('text-anchor', 'middle').attr('dy', '0.71em').attr('y', 6),
        left: text => text.attr('text-anchor', 'end').attr('dy', '0.35em').attr('x', -6)
      }
      const cells = adjustedData.map((d, i) => ({ point: [x(d.x), y(d.y)], state: d.state, poly: voronoi.cellPolygon(i) }))
        // don't bother displaying text for a field if there is no polygon for it
        // no polygon happens when the point is right at an edge
        .filter(c => c.poly)
      svg.selectAll('g.text')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .selectAll('text')
        .data(cells, ({ state }) => state)
        .join(
          enter => enter.append('text')
        )
        .transition(t)
        .each(function ({ point, poly, state }, i) {
          const [cx, cy] = d3.polygonCentroid(poly)
          const angle = (Math.round(Math.atan2(cy - point[0], cx - point[1]) / Math.PI * 2) + 4) % 4
          d3.select(this).call(angle === 0 ? orient.right
            : angle === 3 ? orient.top
              : angle === 1 ? orient.bottom
                : orient.left)
        })
        .attr('transform', ({ point }) => `translate(${point[0]},${point[1]})`)
        .attr('opacity', ({ poly }) => -d3.polygonArea(poly) > 2000 ? 1 : 0)
        .text(d => d.state)

      const xAxis = g => g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80))
        .select('text')
        .attr('x', width)
        .attr('y', margin.bottom - 4)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'end')
        .text(data.x)
        .transition(t)

      const yAxis = g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .select('text')
        .attr('x', -margin.left)
        .attr('y', 10)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'start')
        .text(data.y)

      const grid = g => g
        .attr('stroke', 'currentColor')
        .attr('stroke-opacity', 0.1)
        .call(g => g.selectAll('line.vert')
          .data(x.ticks())
          .join('line')
          .transition(t)
          .attr('class', 'vert')
          .attr('x1', d => 0.5 + x(d))
          .attr('x2', d => 0.5 + x(d))
          .attr('y1', margin.top)
          .attr('y2', height - margin.bottom))
        .call(g => g.selectAll('line.horiz')
          .data(y.ticks())
          .join('line')
          .transition(t)
          .attr('class', 'horiz')
          .attr('y1', d => 0.5 + y(d))
          .attr('y2', d => 0.5 + y(d))
          .attr('x1', margin.left)
          .attr('x2', width - margin.right))

      svg.select('.x')
        .transition(t)
        .call(xAxis)

      svg.select('.y')
        .transition(t)
        .call(yAxis)

      svg.select('.grid')
        .call(grid)
    },
    create () {
      const svg = this.svg

      svg.append('g').attr('class', 'x').append('text')
      svg.append('g').attr('class', 'y').append('text')
      svg.append('g').attr('class', 'grid')
      svg.append('g').attr('class', 'text')
      svg.append('g').attr('class', 'dots')
    }
  },
  watch: {
    data () {
      this.update(true)
    }
  }
}
</script>

<style>
</style>
