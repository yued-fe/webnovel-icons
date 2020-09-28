const getNunjucks = (ComponentName, svgCode, attrs = {}) => {
  const {viewBox = "0 0 24 24"} = attrs;
  return `
{% macro ${ComponentName}(size='16', class='', attr='') %}
<svg width="{{ size | safe }}" height="{{ size | safe  }}" viewBox="${viewBox}" {% if class %}class="{{ class | safe }}"{% endif %} {{ attr | safe }}>
    ${svgCode}
</svg>
{% endmacro %}
`;
};
module.exports = getNunjucks;
