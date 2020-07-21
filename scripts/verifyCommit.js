const chalk = require("chalk");
const msgPath = process.env.HUSKY_GIT_PARAMS;
const msg = require("fs").readFileSync(msgPath, "utf-8").trim();

const releaseRE = /^v\d/;
const commitRE = /^(revert: )?(feat|fix|docs|dx|refactor|perf|test|workflow|build|ci|chore|types|wip|release|deps)(\(.+\))?: .{1,50}/;

if (!releaseRE.test(msg) && !commitRE.test(msg)) {
  console.error(
    `${chalk.bgRed.white(`ERROR`)} ${chalk.red(
      `invalid commit message format.`
    )}
        ${chalk.red(
          `Proper commit message format is required for automated changelog generation.`
        )}
    Example:
      ${chalk.green(`feat: add git commit-msg hook`)}`
  );
  process.exit(1);
}
