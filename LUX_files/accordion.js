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

function corporateTabbing() {
  var listTabbing = $('[data-tabbing="tabbing"]').find('> li');

  listTabbing.on('click.corporateTabbing', function() {
    var groupTabbing = $(this).parent();
    groupTabbing.children().removeClass('active');
    $(this).addClass('active');
    
    var listContent = groupTabbing.closest('.corporate-tabbing').find('[data-content="tabbing"] > .tab-panel');

    listContent.removeClass('active');
    listContent.eq(groupTabbing.children().index($(this))).addClass('active');
  });

}

corporateTabbing();