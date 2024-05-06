(function(graph){
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

    require('./src/index.js')
  })({"./src/index.js":{"deps":{},"code":"\"use strict\";\n\nvar _require = require('./print.js'),\n  printMe = _require.printMe;\nfunction component() {\n  var element = document.createElement('div');\n  var btn = document.createElement('button');\n  btn.innerHTML = \"Click me and check the console!\";\n  btn.onclick = printMe;\n  element.appendChild(btn);\n  return element;\n}\ndocument.body.appendChild(component());"}})