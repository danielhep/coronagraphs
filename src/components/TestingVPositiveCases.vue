<template>
  <section>
    <div class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Testing Capacity vs. Positive Cases</h1>
        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column container is-fluid is-one-quarter">
        <b-field :label="singleDay ? 'Date' : 'Start Date'">
          <b-datepicker
            v-model="date1"
            @input="getDataOnDate(true) "
            placeholder="Click to select..."
            icon="calendar-today"
            trap-focus
          ></b-datepicker>
        </b-field>
        <b-field>
          <div class="control">
            <b-switch v-model="singleDay">Single day analysis</b-switch>
          </div>
        </b-field>
        <b-field label="End Date" v-if="!singleDay">
          <b-datepicker placeholder="Click to select..." icon="calendar-today" trap-focus></b-datepicker>
        </b-field>
        <hr />
        <b-field>
          <div class="control">
            <b-switch v-model="perCapita">Per capita adjustment</b-switch>
          </div>
        </b-field>
      </div>
      <div class="column is-paddingless" ref="container" v-resize="onResize">
        <svg id="#testingvpositivecases" style="position: absolute" />
      </div>
    </div>
  </section>
</template>

<script>
import * as d3 from 'd3'
import { Delaunay } from 'd3-delaunay'
import { DateTime } from 'luxon'

export default {
  data () {
    return {
      singleDay: true,
      perCapita: true,
      date1: new Date(),
      loading: false,
      svgWidth: 600,
      svgHeight: 600,
      svg: {},
      populationData: [],
      covidData: [],
      margin: { top: 25, right: 20, bottom: 35, left: 50 }
    }
  },
  mounted () {
    this.loading = true
    Promise.all([
      this.getDataOnDate(),
      this.getPopulationData()
    ]).then(() => {
      this.loading = false
      this.update()
    })

    this.getDataOnDate()
    this.getPopulationData()

    this.svg = d3.select('svg')
    this.resize()
    this.create()
  },
  computed: {
    data () {
      // add population numbers to the data
      const data = this.populationData.map(d => ({ ...this.covidData.find(c => c.state === d.state), population: d.pop }))
      data.x = 'Test'
      data.y = 'test'
      return data
    }
  },
  methods: {
    onResize ({ width, height }) {
      this.svgWidth = width
      this.svgHeight = width / (4 / 3)
      this.resize()
    },
    resize () {
      this.svg.attr('width', this.svgWidth)
      this.svg.attr('height', Math.round(this.svgHeight))
      this.update()
    },
    async getDataOnDate (update) {
      const dateString = DateTime.fromJSDate(this.date1).toFormat('yyyyLLdd')
      this.covidData = await d3.csv(`https://covidtracking.com/api/states/daily.csv?date=${dateString}`, d3.autoType)
      if (update) this.update(true)
    },
    async getPopulationData () {
      this.populationData = await d3.csv('/population_states.csv', d3.autoType)
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

      let adjustedData
      if (this.perCapita) {
        adjustedData = data.map((d) => ({ ...d, x: d.positive / (d.population / 100000), y: d.totalTestResults / (d.population / 100000) }))
      } else {
        adjustedData = data.map((d) => ({ ...d, x: d.positive, y: d.totalTestResults }))
      }

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
        .data(cells)
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
    perCapita () { this.update(true) }
  }
}
</script>

<style>
</style>
