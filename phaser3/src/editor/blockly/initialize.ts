// @ts-nocheck

import Blockly from "blockly/core-browser";
import BlocklyJavaScript from "blockly/javascript_compressed";
import blockDefinitions from "./block-definitions.json";
import "./block-generators";

export function initializeBlockly(toolbox) {
  // custom blocks
  Blockly.defineBlocksWithJsonArray(blockDefinitions);

  // inject
  var blocklyArea = document.getElementById("tabs-blocks");
  var blocklyDiv = document.getElementById("blockly-div");
  var workspace = Blockly.inject(blocklyDiv, { toolbox: toolbox });

  // auto resize
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

  // generate code
  function myUpdateFunction(event) {
    var code = BlocklyJavaScript.workspaceToCode(workspace);
    document.getElementById("javascript-code").value = code;
  }
  workspace.addChangeListener(myUpdateFunction);
}
