export const switchToSix = () => {
    $('#nine').css('display', "none");
    $('#nine').removeClass('active');

    $('#six').fadeIn();
    $('#six').addClass('active');

    $('#four').css('display', "none");
    $('#four').removeClass('active');
}