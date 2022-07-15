import $ from "cash-dom";
import toolboxJson from "./blockly/toolbox.json";
import { initializeBlockly } from "./blockly/initialize";

export default class BlocksEditor {
  constructor() {
    $(() => {
      initializeBlockly(toolboxJson);
    });
  }
}
