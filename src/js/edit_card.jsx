import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Card from './card.jsx';
import JSONSchemaForm from '../../lib/js/react-jsonschema-form';

export default class editToManualScavengerCoverVizCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 1,
      dataJSON: {},
      topoJSON: {},
      mode: "col16",
      publishing: false,
      schemaJSON: undefined,
      fetchingData: true,
      optionalConfigJSON: {},
      optionalConfigSchemaJSON: undefined,
      uiSchemaJSON: {}
    }
    this.toggleMode = this.toggleMode.bind(this);
  }

  exportData() {
    let getDataObj = {
      step: this.state.step,
      dataJSON: this.state.dataJSON,
      schemaJSON: this.state.schemaJSON,
      optionalConfigJSON: this.state.optionalConfigJSON,
      optionalConfigSchemaJSON: this.state.optionalConfigSchemaJSON
    }
    getDataObj["name"] = getDataObj.dataJSON.data.title_and_hint.title.substr(0,225); // Reduces the name to ensure the slug does not get too long
    return getDataObj;
  }

  componentDidMount() {
    // get sample json data based on type i.e string or object.
    if (this.state.fetchingData){
      axios.all([
        axios.get(this.props.dataURL),
        axios.get(this.props.topoURL),
        axios.get(this.props.schemaURL),
        axios.get(this.props.optionalConfigURL),
        axios.get(this.props.optionalConfigSchemaURL),
        axios.get(this.props.uiSchemaURL)
      ])
      .then(axios.spread((card, topo, schema, opt_config, opt_config_schema, uiSchema) => {
        let stateVars = {
          fetchingData: false,
          dataJSON: card.data,
          topoJSON: topo.data,
          schemaJSON: schema.data,
          optionalConfigJSON: opt_config.data,
          optionalConfigSchemaJSON: opt_config_schema.data,
          uiSchemaJSON: uiSchema.data
        }
        this.setState(stateVars);
      }));
    }
  }

  onChangeHandler({formData}) {
    switch (this.state.step) {
      case 1:
        this.setState((prevStep, prop) => {
          let dataJSON = prevStep.dataJSON;
          dataJSON.data.map_title = formData;
          return {
            dataJSON: dataJSON
          }
        })
        break;
      case 2:
        this.setState((prevState, prop) => {
          let dataJSON = prevState.dataJSON;
          dataJSON.data.data_points = formData;
          return {
            dataJSON: dataJSON
          }
        })
        break;
      case 3:
        this.setState((prevState, prop) => {
          let dataJSON = prevState.dataJSON;
          dataJSON.data.title_and_hint = formData;
          return {
            dataJSON: dataJSON
          }
        })
        break;
    }
  }

   onSubmitHandler({formData}) {
    switch(this.state.step) {
      case 1:
      case 2:
        this.setState((prevStep, prop) => {
          return {
            step: prevStep.step + 1
          }
        });
        break;
      case 3:
        if (typeof this.props.onPublishCallback === "function") {
          this.setState({ publishing: true });
          let publishCallback = this.props.onPublishCallback();
          publishCallback.then((message) => {
            this.setState({ publishing: false });
          });
        }
        break;
    }
  }

  renderSEO() {
    let d = this.state.dataJSON.data;
    let seo_blockquote = '<blockquote>' + d.map_title.employed_map_title + d.map_title.deaths_map_title + d.map_title.convicted_map_title + d.title_and_hint.title+'</blockquote>'
    return seo_blockquote;
  }

  getFormData() {
    switch(this.state.step) {
      case 1:
        return this.state.dataJSON.data.map_title;
        break;
      case 2:
        // console.log(this.state.dataJSON.data.data_points, "4th step sample")
        return this.state.dataJSON.data.data_points;
        break;
      case 3:
        // console.log(this.state.dataJSON.data.data_points, "4th step sample")
        return this.state.dataJSON.data.title_and_hint;
        break;
    }
  }

  getSchemaJSON() {
    switch(this.state.step){
      case 1:
        // console.log(this.state.schemaJSON, "1th step schema")
        return this.state.schemaJSON.properties.data.properties.map_title;
        break;
      case 2:     
        // console.log(this.state.schemaJSON, "4th step schema")   
        return this.state.schemaJSON.properties.data.properties.data_points;
        break;
      case 3:     
        // console.log(this.state.schemaJSON, "4th step schema")   
        return this.state.schemaJSON.properties.data.properties.title_and_hint;
        break;
    }
  }

  showLinkText() {
    switch(this.state.step) {
      case 1:
        return '';
        break;
      case 2:
      case 3:
        return '< Back';
        break;
    }
  }

  showButtonText() {
    switch(this.state.step) {
      case 1:
      case 2:
        return 'Next';
        break;
      case 3:
        return 'Publish';
        break;
    }
  }

  getUISchemaJSON() {
    switch(this.state.step) {
      case 1:
      case 2:
      case 3:
        return {}
        break;
      default:
        return {};
        break;
    }
  }

  onPrevHandler() {
    let prev_step = --this.state.step;
    this.setState({
      step: prev_step
    });
  }

  toggleMode(e) {
    let element = e.target.closest('a'),
      mode = element.getAttribute('data-mode');

    this.setState((prevState, props) => {
      let newMode;
      if (mode !== prevState.mode) {
        newMode = mode;
      } else {
        newMode = prevState.mode
      }

      return {
        mode: newMode
      }
    })
  }

  render() {
    if (this.state.fetchingData) {
      return(<div>Loading</div>)
    } else {
      return (
        <div className="proto-container">
          <div className="ui grid form-layout">
            <div className="row">
              <div className="four wide column proto-card-form protograph-scroll-form">
                <div>
                  <div className="section-title-text">Fill the form</div>
                  <div className="ui label proto-pull-right">
                    ToManualScavengerCoverVizCard
                  </div>
                </div>
                <JSONSchemaForm schema={this.getSchemaJSON()}
                  onSubmit={((e) => this.onSubmitHandler(e))}
                  onChange={((e) => this.onChangeHandler(e))}
                  uiSchema={this.getUISchemaJSON()}
                  formData = {this.getFormData()}>
                  <br/>
                  <a id="protograph-prev-link" className={`${this.state.publishing ? 'protograph-disable' : ''}`} onClick={((e) => this.onPrevHandler(e))}>{this.showLinkText()} </a>
                  <button type="submit" className={`${this.state.publishing ? 'ui primary loading disabled button' : ''} default-button protograph-primary-button`}>{this.showButtonText()}</button>
                </JSONSchemaForm>
              </div>
              <div className="twelve wide column proto-card-preview proto-share-card-div">
                <div className="protograph-menu-container">
                  <div className="ui compact menu">
                    <a className={`item ${this.state.mode === 'col16' ? 'active' : ''}`}
                      data-mode='col16'
                      onClick={this.toggleMode}
                    >
                      Col16
                    </a>
                    <a className={`item ${this.state.mode === 'col4' ? 'active' : ''}`}
                      data-mode='col4'
                      onClick={this.toggleMode}
                    >
                      Col4
                    </a>
                  </div>
                </div>
                <div className="protograph-app-holder">
                  <Card
                    mode={this.state.mode}
                    dataJSON={this.state.dataJSON}
                    topoJSON={this.state.topoJSON}
                    schemaJSON={this.state.schemaJSON}
                    optionalConfigJSON={this.state.optionalConfigJSON}
                    optionalConfigSchemaJSON={this.state.optionalConfigSchemaJSON}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}
