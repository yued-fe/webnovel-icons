const getNunjucks = (ComponentName, svgCode) => `
{% macro ${ComponentName}(size='16', class, attr='') %}
<svg width="{{ size | safe }}" height="{{ size | safe  }}" viewBox="0 0 24 24" {% if class %}class="{{ class | safe }}"{% endif %} {{ attr | safe }}>
    ${svgCode}
</svg>
{% endmacro %}
`;
module.exports = getNunjucks;
