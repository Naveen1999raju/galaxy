const path = require("path");
const glob = require("glob");
const fs = require("fs");
const merge = require("webpack-merge");
const baseConfig = require("./webpack.config.js");

const webpackConfig = baseConfig();

const fileLoaderTest = /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*$|$)/;

const fileLoaderConfigRule = { rules: [{ test: fileLoaderTest, use: ["file-loader"] }] };

webpackConfig.module = merge.smart(webpackConfig.module, fileLoaderConfigRule);
webpackConfig.output.publicPath = "";

webpackConfig.resolve.modules.push(path.join(__dirname, "galaxy/style/scss"));

const galaxyStyleDocs = [];
glob.sync("./galaxy/docs/galaxy-*.md").forEach((file) => {
    const name = file.match(/galaxy-(\w+).md/)[1];
    galaxyStyleDocs.push({ name: name, content: file });
});

const sections = [
    {
        name: "Galaxy styles",
        sections: galaxyStyleDocs,
    },
    {
        name: "Basic Bootstrap Styles",
        content: "./galaxy/docs/bootstrap.md",
    },
    {
        name: "Components",
        // Components that are directories will get their own section
        sections: glob
            .sync("./galaxy/scripts/components/*")
            .map((file) => {
                if (fs.lstatSync(file).isDirectory()) {
                    return {
                        name: path.basename(file),
                        components: file + "/**/*.vue",
                    };
                }
            })
            .filter((v) => v),
        // ...while top level components are handled here.
        components: "./galaxy/scripts/components/*.vue",
    },
];

module.exports = {
    webpackConfig,
    pagePerSection: true,
    sections,
    require: ["./galaxy/style/scss/base.scss", "./galaxy/scripts/polyfills.js", "./galaxy/scripts/bundleEntries.js"],
    vuex: "./galaxy/scripts/store/index.js",
};
