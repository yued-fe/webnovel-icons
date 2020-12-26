const getNjsSymbol = (ComponentName, svgCode, attrs = {}) => {
  const {viewBox = "0 0 24 24"} = attrs;
  return `{% macro ${ComponentName}(size='16', class='', attr='', isSvg=true) %}
  {% if isSvg %}
    <svg viewBox="${viewBox}" width="{{ size | safe }}" height="{{ size | safe  }}" {% if class %}class="{{ class | safe }}"{% endif %} {{ attr | safe }}>
  {% else %}
    <symbol id="${ComponentName}" viewBox="${viewBox}">
  {% endif %}
  ${svgCode}
  {% if isSvg %}</svg>{% else %}</symbol>{% endif %}
{% endmacro %}
`;
};
module.exports = getNjsSymbol;
