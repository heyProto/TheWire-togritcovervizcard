import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Map from './map.jsx'

export default class toManualScavengerCoverVizCard extends React.Component {

  constructor(props) {
    super(props)

    let stateVar = {
      fetchingData: true,
      dataJSON: {},
      topoJSON: {},
      schemaJSON: undefined,
      optionalConfigJSON: {},
      optionalConfigSchemaJSON: undefined,
      languageTexts: undefined
    };

    if (this.props.dataJSON) {
      stateVar.fetchingData = false;
      stateVar.dataJSON = this.props.dataJSON;
      stateVar.topoJSON = this.props.topoJSON;
    }

    if (this.props.optionalConfigJSON) {
      stateVar.optionalConfigJSON = this.props.optionalConfigJSON;
    }

    if (this.props.optionalConfigSchemaJSON) {
      stateVar.optionalConfigSchemaJSON = this.props.optionalConfigSchemaJSON;
    }

    this.state = stateVar;
  }

  exportData() {
    return this.props.selector.getBoundingClientRect();
  }

  componentDidMount() {
    if (this.state.fetchingData) {
      axios.all([
        axios.get(this.props.dataURL),
        axios.get(this.props.topoURL),
        axios.get(this.props.optionalConfigURL),
        axios.get(this.props.optionalConfigSchemaURL)
      ])
      .then(axios.spread((card, topo, opt_config, opt_config_schema) => {
        this.setState({
          fetchingData: false,
          dataJSON: card.data,
          topoJSON: topo.data,
          optionalConfigJSON: opt_config.data,
          optionalConfigSchemaJSON: opt_config_schema.data,
          languageTexts: this.getLanguageTexts(card.data.data.language)
        });
      }));
    }
  }

  getLanguageTexts(languageConfig) {
    let language = languageConfig ? languageConfig : "hindi",
      text_obj;

    switch(language.toLowerCase()) {
      case "hindi":
        text_obj = {
          font: "'Sarala', sans-serif"
        }
        break;
      default:
        text_obj = {
          font: undefined
        }
        break;
    }
    return text_obj;
  }

  renderCol16() {
    if (this.state.fetchingData ){
      return(<div>Loading</div>)
    } else {
      let data = this.state.dataJSON.data,
        employed_data = {},
        deaths_data = {},
        convicted_data = {},
        employed_score = [],
        deaths_score = [],
        convicted_score = [],
        scores = [];
    
      data.data_points.forEach((e,i) => {
        employed_data[e.state] = e.employed_value;
        deaths_data[e.state] = e.deaths_value;
        convicted_data[e.state] = e.convicted_value;
        employed_score.push(e.employed_value)
        deaths_score.push(e.deaths_value)
        convicted_score.push(e.convicted_value)
      });

      let employed_count = employed_score.reduce((a, b) => a + b, 0),
        deaths_count = deaths_score.reduce((a, b) => a + b, 0),
        convicted_count = convicted_score.reduce((a, b) => a + b, 0);

      let deaths_bar_width = (deaths_count * 100)/employed_count + '%',
        convicted_bar_width = (convicted_count * 100)/employed_count + '%';
      console.log(data, "data")

      scores = employed_score.concat(deaths_score, convicted_score)
      return(
        <div className="stink-cover protograph-col16-mode">
          <div className="first-map single-map">
            <div className="content-area">
              <div className="pre-text">Total</div>
              <div className="counter-area">
                <div className="bar-chart"></div>
                <div className="counter-value">{employed_count}</div>
              </div>
              <div className="post-text">{data.map_title.employed_map_title}</div>
            </div>
            <div className="map-area">
              <Map
                dataJSON={employed_data}
                scoreArr={scores}
                allData={this.state.dataJSON}
                topoJSON={this.state.topoJSON}
                mode={this.props.mode}
                identifier={'map-1'}
              />
            </div>
          </div>

          <div className="second-map single-map">
            <div className="content-area">
              <div className="pre-text">Of which</div>
              <div className="counter-area">
                <div className="bar-chart" style={{width:deaths_bar_width}}></div>
                <div className="counter-value">{deaths_count}</div>
              </div>
              <div className="post-text">{data.map_title.deaths_map_title}</div>
            </div>
            <div className="map-area">
              <Map
                dataJSON={deaths_data}
                scoreArr={scores}
                allData={this.state.dataJSON}
                topoJSON={this.state.topoJSON}
                mode={this.props.mode}
                identifier={'map-2'}
              />
            </div>
          </div>

          <div className="third-map single-map">
            <div className="content-area">
              <div className="pre-text">Of which</div>
              <div className="counter-area">
                <div className="bar-chart" style={{width:convicted_bar_width}}></div>
                <div className="counter-value">{convicted_count}</div>
              </div>
              <div className="post-text">{data.map_title.convicted_map_title}</div>
            </div>
            <div className="map-area">
              <Map
                dataJSON={convicted_data}
                scoreArr={scores}
                allData={this.state.dataJSON}
                topoJSON={this.state.topoJSON}
                mode={this.props.mode}
                identifier={'map-3'}
              />
            </div>
          </div>

          <div className="cover-title">{data.title_and_hint.title}</div>
          <div className="cover-hint-text">{data.title_and_hint.hint}</div>
        </div>
      )
    }
  }

  renderCol4() {
    if (this.state.fetchingData) {
      return (<div>Loading</div>)
    } else {
      let data = this.state.dataJSON.data,
        employed_data = {},
        deaths_data = {},
        convicted_data = {},
        employed_score = [],
        deaths_score = [],
        convicted_score = [];
    
      data.data_points.forEach((e,i) => {
        employed_data[e.state] = e.employed_value;
        deaths_data[e.state] = e.deaths_value;
        convicted_data[e.state] = e.convicted_value;
        employed_score.push(e.employed_value)
        deaths_score.push(e.deaths_value)
        convicted_score.push(e.convicted_value)
      });

      let employed_count = employed_score.reduce((a, b) => a + b, 0),
        deaths_count = deaths_score.reduce((a, b) => a + b, 0),
        convicted_count = convicted_score.reduce((a, b) => a + b, 0);

      return (
        <div className="protograph-col4-mode">
          <div className="protograph-navbar-area"></div>
          <div className="protograph-col4-map-area">
            <div className="protograph-map-title">{data.map_title.employed_map_title} - {employed_count}</div>
            <div className="protograph-map-title">{data.map_title.deaths_map_title} - {deaths_count}</div>
            <div className="protograph-map-title">{data.map_title.convicted_map_title} - {convicted_count}</div>
          </div>
        </div>
      )
    }
  }

  render() {
    switch(this.props.mode) {
      case 'col16' :
        return this.renderCol16();
        break;
      case 'col4':
        return this.renderCol4();
        break;
    }
  }
}
