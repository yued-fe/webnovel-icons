const getNjsSymbol = (ComponentName, svgCode, attrs = {}) => {
  const {viewBox = "0 0 24 24"} = attrs;
  return `{% macro ${ComponentName}() %}<symbol id="${ComponentName}" viewBox="${viewBox}">${svgCode}</symbol>{% endmacro %}
`;
};
module.exports = getNjsSymbol;
