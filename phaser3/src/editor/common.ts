import $ from "cash-dom";

export function initializeEditor() {
  $(() => {
    $(".tabs li").on("click", (event) => {
      $(".tabs li.is-active").removeClass("is-active");
      const $el = $(event.currentTarget).addClass("is-active");
      const tabPanel = $el.attr("x-tab");
      $(".tab-panel").addClass("is-hidden");
      $(`#${tabPanel}`).removeClass("is-hidden");
      $(window).trigger("resize");
    });
  });
}
