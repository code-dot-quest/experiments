import $ from "cash-dom";
import mapEditorSpec from "./map.json";
import { GroundLayer, GroundType } from "../world/ground";

type OnTileSelected = (ground: GroundType, layer: GroundLayer) => void;
type OnSave = () => void;
type OnLoad = (json: any) => void;

export default class MapEditor {
  public selectedTile: GroundType;
  public currentLayer: GroundLayer;
  protected onTileSelectedHandler: OnTileSelected;
  protected onSaveHandler: OnSave;
  protected onLoadHandler: OnLoad;

  constructor() {
    this.selectedTile = this.getDefaultGround();
    this.currentLayer = "ground";
    const instance = this;
    $(() => {
      for (const ground of mapEditorSpec.background) {
        $(
          `<span class="editor-tile" x-kind="${ground.kind}" x-type="${ground.type}" x-layer="background" style="` +
            `background:url(${mapEditorSpec.groundSpriteSheet.src});` +
            `background-position:-${Math.ceil(ground.frame.x / 2)}px -${Math.ceil(ground.frame.y / 2)}px;` +
            `background-size:${mapEditorSpec.groundSpriteSheet.w / 2}px ${mapEditorSpec.groundSpriteSheet.h / 2}px;` +
            `" />`
        ).appendTo("#editor-map-background");
      }

      for (const ground of mapEditorSpec.ground) {
        $(
          `<span class="editor-tile" x-kind="${ground.kind}" x-type="${ground.type}" x-layer="ground" style="` +
            `background:url(${mapEditorSpec.groundSpriteSheet.src});` +
            `background-position:-${Math.ceil(ground.frame.x / 2)}px -${Math.ceil(ground.frame.y / 2)}px;` +
            `background-size:${mapEditorSpec.groundSpriteSheet.w / 2}px ${mapEditorSpec.groundSpriteSheet.h / 2}px;` +
            `" />`
        ).appendTo("#editor-map-ground");
      }

      $("span.editor-tile").on("click", (event) => {
        $("span.editor-tile.selected").removeClass("selected");
        const $el = $(event.currentTarget).addClass("selected");
        const kind = $el.attr("x-kind");
        const type = $el.attr("x-type");
        const layer = $el.attr("x-layer") as GroundLayer;
        instance.selectedTile = { kind, type };
        instance.currentLayer = layer;
        if (this.onTileSelectedHandler) this.onTileSelectedHandler(instance.selectedTile, layer);
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

  getDefaultGround(): GroundType {
    return mapEditorSpec.defaultGround;
  }

  getDefaultBackground(): GroundType {
    return mapEditorSpec.defaultBackground;
  }
}
