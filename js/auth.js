$(document).ready(function () {
    let tokenStorage = {
        token: null,
        refreshToken: null
    };
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    // Register Form Submit
    $('#registerForm').on('submit', function (e) {
        e.preventDefault();

        $('#buttonText').hide();
        $('#loadingText').show();

        const formData = {
            firstName: $('#firstName').val().trim(),
            lastName: $('#lastName').val().trim(),
            phone: $('#phone').val().trim(),
            email: $('#email').val().trim(),
            password: $('#password').val()
        };

        // Validate required fields
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.password) {
            toastr.warning('Please fill in all required fields');
            resetButton();
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toastr.warning('Email not valid');
            resetButton();
            return;
        }

        $.ajax({
            url: `${ENV.API_BASE_URL}/api/v1/user/register`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                email: formData.email,
                password: formData.password
            }),
            success: function (response) {
                if (response.status_code === 201 || response.data?.token) {
                    toastr.success('Registration successful');

                    const token = response.data.token;
                    const refreshToken = response.data.refresh_token;

                    tokenStorage.token = token;
                    tokenStorage.refreshToken = refreshToken;

                    $('#storedToken').text(token.substring(0, 50) + '...');
                    $('#tokenDisplay').show();

                    localStorage.setItem('token', token);
                    localStorage.setItem('refresh_token', refreshToken);
                    localStorage.setItem('user_info', JSON.stringify({
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone
                    }));

                    $('#registerForm')[0].reset();

                    setTimeout(function () {
                        window.location.href = '/flashcard_fe/index.html';
                    }, 1000);
                } else {
                    toastr.error(response.message || 'Registration failed');
                }
            },
            error: function (xhr) {
                console.error('Registration failed:', xhr.responseText);
                let errorMessage = 'Registration failed. Please try again.';

                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        errorMessage = errorResponse.error || errorResponse.message || errorMessage;
                    } catch (e) {
                        errorMessage = xhr.responseText;
                    }
                }

                toastr.error(errorMessage);
            },
            complete: function () {
                resetButton();
            }
        });
    });

    function resetButton() {
        $('#buttonText').show();
        $('#loadingText').hide();
    }


    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        const email = $('#email').val().trim();
        const password = $('#password').val();

        const loginData = { email, password };

        if (!email || !password) {
            toastr.warning('Please enter full email and password');
            return;
        }

        // Show loading
        $('#buttonText').hide();
        $('#loadingText').show();

        $.ajax({
            url: `${ENV.API_BASE_URL}/api/v1/user/login`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Accept', 'application/json');
            },
            success: function (data) {
                $('#buttonText').show();
                $('#loadingText').hide();

                if (data.status_code === 200) {
                    toastr.success('Login successfully');

                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('refresh_token', data.data.refresh_token);
                    localStorage.setItem('user_info', JSON.stringify(data.data));
                    setTimeout(function () {
                        window.location.href = '/flashcard_fe/index.html';
                    }, 1000);
                } else {
                    toastr.error(data.message || 'Login failed');
                }
            },
            error: function (xhr) {
                $('#btnLogin').removeClass('loading');
                $('#buttonText').show();
                $('#loadingText').hide();

                let errorMessage = 'Login failed. Please try again.';

                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                } else if (xhr.responseText) {
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        errorMessage = errorResponse.error || errorResponse.message || errorMessage;
                    } catch (e) {
                        errorMessage = xhr.responseText;
                    }
                }

                toastr.error(errorMessage);
            }
        });
    });


    function resetButton() {
        $('#btnRegister').removeClass('loading');
        $('#buttonText').show();
        $('#loadingText').hide();
    }

    function getStoredToken() {
        return tokenStorage.token;
        // Or: return localStorage.getItem('token');
    }

    function getStoredRefreshToken() {
        return tokenStorage.refreshToken;
        // Or: return localStorage.getItem('refresh_token');
    }

});


