const getComponent = (ComponentName, svgCode, attrs = {}) => {
  const {viewBox = "0 0 24 24"} = attrs;
  return `export default {
  dangerouslySetInnerHTML: { __html: "${svgCode.replace(/\"/g,'\\"')}" },
  viewBox:"${viewBox}",
  width:"24",
  height:"24",
  fill:"none"
};`;
};
module.exports = getComponent;
