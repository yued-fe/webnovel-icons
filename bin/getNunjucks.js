const getNunjucks = (ComponentName, svgCode) => `
{% macro ${ComponentName}(size='16', className='', attr='') %}
<svg width="{{ size | safe }}" height="{{ size | safe  }}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="{{ className | safe }}" {{ attr | safe }} >
    ${svgCode}
</svg>
{% endmacro %}
`;
module.exports = getNunjucks;
