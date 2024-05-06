const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

// 1 分析依赖
function parseModules(file) {
  const entry = getModuleInfo(file);

  const temp=[entry]
  
  const depsGraph={}

  getDeps(temp,entry)

  temp.forEach(moduleInfo=>{
    depsGraph[moduleInfo.file]={
        deps:moduleInfo.deps,
        code:moduleInfo.code
    }
  })

  return depsGraph;
}

function getDeps(temp,{deps}){
    Object.keys(deps).forEach(key=>{
        console.log('key',key)
        const child=getModuleInfo(deps[key]);
        temp.push(child)
        getDeps(temp,child)
    })
}

function getModuleInfo(file) {
  console.log('getModuleInfo file',file)
  // 读取文件
  const body = fs.readFileSync(file, "utf-8");

  // 转化AST
  const ast = parser.parse(body, { sourceType: "module" });

  const deps = {};

  //
  traverse(ast, {
    // 获取import导入的模块
    ImportDeclaration({ node }) {
      const dirname = path.dirname(file);
      // 获取标准化路径
      const absPath = "./" + path.join(dirname, node.source.value);

      deps[node.source.value] = absPath;
    },
  });

  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });

  const moduleInfo = { file, deps, code };

  return moduleInfo;
}

// 2 实现bundle
function bundle(file) {
  const depsGrap = JSON.stringify(parseModules(file));
  
  return `(function(graph){
    function require(file){
        function absRequire(realPath){
            return require(graph[file].deps[realPath])
        }
       var exports={}

       (function(require,exports,code){
        eval(code)
       })(absRequire,exports,graph[file].code)
       return exports;
    }

    require('${file}')
  })(${depsGrap})`
}
const content = bundle("./src/index.js");
fs.writeFileSync("./dist/bundle.js", content);
