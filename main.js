import React from 'react';
import ReactDOM from 'react-dom';
import Card from './src/js/card.jsx';

window.ProtoGraph = window.ProtoGraph || {};
window.ProtoGraph.Card = window.ProtoGraph.Card || {};


ProtoGraph.Card.toManualScavengerCoverVizCard = function () {
  this.cardType = 'ManualScavengerCoverVizCard';
}

ProtoGraph.Card.toManualScavengerCoverVizCard.prototype.init = function (options) {
  this.options = options;
}

ProtoGraph.Card.toManualScavengerCoverVizCard.prototype.getData = function (data) {
  return this.containerInstance.exportData();
}

ProtoGraph.Card.toManualScavengerCoverVizCard.prototype.renderCol16 = function (data) {
  this.mode = 'col16';
  this.render();
}
ProtoGraph.Card.toManualScavengerCoverVizCard.prototype.renderCol4 = function (data) {
  this.mode = 'col4';
  this.render();
}

ProtoGraph.Card.toManualScavengerCoverVizCard.prototype.renderScreenshot = function (data) {
  this.mode = 'screenshot';
  this.render();
}

ProtoGraph.Card.toManualScavengerCoverVizCard.prototype.render = function () {
  ReactDOM.render(
    <Card
      selector={this.options.selector}
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      topoURL={this.options.topo_url}
      optionalConfigURL={this.options.configuration_url}
      optionalConfigSchemaURL={this.options.configuration_schema_url}
      mode={this.mode}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }} />,
    this.options.selector);
}

