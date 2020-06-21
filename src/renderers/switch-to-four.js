export const switchToFour = () => {
    $('#nine').css('display', "none");
    $('#nine').removeClass('active');

    $('#six').css('display', "none");
    $('#six').removeClass('active');
    
    $('#four').addClass('active');
    $('#four').fadeIn();
}