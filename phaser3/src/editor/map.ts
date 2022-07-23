import $ from "cash-dom";
import mapEditorSpec from "./map.json";
import { GroundType } from "../world/tile";

type OnTileSelected = (ground: GroundType) => void;
type OnSave = () => void;
type OnLoad = (json: any) => void;
type OnGridToggled = (enabled: boolean) => void;

export default class MapEditor {
  public selectedTile: GroundType;
  protected onTileSelectedHandler: OnTileSelected;
  protected onSaveHandler: OnSave;
  protected onLoadHandler: OnLoad;
  protected onGridToggledHandler: OnGridToggled;

  constructor() {
    this.selectedTile = this.getDefaultGround();
    const instance = this;
    $(() => {
      for (const ground of mapEditorSpec.ground) {
        $(
          `<span class="editor-tile-ground ${isSelected(ground, this.selectedTile)}"` +
            ` x-kind="${ground.kind}" x-type="${ground.type}" style="` +
            ` background:url(${mapEditorSpec.tileSpriteSheet.src});` +
            ` background-position:-${0.5 + ground.frame.x / 2}px -${0.5 + ground.frame.y / 2}px;` +
            ` background-size:${mapEditorSpec.tileSpriteSheet.w / 2}px ${mapEditorSpec.tileSpriteSheet.h / 2}px;` +
            `" />`
        ).appendTo("#editor-map-ground");
      }

      $("span.editor-tile-ground").on("click", (event) => {
        $("span.editor-tile-ground.selected").removeClass("selected");
        const $el = $(event.currentTarget).addClass("selected");
        const kind = $el.attr("x-kind");
        const type = $el.attr("x-type");
        instance.selectedTile = { kind, type };
        if (this.onTileSelectedHandler) this.onTileSelectedHandler(instance.selectedTile);
      });

      $("#editor-grid-toggle").on("change", (event) => {
        const $el = $(event.currentTarget);
        if (this.onGridToggledHandler) this.onGridToggledHandler($el.is(":checked"));
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

  onGridToggled(handler: OnGridToggled) {
    this.onGridToggledHandler = handler;
  }

  getDefaultGround(): GroundType {
    return mapEditorSpec.defaultGround;
  }

  getDefaultBackground(): GroundType {
    return mapEditorSpec.defaultBackground;
  }
}

function isSelected(groundType: GroundType, selected: GroundType) {
  if (groundType.kind == selected.kind && groundType.type == selected.type) return "selected";
  else return "";
}
