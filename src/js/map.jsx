import React from 'react';
import * as topojson from 'topojson-client';
import {geoPath, geoCentroid, geoMercator} from 'd3-geo';
import {scaleLinear, scaleOrdinal, schemeCategory20c} from 'd3-scale';
import {min, max} from 'd3-array';
import {rgb, hsl} from 'd3-color';

class MapsCard extends React.Component {
  constructor(props) {
    super(props);

    let padding = 0,
      offsetWidth = 235,
      actualHeight = 270;

    let tx = this.props.mode === 'mobile' ? offsetWidth / 2 : offsetWidth / 2;
    let ch = this.props.topoJSON,
      country = topojson.feature(ch, ch.objects),
      center = geoCentroid(topojson.feature(ch, ch.objects)),
      scale = 500,
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

    let colorScale = scaleOrdinal()
      .domain([1, max(this.props.scoreArr)])
      // .domain([1, 726])
      // .range(["#f58686", "#f15555", "#ed2525", "#bc0a0a", "#760606"])
      .range(["#ff6d6d", "#ff0000", "#b30000", "#7d0000", "#570000"])

    let regions = country.features.map((d,i) => {
      return(
        <g key={i} className="region">
          <path className="geo-region" d={path(d)}></path>
        </g>
      )
    })

    let outlines = country.features.map((d,i) => {
      let heat_color = this.props.dataJSON[d.properties.NAME_1] === 0 ? 'protograph-no-value-color' : 'protograph-heat-color',
        opacity = this.props.dataJSON[d.properties.NAME_1] === 0 ? 1 : colorScale(this.props.dataJSON[d.properties.NAME_1])
      return(
        <path
          key={i}
          className={`geo region-outline ${heat_color}`}
          d={path(d)}
          fill={opacity}
          data-state_code={d.properties.NAME_1}
          onMouseOut={(e) => this.handleMouseOut(e, d)}
          onMouseMove={(e) => this.handleMouseMove(e, d)}
        />
      )
    })
    let grouped_data = this.groupBy(this.props.allData.data.data_points, "state");
    // console.log(grouped_data, "grouped_data")
    this.state = {
      projection: projection, 
      regions: regions,
      outlines: outlines,
      country: country,
      path: path,
      offsetWidth: offsetWidth,
      actualHeight: actualHeight,
      colorScale: colorScale,
      groupedData: grouped_data     
    }
    // this.drawMap();
  }

  drawMap() {
    // let regions = this.state.country.features.map((d,i) => {
    //   return(
    //     <g key={i} className="region">
    //       <path className="geo-region" d={this.state.path(d)}></path>
    //     </g>
    //   )
    // })
    let grouped_data = this.groupBy(this.props.allData.data.data_points, "state");

    let outlines = this.state.country.features.map((d,i) => {
      let heat_color = this.props.dataJSON[d.properties.NAME_1] === 0 ? 'protograph-no-value-color' : 'protograph-heat-color',
        opacity = this.props.dataJSON[d.properties.NAME_1] === 0 ? 1 : this.state.colorScale(this.props.dataJSON[d.properties.NAME_1])
      return(
        <path
          key={i}
          className={`geo region-outline ${heat_color}`}
          d={this.state.path(d)}
          fill={opacity}
          data-state_code={d.properties.NAME_1}
          onMouseOut={(e) => this.handleMouseOut(e, d)}
          onMouseMove={(e) => this.handleMouseMove(e, d)}
        />
      )
    })
    this.setState({
      // regions: regions,
      outlines: outlines,
      groupedData: grouped_data
    })    
  }

  componentWillReceiveProps() {
    this.drawMap();
  }

  handleMouseMove (e, d) {
    document.querySelectorAll('.protograph_tooltip').forEach((e) => {
      return e.style.display = 'block';
    })
    let target = e.target;
    
    document.querySelectorAll('.region-outline:not(.protograph-no-value-color)').forEach((e) => {
      return e.setAttribute('fill-opacity', 0.7)
    })
    document.querySelectorAll(`.region-outline[data-state_code='${d.properties.NAME_1}']`).forEach((e) => {
      return e.setAttribute('fill-opacity', 1)
    })
    document.querySelectorAll(`.region-outline[data-state_code='${d.properties.NAME_1}']`).forEach((e) => {
      return e.style.strokeWidth = 1.5
    })
    document.querySelectorAll(`.region-outline[data-state_code='${d.properties.NAME_1}']`).forEach((e) => {
      return e.style.stroke = "black"
    })

    let currState = d.properties.NAME_1,
      employedScore = this.state.groupedData[d.properties.NAME_1][0].employed_value,
      deathScore = this.state.groupedData[d.properties.NAME_1][0].deaths_value,
      convictedScore = this.state.groupedData[d.properties.NAME_1][0].convicted_value

    document.getElementById('tooltip-map-1').innerHTML = currState + " - " + employedScore + " employed"
    document.getElementById('tooltip-map-2').innerHTML = currState + " - " + deathScore + " died"
    document.getElementById('tooltip-map-3').innerHTML = currState + " - " + convictedScore + " convicted"

    e.target.classList.add('region-outline-hover');
    let rect = e.target.getBoundingClientRect();  

  }

  handleMouseOut (e,d){
    document.querySelectorAll('.region-outline').forEach((e) => {
      return e.setAttribute('fill-opacity', 1)
    })
    document.querySelectorAll('.region-outline').forEach((e) => {
      return e.style.strokeWidth = 0
    })
    document.querySelectorAll('.protograph_tooltip').forEach((e) => {
      return e.style.display = 'none';
    })
  }

  render(){
    let styles = {
      strokeWidth: 0.675
    }
    const {projection, regions, outlines, country, path, offsetWidth, actualHeight} = this.state
    return(
      <div id={`map_and_tooltip_container-${this.props.identifier}`} className="protograph-map-container">
        <svg id='map_svg' viewBox={`0, 0, ${offsetWidth}, ${actualHeight}`} width={offsetWidth} height={actualHeight}>
          <g id="regions-grp" className="regions">{regions}</g>
          <path className='geo-borders' d={path(country)}></path>
          <g className="outlines" style={styles}>{outlines}</g>
        </svg>
        <div id={`tooltip-${this.props.identifier}`} className="protograph_tooltip"></div>
      </div>
    )
  }

  groupBy(data, column) {
    let grouped_data = {},
      key;
    switch (typeof column) {
      case "string":
        data.forEach(datum => {
          key = datum[column] ? datum[column] : "NA";
          if (grouped_data[key]) {
            grouped_data[key].push(datum);
          } else {
            grouped_data[key] = [datum];
          }
        });
        break;
      case "function":
        data.forEach(datum => {
          let key = column(datum);
          if (grouped_data[key]) {
            grouped_data[key].push(datum);
          } else {
            grouped_data[key] = [datum];
          }
        });
        break;
    }
    return grouped_data;
  }


}

export default MapsCard;