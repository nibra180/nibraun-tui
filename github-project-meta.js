(function (global) {
    function createGithubProjectMeta(config) {
        const {
            getLocale,
            getTranslation,
            cacheKey = 'github-repo-updates-v2',
            cacheTtl = 1000 * 60 * 60 * 6,
        } = config;

        function getRepoCards() {
            return document.querySelectorAll('[data-github-repo]');
        }

        /**
         * Targets marked with `data-repo-bare` sit in a column that already
         * carries a header, so they print the value without a prefix.
         */
        function withPrefix(target, prefixKey, value) {
            return target.hasAttribute('data-repo-bare') ? value : `${getTranslation(prefixKey)}: ${value}`;
        }

        function getRepoUpdateLabel(target, state, pushedAt = '') {
            if (state === 'ready' && pushedAt) {
                return withPrefix(target, 'repo.update', formatRelativeDate(pushedAt));
            }

            if (state === 'unavailable') {
                return withPrefix(target, 'repo.update', getTranslation('repo.updateUnavailable'));
            }

            return withPrefix(target, 'repo.update', getTranslation('repo.updateLoading'));
        }

        function getRepoReleaseLabel(target, state, release = '') {
            if (state === 'ready' && release) {
                return withPrefix(target, 'repo.release', release);
            }

            if (state === 'missing') {
                return withPrefix(target, 'repo.release', getTranslation('repo.releaseMissing'));
            }

            if (state === 'unavailable') {
                return withPrefix(target, 'repo.release', getTranslation('repo.releaseUnavailable'));
            }

            return withPrefix(target, 'repo.release', getTranslation('repo.releaseLoading'));
        }

        function formatRelativeDate(value) {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) {
                return getTranslation('repo.updateUnavailable');
            }

            const diffMs = date.getTime() - Date.now();
            const diffMinutes = Math.round(diffMs / (1000 * 60));
            const diffHours = Math.round(diffMs / (1000 * 60 * 60));
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
            const diffWeeks = Math.round(diffMs / (1000 * 60 * 60 * 24 * 7));
            const diffMonths = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30));
            const diffYears = Math.round(diffMs / (1000 * 60 * 60 * 24 * 365));
            const rtf = typeof Intl !== 'undefined' && Intl.RelativeTimeFormat
                ? new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' })
                : null;

            if (rtf) {
                if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
                if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
                if (Math.abs(diffDays) < 7) return rtf.format(diffDays, 'day');
                if (Math.abs(diffWeeks) < 5) return rtf.format(diffWeeks, 'week');
                if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month');
                return rtf.format(diffYears, 'year');
            }

            return date.toLocaleDateString(getLocale());
        }

        function getGaugePosition(pushedAt) {
            const pushedDate = new Date(pushedAt);
            if (Number.isNaN(pushedDate.getTime())) {
                return null;
            }

            const ageDays = Math.max(0, (Date.now() - pushedDate.getTime()) / (1000 * 60 * 60 * 24));
            return Math.min(100, Math.max(0, Math.log10(ageDays + 1) / Math.log10(366) * 100));
        }

        function renderRepoUpdate(target, state, pushedAt = '') {
            if (!target) {
                return;
            }

            const gauge = target.closest('[data-github-repo]')?.querySelector('[data-repo-gauge]');
            const gaugePosition = state === 'ready' && pushedAt ? getGaugePosition(pushedAt) : null;

            if (gauge) {
                gauge.dataset.repoGaugeState = gaugePosition === null ? state : 'ready';
                if (gaugePosition === null) {
                    gauge.style.removeProperty('--gauge-pos');
                } else {
                    gauge.style.setProperty('--gauge-pos', `${gaugePosition.toFixed(2)}%`);
                }
            }

            target.dataset.repoUpdateState = state;
            if (pushedAt) {
                target.dataset.repoUpdatedAt = pushedAt;
            } else {
                delete target.dataset.repoUpdatedAt;
            }
            target.textContent = getRepoUpdateLabel(target, state, pushedAt);
        }

        function renderRepoRelease(target, state, release = '') {
            if (!target) {
                return;
            }

            target.dataset.repoReleaseState = state;
            if (release) {
                target.dataset.repoReleaseValue = release;
            } else {
                delete target.dataset.repoReleaseValue;
            }
            target.textContent = getRepoReleaseLabel(target, state, release);
        }

        function refreshLabels() {
            document.querySelectorAll('[data-repo-update]').forEach(target => {
                renderRepoUpdate(target, target.dataset.repoUpdateState || 'loading', target.dataset.repoUpdatedAt || '');
            });

            document.querySelectorAll('[data-repo-release]').forEach(target => {
                renderRepoRelease(target, target.dataset.repoReleaseState || 'loading', target.dataset.repoReleaseValue || '');
            });
        }

        function getCache() {
            try {
                const raw = localStorage.getItem(cacheKey);
                return raw ? JSON.parse(raw) : {};
            } catch {
                return {};
            }
        }

        function setCache(cache) {
            try {
                localStorage.setItem(cacheKey, JSON.stringify(cache));
            } catch {}
        }

        async function fetchRepoMeta(repo) {
            const repoRequest = fetch(`https://api.github.com/repos/${repo}`, {
                headers: {
                    'Accept': 'application/vnd.github+json',
                },
            });
            const releaseRequest = fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
                headers: {
                    'Accept': 'application/vnd.github+json',
                },
            });

            const [repoResponse, releaseResponse] = await Promise.all([repoRequest, releaseRequest]);

            if (!repoResponse.ok) {
                throw new Error(`GitHub API request failed for ${repo}`);
            }

            const repoData = await repoResponse.json();
            let release = '';
            let releaseState = 'missing';

            if (releaseResponse.ok) {
                const releaseData = await releaseResponse.json();
                release = releaseData?.tag_name || releaseData?.name || '';
                releaseState = release ? 'ready' : 'missing';
            } else if (releaseResponse.status !== 404) {
                releaseState = 'unavailable';
            }

            return {
                pushedAt: repoData?.pushed_at || '',
                release,
                releaseState,
            };
        }

        async function load() {
            const repoCards = getRepoCards();
            if (!repoCards.length) {
                return;
            }

            const cache = getCache();
            const now = Date.now();

            await Promise.all([...repoCards].map(async card => {
                const repo = card.dataset.githubRepo;
                const updateTarget = card.querySelector('[data-repo-update]');
                const releaseTarget = card.querySelector('[data-repo-release]');

                if (!repo || !updateTarget || !releaseTarget) {
                    return;
                }

                const cachedEntry = cache[repo];
                if (cachedEntry?.pushedAt && cachedEntry?.fetchedAt && (now - cachedEntry.fetchedAt) < cacheTtl) {
                    renderRepoUpdate(updateTarget, 'ready', cachedEntry.pushedAt);
                    renderRepoRelease(releaseTarget, cachedEntry.releaseState || 'missing', cachedEntry.release || '');
                    return;
                }

                renderRepoUpdate(updateTarget, 'loading');
                renderRepoRelease(releaseTarget, 'loading');

                try {
                    const meta = await fetchRepoMeta(repo);
                    if (!meta.pushedAt) {
                        throw new Error(`Missing pushed_at for ${repo}`);
                    }

                    cache[repo] = {
                        pushedAt: meta.pushedAt,
                        release: meta.release,
                        releaseState: meta.releaseState,
                        fetchedAt: Date.now(),
                    };
                    setCache(cache);
                    renderRepoUpdate(updateTarget, 'ready', meta.pushedAt);
                    renderRepoRelease(releaseTarget, meta.releaseState, meta.release);
                } catch {
                    renderRepoUpdate(updateTarget, cachedEntry?.pushedAt ? 'ready' : 'unavailable', cachedEntry?.pushedAt || '');
                    renderRepoRelease(releaseTarget, cachedEntry?.releaseState || 'unavailable', cachedEntry?.release || '');
                }
            }));
        }

        return {
            load,
            refreshLabels,
        };
    }

    global.createGithubProjectMeta = createGithubProjectMeta;
})(typeof window !== 'undefined' ? window : globalThis);
