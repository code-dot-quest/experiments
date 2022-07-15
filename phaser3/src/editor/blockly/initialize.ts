// @ts-nocheck

import Blockly from "blockly/core-browser";
import blockDefinitions from "./block-definitions.json";

export function initializeBlockly(toolbox) {
  Blockly.defineBlocksWithJsonArray(blockDefinitions);
  var blocklyArea = document.getElementById("tabs-blocks");
  var blocklyDiv = document.getElementById("blockly-div");
  var workspace = Blockly.inject(blocklyDiv, { toolbox: toolbox });
  var onresize = function () {
    var element = blocklyArea;
    var x = 0;
    var y = 0;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);
    blocklyDiv.style.left = x + "px";
    blocklyDiv.style.top = y + "px";
    blocklyDiv.style.width = blocklyArea.offsetWidth + "px";
    blocklyDiv.style.height = blocklyArea.offsetHeight + "px";
    Blockly.svgResize(workspace);
  };
  window.addEventListener("resize", onresize, false);
  onresize();
  Blockly.svgResize(workspace);
}
