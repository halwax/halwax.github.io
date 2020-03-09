/**
 * Flow plugin.
 */
Draw.loadPlugin(function (ui) {

  let graph = ui.editor.graph;

  function getClassVertices(input) {

    let vertices = [];
    if(typeof input !== 'undefined') {
      vertices = input;
    } else {
      vertices = graph.getChildVertices();
    }

    return vertices
      .filter(vertex => typeof vertex !== 'undefined')
      .filter(vertex => (typeof vertex.value !== 'undefined' && mxUtils.isNode(vertex.value)))
      .map(vertex => {
        return {
          name: JSON.parse(vertex.value.getAttribute('object')).name,
          vertex: vertex,
        };
      });
  }

  function calculateWidth(graph, width, vertex) {
    return Math.max(width, graph.getPreferredSizeForCell(vertex).width);
  }

  function addClassElements(graph, typeVertex, elements, offset, width) {

    let elementVertexList = [];

    if (typeof elements !== 'undefined' || elements.length > 0) {
      
      // add divider line
      let dividerLine = graph.insertVertex(typeVertex, null, '', 0, offset, 100, 3, 'fillColor=#000000;strokeWidth=1;align=left;verticalAlign=middle;spacingTop=2;spacingBottom=2;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=none;');
      graph.resizeCell(dividerLine, new mxRectangle(dividerLine.geometry.x, dividerLine.geometry.y, dividerLine.geometry.width, 3));

      offset += dividerLine.geometry.height;

      for (let element of elements) {
        let elementVertex = graph.insertVertex(typeVertex, null, element,
          0, offset, 0, 0,
          'text;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;movable=0;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=0;strokeColor=none;');
        graph.updateCellSize(elementVertex);
        offset += elementVertex.geometry.height;
        width = calculateWidth(graph, width, elementVertex);
        elementVertexList.push(elementVertex);
      }

      // let divider line width match class container width
      graph.resizeCell(dividerLine, new mxRectangle(dividerLine.geometry.x, dividerLine.geometry.y, width, 1));

      for (let elementVertex of elementVertexList) {
        graph.resizeCell(elementVertex, new mxRectangle(elementVertex.geometry.x, elementVertex.geometry.y, width, elementVertex.geometry.height));
      }
    }
    return {
      offset: offset,
      width: width,
      elementVertexList: elementVertexList,
    };
  }

  function fillClassContainer(graph, classVertex, classObject) {

    let offset = classVertex.geometry.height + 2;
    let width = classVertex.geometry.width;

    let classNameVertex = graph.insertVertex(classVertex, null, classObject.name,
      0, offset, 0, 0,
      'text;align=center;verticalAlign=top;spacingTop=-2;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=0;strokeColor=none;');
    graph.updateCellSize(classNameVertex);
    offset += classNameVertex.geometry.height;
    width = calculateWidth(graph, width, classNameVertex);

    let attributes = addClassElements(graph, classVertex, classObject.attributes, offset, width);
    offset = attributes.offset;
    width = attributes.width;

    graph.resizeCell(classNameVertex, new mxRectangle(classNameVertex.geometry.x, classNameVertex.geometry.y, width, classNameVertex.geometry.height));
  }

  function editClass(classObject, classVertex) {

    let classObjectNode = document.createElement('ClassNode');
    classObjectNode.setAttribute('object', JSON.stringify(classObject, null, 2));

    classVertex.setValue(classObjectNode);

    graph.removeCells(graph.getChildVertices(classVertex));

    graph.resizeCell(classVertex, new mxRectangle(classVertex.geometry.x, classVertex.geometry.y, 100, 0));

    fillClassContainer(graph, classVertex, classObject);

    graph.setSelectionCells([classVertex]);
    graph.scrollCellToVisible(graph.getSelectionCell());
  }

  function addRelationship(relationshipObject) {

    let edgeStyle = 'rounded=1;arcSize=2;edgeStyle=orthogonalEdgeStyle;';

    if(relationshipObject.type === 'Association') {
      edgeStyle += 'endArrow=open;';
    } else if (relationshipObject.type === 'Generalization') {
      edgeStyle += 'endArrow=block;endFill=0;endSize=10;';
    } else if (relationshipObject.type === 'Aggregation') {
      edgeStyle += 'startArrow=diamond;startFill=0;startSize=10;endArrow=open;';
    } else if (relationshipObject.type === 'Composition') {
      edgeStyle += 'startArrow=diamond;startFill=1;startSize=10;endArrow=open;';
    } else if (relationshipObject.type === 'Realization') {
      edgeStyle += 'dashed=1;endArrow=block;endFill=0;endSize=10;';
    } else if (relationshipObject.type === 'Dependency') {
      edgeStyle += 'dashed=1;endArrow=open;';
    }

    let classVertices = getClassVertices();
    let sourceVertex = classVertices.filter(it => it.name === relationshipObject.source).reduce((_, it) => (it.vertex, it.vertex), null);
    let targetVertex = classVertices.filter(it => it.name === relationshipObject.target).reduce((_, it) => (it.vertex, it.vertex), null);
  
    let edge = graph.insertEdge(graph.getDefaultParent(), null, null, sourceVertex, targetVertex, edgeStyle);

    if(relationshipObject.sourceLabel !== '') {
      let sourceLabelVertex = graph.insertVertex(edge, null, relationshipObject.sourceLabel, -0.8, 10, 0, 0, 'strokeColor=none;fillColor=none;');
      sourceLabelVertex.geometry.relative = true;
    }

    if(relationshipObject.targetLabel !== '') {
      let targetLabelVertex = graph.insertVertex(edge, null, relationshipObject.targetLabel, 0.8, 10, 0, 0, 'strokeColor=none;fillColor=none;');
      targetLabelVertex.geometry.relative = true; 
    }

    return edge;
  }

  function addClass(classObject, insertAtPoint) {

    let fillColor = '#ffffff';

    let classObjectNode = document.createElement('ClassNode');
    classObjectNode.setAttribute('object', JSON.stringify(classObject, null, 2));

    let classVertex = graph.insertVertex(graph.getDefaultParent(), null,
      classObjectNode,
      insertAtPoint.x, insertAtPoint.y,
      0, 0,
      'align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=1;horizontalStack=0;resizeParent=1;' +
      'moveParent=1;resizeLast=0;collapsible=0;rounded=0;shadow=0;strokeWidth=2;fillColor=' + fillColor + ';perimeterSpacing=0;' +
      'swimlaneFillColor=#ffffff;fontStyle=0;'
    );

    graph.resizeCell(classVertex, new mxRectangle(classVertex.geometry.x, classVertex.geometry.y, 100, 0));

    fillClassContainer(graph, classVertex, classObject);

    graph.setSelectionCells([classVertex]);
    graph.scrollCellToVisible(graph.getSelectionCell());

  };

  const defaultClassName = 'ClassName';
  const defaultClassAttributes = 'id: Long\n' + 'name: String';

  // Adds resource for action
  mxResources.parse('addClass=Add Class ...');
  mxResources.parse('editClass=Edit Class ...');
  mxResources.parse('addRelationship=Add Relationship ...')

  class RelationshipDialog {

    constructor(addFunction) {
      this.initWindow(document.createElement('div'));
      this.addFunction = addFunction;
      this.cell = null;
    }

    initWindow(dialogDiv) {

      dialogDiv.style.userSelect = 'none';
      dialogDiv.style.overflow = 'hidden';
      dialogDiv.style.padding = '10px';
      dialogDiv.style.height = '100%';

      this.relationshipTypeSelect = this.addRelationshipTypeSelection(dialogDiv);
      this.sourceSelect = this.addSourceSelect(dialogDiv);
      this.sourceLabelInput = this.addSourceLabelInput(dialogDiv);
      this.targetSelect = this.addTargetSelect(dialogDiv);
      this.targetLabelInput = this.addTargetLabelInput(dialogDiv);

      mxUtils.br(dialogDiv);

      let closeBtn = mxUtils.button(mxResources.get('close'), () => {
        this.resetInput();
        this.close();
      });

      closeBtn.style.marginTop = '8px';
      closeBtn.style.marginRight = '4px';
      closeBtn.style.padding = '4px';
      dialogDiv.appendChild(closeBtn);

      this.saveBtn = mxUtils.button('Add', () => {

        this.addFunction({
          type: this.relationshipTypeSelect.value,
          source: this.sourceSelect.value,
          sourceLabel: this.sourceLabelInput.value,
          target: this.targetSelect.value,
          targetLabel: this.targetLabelInput.value,
        });
        this.resetInput();
        this.close();
      });

      this.saveBtn.style.marginTop = '8px';
      this.saveBtn.style.padding = '4px';
      dialogDiv.appendChild(this.saveBtn);

      let dialogWindow = new mxWindow(mxResources.get('addRelation'), dialogDiv, document.body.offsetWidth - 480, 140,
        320, 330, true, true);
      dialogWindow.destroyOnClose = false;
      dialogWindow.setMaximizable(false);
      dialogWindow.setResizable(false);
      dialogWindow.setClosable(true);

      this.dialogWindow = dialogWindow;
    }

    addSourceSelect(dialogDiv) {
      return this.addSelect(dialogDiv, 'Source', 'sourceSelect', []);
    }

    addSourceLabelInput(dialogDiv) {
      return this.addTextInput(dialogDiv, 'Source Label', '', '20px');
    }

    addTargetSelect(dialogDiv) {
      return this.addSelect(dialogDiv, 'Target', 'targetSelect', []);
    }

    addTargetLabelInput(dialogDiv) {
      return this.addTextInput(dialogDiv, 'Target Label', '', '20px');
    }

    addRelationshipTypeSelection(dialogDiv) {
      return this.addSelect(dialogDiv, 'Relationship Type', 'relationshipTypeSelect', ['Association', 'Generalization', 'Aggregation', 'Composition', 'Realization', 'Dependency']);
    }

    resetInput() {
      this.sourceLabelInput.value = '';
      this.targetLabelInput.value = '';
    }

    addTextInput(dialogDiv, labelText, defaultText, height) {

      this.addLabel(dialogDiv, labelText);

      let text = document.createElement('textarea');
      text.style.height = height;
      text.style.width = '100%';
      text.value = defaultText;

      dialogDiv.appendChild(text);

      return text;
    }

    addLabel(dialogDiv, labelText) {

      let label = document.createElement('div');
      label.innerHTML = `<b>${labelText}</b>`;
      label.style.marginTop = '2px';
      label.style.marginRight = '0px';
      label.style.marginBottom = '2px';
      label.style.padding = '0px';

      dialogDiv.appendChild(label);

      mxUtils.br(dialogDiv);      
    }

    setOptionValues(select, optionValues, defaultValue) {

      while (select.options.length > 0) {                
        select.remove(0);
      }

      for (let optionValue of optionValues) {
        
        var option = document.createElement("option");
        option.value = optionValue;
        option.text = optionValue;
        select.appendChild(option);

        if(optionValue === defaultValue) {
          option.selected = true;
        }
      }
    }

    addSelect(dialogDiv, labelText, selectId, optionValues) {

      this.addLabel(dialogDiv, labelText);

      let select = document.createElement('select');
      select.id = selectId;
      dialogDiv.appendChild(select);

      this.setOptionValues(select, optionValues);

      return select;
    }

    close() {
      this.dialogWindow.setVisible(false);
    }

    open(classNames, selectedClassName) {

      this.setOptionValues(this.sourceSelect, classNames, selectedClassName);
      this.setOptionValues(this.targetSelect, classNames);

      this.dialogWindow.setTitle(mxResources.get('addRelationship'));
      this.dialogWindow.setVisible(true);
      
    }

  }

  class ClassDialog {

    constructor(addFunction, editFunction) {
      this.initWindow(document.createElement('div'));
      this.addFunction = addFunction;
      this.editFunction = editFunction;
      this.edit = false;
      this.insertAtPoint = null;
      this.cell = null;
    }

    initWindow(dialogDiv) {

      dialogDiv.style.userSelect = 'none';
      dialogDiv.style.overflow = 'hidden';
      dialogDiv.style.padding = '10px';
      dialogDiv.style.height = '100%';

      this.classNameInput = this.addClassNameInput(dialogDiv);
      this.classAttributesInput = this.addClassAttributesInput(dialogDiv);

      mxUtils.br(dialogDiv);

      let closeBtn = mxUtils.button(mxResources.get('close'), () => {
        this.setNameAndAttributes(defaultClassName, defaultClassAttributes);
        this.close();
      });

      closeBtn.style.marginTop = '8px';
      closeBtn.style.marginRight = '4px';
      closeBtn.style.padding = '4px';
      dialogDiv.appendChild(closeBtn);

      this.saveBtn = mxUtils.button('Save', () => {
        if (this.edit) {
          this.editFunction({
            name: this.classNameInput.value,
            attributes: this.classAttributesInput.value.split(/\r?\n/)
          }, this.cell);
        } else {
          this.addFunction({
            name: this.classNameInput.value,
            attributes: this.classAttributesInput.value.split(/\r?\n/)
          }, this.insertAtPoint);
        }
        this.setNameAndAttributes(defaultClassName, defaultClassAttributes);
        this.close();
      });

      this.saveBtn.style.marginTop = '8px';
      this.saveBtn.style.padding = '4px';
      dialogDiv.appendChild(this.saveBtn);

      let dialogWindow = new mxWindow(mxResources.get('addClass'), dialogDiv, document.body.offsetWidth - 480, 140,
        320, 300, true, true);
      dialogWindow.destroyOnClose = false;
      dialogWindow.setMaximizable(false);
      dialogWindow.setResizable(false);
      dialogWindow.setClosable(true);

      this.dialogWindow = dialogWindow;
    }

    addClassNameInput(dialogDiv) {
      return this.addInput(dialogDiv, 'Name', defaultClassName, '20px');
    }

    addClassAttributesInput(dialogDiv) {
      return this.addInput(dialogDiv, 'Attributes', defaultClassAttributes, '80px');
    }

    setNameAndAttributes(name, attributes) {
      this.classNameInput.value = name;
      this.classAttributesInput.value = attributes;
    }

    addInput(dialogDiv, labelText, defaultText, height) {

      let label = document.createElement('div');
      label.innerHTML = `<b>${labelText}</b>`;
      label.style.marginTop = '2px';
      label.style.marginRight = '0px';
      label.style.marginBottom = '2px';
      label.style.padding = '0px';

      dialogDiv.appendChild(label);

      mxUtils.br(dialogDiv);

      let text = document.createElement('textarea');
      text.style.height = height;
      text.style.width = '100%';
      text.value = defaultText;

      dialogDiv.appendChild(text);

      return text;
    }

    close() {
      this.dialogWindow.setVisible(false);
    }

    open(input) {

      let title = '';
      let edit = false;

      if (input instanceof mxCell) {

        edit = true;
        title = mxResources.get('editClass');
        this.cell = input;
        this.insertAtPoint = null;
        this.saveBtn.innerText = 'Save';
        let classObject = JSON.parse(input.value.getAttribute('object'));
        this.setNameAndAttributes(classObject.name, classObject.attributes.join('\n'));

      } else if (input instanceof mxPoint) {

        edit = false;
        title = mxResources.get('addClass');
        this.cell = null;
        this.insertAtPoint = input;
        this.saveBtn.innerText = 'Add';

      }

      this.edit = edit;

      this.dialogWindow.setTitle(title);
      this.dialogWindow.setVisible(true);
    }
  }

  let relationshipDialog = new RelationshipDialog(addRelationship);
  let classDialog = new ClassDialog(addClass, editClass);

  let uiCreatePopupMenu = ui.menus.createPopupMenu;
  ui.menus.createPopupMenu = function (menu, cell, evt) {
    uiCreatePopupMenu.apply(this, arguments);

    let menuItems = ['-'];
    if (cell === null) {
      menuItems.push('addClass');
      menuItems.push('addRelationship');
    } else if (graph.model.isVertex(cell) && typeof cell.value !== 'undefined' && mxUtils.isNode(cell.value)) {
      menuItems.push('editClass');
      menuItems.push('addRelationship');
    }

    this.addMenuItems(menu, menuItems, null, evt);
  };

  // Add actions

  ui.actions.addAction('addClass', function (evt) {
    classDialog.open(graph.getPointForEvent(evt));
  });

  ui.actions.addAction('editClass', function (evt) {
    classDialog.open(graph.getSelectionCell());
  });

  ui.actions.addAction('addRelationship', function (evt) {

    let classNames = getClassVertices().reduce((list, it) => (list.push(it.name), list), []);
    let selectedClassName = getClassVertices([graph.getSelectionCell()]).reduce((_, it) => (it.name, it.name), null);

    relationshipDialog.open(classNames, selectedClassName);
  });

});