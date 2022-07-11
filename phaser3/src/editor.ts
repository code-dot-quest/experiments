import $ from "cash-dom";
import * as editorJson from "./editor.json";

type OnTileSelected = (frameId: string) => void;
type OnSave = () => void;
type OnLoad = (json: any) => void;

export default class Editor {
  selectedFrameId: string;
  protected onTileSelectedHandler: OnTileSelected;
  protected onSaveHandler: OnSave;
  protected onLoadHandler: OnLoad;

  constructor() {
    this.selectedFrameId = this.getDefaultFrameId();
    const instance = this;
    $(() => {
      for (const tile of editorJson.tiles) {
        $(
          `<span class="editor-tile" x-frame="${tile.frameId}" style="` +
            `background:url(${editorJson.tilesImage.src});` +
            `background-position:-${Math.ceil(tile.frame.x / 2) + 1}px -${Math.ceil(tile.frame.y / 2) + 1}px;` +
            `background-size:${editorJson.tilesImage.w / 2}px ${editorJson.tilesImage.h / 2}px;` +
            `" />`
        ).appendTo("#editor-tiles-parent");
      }
      $("span.editor-tile").on("click", (event) => {
        $("span.editor-tile.selected").removeClass("selected");
        const frameId = $(event.currentTarget).addClass("selected").attr("x-frame");
        instance.selectedFrameId = frameId;
        if (this.onTileSelectedHandler) this.onTileSelectedHandler(frameId);
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

  onTileSelected(handler: OnTileSelected) {
    this.onTileSelectedHandler = handler;
  }

  onSave(handler: OnSave) {
    this.onSaveHandler = handler;
  }

  onLoad(handler: OnLoad) {
    this.onLoadHandler = handler;
  }

  getDefaultFrameId(): string {
    return editorJson.defaultFrameId;
  }
}
