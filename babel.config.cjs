module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
  plugins: [
    function importMetaTransform({ types: t }) {
      return {
        visitor: {
          MetaProperty(path) {
            path.replaceWith(
              t.objectExpression([
                t.objectProperty(
                  t.identifier("env"),
                  t.memberExpression(
                    t.identifier("process"),
                    t.identifier("env"),
                  ),
                ),
              ]),
            );
          },
        },
      };
    },
  ],
};
