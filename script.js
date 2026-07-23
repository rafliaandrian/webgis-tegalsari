document.addEventListener('DOMContentLoaded', function () {
    // ===== KONFIGURASI PETA DAN DATA =====
    // Renderer peta 100% pakai MapLibre GL JS (open-source, tanpa lock-in ke Mapbox).
    // Data administrasi & jalan sekarang dimuat dari GeoJSON lokal (bukan tileset Mapbox akun
    // orang lain lagi) — taruh file-nya di ./source/data/, pola sama seperti layer lain (bangunan,
    // perkebunan, batas-rt, dst).

    // ===== BASEMAP — semua via MapLibre, tanpa style Mapbox =====
    const ESRI_SATELLITE_STYLE = {
        version: 8,
        sources: {
            'esri-satellite': {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                attribution: 'Tiles © Esri'
            }
        },
        layers: [{ id: 'satellite-layer', type: 'raster', source: 'esri-satellite' }]
    };
    const BASEMAP_STYLES = {
        'satellite-streets-v12': ESRI_SATELLITE_STYLE,
        'streets-v12': 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        'outdoors-v12': {
            version: 8,
            sources: {
                'opentopo': {
                    type: 'raster',
                    tiles: [
                        'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
                        'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
                        'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'
                    ],
                    tileSize: 256,
                    attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
                }
            },
            layers: [{ id: 'opentopo-layer', type: 'raster', source: 'opentopo' }]
        },
        'light-v11': 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        'dark-v11': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        'navigation-day-v1': 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        'navigation-night-v1': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    };

    // Peta langsung dibuka di lokasi studi, tanpa animasi globe/zoom sinematik.
    const finalLocation = { center: [110.174, -7.5515], zoom: 16.7, pitch: 50, bearing: 0 };
    const cssTransitionDuration = 350;

    const downloadBtn = document.querySelector('.download-btn');
    const downloadIcon = downloadBtn.querySelector('i');
    const downloadTextSpan = downloadBtn.querySelector('span');

    const videoData = [
        {
            title: 'Cinematic Drone View of Tegalsari Area',
            description: 'Video survei udara menggunakan drone di wilayah Tegalsari.',
            driveFileId: '13u2MFvdr9liGAAs1_OTuSbZQv-bIyzop',
            filename: 'cinematic_tegalsari_drone_view.mp4',
            thumbnailUrl: 'https://drive.google.com/thumbnail?id=13u2MFvdr9liGAAs1_OTuSbZQv-bIyzop&sz=w1000'
        }
    ];

    const MAP_CONFIG = {
        'administrasi': { type: 'geojson', sourceId: 'administrasi-source', geojsonUrl: './source/data/administrasi_tegalsari.geojson', layerId: 'administrasi-layer' },
        'penggunaan-lahan': { type: 'geojson', sourceId: 'penggunaan-lahan-source', geojsonUrl: './source/data/penggunaan_lahan_tegalsari.geojson', layerId: 'penggunaan-lahan-layer', legendTitle: 'Penggunaan Lahan', property: 'KETERANGAN', items: {
    'Tempat Tinggal':                 { type: 'fill', color: '#e8636b' },
    'Pekarangan':                     { type: 'fill', color: '#a8a8a8' },
    'Vegetasi Non Budidaya Lainnya':  { type: 'fill', color: '#7fc98a' },
    'Perkebunan':                     { type: 'fill', color: '#4a9d5c' },
    'Lahan Terbuka (Tanah Kosong)':   { type: 'fill', color: '#d9c9a3' },
    'Sawah':                          { type: 'fill', color: '#7ea8d8' },
    'Hutan Rakyat':                   { type: 'fill', color: '#2e6b3e' },
    'Rumput':                         { type: 'fill', color: '#b9d96b' },
    'Kebun Campur':                   { type: 'fill', color: '#5fae6a' },
    'Sosial Budaya':                  { type: 'fill', color: '#c76e8a' },
    'Pendidikan':                     { type: 'fill', color: '#4d94c0' },
    'Perkantoran':                    { type: 'fill', color: '#2f6f95' },
    'Perdagangan dan Jasa':           { type: 'fill', color: '#d99a3d' },
    'Perikanan air tawar':            { type: 'fill', color: '#5fd0d9' },
    'Peribadatan':                    { type: 'fill', color: '#8a4a9e' },
    'Tegalan/Ladang':                 { type: 'fill', color: '#c9a227' },
    'Transportasi':                   { type: 'fill', color: '#6b6b6b' },
    'Semak Belukar':                  { type: 'fill', color: '#9fb26a' }
} },
'bangunan': { type: 'geojson', sourceId: 'bangunan-source', geojsonUrl: './source/data/bangunan_tegalsari.geojson', layerId: 'bangunan-layer', legendTitle: 'Bangunan', items: { 'Area Bangunan': { type: 'fill-outline', color: '#E67E22' } } },        'jalan': { type: 'geojson', sourceId: 'jalan-source', geojsonUrl: './source/data/jalan_tegalsari.geojson', layerId: 'jalan-layer', legendTitle: 'Jalan', property: 'KETERANGAN', items: { 'Jalan Lokal': { type: 'line', color: '#E65100', width: 2.5 }, 'Jalan Setapak': { type: 'line', color: '#FB8C00', width: 2 } } },
'orientasi-bangunan': {
    type: 'geojson',
    sourceId: 'orientasi-bangunan-source',
    geojsonUrl: './source/data/orientasi_bangunan_tegalsari.geojson',
    layerId: 'orientasi-bangunan-layer'
},

'perkebunan': {
    type: 'geojson',
    sourceId: 'perkebunan-source',
    geojsonUrl: './source/data/perkebunan_tegalsari.geojson',
    layerId: 'perkebunan-layer',
    legendTitle: 'Jenis Perkebunan',
    property: 'JENIS_KEBUN',
    items: {
        'Kebun Campuran Milik Warga': { type: 'fill', color: '#5a6b47' },
        'Kebun Campuran Milik Desa':  { type: 'fill', color: '#8a9870' },
        'Kebun Tebu Milik Desa':      { type: 'fill', color: '#c8a05a' },
        'Kebun Ketela Milik Warga':   { type: 'fill', color: '#b5737a' },
        'Kebun Ketela Milik Desa':    { type: 'fill', color: '#d4a0a6' },
        'Kebun Kacang Panjang Milik Warga': { type: 'fill', color: '#7db3c8' },
        'Sawah Milik Warga (Padi)':   { type: 'fill', color: '#a9cce2' }
    }
},

// Batas RT — GeoJSON lokal (bukan tileset Mapbox), datanya kecil (5 poligon) jadi langsung di-load dari file.
        // Setiap poligon RT sudah bawa atribut rekap pendidikan (tk/sd/smp/sma) & pekerjaan, dipakai buat popup saat diklik.
        'batas-rt': { type: 'geojson', sourceId: 'batas-rt-source', geojsonUrl: './source/data/batas_rt.geojson', layerId: 'batas-rt-layer', legendTitle: 'Pendidikan per RT', property: 'rt_label', items: { 'RT 1': { type: 'fill', color: '#8a9870' }, 'RT 2': { type: 'fill', color: '#c8a05a' }, 'RT 3': { type: 'fill', color: '#b5737a' }, 'RT 4': { type: 'fill', color: '#5a8fa8' }, 'RT 5': { type: 'fill', color: '#7db3c8' } } }
    };
    // --- PENTING ---
    // 'bangunan' di atas masih placeholder. Semua nama properti di bawah ini (material_b, ket_lantai,
    // sanitasi, jenis_peke, jumlah_lan, paud/sd/smp/sma) HANYA akan cocok kalau tileset yang dipasang
    // di sini adalah hasil upload bangunan_tegalsari.geojson (skema Excel baru). Kalau masih menunjuk
    // ke tileset lama (skema lama: nama_pemil, ket_fentil, dst), semua chart di bawah akan tampil
    // "Lainnya" / kosong karena nama properti tidak ketemu.

    // State Management
    let chartDataCache = null, chartInstances = {}, isDataFetching = false;
    let isDataViewInitialized = false;
    let currentPage = 1;
    const photosPerPage = 8;
    let fullFilteredPhotoList = [];
    let currentLightboxPhotoList = [];
    let currentLightboxIndex = 0;
    const layerVisibilityState = {};
    Object.entries(MAP_CONFIG).forEach(([key, config]) => {
        if (config.items) {
            layerVisibilityState[key] = {};
            Object.keys(config.items).forEach(itemKey => {
                layerVisibilityState[key][itemKey] = true;
            });
        }
    });
    // Elemen DOM
    const introOverlay = document.getElementById('intro-overlay'), startBtn = document.getElementById('start-btn'), appContainer = document.getElementById('app-container'), mapSection = document.getElementById('map-section'), mapElement = mapSection.querySelector('#map'), mapBackground = document.getElementById('map-background'), resetToIntroBtn = document.getElementById('reset-to-intro-btn'), administrasiToggle = document.getElementById('toggle-administrasi-layer'), areaSelect = document.getElementById('area-select'), jalanToggle = document.getElementById('toggle-jalan-layer'), orientasiToggle = document.getElementById('toggle-orientasi-layer'), legendContainer = document.getElementById('legend-container'), basemapLabelToggle = document.getElementById('toggle-basemap-labels');
    mapBackground.appendChild(mapElement);
    const map = new maplibregl.Map({ container: 'map', projection: 'mercator', style: ESRI_SATELLITE_STYLE, ...finalLocation, antialias: true, attributionControl: false, preserveDrawingBuffer: true });
    window._map = map; // expose untuk script tambahan (koordinat live, dsb.)

    function addCustomDataLayers() {
    const plConfig = MAP_CONFIG['penggunaan-lahan'];
    if (plConfig.geojsonUrl && !map.getSource(plConfig.sourceId)) { map.addSource(plConfig.sourceId, { type: 'geojson', data: plConfig.geojsonUrl }); }
    if (map.getSource(plConfig.sourceId) && !map.getLayer(plConfig.layerId)) {
        map.addLayer({ id: plConfig.layerId, type: 'fill', source: plConfig.sourceId, layout: { visibility: 'none' }, paint: { 'fill-color': ['match', ['get', plConfig.property], ...Object.entries(plConfig.items).flatMap(([k, v]) => [k, v.color]), '#ccc'], 'fill-opacity': 0.75 } });
        map.addLayer({ id: plConfig.layerId + '-outline', type: 'line', source: plConfig.sourceId, layout: { visibility: 'none' }, paint: { 'line-color': '#000', 'line-width': 0.5, 'line-opacity': 0.5 } });
    }

    

    // Bangunan (persil) — GeoJSON, layer 2D
    const bgnConfig = MAP_CONFIG['bangunan'];
    if (bgnConfig.geojsonUrl && !map.getSource(bgnConfig.sourceId)) { map.addSource(bgnConfig.sourceId, { type: 'geojson', data: bgnConfig.geojsonUrl }); }
    if (map.getSource(bgnConfig.sourceId) && !map.getLayer(bgnConfig.layerId)) {
        map.addLayer({ id: bgnConfig.layerId, type: 'fill', source: bgnConfig.sourceId, layout: { visibility: 'none' }, paint: { 'fill-color': bgnConfig.items['Area Bangunan'].color, 'fill-opacity': 0.7, 'fill-outline-color': bgnConfig.items['Area Bangunan'].color } });
    }

    // Jalan — GeoJSON lokal
    const jlnConfig = MAP_CONFIG['jalan'];
    if (jlnConfig.geojsonUrl && !map.getSource(jlnConfig.sourceId)) { map.addSource(jlnConfig.sourceId, { type: 'geojson', data: jlnConfig.geojsonUrl }); }
    if (map.getSource(jlnConfig.sourceId) && !map.getLayer(jlnConfig.layerId)) {
        map.addLayer({ id: jlnConfig.layerId, type: 'line', source: jlnConfig.sourceId, layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': ['match', ['get', jlnConfig.property], ...Object.entries(jlnConfig.items).flatMap(([k, v]) => [k, v.color]), '#ccc'], 'line-width': ['match', ['get', jlnConfig.property], ...Object.entries(jlnConfig.items).flatMap(([k, v]) => [k, v.width]), 2] } });
    }

    // Administrasi — GeoJSON lokal
    const admConfig = MAP_CONFIG['administrasi'];
    if (admConfig.geojsonUrl && !map.getSource(admConfig.sourceId)) { map.addSource(admConfig.sourceId, { type: 'geojson', data: admConfig.geojsonUrl }); }
    if (map.getSource(admConfig.sourceId) && !map.getLayer(admConfig.layerId)) {
        map.addLayer({ id: admConfig.layerId, type: 'line', source: admConfig.sourceId, layout: { visibility: 'none' }, paint: { 'line-color': '#f90', 'line-width': 2.5 } });
    }

    // Bangunan 3D (extrusion)
    if (map.getSource(bgnConfig.sourceId) && !map.getLayer('bangunan-3d-layer')) {
        map.addLayer({ 'id': 'bangunan-3d-layer', 'type': 'fill-extrusion', 'source': bgnConfig.sourceId, 'layout': { 'visibility': 'none' }, 'paint': { 'fill-extrusion-color': '#E67E22', 'fill-extrusion-opacity': 0.8, 'fill-extrusion-height': ['interpolate', ['linear'], ['get', 'jumlah_lan'], 1, 5, 2, 10, 3, 15], 'fill-extrusion-base': 0 } });
    }

    // Orientasi Bangunan — titik panah arah hadap
    if (!map.hasImage('arrow-orientasi')) { map.addImage('arrow-orientasi', createArrowIcon()); }
    const oriConfig = MAP_CONFIG['orientasi-bangunan'];
    if (oriConfig && !map.getSource(oriConfig.sourceId)) { map.addSource(oriConfig.sourceId, { type: 'geojson', data: oriConfig.geojsonUrl }); }
    if (oriConfig && map.getSource(oriConfig.sourceId) && !map.getLayer(oriConfig.layerId)) {
        map.addLayer({
            id: oriConfig.layerId, type: 'symbol', source: oriConfig.sourceId,
            layout: { visibility: 'none', 'icon-image': 'arrow-orientasi', 'icon-size': 0.55, 'icon-rotate': ['get', 'arah_hadap_deg'], 'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true }
        });
    }

// === PERKEBUNAN ===
        const kebunConfig = MAP_CONFIG['perkebunan'];
        if (kebunConfig && !map.getSource(kebunConfig.sourceId)) {
            map.addSource(kebunConfig.sourceId, { type: 'geojson', data: kebunConfig.geojsonUrl });
        }
        if (kebunConfig && map.getSource(kebunConfig.sourceId) && !map.getLayer(kebunConfig.layerId)) {
            map.addLayer({
                id: kebunConfig.layerId,
                type: 'fill',
                source: kebunConfig.sourceId,
                layout: { visibility: 'none' },
                paint: {
                    'fill-color': [
                        'match', ['get', 'JENIS_KEBUN'],
                        'Kebun Campuran Milik Warga', '#5a6b47',
                        'Kebun Campuran Milik Desa',  '#8a9870',
                        'Kebun Tebu Milik Desa',      '#c8a05a',
                        'Kebun Ketela Milik Warga',   '#b5737a',
                        'Kebun Ketela Milik Desa',    '#d4a0a6',
                        'Kebun Kacang Panjang Milik Warga', '#7db3c8',
                        'Sawah Milik Warga (Padi)',   '#a9cce2',
                        '#808080'
                    ],
                    'fill-opacity': 0.75,
                    'fill-outline-color': 'rgba(0,0,0,0.3)'
                }
            });
            map.on('click', kebunConfig.layerId, (e) => {
                const p = e.features[0].properties;
                new maplibregl.Popup({ closeButton: true, maxWidth: '260px' })
                    .setLngLat(e.lngLat)
                    .setHTML(`
                        <div class="popup-content">
                            <div class="popup-title"><i class="fa-solid fa-seedling"></i> Data Perkebunan</div>
                            <div class="popup-row"><span>Jenis</span><strong>${p.JENIS_KEBUN || '-'}</strong></div>
                            <div class="popup-row"><span>Luas</span><strong>${p.LUAS_HA ? p.LUAS_HA + ' Ha' : '-'}</strong></div>
                            <div class="popup-row"><span>Luas (m²)</span><strong>${p.LUAS_M2 ? p.LUAS_M2 + ' m²' : '-'}</strong></div>
                        </div>`)
                    .addTo(map);
            });
            map.on('mouseenter', kebunConfig.layerId, () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', kebunConfig.layerId, () => map.getCanvas().style.cursor = '');
        }

        // Batas RT — sumbernya GeoJSON lokal ...  ← baris ini sudah ada, jangan dihapus
    // Batas RT
    const rtConfig = MAP_CONFIG['batas-rt'];
    if (rtConfig && !map.getSource(rtConfig.sourceId)) { map.addSource(rtConfig.sourceId, { type: 'geojson', data: rtConfig.geojsonUrl }); }
    if (rtConfig && map.getSource(rtConfig.sourceId) && !map.getLayer(rtConfig.layerId)) {
        map.addLayer({ id: rtConfig.layerId, type: 'fill', source: rtConfig.sourceId, layout: { visibility: 'none' }, paint: { 'fill-color': ['match', ['get', rtConfig.property], ...Object.entries(rtConfig.items).flatMap(([k, v]) => [k, v.color]), '#ccc'], 'fill-opacity': 0.55 } });
        map.addLayer({ id: rtConfig.layerId + '-outline', type: 'line', source: rtConfig.sourceId, layout: { visibility: 'none' }, paint: { 'line-color': '#3d4a32', 'line-width': 1.5, 'line-opacity': 0.8 } });
    }
}

map.on('load', () => {
    const safeCall = (fn, label) => { try { fn(); } catch (err) { console.error(`Gagal menjalankan ${label}:`, err); } };
    safeCall(disableMapInteraction, 'disableMapInteraction');
    safeCall(hideMapLabels, 'hideMapLabels');
    safeCall(addCustomDataLayers, 'addCustomDataLayers');
    safeCall(initializeControls, 'initializeControls');
    safeCall(setupDownloadLightbox, 'setupDownloadLightbox');
    safeCall(setupVideoLightbox, 'setupVideoLightbox');
    safeCall(setupLiveCoordDisplay, 'setupLiveCoordDisplay');
    safeCall(setupRTPopup, 'setupRTPopup');
    safeCall(setupBangunanPopup, 'setupBangunanPopup');
});
    function createArrowIcon(size = 32, color = '#E67E22') {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.translate(size / 2, size / 2);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.42);
    ctx.lineTo(size * 0.28, size * 0.30);
    ctx.lineTo(0, size * 0.14);
    ctx.lineTo(-size * 0.28, size * 0.30);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#3d2a10';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();
    // Ambil ImageData eksplisit (bukan canvas mentah) supaya ukurannya pasti
    // konsisten untuk map.addImage(), tidak peduli zoom/DPI browser.
    // Ini menghindari "RangeError: mismatched image size" dari MapLibre GL.
    const imageData = ctx.getImageData(0, 0, size, size);
    return { width: size, height: size, data: imageData.data };
}
    // ===== Popup klik untuk poligon Batas RT — rekap pendidikan (+ pekerjaan) per RT =====
    function setupRTPopup() {
        const rtConfig = MAP_CONFIG['batas-rt'];
        // Orientasi Bangunan — layer titik panah arah hadap, visibilitas dikontrol checkbox terpisah (BUKAN oleh klik persil)
        if (!map.hasImage('arrow-orientasi')) { map.addImage('arrow-orientasi', createArrowIcon()); }
        const oriConfig = MAP_CONFIG['orientasi-bangunan'];
        if (oriConfig && !map.getSource(oriConfig.sourceId)) { map.addSource(oriConfig.sourceId, { type: 'geojson', data: oriConfig.geojsonUrl }); }
        if (oriConfig && map.getSource(oriConfig.sourceId) && !map.getLayer(oriConfig.layerId)) {
            map.addLayer({
                id: oriConfig.layerId,
                type: 'symbol',
                source: oriConfig.sourceId,
                layout: {
                    visibility: 'none',
                    'icon-image': 'arrow-orientasi',
                    'icon-size': 0.55,
                    'icon-rotate': ['get', 'arah_hadap_deg'],
                    'icon-rotation-alignment': 'map',
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true
                }
            });
        }
        if (!rtConfig) return;
        map.on('click', rtConfig.layerId, (e) => {
            if (!e.features || !e.features.length) return;
            const p = e.features[0].properties;
            const totalAnak = (Number(p.tk) || 0) + (Number(p.sd) || 0) + (Number(p.smp) || 0) + (Number(p.sma) || 0);
            const html = `
                <div style="font-family:'Poppins',sans-serif; min-width:200px;">
                    <div style="font-weight:700; font-size:14px; margin-bottom:6px; color:#3d4a32;">${p.rt_label} · Dusun ${p.dusun || 'Tegalsari'}</div>
                    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.03em; color:#8a9870; margin:8px 0 4px;">Pendidikan Anak</div>
                    <table style="width:100%; font-size:12.5px; border-collapse:collapse;">
                        <tr><td style="padding:2px 0;">TK/PAUD</td><td style="text-align:right; font-weight:600;">${p.tk}</td></tr>
                        <tr><td style="padding:2px 0;">SD</td><td style="text-align:right; font-weight:600;">${p.sd}</td></tr>
                        <tr><td style="padding:2px 0;">SMP</td><td style="text-align:right; font-weight:600;">${p.smp}</td></tr>
                        <tr><td style="padding:2px 0;">SMA</td><td style="text-align:right; font-weight:600;">${p.sma}</td></tr>
                        <tr style="border-top:1px solid #ddd;"><td style="padding:4px 0 0; font-weight:700;">Total Anak</td><td style="text-align:right; font-weight:700; padding-top:4px;">${totalAnak}</td></tr>
                    </table>
                    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.03em; color:#8a9870; margin:10px 0 4px;">Pekerjaan Dominan</div>
                    <table style="width:100%; font-size:12.5px; border-collapse:collapse;">
                        <tr><td style="padding:2px 0;">Karyawan Swasta</td><td style="text-align:right; font-weight:600;">${p.karyawan_swasta}</td></tr>
                        <tr><td style="padding:2px 0;">Pedagang</td><td style="text-align:right; font-weight:600;">${p.pedagang}</td></tr>
                        <tr><td style="padding:2px 0;">Buruh Bangunan</td><td style="text-align:right; font-weight:600;">${p.buruh_bangunan}</td></tr>
                        <tr><td style="padding:2px 0;">Buruh Tani</td><td style="text-align:right; font-weight:600;">${p.buruh_tani}</td></tr>
                    </table>
                </div>`;
            new maplibregl.Popup({ closeButton: true, maxWidth: '260px' }).setLngLat(e.lngLat).setHTML(html).addTo(map);
        });
        map.on('mouseenter', rtConfig.layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', rtConfig.layerId, () => { map.getCanvas().style.cursor = ''; });
    }

    function setupBangunanPopup() {
    const bgnConfig = MAP_CONFIG['bangunan'];
    map.on('click', bgnConfig.layerId, (e) => {
        if (!e.features || !e.features.length) return;
        const p = e.features[0].properties;
        const html = `
            <div style="font-family:'Poppins',sans-serif; min-width:200px;">
                <div style="font-weight:700; font-size:14px; margin-bottom:6px; color:#3d4a32;">Bangunan #${p.kode_bangunan ?? ''} · RT ${p.rt}/RW ${p.rw}</div>
                <table style="width:100%; font-size:12.5px; border-collapse:collapse;">
                    <tr><td style="padding:2px 0;">Fungsi</td><td style="text-align:right; font-weight:600;">${p.fungsi_b}</td></tr>
                    <tr><td style="padding:2px 0;">Material Dinding</td><td style="text-align:right; font-weight:600;">${p.material_b}</td></tr>
                    <tr><td style="padding:2px 0;">Jenis Lantai</td><td style="text-align:right; font-weight:600;">${p.ket_lantai}</td></tr>
                    <tr><td style="padding:2px 0;">Sanitasi</td><td style="text-align:right; font-weight:600;">${p.sanitasi}</td></tr>
                    <tr><td style="padding:2px 0;">Kelas Hunian</td><td style="text-align:right; font-weight:600;">${p.kelas_layak}</td></tr>
                </table>
            </div>`;
        new maplibregl.Popup({ closeButton: true, maxWidth: '260px' }).setLngLat(e.lngLat).setHTML(html).addTo(map);
    });
    map.on('mouseenter', bgnConfig.layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', bgnConfig.layerId, () => { map.getCanvas().style.cursor = ''; });
}

    // ===== PROSES DATA — properti disesuaikan dengan skema Excel/GeoJSON baru =====
    function processAllData(buildingFeatures, landUseFeatures) {
        const uniqueLandUseFeatures = []; const seenLandUseIds = new Set();
        landUseFeatures.forEach(feature => { const uniqueId = feature.properties.OBJECTID_1; if (uniqueId !== undefined && !seenLandUseIds.has(uniqueId)) { seenLandUseIds.add(uniqueId); uniqueLandUseFeatures.push(feature); } });

        const uniqueBuildingFeatures = []; const seenBuildingIds = new Set();
        buildingFeatures.forEach(feature => { const uniqueId = feature.properties.OBJECTID_1; if (uniqueId !== undefined && !seenBuildingIds.has(uniqueId)) { seenBuildingIds.add(uniqueId); uniqueBuildingFeatures.push(feature); } });

        // ===== FOTO — dimuat sekali dari foto_data.js (variabel global FOTO_DATA) =====
        // Pastikan <script src="./source/data/foto_data.js"></script> ditaruh di studio.html
        // SEBELUM <script src="script.js">, supaya FOTO_DATA sudah ada saat baris ini jalan.
        const allPhotos = [];
        if (typeof FOTO_DATA !== 'undefined' && Array.isArray(FOTO_DATA)) {
            FOTO_DATA.forEach(f => {
                allPhotos.push({
                    originalUrl: f.url,
                    thumbnailUrl: f.thumb,
                    owner: f.coord,
                    address: f.label,
                    type: f.type || 'bangunan'
                });
            });
        }

        let totalAnak = 0, bangunanLayak = 0;
        const jobs = {}, materials = {}, floors = {}, sanitations = {}, buildingFunctions = {}, internetAccess = {};
        const schooling = { 'PAUD': 0, 'SD': 0, 'SMP': 0, 'SMA': 0 };

        uniqueBuildingFeatures.forEach(f => {
            const props = f.properties;

            totalAnak += (props.paud || 0) + (props.sd || 0) + (props.smp || 0) + (props.sma || 0);

            const job = props.jenis_peke || 'Lainnya'; jobs[job] = (jobs[job] || 0) + 1;
            const material = props.material_b || 'Lainnya'; materials[material] = (materials[material] || 0) + 1;
            const floor = props.ket_lantai || 'Lainnya'; floors[floor] = (floors[floor] || 0) + 1;
            const sanitasi = props.sanitasi || 'Lainnya'; sanitations[sanitasi] = (sanitations[sanitasi] || 0) + 1;
            const fungsi = props.fungsi_b || 'Lainnya';
            buildingFunctions[fungsi] = (buildingFunctions[fungsi] || 0) + 1;

            const internet = props.internet || 'Lainnya';
            internetAccess[internet] = (internetAccess[internet] || 0) + 1;
            schooling['PAUD'] += props.paud || 0;
            schooling['SD'] += props.sd || 0;
            schooling['SMP'] += props.smp || 0;
            schooling['SMA'] += props.sma || 0;
            if ((props.material_b === 'Tembok Bata') && (props.ket_lantai === 'Keramik Ubin') && (props.sanitasi === 'Milik Sendiri')) {
                bangunanLayak++;
            }
        });

        const sortObject = (obj) => Object.fromEntries(Object.entries(obj).sort(([, a], [, b]) => b - a));
        const sortedJobs = sortObject(jobs);
        const dominantJob = Object.keys(sortedJobs)[0] || '-';
        const dominantEducation = Object.keys(schooling).reduce((a, b) => schooling[a] > schooling[b] ? a : b, '-');
        const sortedLandUse = Object.entries(uniqueLandUseFeatures.reduce((acc, f) => { const type = f.properties.KETERANGAN || 'Lainnya'; acc[type] = (acc[type] || 0) + (f.properties.Luas_Ha || 0); return acc; }, {})).sort(([, a], [, b]) => b - a);

        return {
            summary: {
                totalBangunan: uniqueBuildingFeatures.length,
                totalLuasLahan: uniqueLandUseFeatures.reduce((sum, f) => sum + (f.properties.Luas_Ha || 0), 0),
                totalAnak,
                persentaseKelayakan: uniqueBuildingFeatures.length > 0 ? (bangunanLayak / uniqueBuildingFeatures.length) * 100 : 0,
                dominantJob, dominantEducation
            },
            charts: {
                landUse: { labels: sortedLandUse.map(item => item[0]), data: sortedLandUse.map(item => item[1]) },
                jobs: { labels: Object.keys(sortedJobs), data: Object.values(sortedJobs) },
                materials: { labels: Object.keys(sortObject(materials)), data: Object.values(sortObject(materials)) },
                floors: { labels: Object.keys(sortObject(floors)), data: Object.values(sortObject(floors)) },
                sanitations: { labels: Object.keys(sortObject(sanitations)), data: Object.values(sortObject(sanitations)) },
                functions: {
                    labels: Object.keys(sortObject(buildingFunctions)),
                    data: Object.values(sortObject(buildingFunctions))
                },
                internet: {
                    labels: Object.keys(sortObject(internetAccess)),
                    data: Object.values(sortObject(internetAccess))
                },
                schooling: { labels: Object.keys(schooling), data: Object.values(schooling) }
            },
            media: { photos: allPhotos }
        };
    }

    // ===== SUMBER DATA BANGUNAN — dibaca langsung dari JSON hasil olahan Excel survei =====
    // File ini HARUS ditaruh di: public/source/data/bangunan_tegalsari.json (relatif terhadap studio.html)
    // Dipakai sebagai pengganti sementara sebelum poligon bangunan final (GeoJSON) tersedia,
    // supaya semua chart tematik (material, lantai, sanitasi, fungsi, internet, pekerjaan, pendidikan,
    // kelayakan huni) tetap bisa tampil walau poligon bangunan belum lengkap.

    async function fetchAllData() {
        if (chartDataCache || isDataFetching) return;
        isDataFetching = true;
        if (map.getLayer(MAP_CONFIG['penggunaan-lahan'].layerId)) { map.setLayoutProperty(MAP_CONFIG['penggunaan-lahan'].layerId, 'visibility', 'visible'); }
        if (map.getLayer(MAP_CONFIG['bangunan'].layerId)) { map.setLayoutProperty(MAP_CONFIG['bangunan'].layerId, 'visibility', 'visible'); }

        const pollInterval = 200, maxWaitTime = 15000;
        let elapsedTime = 0;
        const dataPolling = setInterval(() => {
            const landUseReady = map.isSourceLoaded(MAP_CONFIG['penggunaan-lahan'].sourceId);
            const buildingReady = map.isSourceLoaded(MAP_CONFIG['bangunan'].sourceId);
            const handleCompletion = (status) => { clearInterval(dataPolling); updateLayerVisibility(); chartDataCache = status; isDataFetching = false; const activeNav = document.querySelector('.nav-item.active'); if (activeNav) { const activeTarget = activeNav.dataset.target; if (activeTarget === '#data-section') { loadDataView(); } else if (activeTarget === '#media-section') { loadMediaGallery(); } } };
            if ((landUseReady && buildingReady) || elapsedTime >= maxWaitTime) {
                const landUseFeatures = landUseReady ? map.querySourceFeatures(MAP_CONFIG['penggunaan-lahan'].sourceId) : [];
                const buildingFeatures = buildingReady ? map.querySourceFeatures(MAP_CONFIG['bangunan'].sourceId) : [];
                handleCompletion(processAllData(buildingFeatures, landUseFeatures));
            } else {
                elapsedTime += pollInterval;
            }
        }, pollInterval);
    }

    // ===== KPI — jumlah bangunan dihitung dinamis dari fitur di peta (bukan angka mati) =====
    function updateSummaryCards(summaryData) {
        const elBangunan = document.getElementById('kpi-total-bangunan');
        if (elBangunan) elBangunan.textContent = summaryData.totalBangunan.toLocaleString('id-ID');

        const elLahan = document.getElementById('kpi-total-lahan');
        if (elLahan) elLahan.textContent = summaryData.totalLuasLahan.toFixed(2) + ' Ha';

        const elAnak = document.getElementById('kpi-total-anak');
        if (elAnak) elAnak.textContent = summaryData.totalAnak.toLocaleString('id-ID');

        const elJob = document.getElementById('dominant-job');
        if (elJob) elJob.textContent = summaryData.dominantJob;

        const elEdu = document.getElementById('dominant-education');
        if (elEdu) elEdu.textContent = summaryData.dominantEducation;
    }

    function renderAllCharts(data) {
        if (!data || !data.summary || !data.charts) return;

        // ===== PALET WARNA PER CHART (tema olive/rose) =====
        const materialColors = ['#3d4a32', '#5a6b47', '#8a9870', '#b5737a', '#d4a0a6', '#c8a05a'];
        const lantaiColors = ['#5a8fa8', '#7db3c8', '#a9cce2', '#c8a05a', '#b5737a', '#8a9870'];
        const sanitasiColors = ['#3d4a32', '#b5737a', '#8a9870', '#d4a0a6'];
        const fungsiColors = ['#3d4a32', '#5a6b47', '#8a9870', '#c8a05a', '#b5737a', '#d4a0a6'];
        const internetColors = ['#5a8fa8', '#7db3c8', '#a9cce2', '#3d4a32', '#8a9870'];
        const jobColors = ['#3d4a32', '#5a6b47', '#8a9870', '#c8a05a', '#b5737a', '#d4a0a6', '#a9cce2', '#7db3c8'];
        const schoolColors = ['#7db3c8', '#5a8fa8', '#3d7a8a', '#5a6b47'];

        // Label sudah rapi (Title Case) langsung dari data survei; TK/PAUD saja yang diseragamkan.
        const formatLabel = (label) => (label === 'PAUD' ? 'TK/PAUD' : label);

        const defaultBarOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#4a4a40', font: { family: 'Poppins', size: 12 } }, grid: { color: 'rgba(61,74,50,0.08)' } },
                y: { ticks: { color: '#4a4a40', font: { family: 'Poppins', size: 12 } }, grid: { color: 'rgba(61,74,50,0.08)' }, beginAtZero: true }
            }
        };
        const pieDoughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

        const createCustomLegend = (chartData, colors, legendElId) => {
            const el = document.getElementById(legendElId);
            if (!el) return;
            el.innerHTML = '';
            chartData.labels.forEach((label, i) => {
                const color = colors[i % colors.length];
                el.innerHTML += `<div class="custom-legend-item"><div class="custom-legend-color" style="background-color:${color}"></div><span class="custom-legend-label">${formatLabel(label)}</span></div>`;
            });
        };

        destroyCharts();

        // Penggunaan Lahan (aktif hanya kalau HTML masih punya section ini)
        const landUseColors = data.charts.landUse.labels.map(label => MAP_CONFIG['penggunaan-lahan'].items[label]?.color || '#808080');
        const totalLuas = data.summary.totalLuasLahan > 0 ? data.summary.totalLuasLahan : 1;
        const centerEl = document.querySelector('#landUseCenterText .value');
        if (centerEl) centerEl.textContent = data.summary.totalLuasLahan.toFixed(2);
        const landUseLegendEl = document.getElementById('landUseLegend');
        if (landUseLegendEl) {
            landUseLegendEl.innerHTML = '';
            data.charts.landUse.labels.forEach((label, i) => {
                const pct = (data.charts.landUse.data[i] / totalLuas * 100).toFixed(1);
                landUseLegendEl.innerHTML += `<div class="land-use-legend-item"><div class="legend-info"><div class="legend-color-box" style="background-color:${landUseColors[i]}"></div><span class="legend-label">${label}</span></div><div class="legend-value">${data.charts.landUse.data[i].toFixed(2)} Ha <span class="legend-percentage">(${pct}%)</span></div></div>`;
            });
        }
        const landUseCanvas = document.getElementById('landUseChart');
        if (landUseCanvas) {
            chartInstances.landUse = new Chart(landUseCanvas, { type: 'doughnut', data: { labels: data.charts.landUse.labels, datasets: [{ data: data.charts.landUse.data, backgroundColor: landUseColors, borderColor: '#f5f0e8', borderWidth: 3, cutout: '75%' }] }, options: pieDoughnutOptions });
        }

        // Material Dinding
        const matCanvas = document.getElementById('materialChart');
        if (matCanvas) {
            chartInstances.material = new Chart(matCanvas, { type: 'doughnut', data: { labels: data.charts.materials.labels, datasets: [{ data: data.charts.materials.data, backgroundColor: materialColors, borderColor: '#f5f0e8', borderWidth: 2, cutout: '65%' }] }, options: pieDoughnutOptions });
            createCustomLegend(data.charts.materials, materialColors, 'materialLegend');
        }

        // Jenis Lantai
        const floorCanvas = document.getElementById('floorChart');
        if (floorCanvas) {
            chartInstances.floor = new Chart(floorCanvas, { type: 'doughnut', data: { labels: data.charts.floors.labels, datasets: [{ data: data.charts.floors.data, backgroundColor: lantaiColors, borderColor: '#f5f0e8', borderWidth: 2, cutout: '65%' }] }, options: pieDoughnutOptions });
            createCustomLegend(data.charts.floors, lantaiColors, 'floorLegend');
        }

        // Sanitasi (dulu "Ventilasi" — id HTML dipertahankan: ventilationChart/ventilationLegend)
        const sanCanvas = document.getElementById('ventilationChart');
        if (sanCanvas) {
            chartInstances.sanitasi = new Chart(sanCanvas, { type: 'doughnut', data: { labels: data.charts.sanitations.labels, datasets: [{ data: data.charts.sanitations.data, backgroundColor: sanitasiColors, borderColor: '#f5f0e8', borderWidth: 2, cutout: '65%' }] }, options: pieDoughnutOptions });
            createCustomLegend(data.charts.sanitations, sanitasiColors, 'ventilationLegend');
        }

        // Fungsi Bangunan
        const functionCanvas = document.getElementById('floorCountChart');
        if (functionCanvas) {
            chartInstances.function = new Chart(functionCanvas, { type: 'doughnut', data: { labels: data.charts.functions.labels, datasets: [{ data: data.charts.functions.data, backgroundColor: fungsiColors, borderColor: '#f5f0e8', borderWidth: 2, cutout: '65%' }] }, options: pieDoughnutOptions });
            createCustomLegend(data.charts.functions, fungsiColors, 'floorCountLegend');
        }

        // Akses Internet (id HTML: windowCountChart/windowCountLegend — sisa penamaan lama "Jumlah Jendela")
        const internetCanvas = document.getElementById('windowCountChart');
        if (internetCanvas) {
            chartInstances.internet = new Chart(internetCanvas, { type: 'doughnut', data: { labels: data.charts.internet.labels, datasets: [{ data: data.charts.internet.data, backgroundColor: internetColors, borderColor: '#f5f0e8', borderWidth: 2, cutout: '65%' }] }, options: pieDoughnutOptions });
            createCustomLegend(data.charts.internet, internetColors, 'windowCountLegend');
        }

        // Pekerjaan KK
        const jobCanvas = document.getElementById('jobChart');
        if (jobCanvas) {
            chartInstances.job = new Chart(jobCanvas, {
                type: 'bar',
                data: { labels: data.charts.jobs.labels, datasets: [{ data: data.charts.jobs.data, backgroundColor: jobColors, borderRadius: 6, borderSkipped: false }] },
                options: { ...defaultBarOptions, indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x} KK` } } } }
            });
        }

        // Pendidikan Anak
        const schoolCanvas = document.getElementById('schoolChart');
        if (schoolCanvas) {
            const schoolLabelsFormatted = data.charts.schooling.labels.map(formatLabel);
            chartInstances.school = new Chart(schoolCanvas, {
                type: 'bar',
                data: { labels: schoolLabelsFormatted, datasets: [{ data: data.charts.schooling.data, backgroundColor: schoolColors, borderRadius: 6, borderSkipped: false }] },
                options: { ...defaultBarOptions, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} Anak` } } } }
            });
        }
    }

    function loadDataView() { if (isDataViewInitialized) { return; } const loader = document.getElementById('data-loader'); const contentWrapper = document.getElementById('data-content-wrapper'); loader.style.display = 'flex'; contentWrapper.classList.add('hidden'); if (chartDataCache && chartDataCache !== 'failed') { updateSummaryCards(chartDataCache.summary); loader.style.display = 'none'; contentWrapper.classList.remove('hidden'); const observer = new ResizeObserver(entries => { const entry = entries[0]; if (entry.contentRect.width > 0) { renderAllCharts(chartDataCache); isDataViewInitialized = true; observer.disconnect(); } }); observer.observe(contentWrapper); } else if (isDataFetching) { loader.innerHTML = '<div class="spinner"></div><p>Mengambil dan memproses data...</p>'; } else if (chartDataCache === null) { fetchAllData(); } else { loader.innerHTML = '<p>Gagal memuat data. Silakan muat ulang halaman.</p>'; } }

    function loadMediaGallery() {
        const loader = document.getElementById('media-loader');
        const content = document.getElementById('media-content-wrapper');
        const activeTab = document.querySelector('.tab-btn.active').dataset.type;

        loader.style.display = 'flex';
        content.classList.add('hidden');

        const processAndRender = () => {
            if (activeTab === 'photo') {
                const searchTerm = document.getElementById('media-search').value.toLowerCase();
                const areaFilter = document.getElementById('media-area-filter').value;
                fullFilteredPhotoList = chartDataCache.media.photos.filter(photo => {
                    const searchMatch = photo.owner.toLowerCase().includes(searchTerm);
                    const areaMatch = (areaFilter === 'semua') || (photo.type === areaFilter);
                    return searchMatch && areaMatch;
                });
                renderPaginatedPhotos();
                renderPaginationControls(fullFilteredPhotoList.length);
            } else if (activeTab === 'video') {
                renderVideoGallery();
            }
            loader.style.display = 'none';
            content.classList.remove('hidden');
        };

        if (chartDataCache && chartDataCache.media) {
            processAndRender();
        } else if (isDataFetching) {
            loader.innerHTML = '<div class="spinner"></div><p>Sedang memuat data media...</p>';
        } else if (chartDataCache === null) {
            fetchAllData();
        } else {
            loader.innerHTML = '<p>Gagal memuat data media. Silakan coba lagi.</p>';
            document.getElementById('photo-gallery').innerHTML = '';
            document.getElementById('pagination-controls').innerHTML = '';
        }
    }

    function renderVideoGallery() {
        const gallery = document.getElementById('video-gallery');
        gallery.innerHTML = '';
        if (videoData.length === 0) {
            gallery.innerHTML = `<div class="placeholder-content" style="grid-column: 1 / -1;"><i class="fa-solid fa-video-slash"></i><h2>Video Belum Tersedia</h2><p>Fitur untuk menampilkan video akan ditambahkan di kemudian hari.</p></div>`;
            return;
        }
        videoData.forEach(video => {
            const card = document.createElement('div');
            card.className = 'media-card video-card';
            card.innerHTML = `<div class="media-card-img-wrapper"><img src="${video.thumbnailUrl}" alt="${video.title}" class="loaded"></div><div class="media-card-info"><h4>${video.title}</h4><p>${video.description}</p></div>`;
            card.addEventListener('click', () => openVideoLightbox(video));
            gallery.appendChild(card);
        });
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelector('.tab-btn.active').classList.remove('active');
            this.classList.add('active');
            const selectedType = this.dataset.type;
            document.getElementById('photo-content-container').classList.toggle('hidden', selectedType !== 'photo');
            document.getElementById('video-gallery').classList.toggle('hidden', selectedType !== 'video');
            loadMediaGallery();
        });
    });

    function renderPaginatedPhotos() { const gallery = document.getElementById('photo-gallery'); gallery.innerHTML = ''; const startIndex = (currentPage - 1) * photosPerPage; const endIndex = startIndex + photosPerPage; const pagePhotos = fullFilteredPhotoList.slice(startIndex, endIndex); currentLightboxPhotoList = pagePhotos; if (pagePhotos.length > 0) { pagePhotos.forEach((photo, index) => { const card = renderPhotoCard(photo, index); gallery.appendChild(card); }); } else { gallery.innerHTML = `<div class="placeholder-content" style="grid-column: 1 / -1;"><i class="fa-solid fa-images"></i><h2>Tidak Ada Foto</h2><p>Tidak ada foto yang cocok dengan filter atau pencarian Anda.</p></div>`; } }
    function renderPaginationControls(totalItems) { const paginationContainer = document.getElementById('pagination-controls'); paginationContainer.innerHTML = ''; const totalPages = Math.ceil(totalItems / photosPerPage); if (totalPages <= 1) return; const createButton = (text, page, isDisabled = false) => { const btn = document.createElement('button'); btn.className = 'page-btn'; btn.innerHTML = text; btn.disabled = isDisabled; if (page) { btn.addEventListener('click', () => { currentPage = page; renderPaginatedPhotos(); renderPaginationControls(totalItems); }); } return btn; }; const createEllipsis = () => { const span = document.createElement('span'); span.className = 'page-btn'; span.textContent = '...'; span.style.border = 'none'; span.style.background = 'transparent'; span.style.cursor = 'default'; return span; }; const prevBtn = createButton('❮', currentPage - 1); if (currentPage === 1) prevBtn.disabled = true; paginationContainer.appendChild(prevBtn); const pages = new Set(); const range = 1; pages.add(1); pages.add(totalPages); for (let i = Math.max(2, currentPage - range); i <= Math.min(totalPages - 1, currentPage + range); i++) { pages.add(i); } let lastPage = 0; for (const page of [...pages].sort((a, b) => a - b)) { if (lastPage) { if (page - lastPage > 1) { paginationContainer.appendChild(createEllipsis()); } } const pageBtn = createButton(page, page); if (page === currentPage) { pageBtn.classList.add('active'); } paginationContainer.appendChild(pageBtn); lastPage = page; } const nextBtn = createButton('❯', currentPage + 1); if (currentPage === totalPages) nextBtn.disabled = true; paginationContainer.appendChild(nextBtn); }
    function renderPhotoCard(photo, index) { const card = document.createElement('div'); card.className = 'media-card'; card.dataset.index = index; const imgWrapper = document.createElement('div'); imgWrapper.className = 'media-card-img-wrapper'; const spinner = document.createElement('div'); spinner.className = 'card-spinner'; imgWrapper.appendChild(spinner); const img = document.createElement('img'); img.src = photo.thumbnailUrl; img.alt = `Foto ${photo.owner}`; img.loading = 'lazy'; img.onload = () => { spinner.style.display = 'none'; img.classList.add('loaded'); }; img.onerror = () => { spinner.style.display = 'none'; imgWrapper.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: var(--text-secondary); font-size: 24px;"></i>'; }; imgWrapper.appendChild(img); const info = document.createElement('div'); info.className = 'media-card-info'; info.innerHTML = `<h4>${photo.owner}</h4><p>${photo.address}</p>`; card.appendChild(imgWrapper); card.appendChild(info); card.addEventListener('click', () => { openLightbox(index); }); return card; }
    function openLightbox(index) { currentLightboxIndex = index; const lightbox = document.getElementById('lightbox'); const lightboxImg = document.getElementById('lightbox-img'); const lightboxCaption = document.getElementById('lightbox-caption'); const downloadBtn = document.getElementById('lightbox-download-btn'); const photo = currentLightboxPhotoList[currentLightboxIndex]; lightboxImg.src = ''; lightbox.classList.remove('hidden'); downloadBtn.style.pointerEvents = 'none'; downloadBtn.style.opacity = '0.5'; fetch(photo.originalUrl).then(response => { if (!response.ok) { throw new Error('Network response was not ok'); } return response.blob(); }).then(blob => { const objectUrl = URL.createObjectURL(blob); lightboxImg.src = objectUrl; downloadBtn.href = objectUrl; const safeFileName = photo.owner.replace(/[^a-z0-9]/gi, '_').toLowerCase(); downloadBtn.download = `${safeFileName}.jpg`; downloadBtn.style.pointerEvents = 'auto'; downloadBtn.style.opacity = '1'; }).catch(error => { console.error('Error fetching image for lightbox/download:', error); lightboxImg.src = photo.originalUrl; lightboxCaption.textContent = "Gagal memuat gambar untuk diunduh."; downloadBtn.style.display = 'none'; }); lightboxCaption.textContent = `${photo.owner} - ${photo.address}`; }
    function showPhotoInLightbox(n) { currentLightboxIndex = (currentLightboxIndex + n + currentLightboxPhotoList.length) % currentLightboxPhotoList.length; openLightbox(currentLightboxIndex); }
    document.getElementById('media-search').addEventListener('input', () => { currentPage = 1; loadMediaGallery(); });
    document.getElementById('media-area-filter').addEventListener('change', () => { currentPage = 1; loadMediaGallery(); });
    const lightbox = document.getElementById('lightbox'); lightbox.addEventListener('click', (e) => { if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-close')) { lightbox.classList.add('hidden'); } });
    document.querySelector('.lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); showPhotoInLightbox(-1); });
    document.querySelector('.lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); showPhotoInLightbox(1); });
    function destroyCharts() { Object.values(chartInstances).forEach(chart => { if (chart) { chart.destroy(); } }); chartInstances = {}; }
    function updatePaintProperties(groupKey) { const config = MAP_CONFIG[groupKey]; if (!config || !map.getLayer(config.layerId) || !layerVisibilityState[groupKey]) return; if (groupKey === 'bangunan') { const threeDToggle = document.getElementById('toggle-3d-buildings'); const is3DOn = threeDToggle?.checked || false; if (is3DOn) { map.setPaintProperty(config.layerId, 'fill-opacity', 0); return; } } const visibilityExpression = ['case']; Object.entries(layerVisibilityState[groupKey]).forEach(([itemKey, isVisible]) => { const propertyCheck = config.property ? ['==', ['get', config.property], itemKey] : true; visibilityExpression.push(propertyCheck, isVisible ? 1 : 0); }); visibilityExpression.push(0); if (groupKey === 'penggunaan-lahan' || groupKey === 'bangunan' || groupKey === 'perkebunan') { map.setPaintProperty(config.layerId, 'fill-opacity', ['*', 0.75, visibilityExpression]); } else if (groupKey === 'batas-rt') { map.setPaintProperty(config.layerId, 'fill-opacity', ['*', 0.55, visibilityExpression]); } else if (groupKey === 'jalan') { map.setPaintProperty(config.layerId, 'line-opacity', visibilityExpression); } }
    function applyAllPaintProperties() { Object.keys(layerVisibilityState).forEach(groupKey => { updatePaintProperties(groupKey); }); }
    function initializeControls() { [administrasiToggle, areaSelect, jalanToggle].forEach(el => { el.addEventListener('change', renderMap); }); renderMap(); }
    orientasiToggle.addEventListener('change', () => {
    if (map.getLayer(MAP_CONFIG['orientasi-bangunan'].layerId)) {
        map.setLayoutProperty(MAP_CONFIG['orientasi-bangunan'].layerId, 'visibility', orientasiToggle.checked ? 'visible' : 'none');
    }
});
    function renderMap() { updateLayerVisibility(); updateLegend(); }
    function updateLayerVisibility() { const isAdministrasiVisible = administrasiToggle.checked; const selectedArea = areaSelect.value; const isJalanVisible = jalanToggle.checked; Object.keys(MAP_CONFIG).forEach(key => { if (key === 'orientasi-bangunan') return; const config = MAP_CONFIG[key]; if (!map.getLayer(config.layerId)) return; let shouldBeVisible = false; if (key === 'administrasi' && isAdministrasiVisible) shouldBeVisible = true; if (key === selectedArea) shouldBeVisible = true; if (key === 'jalan' && isJalanVisible) shouldBeVisible = true; map.setLayoutProperty(config.layerId, 'visibility', shouldBeVisible ? 'visible' : 'none'); if (map.getLayer(config.layerId + '-outline')) { map.setLayoutProperty(config.layerId + '-outline', 'visibility', shouldBeVisible ? 'visible' : 'none'); } }); const isBuildingAreaSelected = selectedArea === 'bangunan'; const threeDToggle = document.getElementById('toggle-3d-buildings'); const is3DOn = threeDToggle?.checked || false; if (map.getLayer('bangunan-3d-layer')) { map.setLayoutProperty('bangunan-3d-layer', 'visibility', isBuildingAreaSelected && is3DOn ? 'visible' : 'none'); } if (!isBuildingAreaSelected && threeDToggle) { if (threeDToggle.checked) { threeDToggle.checked = false; } updatePaintProperties('bangunan'); } }
    function updateLegend() { legendContainer.innerHTML = ''; const activeGroups = []; if (areaSelect.value !== 'none') activeGroups.push(areaSelect.value); if (jalanToggle.checked && map.getSource(MAP_CONFIG['jalan'].sourceId)) activeGroups.push('jalan'); if (activeGroups.length === 0) { legendContainer.innerHTML = '<span style="color: var(--text-secondary); font-size: 13px;">Aktifkan layer untuk melihat legenda.</span>'; } else { activeGroups.forEach(groupKey => { const groupElement = createLegendGroup(groupKey); legendContainer.appendChild(groupElement); }); } }
    function createLegendGroup(groupKey) { const config = MAP_CONFIG[groupKey]; const groupDiv = document.createElement('div'); groupDiv.className = 'legend-group'; groupDiv.innerHTML = `<h3>${config.legendTitle}</h3>`; const list = document.createElement('div'); list.className = 'legend-list'; Object.entries(config.items).forEach(([itemKey, itemConfig]) => { const isChecked = layerVisibilityState[groupKey][itemKey]; const itemElement = document.createElement('label'); itemElement.className = 'legend-item'; let symbolHtml = ''; if (itemConfig.type === 'fill') { symbolHtml = `<div class="legend-symbol fill" style="background-color: ${itemConfig.color}; border: 1px solid #777"></div>`; } else if (itemConfig.type === 'fill-outline') { symbolHtml = `<div class="legend-symbol fill" style="background-color: transparent; border: 2px solid ${itemConfig.color};"></div>`; } else if (itemConfig.type.startsWith('line')) { const borderStyle = itemConfig.type === 'line-dashed' ? 'dashed' : 'solid'; symbolHtml = `<div class="legend-symbol line" style="border-top: 3px ${borderStyle} ${itemConfig.color};"></div>`; } else if (itemConfig.type === 'icon') { symbolHtml = `<div class="legend-symbol icon"><img src="https://cdn.jsdelivr.net/npm/@mapbox/maki@8.0.0/icons/${itemConfig['icon-image']}.svg" alt="${itemKey}"></div>`; } itemElement.innerHTML = `<input type="checkbox" data-group="${groupKey}" data-item="${itemKey}" ${isChecked ? 'checked' : ''}><span class="checkbox-slider"></span> ${symbolHtml} <span class="legend-label">${itemKey}</span>`; itemElement.querySelector('input').addEventListener('change', (e) => { const { group, item } = e.target.dataset; layerVisibilityState[group][item] = e.target.checked; updatePaintProperties(group); if (group === 'bangunan' && item === 'Area Bangunan') { const isParentOn = e.target.checked; const threeDToggle = document.getElementById('toggle-3d-buildings'); const twoDFillLayer = map.getLayer(config.layerId); if (threeDToggle) { threeDToggle.disabled = !isParentOn; if (!isParentOn) { threeDToggle.checked = false; map.setLayoutProperty('bangunan-3d-layer', 'visibility', 'none'); if (twoDFillLayer) map.setPaintProperty(config.layerId, 'fill-opacity', 0); } else { const is3DOn = threeDToggle.checked; if (twoDFillLayer) map.setPaintProperty(config.layerId, 'fill-opacity', is3DOn ? 0 : 0.7); } } } }); list.appendChild(itemElement); }); if (groupKey === 'bangunan') { const threeDToggleItem = document.createElement('label'); threeDToggleItem.className = 'legend-item'; threeDToggleItem.innerHTML = `<input type="checkbox" id="toggle-3d-buildings"><span class="checkbox-slider"></span><i class="fa-solid fa-cube icon-3d"></i><span class="legend-label">3D Bangunan</span>`; threeDToggleItem.querySelector('input').addEventListener('change', (e) => { const is3DOn = e.target.checked; map.setLayoutProperty('bangunan-3d-layer', 'visibility', is3DOn ? 'visible' : 'none'); updatePaintProperties('bangunan'); }); list.appendChild(threeDToggleItem); } groupDiv.appendChild(list); return groupDiv; }
    let isAutoRotating = false, isRightSidebarOriginallyOpen = false, hiddenLabelLayerIds = [];
    function disableMapInteraction() { map.boxZoom.disable(); map.scrollZoom.disable(); map.dragPan.disable(); map.dragRotate.disable(); map.keyboard.disable(); map.doubleClickZoom.disable(); map.touchZoomRotate.disable(); }
    function enableMapInteraction() { map.boxZoom.enable(); map.scrollZoom.enable(); map.dragPan.enable(); map.keyboard.enable(); map.doubleClickZoom.enable(); map.touchZoomRotate.enable(); }
    function hideMapLabels() { const layers = map.getStyle().layers; hiddenLabelLayerIds = []; for (const layer of layers) { if (layer.type === 'symbol') { try { map.setLayoutProperty(layer.id, 'visibility', 'none'); hiddenLabelLayerIds.push(layer.id); } catch (e) { } } } }
    function showMapLabels() { for (const layerId of hiddenLabelLayerIds) { if (map.getLayer(layerId)) { try { map.setLayoutProperty(layerId, 'visibility', 'visible'); } catch (e) { } } } }
    basemapLabelToggle.addEventListener('change', (e) => { e.target.checked ? showMapLabels() : hideMapLabels(); });
    startBtn.addEventListener('click', () => { resetToIntroBtn.style.pointerEvents = 'none'; resetToIntroBtn.style.opacity = '0.5'; disableMapInteraction(); introOverlay.style.opacity = '0'; introOverlay.style.pointerEvents = 'none'; setTimeout(() => { mapBackground.style.display = 'none'; appContainer.classList.remove('hidden'); mapSection.insertBefore(mapElement, mapSection.firstChild); appContainer.classList.add('left-collapsed', 'right-collapsed', 'both-collapsed'); updateMapPadding(); resizeMap(); renderMap(); enableMapInteraction(); resetToIntroBtn.style.pointerEvents = 'auto'; resetToIntroBtn.style.opacity = '1'; fetchAllData(); }, cssTransitionDuration); });
    function resetToIntro() { chartDataCache = null; isDataFetching = false; isDataViewInitialized = false; switchToView('#map-section'); startBtn.disabled = true; disableMapInteraction(); if (isAutoRotating) { isAutoRotating = false; document.getElementById('rotate-btn').classList.remove('active'); } if (basemapLabelToggle.checked) { basemapLabelToggle.checked = false; } appContainer.classList.add('hidden'); introOverlay.style.opacity = '1'; introOverlay.style.pointerEvents = 'auto'; mapBackground.style.display = 'block'; mapBackground.appendChild(mapElement); resizeMap(); Object.values(MAP_CONFIG).forEach(config => { if (map.getLayer(config.layerId)) map.setLayoutProperty(config.layerId, 'visibility', 'none'); if (map.getLayer(config.layerId + '-outline')) map.setLayoutProperty(config.layerId + '-outline', 'visibility', 'none'); }); map.jumpTo(finalLocation); hideMapLabels(); startBtn.disabled = false; }
    resetToIntroBtn.addEventListener('click', resetToIntro);
    function resizeMap() { setTimeout(() => map.resize(), cssTransitionDuration); }
    function updateMapPadding() { const sidebarLeftWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-left-width')), sidebarRightWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-right-width')); const isLeftCollapsed = appContainer.classList.contains('left-collapsed'), isRightCollapsed = appContainer.classList.contains('right-collapsed'); const padding = { top: 20, bottom: 20, left: isLeftCollapsed ? 20 : sidebarLeftWidth, right: isRightCollapsed ? 20 : sidebarRightWidth }; map.easeTo({ padding: padding, duration: cssTransitionDuration }); }
    const toggleLeftBtn = document.getElementById('toggle-left-sidebar-btn'), openRightBtn = document.getElementById('open-right-sidebar-btn'), closeRightBtn = document.getElementById('close-right-sidebar-btn');
    toggleLeftBtn.addEventListener('click', () => { appContainer.classList.toggle('left-collapsed'); const isBoth = appContainer.classList.contains('left-collapsed') && appContainer.classList.contains('right-collapsed'); appContainer.classList.toggle('both-collapsed', isBoth); resizeMap(); setTimeout(() => { Object.values(chartInstances).forEach(chart => chart && chart.resize()); }, cssTransitionDuration); });
    openRightBtn.addEventListener('click', () => { if (!appContainer.classList.contains('right-collapsed')) return; appContainer.classList.remove('right-collapsed'); appContainer.classList.remove('both-collapsed'); resizeMap(); });
    closeRightBtn.addEventListener('click', () => { if (appContainer.classList.contains('right-collapsed')) return; appContainer.classList.add('right-collapsed'); if (appContainer.classList.contains('left-collapsed')) appContainer.classList.add('both-collapsed'); resizeMap(); });
    document.getElementById('pitch-slider').addEventListener('input', (e) => { const pitch = parseInt(e.target.value, 10); map.setPitch(pitch); document.getElementById('pitch-value').textContent = pitch; });
    document.getElementById('layer-select').addEventListener('change', (e) => { map.setStyle(BASEMAP_STYLES[e.target.value] || ESRI_SATELLITE_STYLE); map.once('style.load', () => { addCustomDataLayers(); updateLayerVisibility(); applyAllPaintProperties(); if (!basemapLabelToggle.checked) hideMapLabels(); }); });
    document.getElementById('zoom-in-btn').addEventListener('click', () => map.zoomIn());
    document.getElementById('zoom-out-btn').addEventListener('click', () => map.zoomOut());
    document.getElementById('reset-view-btn').addEventListener('click', () => { const currentPitch = map.getPitch(); map.flyTo({ ...finalLocation, padding: map.getPadding(), pitch: currentPitch }); });
    document.getElementById('rotate-btn').addEventListener('click', function () { isAutoRotating = !isAutoRotating; this.classList.toggle('active', isAutoRotating); function rotateCamera() { if (!isAutoRotating) return; map.easeTo({ bearing: map.getBearing() + 0.1, duration: 0 }); requestAnimationFrame(rotateCamera); } if (isAutoRotating) rotateCamera(); });
    const mainNavItems = document.querySelectorAll('.sidebar-left-content .nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const rightSidebar = document.querySelector('.sidebar-right');
    function switchToView(targetId) { document.querySelectorAll('.sidebar-left-content .nav-item').forEach(i => { if (i.dataset.target) { i.classList.toggle('active', i.dataset.target === targetId); } }); contentSections.forEach(section => { section.classList.add('hidden'); }); const targetSection = document.querySelector(targetId); if (targetSection) { targetSection.classList.remove('hidden'); } switch (targetId) { case '#data-section': downloadIcon.className = 'fa-solid fa-file-csv'; downloadTextSpan.textContent = 'Unduh Data'; loadDataView(); break; case '#media-section': downloadIcon.className = 'fa-solid fa-file-image'; downloadTextSpan.textContent = 'Unduh Media'; currentPage = 1; loadMediaGallery(); break; case '#map-section': default: downloadIcon.className = 'fa-solid fa-map'; downloadTextSpan.textContent = 'Unduh Peta'; break; } if (targetId === '#map-section') { rightSidebar.style.display = 'flex'; if (isRightSidebarOriginallyOpen) { appContainer.classList.remove('right-collapsed'); if (!appContainer.classList.contains('left-collapsed')) appContainer.classList.remove('both-collapsed'); } else { appContainer.classList.add('right-collapsed'); if (appContainer.classList.contains('left-collapsed')) appContainer.classList.add('both-collapsed'); } setTimeout(() => map.resize(), 0); } else { isRightSidebarOriginallyOpen = !appContainer.classList.contains('right-collapsed'); rightSidebar.style.display = 'none'; appContainer.classList.add('right-collapsed'); if (appContainer.classList.contains('left-collapsed')) appContainer.classList.add('both-collapsed'); } }
    document.querySelectorAll('.sidebar-left-content .nav-item').forEach(item => { if (item.dataset.target) { item.addEventListener('click', () => { switchToView(item.dataset.target); }); } });

    // ===== KOORDINAT & ZOOM LIVE (header + status bar + compass, kalau elemennya ada) =====
    function setupLiveCoordDisplay() {
        const coordLat = document.getElementById('coord-lat');
        const coordLng = document.getElementById('coord-lng');
        const zoomLevelDisplay = document.getElementById('zoom-level-display');
        const statusZoomVal = document.getElementById('status-zoom-val');
        const compassNeedle = document.getElementById('compass-needle');
        if (!coordLat && !coordLng && !zoomLevelDisplay && !statusZoomVal && !compassNeedle) return;

        const updateCoords = (lngLat) => {
            if (coordLat) coordLat.textContent = lngLat.lat.toFixed(4) + '°';
            if (coordLng) coordLng.textContent = lngLat.lng.toFixed(4) + '°';
        };
        const updateZoom = () => {
            const z = Math.round(map.getZoom());
            if (zoomLevelDisplay) zoomLevelDisplay.textContent = z;
            if (statusZoomVal) statusZoomVal.textContent = z;
        };
        const updateCompass = () => {
            if (compassNeedle) compassNeedle.style.transform = `rotate(${-map.getBearing()}deg)`;
        };

        map.on('mousemove', (e) => updateCoords(e.lngLat));
        map.on('move', () => { updateCoords(map.getCenter()); updateZoom(); updateCompass(); });
        map.on('zoom', updateZoom);
        map.on('rotate', updateCompass);
        updateCoords(map.getCenter()); updateZoom(); updateCompass();
    }

    // ==============================================
    // ====== LOGIKA LIGHTBOX VIDEO             ======
    // ==============================================
    function setupVideoLightbox() {
        const lightboxEl = document.getElementById('video-lightbox');
        const closeBtn = document.getElementById('video-lightbox-close');
        const close = () => { lightboxEl.classList.add('hidden'); document.getElementById('video-player').innerHTML = ''; };
        closeBtn.addEventListener('click', close);
        lightboxEl.addEventListener('click', (e) => { if (e.target.id === 'video-lightbox') { close(); } });
    }

    function openVideoLightbox(video) {
        const lightboxEl = document.getElementById('video-lightbox');
        const titleEl = document.getElementById('video-lightbox-title');
        const downloadBtn = document.getElementById('video-lightbox-download');
        const playerEl = document.getElementById('video-player');
        titleEl.textContent = video.title;
        downloadBtn.href = `https://drive.google.com/uc?export=download&id=${video.driveFileId}`;
        downloadBtn.download = video.filename || 'video.mp4';
        playerEl.innerHTML = `<iframe src="https://drive.google.com/file/d/${video.driveFileId}/preview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        lightboxEl.classList.remove('hidden');
    }

    const DOWNLOAD_OPTIONS = {
    peta: [
        { id: 'peta_batas_dusun', title: 'Peta Batas Dusun (.pdf)', url: './source/peta/peta_batas_dusun.pdf' },
        { id: 'peta_pl_a1', title: 'Peta Penggunaan Lahan A1 (.png)', url: './source/peta/peta_pl_a1.png' },
        { id: 'peta_definitif_pl_a3', title: 'Peta Definitif Penggunaan Lahan A3 (.png)', url: './source/peta/peta_definitif_pl_a3.png' },
        { id: 'peta_bangunan', title: 'Peta Bangunan (.png)', url: './source/peta/peta_bangunan.png' },
        { id: 'peta_kondisi_bangunan', title: 'Peta Kondisi Bangunan (.png)', url: './source/peta/peta_kondisi_bangunan.png' },
        { id: 'peta_orientasi_bangunan', title: 'Peta Orientasi Bangunan (.pdf)', url: './source/peta/peta_oroentasi_bangunan.pdf' },
        { id: 'peta_sarpras', title: 'Peta Sarana Prasarana (.png)', url: './source/peta/peta_sarpras.png' },
        { id: 'peta_sebaran_tanaman', title: 'Peta Sebaran Tanaman (.png)', url: './source/peta/peta_sebaran_tanaman.png' },
        { id: 'peta_mata_pencaharian', title: 'Peta Mata Pencaharian (.pdf)', url: './source/peta/peta_mata_pencaharian.pdf' },
        { id: 'peta_pendidikan', title: 'Peta Sebaran Jenjang Pendidikan (.png)', url: './source/peta/peta_sebaran_jenjang_pendidikan.png' },
        { id: 'peta_foto_udara', title: 'Peta Foto Udara (.png)', url: './source/peta/peta_foto_udara.png' },
    ],
    data: [
        { id: 'data_survei_bangunan', title: 'Data Survei Bangunan (.csv)', url: './source/data/Sensus_Penduduk.csv' },
        { id: 'data_survei_lahan', title: 'Data Survei Penggunaan Lahan (.csv)', url: './source/data/Kesesuaian_PL.csv' },
    ]
};

    function setupDownloadLightbox() {
        const lightboxEl = document.getElementById('download-lightbox');
        const mainDownloadBtn = document.querySelector('.header-button.download-btn');
        const closeBtn = document.getElementById('download-lightbox-close');
        const actionBtn = document.getElementById('download-lightbox-action-btn');

        mainDownloadBtn.addEventListener('click', () => {
            const activeNav = document.querySelector('.main-nav .nav-item.active');
            const target = activeNav.dataset.target;
            let sectionKey = 'peta';
            if (target === '#data-section') sectionKey = 'data';
            if (target === '#media-section') sectionKey = 'media';
            populateDownloadLightbox(sectionKey);
            lightboxEl.classList.remove('hidden');
        });

        const closeLightbox = () => lightboxEl.classList.add('hidden');
        closeBtn.addEventListener('click', closeLightbox);
        lightboxEl.addEventListener('click', (e) => { if (e.target.id === 'download-lightbox') closeLightbox(); });
        actionBtn.addEventListener('click', handleDownloadAction);
    }

    function populateDownloadLightbox(sectionKey) {
        const titleEl = document.getElementById('download-lightbox-title');
        const listEl = document.getElementById('download-lightbox-list');
        const statusEl = document.getElementById('download-status');
        listEl.innerHTML = '';
        statusEl.textContent = '';

        if (sectionKey === 'media') {
            titleEl.textContent = 'Unduh Media';
            if (fullFilteredPhotoList.length > 0) {
                listEl.insertAdjacentHTML('beforeend', `<h5>Foto (${fullFilteredPhotoList.length})</h5>`);
                listEl.insertAdjacentHTML('beforeend', `<label class="download-item" style="background-color: #333;"><input type="checkbox" id="select-all-photos"><span class="checkmark"></span><span><strong>Pilih Semua Foto</strong></span></label>`);
                fullFilteredPhotoList.forEach((photo) => {
                    listEl.insertAdjacentHTML('beforeend', `<label class="download-item"><input type="checkbox" class="photo-checkbox" data-url="${photo.originalUrl}" data-type="media-photo"><span class="checkmark"></span><span>${photo.owner}</span></label>`);
                });
                document.getElementById('select-all-photos').addEventListener('change', (e) => { document.querySelectorAll('.photo-checkbox').forEach(checkbox => checkbox.checked = e.target.checked); });
            }
            if (videoData.length > 0) {
                if (listEl.innerHTML) listEl.insertAdjacentHTML('beforeend', `<hr class="divider" style="margin: 16px 0;">`);
                listEl.insertAdjacentHTML('beforeend', `<h5>Video (${videoData.length})</h5>`);
                videoData.forEach(video => {
                    const downloadLink = `https://drive.google.com/uc?export=download&id=${video.driveFileId}`;
                    listEl.insertAdjacentHTML('beforeend', `<label class="download-item"><input type="checkbox" data-url="${downloadLink}" data-type="file" data-filename="${video.filename || 'video.mp4'}"><span class="checkmark"></span><span>${video.title}</span></label>`);
                });
            }
            if (listEl.innerHTML === '') { listEl.innerHTML = `<p style="text-align:center; color: var(--text-secondary);">Tidak ada media untuk diunduh.</p>`; }
        } else {
            const options = DOWNLOAD_OPTIONS[sectionKey] || [];
            if (sectionKey === 'peta') titleEl.textContent = 'Unduh Peta';
            else if (sectionKey === 'data') titleEl.textContent = 'Unduh Data';
            options.forEach(item => {
                const isDisabled = item.disabled ? 'disabled' : '';
                listEl.insertAdjacentHTML('beforeend', `<label class="download-item" ${isDisabled ? 'style="opacity:0.5; cursor:not-allowed;"' : ''}><input type="checkbox" data-url="${item.url || ''}" data-type="file" ${isDisabled}><span class="checkmark"></span><span>${item.title}</span></label>`);
            });
        }
    }

    async function handleDownloadAction() {
        const actionBtn = document.getElementById('download-lightbox-action-btn');
        const statusEl = document.getElementById('download-status');
        const checkedItems = document.querySelectorAll('#download-lightbox-list input[type="checkbox"]:checked:not(#select-all-photos)');
        if (checkedItems.length === 0) {
            statusEl.textContent = 'Pilih setidaknya satu file untuk diunduh.';
            statusEl.style.color = '#f87171';
            setTimeout(() => { statusEl.textContent = ''; statusEl.style.color = ''; }, 3000);
            return;
        }
        actionBtn.disabled = true;
        statusEl.textContent = `Mempersiapkan ${checkedItems.length} file...`;
        statusEl.style.color = '#60a5fa';
        for (let i = 0; i < checkedItems.length; i++) {
            const item = checkedItems[i];
            const { url, type } = item.dataset;
            const title = item.closest('.download-item').querySelector('span').textContent;
            statusEl.textContent = `Memproses (${i + 1}/${checkedItems.length}): ${title}...`;
            try {
                if (type === 'file') {
                    const filename = item.dataset.filename || url.split('/').pop();
                    downloadFile(url, filename);
                } else if (type === 'media-photo') {
                    const safeFileName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    await downloadMediaFile(url, `${safeFileName}.jpg`);
                }
            } catch (error) {
                console.error(`Gagal memproses ${title}:`, error);
                statusEl.textContent = `Gagal memproses: ${title}.`;
                statusEl.style.color = '#f87171';
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            if (i < checkedItems.length - 1) { await new Promise(resolve => setTimeout(resolve, 500)); }
        }
        statusEl.textContent = 'Semua proses selesai!';
        statusEl.style.color = '#4ade80';
        actionBtn.disabled = false;
        setTimeout(() => { statusEl.textContent = ''; statusEl.style.color = ''; }, 4000);
    }

    function downloadFile(url, filename) { const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
    async function downloadMediaFile(url, filename) { const response = await fetch(url); if (!response.ok) { throw new Error(`Gagal fetch: ${response.statusText}`); } const blob = await response.blob(); const blobUrl = URL.createObjectURL(blob); downloadFile(blobUrl, filename); URL.revokeObjectURL(blobUrl); }
});