module.exports = {
  default: {
    paths: ["features/**/*.feature"],
    require: [
      "features/steps_definitions/**/*.ts",
      "support/**/*.ts"
    ],
    requireModule: ["ts-node/register"],
    format: ["progress-bar"],
    publishQuiet: true
  }
};