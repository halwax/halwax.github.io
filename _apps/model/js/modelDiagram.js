class ModelDiagram {

  initGraphStyle(graph) {

    let vertexStyle = [];

    // vertexStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    vertexStyle[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    vertexStyle[mxConstants.STYLE_STROKECOLOR] = 'black';
    // vertexStyle[mxConstants.STYLE_FILLCOLOR] = 'white';
    // vertexStyle[mxConstants.STYLE_GRADIENTCOLOR] = 'white';
    vertexStyle[mxConstants.STYLE_FONTCOLOR] = 'black';
    // vertexStyle[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
    // vertexStyle[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
    vertexStyle[mxConstants.STYLE_FONTSIZE] = '12';
    vertexStyle[mxConstants.STYLE_FONTSTYLE] = 0;
    vertexStyle[mxConstants.STYLE_EDITABLE] = 0;

    // // Creates the default style for edges
    let edgeStyle = [];
    edgeStyle[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    // edgeStyle[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
    edgeStyle[mxConstants.STYLE_FONTCOLOR] = 'black';
    edgeStyle[mxConstants.STYLE_STROKECOLOR] = 'black';
    // edgeStyle[mxConstants.STYLE_FONTSIZE] = '12';
    // edgeStyle[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
    // edgeStyle[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;

    graph.getStylesheet().putDefaultVertexStyle(vertexStyle);
    graph.getStylesheet().putDefaultEdgeStyle(edgeStyle);

    // graph.setHtmlLabels(true);

    graph.setCellsMovable(false);
    graph.cellsSelectable = false;

  }

  getSvg(graph) {

    let background = '#ffffff';
    let scale = 1;
    let border = 1;

    let imgExport = new mxImageExport();
    let bounds = graph.getGraphBounds();
    let vs = graph.view.scale;

    // Prepares SVG document that holds the output
    let svgDoc = mxUtils.createXmlDocument();
    let root = (svgDoc.createElementNS != null) ?
      svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg');

    if (background != null) {
      if (root.style != null) {
        root.style.backgroundColor = background;
      } else {
        root.setAttribute('style', 'background-color:' + background);
      }
    }

    if (svgDoc.createElementNS == null) {
      root.setAttribute('xmlns', mxConstants.NS_SVG);
      root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
    } else {
      // KNOWN: Ignored in IE9-11, adds namespace for each image element instead. No workaround.
      root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', mxConstants.NS_XLINK);
    }

    root.setAttribute('width', (Math.ceil(bounds.width * scale / vs) + 2 * border) + 'px');
    root.setAttribute('height', (Math.ceil(bounds.height * scale / vs) + 2 * border) + 'px');
    root.setAttribute('version', '1.1');

    // Adds group for anti-aliasing via transform
    let group = (svgDoc.createElementNS != null) ?
      svgDoc.createElementNS(mxConstants.NS_SVG, 'g') : svgDoc.createElement('g');
    group.setAttribute('transform', 'translate(0.5,0.5)');
    root.appendChild(group);
    svgDoc.appendChild(root);

    // Renders graph. Offset will be multiplied with state's scale when painting state.
    let svgCanvas = new mxSvgCanvas2D(group);
    svgCanvas.translate(Math.floor((border / scale - bounds.x) / vs), Math.floor((border / scale - bounds.y) / vs));
    svgCanvas.scale(scale / vs);

    // Displayed if a viewer does not support foreignObjects (which is needed to HTML output)
    svgCanvas.foAltText = '[Not supported by viewer]';
    imgExport.drawState(graph.getView().getState(graph.model.root), svgCanvas);

    return mxUtils.getPrettyXml(root);
  }

  /**
   * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
   * 
   * @param {String} text The text to be rendered.
   * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
   * 
   * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
   */
  getTextWidth(text, font) {
    // re-use canvas object for better performance
    let canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
    let context = canvas.getContext("2d");
    context.font = font;
    let metrics = context.measureText(text);
    return metrics.width;
  }

  getTextHeight(style) {
    return parseInt(style.fontSize, 10);
  }

  getDefaultStyle() {
    let div = this.getDefaultStyle.div;
    if(_.isNil(div)) {
      this.getDefaultStyle.div = document.createElement('div');
      div = this.getDefaultStyle.div;
      document.body.appendChild(div);
    }
    return window.getComputedStyle(div);
  }

  getTextBox(text, style) {
    return {
      text: text,
      width: this.getTextWidth(text, style.font),
      height: this.getTextHeight(style)
    };
  }

  getDefaultTextBox(text) {
    return this.getTextBox(text, this.getDefaultStyle());
  }

  getXmlNode(graph) {
    let enc = new mxCodec();
    return enc.encode(graph.getModel());
  }

  getXml(graph) {
    return mxUtils.getXml(this.getXmlNode(graph));
  }

  getPrettyXml(graph) {
    return mxUtils.getPrettyXml(this.getXmlNode(graph));
  }

}