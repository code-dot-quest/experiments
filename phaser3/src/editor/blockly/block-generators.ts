import BlocklyJavaScript from "blockly/javascript_compressed";

BlocklyJavaScript["on_start"] = function () {
  return ``;
};

BlocklyJavaScript["move_right"] = function () {
  return `moveRight();\n`;
};

BlocklyJavaScript["move_direction"] = function (block) {
  return `move("${block.getFieldValue("direction")}");\n`;
};

BlocklyJavaScript["repeat_n"] = function (block) {
  let branch = BlocklyJavaScript.statementToCode(block, "repeat");
  branch = BlocklyJavaScript.addLoopTrap(branch, block);
  return `for (var i=0; i<${block.getFieldValue("repeat_num")}; i++) {\n${branch}}\n`;
};
