// @ts-nocheck

import $ from "cash-dom";
import Blockly from "blockly";

export default class BlocksEditor {
  constructor() {
    $(() => {
      const toolbox = {
        kind: "flyoutToolbox",
        contents: [
          {
            kind: "block",
            type: "controls_if",
          },
          {
            kind: "block",
            type: "controls_repeat_ext",
          },
          {
            kind: "block",
            type: "logic_compare",
          },
          {
            kind: "block",
            type: "math_number",
          },
          {
            kind: "block",
            type: "math_arithmetic",
          },
          {
            kind: "block",
            type: "text",
          },
          {
            kind: "block",
            type: "text_print",
          },
        ],
      };
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
    });
  }
}
