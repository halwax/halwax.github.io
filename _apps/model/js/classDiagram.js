class ClassDiagram {

  constructor() {
    this.mClasses = [];
    this.mReferences = [];
    this.mGeneralizations = [];
    this.modelDiagram = new ModelDiagram();
  }

  addClass(mClassObj) {
    this.mClasses.push(mClassObj);
  }

  addReference(mReferenceObj) {
    this.mReferences.push(mReferenceObj);
  }

  addGeneralization(mGeneralization) {
    this.mGeneralizations.push(mGeneralization);
  }

  insertClassInGraph(graph, parent, mClassObj, position, dimension) {

    let classVertex = graph.insertVertex(parent, null,
      '',
      position.x, position.y,
      0, 0,
      'align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=1;horizontalStack=0;resizeParent=1;moveParent=1;resizeLast=0;collapsible=0;rounded=0;shadow=0;strokeWidth=2;fillColor=#FFFFFF;perimeterSpacing=0;swimlaneFillColor=#ffffff;fontStyle=0;swimlaneLine=0;html=1;'
    );
    if(classVertex.geometry.width < 100) {
      graph.resizeCell(classVertex, new mxRectangle(classVertex.geometry.x, classVertex.geometry.y, 100, classVertex.geometry.height));
    }
  
    // Creates a stack depending on the orientation of the swimlane
    let layout = new mxStackLayout(classVertex, false);
    // Makes sure all children fit into the parent swimlane
    layout.resizeParent = true;        
    // Applies the size to children if parent size changes
    layout.fill = true;
  
    this.fillClassContainer(graph, classVertex, mClassObj)
  
    graph.resizeCell(classVertex, new mxRectangle(classVertex.geometry.x, classVertex.geometry.y, classVertex.geometry.width, classVertex.geometry.height + 3));
    
    return classVertex;
  }

  fillClassContainer(graph, classVertex, mClassObj) {

    let children = [];
    let offset = classVertex.geometry.height + 2;
  
    let stereotypeVertex = undefined;
    if (_.size(mClassObj.stereotypes) > 0) {
      stereotypeVertex = graph.insertVertex(classVertex, null, '<<Entity>>',
        0, offset, 0, 0,
        'text;fontSize=10;align=center;fontColor=#454545;verticalAlign=top;overflow=hidden;strokeColor=none;spacingBottom=-2;');
      graph.updateCellSize(stereotypeVertex);
      offset += stereotypeVertex.geometry.height;
      children.push(stereotypeVertex);
    }
  
    let href = mClassPathToHref(mClassObj.path);
  
    let classValueNode = document.createElement('ClassNode')
    classValueNode.setAttribute('label', mClassObj.name);
    classValueNode.setAttribute('link', href);
  
    let classNameVertex = graph.insertVertex(classVertex, null, classValueNode,
      0, offset, 0, 0,
      'text;align=center;verticalAlign=top;spacingTop=-2;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=0;strokeColor=none;');
    graph.updateCellSize(classNameVertex);
    offset += classNameVertex.geometry.height;
    children.push(classNameVertex);

    let attributes = this.addAttributes(graph, classVertex, mClassObj, offset, children);
    offset = attributes.offset;
    children = children.concat(attributes.attributeVertexList);
    
    // let stereotype line width match class container width
    graph.resizeCell(classNameVertex, new mxRectangle(classNameVertex.geometry.x, classNameVertex.geometry.y, classVertex.geometry.width, classNameVertex.geometry.height));
  
    if(!_.isNil(stereotypeVertex)) {
      graph.resizeCell(stereotypeVertex, new mxRectangle(stereotypeVertex.geometry.x, stereotypeVertex.geometry.y, classVertex.geometry.width, stereotypeVertex.geometry.height));
    }
  }

  addAttributes(graph, classVertex, mClassObj, offset) {
    let attributeVertexList = [];
    if (_.size(mClassObj.mAttributes) > 0) {
      // add divider line
      let dividerLine = graph.insertVertex(classVertex, null, '', 0, offset, 100, 3, 'fillColor=#000000;strokeWidth=1;align=left;verticalAlign=middle;spacingTop=2;spacingBottom=2;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=none;');
      offset += dividerLine.geometry.height;
  
      for (let mAttribute of mClassObj.mAttributes) {
        let attributeVertex = graph.insertVertex(classVertex, null, mAttribute.name + ' : ' + mAttribute.typeName,
          0, offset, 0, 0,
          'text;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;movable=0;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=0;strokeColor=none;');
        graph.updateCellSize(attributeVertex);
        offset += attributeVertex.geometry.height;
        attributeVertexList.push(attributeVertex);
      }
      
      // let divider line width match class container width
      graph.resizeCell(dividerLine, new mxRectangle(dividerLine.geometry.x, dividerLine.geometry.y, classVertex.geometry.width, 1));

      for(let attributeVertex of attributeVertexList) {
        graph.resizeCell(attributeVertex, new mxRectangle(attributeVertex.geometry.x, attributeVertex.geometry.y, classVertex.geometry.width, attributeVertex.geometry.height));
      }
    }
    return {
      offset: offset,
      attributeVertexList: attributeVertexList,
    };
  }

  calculateClassWidth() {
    let classWidth = 120;
    for (let pI = 0; pI < this.mClasses.length; pI++) {
      let mClass = this.mClasses[pI];
      classWidth = Math.ceil(Math.max(classWidth, mClass.name.length * 6.5));
    }
    return classWidth;
  }

  insertGeneralization(graph, subClass, superClass, eEdge) {
    let edgeStyle = 'rounded=1;arcSize=2;strokeWidth=1.5;endArrow=block;endFill=0;endSize=10;edgeStyle=orthogonalEdgeStyle;fontStyle=0;'
    let edge = graph.insertEdge(graph.getDefaultParent(), null, '', subClass, superClass, edgeStyle);
    let points = [];
    for (let iS = 0; iS < eEdge.sections.length; iS++) {
      let section = eEdge.sections[iS];
      points.push({
        x: section.startPoint.x,
        y: section.startPoint.y
      })
      for(let bI = 0; bI < _.size(section.bendPoints); bI++) {
        let bendPoint = section.bendPoints[bI];
        points.push({
          x: bendPoint.x,
          y: bendPoint.y
        })
      }
      points.push({
        x: section.endPoint.x,
        y: section.endPoint.y
      });
    }
    edge.getGeometry().points = points;
  
    for (let eI = 0; eI < _.size(eEdge.labels); eI++) {
      var edgeLabel = eEdge.labels[eI];
      graph.insertVertex(edge, null, edgeLabel.text, edgeLabel.x, edgeLabel.y, 0, 0, 'align=left;vericalAlign=top;');
    }
  
    return edge;
  }

  insertReferenceInGraph(graph, class1, class2, eEdge) {

    let edgeStyle = 'rounded=1;arcSize=2;endArrow=open;edgeStyle=orthogonalEdgeStyle;';
  
    let edge = graph.insertEdge(graph.getDefaultParent(), null, null, class1, class2, edgeStyle);
    let points = [];
    for (let iS = 0; iS < eEdge.sections.length; iS++) {
      let section = eEdge.sections[iS];
      points.push({
        x: section.startPoint.x,
        y: section.startPoint.y
      })
      for(let bI = 0; bI < _.size(section.bendPoints); bI++) {
        let bendPoint = section.bendPoints[bI];
        points.push({
          x: bendPoint.x,
          y: bendPoint.y
        })
      }
      points.push({
        x: section.endPoint.x,
        y: section.endPoint.y
      });
    }
    edge.getGeometry().points = points;
  
    for (let eI = 0; eI < _.size(eEdge.labels); eI++) {
      let edgeLabel = eEdge.labels[eI];
      graph.insertVertex(edge, null, edgeLabel.text, edgeLabel.x, edgeLabel.y, 0, 0, 'align=left;vericalAlign=top;html=1;');
    }
  
    return edge;
  }
  
  render(graphDiv) {

    let pageWidth = 1350;
  
    let classWidth = this.calculateClassWidth();
    let classHeight = 45;
  
    let classDimension = {
      width: classWidth,
      height: classHeight
    }
  
    let classSpace = 20;
  
    let graph = new mxGraph(graphDiv);
    this.modelDiagram.initGraphStyle(graph);
  
    graph.getCursorForCell = function (cell) {
      if (!_.isNil(cell) && !(typeof cell.value === 'undefined') && mxUtils.isNode(cell.value)) {
        return 'pointer';
      }
    };
  
    graph.addListener(mxEvent.CLICK, function (sender, evt) {
      let cell = evt.getProperty('cell');
      if (!_.isNil(cell) && !(typeof cell.value === 'undefined') && mxUtils.isNode(cell.value)) {
        location.href = cell.value.getAttribute('link');
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
  
    new mxSwimlaneManager(graph);
  
    let parent = graph.getDefaultParent();
  
    graph.getModel().beginUpdate();
    
    let classDiagramObj = {};

    try {
  
      let classPosition = {
        x: classSpace,
        y: classSpace
      }
  
      classDiagramObj.classNodes = {};
      classDiagramObj.mReferences = this.mReferences;
      classDiagramObj.mGeneralizations = this.mGeneralizations;
  
      for (let cI = 0; cI < this.mClasses.length; cI++) {
  
        if (classPosition.x > (pageWidth - (classSpace + classWidth))) {
          classPosition.x = classSpace;
          classPosition.y += classSpace + classHeight;
        }
  
        let classObj = this.mClasses[cI];
        let classNode = this.insertClassInGraph(graph,
          graph.getDefaultParent(),
          classObj,
          classPosition,
          classDimension);
        if (_.isNil(classNode.data)) {
          classNode.data = {};
        }
        classNode.data.path = classObj.path;
  
        classDiagramObj.classNodes[classObj.path] = {
          id: classNode.id,
          width: classNode.geometry.width,
          height: classNode.geometry.height
        }
  
        classPosition.x += classSpace + classWidth;
      }
  
    } finally {
      graph.getModel().endUpdate();
    }
  
    this.elkLayout(graph, classDiagramObj);
  
    return graph;
  }

  elkLayout(graph, classDiagramObj) {

    let elkObj = {};
    elkObj.id = "root";
    elkObj.children = [];
    elkObj.edges = [];
    elkObj.layoutOptions = {
      'elk.algorithm': 'layered',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.alignment': 'AUTOMATIC',
      'elk.direction': 'UNDEFINED',
    };
  
    for (let classNodeKey in classDiagramObj.classNodes) {
      let classNode = classDiagramObj.classNodes[classNodeKey];
      elkObj.children.push({
        id: classNode.id,
        width: classNode.width,
        height: classNode.height
      })
    }
  
    let mReferenceObjects = {};
    for (let rI = 0; rI < _.size(classDiagramObj.mReferences); rI++) {
      let mReferenceObj = classDiagramObj.mReferences[rI];
      let edgeId = 'r' + rI;
  
      let sourceLabelBox = this.modelDiagram.getDefaultTextBox(mReferenceObj.sourceLabel);
      let targetLabelBox = this.modelDiagram.getDefaultTextBox(mReferenceObj.targetLabel);
  
      elkObj.edges.push({
        id: edgeId,
        sources: [classDiagramObj.classNodes[mReferenceObj.source].id],
        targets: [classDiagramObj.classNodes[mReferenceObj.target].id],
        layoutOptions: {
          'org.eclipse.elk.edge.type': 'ASSOCIATION'
        },
        labels: [
          {
            text: sourceLabelBox.text,
            width: sourceLabelBox.width,
            height: sourceLabelBox.height,
            layoutOptions: {
              'org.eclipse.elk.edgeLabels.placement': 'TAIL'
            }
          },
          {
            text: targetLabelBox.text,
            width: targetLabelBox.width,
            height: targetLabelBox.height,
            layoutOptions: {
              'org.eclipse.elk.edgeLabels.placement': 'HEAD'
            }
          }
        ]
      });
  
      mReferenceObjects[edgeId] = mReferenceObj;
    }
  
    let mGeneralizationObjects = {};
    for (let gI = 0; gI < _.size(classDiagramObj.mGeneralizations); gI++) {
      let mGeneralizationObject = classDiagramObj.mGeneralizations[gI];
      let edgeId = 'g' + gI;
  
      elkObj.edges.push({
        id: edgeId,
        sources: [classDiagramObj.classNodes[mGeneralizationObject.source].id],
        targets: [classDiagramObj.classNodes[mGeneralizationObject.target].id],
        layoutOptions: {
          'org.eclipse.elk.edge.type': 'GENERALIZATION',
        }
      })
  
      mGeneralizationObjects[edgeId] = mGeneralizationObject;
    }
  
    let classDiagram = this;
  
    let elk = new ELK();
    elk.layout(elkObj).then(function (g) {
  
      let gModel = graph.getModel();
      gModel.beginUpdate();
      try {
  
        for (let nI = 0; nI < g.children.length; nI++) {
          let eNode = g.children[nI];
          let classCell = gModel.getCell(eNode.id);
          let geometry = classCell.getGeometry();
          graph.translateCell(classCell, eNode.x - geometry.x, eNode.y - geometry.y);
        }
  
        for (let eI = 0; eI < g.edges.length; eI++) {
  
          let eEdge = g.edges[eI];
  
          let mReferenceObj = mReferenceObjects[eEdge.id];
          let sourceClassCell = gModel.getCell(eEdge.sources[0]);
          let targetClassCell = gModel.getCell(eEdge.targets[0]);
  
          if (_.startsWith(eEdge.id, 'r')) {
            classDiagram.insertReferenceInGraph(graph, sourceClassCell, targetClassCell, eEdge);
          } else if (_.startsWith(eEdge.id, 'g')) {
            classDiagram.insertGeneralization(graph, sourceClassCell, targetClassCell, eEdge);
          }
  
        }
      } finally {
        gModel.endUpdate();
      }
    });
  }

  toSvg() {
    return this.modelDiagram.toSvg();
  }
}