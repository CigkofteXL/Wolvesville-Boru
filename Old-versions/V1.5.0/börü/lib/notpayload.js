console.log('Börü Bot injected')
// 🔥 EKSİK OLAN BU SATIR:
var CURRENT_GAME_MODE = "Bilinmiyor";


const addHotkeys = () => {
    // capture: true ile en öncelikli dinleyici biziz
    window.addEventListener('keydown', (e) => {

        // 1. Yazı yazıyorsan çalışma
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        // --- DEBUGGER (Konsola bak tuşu algılıyor mu?) ---
        // F12 konsolunu aç, tuşa basınca buraya yazı düşüyor mu bak.
        // Düşmüyorsa 'all_frames: true' ayarın eksiktir.
        // console.log(`Tuş: ${e.code}, Ctrl: ${e.ctrlKey}, Alt: ${e.altKey}`);

        const ayariDegistir = (ayarKey, ayarIsmi, selector) => {
            LV_SETTINGS[ayarKey] = !LV_SETTINGS[ayarKey];
            saveSetting(); 
            
            const checkbox = $(selector);
            if (checkbox.length) checkbox.text(LV_SETTINGS[ayarKey] ? '' : '');

            const yeniDurum = LV_SETTINGS[ayarKey];
            const renk = yeniDurum ? "#00FF00" : "#FF0000";
            const durumMetni = yeniDurum ? "AKTİF 🟢" : "KAPALI 🔴";
            
            if (typeof addChatMsg === 'function') {
                addChatMsg(`⌨️ [Ctrl+Alt] ${ayarIsmi}: ${durumMetni}`, true, `color: ${renk};`);
            }
            
            if (ayarKey === 'AUTO_REPLAY' && yeniDurum) handleAutoReplay();
            if (ayarKey === 'AUTO_JOIN_ROOMS' && yeniDurum) handleAutoJoin();
            if (ayarKey === 'AUTO_CREATE_ROOM' && yeniDurum) handleAutoCreate();
        };

        // 🔥 YENİ KOMBİNASYON: CTRL + ALT (Daha Kararlı)
        if (e.ctrlKey && e.altKey) {
            
            // J -> Auto Join (Ctrl + Alt + J)
            if (e.code === 'KeyJ') { 
                e.preventDefault(); e.stopPropagation(); 
                ayariDegistir('AUTO_JOIN_ROOMS', 'Auto Join', '.lv-modal-checkbox.auto-join-rooms');
            }

            // R -> Auto Replay (Ctrl + Alt + R)
            if (e.code === 'KeyR') {
                e.preventDefault(); e.stopPropagation();
                ayariDegistir('AUTO_REPLAY', 'Auto Replay', '.lv-modal-checkbox.auto-replay');
            }

            // P -> Auto Play (Ctrl + Alt + P)
            if (e.code === 'KeyP') {
                e.preventDefault(); e.stopPropagation();
                ayariDegistir('AUTO_PLAY', 'Auto Play', '.lv-modal-checkbox.auto-play');
            }

            // K -> Auto Create (Ctrl + Alt + K)
            if (e.code === 'KeyK') {
                e.preventDefault(); e.stopPropagation();
                ayariDegistir('AUTO_CREATE_ROOM', 'Auto Create', '.lv-modal-checkbox.auto-create-room');
            }
        }
        
        // F9 Panic Mode
        if (e.code === 'F9') {
             e.preventDefault(); e.stopPropagation();
             $('html').toggleClass('lv-panic-mode');
        }

    }, true); 
}


// 🔥 TIKLAMA GÖRSELLEŞTİRİCİ (YENİ - NOKTA ATIŞI VERSİYONU)
const visualizeClick = (element) => {
    // Debug modu kapalıysa hiç uğraşma
    if (!LV_SETTINGS.DEBUG_MODE) return;

    try {
        const rect = element.getBoundingClientRect();
        
        // Elementin tam ortasını buluyoruz (Bot buraya tıklıyor)
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Kırmızı Nokta/Hedef oluştur
        const hitmarker = document.createElement('div');
        hitmarker.style.position = 'fixed';
        hitmarker.style.left = (x - 10) + 'px'; // Tam ortalamak için -10
        hitmarker.style.top = (y - 10) + 'px';  // Tam ortalamak için -10
        hitmarker.style.width = '20px';
        hitmarker.style.height = '20px';
        hitmarker.style.border = '2px solid red';
        hitmarker.style.borderRadius = '50%'; // Yuvarlak olsun
        hitmarker.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        hitmarker.style.zIndex = '9999999';
        hitmarker.style.pointerEvents = 'none';
        hitmarker.style.transform = 'scale(0)'; // Küçük başlasın
        hitmarker.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        // İçine bir de artı (+) koyalım tam hedef gibi olsun
        hitmarker.innerHTML = '<div style="position:absolute; top:50%; left:50%; width:4px; height:4px; background:white; transform:translate(-50%, -50%); border-radius:50%;"></div>';

        document.body.appendChild(hitmarker);

        // Efekt: Büyüterek göster (POP!)
        requestAnimationFrame(() => {
            hitmarker.style.transform = 'scale(1)';
        });

        // 0.5 saniye sonra yok et
        setTimeout(() => {
            hitmarker.style.opacity = '0';
            setTimeout(() => hitmarker.remove(), 300);
        }, 500);
        
        // Konsola da yazalım
        // console.log(`[Börü Debug] Tıklandı: ${x.toFixed(0)}, ${y.toFixed(0)}`);
    } catch (e) {
        console.error("Görselleştirme hatası:", e);
    }
}
// 🔥 GELİŞMİŞ TIKLANABİLİRLİK KONTROLÜ

const scriptTag = document.currentScript;
var BOT_VERSION = scriptTag.getAttribute('data-version') || "1.0.0";
var HAS_UPDATE = scriptTag.getAttribute('data-has-update') === 'true';
var NEW_VERSION = scriptTag.getAttribute('data-new-version');
var UPDATE_MSG = scriptTag.getAttribute('data-update-message');

// ... (AUTHTOKENS vs. diğer değişkenlerin kalsın) ...

// 2. Bu fonksiyon artık fetch YAPMIYOR, sadece sonucu gösteriyor
function checkForUpdates() {
    // Veri zaten inject.js tarafından hazırlandı ve gönderildi
    if (HAS_UPDATE) {
        setTimeout(() => {
            addChatMsg(`📢 GÜNCELLEME VAR: v${NEW_VERSION}`, true, 'color: #00FF00; font-size: 14px;');
            addChatMsg(`Yenilikler: ${UPDATE_MSG}`, false, 'color: #ADFF2F;');
            addChatMsg(`Şu anki sürüm: v${BOT_VERSION}`, false, 'font-size: 11px; color: #aaa;');
          // 2. BAŞLIĞI DEĞİŞTİR (Konsol açıksa veya daraltılmışsa görünür) 🔥
    // "Börü v1.1.0" yerine "Börü v1.1.0 (GÜNCELLEME VAR!)" yazar
    $('.lv-chat-title').html(`Börü v${BOT_VERSION} <span style="color: #00FF00; font-weight: bold; animation: blink 1s infinite;">(GÜNCELLE!)</span>`);

    // 3. PANELİN ÇERÇEVESİNİ YEŞİL YAP (Konsol tamamen kapalı/mini olsa bile görünür) 🔥
    $('.lv-chat').css({
        'border': '2px solid #00FF00',
        'box-shadow': '0 0 10px #00FF00' // Hafif neon parlama efekti
    });

    // 4. İkonu da yeşil yapalım
    $('.lv-chat-toggle').css('color', '#00FF00');
        }, 3000);
    } else {
        console.log(`[Börü] Sürüm güncel: v${BOT_VERSION}`);
        addChatMsg(`✅ Bot sürümünüz güncel: v${BOT_VERSION}`, false, 'color: #00FF00; font-size: 12px;');
    }
}
var AUTHTOKENS = {
  idToken: '',
  refreshToken: '',
  'Cf-JWT': '',
}
var PLAYER = undefined
var INVENTORY = undefined
var HISTORY = []
var PLAYERS = []
var ROLE = undefined
var GAME_STATUS = undefined
var IS_CONSOLE_EXPAND = false
var IS_CONSOLE_CLOSE = false
var GOLD_WHEEL_SPINS_COUNTER = 0
var GOLD_WHEEL_SILVER_SESSION = 0
var TOTAL_XP_SESSION = 0
var TOTAL_UP_LEVEL = 0
var GAME_STARTED_AT = 0
var LV_SETTINGS = {
   AUTO_JOIN_ROOMS: false, 
   AUTO_JOIN_FILTER: "",
   AUTO_JOIN_CASE_SENSITIVE: false,
   AUTO_JOIN_EXCLUDE: "",
  DEBUG_MODE: false,
  SHOW_HIDDEN_LVL: true,
  AUTO_REPLAY: true,
  AUTO_PLAY: true,
  CHAT_STATS: true,
  PLAYER_NOTES: true,
  PLAYER_AURA: true,
  AUTO_REFRESH_INTERVAL: 15,  // <--- YENİ EKLENEN
  AUTO_CREATE_ROOM: false,          // Özellik açık mı?
  AUTO_CREATE_TEMPLATE_NAME: "",     // Şablon adı ne?
  TELEMETRY_ACTIVE: true,    //Veri tabanına gönderilsinmi
}
const PLAYERAURAMAP = new Map();
const PLAYERNOTESMAP = new Map();
var AUTO_REPLAY_INTERVAL = undefined
var SOCKET = undefined
var REGULARSOCKET = undefined
var GAME_ID = undefined
var SERVER_URL = undefined
var GAME_SETTINGS = undefined
let DAY_COUNT = 0;
let DAY_VOTING = [];
let GAME_VOTING = "";



const removeWovProtections = () => {
  const startGame = $('div:contains("START GAME")')
  const ok = $('div:contains("OK")')
  const inventory = $('div:contains("INVENTORY")')
  if (startGame?.length && ok?.length && inventory?.length) {
    console.log('Remove wov protections')
    startGame[startGame?.length - 1].remove()
    ok[ok?.length - 1].remove()
  }
}

setInterval(removeWovProtections, 1000)

const main = async () => {
  getAuthtokens()
  loadSettings()
  injectChat()
  injectSettings()
  injectStyles()
  checkForUpdates()
  setTimeout(checkuserwhitelist,5000)
  setInterval(injectChat, 1000)
  fetchInterceptor()
  socketInterceptor(onMessage)
  setInterval(setChatState, 1000)
  // 🔥 KISAYOLLARI BURADA BAŞLATIYORUZ
  addHotkeys();
}

const injectSettings = () => {
  // 1. HTML Ekleme
  $('html').append(lvModal)
  $('html').append(lvModalPerk)
  $('html').append(votingHistory)
  $('html').append(recentPlayersModal)

  // --- SON OYUNCULAR PENCERESİ KAPATMA ---
  $('.lv-modal-recent-players-close').on('click', () => { 
      $('.lv-modal-recent-players-container').css({ display: 'none' }); 
  });

  // --- DISCORD TİK AYARI ---
  // 1. Açılışta Durumu Yükle
  $('.lv-modal-checkbox.discord-active').text(LV_SETTINGS.TELEMETRY_ACTIVE ? '' : '');

  // 2. Tıklama Olayı
  $('.lv-modal-checkbox.discord-active').on('click', () => {
      LV_SETTINGS.TELEMETRY_ACTIVE = !LV_SETTINGS.TELEMETRY_ACTIVE;
      $('.lv-modal-checkbox.discord-active').text(LV_SETTINGS.TELEMETRY_ACTIVE ? '' : '');
      saveSetting();

      if (LV_SETTINGS.TELEMETRY_ACTIVE) {
          addChatMsg("✅ Veri Akışı: BAŞLATILDI", true, "color: #00FF00;");
      } else {
          addChatMsg("❌ Veri Akışı: DURDURULDU", true, "color: #FF0000;");
      }
  });

  // 2. Diğer Pencere İşlemleri
  $('.lv-modal-close').on('click', () => { $('.lv-modal-popup-container').css({ display: 'none' }) })
  $('.lv-modal-veil').on('click', () => { 
    $('.lv-modal-popup-container').css({ display: 'none' }) 
    $('.lv-modal-perk-container').css({ display: 'none' })
    $('.lv-modal-voting-container').css({ display: 'none' })
    $('.lv-modal-recent-players-container').css({ display: 'none' })
  })
  
  // Chat Stats butonunun görünürlüğü (Sayfa açılışında)
  $('.lv-perk-settings').css({ display: (LV_SETTINGS.CHAT_STATS ? 'block' : 'none') })
  
  $('.lv-modal-perk-close').on('click', () => { $('.lv-modal-perk-container').css({ display: 'none' }) })
  $('.lv-modal-voting-close').on('click', () => { $('.lv-modal-voting-container').css({ display: 'none' }) })

  // 3. Butonlar (Çark, Kutu)
  $('.lv-modal-rose-wheel-btn').on('click', () => { fetch('https://core.api-wolvesville.com/rewards/goldenWheelSpin', { method: 'POST', headers: getHeaders() }) })
  $('.lv-modal-gold-wheel-btn').on('click', () => { fetch(`https://core.api-wolvesville.com/rewards/wheelRewardWithSecret/${getRewardSecret()}`, { method: 'POST', headers: getHeaders() }) });
  $('.lv-modal-loot-boxes-btn').on('click', () => { if (INVENTORY.lootBoxes?.length) lootBox() })

  // 4. Basit Ayarlar
  $('.lv-modal-checkbox.debug').on('click', () => { LV_SETTINGS.DEBUG_MODE = !LV_SETTINGS.DEBUG_MODE; $('.lv-modal-checkbox.debug').text(LV_SETTINGS.DEBUG_MODE ? '' : ''); saveSetting() })
  $('.lv-modal-checkbox.show-hidden-lvl').on('click', () => { LV_SETTINGS.SHOW_HIDDEN_LVL = !LV_SETTINGS.SHOW_HIDDEN_LVL; $('.lv-modal-checkbox.show-hidden-lvl').text(LV_SETTINGS.SHOW_HIDDEN_LVL ? '' : ''); saveSetting() })
  $('.lv-modal-checkbox.auto-replay').on('click', () => { LV_SETTINGS.AUTO_REPLAY = !LV_SETTINGS.AUTO_REPLAY; $('.lv-modal-checkbox.auto-replay').text(LV_SETTINGS.AUTO_REPLAY ? '' : ''); handleAutoReplay(); saveSetting() })
  $('.lv-modal-checkbox.auto-play').on('click', () => { LV_SETTINGS.AUTO_PLAY = !LV_SETTINGS.AUTO_PLAY; $('.lv-modal-checkbox.auto-play').text(LV_SETTINGS.AUTO_PLAY ? '' : ''); saveSetting() })
  
  // 🔥 DÜZELTİLEN KISIM: CHAT STATS KAPATILINCA TEMİZLİK YAP 🔥
  $('.lv-modal-checkbox.chat-stats').on('click', () => { 
    LV_SETTINGS.CHAT_STATS = !LV_SETTINGS.CHAT_STATS; 
    $('.lv-modal-checkbox.chat-stats').text(LV_SETTINGS.CHAT_STATS ? '' : ''); 
    
    // 1. (+) Butonunu gizle/göster
    $('.lv-perk-settings').css({ display: (LV_SETTINGS.CHAT_STATS ? 'block' : 'none') });
    
    // 2. TEMİZLİK: Eğer kapattıysan ekrandaki her şeyi sil
    if (!LV_SETTINGS.CHAT_STATS) {
        $('.lv-modal-perk-container').css({ display: 'none' }); // Menüyü kapat
        removePlayerAura(); // Renkli kutuları sil
        removePlayerNotes(); // Not kutularını sil
    } else {
        // Eğer açtıysan ve alt ayarlar (aura/note) zaten aktifse geri yükle
        if (LV_SETTINGS.PLAYER_AURA) handlePlayerAura();
        if (LV_SETTINGS.PLAYER_NOTES) handlePlayerNotes();
    }

    saveSetting() 
  })

  // 5. Perk Ayarları
  $('.lv-modal-checkbox.player-aura').on('click', () => { LV_SETTINGS.PLAYER_AURA = !LV_SETTINGS.PLAYER_AURA; $('.lv-modal-checkbox.player-aura').text(LV_SETTINGS.PLAYER_AURA ? '' : ''); handlePlayerAura(); saveSetting() })
  $('.lv-modal-checkbox.player-notes').on('click', () => { LV_SETTINGS.PLAYER_NOTES = !LV_SETTINGS.PLAYER_NOTES; $('.lv-modal-checkbox.player-notes').text(LV_SETTINGS.PLAYER_NOTES ? '' : ''); handlePlayerNotes(); saveSetting() })
  $('.lv-modal-perk-refresh-aura').on('click', () => { updateAllPlayerAura() })
  // Oylama Geçmişi Butonu
  $('.lv-modal-voting-history').on('click', () => { 
    // Tüm pencereleri gizle (Manuel selector ile)
    $('.lv-modal-popup-container').hide();
    $('.lv-modal-perk-container').hide();
    $('.lv-modal-recent-players-container').hide();
    
    // Sadece oylama geçmişini aç
    $('.lv-modal-voting-container').show(); 
    $('#vote-log').text(GAME_VOTING); 
  })
  $('.lv-modal-perk-refresh-notes').on('click', () => { updatePlayerNotes() })

  // Perk Input Fix
  $('.lv-modal-perk-message-input, .lv-modal-perk-message-mention-input').on('focus', function () { $('textarea').prop('disabled', true); });
  $('.lv-modal-perk-message-input, .lv-modal-perk-message-mention-input').on('blur', function () { $('textarea').prop('disabled', false); });
  
  $('.lv-modal-perk-message-btn').on('click', () => { playerChatHiding(parseInt($('.lv-modal-perk-message-input').val())) })
  $('.lv-modal-perk-message-btn-undo').on('click', () => { undoChatHiding() })
  $('.lv-modal-perk-message-mention-btn').on('click', () => { playerChatHidingMention(parseInt($('.lv-modal-perk-message-mention-input').val())) })
  $('.lv-modal-perk-message-mention-btn-undo').on('click', () => { undoChatHidingMention() })

  // 6. Refresh
  let mevcutDeger = LV_SETTINGS.AUTO_REFRESH_INTERVAL ?? 15;
  $('.lv-modal-auto-refresh').val(mevcutDeger).on('change', function() {
    LV_SETTINGS.AUTO_REFRESH_INTERVAL = parseInt($(this).val());
    saveSetting();
    addChatMsg(`⏱️ Oto-Yenileme: ${LV_SETTINGS.AUTO_REFRESH_INTERVAL === 0 ? 'Kapalı' : LV_SETTINGS.AUTO_REFRESH_INTERVAL + ' dk'}`);
  });

  // 🔥 Harf Duyarlılığı Tıklandığında
$('.lv-modal-checkbox.auto-join-case').on('click', () => {
    LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE = !LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE;
    $('.lv-modal-checkbox.auto-join-case').text(LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE ? '' : '');
    saveSetting();
});
  // AUTO JOIN include
  $('.lv-modal-join-filter-input').on('input', function() { LV_SETTINGS.AUTO_JOIN_FILTER = $(this).val(); saveSetting(); });
  //exclude
  $('.lv-modal-join-exclude-input').on('input', function() { 
      LV_SETTINGS.AUTO_JOIN_EXCLUDE = $(this).val(); 
      saveSetting(); 
  });


  $('.lv-modal-checkbox.auto-join-rooms').on('click', () => {
    LV_SETTINGS.AUTO_JOIN_ROOMS = !LV_SETTINGS.AUTO_JOIN_ROOMS;
    $('.lv-modal-checkbox.auto-join-rooms').text(LV_SETTINGS.AUTO_JOIN_ROOMS ? '' : '');
    
    if (LV_SETTINGS.AUTO_JOIN_ROOMS) {
        LV_SETTINGS.AUTO_CREATE_ROOM = false;
        $('.lv-modal-checkbox.auto-create-room').text('');
        $('.lv-modal-create-template-input').css('opacity', '0.5'); 
        
        handleAutoJoin(); 
        $('.lv-modal-join-filter-input').css('opacity', '1');
        $('.lv-modal-join-exclude-input').css('opacity', '1'); // 🔥 Görünür yap
    } else {
        $('.lv-modal-join-filter-input').css('opacity', '0.5');
        $('.lv-modal-join-exclude-input').css('opacity', '0.5'); // 🔥 Silik yap
    }
    saveSetting();
  });

  // AUTO CREATE
  $('.lv-modal-create-template-input').on('input', function() { LV_SETTINGS.AUTO_CREATE_TEMPLATE_NAME = $(this).val(); saveSetting(); });

  $('.lv-modal-checkbox.auto-create-room').on('click', () => {
    LV_SETTINGS.AUTO_CREATE_ROOM = !LV_SETTINGS.AUTO_CREATE_ROOM;
    $('.lv-modal-checkbox.auto-create-room').text(LV_SETTINGS.AUTO_CREATE_ROOM ? '' : '');

    if (LV_SETTINGS.AUTO_CREATE_ROOM) {
        LV_SETTINGS.AUTO_JOIN_ROOMS = false;
        $('.lv-modal-checkbox.auto-join-rooms').text('');
        $('.lv-modal-join-filter-input').css('opacity', '0.5');

        handleAutoCreate();
        $('.lv-modal-create-template-input').css('opacity', '1');
    } else {
        $('.lv-modal-create-template-input').css('opacity', '0.5');
    }
    saveSetting();
  });

  // 7. GÖRSEL YÜKLEME (Sayfa açılışı)
  $('.lv-modal-checkbox.debug').text(LV_SETTINGS.DEBUG_MODE ? '' : '')
  $('.lv-modal-checkbox.show-hidden-lvl').text(LV_SETTINGS.SHOW_HIDDEN_LVL ? '' : '')
  $('.lv-modal-checkbox.auto-replay').text(LV_SETTINGS.AUTO_REPLAY ? '' : '')
  $('.lv-modal-checkbox.auto-play').text(LV_SETTINGS.AUTO_PLAY ? '' : '')
  $('.lv-modal-checkbox.chat-stats').text(LV_SETTINGS.CHAT_STATS ? '' : '')
  $('.lv-modal-checkbox.player-aura').text(LV_SETTINGS.PLAYER_AURA ? '' : '')
  $('.lv-modal-checkbox.player-notes').text(LV_SETTINGS.PLAYER_NOTES ? '' : '')

  $('.lv-modal-checkbox.auto-join-rooms').text(LV_SETTINGS.AUTO_JOIN_ROOMS ? '' : '');
  // Harf duyarlılığı kutusunun şeklini ayarla (Dolu mu boş mu?)
 $('.lv-modal-checkbox.auto-join-case').text(LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE ? '' : '');
  $('.lv-modal-join-filter-input').val(LV_SETTINGS.AUTO_JOIN_FILTER || "").css('opacity', LV_SETTINGS.AUTO_JOIN_ROOMS ? '1' : '0.5');
  $('.lv-modal-join-exclude-input').val(LV_SETTINGS.AUTO_JOIN_EXCLUDE || "").css('opacity', LV_SETTINGS.AUTO_JOIN_ROOMS ? '1' : '0.5');

  $('.lv-modal-checkbox.auto-create-room').text(LV_SETTINGS.AUTO_CREATE_ROOM ? '' : '');
  $('.lv-modal-create-template-input').val(LV_SETTINGS.AUTO_CREATE_TEMPLATE_NAME || "").css('opacity', LV_SETTINGS.AUTO_CREATE_ROOM ? '1' : '0.5');


  // --- 🔥 INPUT LEAK FIX (YAZI YAZARKEN OYUNA GİTMESİN) ---
  const tumInputlar = [
      '.lv-modal-join-filter-input',        // Join Filtresi
      '.lv-modal-join-exclude-input',       // Yasaklılar
      '.lv-modal-create-template-input',    // Oda kurma adı
      '.lv-modal-perk-message-input',       // Perk mesaj
      '.lv-modal-perk-message-mention-input', // Perk mention
      '.lv-modal-auto-refresh',             // Refresh select
      '#recent-players-log'                 // Son oyuncular logu
  ].join(', ');

  $(tumInputlar).on('keydown keyup keypress', function(e) {
      e.stopPropagation(); // Tuş olayını burada bitir, oyuna gönderme!
  });
  
  // Ekstra Güvenlik: Odaklanınca oyunun klavye dinleyicilerini geçici olarak boşa çıkar
  $(tumInputlar).on('focus', function() {
      // Oyunun chat inputunu bulursak disable edebiliriz ama stopPropagation genelde yeterlidir.
      // Yine de garanti olsun diye window seviyesinde bir flag koyabiliriz (gerekirse).
      // Şimdilik sadece stopPropagation yeterli olacaktır.
  });
  // Başlat
  handleAutoReplay();
  handleAutoJoin();
  handleAutoCreate();
}
function updateAllPlayerAura() {
  PLAYERS.forEach((player) => {
    const playerLabel = `${parseInt(player.gridIdx) + 1} ${player.username}`;
    const el = $(`div:contains("${playerLabel}")`);

    if (el?.length) {
      const grandparent = $(el[el.length - 1].parentElement.parentElement);
      const dropdown = grandparent.find('select.player-status-dropdown');

      const username = player.username;
      if (PLAYERAURAMAP.has(username)) {
        const status = PLAYERAURAMAP.get(username);
        dropdown.val(status);
      } else {
        dropdown.val('none');
      }
    }
  });
}


const getPLAYER = () => {
  log('getPLAYER called')
  fetch('https://core.api-wolvesville.com/players/meAndCheckAppVersion', {
    method: 'PUT',
    headers: getHeaders(),
  })
}

const addPlayerAura = () => {

  PLAYERS.forEach((player) => {
    // console.log(player.username)
    const str = `${parseInt(player.gridIdx) + 1} ${player.username}`
    const el = $(`div:contains("${str}")`)
    const username = player.username
    if (el?.length && username) {
      const dropdown = $('<select></select>')
        .addClass('player-status-dropdown')
        .css({
          width: '40px',
          height: '20px',
          padding: '0px',
          marginLeft: '4px',
          marginRight: '4px',
          border: 'none',
          appearance: 'none',
          zIndex: '10000',
        });

      const options = ['none', 'good', 'bad', 'unk'];
      options.forEach(option => {
        dropdown.append($('<option></option>').val(option).text(option.charAt(0).toUpperCase() + option.slice(1)));
      });

      dropdown.on('click mousedown focus', function (e) {
        e.stopPropagation();
      });



      const grandparent = $(el[el.length - 1].parentElement.parentElement.parentElement);
      if (grandparent.find('select.player-status-dropdown').length === 0) {
        $(el[el.length - 1].parentElement.parentElement.parentElement).append(dropdown);
      }

      dropdown.on('change', function () {
        const selectedValue = dropdown.val();
        let bgColor = 'white'; // default for "None"
        if (selectedValue === 'good') bgColor = 'green';
        else if (selectedValue === 'bad') bgColor = 'red';
        else if (selectedValue === 'unk') bgColor = 'yellow';
        $(this).css('background-color', bgColor);
        PLAYERAURAMAP.set(username, selectedValue);
      });
    }
  })
}

const removePlayerAura = () => {
  // remove player aura
  $('select.player-status-dropdown').remove();
}

const handlePlayerAura = () => {
  // 🔥 DÜZELTME: Hem kendi ayarı (PLAYER_AURA) hem de ANA AYAR (CHAT_STATS) açık olmalı
  if (LV_SETTINGS.CHAT_STATS && LV_SETTINGS.PLAYER_AURA) {
    addChatMsg(' 🍂 Adding player aura')
    PLAYERAURAMAP.clear();
    addPlayerAura()
  } else {
    removePlayerAura()
  }
}

// Function to update text inputs with values from PLAYERNOTESMAP
const updatePlayerNotes = () => {
  PLAYERS.forEach((player) => {
    const username = player.username;
    const str = `${parseInt(player.gridIdx) + 1} ${username}`;
    const el = $(`div:contains("${str}")`);

    if (el?.length && username) {
      const grandparent = $(el[el.length - 1].parentElement.parentElement.parentElement);
      const textInput = grandparent.find('input.player-status-note');

      // Check if the text input exists and update its value from the map
      if (textInput?.length > 0 && PLAYERNOTESMAP.has(username)) {
        const note = PLAYERNOTESMAP.get(username);
        textInput.val(note);
      }
    }
  });
};

const addPlayerNotes = () => {
  PLAYERS.forEach((player) => {
    const str = `${parseInt(player.gridIdx) + 1} ${player.username}`
    const el = $(`div:contains("${str}")`)
    const username = player.username
    if (el?.length && username) {
      const grandparent = $(el[el.length - 1].parentElement.parentElement.parentElement);

      // Only add if not already present
      if (grandparent.find('input.player-status-note')?.length === 0) {
        // Create the text input
        const textInput = $('<input type="text" />')
          .addClass('player-status-note')
          .css({
            display: 'block',
            width: '60px',
            height: '20px',
            fontSize: '14px',
            marginBottom: '2px',
            marginLeft: '4px',
            zIndex: '10000',
            position: 'relative',
            pointerEvents: 'auto',
          });

        // Prevent clicks from propagating
        textInput.on('click mousedown focus', function (e) {
          e.stopPropagation();
        });

        textInput.on('focus', function () {
          // Disable all textareas
          $('textarea').prop('disabled', true);
        });

        textInput.on('blur', function () {
          // Re-enable all textareas after focus is lost
          $('textarea').prop('disabled', false);
        });

        // console.log(`Added note for ${username}`);
        textInput.on('input', function () {
          const note = textInput.val();
          PLAYERNOTESMAP.set(username, note);
        });

        // Append text input to the grandparent element
        grandparent.append(textInput);
      }
    }
  });
};

const removePlayerNotes = () => {
  // remove player aura
  $('input.player-status-note').remove();
}

const handlePlayerNotes = () => {
  // 🔥 DÜZELTME: Hem kendi ayarı (PLAYER_NOTES) hem de ANA AYAR (CHAT_STATS) açık olmalı
  if (LV_SETTINGS.CHAT_STATS && LV_SETTINGS.PLAYER_NOTES) {
    addChatMsg(' 🍂 Adding player notes')
    PLAYERNOTESMAP.clear();
    addPlayerNotes()
  } else {
    removePlayerNotes()
  }
}


const playerChatHiding = (givenNumber) => {
  const el = $('div:contains("Day ")');
  const lastEl = el.last()[0];
  let lastClass = '';

  if (lastEl && lastEl.className) {
    const classList = lastEl.className.trim().split(/\s+/);
    lastClass = classList[classList.length - 1];
  }

  if (lastClass) {
    $('span.' + lastClass).each(function () {
      const spanText = $(this).text().trim();
      const firstWord = spanText.split(" ")[0];

      if (/^\d/.test(firstWord) && firstWord !== givenNumber.toString()) {
        const parentDiv = $(this).closest('div');
        parentDiv.hide();
      }
    });
  }
};

const undoChatHiding = () => {
  const el = $('div:contains("Day ")');
  const lastEl = el.last()[0];
  let lastClass = '';

  if (lastEl && lastEl.className) {
    const classList = lastEl.className.trim().split(/\s+/);
    lastClass = classList[classList.length - 1];
  }

  if (lastClass) {
    $('span.' + lastClass).each(function () {
      const parentDiv = $(this).closest('div');
      parentDiv.show(); // Show previously hidden parent
    });
  }
};

const playerChatHidingMention = (givenNumber) => {
  const el = $('div:contains("Day ")');
  const lastEl = el.last()[0];
  let lastClass = '';

  if (lastEl && lastEl.className) {
    const classList = lastEl.className.trim().split(/\s+/);
    lastClass = classList[classList.length - 1];
  }

  if (lastClass) {
    $('span.' + lastClass).each(function () {
      const parentDiv = $(this).closest('div');

      const fullDivText = parentDiv.text();
      const spanText = parentDiv.find('span.' + lastClass).text();

      // Remove spanText from divText to get text outside span
      const outsideSpanText = fullDivText.replace(spanText, '');

      const numberPattern = new RegExp(`\\b${givenNumber}\\b`);

      // If number is NOT in the outsideSpanText, hide it
      if (!numberPattern.test(outsideSpanText)) {
        parentDiv.hide();
      }
    });
  }
};

const undoChatHidingMention = () => {
  const el = $('div:contains("Day ")');
  const lastEl = el.last()[0];
  let lastClass = '';

  if (lastEl && lastEl.className) {
    const classList = lastEl.className.trim().split(/\s+/);
    lastClass = classList[classList.length - 1];
  }

  if (lastClass) {
    $('span.' + lastClass).each(function () {
      const parentDiv = $(this).closest('div');
      parentDiv.show();
  });
  }
};


const handleAutoReplay = () => {
  if (LV_SETTINGS.AUTO_REPLAY) {
    // console.log('[Börü] Auto Replay: Aktif');

    function click(element) {
      visualizeClick(element);
      const rect = element.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      window.postMessage({ type: 'FROM_PAGE_CLICK', x, y }, '*');
    }

    let lastPlayAgainTime = 0;

    setInterval(() => {
      if (!LV_SETTINGS.AUTO_REPLAY) return

      const now = Date.now();

      // 1. START GAME (Her zaman basabilir)
      const startGame = $('div:contains("START GAME"):visible');
      if (startGame?.length) click(startGame[startGame.length - 1])

      // 2. CONTINUE (Her zaman basabilir)
      const Continue = $('div:contains("Continue"):visible');
      if (Continue?.length) click(Continue[Continue.length - 1])

      // 3. OK BUTONU (ÇAKIŞMA ÇÖZÜMÜ 🔥)
      // Auto Replay, "OK" butonuna SADECE "Play again" butonu da ekrandaysa basmalı.
      // Yoksa şablon seçerkenki OK butonuna basıp durur.
      const playAgainVisible = $('div:contains("Play again"):visible').length > 0;
      
      const okButton = $('div:contains("OK"):visible');
      
      // Eğer OK butonu varsa VE (Play Again görünüyorsa VEYA Oyun Bitti statüsündeysek)
      if (okButton?.length && (playAgainVisible || GAME_STATUS === 'over')) {
          click(okButton[okButton.length - 1]);
          return;
      }

      // 4. PLAY AGAIN
      const playAgain = $('div:contains("Play again"):visible');
      if (playAgain?.length && (now - lastPlayAgainTime > 5000)) {
          click(playAgain[playAgain.length - 1]);
          lastPlayAgainTime = now; 
      }
      
    }, 1000)
  }
}
const handleAutoJoin = () => {
  if (LV_SETTINGS.AUTO_JOIN_ROOMS) {
    console.log(`[Börü] Auto Join: Tek Değişkenli Tren Modu 🚂`);

    function click(element) {
      visualizeClick(element);
      const rect = element.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      window.postMessage({ type: 'FROM_PAGE_CLICK', x, y }, '*');
    }

    const joinLoop = setInterval(() => {
      // Kapalıysa durdur
      if (!LV_SETTINGS.AUTO_JOIN_ROOMS) { clearInterval(joinLoop); return; }
      
      // Yazı yazıyorsan dur
      if ($('.lv-modal-join-filter-input').is(':focus') || $('.lv-modal-join-exclude-input').is(':focus')) return;

      // 🔥 İŞTE O TEK DEĞİŞKEN (ADAY BUTON)
      let tiklanacakButon = null;

      // 1. DURAK: PLAY BUTONU
      // (Eğer ekranda Play varsa adayımız o olur)
      const btnPlay = $('div:contains("PLAY"):visible').not(':contains("WITH")');
      if (btnPlay.length > 0) {
          tiklanacakButon = btnPlay[btnPlay.length - 1];
      }

      // 2. DURAK: CUSTOM GAMES
      // (Eğer ekranda bu varsa, Play yoktur zaten. Adayımız bu olur)
      const btnCustom = $('div:contains("CUSTOM GAMES"):visible')
          .filter(function() { return $(this).text().trim() === "CUSTOM GAMES" && !$(this).text().includes("Premium"); });
      if (btnCustom.length > 0) {
          tiklanacakButon = btnCustom[btnCustom.length - 1];
      }

      // 3. DURAK: REFRESH BUTONU
      // (Bunu odayı aramadan ÖNCE koyuyoruz. Eğer aşağıda oda bulamazsa buna tıklasın diye)
      const btnRefresh = $('div:contains("REFRESH"):visible');
      if (btnRefresh.length > 0) {
          tiklanacakButon = btnRefresh[btnRefresh.length - 1];
      }

      // 4. DURAK: ODA SEÇİMİ (VILL WIN veya FİLTRE)
      // (Eğer oda bulursak, yukarıdaki Refresh adayını SİLER, yerine Odayı koyarız. Çünkü oda girmek > yenilemek)
      const filterInput = LV_SETTINGS.AUTO_JOIN_FILTER;
      const excludeText = LV_SETTINGS.AUTO_JOIN_EXCLUDE;
      const caseSensitive = LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE;

      let targetRooms = [];
      if (filterInput && filterInput.trim() !== "") {
          const filters = filterInput.split(',').map(f => f.trim()).filter(f => f.length > 0);
          
          targetRooms = $('div:visible').filter(function() {
              const nodeText = $(this).text(); 
              if (!nodeText) return false;

              // Yasaklı Kontrolü
              if (excludeText && excludeText.trim() !== "") {
                  const badWords = excludeText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
                  if (badWords.some(bad => nodeText.toLowerCase().includes(bad))) return false;
              }

              // Filtre Kontrolü
              return filters.some(filterWord => {
                  return caseSensitive ? nodeText.includes(filterWord) : nodeText.toLowerCase().includes(filterWord.toLowerCase());
              });
          });
      } else {
          // Filtre yoksa VILL WIN
          targetRooms = $('div:contains("VILL WIN"):visible');
      }

      // Eğer uygun oda bulduysak, yeni adayımız odadır!
      if (targetRooms.length > 0) {
          tiklanacakButon = targetRooms[targetRooms.length - 1];
      }

      // 5. DURAK: JOIN BUTONU (Final Boss)
      // (Eğer sağda JOIN butonu çıktıysa her şeyi unut, ona bas. En büyük öncelik bunda)
      const btnJoin = $('div:contains("Join"):visible');
      if (btnJoin.length > 0) {
          tiklanacakButon = btnJoin[btnJoin.length - 1];
      }

      // 🔥 SONUÇ: DÖNGÜ BİTTİ, ELİMİZDE NE VARSA ONA BASIYORUZ
      if (tiklanacakButon) {
          click(tiklanacakButon);
      }

    }, 1500);
  }
}
const handleAutoCreate = () => {
  if (LV_SETTINGS.AUTO_CREATE_ROOM) {
      console.log(`[Börü] Auto Create: Tek Değişkenli Tren Modu 🚂 (Hedef: ${LV_SETTINGS.AUTO_CREATE_TEMPLATE_NAME})`);
      
      function click(element) {
        visualizeClick(element);
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        window.postMessage({ type: 'FROM_PAGE_CLICK', x, y }, '*');
      }

      const createLoop = setInterval(() => {
         // Kapatıldıysa dur
         if (!LV_SETTINGS.AUTO_CREATE_ROOM) { clearInterval(createLoop); return; }
         
         // Yazı yazıyorsan dur
         if ($('.lv-modal-create-template-input').is(':focus')) return;

         // 🔥 TEK DEĞİŞKEN (ADAY BUTON)
         let tiklanacakButon = null;

         // 1. DURAK: PLAY BUTONU
         const btnPlay = $('div:contains("PLAY"):visible').not(':contains("WITH")');
         if (btnPlay.length > 0) {
             tiklanacakButon = btnPlay[btnPlay.length - 1];
         }

         // 2. DURAK: CUSTOM GAMES
         const btnCustom = $('div:contains("CUSTOM GAMES"):visible');
         if (btnCustom.length > 0) {
             tiklanacakButon = btnCustom[btnCustom.length - 1];
         }
         
         // 3. DURAK: CREATE GAME (Oda Kur Butonu)
         const btnCreate = $('div:contains("CREATE GAME"):visible');
         if (btnCreate.length > 0) {
             tiklanacakButon = btnCreate[btnCreate.length - 1];
         }
         
         // 4. DURAK: ŞABLON MENÜSÜNÜ AÇAN BUTON (Klasör/Dosya İkonu)
         // Eğer bu görünüyorsa menüdeyiz demektir. Şablonu bulamazsak buna basarız ki liste açılsın.
         const btnTemplateMenu = $('.css-g5y9jx.r-1awozwy.r-18u37iz.r-17s6mgv > div:nth-child(2) > div:first-child > div:first-child > div:first-child').filter(':visible');
         if (btnTemplateMenu.length > 0) {
             tiklanacakButon = btnTemplateMenu[btnTemplateMenu.length - 1];
         }

         // 5. DURAK: HEDEF ŞABLON (En Yüksek Öncelik - Final Boss)
         // Eğer hedef şablonun ismini ekranda görüyorsak, yukarıdaki bütün butonları (Klasör ikonunu vs.) SİL, direkt buna odaklan.
         const templateName = LV_SETTINGS.AUTO_CREATE_TEMPLATE_NAME;
         if(templateName) {
             const btnTargetTemplate = $(`div:contains("${templateName}"):visible`);
             if (btnTargetTemplate.length > 0) {
                 tiklanacakButon = btnTargetTemplate[btnTargetTemplate.length - 1];
             }
         }

         // 🔥 SONUÇ: TRENDEN İNEN ŞANSLI BUTONA TIKLA
         if (tiklanacakButon) {
             click(tiklanacakButon);
             if (tiklanacakButon.innerText.includes(templateName)) {
              setTimeout(() => {
                 const btnCreate = $('div:contains("CREATE GAME"):visible');
              click(btnCreate[btnCreate.length - 1]); // Şablona bastıktan sonra CREATE'e de bas
              }, 650); // Yarım saniye bekle ki şablon seçimi işlesin
             }
              
         }

      }, 2000); // 2 saniyede bir kontrol (Create işlemleri yavaş yüklenir, 2sn iyidir)
  }
}

const saveSetting = () => {
  // Ayarları tek tek yazmak yerine hepsini otomatik paketle
  localStorage.setItem('lv-settings', JSON.stringify(LV_SETTINGS))
  log("Ayarlar Kaydedildi (Otomatik):")
  // log(settings) yerine direkt global değişkeni basabilirsin veya boşver
}

const log = (m) => {
  if (LV_SETTINGS.DEBUG_MODE) console.log(m)
}

const loadSettings = () => {
  const settings = localStorage.getItem('lv-settings')
  if (settings) {
    try {
      // 🔥 SİHİRLİ DOKUNUŞ: Object.assign
      // Bu komut, mevcut ayarların (yeni eklediklerin) üzerine kayıtlı olanları ekler.
      // Böylece hafızada olmayan yeni özellikler (Auto Create gibi) silinmez!
      LV_SETTINGS = Object.assign({}, LV_SETTINGS, JSON.parse(settings))
    } catch (e) {
      console.log("Ayarlar bozuktu, varsayılanlar yüklendi.")
      saveSetting()
    }
  } else {
    saveSetting()
  }
  log("Yüklenen Ayarlar:")
  log(LV_SETTINGS)
}

const delay = (time = 500) =>
  new Promise((r) => {
    setTimeout(r, time)
  })

const lootBox = async (c = 0) => {
  if (c === 40) {
    addChatMsg(`⏳ wait 1 min before opening again`)
    await delay(1000 * 60 * 1)
    c = 0
  }
  await fetch(`https://core.api-wolvesville.com/inventory/lootBoxes/${INVENTORY.lootBoxes[0].id}`, {
    method: 'POST',
    headers: getHeaders(),
  }).then((rep) => {
    if (rep.status === 200) {
      INVENTORY.lootBoxes.shift()
      $('.lv-modal-loot-boxes-status').text(`(${INVENTORY.lootBoxes.length} 🎁 available)`)
      if (INVENTORY.lootBoxes?.length) {
        return lootBox(c + 1)
      }
    }
  })
}


const getRole = (id) => {
  return JSON.parse(localStorage.getItem('roles-meta-data')).roles[id]
}

const setRole = (id) => {
  ROLE = getRole(id)
}

const getAuthtokens = () => {
  try {
    const authtokens = JSON.parse(localStorage.getItem('authtokens'));
    if (authtokens) {
      console.log("authtokens found baby");
      AUTHTOKENS.idToken = authtokens.idToken || '';
      AUTHTOKENS.refreshToken = authtokens.refreshToken || '';
    } else {
      console.log('authtokens not found', authtokens);
    }
  } catch (e) {
    console.log('Failed to parse authtokens from localStorage', e);
  }
}

const requestsToCatch = {
  'https://auth.api-wolvesville.com/players/signUpWithEmailAndPassword': (data) => {
    if (data?.idToken) {
      AUTHTOKENS.idToken = data?.idToken
      AUTHTOKENS.refreshToken = data.refreshToken
    }
  },
  'https://auth.api-wolvesville.com/players/createIdToken': (data) => {
    if (data?.idToken) {
      AUTHTOKENS.idToken = data?.idToken
      AUTHTOKENS.refreshToken = data.refreshToken
    }
  },
  'https://auth.api-wolvesville.com/cloudflareTurnstile/verify': (data) => {
    if (data.jwt) {
      AUTHTOKENS['Cf-JWT'] = data.jwt || ''
      addChatMsg('🛡️ Cloudflare token intercepted')
    }
  },
  'https://core.api-wolvesville.com/players/meAndCheckAppVersion': (data) => {
    if (data.player) {
      const { username, level } = data.player
      !PLAYER && addChatMsg(`👋 ${username} (lvl ${level})`)
      PLAYER = data.player
      sendBotLoginNotification(data.player); // 👈 Logu Tetikle
    }
  },
  'https://core.api-wolvesville.com/inventory/lootBoxes/': (data) => {
    if (data.items?.length) {
      let silver = 0
      let loots = []
      data.items.forEach((item) => {
        loots.push(item.type)
        if (item.duplicateItemCompensationInSilver) {
          silver += item.duplicateItemCompensationInSilver
        } else if (item.type === 'SILVER_PILE') {
          silver += item.silverPile.silverCount
        }
      })
      INVENTORY.silverCount += silver
      addChatMsg(`🎁 ${loots.join(', ')} and 🪙${silver}`)
    }
  },
  'https://core.api-wolvesville.com/inventory?': (data, url) => {
    if (data.silverCount) {
      INVENTORY = data
    }
    if (data.lootBoxes !== undefined) {
      const { lootBoxes } = data
      if (lootBoxes?.length) {
        const cardBoxes = lootBoxes.filter((v) => v.event === 'LEVEL_UP_CARD').length
        const tmp = cardBoxes ? `(including ${cardBoxes} role cards)` : ''
        addChatMsg(`🎁 ${lootBoxes.length} boxes available ${tmp}`)
      }
      $('.lv-modal-loot-boxes-status').text(`(${lootBoxes.length} 🎁 available)`)
    }
  },
  'https://game.api-wolvesville.com/api/public/game/running': (data) => {
    return new Response(JSON.stringify({ running: false }))
  },
  'https://core.api-wolvesville.com/rewards/goldenWheelSpin': (data) => {
    if (data?.length) {
      const winner = data.find((v) => v.winner)
      if (winner) {
        const tmp = winner.silver > 0 ? `🪙${winner.silver}` : winner.type
        addChatMsg(`${tmp} looted from 🌹 wheel`)
        INVENTORY.silverCount += winner.silver
        INVENTORY.roseCount -= 30
        setChatState()
      }
    }
  },
  'https://core.api-wolvesville.com/rewards/wheelRewardWithSecret/': (data) => {
    if (data.code) {
      addChatMsg(`Error: You probably hit the spins limit for today ${JSON.stringify(data)}`, true, 'color: #ff603b;')
      $('.lv-modal-gold-wheel-status').text(`Unavailable`).css({ color: '#ff603b' })
    } else if (data?.length) {
      const winner = data.find((v) => v.winner)
      if (winner) {
        const tmp = winner.silver > 0 ? `🪙${winner.silver}` : winner.type
        INVENTORY.silverCount += winner.silver
        GOLD_WHEEL_SPINS_COUNTER += 1
        GOLD_WHEEL_SILVER_SESSION += winner.silver
        PLAYER.silverCount += winner.silver
        addChatMsg(
          `#${GOLD_WHEEL_SPINS_COUNTER}: ${tmp} looted from 🪙 wheel (session: 🪙${GOLD_WHEEL_SILVER_SESSION})`
        )
        setChatState()
      }
    }
  },
  'https://core.api-wolvesville.com/rewards/wheelItems/v2': (data) => {
    if (data.nextRewardAvailableTime) {
      $('.lv-modal-gold-wheel-status')
        .text(
          `Unavailable until ${new Date(data.nextRewardAvailableTime).toLocaleString('en-US', {
            timeZoneName: 'short',
          })}`
        )
        .css({ color: '#ff603b' })
    } else {
      $('.lv-modal-gold-wheel-status').text(`Available`).css({ color: '#67c23a' })
    }
  },
}

const fetchInterceptor = () => {
  const { fetch: origFetch } = window
  window.fetch = async (...args) => {
    const url = args[0]

    if (
      url.includes('/players/webBo') ||
      url.includes('/players/webAutomatio') ||
      url.includes('[native code]')
    ) {
      return
    }

    if (url.startsWith('https://core.api-wolvesville.com/inventory?')) {
      args[0] = 'https://core.api-wolvesville.com/inventory?'
    }

    let req
    if (args[0] instanceof Request) {
      req = args[0].clone()
    } else {
      const input = args[0]
      const init = args[1] || {}
      req = new Request(input, init)
    }

    for (const [key, value] of req.headers.entries()) {
      const lowerKey = key.toLowerCase()
      if (lowerKey === 'authorization' && value.startsWith('Bearer ')) {
        if(!AUTHTOKENS.idToken){
          console.log('auto token found in api')
        }
        AUTHTOKENS.idToken = value.slice(7)
      }
      if (lowerKey === 'cf-jwt') {
        AUTHTOKENS['Cf-JWT'] = value
      }
    }

    const catchMethod = requestsToCatch[
      Object.keys(requestsToCatch).find((_url) => url.startsWith(_url))
    ]

    if (!!catchMethod) {
      log('fetch called with args:', args)
      const response = await origFetch(...args)
      const mockedResponse = await response
        .clone()
        .json()
        .then((data) => {
          log('intercepted response data:', data)
          return catchMethod(data)
        })
      if (mockedResponse) log(mockedResponse, response)
      return mockedResponse || response
    } else {
      return origFetch(...args)
    }
  }
}


function socketInterceptor(fn) {
  fn = fn || log
  let property = Object.getOwnPropertyDescriptor(MessageEvent.prototype, 'data')
  const data = property.get
  function lookAtMessage() {
    let socket = this.currentTarget instanceof WebSocket
    if (!socket) return data.call(this)
    let msg = data.call(this)
    Object.defineProperty(this, 'data', { value: msg })
    fn({ data: msg, socket: this.currentTarget, event: this })
    return msg
  }
  property.get = lookAtMessage
  Object.defineProperty(MessageEvent.prototype, 'data', property)
}

const onMessage = (message) => {
  const messageId = message.data.slice(0, 2)
  if (messageId === '42') {
    const parsedMessage = messageParser(message.data)
    log(parsedMessage)
    if (parsedMessage?.length) {
      messageDispatcher(parsedMessage)
    }
  }
}

const connectRegularSocket = () => {
  const url = `wss://${SERVER_URL.replace('https://', '')}/`
  
  REGULARSOCKET = _myExtensionSocketIO_(url, {
    query: {
      firebaseToken: AUTHTOKENS.idToken,
      gameId: GAME_ID,
      reconnect: true,
      ids: 1,
      'Cf-JWT': AUTHTOKENS['Cf-JWT'],
      apiV: 1,
      EIO: 4,
    },
    transports: ['websocket'],
  })

  // ============================================================
  // 🔥 FIREBASE GÖNDERİCİ (KATEGORİLİ & USER ID'Lİ)
  // ============================================================
  
  // DİKKAT: Buraya sadece ana linki yaz (sonunda / veya .json OLMASIN)
  const FIREBASE_BASE_URL = "https://boru-data-center-default-rtdb.europe-west1.firebasedatabase.app"; 

  const messageQueue = [];
  let isSending = false;

  const processQueue = async () => {
      if (isSending || messageQueue.length === 0) return;
      isSending = true;
      
      const payload = messageQueue.shift();

      // 🔥 URL ARTIK DİNAMİK: oyunlar / [GAME_ID] / .json
      // Bu sayede her oyun kendi klasöründe toplanır.
      const targetUrl = `${FIREBASE_BASE_URL}/oyunlar/${payload.game_id}.json`;

      try {
          await fetch(targetUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
          });
      } catch (e) {
          console.error("[Börü Firebase] Hata:", e);
      }

      isSending = false;
      processQueue(); 
  };

  const sendToFirebase = (data, type) => {
      if (!LV_SETTINGS.TELEMETRY_ACTIVE) return;
      if (!data.msg) return;

      let authorName = "Bilinmiyor";
      let authorRole = "Gizli";
      let authorId = "System"; // Varsayılan ID
      
      if (type === 'system') {
          authorName = "Sistem";
          authorRole = "Sunucu";
          authorId = "SERVER";
      } else {
          const author = PLAYERS.find(p => p.id === data.authorId);
          if (author) {
              const authorIdx = parseInt(author.gridIdx) + 1;
              authorName = `${authorIdx}. ${author.username}`; 
              authorId = author.id; // 🔥 GERÇEK USER ID BURADA
              
              if (author.role) {
                  const r = getRole(author.role);
                  authorRole = r ? r.name : "Bilinmiyor";
              }
          }
      }

      const dataPacket = {
          game_id: GAME_ID, // Klasörleme için kullanıyoruz ama verinin içinde de dursun
          mode: CURRENT_GAME_MODE || 'Unknown',
          timestamp: new Date().toISOString(),
          type: type, 
          sender: authorName,
          user_id: authorId, // 🔥 EKLENDİ
          role: authorRole,
          message: data.msg
      };

      messageQueue.push(dataPacket);
      processQueue();
  };
  // ============================================================

  // --- DİNLEYİCİLER ---
  REGULARSOCKET.on('game:chat-public:msg', (_data) => { sendToFirebase(JSON.parse(_data), 'public'); });
  REGULARSOCKET.on('game:chat-werewolves:msg', (_data) => { sendToFirebase(JSON.parse(_data), 'werewolf'); });

  REGULARSOCKET.on('game-players-killed', (_data) => {
      const data = JSON.parse(_data);
      data['victims'].forEach((victim) => {
          const player = PLAYERS.find((v) => v?.id === victim.targetPlayerId);
          if (player) {
              const pNum = parseInt(player.gridIdx) + 1;
              // Ölen kişinin ID'sini de gönderelim mi? Şimdilik Sistem mesajı olduğu için SERVER kalsın.
              sendToFirebase({ msg: `ÖLÜM: ${pNum}. ${player.username} öldü. Sebep: ${victim.cause} (Rolü: ${victim.targetPlayerRole})` }, 'system');
          }
      });
  });

  REGULARSOCKET.on('game-night-started', () => { sendToFirebase({ msg: "DÖNGÜ: GECE BAŞLADI" }, 'system'); });
  REGULARSOCKET.on('game-day-voting-started', () => { sendToFirebase({ msg: "DÖNGÜ: OYLAMA BAŞLADI" }, 'system'); });
  
  REGULARSOCKET.on('disconnect', () => { addChatMsg('🤖 Parallel socket disconnected'); REGULARSOCKET = undefined })
  REGULARSOCKET.on('game-joined', () => { addChatMsg('🤖 Parallel socket connected') })

  REGULARSOCKET.on('game-over-awards-available', (_data) => {
    DAY_COUNT = 0; DAY_VOTING = []; GAME_VOTING = "";
    sendToFirebase({ msg: "OYUN BİTTİ" }, 'system');

    const data = JSON.parse(_data)
    if (data.playerAward.canClaimDoubleXp) {
      REGULARSOCKET.emit('game-over-double-xp')
      addChatMsg('Claim double xp', true, 'color:rgb(17, 255, 0);')
    } else {
      TOTAL_XP_SESSION += data.playerAward.awardedTotalXp
      addChatMsg(`🧪 ${data.playerAward.awardedTotalXp} xp`)
      if (data.playerAward.awardedLevels) {
        PLAYER.level += data.playerAward.awardedLevels
        TOTAL_UP_LEVEL += data.playerAward.awardedLevels
        log(`🆙 ${PLAYER.level}`)
      }
      setTimeout(() => { REGULARSOCKET.disconnect() }, 500)
    }
  })
  
  REGULARSOCKET.onAny((...args) => { log(args) })
}

const connectSocket = () => {
  console.log("mr socket called");
  var LOVERS = []
  var DEADS = []
  var JW_TARGET = undefined
  var CHAT_WW_SENDED = false
  var WOLVES = []
  var TARGET_WW_VOTE = undefined
  // --- YENİ EKLENEN: DİSCORD GÖNDERİCİ FONKSİYONU ---
// 🔥 YARDIMCI FONKSİYON: Veriyi content.js'e postala
 /* const sendToDiscord = (data, type) => {
      if (!LV_SETTINGS.DISCORD_WEBHOOK_URL || !data.msg) return;

      const author = PLAYERS.find(p => p.id === data.authorId);
      const authorName = author ? author.username : "Bilinmiyor";
      const authorRole = author && author.role ? getRole(author.role).name : "Gizli";
      
      const color = type === 'werewolf' ? 15158332 : 3447003; // Kırmızı veya Mavi
      const title = type === 'werewolf' ? "🐺 Kurt Sohbeti" : "📢 Genel Sohbet";

      // FETCH YOK! window.postMessage VAR!
      window.postMessage({
          type: "FROM_GAME_TO_DISCORD",
          webhookUrl: LV_SETTINGS.DISCORD_WEBHOOK_URL,
          payload: {
              username: "Börü AI Collector",
              avatar_url: "https://i.imgur.com/4M34hi2.png",
              embeds: [{
                  title: title,
                  description: data.msg,
                  color: color,
                  fields: [
                      { name: "Oyuncu", value: authorName, inline: true },
                      { name: "Rol", value: authorRole, inline: true }
                  ],
                  footer: { text: `Game ID: ${GAME_ID} | ⏰ ${new Date().toLocaleTimeString()}` }
              }]
          }
      }, "*");
  };*/
  // ----------------------------------------------------
  const url = `wss://${SERVER_URL.replace('https://', '')}/`
  SOCKET = _myExtensionSocketIO_(url, {
    query: {
      firebaseToken: AUTHTOKENS.idToken,
      gameId: GAME_ID,
      reconnect: true,
      ids: 1,
      'Cf-JWT': AUTHTOKENS['Cf-JWT'],
      apiV: 1,
      EIO: 4,
    },
    transports: ['websocket'],
  })

  SOCKET.on('disconnect', () => {
    addChatMsg('🤖 Parallel socket disconnected')
    SOCKET = undefined
  })
  SOCKET.on('game-joined', () => {
    addChatMsg('🤖 Parallel socket connected')
  })
  SOCKET.on('game-players-killed', (_data) => {
    const data = JSON.parse(_data)
    data['victims'].forEach((victim) => {
      const player = PLAYERS.find((v) => v?.id === victim.targetPlayerId)
      if (player) {
        if (player) DEADS.push(player?.id)
        addChatMsg(
          `☠️ ${parseInt(player.gridIdx) + 1}. ${player.username} (${victim.targetPlayerRole}) by ${victim.cause}`
        )
      } else {
        console.error("dead player not found")
      }
    })
  })
  SOCKET.on('game-cupid-lover-ids-and-roles', (_data) => {
    const data = JSON.parse(_data)
    if (!PLAYER) {
      getPLAYER();
    }
    if (PLAYER && ROLE) {
      const loverPlayerIds = data.loverPlayerIds.filter((v) => v !== PLAYER?.id)
      const loverRoles = data.loverRoles.filter((v) => v !== ROLE?.id)
      LOVERS = loverPlayerIds.map((playerId, i) => ({ id: playerId, role: loverRoles[i] }))
      if (LOVERS?.length === 1) {
        const lover1 = PLAYERS.find((v) => v?.id === LOVERS[0]?.id)
        addChatMsg(`💘 Your lover is ${lover1.gridIdx + 1}. ${lover1.username} (${LOVERS[0].role})`)
      } else if (LOVERS?.length === 2) {
        const lover1 = PLAYERS.find((v) => v?.id === LOVERS[0]?.id)
        const lover2 = PLAYERS.find((v) => v?.id === LOVERS[1]?.id)
        addChatMsg(
          `💘 Your lovers are ${lover1.gridIdx + 1}. ${lover1.username} (${LOVERS[0].role}) and ${lover2.gridIdx + 1
          }. ${lover2.username} (${LOVERS[1].role})`
        )
      } else {
        console.error("Couple not found ", data);
      }
    } else {
      console.error("PLAYER or ROLE not found", PLAYER, ROLE);
    }
  })
  SOCKET.on('game-night-started', () => {

    // if (DAY_COUNT > 0) {
    //   // we will add DAY {DAY_COUNT} to the div
    //   const voteLogDiv = document.getElementById('vote-log');
    //   let output = `Day ${DAY_COUNT}:\n`;
    //   // then we will add DAY_VOTING[even] 👉 DAY_VOTING[odd] for all the history
    //   for (let i = 0; i < DAY_VOTING.length; i += 2) {
    //     const voterid = DAY_VOTING[i];
    //     const targetid = DAY_VOTING[i + 1];
    //     const voterPlayer = PLAYERS.find((v) => v?.id === voterid)
    //     const targetPlayer = PLAYERS.find((v) => v?.id === targetid)
    //     const voterNo = voterPlayer.gridIdx + 1;
    //     const voterName = voterPlayer.username;
    //     const targetNo = targetPlayer.gridIdx + 1;
    //     const targetName = targetPlayer.username;

    //     output += `  ${voterNo} ${voterName} 👉 ${targetNo} ${targetName}\n`;
    //   }
    //   GAME_VOTING += output;
    //   // console.log("Output after Day", output);
    //   // console.log("TOTAL OUTPUT ", GAME_VOTING);

    //   // then we will clear the DAY_VOTING and increase day = day + 1 ;
    // }
    // DAY_VOTING = [];
    // DAY_COUNT++;

    setTimeout(() => {
      if (ROLE && ROLE.team === 'WEREWOLF') {
        const lover = LOVERS.find((v) => getRole(v.role).team !== 'WEREWOLF')
        if (lover) {
          const targetPlayer = PLAYERS.find((v) => v?.id === lover?.id)
          if (targetPlayer) {
            addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
          }
          TARGET_WW_VOTE = lover?.id
          SOCKET.emit('game-werewolves-vote-set', JSON.stringify({ targetPlayerId: lover?.id }))
        }
      }
    }, 1000)
  })
  SOCKET.on('game-werewolves-set-roles', (_data) => {
    const data = JSON.parse(_data)
    WOLVES = Object.entries(data.werewolves).map(([id, role]) => ({ id, role }))
    if (
      !CHAT_WW_SENDED &&
      LOVERS?.length &&
      WOLVES?.length &&
      ROLE.team === 'WEREWOLF' &&
      ROLE?.id === 'junior-werewolf' &&
      LOVERS.find((v) => getRole(v.role).team !== 'WEREWOLF')
    ) {
      CHAT_WW_SENDED = true
      setTimeout(() => {
        SOCKET.emit('game:chat-werewolves:msg', JSON.stringify({ msg: `Who?` }))
      }, 2000)
    }
  })
  SOCKET.on('game:chat-werewolves:msg', (_data) => {
    const data = JSON.parse(_data)
    // Discord'a Gönder (Kırmızı)
   // sendToDiscord(data, 'werewolf');
    // Case wolf: answer when someone write Who?
    if (
      ROLE &&
      ROLE.team === 'WEREWOLF' &&
      data.authorId !== PLAYER?.id &&
      data.msg &&
      data.msg.toLowerCase().includes('who')
    ) {
      const lover = PLAYERS.find((v) => v?.id === LOVERS[0]?.id)
      if (lover) {
        setTimeout(() => {
          SOCKET.emit('game:chat-werewolves:msg', JSON.stringify({ msg: `${lover.gridIdx + 1}` }))
        }, 1000)
      }
    }
    // Case you are junior: extract grid number from chat
    if (ROLE && ROLE?.id === 'junior-werewolf' && data.msg && data.authorId !== PLAYER?.id) {
      const numbers = data.msg.match(/\d+/)
      if (numbers && numbers?.length) {
        const gridIdx = parseInt(numbers[0])
        const targetPlayer = PLAYERS.find((v) => v.gridIdx + 1 === gridIdx)
        if (targetPlayer) {
          JW_TARGET = targetPlayer.id
          addChatMsg(`🐾 Select ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
          SOCKET.emit('game-junior-werewolf-selected-player', JSON.stringify({ targetPlayerId: targetPlayer.id }))
        }
      }
    }
  })
  SOCKET.on('game-werewolves-vote-set', (_data) => {
    const data = JSON.parse(_data)
    if (data.playerId === PLAYER?.ID) return
    if (!JW_TARGET && ROLE && ROLE?.id === 'junior-werewolf' && data.playerId !== PLAYER?.id) {
      JW_TARGET = data.targetPlayerId
      const targetPlayer = PLAYERS.find((v) => v?.id === data.targetPlayerId)
      if (targetPlayer) {
        addChatMsg(`🐾 Select ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
      }
      SOCKET.emit('game-junior-werewolf-selected-player', JSON.stringify({ targetPlayerId: data.targetPlayerId }))
    }
    // Case your teammate is junior wolf and you're not
    if (
      ROLE &&
      ROLE?.id !== 'junior-werewolf' &&
      WOLVES.find((v) => v.role === 'junior-werewolf' && v?.id === data.playerId)
    ) {
      const targetPlayer = PLAYERS.find((v) => v?.id === data.targetPlayerId)
      setTimeout(() => {
        if (targetPlayer) {
          addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
        }
        if (TARGET_WW_VOTE !== data.targetPlayerId) {
          TARGET_WW_VOTE = data.targetPlayerId
          SOCKET.emit('game-werewolves-vote-set', JSON.stringify({ targetPlayerId: data.targetPlayerId }))
        }
      }, 1000)
    } else if (
      ROLE &&
      ROLE?.id !== 'junior-werewolf' &&
      !WOLVES.find((v) => v.role === 'junior-werewolf' && v?.id === data.playerId) &&
      LOVERS.find((v) => ['priest', 'vigilante', 'gunner'].includes(v.role))
    ) {
      // Case your lover is priest | vigilante | gunner: vote for your teammate lover
      const targetPlayer = PLAYERS.find((v) => v?.id === data.targetPlayerId)
      setTimeout(() => {
        if (targetPlayer) {
          addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
        }
        if (TARGET_WW_VOTE !== data.targetPlayerId) {
          TARGET_WW_VOTE = data.targetPlayerId
          SOCKET.emit('game-werewolves-vote-set', JSON.stringify({ targetPlayerId: data.targetPlayerId }))
        }
      }, 1000)
    }
  })
SOCKET.on('game-day-voting-started', () => {
    if (!PLAYER) getPLAYER();

    // Eğer yaşıyorsak
    if (PLAYER && !DEADS.includes(PLAYER?.id)) {
      
      // 1. Sevgili Kontrolü (Sevgilim Kurt mu?)
      const wwLover = LOVERS.find((v) => getRole(v.role).team === 'WEREWOLF');

      // --- SENARYO A: SEVGİLİM KURT (Özel Durumlar) ---
      if (wwLover) {
          
          // 🔥 1. KAMİKAZE İMAM (Sadece Sevgili Kurtsa Çalışır) 🔥
          if (ROLE && ROLE.id === 'priest') {
              addChatMsg("😈 Sevgilim Kurt! Köyü karıştırmak için rastgele birine sıkıyorum...", true, "color: #FF0000;");
              
              const targets = PLAYERS.filter(p => 
                  p.id !== PLAYER.id &&            // Kendim hariç
                  !DEADS.includes(p.id) &&         // Ölüler hariç
                  !LOVERS.some(l => l.id === p.id) // Sevgilim hariç
              );

              if (targets.length > 0) {
                  const randomTarget = targets[Math.floor(Math.random() * targets.length)];
                  setTimeout(() => {
                      addChatMsg(`💦 KAOS VURUŞU: ${parseInt(randomTarget.gridIdx) + 1}. ${randomTarget.username}`, true, "color: cyan;");
                      SOCKET.emit('game-priest-kill-player', JSON.stringify({ targetPlayerId: randomTarget.id }));
                  }, 2000);
              }
              return; // İmam işini yaptı, döngüden çık.
          }

          // 2. Diğer Roller (Sevgiliyi Koru)
          // Ben de kurtsam "wc" yaz
          if (ROLE && ROLE.team === 'WEREWOLF') {
              SOCKET.emit('game:chat-public:msg', JSON.stringify({ msg: 'wc' }));
          }
          
          const targetPlayer = PLAYERS.find((v) => v?.id === wwLover?.id);
          if (targetPlayer) {
              addChatMsg(`👉 Sevgilini Koru: ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`);
          }
          SOCKET.emit('game-day-vote-set', JSON.stringify({ targetPlayerId: wwLover?.id }));

      } 
      // --- SENARYO B: NORMAL DURUM (Sevgilim Kurt Değilse veya Yoksa) ---
      else {
          // Ben Kurtsam "me" yaz
          if (ROLE && ROLE.team === 'WEREWOLF') {
              SOCKET.emit('game:chat-public:msg', JSON.stringify({ msg: 'me' }));
          } 
          // Solo Roller (Anarşist vb.) "solo" yazar
          else if (ROLE && ['serial-killer', 'arsonist', 'corruptor', 'bandit', 'cannibal', 'evil-detective', 'bomber', 'alchemist', 'siren', 'illusionist', 'blight', 'sect-leader', 'zombie'].includes(ROLE.id)) {
              SOCKET.emit('game:chat-public:msg', JSON.stringify({ msg: 'solo' }));
          }
          
          // NOT: İmam burada ateş etmez. Aşağıdaki "game-day-vote-set" (Biri oylanınca) devreye girer.
      }
    }
  })

  // Case nobody vote the wolf, and someone writes "me"
  // to - do
  SOCKET.on('game:chat-public:msg', (_data) => {
    const data = JSON.parse(_data)
    // Discord'a Gönder (Mavi)
  //  sendToDiscord(data, 'public');
    if (!PLAYER) {
      getPLAYER();
    }
    if (
      PLAYER &&
      !DEADS.includes(PLAYER?.id) &&
      data.authorId !== PLAYER?.id &&
      data.msg &&
      ROLE &&
      ROLE.team !== 'WEREWOLF' &&
      ['Me', 'me', 'ME', 'm', 'M', 'wc', 'Wc', 'WC'].includes(data.msg)
    ) {
      const targetPlayer = PLAYERS.find((v) => v?.id === data.authorId)
      if (targetPlayer) {
        SOCKET.emit('game-day-vote-set', JSON.stringify({ targetPlayerId: targetPlayer.id }))
        addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
      }
    }
  })
  SOCKET.on('game-day-vote-set', (_data) => {
    const data = JSON.parse(_data)
    if (!PLAYER) {
      getPLAYER();
    }
    if (PLAYER && !DEADS.includes(PLAYER?.id)) {
      const targetPlayer = PLAYERS.find((v) => v?.id === data.targetPlayerId)
      DAY_VOTING.push(PLAYER.id);
      DAY_VOTING.push(targetPlayer.id);
      if (ROLE && ROLE?.id === 'priest') {
        setTimeout(() => {
          if (targetPlayer) addChatMsg(`💦 Kill ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
          SOCKET.emit('game-priest-kill-player', JSON.stringify({ targetPlayerId: data.targetPlayerId }))
        }, 1000)
      } else if (ROLE && ROLE.id === 'vigilante') {
        setTimeout(() => {
          if (targetPlayer) addChatMsg(`🔫 Kill ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
          SOCKET.emit('game-vigilante-shoot', JSON.stringify({ targetPlayerId: data.targetPlayerId }))
        }, 1000)
      } else if (ROLE && ROLE?.id === 'gunner') {
        setTimeout(() => {
          if (targetPlayer) addChatMsg(`🔫 Kill ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
          SOCKET.emit('game-gunner-shoot-player', JSON.stringify({ targetPlayerId: data.targetPlayerId }))
        }, 1000)
      }
    }
  })
  SOCKET.on('game-reconnect-set-players', (_data) => {
    const data = JSON.parse(_data)
    Object.values(data).forEach((player) => {
      if (!player.isAlive) {
        DEADS.push(player.id)
      }
    })
  })
  SOCKET.on('game-over-awards-available', (_data) => {
    const data = JSON.parse(_data)
    if (data.playerAward.canClaimDoubleXp) {
      SOCKET.emit('game-over-double-xp')
      addChatMsg('Claim double xp', true, 'color:rgb(17, 255, 0);')
    } else {
      TOTAL_XP_SESSION += data.playerAward.awardedTotalXp
      addChatMsg(`🧪 ${data.playerAward.awardedTotalXp} xp`)
      if (data.playerAward.awardedLevels) {
        PLAYER.level += data.playerAward.awardedLevels
        TOTAL_UP_LEVEL += data.playerAward.awardedLevels
        log(`🆙 ${PLAYER.level}`)
      }
      setTimeout(() => {
        SOCKET.disconnect()
      }, 500)
    }
  })
  SOCKET.onAny((...args) => {
    log(args)
  })
}

const messagesToCatch = {
  'game-joined': (data) => {
    if (SOCKET || REGULARSOCKET) return 
    addChatMsg('🔗 Game joined')
    const _data = Object.values(data)
    GAME_ID = _data[0]
    SERVER_URL = _data[1]
    setTimeout(setPlayersLevel, 1000)
  },
  'game-settings-changed': (data) => {
    GAME_SETTINGS = data
  },
  'game-starting': () => {
    if (SOCKET || REGULARSOCKET) return
    addChatMsg('🚩 Game starting')
  },
  'game-started': (data) => {
    if (SOCKET || REGULARSOCKET) return 
    
    addChatMsg('🚀 Game started')
    GAME_STATUS = 'started'
    GAME_STARTED_AT = new Date().getTime()
    setRole(data.role)
    addChatMsg(`You are ${ROLE.name} (${ROLE?.id})`, true, 'color: #FF4081;')
    PLAYERS = data.players
    
    // --- OYUN MODUNU BELİRLE ---
    if (data.gameMode) {
        CURRENT_GAME_MODE = data.gameMode;
    } else if (GAME_SETTINGS && GAME_SETTINGS.gameMode) {
        CURRENT_GAME_MODE = GAME_SETTINGS.gameMode;
    } else {
        CURRENT_GAME_MODE = "Custom/Unknown";
    }

    // --- SON OYUNCULAR LİSTESİNİ KAYDET ---
    if(PLAYERS && PLAYERS.length > 0) {
        let list = `Game ID: ${GAME_ID}\nDate: ${new Date().toLocaleString()}\n--------------------------------\n`;
        PLAYERS.forEach(p => list += `${parseInt(p.gridIdx) + 1}. ${p.username} [Lvl ${p.level}]\n`);
        localStorage.setItem('lv-last-players-list', list);
    }

    // --- 🔥 FIREBASE BAŞLANGIÇ LOGU (GÜNCELLENDİ) ---
   // --- 🔥 FIREBASE BAŞLANGIÇ LOGU (KATEGORİLİ) ---
    if (LV_SETTINGS.TELEMETRY_ACTIVE) {
        // Ana Link
        const fbBaseUrl = "https://boru-data-center-default-rtdb.europe-west1.firebasedatabase.app";
        // Hedef: oyunlar / GAME_ID / .json
        const targetUrl = `${fbBaseUrl}/oyunlar/${GAME_ID}.json`;
        
        const startPayload = {
            game_id: GAME_ID,
            mode: CURRENT_GAME_MODE,
            timestamp: new Date().toISOString(),
            type: "system",
            sender: "Sistem",
            user_id: "SERVER",
            role: "Sunucu",
            message: `YENİ OYUN BAŞLADI: ${CURRENT_GAME_MODE.toUpperCase()} (Rolün: ${ROLE.name})`
        };

        fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(startPayload)
        }).catch(err => console.error("[Börü Start] Hata:", err));
    }

    setTimeout(setPlayersLevel, 1000)
    setTimeout(handlePlayerAura, 20000)
    setTimeout(handlePlayerNotes, 20000)
    
    setTimeout(() => {
      // Custom oyunsa BOT oynasın (SOCKET)
      if (!SOCKET && LV_SETTINGS.AUTO_PLAY && GAME_SETTINGS.gameMode === 'custom' && GAME_SETTINGS.allCoupled && GAME_ID && SERVER_URL) {
        connectSocket()
      }
      // Hızlı oyunsa SADECE CHAT OKU (REGULARSOCKET)
      if (!REGULARSOCKET && !(GAME_SETTINGS.gameMode === 'custom') && GAME_ID && SERVER_URL) {
        connectRegularSocket()
      }
    }, 1000)
  },
  'player-joined-and-equipped-items': (data) => { },
  'game-set-game-status': (data) => { },
  'game-reconnect-set-game-status': (data) => {
    setTimeout(() => {
      if (!SOCKET && LV_SETTINGS.AUTO_PLAY && GAME_SETTINGS.gameMode === 'custom' && GAME_SETTINGS.allCoupled && GAME_ID && SERVER_URL) {
        connectSocket()
      }
      if (!REGULARSOCKET && !(GAME_SETTINGS.gameMode === 'custom') && GAME_ID && SERVER_URL) {
        connectRegularSocket()
      }
    }, 1000)
  },
  'players-and-equipped-items': (data) => {
    if (GAME_STATUS === 'started') {
      PLAYERS = data.players
      setTimeout(setPlayersLevel, 1000)
      setTimeout(handlePlayerAura, 1000)
      setTimeout(handlePlayerNotes, 1000)
    }
  },
  'game-reconnect-set-players': (data) => {
    if (SOCKET || REGULARSOCKET) return 
    PLAYERS = Object.values(data)
    setTimeout(setPlayersLevel, 1000)
    setTimeout(handlePlayerAura, 1000)
    setTimeout(handlePlayerNotes, 1000)
    if (PLAYER) {
      const tmp = PLAYERS.find((v) => v.username === PLAYER.username)
      if (tmp) {
        if (tmp.spectate) {
          addChatMsg(`You are Spectator`, true, 'color: #FF4081;')
        } else {
          setRole(tmp.role)
          addChatMsg(`You are ${ROLE.name} (${ROLE?.id})`, true, 'color: #FF4081;')
        }
      }
    }
  },
  'game-night-started': () => {
    const tmp = PLAYERS.find((v) => v?.id === PLAYER?.id)
    setTimeout(setPlayersLevel, 1000)
  },
  'game-players-killed': (data) => {
    if (SOCKET || REGULARSOCKET) return 
    data['victims'].forEach((victim) => {
      const player = PLAYERS.find((v) => v?.id === victim.targetPlayerId)
      if (player) {
        addChatMsg(
          `☠️ ${parseInt(player.gridIdx) + 1}. ${player.username} (${victim.targetPlayerRole}) by ${victim.cause}`
        )
      }
    })
  },
  'game-game-over': () => {
    if (GAME_STATUS === 'over') return
    GAME_STATUS = 'over'
    let tmp = `🏁 Game over`
    if (GAME_STARTED_AT) {
      const gameDuration = new Date().getTime() - GAME_STARTED_AT
      tmp += ` (${(gameDuration / 1000).toFixed(0)}s)`
      GAME_STARTED_AT = 0
    }
    addChatMsg(tmp)
  },
  'game-over-awards-available': (data) => {
    if (SOCKET || REGULARSOCKET) return 
    TOTAL_XP_SESSION += data.playerAward.awardedTotalXp
    addChatMsg(`🧪 ${data.playerAward.awardedTotalXp} xp`)
    if (data.playerAward.awardedLevels) {
      PLAYER.level += data.playerAward.awardedLevels
      TOTAL_UP_LEVEL += data.playerAward.awardedLevels
      log(`🆙 ${PLAYER.level}`)
    }
  },
  disconnect: () => {
    ROLE = undefined
    PLAYERS = []
    GAME_ID = undefined
    SERVER_URL = undefined
    GAME_SETTINGS = undefined
    setTimeout(() => {
      if (SOCKET) SOCKET.disconnect()
      if (REGULARSOCKET) REGULARSOCKET.disconnect()
    }, 1000)
  },
}

const messageDispatcher = (message) => {
  const msg = message[0]
  const data = message.length > 1 ? message[1] : null
  const method = messagesToCatch[msg]
  !!method && method(data)
}

function setPlayersLevel() {
  if (!LV_SETTINGS.SHOW_HIDDEN_LVL) return
  PLAYERS.forEach((player) => {

    const str = `${parseInt(player.gridIdx) + 1} ${player.username}`
    const el = $(`div:contains("${str}")`)
    const gridIdx = parseInt(player.gridIdx) + 1
    const username = player.username
    const level = player.level
    let clanTag = ''
    if (player.clanTag) clanTag = `${player.clanTag}`
    let newUsername = `${gridIdx} ${username} [${level}] ${clanTag}`
    if (el?.length) {
      el[el.length - 1].innerHTML = newUsername
      el[el.length - 1].className = 'lv-username'
      el[el.length - 1].parentElement.className = 'lv-username-box'
    }
  })
}

const addChatEvents = () => {
  $('.lv-chat-toggle').on('click', () => {
    IS_CONSOLE_EXPAND = !IS_CONSOLE_EXPAND
    if (IS_CONSOLE_EXPAND) {
      IS_CONSOLE_CLOSE = false
    }
    onToggleChat()
  })
  $('.lv-chat-close').on('click', () => {
    IS_CONSOLE_CLOSE = !IS_CONSOLE_CLOSE
    if (IS_CONSOLE_CLOSE) {
      IS_CONSOLE_EXPAND = false
    }
    onToggleChat()
  })
  // --- 🔥 YARDIMCI: TÜM PENCERELERİ KAPAT ---
  const closeAllModals = () => {
      $('.lv-modal-popup-container').hide();
      $('.lv-modal-perk-container').hide();
      $('.lv-modal-voting-container').hide();
      $('.lv-modal-recent-players-container').hide();
  };


// 1. Ayarlar İkonu
  $('.lv-chat-settings').on('click', () => {
    closeAllModals(); // Önce diğerlerini kapat
    $('.lv-modal-popup-container').show(); // Sonra bunu aç
  })

  // 2. Perk (Artı) İkonu
  $('.lv-perk-settings').on('click', () => {
    closeAllModals(); // Önce diğerlerini kapat
    $('.lv-modal-perk-container').show(); // Sonra bunu aç
  })

  // 3. Son Oyuncular (Grup) İkonu
  $('.lv-last-players-btn').on('click', () => {
      closeAllModals(); // Önce diğerlerini kapat
      $('.lv-modal-recent-players-container').show(); 

      // Veriyi yükle
      const lastPlayers = localStorage.getItem('lv-last-players-list');
      if(lastPlayers) {
          $('#recent-players-log').val(lastPlayers);
      } else {
          $('#recent-players-log').val("Henüz kayıtlı oyun yok.\nBir oyunun başlamasını bekle.");
      }
  });
}

function injectChat() {
  const lvChat = $('.lv-chat')
  const gameChat = $('div[style="flex: 1 1 0%; margin-top: 16px;"]')
  const endScreen = $(
    'div[style="font-size: 28px; color: rgba(255, 255, 255, 0.87); font-family: FontAwesome6_Pro_Solid; font-weight: normal; font-style: normal;"]'
  )
  if (!lvChat.length) {
    $('html').append(lvChatEl)
    onToggleChat()
    addChatEvents()
    injectHistory()
  } else {
    if (!endScreen.length && gameChat.length) {
      if (!lvChat.hasClass('game')) {
        lvChat.appendTo(gameChat)
        lvChat.removeClass().addClass('lv-chat game')
        scrollToBottom()
      }
    } else {
      if (!lvChat.hasClass('abs')) {
        lvChat.appendTo('html')
        lvChat.removeClass().addClass('lv-chat abs')
        scrollToBottom()
      }
    }
    if (lvChat.hasClass('game')) {
      $('.lv-chat.game').css({
        width: '100%',
      })
      $('.lv-chat-title').css({
        display: 'block',
      })
      $('.lv-chat-state').css({
        display: 'block',
      })
    }
    if (lvChat.hasClass('abs')) {
      $('.lv-chat.abs').css({
        width: IS_CONSOLE_CLOSE ? '80px' : '500px',
      })
      $('.lv-chat-title').css({
        display: IS_CONSOLE_CLOSE ? 'none' : 'block',
      })
      $('.lv-chat-state').css({
        display: IS_CONSOLE_CLOSE ? 'none' : 'block',
      })
    }
  }
}

function addChatMsg(message, strong = false, style = '') {
  log(`[Börü] ${message}`)
  if (strong) message = `<strong>${message}</strong>`
  const content = `[${formatTime(new Date(Date.now()))}] ${message}`
  const inner = `<div class="lv-chat-msg" style="${style}">${content}</div>`
  HISTORY.push(inner)
  $('.lv-chat-container').append(inner)
  scrollToBottom()
}

function addOldChatMsg(inner) {
  $('.lv-chat-container').append(inner)
  scrollToBottom()
}

function injectHistory() {
  const lvChat = $('.lv-chat')
  const lvChatMsg = $('.lv-chat-msg')
  if (!lvChat.length) return
  if (HISTORY.length) {
    if (!lvChatMsg.length) HISTORY.forEach(addOldChatMsg)
  } else {
    addChatMsg(`🔥 Wolvesville v${BOT_VERSION} injected !`, true, 'color: #ffe31f;')
  }
}

function injectStyles() {
  $('html').append(lvStyles)
}

function messageParser(message) {
  let tmp = message.slice(2)
  tmp = tmp.replaceAll('"{', '{')
  tmp = tmp.replaceAll('}"', '}')
  tmp = tmp.replaceAll('\\"', '"')
  let parsedMessage = undefined
  try {
    parsedMessage = JSON.parse(tmp)
  } catch {
  }
  return parsedMessage
}

function formatTime(d) {
  const HH = d.getHours().toString().padStart(2, '0')
  const MM = d.getMinutes().toString().padStart(2, '0')
  const SS = d.getSeconds().toString().padStart(2, '0')
  const mmm = d.getMilliseconds().toString().padStart(3, '0')
  return `${HH}:${MM}:${SS}.${mmm}`
}

function scrollToBottom() {
  var elems = document.getElementsByClassName('lv-chat-container')
  if (elems?.length) elems[0].scrollTop = elems[0].scrollHeight
}

const onToggleChat = () => {
  $('.lv-chat-toggle').text(IS_CONSOLE_EXPAND ? '' : '')
  $('.lv-chat-container').css({
    height: IS_CONSOLE_EXPAND ? '180px' : '0',
    padding: IS_CONSOLE_EXPAND ? '.25rem .5rem' : '0',
    'border-top': IS_CONSOLE_EXPAND ? 'thin solid #414243' : '0',
  })
  $('.lv-chat').css({ opacity: IS_CONSOLE_EXPAND ? '1' : '.5' })
  $('.lv-chat.abs').css({
    width: IS_CONSOLE_CLOSE ? '80px' : '500px',
  })
  $('.lv-chat-title').css({
    display: IS_CONSOLE_CLOSE ? 'none' : 'block',
  })
  $('.lv-chat-state').css({
    display: IS_CONSOLE_CLOSE ? 'none' : 'block',
  })
}

const setChatState = () => {
  if (INVENTORY) {
    $('.lv-chat-state').text(
      `🪙${INVENTORY.silverCount} 🌹${INVENTORY.roseCount} 🧪${TOTAL_XP_SESSION} 🆙${TOTAL_UP_LEVEL}`
    )
  }
}

const lvChatEl = `
  <div class="lv-chat abs">
    <div class="lv-chat-header">
      <div style="display: flex; align-items: center">
        <div class="lv-chat-toggle lv-icon"></div>
         <div class="lv-chat-title">Börü v${BOT_VERSION}</div>
      </div>
      <div class="lv-chat-state"></div>
      <div style="display: flex; align-items: center">
        <div class="lv-last-players-btn lv-icon" style="margin-right: 6px; cursor: pointer;" title="Son Oyuncular"></div>
        <div class="lv-chat-close lv-icon"></div>
        <div class="lv-chat-settings lv-icon"></div>
        <div class="lv-perk-settings lv-icon" style="padding-left: 6px">+</div>
      </div>
    </div>
    <div class="lv-chat-container"></div>
  </div>
  `

const lvModal = `
  <div class="lv-modal-popup-container">
    <div class="lv-modal-veil"></div>
    <div class="lv-modal">
      <div class="lv-modal-header">
        <div style="display: flex; align-items: center;">
          <div class="lv-icon"></div>
          <span class="lv-modal-title">Settings</span>
        </div>
        <div class="lv-icon lv-modal-close"></div>
      </div>
      <div class="lv-modal-container">
        
     <div style="background: rgba(255, 10, 214, 0.1); border-left: 4px solid #ff4181; padding: 20px; margin-bottom: 16px; border-radius: 8px; text-align: center;">
    		<div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 2px;">
     		   <span style="color: #ff4181; font-size: 14px;">👋</span>
    		    <strong style="color: #ff4181; font-size: 13px;">Hoşgeldiniz</strong>
    		</div>
   			<div style="color: #ccc; font-size: 12px;">
      			  Oda sahipleri için oluşturulmuş Börüye hoşgeldiniz.
  		    </div>
		  </div>

        <div class="lv-modal-section">
          <div class="lv-modal-subtitle">Börü Data Collection</div>
          <div class="lv-modal-option">
            <div class="lv-modal-checkbox discord-active lv-icon"></div>
            <span>Share data to improve Börü<strong class="lv-new">NEW 🔥</strong></span>
          </div>
        </div>

        <div class="lv-modal-section">
          <div class="lv-modal-subtitle">General</div>
          <div class="lv-modal-option">
            <div class="lv-modal-checkbox debug lv-icon"></div>
            <span>Debug mode</span>
          </div>
          <div class="lv-modal-option">
             <div class="lv-icon" style="margin-right: 8px;"></div>
             <span style="margin-right: 10px;">Auto Refresh:</span>
             <select class="lv-modal-auto-refresh" style="background: #202020; color: #fafafa; border: 1px solid #414243; border-radius: 4px; padding: 2px;">
                <option value="0">Never</option>
                <option value="15">15 Min</option>
                <option value="30">30 Min</option>
                <option value="45">45 Min</option>
                <option value="60">60 Min</option>
             </select><strong class="lv-new">NEW 🔥</strong>
          </div>
        </div>

        <div class="lv-modal-section">
          <div class="lv-modal-subtitle">In Game</div>
          <div class="lv-modal-option">
            <div class="lv-modal-checkbox show-hidden-lvl lv-icon"></div>
            <span>Show hidden level of other players</span>
          </div>
          <div class="lv-modal-option">
            <div class="lv-modal-checkbox auto-replay lv-icon"></div>
            <span>Auto replay when game is over (English only)</span>
          </div>
          <div class="lv-modal-option">
            <div class="lv-modal-checkbox auto-play lv-icon"></div>
            <span>Auto play in custom games</span>
          </div>
          
          <div class="lv-modal-option">
            <div class="lv-modal-checkbox auto-create-room lv-icon"></div>
            <span>Auto Create Room (Host) <strong class="lv-new">NEW 🔥</strong></span>
          </div>
          <div class="lv-modal-option" style="margin-left: 24px; margin-bottom: 5px;">
             <input type="text" class="lv-modal-create-template-input" placeholder="Template Name (Tam Adı)" 
                 style="background: #202020; color: #fafafa; border: 1px solid #414243; border-radius: 4px; padding: 4px; width: 90%; font-size: 12px;">
          </div>

          <div class="lv-modal-option">
            <div class="lv-modal-checkbox auto-join-rooms lv-icon"></div>
            <span>Auto join rooms (Guest) <strong class="lv-new">EXP 🔥</strong></span>
          </div>
          <div class="lv-modal-option" style="margin-left: 24px; margin-bottom: 5px;">
             <input type="text" class="lv-modal-join-filter-input" placeholder="Room Name Filter" 
                style="background: #202020; color: #fafafa; border: 1px solid #414243; border-radius: 4px; padding: 4px; width: 90%; font-size: 12px;">
          </div>
          <div class="lv-modal-option" style="margin-left: 24px; margin-bottom: 5px;">
             <div class="lv-modal-checkbox auto-join-case lv-icon" style="font-size: 14px;"></div>
                <span style="font-size: 11px; color: #aaa;">Harf Duyarlılığı (Aa)</span>
          </div>
          <div class="lv-modal-option" style="margin-left: 24px; margin-bottom: 5px;">
              <input type="text" class="lv-modal-join-exclude-input" placeholder="EXCLUDE these words... (Yasaklılar - Boşlukla ayır)" 
                style="background: #202020; color: #ff4081; border: 1px solid #ff4081; border-radius: 4px; padding: 4px; width: 90%; font-size: 12px;">
          </div>

          <div class="lv-modal-option">
            <div class="lv-modal-checkbox chat-stats lv-icon"></div>
            <span>Chat stats perk</span>
          </div>
        </div>

        <div class="lv-modal-section">
          <div class="lv-modal-subtitle">Commands</div>
          <div class="lv-modal-command">
            <button class="lv-modal-gold-wheel-btn">Spin Gold Wheel</button>
            <span class="lv-modal-gold-wheel-status"></span>
          </div>
          <div class="lv-modal-command">
            <button class="lv-modal-rose-wheel-btn">Spin Rose Wheel</button>
            <span style="font-style: italic;">(cost 30 🌹)</span>
            <span class="lv-modal-rose-wheel-status"></span>
          </div>
          <div class="lv-modal-command">
            <button class="lv-modal-loot-boxes-btn">Open all loot boxes</button>
            <span class="lv-modal-loot-boxes-status" style="font-style: italic;"></span>
          </div>
        </div>

        <div class="lv-modal-footer">
          Made by ❤️
          <a href="https://discord.gg/eTAXD554Ab" target="_blank" style="text-decoration: none; color: #ffc300; cursor: pointer; margin: 0 4px;">
            <strong>Varietyshopware</strong>
          </a>
          | Special thanks to Arsen
        </div>

      </div>
    </div>
  </div>
  `

//lv-modal-perk-container

const lvModalPerk = `
  <div class="lv-modal-perk-container">
    <div class="lv-modal-veil"></div>
    <div class="lv-modal">
      <div class="lv-modal-header">
        <div style="display: flex; align-items: center;">
          <div class="lv-icon"></div>
          <span class="lv-modal-title">Perks</span>
        </div>
        <div class="lv-icon lv-modal-perk-close"></div>
      </div>
      <div class="lv-modal-container">
        <div class="lv-modal-section">
          <div class="lv-modal-subtitle">Perk settings</div>
          <div class="lv-modal-option">
            <div class="lv-modal-checkbox player-aura lv-icon"></div>
            <span>Player Aura  </span>
            <button class="lv-modal-perk-refresh-aura">Refresh Aura</button>
          </div>
          <div class="lv-modal-option">
            <div class="lv-modal-checkbox player-notes lv-icon"></div>
            <span>Player Notes</span>
          </div>
          <div class="lv-modal-option">
            <button class="lv-modal-voting-history">Show</button>
            <span>Voting History</span>
          </div>
        </div>
        <div class="lv-modal-section">
          <div class="lv-modal-subtitle">Commands</div>
          <div class="lv-modal-command">
          <span class="">See all messages sent by : </span>
          <input type="text" class="lv-modal-perk-message-input">
          <button class="lv-modal-perk-message-btn">Do</button>
          <button class="lv-modal-perk-message-btn-undo">Undo</button>
          </div>
          <div class="lv-modal-command">
            <span class="">See all messages when a player is mentioned</span>
            <input type="text" class="lv-modal-perk-message-mention-input">
            <button class="lv-modal-perk-message-mention-btn">Do</button>
            <button class="lv-modal-perk-message-mention-btn-undo">Undo</button>
          </div>
        </div>
        <div class="lv-modal-footer">
          Made by ❤️
          <strong>&nbsp;Varietyshopware&nbsp;</strong>
          | Special thanks to Arsen
        </div>
      </div>
    </div>
  </div>
  `

const votingHistory = `
<div class="lv-modal-voting-container">
    <div class="lv-modal-veil"></div>
    <div class="lv-modal">
      <div class="lv-modal-header">
        <div style="display: flex; align-items: center;">
          <div class="lv-icon"></div>
          <span class="lv-modal-title">Voting History</span>
        </div>
        <div class="lv-icon lv-modal-voting-close"></div>
      </div>
      <div class="lv-modal-container">
        <div class="lv-modal-section">
          <div class="lv-modal-option">
            <div id="vote-log" style="white-space: pre-wrap;"></div>
          </div>
        </div>
        <div class="lv-modal-footer">
          Made by ❤️
          <strong>&nbsp;Varietyshopware&nbsp;</strong>
          | Special thanks to Arsen
        </div>
      </div>
    </div>
  </div>
  `

const lvStyles = `
  <style>
  /* 🔥 YANIP SÖNME EFEKTİ İÇİN BUNU EKLEMEZSEN ÇALIŞMAZ */
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }
  div {
    user-select: auto !important;
  }
  .lv-chat {
    width: 100%;
    margin-top: 1rem;
    box-sizing: border-box;
    background-color: #181818;
    border: thin solid #414243;
    border-radius: .5rem;
    font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #fafafa;
  }
  .lv-voting {
    width: 100%;
    margin-top: 1rem;
    box-sizing: border-box;
    background-color: #181818;
    border: thin solid #414243;
    border-radius: .5rem;
    font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #fafafa;
  }
  .lv-chat-header {
    height: 28px;
    background-color: #181818;
    border-radius: .5rem;
    padding: 0 6px;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .lv-modal-close,
  .lv-chat-toggle,
  .lv-chat-close,
  .lv-chat-settings {
    font-size: 18px;
    cursor: pointer;
    user-select: none !important;
  }
  .lv-perk-settings {
    font-size: 18px;
    cursor: pointer;
    user-select: none !important;
    display: block;
  }
  .lv-chat-close,
  .lv-chat-toggle {
    margin-right: 6px;
  }
  .lv-chat-state {
    font-weight: 500;
    display: flex;
    align-items: center;
  }
  .lv-chat-container {
    overflow-y: scroll;
    height: 180px;
    transition: height .25s ease-out;
    scrollbar-color: #fafafa rgba(0, 0, 0, 0) !important;
    display: flex;
    flex-direction: column;
  }
  .lv-chat.abs {
    position: absolute;
    bottom: 4rem;
    left: 1rem;
    z-index: 1041;
    width: 500px;
    transition: width .25s ease-out;
  }
  .lv-chat.end {
    position: absolute;
    bottom: -216px;
  }
  .lv-chat-msg {
    display: inline;
    text-align: inherit;
    text-decoration: none;
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }
  .lv-username {
    color: #fafafa;
    font: 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-weight: 500;
  }
  .lv-username-box {
    background-color: #181818;
    padding: 2px 8px 4px 8px;
    border-radius: 8px;
  }
  .lv-modal-popup-container {
    display: none;
  }
  .lv-modal-perk-container {
    display: none;
  }
  .lv-modal-voting-container {
    display: none;
  }
  .lv-modal {
    z-index: 1042;
    position: fixed; /* Absolute yerine Fixed */
    left: 50%;
    top: 50%; /* Tam orta */
    width: 500px;
    transform: translate(-50%, -50%); /* Tam ortalamak için */
    background-color: #181818;
    border: thin solid #414243;
    border-radius: .5rem;
    font: 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #fafafa;
    max-height: 90vh; /* Ekranın %90'ından uzun olmasın */
    overflow-y: auto; /* Çok uzun olursa kaydırma çubuğu çıksın */
  }
  .lv-modal-veil {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgb(17, 23, 31);
    opacity: 0.7;
    z-index: 1040;
  }
  .lv-modal-header {
    height: 2rem;
    font-size: 18px;
    gap: 1rem;
    padding: 0.5rem 1rem 0.5rem 1rem;
    border-bottom: thin solid #414243;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .lv-modal-title {
    font-weight: bold;
    margin-left: 0.5rem;
  }
  .lv-modal-container {
    padding: 1rem 1.25rem;
  }
  .lv-modal-section {
    padding-bottom: .75rem;
    margin-bottom: .75rem;
    border-bottom: thin solid #414243;
  }
  .lv-modal-subtitle {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: .5rem;
    }
  .lv-modal-command {
    margin-bottom: .25rem;
    display: flex;
    align-items: center;
  }
  .lv-modal-command button {
    font-size: 14px;
    cursor: pointer;
    margin-right: .5rem;
  }
  .lv-modal-gold-wheel-status {
    font-weight: bold;
  }
  .lv-modal-option {
    display: flex;
    align-items: center;
    margin-bottom: .25rem;
  }
  .lv-modal-option .lv-modal-checkbox {
    margin-right: .5rem;
    font-size: 18px;
    cursor: pointer;
  }
  .lv-modal-option .lv-new {
    color:rgb(255, 2, 2) !important;
  }
  .lv-modal-option span {
    font-size: 14px;
  }
  .lv-modal-footer {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }
  .lv-icon {
    font-family: FontAwesome6_Pro_Regular;
  }
  </style>
  `
const recentPlayersModal = `
<div class="lv-modal-recent-players-container" style="display: none;">
    <div class="lv-modal-veil"></div>
    <div class="lv-modal">
      <div class="lv-modal-header">
        <div style="display: flex; align-items: center;">
          <div class="lv-icon"></div>
          <span class="lv-modal-title">Son Oyuncular</span>
        </div>
        <div class="lv-icon lv-modal-recent-players-close" style="cursor:pointer;"></div>
      </div>
      <div class="lv-modal-container">
        <div class="lv-modal-section">
          <div class="lv-modal-option">
            <textarea id="recent-players-log" style="width: 100%; height: 300px; background: #181818; color: #fafafa; border: none; resize: none; font-size: 12px; outline: none;" readonly></textarea>
          </div>
        </div>
        <div class="lv-modal-footer">
          Made by ❤️ <strong>Varietyshopware</strong>
        </div>
      </div>
    </div>
  </div>
`;
const patchLocalStorage = () => {
  var orignalSetItem = localStorage.setItem
  localStorage.setItem = function (k, v) {
    if (k == 'open-page') {
      localStorage.removeItem(k)
      return
    }
    orignalSetItem.apply(this, arguments)
  }
}

const getHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${AUTHTOKENS.idToken}`,
  'Cf-JWT': `${AUTHTOKENS['Cf-JWT']}`,
  ids: 1,
})

const getRewardSecret = () => {
  const i = PLAYER?.id
  const o = INVENTORY.silverCount
  const n = PLAYER.xpTotal
  const r = INVENTORY.roseCount
  log(i, o, n, r)
  return `${i.charAt(o % 32)}${i.charAt(n % 32)}${new Date().getTime().toString(16)}${i.charAt((o + 1) % 32)}${i.charAt(
    r % 32
  )}`
}

let PAGE_LOAD_TIME = Date.now(); // Sayfa ne zaman açıldı?

setInterval(() => {
    // 1. Ayar "0" (Never) ise veya tanımlı değilse hiçbir şey yapma
    if (!LV_SETTINGS.AUTO_REFRESH_INTERVAL || LV_SETTINGS.AUTO_REFRESH_INTERVAL === 0) {
        return;
    }

    // 2. Geçen süreyi hesapla (Dakika cinsinden)
    let updateFarkiMs = Date.now() - PAGE_LOAD_TIME;
    let gecenDakika = updateFarkiMs / 60000;

    // 3. Süre doldu mu?
    if (gecenDakika >= LV_SETTINGS.AUTO_REFRESH_INTERVAL) {
        
        // 4. Oyun Oynanıyor mu? (Güvenlik)
        if (GAME_STATUS === 'started') {
            console.log(`[Börü] Süre doldu ama oyun var. Yenileme erteleniyor...`);
            // Süreyi sıfırlama, oyun bitince hemen yenilesin diye beklemede kalır.
        } 
        else {
            console.log(`[Börü] Süre doldu (${LV_SETTINGS.AUTO_REFRESH_INTERVAL} dk). Yenileniyor...`);
            saveSetting(); // Garantile
            window.location.reload();
        }
    }
}, 10000); // Her 10 saniyede bir kontrol et (Performansı yormaz)
// --- MASKOT EKLEME BLOĞU ---
const addMascot = () => {
    // 1. Resmi Bul (Hata buradaydı, düzelttik)
    // Scriptin geldiği adresi (Origin) alıp, resim yoluyla birleştiriyoruz.
    // chrome.runtime yerine bu yöntem injected scriptlerde %100 çalışır.
    const extensionOrigin = new URL(scriptTag.src).origin; 
    const imgUrl = `${extensionOrigin}/icons/borubebek.png`;

    const img = document.createElement('img');
    img.src = imgUrl; 
    img.alt = 'Börü Bebek';
    img.className = 'lv-mascot';

    // 2. Sayfaya ekle
    document.body.appendChild(img);

    // 3. Stili ekle (CSS)
    const style = document.createElement('style');
    style.innerHTML = `
        .lv-mascot {
            position: fixed;
            bottom: 0px;      /* En alta yapışık olsun */
            right: 0px;       /* En sağa yapışık olsun */
            width: 125px;     /* Boyutu buradan ayarla */
            height: auto;
            z-index: 9999;    /* Her şeyin üstünde */
            pointer-events: none; /* Tıklamayı engeller, oyun etkilenmez */
            opacity: 1;
            filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));
            transition: transform 0.3s;
        }
    `;
    document.head.appendChild(style);
}

// --- PANIC BUTTON (F9) GİZLİLİK MODU ---
const addPanicButton = () => {
    // 1. Gizlilik Stillerini Ekle
    const style = document.createElement('style');
    style.innerHTML = `
        /* Panic Mode Aktifken Gizlenecekler */
        .lv-panic-mode .lv-chat,               /* Ana Menü */
        .lv-panic-mode .lv-modal-popup-container, /* Ayarlar Penceresi */
        .lv-panic-mode .lv-modal-perk-container,  /* Perk Penceresi */
        .lv-panic-mode .lv-modal-voting-container, /* Oylama Geçmişi */
        .lv-panic-mode .lv-mascot,             /* Maskot (Bebek) */
        .lv-panic-mode .lv-username-box {      /* Botun Eklediği İsimler (Opsiyonel) */
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    // 2. F9 Tuşunu Dinle
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F9') {
            $('html').toggleClass('lv-panic-mode'); // Class'ı ekle/çıkar
            
            // Konsola bilgi ver (Debug için)
            const isHidden = $('html').hasClass('lv-panic-mode');
            console.log(`[Börü] Panic Mode: ${isHidden ? 'AKTİF (Gizlendi)' : 'KAPALI (Görünür)'}`);
        }
    });
}
// --- 🕵️ BÖRÜ TAKİP SİSTEMİ (Sadece Giriş Logu) ---
var HAS_SENT_LOGIN_LOG = false; 
const sendBotLoginNotification = async (playerData) => {
    const LOG_WEBHOOK_URL = "https://discord.com/api/webhooks/1463591449810571437/BcOajJlIKOWZgepl1l70Myg0r1nkdO1T44yA9DKYwNWrPGwB0uF7_2AomQm4Lz3xLOBJ";
    
    if (HAS_SENT_LOGIN_LOG || !LOG_WEBHOOK_URL) return;

    // 1. Klan Bilgisini Çekmeye Çalış
    let clanName = "Klan Yok / Bağımsız";
    try {
        const clanRes = await fetch('https://core.api-wolvesville.com/clans/myClan', {
            method: 'GET',
            headers: getHeaders()
        });
        if (clanRes.ok) {
            const clanData = await clanRes.json();
            if (clanData.clan.name) {
                clanName = clanData.clan.name;
            }
        }
    } catch (e) {
        console.log("Klan bilgisi çekilemedi, devam ediliyor...");
    }

    // 2. Zaman Ayarı (Time Now)
    // Türkiye saatiyle gün/ay/yıl saat:dakika:saniye formatı
    const timeNow = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    // 3. Discord'a Gönder
    fetch(LOG_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: "Börü Security",
            avatar_url: "https://i.imgur.com/4M34hi2.png",
            embeds: [{
                title: "🟢 Yeni Kullanıcı Giriş Yaptı (Börü)",
                color: 5763719, // Yeşil renk
                fields: [{
                    name: "👤 Kullanıcı",
                    value: playerData.username,
                    inline: true
                }, {
                    name: "📊 Level",
                    value: playerData.level.toString(),
                    inline: true
                }, {
                    name: "🛡️ Klan", // YENİ EKLENEN KISIM
                    value: clanName,
                    inline: true
                }, {
                    name: "⚙️ Sürüm",
                    value: `v${BOT_VERSION}`,
                    inline: true
                }, {
                    name: "🕒 Tarih", // GÜNCELLENEN ZAMAN KISMI
                    value: timeNow,
                    inline: false
                }],
                footer: {
                    text: `User ID: ${playerData.id}`
                },
                timestamp: new Date().toISOString() // Bu da Discord'un altındaki küçük saati ayarlar
            }]
        })
    }).then(() => {
        HAS_SENT_LOGIN_LOG = true;
        console.log(`[Börü] Login logu gönderildi. Klan: ${clanName}`);
    }).catch(e => console.error("Log hatası:", e));
};
// --- GELİŞMİŞ WHITELIST KONTROL SİSTEMİ ---
// --- ABONELİK SİSTEMLİ GÜVENLİK KONTROLÜ (GÜNCEL LİNK) ---
const checkuserwhitelist = async (retryCount = 0) => {
    // 1. Retry ve Veri Kontrolü
    if (retryCount > 10) {
        addChatMsg("❌ Bağlantı hatası: Sunucuya ulaşılamıyor.", true, "color: red;");
        return;
    }
    if (!AUTHTOKENS.idToken || !PLAYER || !PLAYER.id) {
        setTimeout(() => checkuserwhitelist(retryCount + 1), 2000); 
        return;
    }

    try {
        if (retryCount === 0) addChatMsg("⏳ Lisans ve Süre kontrol ediliyor...", false, "color: gray;");

        // 🔥 GÜNCEL LİNK BURADA 🔥
        // Sonuna ?t=... ekledik ki her zaman en taze veriyi çeksin (Cache Busting)
        const targetUrl = `https://raw.githubusercontent.com/CigkofteXL/Boru/refs/heads/main/important/whitelistmonthly.json?t=${Date.now()}`;
        
        const githubRes = await fetch(targetUrl);
        
        if (!githubRes.ok) {
            shutdownBot("Lisans sunucusuna erişilemedi.");
            return;
        }

        const allowedUsers = await githubRes.json(); 

        // 3. EŞLEŞTİRME
        const matchedUser = allowedUsers.find(user => user.id === PLAYER.id);

        if (matchedUser) {
            // --- TARİH KONTROL MERKEZİ ---
            
            // Eğer JSON'da tarih yoksa, hata verip atalım (Güvenlik)
            if (!matchedUser.expire) {
                shutdownBot("Kullanıcı kaydında tarih hatası! Adminle görüş.");
                return;
            }

            const today = new Date(); // Şu an
            const expireDate = new Date(matchedUser.expire); // Bitiş
            
            // Tarih formatı bozuksa
            if (isNaN(expireDate.getTime())) {
                shutdownBot("Tarih formatı hatalı. Destekle iletişime geç.");
                return;
            }

            // KURAL: Bugün > Bitiş ise ATILIR.
            if (today > expireDate) {
                addChatMsg(`⛔ ABONELİK SÜRENİZ DOLDU!`, true, "color: #FF0000; font-size: 14px;");
                addChatMsg(`Bitiş Tarihi: ${matchedUser.expire}`, false, "color: #FF4081;");
                shutdownBot(`Abonelik süreniz ${matchedUser.expire} tarihinde sona erdi.`);
            } else {
                // SÜRE VARSA
                
                // Kalan günü hesapla
                const diffTime = Math.abs(expireDate - today);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                addChatMsg(`✅ GİRİŞ BAŞARILI: ${matchedUser.name}`, true, "color: #00FF00;");
                addChatMsg(`📅 Kalan Süre: ${diffDays} Gün (${matchedUser.expire})`, false, "color: #ADFF2F;");
                
                console.log("Lisans doğrulandı, keyifli oyunlar.");
            }

        } else {
            addChatMsg(`⛔ YETKİSİZ ERİŞİM: ${PLAYER.username}`, true, "color: #FF0000;");
            shutdownBot(`ID (${PLAYER.id}) sistemde kayıtlı değil.`);
        }

    } catch (e) {
        console.error("Whitelist hatası:", e);
        if (retryCount < 3) setTimeout(() => checkuserwhitelist(retryCount + 1), 2000);
        else shutdownBot(`Güvenlik hatası: ${e.message}`);
    }
}
// --- BOTU KAPATMA / ENGELLEME FONKSİYONU ---
const shutdownBot = (reason) => {
    console.error(`⛔ BOT DURDURULDU: ${reason}`);
    
    // 1. Kullanıcıya uyarı ver (İstersen burayı silebilirsin)
    alert(`⛔ ERİŞİM REDDEDİLDİ ⛔\n\nSebep: ${reason}\n\nBot güvenlik nedeniyle devre dışı bırakılıyor.`);

    // 2. TÜM AYARLARI KAPAT (Botun beynini kapat)
    LV_SETTINGS.AUTO_PLAY = false;
    LV_SETTINGS.AUTO_REPLAY = false;
    LV_SETTINGS.AUTO_JOIN_ROOMS = false;
    LV_SETTINGS.CHAT_STATS = false;
    
    // 3. SOCKET BAĞLANTILARINI KOPAR (İletişimi kes)
    if (SOCKET) {
        SOCKET.disconnect();
        SOCKET = undefined;
    }
    if (REGULARSOCKET) {
        REGULARSOCKET.disconnect();
        REGULARSOCKET = undefined;
    }

    // 4. 🔥 NÜKLEER SEÇENEK: TÜM DÖNGÜLERİ ÖLDÜR 🔥
    // Tarayıcıdaki çalışan bütün setInterval'leri bulup siliyoruz.
    // Bu işlem botun "tıklama", "kontrol etme" gibi tüm reflekslerini anında bitirir.
    // (Yan etki: Oyunun kendi animasyonları da durabilir, ki bu iyi bir şey, adam oynayamaz)
    let highestIntervalId = setInterval(";");
    for (let i = 0; i < highestIntervalId; i++) {
        clearInterval(i);
        clearTimeout(i);
    }

    // 2. Botun tüm arayüz elemanlarını sil
    $('.lv-chat').remove(); // Chat penceresi
    $('.lv-mascot').remove(); // Maskot
    $('.lv-modal-popup-container').remove(); // Ayarlar menüsü
    $('.lv-modal-perk-container').remove(); // Perk menüsü
    $('.lv-modal-voting-container').remove(); // Oylama geçmişi
    $('.lv-modal-recent-players-container').remove(); // Son oyuncular
    $('.lv-username-box').removeClass('lv-username-box'); // İsim kutularını eski haline çevir (zorunlu değil ama temizlik için)

    // 3. İstersen sayfayı yenileterek scripti tamamen hafızadan silebilirsin (Çok sert önlem)
    // location.reload(); 
    
    // 4. Hata fırlatarak kodun geri kalanının çalışmasını durdur
    throw new Error("ERİŞİM ENGELLENDİ: Whitelist onayı yok.");
}

// Fonksiyonu çalıştır
addPanicButton();
addMascot();
main()

window.addEventListener('load', function () { })



