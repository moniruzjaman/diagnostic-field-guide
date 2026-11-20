/* ============================================================
   Share module — cross-platform sharing with rich previews
   URL is derived from the current location, so the app works
   from any origin (localhost, GitHub Pages, file preview).
   ============================================================ */

(function () {
    const BASE_URL = (location.origin && location.origin !== 'null')
        ? (location.origin + location.pathname.replace(/[^/]*$/, ''))
        : '';

    const SHARE = {
        url: BASE_URL,
        title: 'উদ্ভিদ রোগনির্ণয় ফিল্ড গাইড — বাংলা ই-বুক',
        text: 'ফসলের সমস্যা নির্ণয় ও ব্যবস্থাপনার সুপারিশ প্রণয়নের বাংলা নির্দেশিকা। অফলাইনে পড়া ও শোনা যায়।',
        hashtags: ['কৃষি', 'Plantwise', 'CABI', 'বাংলা', 'agriculture', 'PlantHealth'],

        chapterUrl(chapterId) {
            return chapterId ? `${BASE_URL}#${chapterId}` : BASE_URL;
        },

        buildUrl(platform) {
            const url = this.url;
            const u = encodeURIComponent(url);
            const t = encodeURIComponent(this.title);
            const tx = encodeURIComponent(this.text);
            const ht = this.hashtags.join(',');
            switch (platform) {
                case 'whatsapp':
                    return `https://wa.me/?text=${encodeURIComponent(this.title + '\n' + this.text + '\n' + url)}`;
                case 'messenger':
                    return `https://www.facebook.com/dialog/send?app_id=145634995501895&display=popup&link=${u}&redirect_uri=${u}`;
                case 'facebook':
                    return `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`;
                case 'linkedin':
                    return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
                case 'twitter':
                    return `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(this.title + ' — ' + this.text)}&hashtags=${ht}`;
                case 'telegram':
                    return `https://t.me/share/url?url=${u}&text=${encodeURIComponent(this.title)}`;
                case 'email':
                    return `mailto:?subject=${t}&body=${encodeURIComponent(this.text + '\n\n' + url)}`;
                default:
                    return url;
            }
        },

        openPopup(url, w = 600, h = 600) {
            const left = (screen.width / 2) - (w / 2);
            const top = (screen.height / 2) - (h / 2) - 50;
            return window.open(url, '_blank',
                `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,resizable=yes,scrollbars=yes`);
        },

        async copyLink() {
            try {
                await navigator.clipboard.writeText(this.url);
                return true;
            } catch (e) {
                const ta = document.createElement('textarea');
                ta.value = this.url;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                let ok = false;
                try { ok = document.execCommand('copy'); } catch (_) {}
                document.body.removeChild(ta);
                return ok;
            }
        },

        async nativeShare() {
            if (!navigator.share) return false;
            try {
                await navigator.share({ title: this.title, text: this.text, url: this.url });
                return true;
            } catch (e) {
                if (e.name === 'AbortError') return true;
                console.warn('Native share failed:', e);
                return false;
            }
        },

        async share(platform, opts = {}) {
            this.url = this.chapterUrl(opts.chapter);
            switch (platform) {
                case 'whatsapp':
                case 'messenger':
                case 'facebook':
                case 'linkedin':
                case 'twitter':
                case 'telegram':
                    this.openPopup(this.buildUrl(platform));
                    return true;
                case 'email':
                    window.location.href = this.buildUrl('email');
                    return true;
                case 'copy':
                    return await this.copyLink();
                case 'native':
                    return await this.nativeShare();
                default:
                    return false;
            }
        },

        isNativeSupported() {
            return !!navigator.share;
        }
    };

    window.EBOOK_SHARE = SHARE;
})();
