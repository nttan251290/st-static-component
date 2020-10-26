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