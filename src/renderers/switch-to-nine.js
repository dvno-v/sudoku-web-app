export const switchToNine = () => {
    $('#nine').fadeIn();
    $('#nine').addClass('active');

    $('#six').css('display', "none");
    $('#six').removeClass('active');

    $('#four').css('display', "none");
    $('#four').removeClass('active');
}