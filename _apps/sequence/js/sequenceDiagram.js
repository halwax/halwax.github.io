class SequenceDiagram {

  constructor(sequence, linkCallBack) {
    this.sequence = sequence;
    this.linkCallBack = linkCallBack;
    this.graphUtils = new GraphUtils();
    this.minActorWidth = 20;
    this.topSpace = 20;
    this.leftSpace = 20;
    this.actorSpace = 40;
    this.messageLabelMargin = 5;
    this.lifeLineSpace = 10;
    this.lifeLineNodeDimensions = {
      width: 1,
      height: 1,
    }
  }

  insertActorInGraph(graph, actor, position) {

    let fillColor = '#ffffff';

    let comicStyle = this.sequence.draft ? 1 : 0;

    let actorVertex = graph.insertVertex(graph.getDefaultParent(), null,
      '',
      position.x, position.y,
      0, 0,
      'comic=' + comicStyle + ';align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=1;horizontalStack=0;resizeParent=1;' +
      'moveParent=1;resizeLast=0;collapsible=0;rounded=0;shadow=0;strokeWidth=2;fillColor=' + fillColor + ';perimeterSpacing=0;' +
      'swimlaneFillColor=#ffffff;fontStyle=0;'
    );
    if(actorVertex.geometry.width < this.minActorWidth) {
      graph.resizeCell(actorVertex, new mxRectangle(actorVertex.geometry.x, actorVertex.geometry.y, this.minActorWidth, actorVertex.geometry.height));
    }
  
    // Creates a stack depending on the orientation of the swimlane
    let layout = new mxStackLayout(actorVertex, false);
    // Makes sure all children fit into the parent swimlane
    layout.resizeParent = true;        
    // Applies the size to children if parent size changes
    layout.fill = true;
  
    this.fillActorContainer(graph, actorVertex, actor)
  
    graph.resizeCell(actorVertex, new mxRectangle(actorVertex.geometry.x, actorVertex.geometry.y, actorVertex.geometry.width, actorVertex.geometry.height + 3));
    
    return actorVertex;
  }

  fillActorContainer(graph, actorVertex, actor) {

    let height = actorVertex.geometry.height;
    let width = actorVertex.geometry.width;
    let offset = height + 2;

    let actorValueNode = document.createElement('ActorNode')
    actorValueNode.setAttribute('label', this.toLabel(actor.name));
    actorValueNode.setAttribute('id', actor.id);
  
    let actorTitleVertex = graph.insertVertex(actorVertex, null, actorValueNode,
      0, offset, 0, 0,
      'text;html=1;align=center;verticalAlign=top;spacingTop=-2;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=0;strokeColor=none;');
    graph.updateCellSize(actorTitleVertex);
    
    offset += actorTitleVertex.geometry.height;
    width = this.calculateWidth(graph, width, actorTitleVertex);
    height = this.calculateHeight(graph, height, actorTitleVertex);

    graph.resizeCell(actorTitleVertex, new mxRectangle(actorTitleVertex.geometry.x, actorTitleVertex.geometry.y, width, height));

  }

  drawLifeLine(graph, startVertex, startVertexHeight) {

    let lifeLinePosition = {
      x: startVertex.geometry.x + (startVertex.geometry.width / 2) - (this.lifeLineNodeDimensions.width / 2),
      y: startVertex.geometry.y + startVertexHeight + this.lifeLineSpace
    }

    let endVertex = graph.insertVertex(graph.getDefaultParent(), null,
      '',
      lifeLinePosition.x, lifeLinePosition.y,
      this.lifeLineNodeDimensions.width, this.lifeLineNodeDimensions.height,
      'moveParent=1;resizeLast=0;collapsible=0;rounded=0;shadow=0;strokeWidth=0;perimeterSpacing=0;fillColor=#000000;strokeColor=none;'
    );

    let edgeStyle = 'rounded=0;arcSize=0;endArrow=none;edgeStyle=straight;';
    graph.insertEdge(graph.getDefaultParent(), null, null, startVertex, endVertex, edgeStyle);

    return endVertex;
  }

  drawMessage(graph, senderVertex, receiverVertex, message) {

    let edgeStyle = 'rounded=1;arcSize=2;endArrow=block;edgeStyle=orthogonalEdgeStyle;' + (message.response ? 'dashed=1;' : '');
    let edge = graph.insertEdge(graph.getDefaultParent(), null, '', senderVertex, receiverVertex, edgeStyle);

    let edgeLabelDimensions = {
      width: 0,
      height: 0,
    }

    if(!_.isNil(message.text) && message.text !== '') {
      let edgeLabelVertex = graph.insertVertex(edge, null, message.text, 0, 5, 0, 0, 'verticalAlign=top;strokeColor=none;labelBackgroundColor=#ffffff;');
      edgeLabelVertex.geometry.relative = true;

      edgeLabelDimensions = graph.getPreferredSizeForCell(edgeLabelVertex);

      let dY = -edgeLabelDimensions.height;
      if(message.response) {
        dY -= 10;
      }
      graph.translateCell(edgeLabelVertex, 0, dY);
    }

    return edgeLabelDimensions;
  }

  drawInfo(graph, senderVertex, message) {

    let infoVertexPosition = {
      x: (senderVertex.geometry.x + senderVertex.geometry.width) + this.messageLabelMargin,
      y: senderVertex.geometry.y + senderVertex.geometry.height,
    }

    let infoVertex = graph.insertVertex(graph.getDefaultParent(), null, message.text,
      infoVertexPosition.x, infoVertexPosition.y, 0, 0,
      'text;verticalAlign=top;align=left;html=1;fontStyle=0;strokeWidth=1;strokeColor=#E8E8E8;');
    graph.updateCellSize(infoVertex);

    graph.resizeCell(infoVertex, new mxRectangle(infoVertex.geometry.x, infoVertex.geometry.y, infoVertex.geometry.width, infoVertex.geometry.height + 3));

    return infoVertex.geometry;
  }

  toLabel(text) {
    if(_.isNil(text) || text === '') {
      return '[ ]';
    }
    let label = new VUtils().escapeHtml(text);
    if(this.sequence.draft) {
      label = '<font face="Comic Sans MS">' + label + '</font>';
    }
    return label;
  }
  
  render(graphDiv) {
    
    let graph = this.initGraph(graphDiv);

    graph.getModel().beginUpdate();
    
    try {

      let actorPosition = {
        x: this.leftSpace,
        y: this.topSpace
      }
  
      let actorNodeMap = {};
      let maxActorHeight = 0;

      let actorToLifelineNodes = {};
      for(let actor of this.sequence.actors) {
        let actorNode = this.insertActorInGraph(graph,
          actor,
          actorPosition);

        actorNodeMap[actor.id] = actorNode;
        actorToLifelineNodes[actor.id] = [actorNode];

        actorPosition.x += this.actorSpace + actorNode.geometry.width;
        maxActorHeight = Math.max(maxActorHeight, actorNode.geometry.height);
      }

      for(let actor of this.sequence.actors) {
        let lifeLineNode = this.drawLifeLine(graph, actorNodeMap[actor.id], maxActorHeight);
        actorToLifelineNodes[actor.id].unshift(lifeLineNode);
      }

      for(let message of this.sequence.messages) {
        this.handleMessage(graph, actorToLifelineNodes, message);
      }

    } finally {
      graph.getModel().endUpdate();
    }
    
    return graph;
  }

  handleMessage(graph, actorToLifelineNodes, message) {

    let senderActorNode = actorToLifelineNodes[message.sender][0];
    let receiverActorNode = actorToLifelineNodes[message.receiver][0];

    let [leftNode, rightNode] = [senderActorNode, receiverActorNode].sort((nodeA, nodeB) => {
      return nodeA.geometry.x - nodeB.geometry.x;
    });

    let messageLabelDimensions = {
      width: 0,
      height: 0,
    }
    if(message.info) {
      rightNode = this.nextActorNode(actorToLifelineNodes, receiverActorNode);
      messageLabelDimensions = this.drawInfo(graph, receiverActorNode, message);
    } else {
      messageLabelDimensions = this.drawMessage(graph, senderActorNode, receiverActorNode, message);
    }

    if(messageLabelDimensions.height > 0) {
      for(let actor of this.sequence.actors) {
        let lifeLineNode = actorToLifelineNodes[actor.id][0];
        graph.translateCell(lifeLineNode, 0, messageLabelDimensions.height);
      }
    }

    let preferredEdgeWidth = messageLabelDimensions.width + (this.messageLabelMargin * 2);
    let currentEdgeWidth = this.calculateNodeXDistance(leftNode, rightNode);
    let widthDifference = preferredEdgeWidth - currentEdgeWidth;

    if(widthDifference > 0) {

      let shiftRight = false;
      for(let actor of this.sequence.actors) {
        let actorLifelineNodes = actorToLifelineNodes[actor.id];
        if(actorToLifelineNodes[actor.id].includes(rightNode)) {
          shiftRight = true;
        }
        if(shiftRight) {
          for(let lifelineNode of actorLifelineNodes) {
            graph.translateCell(lifelineNode, widthDifference, 0);
          }
        }
      }

    }

    for(let actor of this.sequence.actors) {

      let lastLifeLineNode = actorToLifelineNodes[actor.id][0];
      let lifeLineNode = this.drawLifeLine(graph, lastLifeLineNode, this.lifeLineNodeDimensions.height);

      actorToLifelineNodes[actor.id].unshift(lifeLineNode);
    }    
  }

  nextActorNode(actorToLifelineNodes, lifelineNode) {

    for(let actor of this.sequence.actors) {
      if(actorToLifelineNodes[actor.id].includes(lifelineNode)) {
        let actorIdx = this.sequence.actors.indexOf(actor);
        let nextActor = this.sequence.actors[actorIdx + 1];
        if(_.isNil(nextActor)) {
          return null;
        }
        return actorToLifelineNodes[nextActor.id][0];
      }
    }

    return null;
  }

  calculateNodeXDistance(nodeA, nodeB) {
    if(_.isNil(nodeA) || _.isNil(nodeB)) {
      return Number.MAX_SAFE_INTEGER;
    }

    let [leftNode, rightNode] = [nodeA, nodeB].sort((a, b) => {
      return a.geometry.x - b.geometry.x;
    });
    return rightNode.geometry.x - (leftNode.geometry.x + leftNode.geometry.width);
  }

  initGraph(graphDiv) {
    let graph = new mxGraph(graphDiv);
    this.graphUtils.initGraphStyle(graph);
    this.graphUtils.enableComicStyle();
    //graph.setHtmlLabels(true);
  
    graph.getCursorForCell = function (cell) {
      if (!_.isNil(cell) && typeof cell.value !== 'undefined' &&  mxUtils.isNode(cell.value) && 
        cell.value.getAttribute('path')!==null) {
        return 'pointer';
      }
    };
  
    graph.addListener(mxEvent.CLICK, (sender, evt) => {
      let cell = evt.getProperty('cell');
      if (!_.isNil(cell) && typeof cell.value !== 'undefined' && mxUtils.isNode(cell.value) && 
        cell.value.getAttribute('path')!==null) {
        this.linkCallBack(cell.value.getAttribute('path'));
      }
    });
  
    graph.isCellFoldable = function(cell) {
      return false;
    };
  
    graph.convertValueToString = function (cell) {
      if (mxUtils.isNode(cell.value)) {
        return cell.getAttribute('label', '')
      }
      return cell.value;
    };
  
    var cellLabelChanged = graph.cellLabelChanged;
    graph.cellLabelChanged = function (cell, newValue, autoSize) {
      if (mxUtils.isNode(cell.value)) {
        // Clones the value for correct undo/redo
        var elt = cell.value.cloneNode(true);
        elt.setAttribute('label', newValue);
        newValue = elt;
      }
      cellLabelChanged.apply(this, arguments);
    };
    return graph;
  }

  calculateWidth(graph, width, vertex) {
    return Math.max(width, graph.getPreferredSizeForCell(vertex).width + 3);
  }

  calculateHeight(graph, height, vertex) {
    return Math.max(height, graph.getPreferredSizeForCell(vertex).height);
  }

  toSvg() {
    return this.graphUtils.toSvg();
  }
}