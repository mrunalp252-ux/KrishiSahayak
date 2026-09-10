// js/pages/profile.js - Farmer & User Profile Management Controller

(function() {
    'use strict';

    const ProfileModule = {
        async init() {
            await this.loadProfile();
            this.setupListeners();
        },

        async loadProfile() {
            try {
                const res = await window.API.get('/users/profile');
                const user = res.user || res.data || res;

                const nameEl = document.getElementById('profile-name');
                const emailEl = document.getElementById('profile-email');
                const emailRoEl = document.getElementById('profile-email-ro');
                const avatarEl = document.getElementById('profile-avatar');

                if (nameEl) nameEl.textContent = user.name || 'Farmer';
                if (emailEl) emailEl.textContent = user.email || '';
                if (emailRoEl) emailRoEl.value = user.email || '';

                if (avatarEl) {
                    if (user.profileImage) {
                        avatarEl.innerHTML = `<img src="${user.profileImage}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
                    } else {
                        avatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();
                    }
                }

                const nameInput = document.getElementById('profile-name-input');
                const mobileInput = document.getElementById('profile-mobile');
                const stateInput = document.getElementById('profile-state');
                const districtInput = document.getElementById('profile-district');
                const villageInput = document.getElementById('profile-village');
                const langSelect = document.getElementById('profile-language');

                if (nameInput) nameInput.value = user.name || '';
                if (mobileInput) mobileInput.value = user.phone || user.mobile || '';
                if (stateInput) stateInput.value = user.state || '';
                if (districtInput) districtInput.value = user.district || '';
                if (villageInput) villageInput.value = user.village || '';
                if (langSelect) langSelect.value = user.preferredLanguage || user.language || 'en';

            } catch (err) {
                console.error('Error loading profile:', err);
                window.Utils && window.Utils.showToast('Failed to load profile details', 'error');
            }
        },

        setupListeners() {
            const profileForm = document.getElementById('profile-form');
            if (profileForm) {
                profileForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('profile-name-input')?.value.trim();
                    const phone = document.getElementById('profile-mobile')?.value.trim();
                    const state = document.getElementById('profile-state')?.value.trim();
                    const district = document.getElementById('profile-district')?.value.trim();
                    const village = document.getElementById('profile-village')?.value.trim();
                    const language = document.getElementById('profile-language')?.value || 'en';

                    try {
                        const res = await window.API.put('/users/profile', {
                            name,
                            phone,
                            mobile: phone,
                            state,
                            district,
                            village,
                            preferredLanguage: language
                        });

                        const updatedUser = res.user || res.data || res;
                        if (window.Auth && window.Auth.setUser) {
                            window.Auth.setUser(updatedUser);
                        }

                        // Update displayed name & avatar
                        const nameEl = document.getElementById('profile-name');
                        if (nameEl) nameEl.textContent = updatedUser.name || name;

                        window.Utils.showToast('Profile updated successfully! ✅', 'success');

                        // Switch language if changed
                        if (window.I18n && language !== window.I18n.getCurrentLanguage()) {
                            await window.I18n.setLanguage(language);
                        }
                    } catch (err) {
                        window.Utils.showToast(err.message, 'error');
                    }
                });
            }

            // Change Picture
            const changePicBtn = document.getElementById('change-picture-btn');
            const fileInput = document.getElementById('profile-image-input');
            if (changePicBtn && fileInput) {
                changePicBtn.addEventListener('click', () => fileInput.click());
                fileInput.addEventListener('change', async (e) => {
                    if (e.target.files && e.target.files[0]) {
                        await this.uploadProfilePicture(e.target.files[0]);
                        fileInput.value = '';
                    }
                });
            }

            // Change Password
            const changePwdBtn = document.getElementById('change-password-btn');
            if (changePwdBtn) {
                changePwdBtn.addEventListener('click', () => this.openChangePasswordModal());
            }
        },

        async uploadProfilePicture(file) {
            const formData = new FormData();
            formData.append('avatar', file);
            formData.append('file', file);

            try {
                window.Utils.showToast('Uploading profile picture...', 'info');
                const res = await window.API.post('/users/profile/avatar', formData, true);
                const imageUrl = res.profileImage || res.imageUrl || (res.data && res.data.profileImage);

                if (imageUrl) {
                    const avatarEl = document.getElementById('profile-avatar');
                    if (avatarEl) {
                        avatarEl.innerHTML = `<img src="${imageUrl}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
                    }
                    const topbarAvatar = document.getElementById('topbar-avatar');
                    if (topbarAvatar) {
                        topbarAvatar.innerHTML = `<img src="${imageUrl}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
                    }
                }
                window.Utils.showToast('Profile picture updated!', 'success');
            } catch (err) {
                window.Utils.showToast(err.message, 'error');
            }
        },

        openChangePasswordModal() {
            const html = `
                <div style="min-width:320px; max-width:440px; width:100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="margin:0;">🔒 Change Password</h3>
                        <button class="close-modal" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                    </div>
                    <form id="change-pwd-modal-form">
                        <div class="form-group mb-3">
                            <label class="form-label">Current Password <span style="color:red">*</span></label>
                            <input type="password" class="form-control" name="currentPassword" required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">New Password <span style="color:red">*</span></label>
                            <input type="password" class="form-control" name="newPassword" minlength="6" required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">Confirm New Password <span style="color:red">*</span></label>
                            <input type="password" class="form-control" name="confirmPassword" minlength="6" required>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                            <button type="button" class="btn btn-outline-secondary close-modal">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="save-pwd-btn">Update Password</button>
                        </div>
                    </form>
                </div>
            `;

            window.Utils.showModal(html, {
                onLoad: (modal, close) => {
                    const form = modal.querySelector('#change-pwd-modal-form');
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const currentPassword = form.currentPassword.value;
                        const newPassword = form.newPassword.value;
                        const confirmPassword = form.confirmPassword.value;

                        if (newPassword !== confirmPassword) {
                            window.Utils.showToast('New passwords do not match!', 'error');
                            return;
                        }

                        const btn = modal.querySelector('#save-pwd-btn');
                        btn.disabled = true;
                        btn.textContent = 'Updating...';

                        try {
                            await window.API.put('/users/profile/password', {
                                currentPassword,
                                newPassword
                            });
                            window.Utils.showToast('Password updated successfully! 🔒', 'success');
                            close(true);
                        } catch (err) {
                            window.Utils.showToast(err.message, 'error');
                            btn.disabled = false;
                            btn.textContent = 'Update Password';
                        }
                    });
                }
            });
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.profile = ProfileModule;

})();
