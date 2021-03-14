# vue-plugin-kop

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run lib
npm run build
```

### Lints and fixes files
```
npm run lint
```

### package.json
```
"lib": "vue-cli-service build --target lib --name vue-plugin-kop --dest lib packages/index.js"
--target: 构建目标，默认为应用模式。这里修改为 lib 启用库模式
--name: 打包后的文件名
--dest：输出目录，默认 dist。这里我们改成 lib
[entry]：入口文件，默认为 src/App.vue。这里我们指定编译 packages/index.js
```

### npm run lib
```
整体引入打包方式
package.json
{
  "main": "lib/vue-plugin-kop.umd.min.js",
  "module": "lib/vue-plugin-kop.umd.min.js",
  "style": "lib/vue-plugin-kop.css",
}
lib/vue-plugin-kop.common.js：一个给打包器用的 CommonJS 包 (不幸的是，webpack 目前还并没有支持 ES modules 输出格式的包 by 2019.08)
lib/vue-plugin-kop.umd.js：一个直接给浏览器或 AMD loader 使用的 UMD 包
lib/vue-plugin-kop.umd.min.js：压缩后的 UMD 构建版本
```

### npm run build
```
按需引入打包方式
package.json
{
  "main": "lib/index.js",
  "module": "lib/index.js",
  "style": "lib/style/index.css",
}
lib/index.js 入口打包文件
lib/xxx.js 单个打包文件
lib/style/xxx.css 单个css文件
```

### 快速上手

* 安装
```
npm i vue-plugin-kop
```
* 引入
```
整体引入:
import VuePluginKop from "vue-plugin-kop";
Vue.use(VuePluginKop);

按需引入:
npm i babel-plugin-import

创建文件 .babelrc.js 内容如下
module.exports = {
  "presets": ["@vue/app"],
  "plugins": [
    [
      "import",
      {
        "libraryName": "vue-plugin-kop", // 组件库名称
        "camel2DashComponentName": false, // 关闭驼峰自动转链式
        "camel2UnderlineComponentName": false, // 关闭蛇形自动转链式
        "style": (name) => {
          return `vue-plugin-kop/lib/style/${name}.css`
        }
      }
    ]
  ]
}

import { Title } from "vue-plugin-kop";
Vue.use(Title);

css引入:
npm run lib
import "vue-plugin-kop/lib/vue-plugin-kop.css";

npm run build
import "vue-plugin-kop/lib/style/index.css";
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
