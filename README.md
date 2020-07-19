# mini-ci

[![mini-ci compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

mini-ci 基于[miniprogram-ci]()开发,用于以配置管理多个小程序项目.

## Table of Contents

- [安装](#安装)
  - [yarn](#yarn)
  - [npm](#npm)
- [配置](#配置)
- [示例](#示例)
- [使用](#使用)
  - [上传](#上传)
  - [预览](#预览)
  - [构建npm](#构建npm)
  - [获取sourcemap](#获取sourcemap)
  - [全局配置](#全局配置)
    - [设置项目配置](#设置项目配置)
    - [获取项目配置列表](#获取项目配置列表)
    - [获取项目配置详情](#获取项目配置详情)
    - [删除项目配置](#删除项目配置)
    - [获取或设置默认配置](#获取或设置默认配置)
    - [导出项目配置](#导出项目配置)
    - [清空项目配置](#清空项目配置)
- [参考文档](#参考文档)
- [维护者](#维护者)
- [如何贡献](#如何贡献)
- [使用许可](#license)

## 安装

### yarn

```bash
yarn global add mini-ci
```

### npm

```bash
npm install mini-ci -g
```

## 配置

[参考微信文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)

### 项目配置

|key|默认值|类型|必填|说明|
|:-:|:-:|:-:|:-:|:-:|
|`appid`|项目里 `project.config.json` 的 `appid` 字段|`string`|否|小程序或小游戏的 `appid`|
|`projectPath`|无|`string`|是|项目的绝对路径<br>A.指定路径<br>1.绝对路径<br>2.不是绝对路径,则根据当前路径(`pwd`)生成绝对路径<br> B.不指定路径<br>1.查找当前路径下是否有配置文件<br>2.查找全局配置文件<br>|
|`privateKeyPath`|无|`string`|是|小程序或小游戏 私钥绝对路径|
|`type`|`miniProgram`|string|否|当前项目类型,有效值 `miniProgram`/`miniProgramPlugin`/`miniGame`/`miniGamePlugin`|
|`ignores`|无|`string[]`|否|指定忽略的规则|
|`version`|项目及其上级三层目录的`package.json`里的`version`|`string`|是|自定义版本号|
|`desc`|当前本地时间|`string`|否|自定义备注信息|
|`robot`|1|`number`|否|指定CI机器人,可选值`1~30` 上传成功后将显示:ci机器人1|
|`qrcodeFormat`|`terminal`|`string`|否|预览返回二维码文件格式,可选值: `image`/`base64`/`terminal`|
|`qrcodeOutputDest`|当前项目|`string`|否|当`qrcodeFormat`为`image`或`base64`时,文件默认保存到当前项目|
|`pagePath`|无|string|否|预览页面路径|
|`searchQuery`|无|string|否|预览页面启动参数|
|`sourceMapSavePath`|当前项目`soucemap.zip`|string|否|保存sourcemap的绝对路径|



### 编译配置
|key|默认值|类型|必填|说明|
|:-:|:-:|:-:|:-:|:-:|
|`es6`|无|`boolean`|否|启用es6|
|`es7`|无|`boolean`|否|启用es7|
|`minify`|无|`boolean`|否|启用压缩代码|
|`codeProtect`|无|`boolean`|否|启用代码混淆|
|`minifyJS`|无|`boolean`|否|启用压缩JS|
|`minifyWXML`|无|`boolean`|否|启用压缩XWML|
|`minifyWXSS`|无|`boolean`|否|启用压缩WXSS|
|`autoPrefixWXSS`|无|`boolean`|否|启用自动补全WXSS|

## 示例
```jsonc
// project
"type":"miniProgram",
"appid":"93457450667",
"privateKeyPath":"/Users/vyron/mini/dist",
"privateKeyPath":"/Users/vyron/mini/private.key",
// settings
"setting":{
    "es6":true,
    "es7":true,
    "minify":true,
    "codeProtect":true,
    "minifyJS":true,
    "minifyWXML":true,
    "minifyWXSS":true,
    "autoPrefixWXSS":true,
}
// others
"robot":10,
"qrcodeFormat":"image",
"qrcodeOutputDest":"/Users/vyron/Downloads/preview.jpg",
"pagePath":"pages/users/index",
"searchQuery":"user_id=87504653",
"sourceMapSavePath":"/Users/vyron/Downloads/sourcemap.zip"
```

## 使用

### 上传
```bash
mini-ci upload -h
mini-ci upload --ver "upload-test"
```

### 预览
```bash
mini-ci preview -h
mini-ci preview
```
### 构建npm
```bash
mini-ci build -h
mini-ci build
```
### 获取sourcemap
```bash
mini-ci sourcemap -h
mini-ci sourcemap
```
### 全局配置
```bash
# 查看config帮助信息
mini-ci config -h
```
#### 设置项目配置
```bash
# 设置项目配置
mini-ci config set --name test_set_project --path /Users/vyron/mini/mini-ci.json --default
```

#### 获取项目配置列表
```bash
mini-ci ls
```


#### 获取项目配置详情
```bash
mini-ci get --name test_set_project
```

#### 删除项目配置
```bash
mini-ci delete --name test_set_project
```

#### 获取或设置默认配置
```bash
# 获取默认配置
mini-ci default

# 设置为默认配置  项目名(test_set_project)必须已存在
mini-ci default --name test_set_project
```

#### 导出项目配置
```bash
# 如果不指定导出项目名,导出默认项目配置,默认导出路径为当前项目 export-mini-ci.json
mini-ci export --name test
```

### 清空项目配置
```bash
# 清空所有配置
mini-ci clear

# 展示当前配置列表
mini-ci ls
```


## 参考文档
[小程序开发者文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)  
[miniprogram-ci(npm)](https://www.npmjs.com/package/miniprogram-ci)  


## 维护者
[Vyron](https://github.com/VFiee)


## 如何贡献
非常欢迎你的加入！[提一个 Issue](https://github.com/RichardLitt/standard-readme/issues/new) 或者提交一个 Pull Request。


## 使用许可

[MIT](LICENSE) © VFiee