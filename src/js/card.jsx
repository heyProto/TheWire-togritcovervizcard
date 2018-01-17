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
    return document.getElementById('protograph_div').getBoundingClientRect();
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

      scores = employed_score.concat(deaths_score, convicted_score)
      // console.log(scores, "scores")
      return(
        <div id="protograph_div" className="protograph-col16-mode">
          <div className="protograph-navbar-area"></div>
          <div className="protograph-col16-map-area">
            <div className="protograph-map-div">
              <div className="protograph-map-title">{data.map_title.employed_map_title} - {employed_count}</div>
              <Map
                dataJSON={employed_data}
                scoreArr={scores}
                allData={this.state.dataJSON}
                topoJSON={this.state.topoJSON}
                mode={this.props.mode}
                />
            </div>
            <div className="protograph-map-div">
              <div className="protograph-map-title">{data.map_title.deaths_map_title} - {deaths_count}</div>
              <Map
                  dataJSON={deaths_data}
                  scoreArr={scores}
                  allData={this.state.dataJSON}
                  topoJSON={this.state.topoJSON}
                  mode={this.props.mode}
                />
            </div>
            <div className="protograph-map-div">
              <div className="protograph-map-title">{data.map_title.convicted_map_title} - {convicted_count}</div>
              <Map
                  dataJSON={convicted_data}
                  scoreArr={scores}
                  allData={this.state.dataJSON}
                  topoJSON={this.state.topoJSON}
                  mode={this.props.mode}
                />
            </div> 
            <div className="protograph-col16-hint-text">{data.hint_text}</div>           
          </div> 
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
