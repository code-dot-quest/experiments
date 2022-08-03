import $ from "cash-dom";
import mapEditorSpec from "./map.json";
import { GroundType } from "../world/tile";

type OnTileSelected = (tile: GroundType) => void;
type OnSave = () => void;
type OnLoad = (json: any) => void;
type OnGridToggled = (enabled: boolean) => void;
type OnElevationChanged = (elevation: number) => void;

export default class MapEditor {
  public selectedTile: GroundType;
  public elevationEditor: number;
  protected onTileSelectedHandler: OnTileSelected;
  protected onSaveHandler: OnSave;
  protected onLoadHandler: OnLoad;
  protected onGridToggledHandler: OnGridToggled;
  protected onElevationChangedEditorHandler: OnElevationChanged;
  protected onElevationChangedViewerHandler: OnElevationChanged;

  constructor() {
    this.selectedTile = this.getDefaultGround();
    this.elevationEditor = 1;
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

      $("#editor-elevation").on("change", (event) => {
        const $el = $(event.currentTarget);
        this.elevationEditor = parseInt($el.val() as string);
        if (this.onElevationChangedEditorHandler) this.onElevationChangedEditorHandler(this.elevationEditor);
      });

      (window as any).bulmaSlider.attach();
      $("#editor-elevation-slider").on("input", (event) => {
        const $el = $(event.currentTarget);
        const elevationViewer = parseInt($el.val() as string);
        if (this.onElevationChangedViewerHandler) this.onElevationChangedViewerHandler(elevationViewer);
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

  onElevationChangedEditor(handler: OnElevationChanged) {
    this.onElevationChangedEditorHandler = handler;
  }

  onElevationChangedViewer(handler: OnElevationChanged) {
    this.onElevationChangedViewerHandler = handler;
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
