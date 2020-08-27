const getElementCode = (ComponentName, svgCode) => `
import * as React from "react";
function ${ComponentName}(props){
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      ${svgCode}
    </svg>
  );
}
export default ${ComponentName};
`;
module.exports = getElementCode;
