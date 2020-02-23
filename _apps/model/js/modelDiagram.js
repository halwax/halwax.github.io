class ModelDiagram {

  constructor() {
    this.graphUtils = new GraphUtils();
  }

  initGraphStyle(graph) {
    this.graphUtils.initGraphStyle(graph);
  }

  getSvg(graph) {
    return this.graphUtils.getSvg(graph);
  }

  getTextWidth(text, font) {
    return this.graphUtils.getTextWidth(text, font);
  }

  getTextHeight(style) {
    return this.graphUtils.getTextHeight(style);
  }

  getDefaultStyle() {
    return this.graphUtils.getDefaultStyle();
  }

  getTextBox(text, style) {
    return this.graphUtils.getTextBox(text, style);
  }

  getDefaultTextBox(text) {
    return this.graphUtils.getDefaultTextBox(text);
  }

  getXmlNode(graph) {
    return this.graphUtils.getXmlNode(graph);
  }

  getXml(graph) {
    return this.graphUtils.getXml(graph);
  }

  getPrettyXml(graph) {
    return this.graphUtils.getPrettyXml(graph);
  }


}