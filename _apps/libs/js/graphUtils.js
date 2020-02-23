class GraphUtils {

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

    graph.setHtmlLabels(true);

    graph.setCellsMovable(false);
    graph.cellsSelectable = false;

  }

  enableComicStyle() {
    /**
     * Adds handJiggle style (jiggle=n sets jiggle)
     */
    function HandJiggle(canvas, defaultVariation) {
      this.canvas = canvas;

      // Avoids "spikes" in the output
      this.canvas.setLineJoin('round');
      this.canvas.setLineCap('round');

      this.defaultVariation = defaultVariation;

      this.originalLineTo = this.canvas.lineTo;
      this.canvas.lineTo = mxUtils.bind(this, HandJiggle.prototype.lineTo);

      this.originalMoveTo = this.canvas.moveTo;
      this.canvas.moveTo = mxUtils.bind(this, HandJiggle.prototype.moveTo);

      this.originalClose = this.canvas.close;
      this.canvas.close = mxUtils.bind(this, HandJiggle.prototype.close);

      this.originalQuadTo = this.canvas.quadTo;
      this.canvas.quadTo = mxUtils.bind(this, HandJiggle.prototype.quadTo);

      this.originalCurveTo = this.canvas.curveTo;
      this.canvas.curveTo = mxUtils.bind(this, HandJiggle.prototype.curveTo);

      this.originalArcTo = this.canvas.arcTo;
      this.canvas.arcTo = mxUtils.bind(this, HandJiggle.prototype.arcTo);
    };

    HandJiggle.prototype.moveTo = function (endX, endY) {
      this.originalMoveTo.apply(this.canvas, arguments);
      this.lastX = endX;
      this.lastY = endY;
      this.firstX = endX;
      this.firstY = endY;
    };

    HandJiggle.prototype.close = function () {
      if (this.firstX != null && this.firstY != null) {
        this.lineTo(this.firstX, this.firstY);
        this.originalClose.apply(this.canvas, arguments);
      }

      this.originalClose.apply(this.canvas, arguments);
    };

    HandJiggle.prototype.quadTo = function (x1, y1, x2, y2) {
      this.originalQuadTo.apply(this.canvas, arguments);
      this.lastX = x2;
      this.lastY = y2;
    };

    HandJiggle.prototype.curveTo = function (x1, y1, x2, y2, x3, y3) {
      this.originalCurveTo.apply(this.canvas, arguments);
      this.lastX = x3;
      this.lastY = y3;
    };

    HandJiggle.prototype.arcTo = function (rx, ry, angle, largeArcFlag, sweepFlag, x, y) {
      this.originalArcTo.apply(this.canvas, arguments);
      this.lastX = x;
      this.lastY = y;
    };

    HandJiggle.prototype.lineTo = function (endX, endY) {
      // LATER: Check why this.canvas.lastX cannot be used
      if (this.lastX != null && this.lastY != null) {
        var dx = Math.abs(endX - this.lastX);
        var dy = Math.abs(endY - this.lastY);
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
          this.originalLineTo.apply(this.canvas, arguments);
          this.lastX = endX;
          this.lastY = endY;

          return;
        }

        var segs = Math.round(dist / 10);
        var variation = this.defaultVariation;

        if (segs < 5) {
          segs = 5;
          variation /= 3;
        }

        function sign(x) {
          return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
        }

        var stepX = sign(endX - this.lastX) * dx / segs;
        var stepY = sign(endY - this.lastY) * dy / segs;

        var fx = dx / dist;
        var fy = dy / dist;

        for (var s = 0; s < segs; s++) {
          var x = stepX * s + this.lastX;
          var y = stepY * s + this.lastY;

          var offset = (Math.random() - 0.5) * variation;
          this.originalLineTo.call(this.canvas, x - offset * fy, y - offset * fx);
        }

        this.originalLineTo.call(this.canvas, endX, endY);
        this.lastX = endX;
        this.lastY = endY;
      }
      else {
        this.originalLineTo.apply(this.canvas, arguments);
        this.lastX = endX;
        this.lastY = endY;
      }
    };

    HandJiggle.prototype.destroy = function () {
      this.canvas.lineTo = this.originalLineTo;
      this.canvas.moveTo = this.originalMoveTo;
      this.canvas.close = this.originalClose;
      this.canvas.quadTo = this.originalQuadTo;
      this.canvas.curveTo = this.originalCurveTo;
      this.canvas.arcTo = this.originalArcTo;
    };

    // Installs hand jiggle in all shapes
    var mxShapePaint0 = mxShape.prototype.paint;
    mxShape.prototype.defaultJiggle = 1.5;
    mxShape.prototype.paint = function (c) {
      // NOTE: getValue does not return a boolean value so !('0') would return true here and below
      if (this.style != null && mxUtils.getValue(this.style, 'comic', '0') != '0' && c.handHiggle == null) {
        c.handJiggle = new HandJiggle(c, mxUtils.getValue(this.style, 'jiggle', this.defaultJiggle));
      }

      mxShapePaint0.apply(this, arguments);

      if (c.handJiggle != null) {
        c.handJiggle.destroy();
        delete c.handJiggle;
      }
    };

    // Sets default jiggle for diamond
    mxRhombus.prototype.defaultJiggle = 2;

    /**
     * Overrides to avoid call to rect
     */
    var mxRectangleShapeIsHtmlAllowed0 = mxRectangleShape.prototype.isHtmlAllowed;
    mxRectangleShape.prototype.isHtmlAllowed = function () {
      return (this.style == null || mxUtils.getValue(this.style, 'comic', '0') == '0') &&
        mxRectangleShapeIsHtmlAllowed0.apply(this, arguments);
    };

    var mxRectangleShapePaintBackground0 = mxRectangleShape.prototype.paintBackground;
    mxRectangleShape.prototype.paintBackground = function (c, x, y, w, h) {
      if (c.handJiggle == null) {
        mxRectangleShapePaintBackground0.apply(this, arguments);
      }
      else {
        var events = true;

        if (this.style != null) {
          events = mxUtils.getValue(this.style, mxConstants.STYLE_POINTER_EVENTS, '1') == '1';
        }

        if (events || (this.fill != null && this.fill != mxConstants.NONE) ||
          (this.stroke != null && this.stroke != mxConstants.NONE)) {
          if (!events && (this.fill == null || this.fill == mxConstants.NONE)) {
            c.pointerEvents = false;
          }

          c.begin();

          if (this.isRounded) {
            var r = 0;

            if (mxUtils.getValue(this.style, mxConstants.STYLE_ABSOLUTE_ARCSIZE, 0) == '1') {
              r = Math.min(w / 2, Math.min(h / 2, mxUtils.getValue(this.style,
                mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2));
            }
            else {
              var f = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE,
                mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
              r = Math.min(w * f, h * f);
            }

            c.moveTo(x + r, y);
            c.lineTo(x + w - r, y);
            c.quadTo(x + w, y, x + w, y + r);
            c.lineTo(x + w, y + h - r);
            c.quadTo(x + w, y + h, x + w - r, y + h);
            c.lineTo(x + r, y + h);
            c.quadTo(x, y + h, x, y + h - r);
            c.lineTo(x, y + r);
            c.quadTo(x, y, x + r, y);
          }
          else {

            c.moveTo(x, y);
            c.lineTo(x + w, y);
            c.lineTo(x + w, y + h);
            c.lineTo(x, y + h);
            c.lineTo(x, y);
          }

          // LATER: Check if close is needed here
          c.close();
          c.end();

          c.fillAndStroke();
        }
      }
    };

    /**
     * Disables glass effect with hand jiggle.
     */
    var mxRectangleShapePaintForeground0 = mxRectangleShape.prototype.paintForeground;
    mxRectangleShape.prototype.paintForeground = function (c, x, y, w, h) {
      if (c.handJiggle == null) {
        mxRectangleShapePaintForeground0.apply(this, arguments);
      }
    };

    // End of hand jiggle integration
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
    if (_.isNil(div)) {
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