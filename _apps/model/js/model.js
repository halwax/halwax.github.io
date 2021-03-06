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
      path: '',
      name: 'model',
      qualifiedName: 'model',
      mPackages: [],
      mClassPaths: [],
      mClasses: [],
      mReferences: [],
      mGeneralizations: [],
    }

    const mClasses = this.collectMClasses('', this.sourceFile, new Map());
    const mClassMap = new Map();

    for (let mClass of mClasses) {
      mClassMap.set(mClass.path, mClass);
      this.fillModelMPackagesHierarchy(model, mClass);
    }

    for (let mClass of mClasses) {

      model.mClasses.push(mClass);

      let mAttributes = [];
      let mReferences = [];

      for (let mProperty of mClass.mProperties) {
        let isReference = mClassMap.has(mProperty.typePath) && !mClassMap.get(mProperty.typePath).isEnum;
        if (isReference) {
          mReferences.push({
            source: mClass.path,
            target: mProperty.typePath,
            sourceLabel: '',
            targetLabel: mProperty.name + ' : ' + (mProperty.isArrayType ? '0..*' : '0..1'),
          });
        } else {
          mAttributes.push({
            name: mProperty.name,
            typeName: mProperty.typeName + (mProperty.isArrayType ? '[]' : ''),
            typePath: mProperty.typePath,
          });
        }
      }

      for(let mGeneralization of mClass.mGeneralizations) {
        model.mGeneralizations.push({
          source: mClass.path,
          target: mGeneralization,
        });
      }

      mClass.mAttributes = mAttributes;
      model.mReferences = model.mReferences.concat(mReferences);

    }

    return model;
  }

  fillModelMPackagesHierarchy(mModel, mClass) {
    
    let pathSegments = mClass.path.split('.');
    pathSegments.splice(-1,1);

    this.fillMPackagesHierarchy(mModel, '', pathSegments, mClass);
  }

  fillMPackagesHierarchy(mPackage, path, pathSegments, mClass) {
    if(pathSegments.length == 0) {
      mPackage.mClassPaths.push(mClass.path);
      return;
    }
    let currentMPackageName = pathSegments.splice(0, 1)[0];
    let currentPath = path === '' ? currentMPackageName : path + '.' + currentMPackageName;
    let currentMPackage = mPackage.mPackages.find(childMPackage => childMPackage.name === currentMPackageName);
    if(_.isNil(currentMPackage)) {
      let newMPackage = {
        path: currentPath,
        name: currentMPackageName,
        qualifiedName: currentPath,
        mPackages: [],
        mClassPaths: [],
      };
      mPackage.mPackages.push(newMPackage);
      currentMPackage = newMPackage;
    }
    this.fillMPackagesHierarchy(currentMPackage, currentPath, pathSegments, mClass);
  }

  collectMClassImports(tsNode) {
    let mImports = new Map();
    ts.forEachChild(tsNode, (child) => {
      if(child.kind === ts.SyntaxKind.ImportEqualsDeclaration) {
        let name = null;
        if(typeof child.name !== 'undefined' && child.name !== null) {
          name = child.name.text;
        }
        let mImportPath = null;
        if(typeof child.moduleReference !== 'undefined' && child.moduleReference !== null) {
          mImportPath = this.toMImportPath(child.moduleReference);
        }
        if(name !== null && mImportPath !== null) {
          mImports.set(name, mImportPath);
        }
      }
      let childImports = this.collectMClassImports(child);
      mImports = new Map([...mImports, ...childImports]);
    });
    return mImports;
  }

  toMImportPath(tsNode) {
    let importPath = '';
    if(tsNode.kind === ts.SyntaxKind.Identifier) {
      importPath = tsNode.escapedText;
    }
    ts.forEachChild(tsNode, (child) => {
      let separator = '';
      if(importPath !== '') {
        separator = '.';
      }
      importPath = importPath + separator + this.toMImportPath(child);
    });
    return importPath;
  }

  collectMClasses(mNamespace, tsNode, importMap) {
    let mClasses = [];
    ts.forEachChild(tsNode, (child) => {
      if (child.kind === ts.SyntaxKind.ClassDeclaration || child.kind === ts.SyntaxKind.EnumDeclaration) {
        if(typeof child.name === 'undefined') {
          return;
        }
        mClasses.push(this.toMClass(mNamespace, child, importMap));
      } else if(child.kind === ts.SyntaxKind.ModuleDeclaration){
        let childrenMNamespace = mNamespace;
        if(typeof child.name !== 'undefined' && child.name !== null) {
          childrenMNamespace = child.name.text;
          if(mNamespace !== '') {
            childrenMNamespace = mNamespace + '.' + childrenMNamespace;
          }
        }
        let moduleImportMap = this.collectMClassImports(child);
        mClasses = mClasses.concat(this.collectMClasses(childrenMNamespace, child, moduleImportMap));        
      } else {
        mClasses = mClasses.concat(this.collectMClasses(mNamespace, child, importMap));
      }
    });
    return mClasses;
  }

  toMClass(mNamespace, tsClass, importMap) {

    const mClass = this.toMClassDeclaration(mNamespace, tsClass);
    const mProperties = [];
    const mGeneralizations = [];
    
    if(typeof tsClass.heritageClauses !== 'undefined') {
      for(let hertiageClause of tsClass.heritageClauses) {
        for(let hertiageType of hertiageClause.types) {
          if(ts.SyntaxKind.ExpressionWithTypeArguments === hertiageType.kind) {
            let heritageTypeName = hertiageType.expression.text;
            let heritageTypePath = mNamespace + (mNamespace === '' ? '' : '.') + heritageTypeName;
            if(importMap.has(heritageTypeName)) {
              heritageTypePath = importMap.get(heritageTypeName);
            }
            mGeneralizations.push(heritageTypePath);
          }
        }
      }
    }

    ts.forEachChild(tsClass, (child) => {
      if (ts.SyntaxKind.PropertyDeclaration === child.kind) {
        let mProperty = this.toMProperty(mNamespace, child, importMap);
        mProperties.push(mProperty);
      }
    });

    mClass.mProperties = mProperties;
    mClass.mGeneralizations = mGeneralizations;

    if(tsClass.kind === ts.SyntaxKind.EnumDeclaration && typeof tsClass.members !== 'undefined') {
      let mLiterals = [];
      for(let member of tsClass.members) {
        mLiterals.push(member.name.text);
      }
      mClass.mLiterals = mLiterals;
    }

    return mClass;
  }

  toMProperty(mNamespace, child, importMap) {
    let propertyName = child.name.text;
    if(typeof child.type === 'undefined') {
      return {
        name: propertyName,
        typeName: '',
        typePath: '',
        isArrayType: false,
      };
    }

    let isArrayType = ts.SyntaxKind.ArrayType === child.type.kind;
    let type = isArrayType ? child.type.elementType : child.type;
    
    let typeName = '';
    let inNamespace = false;
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
        inNamespace = mNamespace !== '';
      }
    }

    let typePath = typeName;
    if(importMap.has(typeName)) {
      typePath = importMap.get(typeName);
    } else if(inNamespace) {
      typePath = mNamespace + (mNamespace === '' ? '' : '.') + typeName;
    }

    return {
      name: propertyName,
      typeName: typeName,
      typePath: typePath,
      isArrayType: isArrayType,
    };
  }

  toMClassDeclaration(mNamespace, tsType) {
    const className = tsType.name.text;
    const mAnnotations = [];
    if(typeof tsType.decorators !== 'undefined') {
      for(let tsDecorator of tsType.decorators) {
        mAnnotations.push(this.toMAnnotation(tsDecorator));
      }
    }
    return {
      path: mNamespace + (mNamespace === '' ? '' : '.') + className,
      name: className,
      isEnum: tsType.kind === ts.SyntaxKind.EnumDeclaration,
      mAnnotations: mAnnotations,
    };
  }

  toMAnnotation(tsDecorator) {
    let annotationName = this.toExpressionName(tsDecorator.expression);
    return {
      name: annotationName
    };
  }

  toExpressionName(expression) {
    if(expression.kind === ts.SyntaxKind.CallExpression && expression.expression.kind === ts.SyntaxKind.Identifier) {
      return expression.expression.text;
    }
    return '';
  }

}