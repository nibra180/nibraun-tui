(function (global) {
    /**
     * Entries of the work index. `priority` sets the order (high first); the
     * printed number is derived from that position, not stored here.
     * `kind` is the short mono label in the platform column.
     */
    global.siteProjects = [
        {
            priority: 100,
            name: 'Shopware Admin Toolbar',
            kind: 'Shopware 6',
            href: 'https://github.com/WariKoda/WakoPluginAdminToolbar',
            repo: 'WariKoda/WakoPluginAdminToolbar',
            descriptionKey: 'work.adminToolbar.description',
            owner: 'WariKoda',
            lead: '@nibra180',
            leadHref: 'https://github.com/nibra180',
        },
        {
            priority: 90,
            name: 'Drift File Sync',
            kind: 'Go · TUI',
            href: 'https://github.com/WariKoda/drift',
            repo: 'WariKoda/drift',
            descriptionKey: 'work.drift.description',
            owner: 'WariKoda',
            lead: '@nibra180',
            leadHref: 'https://github.com/nibra180',
        },
        {
            priority: 80,
            name: 'Encrypted Focus Journal',
            kind: 'Flutter',
            href: 'https://github.com/WariKoda/FocusJournal',
            repo: 'WariKoda/FocusJournal',
            descriptionKey: 'work.focusJournal.description',
            owner: 'WariKoda',
            lead: '@bdgraue',
            leadHref: 'https://github.com/bdgraue',
        },
    ];
})(typeof window !== 'undefined' ? window : globalThis);
