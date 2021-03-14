const fs = require("fs");
const path = require("path");

function resolve(dir) {
  return path.resolve(__dirname, dir);
}

const join = path.join;

function getEntries(path) {
  // 使用 fs.readdirSync(resolve(path)) 获取到组件代码所在的文件夹目录下所有文件名称，存在 files 变量中
  let files = fs.readdirSync(resolve(path));
  // 用数组 reduce() 方法循环 files
  const entries = files.reduce((ret, item) => {
    // 将每个文件名（item）利用 join(path, item) 转成路径存到 itemPath 变量
    const itemPath = join(path, item);
    // 用fs.statSync(itemPath).isDirectory()对每个文件进行判断是不是文件夹
    const isDir = fs.statSync(itemPath).isDirectory();
    if (isDir) {
      // 如果是文件夹，先把 itemPath 和入口文件 index.js 拼接成一个地址，再转成绝对路径，将 item 作为 key，赋值到返回对象上
      ret[item] = resolve(join(itemPath, "index.js"));
    } else {
      // 如果不是文件夹，直接把 itemPath 转成绝对路径，将 item 去除后缀作为 key，赋值到返回对象上
      const [name] = item.split(".");
      ret[name] = resolve(`${itemPath}`);
    }
    return ret;
  }, {});
  return entries;
}

// 开发环境配置
const devConfig = {
  // 用于多页配置, 默认是 undefined
  pages: {
    index: {
      // page 的入口文件
      entry: "examples/main.js",
      // 模板文件
      template: "public/index.html",
      // 在 dist/index.html 的输出文件
      filename: "index.html"
      // 当使用页面 title 选项时，template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      // title: "Index Page",
      // 在这个页面中包含的模块，默认情况下会包含提取出来的通用 chunk 和 vender chunk
      // chunks: ["chunk-venders", "chunk-common", "index"]
    }
    // 当使用只有入口的字符串格式时，模板文件默认是 `public/subpage.html`
    // 如果不存在，就回退到 `public/index.html`
    // 输出文件默认是 `subpage.html`
    // subpage: `src/subpage/main.js`
  },
  // Vue CLI 内部的 webpack 配置是通过 webpack-chain 维护的
  // chainWebpack 是一个函数，会接收一个基于 webpack-chain 的 ChainableConfig 实例，允许对内部的 webpack 配置进行更细粒度的修改
  chainWebpack: config => {
    /**
        rule: [
          test: /\.m?jsx?$/,
          ...,
          {
            ...,
            include: [
              '/packages'
            ],
            use: [
              ...,
              {
                loader: 'babel-loader'
              }
            ]
          },
          ...
        ]
     */
    // 将新增的 packages 文件夹加入 babel 转码编译
    config.module
      .rule("js")
      .include.add("/packages")
      .end()
      .use("babel")
      .loader("babel-loader")
      .tap(options => {
        return options;
      });
  }
};

// 生产环境配置
const prodConfig = {
  outputDir: "lib",
  /**
      关闭 source map
      关闭 source map 有两个好处
      1. 减少打包编译的时间
      2. 避免在生产环境中用 F12 开发者工具在 Sources 中看到源码
   */
  productionSourceMap: false,

  css: {
    sourceMap: true,
    // 将 css 模块和 js 模块分开打包
    // 一个传递给 `extract-text-webpack-plugin` 的选项对象 或 ture | false
    extract: {
      filename: "style/[name].css"
    }
  },
  // 如果这个值是一个对象，则会通过 webpack-merge 合并到最终的配置中
  // 如果这个值是一个函数，则会接收被解析的配置作为参数。该函数及可以修改配置并不返回任何东西，也可以返回一个被克隆或合并过的配置版本
  configureWebpack: {
    entry: {
      ...getEntries("packages")
    },
    output: {
      filename: "[name].js",
      // 配置为 commonjs2，入口文件的返回值将分配给 module.exports 对象，使其组件库在 webpack 构建的环境下使用，这个是关键
      // 此配置的作用是控制 webpack 打包的内容是如何暴露的
      // 请注意这个选项需要和 output.library 所绑定的值一起产生作用
      // 注意，在这个情况下 output.library 不是必须的，因为此时 output.library 选项将会被忽略
      // 具体原因请参照此 issue https://github.com/webpack/webpack/issues/11800
      libraryTarget: "commonjs2"
    }
    // resolve: {
    //   extensions: ['.js', '.vue', '.json'],
    //   alias: {
    //     '@': resolve('packages'),
    //     'assets': resolve('examples/assets'),
    //     'views': resolve('examples/views'),
    //   }
    // },
  },
  // Vue CLI 内部的 webpack 配置是通过 webpack-chain 维护的
  // chainWebpack 是一个函数，会接收一个基于 webpack-chain 的 ChainableConfig 实例，允许对内部的 webpack 配置进行更细粒度的修改
  chainWebpack: config => {
    /**
        rule: [
          test: /\.m?jsx?$/,
          ...,
          {
            ...,
            include: [
              '/packages'
            ],
            use: [
              ...,
              {
                loader: 'babel-loader'
              }
            ]
          },
          ...
        ]
     */
    // 将新增的 packages 文件夹加入 babel 转码编译
    config.module
      .rule("js")
      .include.add("/packages")
      .end()
      .use("babel")
      .loader("babel-loader")
      .tap(options => {
        return options;
      });

    // 配置字体的 loader
    // config.module
    //   .rule("fonts")
    //   .use("url-loader")
    //   .tap(option => {
    //     option.fallback.options.name = "static/fonts/[name].[hash:8].[ext]";
    //     return option;
    //   });

    /**
        删除 splitChunks，因为每个组件是独立打包，不需要抽离每个组件的公共 js 出来
        删除 copy，不要复制 public 文件夹内容到 lib 文件夹中
        删除 html，只打包组件，不生成 html 页面
        删除 preload 以及 prefetch，因为不生成 html 页面，所以这两个也没用
        删除 hmr，删除热更新
        删除自动加上的入口 app
     */

    // vue inspect > output.js 生成查看配置文件

    /**
        optimization.splitChunks
        optimization: {
          splitChunks: {
            ...
          },
          ...
        }
     */
    config.optimization.delete("splitChunks");

    // 删除 new CopyPlugin(...)    CopyWebpackPlugin 复制一个静态文件到打包后的路径
    config.plugins.delete("copy");

    // 删除 new HtmlWebpackPlugin(...)    HtmlWebpackPlugin 生成创建 html 入口文件
    config.plugins.delete("html");

    /**
        删除 new PreloadPlugin({
          rel: 'preload',
          ...
        })
     */
    config.plugins.delete("preload");

    /**
        删除 new PreloadPlugin({
          rel: 'prefetch',
          ...
        })
     */
    config.plugins.delete("prefetch");

    // 删除热更新
    config.plugins.delete("hmr");

    /**
        删除 entry.app
        entry: {
          app: [
            './src/main.js'
          ],
          ...
        }
     */
    config.entryPoints.delete("app");
  }
};

module.exports =
  process.env.NODE_ENV === "development" ? devConfig : prodConfig;
