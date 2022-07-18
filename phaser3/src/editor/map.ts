import $ from "cash-dom";
import mapEditorSpec from "./map.json";
import { GroundType } from "../world/tile";

type OnTileSelected = (ground: GroundType, background: GroundType) => void;
type OnSave = () => void;
type OnLoad = (json: any) => void;

export default class MapEditor {
  public selectedGround: GroundType;
  public selectedBackground: GroundType;
  protected onTileSelectedHandler: OnTileSelected;
  protected onSaveHandler: OnSave;
  protected onLoadHandler: OnLoad;

  constructor() {
    this.selectedGround = this.getDefaultGround();
    this.selectedBackground = this.getDefaultBackground();
    const instance = this;
    $(() => {
      for (const background of mapEditorSpec.background) {
        $(
          `<style type="text/css"> .background-${background.kind} {` +
            ` background:url(${mapEditorSpec.tileSpriteSheet.src});` +
            ` background-position:-${Math.ceil(background.frame.x / 2)}px -${Math.ceil(background.frame.y / 2)}px;` +
            ` background-size:${mapEditorSpec.tileSpriteSheet.w / 2}px ${mapEditorSpec.tileSpriteSheet.h / 2}px;` +
            `} </style>`
        ).appendTo("head");
      }

      for (const background of mapEditorSpec.background) {
        $(
          `<span class="editor-tile-background ${isSelected(background, this.selectedBackground)}"` +
            ` x-kind="${background.kind}" x-type="${background.type}" style="` +
            ` background:url(${mapEditorSpec.tileSpriteSheet.src});` +
            ` background-position:-${Math.ceil(background.frame.x / 2)}px -${Math.ceil(background.frame.y / 2)}px;` +
            ` background-size:${mapEditorSpec.tileSpriteSheet.w / 2}px ${mapEditorSpec.tileSpriteSheet.h / 2}px;` +
            `" />`
        ).appendTo("#editor-map-background");
      }

      for (const ground of mapEditorSpec.ground) {
        $(
          `<span class="editor-tile-ground-background background-${this.selectedBackground.kind}">` +
            `<span class="editor-tile-ground ${isSelected(ground, this.selectedGround)}"` +
            ` x-kind="${ground.kind}" x-type="${ground.type}" style="` +
            ` background:url(${mapEditorSpec.tileSpriteSheet.src});` +
            ` background-position:-${Math.ceil(ground.frame.x / 2)}px -${Math.ceil(ground.frame.y / 2)}px;` +
            ` background-size:${mapEditorSpec.tileSpriteSheet.w / 2}px ${mapEditorSpec.tileSpriteSheet.h / 2}px;` +
            `" />` +
            `</span>`
        ).appendTo("#editor-map-ground");
      }

      $("span.editor-tile-background").on("click", (event) => {
        $("span.editor-tile-background.selected").removeClass("selected");
        const $el = $(event.currentTarget).addClass("selected");
        const kind = $el.attr("x-kind");
        const type = $el.attr("x-type");
        $("span.editor-tile-ground-background").removeClass().addClass(`editor-tile-ground-background background-${kind}`);
        instance.selectedBackground = { kind, type };
        if (this.onTileSelectedHandler) this.onTileSelectedHandler(instance.selectedGround, instance.selectedBackground);
      });

      $("span.editor-tile-ground").on("click", (event) => {
        $("span.editor-tile-ground.selected").removeClass("selected");
        const $el = $(event.currentTarget).addClass("selected");
        const kind = $el.attr("x-kind");
        const type = $el.attr("x-type");
        instance.selectedGround = { kind, type };
        if (this.onTileSelectedHandler) this.onTileSelectedHandler(instance.selectedGround, instance.selectedBackground);
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

function isSelected(groundType: GroundType, selected: GroundType) {
  if (groundType.kind == selected.kind && groundType.type == selected.type) return "selected";
  else return "";
}
