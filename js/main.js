$(function () {
    let products = [];
    const headerPromise = $.get('/flashcard_fe/includes/header.html', function (data) {
        $('#header').html(data);
    });

    const footerPromise = $.get('/flashcard_fe/includes/footer.html', function (data) {
        $('#footer').html(data);
    });

    $.when(headerPromise, footerPromise).done(function () {
        // Initialize authentication state
        initializeAuthState();

        // Mobile menu toggle
        $('.mobile-menu-btn').on('click', function () {
            $('.mobile-menu').addClass('active');
            $('.mobile-overlay').removeClass('hidden');
            $('body').addClass('overflow-hidden');
        });

        $('.mobile-menu-close, .mobile-overlay').on('click', function () {
            $('.mobile-menu').removeClass('active');
            $('.mobile-overlay').addClass('hidden');
            $('body').removeClass('overflow-hidden');
        });

        // Profile dropdown
        $(document).on('click', '.profile-btn', function (e) {
            e.stopPropagation();
            $('.profile-dropdown').toggleClass('hidden');
        });

        // Close dropdown when clicking outside
        $(document).on('click', function () {
            $('.profile-dropdown').addClass('hidden');
        });

        // Notification button animation
        $(document).on('click', '.notification-btn', function () {
            $(this).find('i').addClass('animate-pulse-slow');
            setTimeout(() => {
                $(this).find('i').removeClass('animate-pulse-slow');
            }, 1000);
        });

        // Search focus effect
        $(document).on('focus', 'input[type="text"]', function () {
            $(this).parent().addClass('ring-2 ring-white ring-opacity-50');
        }).on('blur', 'input[type="text"]', function () {
            $(this).parent().removeClass('ring-2 ring-white ring-opacity-50');
        });

        // Active navigation link
        $(document).on('click', '.nav-link, .mobile-nav-link', function (e) {
            $('.nav-link, .mobile-nav-link').removeClass('text-yellow-300');
            $(this).addClass('text-yellow-300');
        });

        // Logout button handler
        $(document).on('click', '.logout-btn', function (e) {
            e.preventDefault();
            handleLogout();
        });

        // Login button handler
        $(document).on('click', '.login-btn', function (e) {
            e.preventDefault();
            window.location.href = '/flashcard_fe/auth/login.html';
        });

        // Register button handler
        $(document).on('click', '.register-btn', function (e) {
            e.preventDefault();
            window.location.href = '/flashcard_fe/auth/register.html';
        });

        // Progress ring animation
        function animateProgressRing() {
            const ring = $('.progress-ring circle:last-child');
            if (ring.length) {
                const circumference = 2 * Math.PI * 16;
                const progress = 75;
                const offset = circumference - (progress / 100) * circumference;

                ring.css({
                    'stroke-dasharray': circumference,
                    'stroke-dashoffset': offset
                });
            }
        }

        animateProgressRing();

        // Smooth scroll for anchor links
        $(document).on('click', 'a[href^="#"]', function (e) {
            e.preventDefault();
            const target = $(this.getAttribute('href'));
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top - 100
                }, 800);
            }
        });

        // Header scroll effect
        let lastScrollTop = 0;
        $(window).on('scroll', function () {
            const scrollTop = $(this).scrollTop();
            const header = $('header');

            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                header.addClass('transform -translate-y-full');
            } else {
                // Scrolling up
                header.removeClass('transform -translate-y-full');
            }

            lastScrollTop = scrollTop;
        });
    });

    // Initialize authentication state
    function initializeAuthState() {
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('user_info');
        
        if (token && !isTokenExpired(token)) {
            // User is logged in
            updateHeaderForLoggedInUser(userInfo);
        } else {
            // User is not logged in or token expired
            if (token && isTokenExpired(token)) {
                // Try to refresh token
                refreshAccessToken((newToken) => {
                    if (newToken) {
                        updateHeaderForLoggedInUser(userInfo);
                    } else {
                        updateHeaderForGuestUser();
                    }
                });
            } else {
                updateHeaderForGuestUser();
            }
        }
    }

    // Update header for logged in user
    function updateHeaderForLoggedInUser(userInfo) {
        let userData = {};
        try {
            userData = userInfo ? JSON.parse(userInfo) : {};
        } catch (e) {
            console.error('Error parsing user info:', e);
        }

        const userName = userData.name || userData.full_name || 'User';
        const userAvatar = userData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face';

        // Update desktop user actions
        const desktopUserActions = `
            <div class="flex items-center space-x-4">
                <!-- Notifications -->
                <div class="relative">
                    <button class="notification-btn p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200">
                        <i class="fas fa-bell text-lg"></i>
                        <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                    </button>
                </div>

                <!-- Progress Ring -->
                <div class="hidden sm:block relative">
                    <div class="w-10 h-10 progress-ring">
                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
                            <circle cx="18" cy="18" r="16" fill="none" stroke="white" stroke-width="2" stroke-dasharray="75, 100" stroke-linecap="round" />
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-xs text-white font-semibold">75%</span>
                        </div>
                    </div>
                </div>

                <!-- User Profile -->
                <div class="relative">
                    <button class="profile-btn flex items-center space-x-2 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200">
                        <img src="${userAvatar}" alt="User" class="w-8 h-8 rounded-full border-2 border-white">
                        <span class="hidden lg:block text-white text-sm">${userName}</span>
                        <i class="fas fa-chevron-down text-white text-sm hidden lg:block"></i>
                    </button>

                    <!-- Dropdown Menu -->
                    <div class="profile-dropdown bg-black absolute right-0 mt-2 w-48 glass-effect rounded-xl shadow-lg py-2 hidden">
                        <a href="#" class="block px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 transition-colors">
                            <i class="fas fa-user mr-2"></i>Hồ sơ
                        </a>
                        <a href="#" class="block px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 transition-colors">
                            <i class="fas fa-cog mr-2"></i>Cài đặt
                        </a>
                        <div class="border-t border-white border-opacity-20 my-2"></div>
                        <a href="#" class="logout-btn block px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 transition-colors">
                            <i class="fas fa-sign-out-alt mr-2"></i>Đăng xuất
                        </a>
                    </div>
                </div>

                <!-- Mobile Menu Button -->
                <button class="mobile-menu-btn lg:hidden p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200">
                    <i class="fas fa-bars text-lg"></i>
                </button>
            </div>
        `;

        // Update mobile menu auth section
        const mobileAuthSection = `
            <div class="border-t border-white border-opacity-20 my-4"></div>
            <div class="space-y-2">
                <div class="flex items-center space-x-3 px-4 py-2">
                    <img src="${userAvatar}" alt="User" class="w-8 h-8 rounded-full border-2 border-white">
                    <span class="text-white font-medium">${userName}</span>
                </div>
                <a href="#" class="mobile-nav-link block text-white hover:text-purple-200 transition-colors py-2">
                    <i class="fas fa-user mr-3"></i>Hồ sơ
                </a>
                <a href="#" class="mobile-nav-link block text-white hover:text-purple-200 transition-colors py-2">
                    <i class="fas fa-cog mr-3"></i>Cài đặt
                </a>
                <a href="#" class="logout-btn mobile-nav-link block text-white hover:text-purple-200 transition-colors py-2">
                    <i class="fas fa-sign-out-alt mr-3"></i>Đăng xuất
                </a>
            </div>
        `;

        // Update DOM
        $('.flex.items-center.space-x-4').last().replaceWith(desktopUserActions);
        $('.mobile-menu nav').find('.border-t').nextAll().remove();
        $('.mobile-menu nav').append(mobileAuthSection);
    }

    // Update header for guest user
    function updateHeaderForGuestUser() {
        // Update desktop user actions
        const desktopUserActions = `
            <div class="flex items-center space-x-4">
                <!-- Search Bar -->
                <div class="hidden md:flex items-center space-x-4">
                    <div class="relative">
                        <input type="text" placeholder="Tìm kiếm từ vựng..." class="search-expand w-64 px-4 py-2 pl-10 pr-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full border border-white border-opacity-30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-300">
                        <i class="fas fa-search absolute left-3 top-3 text-purple-200"></i>
                    </div>
                </div>

                <!-- Auth Buttons -->
                <div class="hidden lg:flex items-center space-x-3">
                    <button class="login-btn px-4 py-2 text-white border border-white border-opacity-30 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200">
                        <i class="fas fa-sign-in-alt mr-2"></i>Đăng nhập
                    </button>
                    <button class="register-btn px-4 py-2 bg-white text-purple-600 rounded-full hover:bg-opacity-90 transition-all duration-200 font-medium">
                        <i class="fas fa-user-plus mr-2"></i>Đăng ký
                    </button>
                </div>

                <!-- Mobile Menu Button -->
                <button class="mobile-menu-btn lg:hidden p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200">
                    <i class="fas fa-bars text-lg"></i>
                </button>
            </div>
        `;

        // Update mobile menu auth section
        const mobileAuthSection = `
            <div class="border-t border-white border-opacity-20 my-4"></div>
            
            <!-- Mobile Search -->
            <div class="relative mb-4">
                <input type="text" placeholder="Tìm kiếm..." class="w-full px-4 py-2 pl-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full border border-white border-opacity-30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50">
                <i class="fas fa-search absolute left-3 top-3 text-purple-200"></i>
            </div>

            <!-- Mobile Auth Buttons -->
            <div class="space-y-3">
                <button class="login-btn w-full px-4 py-2 text-white border border-white border-opacity-30 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200">
                    <i class="fas fa-sign-in-alt mr-2"></i>Đăng nhập
                </button>
                <button class="register-btn w-full px-4 py-2 bg-white text-purple-600 rounded-full hover:bg-opacity-90 transition-all duration-200 font-medium">
                    <i class="fas fa-user-plus mr-2"></i>Đăng ký
                </button>
            </div>
        `;

        // Update DOM
        $('.flex.items-center.space-x-4').last().replaceWith(desktopUserActions);
        $('.mobile-menu nav').find('.border-t').nextAll().remove();
        $('.mobile-menu nav').append(mobileAuthSection);
    }

    function refreshAccessToken(callback) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            console.warn('No refresh token found');
            localStorage.clear();
            if (typeof callback === 'function') {
                callback(null);
            }
            return;
        }

        $.ajax({
            url: `${ENV.API_BASE_URL}/api/v1/user/refresh?refresh_token=${refreshToken}`,
            type: 'GET',
            success: function (response) {
                const newAccessToken = response.data.token;
                if (newAccessToken) {
                    localStorage.setItem('token', newAccessToken);
                    if (typeof callback === 'function') {
                        callback(newAccessToken);
                    }
                } else {
                    console.error('Failed to refresh token');
                    localStorage.clear();
                    if (typeof callback === 'function') {
                        callback(null);
                    }
                }
            },
            error: function (xhr) {
                console.error('Refresh token failed:', xhr.responseText);
                localStorage.clear();
                if (typeof callback === 'function') {
                    callback(null);
                }
            }
        });
    }

    function handleLogout() {
        if (!confirm('Bạn có chắc chắn muốn đăng xuất?')) return;

        let token = localStorage.getItem('token');
        if (!token) {
            if (typeof toastr !== 'undefined') {
                toastr.warning('Bạn chưa đăng nhập');
            }
            return;
        }

        const doLogout = (authToken) => {
            $.ajax({
                url: `${ENV.API_BASE_URL}/api/v1/user/logout`,
                type: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + authToken,
                    'Content-Type': 'application/json'
                },
                success: function () {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_info');

                    updateHeaderForGuestUser();

                    if (typeof toastr !== 'undefined') {
                        toastr.success('Đăng xuất thành công');
                    }

                    setTimeout(function () {
                        window.location.href = '/flashcard_fe/index.html';
                    }, 1000);
                },
                error: function (xhr) {
                    if (xhr.status === 401) {
                        // Token expired → refresh then retry logout
                        refreshAccessToken((newToken) => {
                            if (newToken) {
                                doLogout(newToken);
                            } else {
                                // Force logout if refresh fails
                                localStorage.clear();
                                updateHeaderForGuestUser();
                                if (typeof toastr !== 'undefined') {
                                    toastr.success('Đăng xuất thành công');
                                }
                                setTimeout(function () {
                                    window.location.href = '/flashcard_fe/index.html';
                                }, 1000);
                            }
                        });
                    } else {
                        let errorMessage = 'Đăng xuất thất bại. Vui lòng thử lại.';

                        if (xhr.responseJSON && xhr.responseJSON.message) {
                            errorMessage = xhr.responseJSON.message;
                        } else if (xhr.responseText) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                errorMessage = response.message || response.error || errorMessage;
                            } catch (e) {
                                errorMessage = xhr.responseText;
                            }
                        }

                        console.error('Logout API failed:', errorMessage);
                        if (typeof toastr !== 'undefined') {
                            toastr.error(errorMessage);
                        }
                    }
                }
            });
        };

        doLogout(token);
    }

    function isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    }

    // Global AuthManager object
    window.AuthManager = {
        handleLogout: handleLogout,
        isTokenExpired: isTokenExpired,
        updateHeaderForLoggedInUser: updateHeaderForLoggedInUser,
        updateHeaderForGuestUser: updateHeaderForGuestUser,
        initializeAuthState: initializeAuthState
    };
});