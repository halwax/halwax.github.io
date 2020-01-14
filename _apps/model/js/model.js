var mClassPathToHref = function (mClassPath) {
  var lastSegmentIdx = mClassPath.lastIndexOf('.');
  var packagePath = mClassPath.substring(0, lastSegmentIdx);
  var className = mClassPath.substring(lastSegmentIdx + 1, mClassPath.length);
  return '#' + packagePath + '!class=' + className;
}

class Model {

  constructor(tsModelText) {
    this.tsModelText = tsModelText;
    this.sourceFile = ts.createSourceFile('/modelSource.ts', this.tsModelText, ts.ScriptTarget.Latest);
  }

  toMModel() {

    const model = {
      path: 'model',
      name: 'model',
      qualifiedName: 'model',
      mClasses: [],
      mReferences: [],
      mGeneralizations: [],
    }

    const mClasses = this.collectMClasses('', this.sourceFile);
    const mClassNames = [];
    for (let mClass of mClasses) {
      mClassNames.push(mClass.name);
    }

    for (let mClass of mClasses) {

      model.mClasses.push(mClass);

      let mAttributes = [];
      let mReferences = [];

      for (let mProperty of mClass.mProperties) {
        if (mClassNames.includes(mProperty.typeName)) {
          mReferences.push({
            source: mClass.path,
            target: this.toMPath('', mProperty.typeName),
            sourceLabel: '',
            targetLabel: mProperty.name + ' : ' + (mProperty.isArrayType ? '0..*' : '0..1'),
          });
        } else {
          mAttributes.push({
            name: mProperty.name,
            typeName: mProperty.typeName + (mProperty.isArrayType ? '[]' : ''),
          });
        }
      }

      for(let mGeneralization of mClass.mGeneralizations) {
        model.mGeneralizations.push({
          source: mClass.path,
          target: this.toMPath('', mGeneralization),
        });
      }

      mClass.mAttributes = mAttributes;
      model.mReferences = model.mReferences.concat(mReferences);

    }
    return model;
  }

  collectMClasses(mNamespace, tsNode) {
    let mClasses = [];
    ts.forEachChild(tsNode, (child) => {
      if (child.kind === ts.SyntaxKind.ClassDeclaration) {
        if(typeof child.name === 'undefined') {
          return;
        }
        mClasses.push(this.toMClass(mNamespace, child));
      } else {
        mClasses = mClasses.concat(this.collectMClasses(mNamespace, child));
      }
    });
    return mClasses;
  }

  toMClass(mNamespace, tsClass) {

    const mClass = this.toMClassDeclaration(mNamespace, tsClass);
    const mProperties = [];
    const mGeneralizations = [];
    
    if(typeof tsClass.heritageClauses !== 'undefined') {
      for(let hertiageClause of tsClass.heritageClauses) {
        for(let hertiageType of hertiageClause.types) {
          if(ts.SyntaxKind.ExpressionWithTypeArguments === hertiageType.kind) {
            mGeneralizations.push(hertiageType.expression.text);
          }
        }
      }
    }

    ts.forEachChild(tsClass, (child) => {
      if (ts.SyntaxKind.PropertyDeclaration === child.kind) {
        let mProperty = this.toMProperty(child);
        mProperties.push(mProperty);
      }
    });

    mClass.mProperties = mProperties;
    mClass.mGeneralizations = mGeneralizations;

    return mClass;
  }

  toMProperty(child) {
    let propertyName = child.name.text;
    if(typeof child.type === 'undefined') {
      return {
        name: propertyName,
        typeName: '',
        isArrayType: false,
      };
    }

    let isArrayType = ts.SyntaxKind.ArrayType === child.type.kind;
    let type = isArrayType ? child.type.elementType : child.type;
    
    let typeName = '';
    if(ts.SyntaxKind.StringKeyword === type.kind) {
      typeName = 'String';
    } else if(ts.SyntaxKind.NumberKeyword === type.kind) {
      typeName = 'Number';
    } else if(ts.SyntaxKind.BigIntKeyword === type.kind) {
      typeName = 'BigInt';
    } else if(ts.SyntaxKind.BooleanKeyword === type.kind) {
      typeName = 'Boolean';
    } else {
      if(typeof type.typeName === 'undefined') {
        console.log(propertyName + ' : ' + ts.SyntaxKind[type.kind]);
      } else {
        typeName = type.typeName.text;
      }
    }

    return {
      name: propertyName,
      typeName: typeName,
      isArrayType: isArrayType,
    };
  }

  toMClassDeclaration(mNamespace, tsType) {
    const className = tsType.name.text;
    return {
      path: this.toMPath(mNamespace, className),
      name: className,
    };
  }

  toMPath(mNamespace, typeName) {
    return mNamespace + '.' + typeName;
  }

}