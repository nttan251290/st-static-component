function accordionHistory() {
  var btnAccordion = $('[data-toggle="accordion"]');

  btnAccordion.on('click.accordionHistory', function() {
    $(this).find('.icon_image').toggleClass('expand');
    $(this).closest('.acccordion_item').find('.accordion_panel').toggleClass('active');
  });

  var eleWidth = $('.group_accordion').closest('[data-width-container]')

  for(var i = 0; i < eleWidth.length; i++) {
    eleWidth.eq(i).css('width', eleWidth.eq(i).data('width-container'));
  }
}

accordionHistory();