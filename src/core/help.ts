function logHelp() {
  console.log(`
Usage: mini-ci [command]  [--options]

Commands:
  mini-ci                      显示帮助文档.
  mini-ci build                上传代码，对应小程序开发者工具的上传.
  mini-ci upload               构建 npm，对应小程序开发者工具的: 菜单-工具-构建npm.
  mini-ci preview              预览代码，对应小程序开发者工具的预览.
  mini-ci proxy                代理，配置 miniprogram-ci 的网络请求代理方式.
  mini-ci sourcemap            获取最近上传版本的 sourceMap.
  mini-ci config               配置mini-ci.

Options:
  --help, -h                   显示帮助文档.
  --version, -v                显示mini-ci版本.
  --file, -f                   指定配置文件路径,如果未指定,默认取当前工作目录下的
                               mini-ci.json 文件.
`);
}

export default logHelp;
