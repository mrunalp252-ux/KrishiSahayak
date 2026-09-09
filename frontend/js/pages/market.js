// js/pages/market.js - Market Prices Page Controller

(function() {
    'use strict';

    const MarketModule = {
        currentPage: 1,
        totalPages: 1,
        limit: 10,

        async init() {
            this.setupListeners();
            await this.loadPrices();
        },

        setupListeners() {
            const searchBtn = document.getElementById('market-search-btn');
            const searchInput = document.getElementById('market-search');
            const stateInput = document.getElementById('market-state');
            const sortSelect = document.getElementById('market-sort');

            const doSearch = () => {
                this.currentPage = 1;
                this.loadPrices();
            };

            if (searchBtn) searchBtn.addEventListener('click', doSearch);
            if (sortSelect) sortSelect.addEventListener('change', doSearch);
            if (searchInput) {
                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') doSearch();
                });
            }
            if (stateInput) {
                stateInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') doSearch();
                });
            }
        },

        async loadPrices() {
            const crop = document.getElementById('market-search')?.value.trim() || '';
            const state = document.getElementById('market-state')?.value.trim() || '';
            const sort = document.getElementById('market-sort')?.value || '';
            
            const tbody = document.getElementById('market-tbody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 24px;">Loading market prices...</td></tr>`;
            }

            try {
                let url = `/market?page=${this.currentPage}&limit=${this.limit}`;
                if (crop) url += `&crop=${encodeURIComponent(crop)}`;
                if (state) url += `&state=${encodeURIComponent(state)}`;
                if (sort) url += `&sort=${encodeURIComponent(sort)}`;

                const res = await window.API.get(url);
                
                const prices = res.prices || res.data || [];
                const pagination = res.pagination || {
                    page: this.currentPage,
                    limit: this.limit,
                    total: prices.length,
                    totalPages: Math.ceil(prices.length / this.limit) || 1
                };

                this.totalPages = pagination.totalPages || 1;
                this.renderPrices(prices);
                this.renderPagination(pagination);
            } catch (err) {
                console.error('Error loading market prices:', err);
                if (tbody) {
                    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color: #ef4444; padding: 24px;">Failed to load market prices. Please try again.</td></tr>`;
                }
            }
        },

        renderPrices(prices) {
            const tbody = document.getElementById('market-tbody');
            if (!tbody) return;

            if (!prices || prices.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 24px; color: #6b7280;">No market data available for current selection.</td></tr>`;
                return;
            }

            tbody.innerHTML = prices.map(p => {
                const commodity = p.commodity || p.crop || p.cropName || 'N/A';
                const market = p.market || p.marketName || (p.district ? `${p.district} Mandi` : 'N/A');
                const state = p.state || '';
                const minPrice = p.minPrice != null ? (window.Utils ? window.Utils.formatCurrency(p.minPrice) : `₹${p.minPrice}`) : '-';
                const maxPrice = p.maxPrice != null ? (window.Utils ? window.Utils.formatCurrency(p.maxPrice) : `₹${p.maxPrice}`) : '-';
                const modalPrice = (p.price != null || p.modalPrice != null) 
                    ? (window.Utils ? window.Utils.formatCurrency(p.price || p.modalPrice) : `₹${p.price || p.modalPrice}`) 
                    : '-';
                const unit = p.unit || 'Quintal';
                const date = p.date ? (window.Utils ? window.Utils.formatDate(p.date) : new Date(p.date).toLocaleDateString()) : 'Today';

                return `
                    <tr>
                        <td><strong>${commodity}</strong></td>
                        <td>${market}${state ? `, <span style="font-size:0.85em;color:#6b7280;">${state}</span>` : ''}</td>
                        <td style="color: #059669;">${minPrice}</td>
                        <td style="color: #dc2626;">${maxPrice}</td>
                        <td><strong style="color: #2563eb;">${modalPrice}</strong></td>
                        <td>${unit}</td>
                        <td>${date}</td>
                    </tr>
                `;
            }).join('');
        },

        renderPagination(pagination) {
            const container = document.getElementById('market-pagination');
            if (!container) return;

            const totalPages = pagination.totalPages || 1;
            const current = pagination.page || this.currentPage;

            if (totalPages <= 1) {
                container.innerHTML = `<div style="text-align: right; padding: 12px; font-size: 0.85rem; color: #6b7280;">Showing ${pagination.total || 0} commodities</div>`;
                return;
            }

            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 8px; font-size: 0.85rem;">
                    <div style="color: #6b7280;">Page ${current} of ${totalPages} (${pagination.total || 0} records)</div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-sm ${current === 1 ? 'btn-disabled' : 'btn-outline-primary'}" id="market-prev" ${current === 1 ? 'disabled' : ''}>◀ Prev</button>
                        <button class="btn btn-sm ${current === totalPages ? 'btn-disabled' : 'btn-outline-primary'}" id="market-next" ${current === totalPages ? 'disabled' : ''}>Next ▶</button>
                    </div>
                </div>
            `;

            const prev = document.getElementById('market-prev');
            const next = document.getElementById('market-next');
            if (prev) {
                prev.onclick = () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.loadPrices();
                    }
                };
            }
            if (next) {
                next.onclick = () => {
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                        this.loadPrices();
                    }
                };
            }
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.market = MarketModule;
    window.PageModules['market-prices'] = MarketModule;

})();
