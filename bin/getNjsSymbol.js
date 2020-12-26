const getNjsSymbol = (ComponentName, svgCode, attrs = {}) => {
  const {viewBox = "0 0 24 24"} = attrs;
  return `{% macro ${ComponentName}(isSymbol=false) %}{% if isSymbol %}<symbol id="${ComponentName}" viewBox="${viewBox}">{% endif %}${svgCode}{% if isSymbol %}</symbol>{% endif %}{% endmacro %}
`;
};
module.exports = getNjsSymbol;
