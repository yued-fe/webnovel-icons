const getComponent = (ComponentName, svgCode, attrs = {}) => {
  const {viewBox = "0 0 24 24"} = attrs;
  return `import * as React from "react";
function ${ComponentName}(props){
  return (
    <svg width="24" height="24" viewBox="${viewBox}" fill="none" {...props}>
      ${svgCode}
    </svg>
  );
}
export default ${ComponentName};
`;
};
module.exports = getComponent;
