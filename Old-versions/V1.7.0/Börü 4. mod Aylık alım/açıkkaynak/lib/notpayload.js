

console.log('Börü Bot injected')
// 🔥 EKSİK OLAN BU SATIR:
var CURRENT_GAME_MODE = "Bilinmiyor";
  // --- GLOBAL DEĞİŞKENLER ---
var ACTIVE_CHAT_TARGET = null;
var CHAT_STORAGE = {}; // Önce boş başlatıyoruz, aşağıda dolduracağız.
// 🔥 YENİ: Engelli Listesi (Hafızadan çek)
var BLOCKED_USERS = JSON.parse(localStorage.getItem('boru-blocked-users')) || [];

// 🔥 XSS ENGELLEYİCİ: Bunu en tepeye ekle
function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

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
                // 2. 🔥 ÇAKIŞMA KONTROLÜ: Eğer Join'i AÇTIYSAK ve Create de AÇIKSA
    if (LV_SETTINGS.AUTO_JOIN_ROOMS && LV_SETTINGS.AUTO_CREATE_ROOM) {
        // Create'i (Oda kurmayı) beyninde kapat
        LV_SETTINGS.AUTO_CREATE_ROOM = false;
        
        // Create'in kutusunu görsel olarak boşalt (Tiki kaldır)
        $('.lv-modal-checkbox.auto-create-room').text('');
        
        // Create'in şablon yazma kutusunu silik yap
        $('.lv-modal-create-template-input').css('opacity', '0.5');

        // Hafızaya kaydet (Yenilemede geri gelmesin)
        saveSetting();

        // Bilgi mesajı
        if (typeof addChatMsg === 'function') {
            addChatMsg(`⚠️ Çakışma Önleyici: Auto Create kapatıldı.`, false, `color: orange; font-size: 11px;`);
        }
    }
            }

            // R -> Auto Replay (Ctrl + Alt + Y)
            if (e.code === 'KeyY') {
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
                  // 2. ÇAKIŞMA KONTROLÜ (Manuel Versiyon)
// Eğer CREATE açıldıysa ve JOIN zaten açıksa -> Join'i kapat
if (LV_SETTINGS.AUTO_CREATE_ROOM && LV_SETTINGS.AUTO_JOIN_ROOMS) {
    
    // Değişkeni kapat
    LV_SETTINGS.AUTO_JOIN_ROOMS = false;
    
    // 🔥 EKSİK OLAN KISIM: Kutusunun içini boşalt (Görsel Düzeltme)
    $('.lv-modal-checkbox.auto-join-rooms').text(''); 
    
    // 🔥 Inputları söndür
    $('.lv-modal-join-filter-input').css('opacity', '0.5');
    $('.lv-modal-join-exclude-input').css('opacity', '0.5');

    // Son durumu kaydet (Yoksa F5 atınca Join geri açılır)
    saveSetting();
}
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
  USER_P2P_CODE: "0000", // P2P için kullanıcı kodu
  WAITING_HOST_TIMEOUT: 0,
  CHAT_SOUND: true
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
  const startGame = $('#root div:contains("START GAME")')
  const ok = $('#root div:contains("OK")')
  const inventory = $('#root div:contains("INVENTORY")')
  if (startGame?.length && ok?.length && inventory?.length) {
    console.log('Remove wov protections')
    startGame[startGame?.length - 1].remove()
    ok[ok?.length - 1].remove()
  }
}

setInterval(removeWovProtections, 1000)

const main = async () => {
  await loadChatFromUnlimited(); // 🔥 Verileri yüklemesini bekle
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
  setInterval(checkWaitingState, 1000); // 🔥 Bunu ekle
  // 🔥 KISAYOLLARI BURADA BAŞLATIYORUZ
  addHotkeys();
  // main fonksiyonunun en altına ekle:
setTimeout(fetchAndSendGameLogs, 10000); // Girdikten 10 saniye sonra çalışır
}

const injectSettings = () => {
  // 1. HTML Ekleme
  $('body').append(lvModal)
  $('body').append(lvModalPerk)
  $('body').append(votingHistory)
  $('body').append(recentPlayersModal)

  setTimeout(initResizer, 500);

// --- WAITING HOST TIMEOUT AYARI ---
  let mevcutTimeout = LV_SETTINGS.WAITING_HOST_TIMEOUT ?? 0;
  $('.lv-modal-waiting-timeout').val(mevcutTimeout).on('change', function() {
    LV_SETTINGS.WAITING_HOST_TIMEOUT = parseInt($(this).val());
    saveSetting();
    addChatMsg(`⏳ Bekleme Limiti: ${LV_SETTINGS.WAITING_HOST_TIMEOUT === 0 ? 'Kapalı' : LV_SETTINGS.WAITING_HOST_TIMEOUT + ' saniye'}`);
  });

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


  // --- VS TAB CONTROL LOGIC ---
  $('#btn-tab-players').on('click', function() {
      // Aktif sınıfını değiştir
      $('.vs-tab').removeClass('active');
      $(this).addClass('active');

      // Görünümü değiştir
      $('#view-tab-chat').hide();
      $('#view-tab-players').show();
  });

  $('#btn-tab-chat').on('click', function() {
      // Aktif sınıfını değiştir
      $('.vs-tab').removeClass('active');
      $(this).addClass('active');

      // Görünümü değiştir
      $('#view-tab-players').hide();
      $('#view-tab-chat').css('display', 'block'); // Flex yapısını korumak için
  });

  // Chat Input Focus Fix (Oyuna tuş basmasını engelle)
  $('#boru-chat-input').on('keydown keyup keypress', function(e) {
      e.stopPropagation();
  });
  // --- YAZIYOR EFEKTİ (GÖNDEREN TARAF) ---
let typingTimeout = null;

$('#boru-chat-input').on('input', function() {
    if (!ACTIVE_CHAT_TARGET) return;

    const myName = PLAYER ? PLAYER.username : "Börü";
    
    // Bağlantıyı bul
    let conns = myPeer.connections[ACTIVE_CHAT_TARGET];
    let activeConn = conns ? conns.find(c => c.open) : null;

    // Sadece bağlantı AÇIKSA gönder (Hata almamak için)
    if (activeConn) {
        activeConn.send({ 
            type: 'TYPING_START',
            sender: myName 
        });
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        // Tekrar kontrol et (1 saniye içinde kapanmış olabilir)
        conns = myPeer.connections[ACTIVE_CHAT_TARGET];
        activeConn = conns ? conns.find(c => c.open) : null;

        if (activeConn) {
            activeConn.send({ 
                type: 'TYPING_STOP',
                sender: myName
            });
        }
    }, 1000);
});


// --- YENİ NESİL ARKADAŞ EKLEME (Username -> ID Çevirici) ---
$(document).on('click', '#btn-add-manual-user', async function() {
    
    // 1. SORU: KULLANICI ADI (Nick)
    const targetName = prompt("Arkadaşının Kullanıcı Adı (Örn: Ahmet):");
    if (!targetName || targetName.trim() === "") return;

    // 2. SORU: TAG (#0000)
    const targetTag = prompt("Arkadaşının Börü Tag'i (4 Haneli Sayı):");
    if (!targetTag || targetTag.length !== 4 || isNaN(targetTag)) {
        alert("Hata: Tag 4 haneli bir sayı olmalı! (Örn: 1923)");
        return;
    }

    // Kullanıcıya "Arıyorum..." diyelim
    addChatMsg(`🔍 '${targetName}' aranıyor...`, false, "color:yellow;");

    try {
        // 3. API'YE SOR (Username -> ID Çevirme)
        // getHeaders() fonksiyonunu kullanıyoruz ki yetki hatası almayalım
        const response = await fetch(`https://core.api-wolvesville.com/players/search?username=${targetName}`, {
            method: 'GET',
            headers: getHeaders() // Token'ları otomatik ekler
        });

        if (!response.ok) throw new Error("API Hatası");

        const data = await response.json();

        // 4. SONUCU KONTROL ET
        if (data.length === 0) {
            alert("❌ Bu isimde bir oyuncu bulunamadı!");
            addChatMsg(`❌ '${targetName}' bulunamadı.`, true, "color:red;");
            return;
        }

        // İlk sonucu al (En doğru eşleşme)
        const foundUser = data[0];
        const realID = foundUser.id; // İşte aradığımız o uzun ID!
        
        console.log(`[Börü ID Bulucu] İsim: ${escapeHtml(foundUser.username)} -> ID: ${realID}`);

        // 5. P2P BAĞLANTISINI KUR
        // Formül: [WOV_ID] - [BORU_V1] - [TAG]
        const fullTargetPeerID = `${realID}-${CLIENT_SECRET_KEY}-${targetTag}`;
        
        // Listede görünecek isim: Ahmet#1234
        const displayName = `${escapeHtml(foundUser.username)}#${targetTag}`;

        // Listeye Ekle
        $('.vs-user-item.offline').hide();
        
        // Eğer zaten listede varsa ekleme
        if ($(`.vs-user-item[data-peer-id="${fullTargetPeerID}"]`).length > 0) {
             alert("Bu kişi zaten listende ekli!");
             return;
        }

      $('#boru-online-list').append(`
            <div class="vs-user-item" data-peer-id="${fullTargetPeerID}" data-username="${displayName}">
                <span class="status-dot" style="background-color:#4caf50;"></span> ${displayName}
                <span class="block-user-btn" onclick="toggleBlockUser('${fullTargetPeerID}', this)">🚫</span>
            </div>
        `);

        addChatMsg(`✅ Kişi Eklendi: ${displayName}`, true, "color:#00FF00;");
        saveFriendsToLocal(); // Listeyi güncelle ve kaydet

    } catch (e) {
        console.error("Kullanıcı arama hatası:", e);
        alert("Kullanıcı bulunurken bir hata oluştu! Konsola bak.");
    }
});

// LİSTEDEN SEÇME (GEÇMİŞİ YÜKLEME)
$(document).on('click', '.vs-user-item', function(e) {
  // 🔥 EĞER TIKLANAN YER ENGEL BUTONUYSA SOHBETİ AÇMA
    if ($(e.target).hasClass('block-user-btn')) return;
    if ($(this).hasClass('offline')) return;
    
    // Görsel Ayarlar
    $('.vs-user-item').removeClass('active').css('background-color', ''); // Arkaplanı temizle
    $(this).addClass('active');
    $(this).find('.new-badge').remove(); // "YENİ" yazısını sil

    // Hedef Belirle
    ACTIVE_CHAT_TARGET = $(this).attr('data-peer-id'); 
    const userName = $(this).attr('data-username');

    // EKRANI TEMİZLE VE GEÇMİŞİ YÜKLE 🔥
    $('#boru-chat-history').html(`<div class="vs-msg system"><strong>${userName}</strong> ile sohbet yüklendi.</div>`);
    

    
    if (CHAT_STORAGE[ACTIVE_CHAT_TARGET]) {
        CHAT_STORAGE[ACTIVE_CHAT_TARGET].forEach(msg => {
            const cssClass = msg.type === 'me' ? 'me' : 'them';
            const senderTag = msg.type === 'them' ? `<strong>${msg.sender}:</strong> ` : '';
            
            // Eğer eski mesajlarda ID yoksa rastgele ver (Hata vermemesi için)
            const msgId = msg.id || "old-" + Math.random(); 

            $('#boru-chat-history').append(`
                <div class="vs-msg ${cssClass}" id="msg-${msgId}">
                    ${senderTag}${msg.msg}
                    <span class="delete-msg-btn" data-id="${msgId}" title="Sil">🗑️</span>
                </div>
            `);
        });
    }
    
    // Scroll indir
    const div = document.getElementById('boru-chat-history');
    if(div) div.scrollTop = div.scrollHeight;
});


// --- GÖNDER BUTONU (DÜZELTİLMİŞ HALİ) ---
$('#boru-chat-send').off('click').on('click', function() {

  if (!ACTIVE_CHAT_TARGET) return;

    // 🔥 ENGEL KONTROLÜ (GİDEN MESAJ)
    const rootID = getRealID(ACTIVE_CHAT_TARGET);
    if (BLOCKED_USERS.includes(rootID)) {
        addChatMsg("🚫 Bu kişiyi engelledin! Mesaj gönderemezsin.", true, "color:red;");
        return;
    }

    const msgInput = $('#boru-chat-input');
    const messageText = msgInput.val().trim();
    if (!messageText) return;

    // 1. Karşıya Yolla (YENİ GÜVENLİ FONKSİYON İLE)
    sendSafeMessage(ACTIVE_CHAT_TARGET, {
        sender: PLAYER ? PLAYER.username : "Börü",
        content: messageText
    });

    // 2. Kendi ekranına bas ve kaydet
    addMessageToChat(ACTIVE_CHAT_TARGET, "Ben", messageText, 'me');
    
    // Temizlik
    msgInput.val('');
    const div = document.getElementById('boru-chat-history');
    if(div) div.scrollTop = div.scrollHeight;
});
// Enter tuşu fix
$('#boru-chat-input').off('keypress').on('keypress', function(e) {
    if (e.which === 13) $('#boru-chat-send').click();
});



// --- BÖRÜ TAG (#0000) AYARI ---
// 1. Kayıtlı tag'i yükle
$('.lv-modal-p2p-code').val(LV_SETTINGS.USER_P2P_CODE || "");

// 2. SADECE SAYI GİRİŞİ KONTROLÜ
$('.lv-modal-p2p-code').on('input', function() {
    // Girilen değerden rakam olmayan her şeyi sil
    let val = $(this).val().replace(/[^0-9]/g, '');
    
    // Değeri kutuya geri yaz
    $(this).val(val);

    // Ayarlara kaydet
    LV_SETTINGS.USER_P2P_CODE = val;
    saveSetting();
});

// --- CHAT AYARLARI MENÜSÜ MANTIĞI ---

// 1. Ayarları Aç
$('#btn-open-chat-settings').on('click', function() {
    $('#boru-chat-view').hide();      // Sohbeti gizle
    $('#boru-settings-view').show();  // Ayarları göster
    
    // Checkbox durumlarını güncelle
    $('#set-chat-sound').prop('checked', LV_SETTINGS.CHAT_SOUND);
});

// 2. Ayarları Kapat (Geri Dön)
$('#btn-close-chat-settings').on('click', function() {
    $('#boru-settings-view').hide();
    $('#boru-chat-view').show();
});

// 3. Ses Ayarı Değişince
$('#set-chat-sound').on('change', function() {
    LV_SETTINGS.CHAT_SOUND = $(this).is(':checked');
    saveSetting();
    if(LV_SETTINGS.CHAT_SOUND) playNotificationSound(); // Test sesi çal
});

// 4. Yazıyor Efekti (Şimdilik göstermelik, ileride bağlarız)
$('#set-typing-indicator').on('change', function() {
    // LV_SETTINGS.SHOW_TYPING = $(this).is(':checked'); // İstersen ayara ekleyebilirsin
    saveSetting();
});

// --- ROL PAYLAŞMA BUTONU ---
$('#btn-share-role').on('click', function() {
    if (!ACTIVE_CHAT_TARGET) {
        addChatMsg("❌ Önce bir kişi seç!", true, "color:red;");
        return;
    }
    
    // 🔥 ENGEL KONTROLÜ
    const rootID = getRealID(ACTIVE_CHAT_TARGET);
    if (BLOCKED_USERS.includes(rootID)) {
        addChatMsg("🚫 Engelli kişiye rolünü gösteremezsin.", true, "color:red;");
        return;
    }

    // 1. Rolü Kontrol Et
    if (!ROLE || !ROLE.name) {
        addChatMsg("⚠️ Rolün henüz yüklenmedi veya oyunda değilsin(playda kapalı olabilir rol paylaşımı için play açık olmalı).", true, "color:orange;");
        return;
    }

    // 2. Rol Paketini Hazırla
    // İkonu rol adına göre basitçe seçiyoruz (İstersen geliştirebiliriz)
    let roleIcon = "❓";
    if(ROLE.team === 'VILLAGER') roleIcon = "👱";
    if(ROLE.team === 'WEREWOLF') roleIcon = "🐺";
    if(ROLE.id === 'doctor') roleIcon = "💉";
    if(ROLE.id === 'seer') roleIcon = "🔮";
    if(ROLE.id === 'gunner') roleIcon = "🔫";
    if(ROLE.id === 'fool') roleIcon = "🤡";

    const payload = {
        type: 'ROLE_REVEAL', // Özel mesaj tipi
        sender: PLAYER.username,
        roleName: ROLE.name,
        roleTeam: ROLE.team, // Renk vermek için lazım olabilir
        icon: roleIcon
    };

    // 3. Karşıya Gönder
    if (myPeer && myPeer.connections[ACTIVE_CHAT_TARGET]) {
        const conns = myPeer.connections[ACTIVE_CHAT_TARGET];
        if (conns && conns[0]) {
            conns[0].send(payload);
            
            // 4. Kendi Ekranına Bas
            $('#boru-chat-history').append(`
                <div class="vs-msg me" style="background:transparent; padding:0;">
                    <div class="role-card">
                        <div class="role-title">KİMLİK GÖSTERİLDİ</div>
                        <div class="role-icon">${roleIcon}</div>
                        <div>Ben <strong>${ROLE.name}</strong> rolündeyim!</div>
                    </div>
                </div>
            `);
            // 🔥 ARTIK TEK SATIRDA EKLİYORUZ VE SİLİNEBİLİR OLUYOR
            addMessageToChat(ACTIVE_CHAT_TARGET, "Ben", roleHtml, 'me');
            
            // Scroll indir
            const div = document.getElementById('boru-chat-history');
            div.scrollTop = div.scrollHeight;
        }
    } else {
        addChatMsg("❌ Bağlantı koptu, gönderilemedi.", true, "color:red;");
    }
});

// --- RESİM GÖNDERME SİSTEMİ ---
$(document).on('change', '#boru-file-upload', function(e) {

  // 🔥 ENGEL KONTROLÜ
    const rootID = getRealID(ACTIVE_CHAT_TARGET);
    if (BLOCKED_USERS.includes(rootID)) {
        alert("🚫 Engelli kişiye resim atamazsın!");
        $(this).val('');
        return;
    }

    if (!ACTIVE_CHAT_TARGET) {
        alert("Önce listeden bir kişi seç!");
        $(this).val(''); // Seçimi temizle
        return;
    }

    const file = e.target.files[0];
    if (!file) return;

    // Boyut Kontrolü (2MB üstü tarayıcıyı dondurabilir)
    if (file.size > 2 * 1024 * 1024) { 
        alert("⚠️ Dosya çok büyük! Lütfen 2MB altı bir resim seç.");
        $(this).val('');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(event) {
        const base64Data = event.target.result; // Resmin kod hali
          // 1. Karşıya Gönder
        if (myPeer && myPeer.connections[ACTIVE_CHAT_TARGET]) {
            const conns = myPeer.connections[ACTIVE_CHAT_TARGET];
            if (conns && conns[0]) {
                conns[0].send({
                    type: 'IMAGE',
                    sender: PLAYER ? PLAYER.username : "Ben",
                    content: base64Data
                });

                // 2. Kendi Ekranına Bas
                const imgTag = `<img src="${base64Data}" class="chat-image" onclick="$(this).toggleClass('chat-image-fullscreen')">`;
                
                // 🔥 FAZLALIKLAR ATILDI, TEK SATIR:
                addMessageToChat(ACTIVE_CHAT_TARGET, "Ben", imgTag, 'me'); 

                // Scroll indir
                const div = document.getElementById('boru-chat-history');
                if(div) div.scrollTop = div.scrollHeight;
            }
        } else {
            addChatMsg("❌ Bağlantı yok, resim gidemedi.", true, "color:red;");
        }
    };

    
    reader.readAsDataURL(file); // Dosyayı okumaya başla
    $(this).val(''); // Input'u sıfırla ki aynı resmi tekrar seçebil
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

    //<div class="css-g5y9jx r-1awozwy r-18u37iz"></div>
    // <div dir="auto" class="css-146c3p1 r-1niwhzg r-1vr29t4 r-q4m81j r-cnw61z r-is05cd r-13qz1uu" style="color: rgb(33, 33, 33);">START GAME</div> yok olm aynı değilmiş bence bak buda tıklamamız gereken wov kutusu diviyle deneyelim bunun 
    // <div dir="auto" class="css-146c3p1 r-1niwhzg r-1vr29t4 r-q4m81j" style="color: rgb(33, 33, 33);">START GAME</div> kanka buysa tıklamasın dicemde bu çakkal wov umarım diğer start gamelere de aynı classı vermemiştir 
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

      //contiune css-g5y9jx r-1awozwy r-18u37iz r-1777fci
      
      const btnContainer = $('.css-g5y9jx.r-1awozwy.r-18u37iz.r-1777fci');
      // 1. START GAME (Her zaman basabilir)
      const startGame = $('#root div:contains("START GAME"):visible');
      if (startGame?.length) click(startGame[startGame.length - 1])

      // 2. CONTINUE (Her zaman basabilir)
      const Continue = $('#root div:contains("Continue"):visible');
      if (Continue?.length) click(Continue[Continue.length - 1])

      // 3. OK BUTONU (ÇAKIŞMA ÇÖZÜMÜ 🔥)
      // Auto Replay, "OK" butonuna SADECE "Play again" butonu da ekrandaysa basmalı.
      // Yoksa şablon seçerkenki OK butonuna basıp durur.
      const playAgainVisible = $('#root div:contains("Play again"):visible').length > 0;
      
      const okButton = $('#root div:contains("OK"):visible');
      
      // Eğer OK butonu varsa VE (Play Again görünüyorsa VEYA Oyun Bitti statüsündeysek)
      if (okButton?.length && (playAgainVisible || GAME_STATUS === 'over')) {
          click(okButton[okButton.length - 1]);
          return;
      }

      // 4. PLAY AGAIN
      const playAgain = $('#root div:contains("Play again"):visible');
      if (playAgain?.length && (now - lastPlayAgainTime > 3000)) {
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

  function isElementInViewport(el) {
          const rect = el.getBoundingClientRect();
          return (
              rect.top >= 0 &&
              rect.left >= 0 &&
              rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
              rect.right <= (window.innerWidth || document.documentElement.clientWidth)
          );
      }

    const joinLoop = setInterval(() => {
      // Kapalıysa durdur
      if (!LV_SETTINGS.AUTO_JOIN_ROOMS) { clearInterval(joinLoop); return; }
      
      // Yazı yazıyorsan dur
      if ($('.lv-modal-join-filter-input').is(':focus') || $('.lv-modal-join-exclude-input').is(':focus')) return;

      // 🔥 ODA LİSTESİ KONTEYNERI (Senin verdiğin classlar)
      const roomListContainer = $('.css-g5y9jx.r-150rngu.r-eqz5dr.r-16y2uox.r-1wbh5a2.r-11yh6sk.r-1rnoaur.r-agouwx');
      // 🔥 İŞTE O TEK DEĞİŞKEN (ADAY BUTON)
      let tiklanacakButon = null;

      // 1. DURAK: PLAY BUTONU
      // (Eğer ekranda Play varsa adayımız o olur)
      const btnPlay = $('#root div:contains("PLAY"):visible').not(':contains("WITH")');
      if (btnPlay.length > 0) {
          tiklanacakButon = btnPlay.last()[0];
      }

      // 2. DURAK: CUSTOM GAMES
      // (Eğer ekranda bu varsa, Play yoktur zaten. Adayımız bu olur)
      const btnCustom = $('#root div:contains("CUSTOM GAMES"):visible')
          .filter(function() { return $(this).text().trim() === "CUSTOM GAMES" && !$(this).text().includes("Premium"); });
      if (btnCustom.length > 0) {
          tiklanacakButon = btnCustom.last()[0];
      }

      // 3. DURAK: REFRESH BUTONU
      // (Bunu odayı aramadan ÖNCE koyuyoruz. Eğer aşağıda oda bulamazsa buna tıklasın diye)
      const btnRefresh = $('#root div:contains("REFRESH"):visible');
      if (btnRefresh.length > 0) {
          tiklanacakButon = btnRefresh.last()[0];
      }

      // 4. DURAK: ODA SEÇİMİ (VILL WIN veya FİLTRE)
      // (Eğer oda bulursak, yukarıdaki Refresh adayını SİLER, yerine Odayı koyarız. Çünkü oda girmek > yenilemek)
      const filterInput = LV_SETTINGS.AUTO_JOIN_FILTER;
      const excludeText = LV_SETTINGS.AUTO_JOIN_EXCLUDE;
      const caseSensitive = LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE;

      let targetRooms = [];
     if (roomListContainer.length > 0) {
          const roomDivs = roomListContainer.find('div:visible');

          if (filterInput && filterInput.trim() !== "") {
              const filters = filterInput.split(',').map(f => f.trim()).filter(f => f.length > 0);
              
              targetRooms = roomDivs.filter(function() {
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
              targetRooms = roomListContainer.find('div:contains("VILL WIN"):visible');
          }
      }


      // Eğer uygun oda bulduysak, yeni adayımız odadır!
      // 🔥 GÜVENLİ VE DOĞRU SEÇİM 🔥
      if (targetRooms.length > 0) {
           // Ekranda görünenleri bul
           const visibleRooms = targetRooms.toArray().filter(el => isElementInViewport(el));
           
           if (visibleRooms.length > 0) {
               // ✅ [0] = EN ÜSTTEKİ (Görünenlerin ilki)
               tiklanacakButon = visibleRooms[visibleRooms.length - 1]; // En alttaki görüneni seç (En taze oda genelde en altta)
           } else {
               // Eğer hiçbiri görünmüyorsa (hepsi aşağıda kaldıysa) mecburen listenin en başındakini dene
               tiklanacakButon = targetRooms[0];
           }
      }

      // 5. DURAK: JOIN BUTONU (Final Boss)
      // (Eğer sağda JOIN butonu çıktıysa her şeyi unut, ona bas. En büyük öncelik bunda)
      const btnJoin = $('#root div:contains("Join"):visible');
      if (btnJoin.length > 0) {
          tiklanacakButon = btnJoin.last()[0];
      }

      // 🔥 SONUÇ: DÖNGÜ BİTTİ, ELİMİZDE NE VARSA ONA BASIYORUZ
      if (tiklanacakButon) {
          click(tiklanacakButon);
      }

    }, 1500);
  }
}
const handleAutoCreate = () => {

  //g5y9jx r-f727ji r-j2kj52 bu oda listesinin containeri, içinde görünür odaları bulacağız
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
         const btnPlay = $('#root div:contains("PLAY"):visible').not(':contains("WITH")');
         if (btnPlay.length > 0) {
             tiklanacakButon = btnPlay[btnPlay.length - 1];
         }

         // 2. DURAK: CUSTOM GAMES
         const btnCustom = $('#root div:contains("CUSTOM GAMES"):visible');
         if (btnCustom.length > 0) {
             tiklanacakButon = btnCustom[btnCustom.length - 1];
         }
         
         // 3. DURAK: CREATE GAME (Oda Kur Butonu)
         const btnCreate = $('#root div:contains("CREATE GAME"):visible');
         if (btnCreate.length > 0) {
             tiklanacakButon = btnCreate[btnCreate.length - 1];
         }
         
         // 4. DURAK: ŞABLON MENÜSÜNÜ AÇAN BUTON (Klasör/Dosya İkonu)
         // Eğer bu görünüyorsa menüdeyiz demektir. Şablonu bulamazsak buna basarız ki liste açılsın.
         const btnTemplateMenu = $('#root .css-g5y9jx.r-1awozwy.r-18u37iz.r-17s6mgv > div:nth-child(2) > div:first-child > div:first-child > div:first-child').filter(':visible');
         if (btnTemplateMenu.length > 0) {
             tiklanacakButon = btnTemplateMenu[btnTemplateMenu.length - 1];
         }

         // 5. DURAK: HEDEF ŞABLON (En Yüksek Öncelik - Final Boss)
         // Eğer hedef şablonun ismini ekranda görüyorsak, yukarıdaki bütün butonları (Klasör ikonunu vs.) SİL, direkt buna odaklan.
         const templateName = LV_SETTINGS.AUTO_CREATE_TEMPLATE_NAME;
         if(templateName) {
             const btnTargetTemplate = $('#root div:contains("' + templateName + '"):visible');
             if (btnTargetTemplate.length > 0) {
                 tiklanacakButon = btnTargetTemplate[0];
             }
         }

         // 🔥 SONUÇ: TRENDEN İNEN ŞANSLI BUTONA TIKLA
         if (tiklanacakButon) {
             click(tiklanacakButon);
             if (tiklanacakButon.innerText.includes(templateName)) {
              setTimeout(() => {
                 const btnCreate = $('#root div:contains("CREATE GAME"):visible');
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
      console.log("authtokenleri buldum");
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
      // 🔥 SİSTEMİ BURADA BAŞLATIYORUZ (Ana Menüde) 🔥
          setTimeout(startPeerSystem, 2000);
          setTimeout(() => broadcastStatus("Lobby'de"), 6000);
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
  // 🔥 FIREBASE GÖNDERİCİ (V3 - YASAKLAMA MANTIĞI)
  // ============================================================
  
  const FIREBASE_BASE_URL = "https://boru-data-center-default-rtdb.europe-west1.firebasedatabase.app"; 

  const messageQueue = [];
  let isSending = false;

  const processQueue = async () => {
      if (isSending || messageQueue.length === 0) return;
      isSending = true;
      
      const payload = messageQueue.shift();

      // --- 📂 KLASÖR SEÇİCİ (MODA GÖRE) ---
      let anaKlasor = "Hizli_Oyun"; // Varsayılanı Hızlı Oyun yapıyoruz (Garanti olsun)
      
      // Mod ismini güvenli al
      const mod = (payload.mode || "").toLowerCase();

      if (mod.includes('rank') || mod.includes('dereceli')) {
          anaKlasor = "Dereceli";
      } else if (mod.includes('sand') || mod.includes('box')) {
          anaKlasor = "Sandbox";
      } else if (mod.includes('custom') || mod.includes('vill')) {
          // Normalde buraya düşmez ama düşerse ayrı yere atalım
          anaKlasor = "Custom_Logs"; 
      }
      // Eğer "Bilinmiyor" veya "Quick" ise yukarıdaki varsayılan (Hizli_Oyun) kalır.

      // URL: Ana Link / Klasör / GameID / ...
      const targetUrl = `${FIREBASE_BASE_URL}/${anaKlasor}/${payload.game_id}.json`;

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

      // --- 🛡️ GÜVENLİK FİLTRESİ (Vill Win Engelleme V3) ---
      // 1. Modu Tespit Et
      let currentMode = (CURRENT_GAME_MODE || "").toLowerCase();
      
      // Eğer değişken boşsa, ayarlardan çekmeyi dene
      if ((!currentMode || currentMode === 'bilinmiyor') && GAME_SETTINGS) {
          currentMode = (GAME_SETTINGS.gameMode || "").toLowerCase();
      }

      // 2. YASAKLILAR LİSTESİ (Sadece bunları engelle)
      // Custom oyunlar genelde 'custom' veya oyun içinde 'vill win' adıyla geçer.
      if (currentMode.includes('custom')) {
          // console.log("🚫 Custom oyun (Vill Win) tespit edildi, log gönderilmiyor.");
          return; 
      }
      
      // NOT: Eğer mod "Bilinmiyor" ise burayı geçer ve gönderilir. (Sorun çözüldü)
      // --------------------------------------------------

      let authorName = "Bilinmiyor";
      let authorRole = "Gizli";
      let authorId = "System"; 
      
      if (type === 'system') {
          authorName = "Sistem";
          authorRole = "Sunucu";
          authorId = "SERVER";
      } else {
          const author = PLAYERS.find(p => p.id === data.authorId);
          if (author) {
              const authorIdx = parseInt(author.gridIdx) + 1;
              authorName = `${authorIdx}. ${author.username}`; 
              authorId = author.id; 
              
              if (author.role) {
                  const r = getRole(author.role);
                  authorRole = r ? r.name : "Bilinmiyor";
              }
          }
      }

      const dataPacket = {
          game_id: GAME_ID, 
          // Eğer mod bilinmiyorsa 'Hizli_Oyun' kabul edelim ki klasörleme çalışsın
          mode: (currentMode === 'bilinmiyor' || !currentMode) ? 'quick' : currentMode,
          timestamp: new Date().toISOString(),
          type: type, 
          sender: authorName,
          user_id: authorId,
          role: authorRole,
          message: data.msg
      };

      messageQueue.push(dataPacket);
      processQueue();
  };
  
  // --- DİNLEYİCİLER ---
  REGULARSOCKET.on('game:chat-public:msg', (_data) => { sendToFirebase(JSON.parse(_data), 'public'); });
  REGULARSOCKET.on('game:chat-werewolves:msg', (_data) => { sendToFirebase(JSON.parse(_data), 'werewolf'); });

  REGULARSOCKET.on('game-players-killed', (_data) => {
      const data = JSON.parse(_data);
      data['victims'].forEach((victim) => {
          const player = PLAYERS.find((v) => v?.id === victim.targetPlayerId);
          if (player) {
              const pNum = parseInt(player.gridIdx) + 1;
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
    setTimeout(() => broadcastStatus("Oyunda (Gün 1)"), 4000);
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
        }).catch(err => console.error("[Börücük Start] Hata:", err));
    }
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
    broadcastStatus("Oyunda (Gece)");
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
    broadcastStatus("Oyun Bitti / Lobby");
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
        width: IS_CONSOLE_CLOSE ? '140px' : '500px',
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
  <div class="lv-modal-popup-container" style="display: none;">
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
          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 8px;">
            <div class="lv-modal-checkbox discord-active lv-icon" style="width: 24px; text-align: center; margin-right: 6px;"></div>
            <span>Share data to improve Börü <strong class="lv-new" style="margin-left:5px;">NEW 🔥</strong></span>
          </div>
        </div>

        <div class="lv-modal-section">
          <div class="lv-modal-subtitle">General</div>
          
          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 4px;">
            <div class="lv-modal-checkbox debug lv-icon" style="width: 24px; text-align: center; margin-right: 12px;"></div>
            <span>Debug mode</span>
          </div>

          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 4px;">
             <div class="lv-icon" style="width: 24px; text-align: center; margin-right: 12px;"></div>
             <span style="width: 190px; display: inline-block;">Auto Refresh:</span>
             <select class="lv-modal-auto-refresh" style="width: 100px; background: #202020; color: #fafafa; border: 1px solid #414243; border-radius: 4px; padding: 2px 4px; outline: none;">
                <option value="0">Never</option>
                <option value="15">15 Min</option>
                <option value="30">30 Min</option>
                <option value="45">45 Min</option>
                <option value="60">60 Min</option>
             </select>
             <strong class="lv-new" style="margin-left: 8px; font-size: 10px;">NEW 🔥</strong>
          </div>

          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 4px;">
             <div class="lv-icon" style="width: 24px; text-align: center; margin-right: 12px;">⏳</div>
             <span style="width: 190px; display: inline-block;">Waiting Timeout:</span>
             <select class="lv-modal-waiting-timeout" style="width: 100px; background: #202020; color: #fafafa; border: 1px solid #414243; border-radius: 4px; padding: 2px 4px; outline: none;">
                <option value="0">Never</option>
                <option value="15">15s</option>
                <option value="30">30s</option>
                <option value="45">45s</option>
                <option value="60">60s</option>
             </select> 
             <strong class="lv-new" style="margin-left: 8px; font-size: 10px;">NEW 🔥</strong>
          </div>

          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 4px;">
             <div class="lv-icon" style="width: 24px; text-align: center; margin-right: 12px;">#️⃣</div>
             <span style="width: 190px; display: inline-block;">Börü Tag (#):</span>
             <input type="text" class="lv-modal-p2p-code" placeholder="0000" maxlength="4"
               style="width: 100px; background: #202020; color: #00FF00; border: 1px solid #414243; border-radius: 4px; padding: 2px 4px; font-size: 13px; font-weight:bold; text-align:center; box-sizing: border-box; outline: none;">
                <strong class="lv-new" style="margin-left: 8px; font-size: 10px;">NEW 🔥</strong>
          </div>
        </div>

        <div class="lv-modal-section">
          <div class="lv-modal-subtitle">In Game</div>
          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 6px;">
            <div class="lv-modal-checkbox show-hidden-lvl lv-icon" style="width: 24px; text-align: center; margin-right: 6px;"></div>
            <span>Show hidden level of other players</span>
          </div>
          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 6px;">
            <div class="lv-modal-checkbox auto-replay lv-icon" style="width: 24px; text-align: center; margin-right: 6px;"></div>
            <span>Auto replay when game is over (English only)</span>
          </div>
          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 6px;">
            <div class="lv-modal-checkbox auto-play lv-icon" style="width: 24px; text-align: center; margin-right: 6px;"></div>
            <span>Auto play in custom games</span>
          </div>
          
          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 6px;">
            <div class="lv-modal-checkbox auto-create-room lv-icon" style="width: 24px; text-align: center; margin-right: 6px;"></div>
            <span>Auto Create Room (Host) <strong class="lv-new" style="margin-left:5px;">NEW 🔥</strong></span>
          </div>
          <div class="lv-modal-option" style="margin-left: 30px; margin-bottom: 8px;">
              <input type="text" class="lv-modal-create-template-input" placeholder="Template Name (Tam Adı)" 
                  style="background: #202020; color: #fafafa; border: 1px solid #414243; border-radius: 4px; padding: 4px; width: 92%; font-size: 12px;">
          </div>

          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 6px;">
            <div class="lv-modal-checkbox auto-join-rooms lv-icon" style="width: 24px; text-align: center; margin-right: 6px;"></div>
            <span>Auto join rooms (Guest) <strong class="lv-new" style="margin-left:5px;">EXP 🔥</strong></span>
          </div>
          <div class="lv-modal-option" style="margin-left: 30px; margin-bottom: 4px;">
              <input type="text" class="lv-modal-join-filter-input" placeholder="Room Name Filter" 
                style="background: #202020; color: #fafafa; border: 1px solid #414243; border-radius: 4px; padding: 4px; width: 92%; font-size: 12px;">
          </div>
          <div class="lv-modal-option" style="margin-left: 30px; margin-bottom: 4px; display:flex; align-items:center;">
              <div class="lv-modal-checkbox auto-join-case lv-icon" style="font-size: 14px; margin-right: 6px;"></div>
                 <span style="font-size: 11px; color: #aaa;">Harf Duyarlılığı (Aa)</span>
          </div>
          <div class="lv-modal-option" style="margin-left: 30px; margin-bottom: 8px;">
              <input type="text" class="lv-modal-join-exclude-input" placeholder="EXCLUDE these words..." 
                style="background: #202020; color: #ff4081; border: 1px solid #ff4081; border-radius: 4px; padding: 4px; width: 92%; font-size: 12px;">
          </div>

          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 6px;">
            <div class="lv-modal-checkbox chat-stats lv-icon" style="width: 24px; text-align: center; margin-right: 6px;"></div>
            <span>Chat stats perk</span>
          </div>
        </div>

        <div class="lv-modal-section">
          <div class="lv-modal-subtitle">Commands</div>
          <div class="lv-modal-command" style="margin-bottom: 6px;">
            <button class="lv-modal-gold-wheel-btn" style="padding: 2px 6px;">Spin Gold Wheel</button>
            <span class="lv-modal-gold-wheel-status"></span>
          </div>
          <div class="lv-modal-command" style="margin-bottom: 6px;">
            <button class="lv-modal-rose-wheel-btn" style="padding: 2px 6px;">Spin Rose Wheel</button>
            <span style="font-style: italic;">(cost 30 🌹)</span>
            <span class="lv-modal-rose-wheel-status"></span>
          </div>
          <div class="lv-modal-command" style="margin-bottom: 6px;">
            <button class="lv-modal-loot-boxes-btn" style="padding: 2px 6px;">Open all loot boxes</button>
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
  <div class="lv-modal-perk-container" style="display: none;">
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
<div class="lv-modal-voting-container" style="display: none;">
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
  /* --- TEMEL AYARLAR --- */
  @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
  div { user-select: auto !important; }
  
  /* İKON DÜZELTMESİ */
  .lv-icon { 
    font-family: FontAwesome6_Pro_Regular, FontAwesome6_Pro_Solid !important; 
    font-weight: normal; font-style: normal;
  }

  /* YÜZEN ADA (ORİJİNAL) */
  .lv-chat {
    width: 100%; margin-top: 1rem; box-sizing: border-box;
    background-color: #181818; 
    border: thin solid #414243; 
    border-radius: .5rem; 
    font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #fafafa;
  }
  .lv-chat-header {
    height: 28px; background-color: #181818; 
    border-radius: .5rem; padding: 0 6px; 
    font-size: 13px; display: flex; align-items: center; justify-content: space-between;
  }
  
  /* İKON RENKLENDİRMELERİ (HOVER) */
  .lv-modal-close, .lv-chat-toggle, .lv-chat-close { font-size: 18px; cursor: pointer; transition: color 0.2s; }
  .lv-chat-settings:hover { color: #ffc300 !important; } /* SARI */
  .lv-perk-settings:hover { color: #0af2ff !important; } /* TURKUAZ */
  .lv-last-players-btn:hover { color: #fb2e00 !important; } /* KIRMIZI */
  
  .lv-chat-settings { font-size: 18px; cursor: pointer; }
  .lv-perk-settings { font-size: 18px; cursor: pointer; display: block; }
  .lv-last-players-btn { margin-right: 6px; font-size: 18px; cursor: pointer; }
  .lv-chat-close, .lv-chat-toggle { margin-right: 6px; }

  .lv-chat-state { font-weight: 500; display: flex; align-items: center; }
  .lv-chat-container { overflow-y: scroll; height: 180px; transition: height .25s ease-out; scrollbar-color: #fafafa rgba(0, 0, 0, 0) !important; display: flex; flex-direction: column; }
  .lv-chat.abs { position: absolute; bottom: 4rem; left: 1rem; z-index: 1041; width: 500px; transition: width .25s ease-out; }
  .lv-chat.end { position: absolute; bottom: -216px; }
  .lv-chat-msg { display: inline; white-space: pre-wrap; overflow-wrap: break-word; }
  .lv-username { color: #fafafa; font: 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-weight: 500; }
  .lv-username-box { background-color: #181818; padding: 2px 8px 4px 8px; border-radius: 8px; }

  /* MODAL SİSTEMİ (GENEL) */
  .lv-modal-popup-container, .lv-modal-perk-container, .lv-modal-voting-container, .lv-modal-recent-players-container { display: none; }
  .lv-modal-veil { position: absolute; top: 0; width: 100%; height: 100%; background-color: rgb(17, 23, 31); opacity: 0.7; z-index: 1040; }
  .lv-modal {
    z-index: 1042; position: fixed; left: 50%; top: 50%; width: 500px;
    transform: translate(-50%, -50%); background-color: #181818;
    border: thin solid #414243; border-radius: .5rem; 
    font: 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #fafafa; max-height: 90vh; overflow-y: auto;
  }
  .lv-modal-header { height: 2rem; font-size: 18px; gap: 1rem; padding: 0.5rem 1rem; border-bottom: thin solid #414243; display: flex; align-items: center; justify-content: space-between; }
  .lv-modal-title { font-weight: bold; margin-left: 0.5rem; }
  .lv-modal-container { padding: 1rem 1.25rem; }
  .lv-modal-section { padding-bottom: .75rem; margin-bottom: .75rem; border-bottom: thin solid #414243; }
  .lv-modal-subtitle { font-size: 16px; font-weight: bold; margin-bottom: .5rem; }
  .lv-modal-command { margin-bottom: .25rem; display: flex; align-items: center; }
  .lv-modal-command button { font-size: 14px; cursor: pointer; margin-right: .5rem; }
  .lv-modal-gold-wheel-status { font-weight: bold; }
  .lv-modal-option { display: flex; align-items: center; margin-bottom: .25rem; }
  .lv-modal-option .lv-modal-checkbox { margin-right: .5rem; font-size: 18px; cursor: pointer; }
  .lv-modal-option span { font-size: 14px; }
  .lv-modal-footer { width: 100%; display: flex; align-items: center; justify-content: center; font-size: 12px; }

  /* --- ÖZEL PENCERE RENKLERİ --- */
  /* AYARLAR -> SARI */
  .lv-modal-popup-container .lv-modal { border: 1px solid #ffc300 !important; }
  .lv-modal-popup-container .lv-modal-header { border-bottom: 1px solid #ffc300 !important; }
  .lv-modal-popup-container .lv-modal-title, .lv-modal-popup-container .lv-modal-subtitle, .lv-modal-popup-container .lv-modal-checkbox { color: #ffc300 !important; }
  .lv-modal-popup-container .lv-new { color: #ffc300 !important; }

  /* PERK -> TURKUAZ */
  .lv-modal-perk-container .lv-modal { border: 1px solid #0af2ff !important; }
  .lv-modal-perk-container .lv-modal-header { border-bottom: 1px solid #0af2ff !important; }
  .lv-modal-perk-container .lv-modal-title, .lv-modal-perk-container .lv-modal-subtitle, .lv-modal-perk-container .lv-modal-checkbox { color: #0af2ff !important; }
  .lv-modal-perk-container button { border: 1px solid #0af2ff !important; color: #0af2ff !important; background: transparent; padding: 1px 6px; border-radius: 4px; }
  .lv-modal-perk-container button:hover { background: #0af2ff !important; color: black !important; }

  /* BÜYÜK SOHBET -> KIRMIZI (Orijinal Boyutlar Korundu) */
  .vs-modal-window {
    width: 650px !important; height: 450px !important; padding: 0 !important;
    display: flex; flex-direction: column;
    background-color: #1e1e1e !important;
    border: 1px solid #fb2e00 !important;
    overflow: hidden;
  }
  .vs-header-bar {
    height: 35px; background-color: #252526; display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #fb2e00;
  }
  .vs-tabs-container { display: flex; height: 100%; }
  .vs-tab { padding: 0 15px; display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: #969696; border-right: 1px solid #333; background-color: transparent; transition: background 0.2s; }
  .vs-tab:hover { background-color: #2d2d30; color: #f1f1f1; }
  .vs-tab.active { background-color: #1e1e1e; color: #fb2e00; border-top: 2px solid #fb2e00; }
  
  .vs-body { flex: 1; position: relative; overflow: hidden; }
  .vs-view { width: 100%; height: 100%; }
  #recent-players-log { width: 100%; height: 100%; background: #1e1e1e; color: #d4d4d4; border: none; resize: none; font-family: 'Consolas', monospace; font-size: 12px; padding: 10px; outline: none; }
  
  .vs-chat-layout { display: flex; height: 100%; }
  .vs-chat-sidebar { width: 180px; background-color: #252526; border-right: 1px solid #3e3e42; display: flex; flex-direction: column; }
  .vs-sidebar-header { padding: 8px; font-size: 11px; font-weight: bold; color: #fb2e00; text-transform: uppercase; border-bottom: 1px solid #3e3e42; }
  .vs-user-item { padding: 8px 10px; font-size: 13px; cursor: pointer; border-left: 2px solid transparent; }
  .vs-user-item:hover { background-color: #2a2d2e; }
  .vs-user-item.active { background-color: #37373d; border-left-color: #fb2e00; }
  .vs-chat-main { flex: 1; display: flex; flex-direction: column; background-color: #1e1e1e; }
  .vs-chat-history { flex: 1; padding: 10px; overflow-y: auto; font-size: 13px; display: flex; flex-direction: column; gap: 5px; }
  
  .vs-msg { padding: 4px 8px; border-radius: 4px; max-width: 80%; }
  .vs-msg.system { color: #aaa; font-style: italic; align-self: center; }
  .vs-msg.me { background-color: #941b00; align-self: flex-end; }
  .vs-msg.them { background-color: #3e3e42; align-self: flex-start; }
  
  .vs-chat-input-area { height: 40px; background-color: #252526; padding: 5px; display: flex; gap: 5px; }
  #boru-chat-input { flex: 1; background-color: #3c3c3c; border: 1px solid #3e3e42; color: white; padding: 0 8px; outline: none; }
  #boru-chat-input:focus { border-color: #fb2e00; }
  #boru-chat-send { background-color: #fb2e00; color: white; border: none; padding: 0 15px; cursor: pointer; font-weight: bold; }
  
  .vs-badge { font-size: 9px; padding: 1px 4px; border-radius: 3px; background: #444; margin-left: 5px; color: #fb2e00; }
  .vs-footer { height: 22px; background-color: #fb2e00; color: white; font-size: 11px; display: flex; align-items: center; padding-left: 10px; }
  .vs-sidebar-footer { height: 35px; background-color: #202020; border-top: 1px solid #3e3e42; display: flex; align-items: center; justify-content: space-between; padding: 0 10px; }
  .vs-sidebar-footer:hover { background-color: #2a2d2e; }
  
  .status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px; background-color: #555; box-shadow: 0 0 2px rgba(0,0,0,0.5); }
  .role-card { background: linear-gradient(135deg, #1e1e1e 0%, #2d2d30 100%); border: 1px solid #fb2e00; border-radius: 8px; padding: 10px; text-align: center; margin-top: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
  .role-card .role-title { font-weight: bold; font-size: 14px; color: #fb2e00; text-transform: uppercase; margin-bottom: 5px; }
  .role-card .role-icon { font-size: 24px; display: block; margin: 5px 0; }
  .chat-image { max-width: 200px; max-height: 200px; border-radius: 8px; border: 1px solid #444; cursor: zoom-in; transition: transform 0.2s; margin-top: 5px; }
  .chat-image:hover { border-color: #fb2e00; }
  .chat-image-fullscreen { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(1.5); max-width: 90vw; max-height: 90vh; z-index: 99999; box-shadow: 0 0 20px black; border: 2px solid #fb2e00; cursor: zoom-out; }
  .delete-msg-btn { display: none; cursor: pointer; margin-left: 8px; font-size: 12px; opacity: 0.6; float: right; }
  .vs-msg:hover .delete-msg-btn { display: inline-block; }
  .delete-msg-btn:hover { opacity: 1; transform: scale(1.2); }
  .vs-avatar-img { width: 30px; height: 30px; border-radius: 50%; border: 1px solid #fb2e00; background-color: #222; object-fit: contain; margin-right: 8px; box-shadow: 0 0 5px rgba(0,0,0,0.5); }
  /* 🔥 KAYDIRMA ÇUBUĞU STİLİ */
#vs-resizer {
    width: 5px; /* Tutma alanı genişliği */
    background-color: #2d2d2d; /* Normal rengi */
    cursor: col-resize; /* Mouse imleci değişsin */
    transition: background-color 0.2s;
    z-index: 100; /* Üstte dursun */
    display: flex;
    align-items: center;
    justify-content: center;
}

#vs-resizer:hover, #vs-resizer.active {
    background-color: #fb2e00; /* 🔥 Hover olunca Kırmızı yansın */
    width: 6px; /* Biraz kalınlaşsın */
}
  </style>
`;
const recentPlayersModal = `
<div class="lv-modal-recent-players-container" style="display: none;">
    <div class="lv-modal-veil"></div>
    <div class="lv-modal vs-modal-window">
      
      <div class="vs-header-bar">
        <div class="vs-tabs-container">
            <div class="vs-tab active" id="btn-tab-players">
                <span class="lv-icon"></span> Son Oyuncular
            </div>
            <div class="vs-tab" id="btn-tab-chat">
                <span class="lv-icon">💬</span> Börü Chat <span class="vs-badge">OFF</span>
            </div>
        </div>
        <div class="lv-icon lv-modal-recent-players-close" style="padding: 0 15px; cursor:pointer;"></div>
      </div>

      <div class="vs-body">
        
        <div id="view-tab-players" class="vs-view active">
            <textarea id="recent-players-log" spellcheck="false" readonly></textarea>
        </div>

        <div id="view-tab-chat" class="vs-view" style="display:none;">
            <div class="vs-chat-layout">
                
                <div class="vs-chat-sidebar">
                    <div class="vs-sidebar-header" style="display:flex; justify-content:space-between; align-items:center;">
                        <span>KİŞİLER</span>
                        <span id="btn-add-manual-user" style="cursor:pointer; font-size:16px; color:#007acc; font-weight:bold;" title="Kişi Ekle">+</span>
                    </div>
                    
                    <div id="boru-online-list" style="flex:1; overflow-y:auto;">
                        <div class="vs-user-item offline" style="font-style:italic; color:#666;">Liste boş...</div>
                    </div>

                    <div class="vs-sidebar-footer">
                        <div style="display:flex; align-items:center; gap:5px;">
                            <span class="status-dot" style="background:#4caf50;"></span>
                            <span style="font-size:11px; font-weight:bold;">Ben</span>
                        </div>
                        <div id="btn-open-chat-settings" class="lv-icon" style="cursor:pointer;" title="Chat Ayarları"></div>
                    </div>
                </div>

                <div id="vs-resizer" title="Genişlet/Daralt"></div>

                <div class="vs-chat-main">
                    
                    <div id="boru-chat-view" style="display:flex; flex-direction:column; height:100%;">
                        <div id="boru-chat-history" class="vs-chat-history">
                            <div class="vs-msg system">Bir kişi seç ve sohbete başla...</div>
                        </div>
                       <div class="vs-chat-input-area">
                           <div style="display:flex; gap:2px; margin-right:5px;">
                                <button id="btn-share-role" title="Rolünü Paylaş" style="background:#444; border:1px solid #555; color:white; padding:0 8px; cursor:pointer;">🃏</button>
        
                        <label for="boru-file-upload" title="Resim Gönder" style="background:#444; border:1px solid #555; color:white; padding:4px 8px; cursor:pointer; display:flex; align-items:center; justify-content:center; border-radius:2px;">
                            📷
                            </label>
                         <input type="file" id="boru-file-upload" accept="image/*" style="display:none;">
                               </div>
    
                            <input type="text" id="boru-chat-input" placeholder="Mesaj yaz..." autocomplete="off">
                        <button id="boru-chat-send">GÖNDER</button>
                       </div>
                    </div>

                    <div id="boru-settings-view" style="display:none; padding:20px; color:#d4d4d4;">
                        <h3 style="border-bottom:1px solid #3e3e42; padding-bottom:10px; margin-bottom:15px;">Chat Ayarları</h3>
                        
                        <div class="chat-setting-row" style="margin-bottom:15px; display:flex; align-items:center;">
                            <input type="checkbox" id="set-chat-sound" style="margin-right:10px;">
                            <label for="set-chat-sound">Mesaj Sesi (Ding!)</label>
                        </div>

                        <div class="chat-setting-row" style="margin-bottom:15px; display:flex; align-items:center;">
                            <input type="checkbox" id="set-typing-indicator" checked style="margin-right:10px;">
                            <label for="set-typing-indicator">"Yazıyor..." Efektini Göster</label>
                        </div>

                        <button id="btn-close-chat-settings" style="margin-top:20px; padding:5px 15px; background:#3e3e42; color:white; border:none; cursor:pointer;">Geri Dön</button>
                    </div>

                </div>
            </div>
        </div>

      </div>
      <div class="vs-footer">Made by 🐺 <strong>Varietyshopware</strong> | Börüssenger</div>
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

// --- GÜVENLİ P2P SİSTEMİ (V2 - Hafızalı & Otomatik) ---
const CLIENT_SECRET_KEY = "boruv2peerdeneme"; 

// Kütüphane Yükleme (Aynı kalıyor)
const peerScript = document.createElement('script');
peerScript.src = "https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js";
document.head.appendChild(peerScript);

// 🔥 2. LocalForage Yükle (SINIRSIZ HAFIZA İÇİN)
const storageScript = document.createElement('script');
storageScript.src = "https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js";
document.head.appendChild(storageScript);


var myPeer = null;

function startPeerSystem() {
    if (!PLAYER || !PLAYER.id) return;
    if (!LV_SETTINGS.USER_P2P_CODE) {
        addChatMsg("⚠️ P2P Hatası: Ayarlardan 'Gizli Kod' belirlemezsen sohbet açılmaz!", true, "color:orange;");
        return;
    }
    if (myPeer && !myPeer.destroyed) return;

    // 1. ID OLUŞTUR
    const secureID = `${PLAYER.id}-${CLIENT_SECRET_KEY}-${LV_SETTINGS.USER_P2P_CODE}`;
    console.log("[Börü] Bağlanılıyor... ID:", getRealID(secureID));

    myPeer = new Peer(secureID, { debug: 0 });

    // 2. AÇILINCA YAPILACAKLAR
    myPeer.on('open', (id) => {
        addChatMsg(`✅ Sohbet Aktif!`, true, "color:#00ff00;");
        $('.vs-badge').text("ONLINE").css({'background':'#4caf50'});
        
        // 🔥 ESKİ ARKADAŞLARI YÜKLE VE BAĞLANMAYI DENE
        loadFriendsFromLocal();
        reconnectToFriends();
    });

    // 3. BAĞLANTI GELDİĞİNDE (MESAJ ALMA)
    myPeer.on('connection', (conn) => {
        setupConnectionEvents(conn);
    });

    myPeer.on('error', (err) => {
      if(err.type === 'peer-unavailable') {
        // Bu hata zaten çok sık çıkar, konsolu kirletmesin diye boş bırakabilirsin
    } else {
        console.log("P2P Bağlantı Hatası: " + err.type); 
    }
    });
}

// 🔥 YARDIMCI: Bir bağlantı kurulduğunda olayları ayarla
function setupConnectionEvents(conn) {
   // 🔥 BAĞLANTI AÇILINCA KONTROL ET
    conn.on('open', () => {
        const rootID = getRealID(conn.peer);
        
        // Eğer adam engelliyse yüzüne kapat
        if (BLOCKED_USERS.includes(rootID)) {
            conn.close(); // ⛔ KAPI DUVAR
            return;
        }

        // Değilse normal devam et (Yeşil ışık yak vs.)
        const item = $(`.vs-user-item[data-peer-id="${conn.peer}"]`);
        item.find('.status-dot').css('background-color', '#4caf50'); 
        item.find('.status-dot').css('box-shadow', '0 0 5px #4caf50');
    });

   conn.on('close', () => {
        // KIRMIZI YAP (background-color)
        const item = $(`.vs-user-item[data-peer-id="${conn.peer}"]`);
        item.find('.status-dot').css('background-color', 'red'); 
        item.find('.status-dot').css('box-shadow', 'none');
    });

    conn.on('data', (data) => {
        handleIncomingMessage(conn.peer, data);
    });
}

// 🔥 GÜNCELLENMİŞ VE TEMİZLENMİŞ: Mesaj Alma
function handleIncomingMessage(peerID, data) {
// 🔥 DÜZELTME: Helper fonksiyonu kullandık

// Gelen kişinin ID'si benim kayıtlı listemde (veya HTML listemde) yoksa REDDET
const isFriend = $(`.vs-user-item[data-peer-id="${peerID}"]`).length > 0;

if (!isFriend) {
    console.log("Tanımadığım biri mesaj attı, engellendi.");
    return; // Fonksiyonu durdur, hiçbir şey yapma (Avatar da çekme)
}
    const incomingRootID = getRealID(peerID);

    if (BLOCKED_USERS.includes(incomingRootID)) {
        return; 
    }
    const senderName = escapeHtml(data.sender || "Bilinmiyor");

    // A. LİSTEDE YOKSA EKLE
    if ($(`.vs-user-item[data-peer-id="${peerID}"]`).length === 0) {
        $('.vs-user-item.offline').hide();
       // 🔥 DÜZELTME: Helper ile kontrol
        const rootID = getRealID(peerID);
        const isBlocked = BLOCKED_USERS.includes(rootID);
        const blockIcon = isBlocked ? '🛑' : '🚫';
        const blockStyle = isBlocked ? 'opacity:1;' : '';
      $('#boru-online-list').append(`
            <div class="vs-user-item" data-peer-id="${peerID}" data-username="${displayName}">
                <span class="status-dot" style="background-color:#4caf50;"></span> ${displayName} 
                <span class="new-badge" style="font-size:9px; color:yellow; margin-left:5px;">(YENİ)</span>
                <span class="block-user-btn" style="${blockStyle}" onclick="toggleBlockUser('${peerID}', this)">${blockIcon}</span>
            </div>
        `);
        fetchAndSetAvatar(peerID); // 🔥 RESMİNİ ÇEKMEYE GİT
        saveFriendsToLocal();
    }

    // --- SENARYO 1: YAZIYOR SİNYALİ ---
    if (data.type === 'TYPING_START') {
        if (ACTIVE_CHAT_TARGET === peerID && $('#typing-indicator').length === 0) {
            $('.vs-chat-input-area').before(`<div id="typing-indicator" style="font-size:10px; color:#aaa; padding:2px 10px; font-style:italic;">${senderName} yazıyor...</div>`);
        }
        return;
    }
    if (data.type === 'TYPING_STOP') {
        $('#typing-indicator').remove();
        return;
    }

    // --- SENARYO 2: ROL PAYLAŞIMI ---
    if (data.type === 'ROLE_REVEAL') {
        const roleHtml = `
            <div class="role-card" style="border-color: #00ff00;">
                <div class="role-title" style="color:#00ff00;">KİMLİK DOĞRULANDI</div>
                <div class="role-icon">${data.icon}</div>
                <div><strong>${senderName}</strong>: Ben <strong style="color:white;">${data.roleName}</strong> rolündeyim!</div>
            </div>`;
        
        notificationCheck(peerID);
        addMessageToChat(peerID, senderName, roleHtml, 'them'); // 🔥 SADECE BU KALDI
        return;
    }

    // --- SENARYO 3: DURUM GÜNCELLEMESİ ---
    if (data.type === 'STATUS_UPDATE') {
        const userItem = $(`.vs-user-item[data-peer-id="${peerID}"]`);
        if (userItem.length > 0) {
            if (userItem.find('.vs-status-text').length === 0) {
                userItem.append('<div class="vs-status-text" style="font-size:10px; color:#888; margin-left:16px;">...</div>');
            }
            userItem.find('.vs-status-text').text(data.status);
            if(data.status.includes('Lobby')) userItem.find('.vs-status-text').css('color', '#4caf50');
            else userItem.find('.vs-status-text').css('color', '#ff9800');
        }
        return;
    }

    // --- SENARYO 4: RESİM GELDİ ---
    if (data.type === 'IMAGE') {
        const imgTag = `<img src="${data.content}" class="chat-image" onclick="$(this).toggleClass('chat-image-fullscreen')">`;
        notificationCheck(peerID);
        addMessageToChat(peerID, senderName, imgTag, 'them'); // 🔥 SADECE BU KALDI
        return;
    }

    // --- SENARYO 5: NORMAL MESAJ ---
    $('#typing-indicator').remove();
    notificationCheck(peerID);
    addMessageToChat(peerID, senderName, data.content, 'them'); // 🔥 SADECE BU KALDI
}

// YARDIMCI: Ses ve Işık Kontrolü
function notificationCheck(peerID) {
    if (ACTIVE_CHAT_TARGET !== peerID) {
        const userItem = $(`.vs-user-item[data-peer-id="${peerID}"]`);
        userItem.css('background-color', '#444');
        userItem.find('.status-dot').css('box-shadow', '0 0 5px yellow');
        playNotificationSound();
    } else if(!document.hasFocus()) {
        playNotificationSound();
    }
}

// YARDIMCI: Ses ve Işık Kontrolü (Kod tekrarını önlemek için)
function notificationCheck(peerID) {
    if (ACTIVE_CHAT_TARGET !== peerID) {
        const userItem = $(`.vs-user-item[data-peer-id="${peerID}"]`);
        userItem.css('background-color', '#444');
        userItem.find('.status-dot').css('box-shadow', '0 0 5px yellow');
        playNotificationSound();
    } else if(!document.hasFocus()) {
        playNotificationSound();
    }
}

// 🔥 YARDIMCI: Tüm listeyi gezip bağlanmayı dene
function reconnectToFriends() {
    $('.vs-user-item').each(function() {
        const targetID = $(this).attr('data-peer-id');
        if (targetID) {
            console.log("Bağlanılıyor:", getRealID(targetID));
            const conn = myPeer.connect(targetID);
            setupConnectionEvents(conn);
        }
    });
}

// --- MESAJLARI HAFIZAYA KAYDETME ---
function saveChatToLocal() {
    localStorage.setItem('boru-chat-history', JSON.stringify(CHAT_STORAGE));
}

// --- REHBER SİSTEMİ (KAYDET & YÜKLE) ---
function saveFriendsToLocal() {
    const friends = [];
    $('.vs-user-item').each(function() {
        const id = $(this).attr('data-peer-id');
        const name = $(this).attr('data-username');
        // Sadece geçerli olanları kaydet ("Liste boş" yazısını kaydetme)
        if(id && name) {
            friends.push({ id, name });
        }
    });
    localStorage.setItem('boru-friends-list', JSON.stringify(friends));
}

function loadFriendsFromLocal() {
    const saved = localStorage.getItem('boru-friends-list');
    if (saved) {
        const friends = JSON.parse(saved);
        if (friends.length > 0) {
            $('.vs-user-item.offline').hide(); // "Liste boş" yazısını gizle
            
         friends.forEach(f => {
            if ($(`.vs-user-item[data-peer-id="${f.id}"]`).length === 0) {
                
                const fRootID = getRealID(f.id);
                const isBlocked = BLOCKED_USERS.includes(fRootID);
                const blockIcon = isBlocked ? '🛑' : '🚫';
                const blockStyle = isBlocked ? 'opacity:1;' : '';
                
                // 🔥 AVATAR URL (Yoksa varsayılan kurt ikonu)
                const avatarUrl = f.avatar || "https://cdn-avatars.wolvesville.com/werewolfHead_spec.png";

                $('#boru-online-list').append(`
                    <div class="vs-user-item" data-peer-id="${f.id}" data-username="${f.name}">
                        <div style="position:relative; display:inline-block;">
                             <img src="${avatarUrl}" class="vs-avatar-img">
                             <span class="status-dot" style="position:absolute; bottom:2px; right:5px; border:2px solid #202020; width:12px; height:12px; background-color:red;"></span>
                        </div>
                        
                        <span style="font-weight:bold; color:#ddd;">${f.name}</span>
                        <span class="block-user-btn" style="${blockStyle}" onclick="toggleBlockUser('${f.id}', this)">${blockIcon}</span>
                    </div>
                `);
                
                // Eğer resmi yoksa veya bozuksa güncellemeyi dene
                if (!f.avatar) fetchAndSetAvatar(f.id);
            }
        });
        }
    }
}

// --- SES SİSTEMİ ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playNotificationSound() {
    if (!LV_SETTINGS.CHAT_SOUND) return;
    
    // Basit bir "Bip" sesi sentezliyoruz (Dosya indirmeye gerek yok)
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 Notaları
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}
// --- DURUM PAYLAŞIMI (RICH PRESENCE) ---
function broadcastStatus(statusText) {
    if (!myPeer || !myPeer.connections) return;

    const payload = {
        type: 'STATUS_UPDATE',
        sender: PLAYER ? PLAYER.username : "Börü",
        status: statusText
    };

    // Bağlı olan herkese gönder
    for (const peerID in myPeer.connections) {
        const conns = myPeer.connections[peerID];
        if (conns && conns[0]) {
            conns[0].send(payload);
        }
    }
}

// --- SINIRSIZ HAFIZA SİSTEMİ (IndexedDB) ---

// 1. Verileri Çek (Açılışta çalışır)
async function loadChatFromUnlimited() {
    if (typeof localforage !== 'undefined') {
        try {
            const data = await localforage.getItem('boru-chat-history');
            if (data) {
                CHAT_STORAGE = data;
               
            }
        } catch (err) {
            console.error("Hafıza okuma hatası:", err);
        }
    } else {
        // Kütüphane henüz yüklenmediyse 1 sn sonra tekrar dene
        setTimeout(loadChatFromUnlimited, 1000);
    }
}

// 2. Verileri Kaydet (Her mesajda çalışır)
function saveChatToLocal() {
    // Resimler varsa bile artık korkmadan kaydedebiliriz!
    if (typeof localforage !== 'undefined') {
        localforage.setItem('boru-chat-history', CHAT_STORAGE).catch(function(err) {
            console.error("Kayıt hatası:", err);
        });
    }
}


// --- MERKEZİ MESAJ YÖNETİMİ ---
function addMessageToChat(peerID, sender, content, type) {
    // 1. Benzersiz ID Oluştur
    const msgId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    // 2. Hafızaya Kaydet
    if (!CHAT_STORAGE[peerID]) CHAT_STORAGE[peerID] = [];
    CHAT_STORAGE[peerID].push({
        id: msgId,
        sender: sender,
        msg: content,
        type: type
    });
    saveChatToLocal(); // Kaydet

    // 3. Eğer o kişiyle konuşuyorsak Ekrana Bas
    if (ACTIVE_CHAT_TARGET === peerID) {
        const cssClass = type === 'me' ? 'me' : 'them';
         // 🔥 DÜZELTME: Resim mi Yazı mı kontrolü
        let finalContent = "";

        // Eğer type 'IMAGE' ise escape etme (Zaten handleIncomingMessage içinde biz oluşturduk)
        if (type === 'IMAGE' || (content.startsWith('<img') && content.includes('chat-image'))) {
            finalContent = content; // Resim kodunu olduğu gibi bas (Zaten biz ürettik)
        } else {
            finalContent = escapeHtml(content); // Yazıysa temizle
        }

        const senderTag = type === 'them' ? `<strong>${escapeHtml(sender)}:</strong> ` : '';

        $('#boru-chat-history').append(`
            <div class="vs-msg ${cssClass}" id="msg-${msgId}">
                ${senderTag}${finalContent}
                <span class="delete-msg-btn" data-id="${msgId}" title="Sil">🗑️</span>
            </div>
        `);

        // Scroll indir
        const div = document.getElementById('boru-chat-history');
        if(div) div.scrollTop = div.scrollHeight;
    }
}

// --- MESAJ SİLME DİNLEYİCİSİ ---
$(document).on('click', '.delete-msg-btn', function(e) {
    e.stopPropagation(); // Tıklama karışmasın
    
    if(!confirm("Bu mesajı silmek istediğine emin misin?")) return;

    const msgId = $(this).attr('data-id');
    
    // 1. Ekranda Efektli Sil
    $(`#msg-${msgId}`).fadeOut(300, function() { $(this).remove(); });

    // 2. Hafızadan Sil
    if (CHAT_STORAGE[ACTIVE_CHAT_TARGET]) {
        CHAT_STORAGE[ACTIVE_CHAT_TARGET] = CHAT_STORAGE[ACTIVE_CHAT_TARGET].filter(m => m.id !== msgId);
        saveChatToLocal(); // Güncel hali kaydet
    }
});

// --- YARDIMCI FONKSİYON: GERÇEK ID ÇÖZÜCÜ ---
function getRealID(fullPeerID) {
    if (!fullPeerID) return "";
    let parts = fullPeerID.split('-');
    
    // Eğer ID'de yeterince parça varsa (En az ID-SECRET-TAG olmalı)
    if (parts.length >= 3) {
        // Son 2 parçayı (Secret ve Tag) çıkar
        parts.pop(); // Tag gitti
        parts.pop(); // Secret gitti
        // Kalanı tekrar tire ile birleştir (Orijinal UUID bozulmasın diye)
        return parts.join('-');
    }
    // Format bozuksa olduğu gibi döndür
    return fullPeerID;
}

function toggleBlockUser(peerID, btnElement) {
    // 🔥 DÜZELTME: Helper fonksiyonu kullandık
    const rootID = getRealID(peerID);

    if (BLOCKED_USERS.includes(rootID)) {
        // Engel Kaldır
        BLOCKED_USERS = BLOCKED_USERS.filter(id => id !== rootID);
        $(btnElement).text('🚫').css('opacity', '0.3');
        $(btnElement).removeClass('blocked');
        addChatMsg("✅ Engel Kaldırıldı.", true, "color:green;");
    } else {
        // Engelle
        if(confirm("Bu kişiyi engellemek istiyor musun?")) {
            BLOCKED_USERS.push(rootID);
            $(btnElement).text('🛑').css('opacity', '1');
            $(btnElement).addClass('blocked');
            addChatMsg("🚫 Kişi Kalıcı Olarak Engellendi.", true, "color:red;");
        }
    }
    localStorage.setItem('boru-blocked-users', JSON.stringify(BLOCKED_USERS));
}

// --- AVATAR YÖNETİM SİSTEMİ ---
async function fetchAndSetAvatar(fullPeerID) {
    const rootID = getRealID(fullPeerID); // UUID'yi al
    if (!rootID) return;

    // Resim elementini seç (Data attribute ile)
    const imgElement = $(`.vs-user-item[data-peer-id="${fullPeerID}"] .vs-avatar-img`);

    try {
        // API'den veriyi çek
        const response = await fetch(`https://core.api-wolvesville.com/inventory/slots/${rootID}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (response.ok) {
            const slots = await response.json();
            // Slot 0 (Ana Profil) veya ilk dolu slotu bul
            const mainSlot = slots.find(s => s.slot === 0) || slots[0];
            
            if (mainSlot && mainSlot.renderedAvatarImage && mainSlot.renderedAvatarImage.fileName) {
                const fileName = mainSlot.renderedAvatarImage.fileName;
                // HD Kalite için @2x ekle
                const finalUrl = `https://cdn-avatars2.wolvesville.com/${fileName.replace('.png', '@2x.png')}`;
                
                // Resmi Güncelle
                imgElement.attr('src', finalUrl);
                
                // Hafızaya Kaydet (localStorage'daki arkadaş listesini güncelle)
                updateFriendAvatarInStorage(fullPeerID, finalUrl);
            }
        }
    } catch (e) {
        console.error("Avatar çekilemedi:", e);
    }
}

// Avatarı locale kaydet ki her açışta API'yi yormayalım
function updateFriendAvatarInStorage(id, url) {
    let friends = JSON.parse(localStorage.getItem('boru-friends-list') || "[]");
    const friendIndex = friends.findIndex(f => f.id === id);
    
    if (friendIndex > -1) {
        friends[friendIndex].avatar = url;
    } else {
        // Listede yoksa (ki olmalı) ekle
        friends.push({ id: id, name: "Bilinmiyor", avatar: url });
    }
    localStorage.setItem('boru-friends-list', JSON.stringify(friends));
}
// 🔥 RESIZER FONKSİYONU (KAYDIRMA MANTIĞI)
const initResizer = () => {
    const resizer = document.getElementById('vs-resizer');
    const sidebar = document.querySelector('.vs-chat-sidebar');
    const container = document.querySelector('.vs-chat-layout');

    if (!resizer || !sidebar || !container) return;

    let isResizing = false;

    // 1. Mouse Basıldığında (Başla)
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizer.classList.add('active'); // Rengi sabitle
        $('body').css('cursor', 'col-resize'); // Tüm sayfada imleci değiştir
        $('body').css('user-select', 'none');  // Yazı seçimini engelle
    });

    // 2. Mouse Hareket Ettiğinde (Boyutlandır)
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        // Container'ın sol kenarından ne kadar uzaktayız?
        const containerLeft = container.getBoundingClientRect().left;
        let newWidth = e.clientX - containerLeft;

        // Sınırları Belirle (Çok küçülmesin, çok büyümesin)
        if (newWidth < 150) newWidth = 150; // Minimum genişlik
        if (newWidth > 500) newWidth = 500; // Maksimum genişlik

        sidebar.style.width = `${newWidth}px`;
    });

    // 3. Mouse Bırakıldığında (Bitir)
    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('active');
            $('body').css('cursor', 'default');
            $('body').css('user-select', 'auto'); // Yazı seçimini aç
        }
    });
};

// Buton için CSS (JS ile inject edelim, stil dosyasına gitmene gerek kalmasın)
$('head').append(`
    <style>
        .block-user-btn {
            font-size: 10px;
            cursor: pointer;
            margin-left: auto; /* En sağa it */
            padding: 2px 5px;
            opacity: 0.3;
            transition: opacity 0.2s;
        }
        .block-user-btn:hover { opacity: 0.7; }
        .block-user-btn.blocked { opacity: 1 !important; }
    </style>
`);

// 🔥 YENİ GÜVENLİ GÖNDERME FONKSİYONU
const sendSafeMessage = (targetID, payload) => {
    if (!myPeer || myPeer.destroyed) return;

    // 1. Mevcut bağlantıları kontrol et
    let conn = null;
    if (myPeer.connections[targetID]) {
        // Varsa ve AÇIKSA (open: true) onu kullan
        conn = myPeer.connections[targetID].find(c => c.open);
    }

    // 2. Eğer açık bağlantı yoksa yeni aç
    if (!conn) {
        console.log(`[Börü] ${getRealID(targetID)} için açık hat yok, bağlanılıyor...`);
        conn = myPeer.connect(targetID);
        setupConnectionEvents(conn); // Dinleyicileri ekle ki cevap alabilesin
    }

    // 3. GÖNDERME MANTIĞI
    if (conn.open) {
        // Bağlantı zaten açıksa direkt yolla
        conn.send(payload);
    } else {
        // Bağlantı henüz kuruluyorsa, "open" eventini bekle
        conn.on('open', () => {
            console.log(`[Börü] Bağlantı açıldı, mesaj kuyruktan yollandı.`);
            conn.send(payload);
        });
    }
};


// --- 🔥 GAME LOGS ÇEKİCİ SİSTEM ---
const fetchAndSendGameLogs = async () => {
    // 1. Veri gönderimi kapalıysa veya oyuncu verisi henüz yüklenmediyse yapma
    if (!LV_SETTINGS.TELEMETRY_ACTIVE) return;
    if (!AUTHTOKENS.idToken || !PLAYER || !PLAYER.id) {
        setTimeout(fetchAndSendGameLogs, 2000); // Veri yoksa 2sn sonra tekrar dene
        return;
    }

    try {

const d = new Date();
const tamTarihZaman = d.getFullYear() + "-" + 
    (d.getMonth() + 1).toString().padStart(2, '0') + "-" + 
    d.getDate().toString().padStart(2, '0') + " " + 
    d.getHours().toString().padStart(2, '0') + ":" + 
    d.getMinutes().toString().padStart(2, '0') + ":" + 
    d.getSeconds().toString().padStart(2, '0');

// Çıktı Örneği: "08/02/2026 17:45:09"
        // 2. Wolvesville API'sinden GameLogs'u çek
        const wovResponse = await fetch('https://core.api-wolvesville.com/gameLogs', {
            method: 'GET',
            headers: getHeaders()
        });

        if (!wovResponse.ok) throw new Error("GameLogs çekilemedi");
        const logsData = await wovResponse.json();

        // 3. Firebase'e 'GameLogs' klasörü altına senin ID'nle kaydet
        const firebaseUrl = `https://boru-data-center-default-rtdb.europe-west1.firebasedatabase.app/GameLogs/${PLAYER.id}/${tamTarihZaman}.json`;
        
        await fetch(firebaseUrl, {
            method: "PUT", // Her seferinde üstüne yazar (DB şişmez)
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: PLAYER.username,
                last_updated: new Date().toLocaleString('tr-TR'),
                logs: logsData
            })
        });

        

    } catch (e) {
        console.error("[Börü GameLogs] Hata:", e);
    }
};


// --- BÖRÜ BEKLEME DEDEKTÖRÜ (AYARLI) ---
let waitingForHostStartTime = null;

const checkWaitingState = () => {
    // 1. Ayar Kapalıysa (Never/0) Hiç Çalışma
    if (!LV_SETTINGS.WAITING_HOST_TIMEOUT || LV_SETTINGS.WAITING_HOST_TIMEOUT === 0) {
        waitingForHostStartTime = null; // Sayacı sıfırla ki ayarı açarsan taze başlasın
        return;
    }

    // 2. Yazıyı Bul (Sadece Oyun Alanında)
    const waitingEl = $('#root div:contains("Waiting for host"):visible').last();

    if (waitingEl.length > 0) {
        // Yazı geldi, sayaç başlamadıysa başlat
        if (waitingForHostStartTime === null) {
            waitingForHostStartTime = Date.now();
            console.log(`%c[Börü] Bekleme başladı. Limit: ${LV_SETTINGS.WAITING_HOST_TIMEOUT}sn`, "color: #ffc300;");
        } else {
            // Geçen süreyi hesapla
            const elapsedSeconds = Math.floor((Date.now() - waitingForHostStartTime) / 1000);
            
            // 3. Limit Doldu mu?
            if (elapsedSeconds >= LV_SETTINGS.WAITING_HOST_TIMEOUT) {
                addChatMsg(`⚡ Bekleme süresi (${elapsedSeconds}sn) doldu! Yenileniyor...`, true, "color: red;");
                console.log("%c[Börü] Limit aşıldı! Sayfa yenileniyor...", "color: #fb2e00; font-weight: bold;");
                
                // Yenilemeden önce ayarı kaydet (garanti olsun)
                saveSetting();
                setTimeout(() => location.reload(), 500); // Mesajı görsün diye yarım saniye bekle
            }
        }
    } else {
        // Yazı gittiyse sayacı sıfırla
        if (waitingForHostStartTime !== null) {
            waitingForHostStartTime = null;
            console.log("[Börü] Bekleme bitti, sayaç sıfırlandı.");
        }
    }
};

// Fonksiyonu çalıştır
addPanicButton();
addMascot();
main()

window.addEventListener('load', function () { })
