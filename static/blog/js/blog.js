$(document).ready(function() {
    flatpickr('.datepicker', {
        dateFormat: 'm/d/Y'
    });
    $('.articles, a.more').click(function(e) {
        const target = $(this).data('target');
        if (target) {
            e.preventDefault();
            $('#' + target + ' .d-none').removeClass('d-none');
            $(this).addClass('d-none');
            $('.less[data-target='+ target +']').removeClass('d-none');
        }
    });
    $('.articles a.less').click(function(e) {
        const target = $(this).data('target');
        if (target) {
            e.preventDefault();
            $('#' + target + ' .article').slice(3).addClass('d-none');
            $(this).addClass('d-none');
            $('.more[data-target=' + target + ']').removeClass('d-none');
        }
    });
    $('.arrows .left').hide();
    $("#arrows").on("scroll", function (e) {
        const horizontal = e.currentTarget.scrollLeft;
        const width = e.currentTarget.scrollWidth;
        const width2 = $("#arrows").outerWidth();
        if (horizontal === 0) {
            $('.arrows .left').hide();
        } else {
            $('.arrows .left').show();
            if (width === (width2 + horizontal)) {
                $('.arrows .right').hide();
            } else {
                $('.arrows .right').show();
            }
        }
    });
    $('.arrows .right').click(function () {
        $(".second-nav .columns").animate({
            scrollLeft: '+=50px'
        });
    });
    $('.arrows .left').click(function () {
        $(".second-nav .columns").animate({
            scrollLeft: '-=50px'
        });
    });
    $('.login-page .scroll-to-register').click(function(e) {
        e.preventDefault();
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#register").offset().top
        }, 500);
    });

    $('.registration-page .registration-form')
        .validate({
            errorClass: "error text-danger",
            errorElement: "p",
            errorPlacement: function(error, element) {
                if (element.is(':checkbox')) {
                    error.appendTo( element.next("label") );
                } else {
                    error.appendTo( element.parent() )
                }
            }
        });
    if ($('.step2-page').length) {
        payform.cardNumberInput(document.getElementById('id_card_number'));
        payform.expiryInput(document.getElementById('card_expiration'));
        payform.cvcInput(document.getElementById('id_card_cvc'));
        $('.step2-page .step2-form')
            .validate({
                submitHandler: function(form) {
                    const cardExpiration = $('#card_expiration').val();
                    if (cardExpiration.length) {
                        const expiryObj = payform.parseCardExpiry(cardExpiration);
                        $('#id_card_expiration_month').val(expiryObj.month);
                        $('#id_card_expiration_year').val(expiryObj.year);
                    }
                    form.submit();
                },
                errorClass: "error text-danger",
                errorElement: "p",
                errorPlacement: function(error, element) {
                    if (element.is(':checkbox')) {
                        error.appendTo( element.next("label") );
                    } else {
                        error.appendTo( element.parent() )
                    }
                },
                rules: {
                    card_number: {
                      creditCardNumber: true,
                    },
                    card_cvc: {
                        required: {
                            depends: function(element) {
                                return $("#id_card_number").val().length > 0;
                            }
                        },
                        creditCardCVC: true,
                    },
                    card_expiration: {
                        required: {
                            depends: function(element) {
                                return $("#id_card_number").val().length > 0;
                            }
                        },
                        creditCardExpiry: true,
                    }
                }
            });
    }
});

jQuery.validator.addMethod("creditCardNumber", function(value, element) {
  return this.optional(element) || (value.length && payform.validateCardNumber(value));
}, "Credit card number not valid!");

jQuery.validator.addMethod("creditCardExpiry", function(value, element) {
    const expiryObj = payform.parseCardExpiry(value);
  return this.optional(element) || (value.length && payform.validateCardExpiry(expiryObj));
}, "Credit card expiry not valid!");

jQuery.validator.addMethod("creditCardCVC", function(value, element) {
    const cardType = payform.parseCardType($('#id_card_number').val());
  return this.optional(element) || (value.length && payform.validateCardCVC(value, cardType));
}, "CVC not valid!");