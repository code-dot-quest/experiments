import $ from 'cash-dom';
import * as editorJson from './editor.json';

type OnTileSelected = (frameId: string) => void;

export default class Editor {
  selectedFrameId: string = "0";
  private onTileSelectedHandler: OnTileSelected;
  
  constructor() {
    const instance = this;
    $(() => {
      for (const tile of editorJson.tiles) {
        $(`<span class="editor-tile" style="background:url(${editorJson.tilesImage.src}); background-position:-${tile.frame.x/2}px -${tile.frame.y/2}px; background-size:${editorJson.tilesImage.w/2}px ${editorJson.tilesImage.h/2}px;" x-frame="${tile.frameId}" />`).appendTo('#editor-tiles-parent');
      }
      $("span.editor-tile").on("click", (event) => {
        const frameId = $(event.currentTarget).attr("x-frame");
        instance.selectedFrameId = frameId;
        if (this.onTileSelectedHandler) this.onTileSelectedHandler(frameId);
      }); 
    });
  }

  onTileSelected(handler: OnTileSelected) {
    this.onTileSelectedHandler = handler;
  }
}