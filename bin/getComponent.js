const getComponent = (ComponentName, svgCode, attrs = {}) => {
  const {viewBox = "0 0 24 24"} = attrs;
  return `export default {
  dangerouslySetInnerHTML: { __html: "${svgCode.replace(/\"/g,'\\"')}" },
  viewBox:"${viewBox}",
  fill:"none"
};`;
};
module.exports = getComponent;
