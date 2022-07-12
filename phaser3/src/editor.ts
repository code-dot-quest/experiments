import $ from "cash-dom";
import editorSpec from "./editor.json";
import { GroundType } from "./world/ground";

type OnGroundSelected = (ground: GroundType) => void;
type OnSave = () => void;
type OnLoad = (json: any) => void;

export default class Editor {
  selectedGround: GroundType;
  protected onGroundSelectedHandler: OnGroundSelected;
  protected onSaveHandler: OnSave;
  protected onLoadHandler: OnLoad;

  constructor() {
    this.selectedGround = this.getDefaultGround();
    const instance = this;
    $(() => {
      for (const ground of editorSpec.ground) {
        $(
          `<span class="editor-tile" x-kind="${ground.kind}" x-type="${ground.type}" style="` +
            `background:url(${editorSpec.groundSpriteSheet.src});` +
            `background-position:-${Math.ceil(ground.frame.x / 2) + 1}px -${Math.ceil(ground.frame.y / 2) + 1}px;` +
            `background-size:${editorSpec.groundSpriteSheet.w / 2}px ${editorSpec.groundSpriteSheet.h / 2}px;` +
            `" />`
        ).appendTo("#editor-tiles-parent");
      }
      $("span.editor-tile").on("click", (event) => {
        $("span.editor-tile.selected").removeClass("selected");
        const $el = $(event.currentTarget).addClass("selected");
        const kind = $el.attr("x-kind");
        const type = $el.attr("x-type");
        instance.selectedGround = { kind, type };
        if (this.onGroundSelectedHandler) this.onGroundSelectedHandler(instance.selectedGround);
      });
      $("#editor-save").on("click", () => {
        if (this.onSaveHandler) this.onSaveHandler();
      });
      $("#editor-load").on("click", () => {
        $("#editor-load-file").trigger("click");
      });
      $("#editor-load-file").on("change", (event) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const json = JSON.parse(reader.result as string);
            if (this.onLoadHandler) this.onLoadHandler(json);
          } catch (e) {
            console.error(e);
          }
        };
        reader.readAsText(event.target.files[0]);
      });
    });
  }

  onGroundSelected(handler: OnGroundSelected) {
    this.onGroundSelectedHandler = handler;
  }

  onSave(handler: OnSave) {
    this.onSaveHandler = handler;
  }

  onLoad(handler: OnLoad) {
    this.onLoadHandler = handler;
  }

  getDefaultGround(): GroundType {
    return editorSpec.defaultGround;
  }
}
