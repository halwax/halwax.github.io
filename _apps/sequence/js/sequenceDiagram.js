class SequenceDiagram {

  constructor(sequence, linkCallBack) {
    this.sequence = sequence;
    this.linkCallBack = linkCallBack;
    this.graphUtils = new GraphUtils();
    this.minParticipantWidth = 20;
    this.topSpace = 20;
    this.leftSpace = 20;
    this.participantSpace = 40;
    this.messageLabelMargin = 5;
    this.lifeLineSpace = 10;
    this.lifeLineNodeDimensions = {
      width: 1,
      height: 1,
    }
  }

  insertParticipantInGraph(graph, participant, position) {

    let fillColor = '#ffffff';

    let comicStyle = this.sequence.draft ? 1 : 0;

    let participantVertex = graph.insertVertex(graph.getDefaultParent(), null,
      '',
      position.x, position.y,
      0, 0,
      'comic=' + comicStyle + ';align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=1;horizontalStack=0;resizeParent=1;' +
      'moveParent=1;resizeLast=0;collapsible=0;rounded=0;shadow=0;strokeWidth=2;fillColor=' + fillColor + ';perimeterSpacing=0;' +
      'swimlaneFillColor=#ffffff;fontStyle=0;'
    );
    if(participantVertex.geometry.width < this.minParticipantWidth) {
      graph.resizeCell(participantVertex, new mxRectangle(participantVertex.geometry.x, participantVertex.geometry.y, this.minParticipantWidth, participantVertex.geometry.height));
    }
  
    // Creates a stack depending on the orientation of the swimlane
    let layout = new mxStackLayout(participantVertex, false);
    // Makes sure all children fit into the parent swimlane
    layout.resizeParent = true;        
    // Applies the size to children if parent size changes
    layout.fill = true;
  
    this.fillParticipantContainer(graph, participantVertex, participant);
  
    graph.resizeCell(participantVertex, new mxRectangle(participantVertex.geometry.x, participantVertex.geometry.y, participantVertex.geometry.width, participantVertex.geometry.height + 3));
    
    return participantVertex;
  }

  fillParticipantContainer(graph, participantVertex, participant) {

    let height = participantVertex.geometry.height;
    let width = participantVertex.geometry.width;
    let offset = height + 2;

    let participantValueNode = document.createElement('ParticipantNode')
    participantValueNode.setAttribute('label', this.toLabel(participant.name));
    participantValueNode.setAttribute('id', participant.id);
  
    let participantTitleVertex = graph.insertVertex(participantVertex, null, participantValueNode,
      0, offset, 0, 0,
      'text;html=1;align=center;verticalAlign=top;spacingTop=-2;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=0;strokeColor=none;');
    graph.updateCellSize(participantTitleVertex);
    
    offset += participantTitleVertex.geometry.height;
    width = this.calculateWidth(graph, width, participantTitleVertex);
    height = this.calculateHeight(graph, height, participantTitleVertex);

    graph.resizeCell(participantTitleVertex, new mxRectangle(participantTitleVertex.geometry.x, participantTitleVertex.geometry.y, width, height));

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
        dY -= 8;
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

      let participantPosition = {
        x: this.leftSpace,
        y: this.topSpace
      }
  
      let participantNodeMap = {};
      let maxParticipantHeight = 0;

      let participantToLifelineNodes = {};
      for(let participant of this.sequence.participants) {
        let participantNode = this.insertParticipantInGraph(graph,
          participant,
          participantPosition);

        participantNodeMap[participant.id] = participantNode;
        participantToLifelineNodes[participant.id] = [participantNode];

        participantPosition.x += this.participantSpace + participantNode.geometry.width;
        maxParticipantHeight = Math.max(maxParticipantHeight, participantNode.geometry.height);
      }

      for(let participant of this.sequence.participants) {
        let lifeLineNode = this.drawLifeLine(graph, participantNodeMap[participant.id], maxParticipantHeight);
        participantToLifelineNodes[participant.id].unshift(lifeLineNode);
      }

      for(let message of this.sequence.messages) {
        this.handleMessage(graph, participantToLifelineNodes, message);
      }

      for(let participant of this.sequence.participants) {
        let lastLifeLineNode = participantToLifelineNodes[participant.id][0];
        let lifeLineNode = this.drawLifeLine(graph, lastLifeLineNode, this.lifeLineNodeDimensions.height);
  
        participantToLifelineNodes[participant.id].unshift(lifeLineNode);
      }

    } finally {
      graph.getModel().endUpdate();
    }
    
    return graph;
  }

  handleMessage(graph, participantToLifelineNodes, message) {

    let senderParticipantNode = participantToLifelineNodes[message.sender][0];
    let receiverParticipantNode = participantToLifelineNodes[message.receiver][0];

    let [leftNode, rightNode] = [senderParticipantNode, receiverParticipantNode].sort((nodeA, nodeB) => {
      return nodeA.geometry.x - nodeB.geometry.x;
    });

    let messageLabelDimensions = {
      width: 0,
      height: 0,
    }
    if(message.info) {
      rightNode = this.nextParticipantNode(participantToLifelineNodes, receiverParticipantNode);
      messageLabelDimensions = this.drawInfo(graph, receiverParticipantNode, message);
    } else {
      messageLabelDimensions = this.drawMessage(graph, senderParticipantNode, receiverParticipantNode, message);
    }

    if(messageLabelDimensions.height > 0) {
      for(let participant of this.sequence.participants) {
        let lifeLineNode = participantToLifelineNodes[participant.id][0];
        graph.translateCell(lifeLineNode, 0, messageLabelDimensions.height);
      }
    }

    let preferredEdgeWidth = messageLabelDimensions.width + (this.messageLabelMargin * 2);
    let currentEdgeWidth = this.calculateNodeXDistance(leftNode, rightNode);
    let widthDifference = preferredEdgeWidth - currentEdgeWidth;

    if(widthDifference > 0) {

      let shiftRight = false;
      for(let participant of this.sequence.participants) {
        let participantLifelineNodes = participantToLifelineNodes[participant.id];
        if(participantToLifelineNodes[participant.id].includes(rightNode)) {
          shiftRight = true;
        }
        if(shiftRight) {
          for(let lifelineNode of participantLifelineNodes) {
            graph.translateCell(lifelineNode, widthDifference, 0);
          }
        }
      }
    }

    for(let participant of this.sequence.participants) {

      let lastLifeLineNode = participantToLifelineNodes[participant.id][0];
      let lifeLineNode = this.drawLifeLine(graph, lastLifeLineNode, this.lifeLineNodeDimensions.height);

      participantToLifelineNodes[participant.id].unshift(lifeLineNode);
    }    
  }

  nextParticipantNode(participantToLifelineNodes, lifelineNode) {

    for(let participant of this.sequence.participants) {
      if(participantToLifelineNodes[participant.id].includes(lifelineNode)) {
        let participantIdx = this.sequence.participants.indexOf(participant);
        let nextParticipant = this.sequence.participants[participantIdx + 1];
        if(_.isNil(nextParticipant)) {
          return null;
        }
        return participantToLifelineNodes[nextParticipant.id][0];
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