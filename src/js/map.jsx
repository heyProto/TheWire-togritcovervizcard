import React from 'react';
import * as topojson from 'topojson-client';
import {geoPath, geoCentroid, geoMercator} from 'd3-geo';
import {scaleLinear} from 'd3-scale'
// import Voronoi from '../js/Voronoi';

class MapsCard extends React.Component {
  constructor(props) {
    super(props);

    let employed_score = {}

    this.props.dataJSON.data_points.forEach((e,i) => {
      // console.log(e, "eeeee")
      employed_score[e.state] = e.employed_value;
    });

    this.state = {
      projection: undefined,
      regions: [],
      outlines: [],
      country: undefined,
      path: undefined,
      offsetWidth: undefined,
      actualHeight: undefined,
      x:'100px',
      y:'100px',
      showTooltip:false,
      employedScore: employed_score
    }
  }

  componentWillMount() {
    let padding = this.props.mode === 'mobile' ? 20 : 0,
      offsetWidth = this.props.mode === 'mobile' ? 300 : 550 - padding ,
      actualHeight = this.props.mode === 'mobile' ? 500 : 300

    let tx = this.props.mode === 'mobile' ? offsetWidth / 2 : offsetWidth / 2;
    let ch = this.props.topoJSON,
      country = topojson.feature(ch, ch.objects),
      center = geoCentroid(topojson.feature(ch, ch.objects)),
      scale = 700,
      projection = geoMercator().center(center)
        .scale(scale)
        .translate([tx, actualHeight/2]),
      path = geoPath()
        .projection(projection);

    let bounds  = path.bounds(country),
      hscale = scale*offsetWidth  / (bounds[1][0] - bounds[0][0]),
      vscale = scale*actualHeight / (bounds[1][1] - bounds[0][1]);
    scale = (hscale < vscale) ? hscale : vscale;
    let offset = [offsetWidth - (bounds[0][0] + bounds[1][0])/2, actualHeight - (bounds[0][1] + bounds[1][1])/2];

    projection = geoMercator().center(center)
      .scale(scale)
      .translate(offset);
    path = path.projection(projection);

    let colorScale = scaleLinear()
      .domain([5, 200])
      .range([0.1, 1])

    let regions = country.features.map((d,i) => {
      return(
        <g key={i} className="region">
          <path className="geo-region" d={path(d)}></path>
        </g>
      )
    })

    console.log("KEYS", Object.keys(this.state.employedScore))
    console.log("kkkkk", country.features.map((d) => {return d.properties.NAME_1}))
    let outlines = country.features.map((d,i) => {

      console.log(this.state.employedScore, d.properties.NAME_1, this.state.employedScore[d.properties.NAME_1], "1")
      console.log(colorScale(this.state.employedScore[d.properties.NAME_1]), "2")

      // console.log(d, "dddd", this.state.employedScore[d.properties.NAME_1])
      let heat_color = 'protograph-bad-heat-color',
        fill = colorScale(this.state.employedScore[d.properties.NAME_1])
      console.log(fill, "fill")
      return(
        <path
          key={i}
          className={`geo region-outline ${heat_color}`}
          d={path(d)}
          data-state_code={d.properties.NAME_1}
        />
      )
    })

    this.setState({
      projection: projection,
      regions: regions,
      outlines: outlines,
      country: country,
      path: path,
      offsetWidth: offsetWidth,
      actualHeight: actualHeight
    })
  }

  render(){
    let styles = {
      strokeWidth: 0.675
    }
    const {projection, regions, outlines, country, path, offsetWidth, actualHeight} = this.state
    return(
      <div
        id="map_and_tooltip_container" className="protograph-map-container">
        <svg id='map_svg' viewBox={`0, 0, ${offsetWidth}, ${actualHeight}`} width={offsetWidth} height={actualHeight+60}>
          <g id="regions-grp" className="regions">{regions}</g>
          <path className='geo-borders' d={path(country)}></path>
          <g className="outlines" style={styles}>{outlines}</g>
        </svg>
      </div>
    )
  }
}

export default MapsCard;