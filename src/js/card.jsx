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
      stateVar.languageTexts = this.getLanguageTexts(this.props.dataJSON.data.language);
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

  componentWillReceiveProps(nextProps) {
    if(nextProps.dataJSON) {
      this.setState({
        dataJSON: nextProps.dataJSON
      });
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
    let data = this.state.dataJSON.data;
    if (this.state.fetchingData ){
      return(<div>Loading</div>)
    } else {
      console.log(data, "data")
      return(
        <div id="protograph_div" className="protograph-col16-mode">
          <div className="protograph-col16-navbar-area">

          </div>
          <div className="protograph-col16-map-area">
            <div className="protograph-map-div">
              <Map
                  dataJSON={data}
                  topoJSON={this.state.topoJSON}
                  mode={this.props.mode}
                />
            </div>
            <div className="protograph-map-div">
              <Map
                  dataJSON={data}
                  topoJSON={this.state.topoJSON}
                  mode={this.props.mode}
                />
            </div>
            <div className="protograph-map-div">
              <Map
                  dataJSON={data}
                  topoJSON={this.state.topoJSON}
                  mode={this.props.mode}
                />
            </div>            
          </div> 
          <div className="protograph-col16-hint-text"></div>
        </div>
      )
    }
  }

  renderCol4() {
    if (this.state.fetchingData) {
      return (<div>Loading</div>)
    } else {
      const data = this.state.dataJSON.data;
      return (
        <div
          id="protograph_div"
          className="protograph-col3-mode"
          style={{ fontFamily: this.state.languageTexts.font }}>
            <div className="protograph-tocluster-title-container">
              <a href={link.link} target="_blank" className="protograph-tocluster-title">{data.title}</a>
            </div>
            <div className="protograph-tocluster-other-info">
              <span className="protograph-tocluster-byline">By {data.by_line}</span>&nbsp;
              <TimeAgo component="span" className="protograph-tocluster-timeago" date={data.published_date} />
            </div>
            <div className="protograph-tocluster-favicons">
              {
                data.links.map((e, i) => {
                  let greyscale = "";
                  if (i > 0) {
                    greyscale = "protograph-tocluster-greyscale"
                  }
                  return (
                    <a key={i} href={e.link} target="_blank" className="protograph-tocluster-favicon-link">
                      <img className={`protograph-tocluster-favicon ${greyscale}`} src={e.favicon_url} />
                    </a>
                  )
                })
              }
            </div>
        </div>
      )
    }
  }

  renderCard() {
    const data = this.state.dataJSON.data;
    return (
      <div className="protograph-card">
        <div className="protograph-tocluster-title-container">
          <a href={link.link} target="_blank" className="protograph-tocluster-title">{data.title}</a>
        </div>

        <div className="protograph-tocluster-other-info">
          <span className="protograph-tocluster-byline">By {data.by_line}</span>&nbsp;
              <TimeAgo component="span" className="protograph-tocluster-timeago" date={data.published_date} />
        </div>
        <div className="protograph-tocluster-favicons">
          {
            data.links.map((e, i) => {
              let greyscale = "";
              if (i > 0) {
                greyscale = "protograph-tocluster-greyscale"
              }
              return (
                <a key={i} href={e.link} target="_blank" className="protograph-tocluster-favicon-link">
                  <img className={`protograph-tocluster-favicon ${greyscale}`} src={e.favicon_url} />
                </a>
              )
            })
          }
        </div>
      </div>
    )
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
