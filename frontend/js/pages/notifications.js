// js/pages/notifications.js - Alerts & Advisories Notifications Controller

(function() {
    'use strict';

    const NotificationsModule = {
        currentPage: 1,
        limit: 10,
        totalPages: 1,

        async init() {
            this.setupEventListeners();
            await this.loadNotifications();
        },

        setupEventListeners() {
            const markAllBtn = document.getElementById('mark-all-read-btn');
            if (markAllBtn) {
                markAllBtn.addEventListener('click', () => this.markAllRead());
            }
        },

        async loadNotifications() {
            const container = document.getElementById('notifications-container') || document.getElementById('notifications-list');
            if (container) {
                container.innerHTML = '<div class="empty-state" style="text-align:center; padding:40px;"><p>Loading notifications...</p></div>';
            }

            try {
                const res = await window.API.get(`/notifications?page=${this.currentPage}&limit=${this.limit}`);
                const notifications = (res && Array.isArray(res.notifications)) 
                    ? res.notifications 
                    : ((res && Array.isArray(res.data)) ? res.data : ((res && res.data && Array.isArray(res.data.data)) ? res.data.data : []));
                const pagination = res.pagination || {
                    page: this.currentPage,
                    limit: this.limit,
                    total: notifications.length,
                    totalPages: Math.ceil(notifications.length / this.limit) || 1
                };

                this.totalPages = pagination.totalPages || 1;
                this.renderNotifications(notifications);
                this.renderPagination(pagination);
            } catch (err) {
                console.error('Error loading notifications:', err);
                if (container) {
                    container.innerHTML = `<div class="empty-state" style="color:#ef4444; text-align:center; padding:40px;"><p>Failed to load notifications: ${err.message}</p></div>`;
                }
            }
        },

        renderNotifications(notifications) {
            const container = document.getElementById('notifications-container') || document.getElementById('notifications-list');
            if (!container) return;

            if (!notifications || notifications.length === 0) {
                container.innerHTML = `
                    <div class="card text-center" style="padding:48px; color:#6b7280;">
                        <p style="font-size:1.15rem; margin-bottom:8px;">🔔 You have no notifications right now.</p>
                        <small>New market alerts, weather advisories, and task reminders will show up here.</small>
                    </div>
                `;
                return;
            }

            let html = '<div style="display:flex; flex-direction:column; gap:12px;">';
            notifications.forEach(n => {
                const isRead = n.isRead || n.read;
                const type = n.type || 'info';
                const time = n.createdAt ? (window.Utils ? window.Utils.formatDate(n.createdAt) : new Date(n.createdAt).toLocaleDateString()) : 'Recently';
                
                const typeIcon = type === 'critical' || type === 'warning' ? '⚠️' : (type === 'weather' ? '🌤️' : (type === 'market' ? '📈' : '📢'));
                const borderColor = type === 'critical' ? '#ef4444' : (type === 'warning' ? '#f59e0b' : '#3b82f6');

                html += `
                    <div class="card" style="display:flex; justify-content:space-between; align-items:flex-start; padding:16px; border-left:4px solid ${borderColor}; background:${isRead ? 'var(--card-bg, #fff)' : 'rgba(59, 130, 246, 0.05)'};">
                        <div style="flex:1; cursor:pointer;" onclick="window.PageModules.notifications.markRead('${n._id}')">
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                                <span style="font-size:1.1rem;">${typeIcon}</span>
                                <strong style="font-size:1rem; color:var(--text-color, #1f2937);">${n.title}</strong>
                                ${!isRead ? '<span class="badge badge-primary" style="font-size:0.7rem;">New</span>' : ''}
                            </div>
                            <p style="margin:4px 0 6px 0; color:var(--text-muted, #4b5563); font-size:0.9rem; line-height:1.4;">${n.message}</p>
                            <span style="font-size:0.8rem; color:#9ca3af;">🕒 ${time}</span>
                        </div>
                        <div style="margin-left:16px;">
                            <button class="btn btn-sm btn-outline-danger" onclick="window.PageModules.notifications.deleteNotification('${n._id}')" title="Delete notification">&times;</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        },

        renderPagination(pagination) {
            const container = document.getElementById('notifications-pagination');
            if (!container) return;

            const totalPages = pagination.totalPages || 1;
            const current = pagination.page || this.currentPage;

            if (totalPages <= 1) {
                container.innerHTML = '';
                return;
            }

            container.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 8px; font-size:0.85rem;">
                    <div style="color:#6b7280;">Page ${current} of ${totalPages}</div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-sm ${current === 1 ? 'btn-disabled' : 'btn-outline-primary'}" id="notif-prev" ${current === 1 ? 'disabled' : ''}>◀ Prev</button>
                        <button class="btn btn-sm ${current === totalPages ? 'btn-disabled' : 'btn-outline-primary'}" id="notif-next" ${current === totalPages ? 'disabled' : ''}>Next ▶</button>
                    </div>
                </div>
            `;

            const prev = document.getElementById('notif-prev');
            const next = document.getElementById('notif-next');
            if (prev) {
                prev.onclick = () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.loadNotifications();
                    }
                };
            }
            if (next) {
                next.onclick = () => {
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                        this.loadNotifications();
                    }
                };
            }
        },

        async markRead(id) {
            try {
                await window.API.put(`/notifications/${id}/read`, {});
                this.loadNotifications();
            } catch (err) {
                console.error(err);
            }
        },

        async markAllRead() {
            try {
                await window.API.put('/notifications/read-all', {});
                window.Utils.showToast('All notifications marked as read', 'success');
                this.loadNotifications();
            } catch (err) {
                window.Utils.showToast(err.message, 'error');
            }
        },

        async deleteNotification(id) {
            try {
                await window.API.delete(`/notifications/${id}`);
                this.loadNotifications();
            } catch (err) {
                console.error(err);
            }
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.notifications = NotificationsModule;

})();
