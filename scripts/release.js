/* eslint-disable*/
const args = require("minimist")(process.argv.slice(2));
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const semver = require("semver");
const currentVersion = require("../package.json").version;
const { prompt } = require("enquirer");
const execa = require("execa");

/**
 * 软件版本周期
 *
 * Pre-alpha  预发行的Alpha版本,功能不完整版本
 * Alpha 内部测试版本,功能不完善,会有Bug,一般仅供测试人员使用(白盒测试,黑盒测试,灰盒测试)
 * Beta  最早对外发行的版本,由公众参与测试,会有一些已知问题和轻微的程序错误,需要调试
 * Release Candidate(RC)   最终产品的候选版本
 * Stable 稳定版
 *
 */
const releaseTypes = [
  "major", // 主版本
  "minor", // 次版本
  "patch", // 补丁版本
  "premajor", // 预发主版本
  "preminor", // 预发次版本
  "prepatch", // 预发补丁版本
  "prerelease", // 预发行版本
];
// env
const isTest = !!args.test;

// pkg跟路径
const pkgPath = path.resolve(__dirname, "../package.json");

// 版本
const preId =
  (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0]) ||
  "alpha";

// 打印进度
let progressCount = 0;
const progress = (s) => {
  progressCount++;
  console.log(chalk.green(`progress[${progressCount}]: ${s}\n`));
  return {};
};

// 执行命令
const run = (bin, args, opts = {}) =>
  !isTest
    ? execa(bin, args, { stdio: "inherit", ...opts })
    : progress(`${bin} ${args.join(" ")}`);

// 递增版本
const incVersion = (t) => semver.inc(currentVersion, t, preId);

// 获取最新版本
const getPkg = (key, jsonPath = pkgPath) => {
  const pkg = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  return key ? pkg[key] : pkg;
};

// 更新版本号
const updateVersion = (version) => {
  progress("Updating package version");
  // 更新项目版本号
  const pkg = getPkg();
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
};

// 选择版本
const chooseVersion = async () => {
  let targetVersion = args._[0];
  progress("Choosing release version...");
  if (!targetVersion) {
    const { type } = await prompt({
      name: "type",
      type: "select",
      message: "select release type please!",
      choices: releaseTypes
        .map((type) => `${type} (${incVersion(type)})`)
        .concat(["custom"]),
    });
    if (type === "custom") {
      targetVersion = (
        await prompt({
          type: "input",
          name: "version",
          message: "input custom version please!",
          initial: currentVersion,
        })
      ).version;
    } else {
      targetVersion = type.match(/\((.*)\)/)[1];
    }
  }
  if (!semver.valid(targetVersion)) {
    throw new Error(`Version: ${targetVersion} is invalid!`);
  }

  const { isRelease } = await prompt({
    type: "confirm",
    name: "isRelease",
    message: `Are you sure to release version ${targetVersion}`,
  });
  if (!isRelease) {
    throw new Error(`Release version ${targetVersion} is canceled!`);
  }
  return targetVersion;
};

// 生成changelog
const generateChanlog = () => {
  progress("Generating changelog...");
  return run("yarn", ["changelog"]);
};

// 提交修改文件
const commitChanges = async () => {
  const { stdout } = await run("git", ["diff", "--ignore-submodules"], {
    stdio: "pipe",
  });
  const version = getPkg("version");
  if (stdout) {
    progress("Committing changes...");
    await run("git", ["add", "-A"]);
    await run("git", ["commit", "-m", `release: v${version}`]);
  } else {
    console.log(chalk.yellow(`No changes to commit. \n`));
  }
};

// 发布包
const publishPackage = async () => {
  progress("Publishing packages...");
  const { name, version } = getPkg();
  try {
    await run(
      "yarn",
      ["publish", "--new-version", version, "--access", "public"],
      {
        stdio: "pipe",
      }
    );
    progress(`Successfully published ${name}@${version}`);
  } catch (e) {
    throw e;
  }
};

// 检测当前分支
const checkCurrentBranch = async () => {
  const { stdout: branch } = await run("git", ["branch", "--show-current"], {
    stdio: "pipe",
  });
  if (!["master", "main"].includes(branch) && !isTest) {
    throw new Error(
      "Release branch must be main or master, please checkout main branch and try it again!"
    );
  }
  return branch;
};

// 发布到github
const publishToGithub = async () => {
  progress("Pushing to GitHub...");
  const { stdout: remote } = await run("git", ["remote"], {
    stdio: "pipe",
  });
  if (!remote && !isTest) {
    throw new Error("Pushing remote is empty!");
  }

  const version = getPkg("version");
  await run("git", ["tag", `v${version}`]);
  await run("git", ["push", "origin", `refs/tags/v${version}`]);
  await run("git", ["push"]);
  progress("🎉🎉🎉Pushing to GitHub success!");
};

const release = () =>
  checkCurrentBranch()
    .then(chooseVersion)
    .then(updateVersion)
    .then(generateChanlog)
    .then(commitChanges)
    .then(publishPackage)
    .then(publishToGithub);

release().catch((err) => console.log("\n" + chalk.red(err)));
