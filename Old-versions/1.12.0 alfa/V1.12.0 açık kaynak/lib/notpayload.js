console.log('Börü Bot injected')

if (document.title === "Just a moment..." || document.getElementById("challenge-form") || document.title.includes("Cloudflare")) {
    console.log("🐺 Börü: Cloudflare koruma ekranı algılandı. Bot devre dışı bırakılıyor.");
    
    throw new Error("Börü: Cloudflare Bypass Bekleniyor..."); 
}
var NATIVE_SOCKET = null;
const SafWebSocketSend = window.WebSocket.prototype.send;
var CURRENT_GAME_MODE = "Bilinmiyor";
var ACTIVE_CHAT_TARGET = null;
var CHAT_STORAGE = {}; 
var BLOCKED_USERS = JSON.parse(localStorage.getItem('boru-blocked-users')) || [];

function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
let CACHED_DOM = {};
const getEl = (selector) => {
    if (!CACHED_DOM[selector] || CACHED_DOM[selector].length === 0) {
        CACHED_DOM[selector] = $(selector);
    }
    return CACHED_DOM[selector];
};
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'BORU_TAB_ID_GELDI') {
        CURRENT_TAB_ID = event.data.tabId;
        console.log(`🐺 Börü: Bu sekmenin ID'si [${CURRENT_TAB_ID}] olarak kaydedildi.`);
    }
});
const addHotkeys = () => {
    
    window.addEventListener('keydown', (e) => {

        
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
       


        
        
        
        

        const ayariDegistir = (ayarKey, ayarIsmi, selector) => {
            LV_SETTINGS[ayarKey] = !LV_SETTINGS[ayarKey];
            saveSetting(); 
            
            const checkbox = $(selector);
            if (checkbox.length) checkbox.text(LV_SETTINGS[ayarKey] ? '' : '');

            const yeniDurum = LV_SETTINGS[ayarKey];
            const renk = yeniDurum ? "#00FF00" : "#FF0000";
            const durumMetni = yeniDurum ? "AKTİF" : "KAPALI";
            
            if (typeof addChatMsg === 'function') {
                addChatMsg(`⌨️ [Ctrl+Alt] ${ayarIsmi}: ${durumMetni}`, true, `color: ${renk};`);
            }
            
            if (ayarKey === 'AUTO_REPLAY' && yeniDurum) handleAutoReplay();
            if (ayarKey === 'AUTO_JOIN_ROOMS' && yeniDurum) handleAutoJoin();
            if (ayarKey === 'AUTO_CREATE_ROOM' && yeniDurum) handleAutoCreate();
        };

        
        if (e.ctrlKey && e.altKey) {
            
            
            if (e.code === 'Key' + (LV_SETTINGS.SHORTCUTS?.JOIN || 'J')) { 
                e.preventDefault(); e.stopPropagation(); 
                $('.lv-modal-checkbox.auto-join-rooms').click(); 
            }
            
            if (e.code === 'Key' + (LV_SETTINGS.SHORTCUTS?.REPLAY || 'Y')) {
                e.preventDefault(); e.stopPropagation();
                ayariDegistir('AUTO_REPLAY', 'Auto Replay', '.lv-modal-checkbox.auto-replay');
            }

            
            if (e.code === 'Key' + (LV_SETTINGS.SHORTCUTS?.AUTO_PLAY || 'P')) {
                e.preventDefault(); e.stopPropagation();
                ayariDegistir('AUTO_PLAY', 'Auto Play', '.lv-modal-checkbox.auto-play');
            }

            
            if (e.code === 'Key' + (LV_SETTINGS.SHORTCUTS?.CREATE || 'K')) { 
                e.preventDefault(); e.stopPropagation(); 
                $('.lv-modal-checkbox.auto-create-room').click(); 
            }

        
        }
        
        
        if (e.code === 'F9') {
             e.preventDefault(); e.stopPropagation();
             $('html').toggleClass('lv-panic-mode');
        } 

    }, true); 
} 

const visualizeClick = (element) => {
    
    if (!LV_SETTINGS.DEBUG_MODE) return;

    try {
        const rect = element.getBoundingClientRect();
        
        
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        
        const hitmarker = document.createElement('div');
        hitmarker.style.position = 'fixed';
        hitmarker.style.left = (x - 10) + 'px'; 
        hitmarker.style.top = (y - 10) + 'px';  
        hitmarker.style.width = '20px';
        hitmarker.style.height = '20px';
        hitmarker.style.border = '2px solid red';
        hitmarker.style.borderRadius = '50%'; 
        hitmarker.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        hitmarker.style.zIndex = '9999999';
        hitmarker.style.pointerEvents = 'none';
        hitmarker.style.transform = 'scale(0)'; 
        hitmarker.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        
        hitmarker.innerHTML = '<div style="position:absolute; top:50%; left:50%; width:4px; height:4px; background:white; transform:translate(-50%, -50%); border-radius:50%;"></div>';

        document.body.appendChild(hitmarker);

        
        requestAnimationFrame(() => {
            hitmarker.style.transform = 'scale(1)';
        });

        
        setTimeout(() => {
            hitmarker.style.opacity = '0';
            setTimeout(() => hitmarker.remove(), 300);
        }, 500);
        
        
        
    } catch (e) {
        console.error("Görselleştirme hatası:", e);
    }
}
const scriptTag = document.currentScript;
var BOT_VERSION = scriptTag.getAttribute('data-version') || "1.0.0";
var HAS_UPDATE = scriptTag.getAttribute('data-has-update') === 'true';
var NEW_VERSION = scriptTag.getAttribute('data-new-version');
var UPDATE_MSG = scriptTag.getAttribute('data-update-message');

function checkForUpdates() {
    
    if (HAS_UPDATE) {
        setTimeout(() => {
            addChatMsg(`📢 GÜNCELLEME VAR: v${NEW_VERSION}`, true, 'color: #00FF00; font-size: 14px;');
            addChatMsg(`Yenilikler: ${UPDATE_MSG}`, false, 'color: #ADFF2F;');
            addChatMsg(`Şu anki sürüm: v${BOT_VERSION}`, false, 'font-size: 11px; color: #aaa;');
          
    
    $('.lv-chat-title').html(`Börü v${BOT_VERSION} <span style="color: #00FF00; font-weight: bold; animation: blink 1s infinite;">(GÜNCELLE!)</span>`);

    
    $('.lv-chat').css({
        'border': '2px solid #00FF00',
        'box-shadow': '0 0 10px #00FF00' 
    });

    
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
var LOBBY_TIMEOUT_TIMER = null;
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
   LOBBY_AUTO_QUIT_ACTIVE: false,
   LOBBY_AUTO_QUIT_SECONDS: 0,
  AUTO_JOIN_PASSWORD: "",
  AUTO_SLOT: 0,
  DEBUG_MODE: false,
  SHOW_HIDDEN_LVL: true,
  AUTO_REPLAY: true,
  AUTO_PLAY: true,
  CHAT_STATS: true,
  PLAYER_NOTES: true,
  PLAYER_AURA: true,
  AUTO_REFRESH_INTERVAL: 0,  
  AUTO_CREATE_ROOM: false,          
  AUTO_CREATE_TEMPLATE_NAME: "",     
  TELEMETRY_ACTIVE: true,    
  USER_P2P_CODE: "0000", 
  WAITING_HOST_TIMEOUT: 0,
  CHAT_SOUND: true,
  SHORTCUTS: {
  JOIN: 'J',
  REPLAY: 'Y',
  AUTO_PLAY: 'P',
  CREATE: 'K'
  }
}
let autoJoinIlkYukleme = true;
const PLAYERAURAMAP = new Map();
const PLAYERNOTESMAP = new Map();
var GAME_ID = undefined
var SERVER_URL = undefined
var GAME_SETTINGS = undefined
let DAY_COUNT = 0;
let DAY_VOTING = {};
let GAME_VOTING = "";
var LOVERS = [];
var DEADS = [];
var JW_TARGET = undefined;
var CHAT_WW_SENDED = false;
var WOLVES = [];
var TARGET_WW_VOTE = undefined;
var PENDING_NIGHT_INFO = ""; // İnfocu rollerin sabah vereceği bilgiyi tutar
const gecikmelan = (bankoBekleme = 0) => bankoBekleme + Math.floor(Math.random() * 600);
const generatePid = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const removeWovProtections = () => {
    
    const startGame = getEl('#root div:contains("START GAME")');
    const ok = getEl('#root div:contains("OK")');
    const inventory = getEl('#root div:contains("INVENTORY")');
    
    if (startGame?.length && ok?.length && inventory?.length) {
        startGame[startGame.length - 1].remove();
        ok[ok.length - 1].remove();
    }
}


const main = async () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;

if (isMobile) {
    $('body').addClass('boru-mobile');
    console.log("📱 Börü: Mobil Mod Aktif Edildi (Responsive)");
}
  await loadChatFromUnlimited(); 
  getAuthtokens()
  loadSettings()
  setTimeout(() => {
      if (!PLAYER || !PLAYER.username) {
          console.log("🐺 Börü: Oyun kimliği geciktirdi. Sistem zorla doğrulama yapıyor...");
          getPLAYER(); 
      }
  }, 2000);
  injectChat()
  injectSettings()
  injectStyles()
  checkForUpdates()
  setTimeout(checkuserwhitelist,5000)
  setInterval(masterLoop, 1000);

  
  addHotkeys();

}

const injectSettings = () => {
  
  $('body').append(lvModal)
  $('body').append(lvModalPerk)
  $('body').append(votingHistory)
  $('body').append(recentPlayersModal)
  $('body').append(lvModalSetShortcuts)
  $('body').append(boruBugModal);
  

  
  
  $('.lv-modal-loot-shortcuts-set').on('click', () => {
      $('.lv-modal-shortcuts-container').css({ display: 'flex' });
  });

  
  $('.lv-modal-shortcuts-close').on('click', () => {
      $('.lv-modal-shortcuts-container').css({ display: 'none' });
  });

  
  if (!LV_SETTINGS.SHORTCUTS) LV_SETTINGS.SHORTCUTS = { JOIN: 'J', REPLAY: 'Y', AUTO_PLAY: 'P', CREATE: 'K' };
  $('#shortcut-join').val(LV_SETTINGS.SHORTCUTS.JOIN);
  $('#shortcut-replay').val(LV_SETTINGS.SHORTCUTS.REPLAY);
  $('#shortcut-autoplay').val(LV_SETTINGS.SHORTCUTS.AUTO_PLAY);
  $('#shortcut-create').val(LV_SETTINGS.SHORTCUTS.CREATE);

  
  $('.lv-shortcut-input').on('input', function() {
      let val = $(this).val().toUpperCase();
      let action = $(this).attr('data-action');
      if (val && action) {
          LV_SETTINGS.SHORTCUTS[action] = val;
          saveSetting();
      }
  });

  setTimeout(initResizer, 500);

// --- WAITING HOST TIMEOUT AYARI ---
  let mevcutTimeout = LV_SETTINGS.WAITING_HOST_TIMEOUT ?? 0;
  $('.lv-modal-waiting-timeout').val(mevcutTimeout).on('change', function() {
    LV_SETTINGS.WAITING_HOST_TIMEOUT = parseInt($(this).val());
    saveSetting();
    addChatMsg(`⏳ Bekleme Limiti: ${LV_SETTINGS.WAITING_HOST_TIMEOUT === 0 ? 'Kapalı' : LV_SETTINGS.WAITING_HOST_TIMEOUT + ' saniye'}`);
  });

  
  $('.lv-modal-recent-players-close').on('click', () => { 
      $('.lv-modal-recent-players-container').css({ display: 'none' }); 
  });

  
  
  $('.lv-modal-checkbox.discord-active').text(LV_SETTINGS.TELEMETRY_ACTIVE ? '' : '');

  
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

  
  $('.lv-modal-close').on('click', () => { $('.lv-modal-popup-container').css({ display: 'none' }) })
  $('.lv-modal-veil').on('click', () => { 
    $('.lv-modal-popup-container').css({ display: 'none' }) 
    $('.lv-modal-perk-container').css({ display: 'none' })
    $('.lv-modal-voting-container').css({ display: 'none' })
    $('.lv-modal-recent-players-container').css({ display: 'none' })
    $('.lv-modal-shortcuts-container').css({ display: 'none' })
  })
  
  
  $('.lv-perk-settings').css({ display: (LV_SETTINGS.CHAT_STATS ? 'block' : 'none') })
  
  $('.lv-modal-perk-close').on('click', () => { $('.lv-modal-perk-container').css({ display: 'none' }) })
  $('.lv-modal-voting-close').on('click', () => { $('.lv-modal-voting-container').css({ display: 'none' }) })

  
  $('.lv-modal-rose-wheel-btn').on('click', () => { fetch('https://core.api-wolvesville.com/rewards/goldenWheelSpin', { method: 'POST', headers: getHeaders() }) })
  $('.lv-modal-gold-wheel-btn').on('click', () => { fetch(`https://core.api-wolvesville.com/rewards/wheelRewardWithSecret/${getRewardSecret()}`, { method: 'POST', headers: getHeaders() }) });
  $('.lv-modal-loot-boxes-btn').on('click', () => { if (INVENTORY.lootBoxes?.length) lootBox() })

  
  $('.lv-modal-checkbox.debug').on('click', () => { LV_SETTINGS.DEBUG_MODE = !LV_SETTINGS.DEBUG_MODE; $('.lv-modal-checkbox.debug').text(LV_SETTINGS.DEBUG_MODE ? '' : ''); saveSetting() })
  $('.lv-modal-checkbox.show-hidden-lvl').on('click', () => { LV_SETTINGS.SHOW_HIDDEN_LVL = !LV_SETTINGS.SHOW_HIDDEN_LVL; $('.lv-modal-checkbox.show-hidden-lvl').text(LV_SETTINGS.SHOW_HIDDEN_LVL ? '' : ''); saveSetting() })
  $('.lv-modal-checkbox.auto-replay').on('click', () => { LV_SETTINGS.AUTO_REPLAY = !LV_SETTINGS.AUTO_REPLAY; $('.lv-modal-checkbox.auto-replay').text(LV_SETTINGS.AUTO_REPLAY ? '' : ''); handleAutoReplay(); saveSetting() })
  $('.lv-modal-checkbox.auto-play').on('click', () => { LV_SETTINGS.AUTO_PLAY = !LV_SETTINGS.AUTO_PLAY; $('.lv-modal-checkbox.auto-play').text(LV_SETTINGS.AUTO_PLAY ? '' : ''); saveSetting() })
  
  
  $('.lv-modal-checkbox.chat-stats').on('click', () => { 
    LV_SETTINGS.CHAT_STATS = !LV_SETTINGS.CHAT_STATS; 
    $('.lv-modal-checkbox.chat-stats').text(LV_SETTINGS.CHAT_STATS ? '' : ''); 
    
    
    $('.lv-perk-settings').css({ display: (LV_SETTINGS.CHAT_STATS ? 'block' : 'none') });
    
    
    if (!LV_SETTINGS.CHAT_STATS) {
        $('.lv-modal-perk-container').css({ display: 'none' }); 
        removePlayerAura(); 
        removePlayerNotes(); 
    } else {
        
        if (LV_SETTINGS.PLAYER_AURA) handlePlayerAura();
        if (LV_SETTINGS.PLAYER_NOTES) handlePlayerNotes();
    }

    saveSetting() 
  })

  
  $('.lv-modal-checkbox.player-aura').on('click', () => { LV_SETTINGS.PLAYER_AURA = !LV_SETTINGS.PLAYER_AURA; $('.lv-modal-checkbox.player-aura').text(LV_SETTINGS.PLAYER_AURA ? '' : ''); handlePlayerAura(); saveSetting() })
  $('.lv-modal-checkbox.player-notes').on('click', () => { LV_SETTINGS.PLAYER_NOTES = !LV_SETTINGS.PLAYER_NOTES; $('.lv-modal-checkbox.player-notes').text(LV_SETTINGS.PLAYER_NOTES ? '' : ''); handlePlayerNotes(); saveSetting() })
  $('.lv-modal-perk-refresh-aura').on('click', () => { updateAllPlayerAura() })
  
  $('.lv-modal-voting-history').on('click', () => { 
    
    $('.lv-modal-popup-container').hide();
    $('.lv-modal-perk-container').hide();
    $('.lv-modal-recent-players-container').hide();
    
    
    $('.lv-modal-voting-container').show(); 
    $('#vote-log').text(GAME_VOTING); 
  })
  $('.lv-modal-perk-refresh-notes').on('click', () => { updatePlayerNotes() })

  
  $('.lv-modal-perk-message-input, .lv-modal-perk-message-mention-input').on('focus', function () { $('textarea').prop('disabled', true); });
  $('.lv-modal-perk-message-input, .lv-modal-perk-message-mention-input').on('blur', function () { $('textarea').prop('disabled', false); });
  
  $('.lv-modal-perk-message-btn').on('click', () => { playerChatHiding(parseInt($('.lv-modal-perk-message-input').val())) })
  $('.lv-modal-perk-message-btn-undo').on('click', () => { undoChatHiding() })
  $('.lv-modal-perk-message-mention-btn').on('click', () => { playerChatHidingMention(parseInt($('.lv-modal-perk-message-mention-input').val())) })
  $('.lv-modal-perk-message-mention-btn-undo').on('click', () => { undoChatHidingMention() })

  
  let mevcutDeger = LV_SETTINGS.AUTO_REFRESH_INTERVAL ?? 15;
  $('.lv-modal-auto-refresh').val(mevcutDeger).on('change', function() {
    LV_SETTINGS.AUTO_REFRESH_INTERVAL = parseInt($(this).val());
    saveSetting();
    addChatMsg(`⏱️ Oto-Yenileme: ${LV_SETTINGS.AUTO_REFRESH_INTERVAL === 0 ? 'Kapalı' : LV_SETTINGS.AUTO_REFRESH_INTERVAL + ' dk'}`);
  });

  
$('.lv-modal-checkbox.auto-join-case').on('click', () => {
    LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE = !LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE;
    $('.lv-modal-checkbox.auto-join-case').text(LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE ? '' : '');
    saveSetting();
});
  
 $('.lv-modal-join-filter-input').on('input', function() { sessionStorage.setItem('boru-tab-filter', $(this).val()); });
  
  $('.lv-modal-join-exclude-input').on('input', function() { 
      LV_SETTINGS.AUTO_JOIN_EXCLUDE = $(this).val(); 
      saveSetting(); 
  });
  
  $('.lv-modal-join-password-input').on('input', function() { sessionStorage.setItem('boru-tab-password', $(this).val()); });


  
  $('.lv-modal-checkbox.auto-join-rooms').off('click').on('click', () => {
      let isJoinActive = sessionStorage.getItem('boru-tab-autojoin') === 'true';
      isJoinActive = !isJoinActive;
      sessionStorage.setItem('boru-tab-autojoin', isJoinActive);
      
      $('.lv-modal-checkbox.auto-join-rooms').text(isJoinActive ? '' : '');
      
      if (isJoinActive) {
          
          sessionStorage.setItem('boru-tab-autocreate', 'false');
          $('.lv-modal-checkbox.auto-create-room').text('');
          $('.lv-modal-create-template-input').css('opacity', '0.5'); 
          
          handleAutoJoin(); 
          $('.lv-modal-join-filter-input').css('opacity', '1');
          $('.lv-modal-join-exclude-input').css('opacity', '1');
          $('.lv-modal-join-password-input').css('opacity', '1');
      } else {
          $('.lv-modal-join-filter-input').css('opacity', '0.5');
          $('.lv-modal-join-exclude-input').css('opacity', '0.5');
          $('.lv-modal-join-password-input').css('opacity', '0.5');
      }
  });

  $('.lv-modal-create-template-input').on('input', function() { sessionStorage.setItem('boru-tab-template', $(this).val()); });

 
  $('.lv-modal-checkbox.auto-create-room').off('click').on('click', () => {
      let isCreateActive = sessionStorage.getItem('boru-tab-autocreate') === 'true';
      isCreateActive = !isCreateActive;
      sessionStorage.setItem('boru-tab-autocreate', isCreateActive);

      $('.lv-modal-checkbox.auto-create-room').text(isCreateActive ? '' : '');

      if (isCreateActive) {
          
          sessionStorage.setItem('boru-tab-autojoin', 'false');
          $('.lv-modal-checkbox.auto-join-rooms').text('');
          $('.lv-modal-join-filter-input').css('opacity', '0.5');
          $('.lv-modal-join-exclude-input').css('opacity', '0.5');
          $('.lv-modal-join-password-input').css('opacity', '0.5');

          handleAutoCreate(); 
          $('.lv-modal-create-template-input').css('opacity', '1');
      } else {
          $('.lv-modal-create-template-input').css('opacity', '0.5');
      }
  });

  
  $('.lv-modal-checkbox.debug').text(LV_SETTINGS.DEBUG_MODE ? '' : '')
  $('.lv-modal-checkbox.show-hidden-lvl').text(LV_SETTINGS.SHOW_HIDDEN_LVL ? '' : '')
  $('.lv-modal-checkbox.auto-replay').text(LV_SETTINGS.AUTO_REPLAY ? '' : '')
  $('.lv-modal-checkbox.auto-play').text(LV_SETTINGS.AUTO_PLAY ? '' : '')
  $('.lv-modal-checkbox.chat-stats').text(LV_SETTINGS.CHAT_STATS ? '' : '')
  $('.lv-modal-checkbox.player-aura').text(LV_SETTINGS.PLAYER_AURA ? '' : '')
  $('.lv-modal-checkbox.player-notes').text(LV_SETTINGS.PLAYER_NOTES ? '' : '')

  
  let initJoin = sessionStorage.getItem('boru-tab-autojoin') === 'true';
  let initCreate = sessionStorage.getItem('boru-tab-autocreate') === 'true';

  $('.lv-modal-checkbox.auto-join-rooms').text(initJoin ? '' : '');
  $('.lv-modal-checkbox.auto-join-case').text(LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE ? '' : '');
  
  $('.lv-modal-join-filter-input').val(sessionStorage.getItem('boru-tab-filter') || "").css('opacity', initJoin ? '1' : '0.5');
  $('.lv-modal-join-exclude-input').val(LV_SETTINGS.AUTO_JOIN_EXCLUDE || "").css('opacity', initJoin ? '1' : '0.5');
  $('.lv-modal-join-password-input').val(sessionStorage.getItem('boru-tab-password') || "").css('opacity', initJoin ? '1' : '0.5');

  $('.lv-modal-checkbox.auto-create-room').text(initCreate ? '' : '');
  $('.lv-modal-create-template-input').val(sessionStorage.getItem('boru-tab-template') || "").css('opacity', initCreate ? '1' : '0.5');


  
  const tumInputlar = [
      '.lv-modal-join-filter-input',                    
      '.lv-modal-join-exclude-input',                  
      '.lv-modal-create-template-input',              
      '.lv-modal-perk-message-input',                
      '.lv-modal-join-password-input',              
      '.lv-modal-perk-message-mention-input',      
      '.lv-modal-auto-refresh',                   
      '#recent-players-log',                     
      '.lv-shortcut-input',                     
      '.lv-modal-auto-slot-input',             
      '.lv-modal-lobby-quit-input',           
      '.lv-modal-waiting-timeout'            
  ].join(', ');

  $(tumInputlar).on('keydown keyup keypress', function(e) {
      e.stopPropagation(); 
  });
  
  
  $(tumInputlar).on('focus', function() {
      
      
      
  });


  
  $('#btn-tab-players').on('click', function() {
      
      $('.vs-tab').removeClass('active');
      $(this).addClass('active');

      
      $('#view-tab-chat').hide();
      $('#view-tab-players').show();
  });

  $('#btn-tab-chat').on('click', function() {
      
      $('.vs-tab').removeClass('active');
      $(this).addClass('active');

      
      $('#view-tab-players').hide();
      $('#view-tab-chat').css('display', 'block'); 
  });












  
let typingTimeout = null;

$('#boru-chat-input').on('input', function() {
    if (!ACTIVE_CHAT_TARGET) return;

    const myName = PLAYER ? PLAYER.username : "Börü";
    
    
    let conns = myPeer.connections[ACTIVE_CHAT_TARGET];
    let activeConn = conns ? conns.find(c => c.open) : null;

    
    if (activeConn) {
        activeConn.send({ 
            type: 'TYPING_START',
            sender: myName 
        });
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        
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
    
    
    const targetName = prompt("Arkadaşının Kullanıcı Adı (Örn: Ahmet):");
    if (!targetName || targetName.trim() === "") return;

    
    const targetTag = prompt("Arkadaşının Börü Tag'i (4 Haneli Sayı):");
    if (!targetTag || targetTag.length !== 4 || isNaN(targetTag)) {
        alert("Hata: Tag 4 haneli bir sayı olmalı! (Örn: 1923)");
        return;
    }

    
    addChatMsg(`🔍 '${targetName}' aranıyor...`, false, "color:yellow;");

    try {
        
        
        const response = await fetch(`https://core.api-wolvesville.com/players/search?username=${targetName}`, {
            method: 'GET',
            headers: getHeaders() 
        });

        if (!response.ok) throw new Error("API Hatası");

        const data = await response.json();

        
        if (data.length === 0) {
            alert("❌ Bu isimde bir oyuncu bulunamadı!");
            addChatMsg(`❌ '${targetName}' bulunamadı.`, true, "color:red;");
            return;
        }

        
        const foundUser = data[0];
        const realID = foundUser.id; 
        
        console.log(`[Börü ID Bulucu] İsim: ${escapeHtml(foundUser.username)} -> ID: ${realID}`);

        
        
        const fullTargetPeerID = `${realID}-${CLIENT_SECRET_KEY}-${targetTag}`;
        
        
        const displayName = `${escapeHtml(foundUser.username)}#${targetTag}`;

        
        $('.vs-user-item.offline').hide();
        
        
        if ($(`.vs-user-item[data-peer-id="${fullTargetPeerID}"]`).length > 0) {
             alert("Bu kişi zaten listende ekli!");
             return;
        }

      $('#boru-online-list').append(`
            <div class="vs-user-item" data-peer-id="${fullTargetPeerID}" data-username="${displayName}">
                <span class="status-dot" style="background-color:#4caf50;"></span> ${displayName}

                <span class="edit-tag-btn" onclick="tagDegistir('${fullTargetPeerID}', event)" title="Tag Değiştir">✏️</span>
                <span class="clear-chat-btn" onclick="removeUserFull('${fullTargetPeerID}', event)" title="Listeden Sil">🗑️</span>
                <span class="block-user-btn" onclick="toggleBlockUser('${fullTargetPeerID}', this)">🚫</span>
            </div>
        `);

        addChatMsg(`✅ Kişi Eklendi: ${displayName}`, true, "color:#00FF00;");
        saveFriendsToLocal(); 

    } catch (e) {
        console.error("Kullanıcı arama hatası:", e);
        alert("Kullanıcı bulunurken bir hata oluştu! Konsola bak.");
    }
});

// LİSTEDEN SEÇME (GEÇMİŞİ YÜKLEME)
$(document).on('click', '.vs-user-item', function(e) {
  
    if ($(e.target).hasClass('block-user-btn')) return;
    if ($(this).hasClass('offline')) return;
    
    
    $('.vs-user-item').removeClass('active').css('background-color', ''); 
    $(this).addClass('active');
    $(this).find('.new-badge').remove(); 

    
    ACTIVE_CHAT_TARGET = $(this).attr('data-peer-id'); 
    const userName = $(this).attr('data-username');

    
    $('#boru-chat-history').html(`<div class="vs-msg system"><strong>${userName}</strong> ile sohbet yüklendi.</div>`);
    

    
    if (CHAT_STORAGE[ACTIVE_CHAT_TARGET]) {
        CHAT_STORAGE[ACTIVE_CHAT_TARGET].forEach(msg => {
            const cssClass = msg.type === 'me' ? 'me' : 'them';
            const senderTag = msg.type === 'them' ? `<strong>${msg.sender}:</strong> ` : '';
            
            
            const msgId = msg.id || "old-" + Math.random(); 

            $('#boru-chat-history').append(`
                <div class="vs-msg ${cssClass}" id="msg-${msgId}">
                    ${senderTag}${msg.msg}
                    <span class="delete-msg-btn" data-id="${msgId}" title="Sil">🗑️</span>
                </div>
            `);
        });
    }
    
    
    const div = document.getElementById('boru-chat-history');
    if(div) div.scrollTop = div.scrollHeight;
});

// --- 🔥 BÖRÜ KESİN ENTER KORUMASI (OYUNU KÖR EDEN KALKAN) 🔥 ---
['keydown', 'keyup', 'keypress'].forEach(olay => {
    window.addEventListener(olay, (e) => {
        const aktifEleman = document.activeElement ? document.activeElement.id : '';
        
        
        if (aktifEleman === 'boru-chat-input') {
            e.stopPropagation(); 
            e.stopImmediatePropagation(); 
            
            
            if (olay === 'keydown' && (e.key === 'Enter' || e.keyCode === 13)) {
                e.preventDefault(); 
                
                if (typeof boruMesajGonder === 'function') {
                    boruMesajGonder(); 
                }
            }
        }
    }, true); 
});


// --- GÖNDER BUTONU VE ENTER TUŞU KONTROLÜ ---
function boruMesajGonder() {
    if (!ACTIVE_CHAT_TARGET) return;

    
    const rootID = getRealID(ACTIVE_CHAT_TARGET);
    if (BLOCKED_USERS.includes(rootID)) {
        if(typeof addChatMsg === 'function') addChatMsg("🚫 Bu kişiyi engelledin! Mesaj gönderemezsin.", true, "color:red;");
        return;
    }

    const msgInput = $('#boru-chat-input');
    const messageText = msgInput.val().trim();
    if (!messageText) return; 

    
    sendSafeMessage(ACTIVE_CHAT_TARGET, {
        sender: PLAYER ? PLAYER.username : "Börü",
        content: messageText
    });

    
    addMessageToChat(ACTIVE_CHAT_TARGET, "Ben", messageText, 'me');
    
    
    msgInput.val('').focus();
}
// --- 🔥 BÖRÜ ENTER & BUTON MOTORU (TETİKLEME TAKTİĞİ) ---


// 2. Butona tıklanınca (ister fareyle, ister Enter'ın gönderdiği sanal tıklamayla) mesajı fırlat
$(document).off('click', '#boru-chat-send').on('click', '#boru-chat-send', function() {
    if (!ACTIVE_CHAT_TARGET) {
        if (typeof addChatMsg === 'function') addChatMsg("⚠️ Önce sol listeden birini seçmelisin!", true, "color: orange;");
        return;
    }
    boruMesajGonder(); 
});


// --- BÖRÜ TAG (#0000) AYARI ---
// 1. Kayıtlı tag'i yükle
$('.lv-modal-p2p-code').val(LV_SETTINGS.USER_P2P_CODE || "");

// 2. SADECE SAYI GİRİŞİ KONTROLÜ
$('.lv-modal-p2p-code').on('input', function() {
    
    let val = $(this).val().replace(/[^0-9]/g, '');
    
    
    $(this).val(val);

    
    LV_SETTINGS.USER_P2P_CODE = val;
    saveSetting();
});

// --- CHAT AYARLARI MENÜSÜ MANTIĞI ---

// 1. Ayarları Aç
$('#btn-open-chat-settings').on('click', function() {
    $('#boru-chat-view').hide();      
    $('#boru-settings-view').show();  
    
    
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
    if(LV_SETTINGS.CHAT_SOUND) playNotificationSound(); 
});

// 4. Yazıyor Efekti (Şimdilik göstermelik, ileride bağlarız)
$('#set-typing-indicator').on('change', function() {
    
    saveSetting();
});

// --- ROL PAYLAŞMA BUTONU ---
$('#btn-share-role').on('click', function() {
    if (!ACTIVE_CHAT_TARGET) {
        addChatMsg("❌ Önce bir kişi seç!", true, "color:red;");
        return;
    }
    
    
    const rootID = getRealID(ACTIVE_CHAT_TARGET);
    if (BLOCKED_USERS.includes(rootID)) {
        addChatMsg("🚫 Engelli kişiye rolünü gösteremezsin.", true, "color:red;");
        return;
    }

    
    if (!ROLE || !ROLE.name) {
        addChatMsg("⚠️ Rolün henüz yüklenmedi veya oyunda değilsin(playda kapalı olabilir rol paylaşımı için play açık olmalı).", true, "color:orange;");
        return;
    }

    
    
    let roleIcon = "❓";
    if(ROLE.team === 'VILLAGER') roleIcon = "👱";
    if(ROLE.team === 'WEREWOLF') roleIcon = "🐺";
    if(ROLE.id === 'doctor') roleIcon = "💉";
    if(ROLE.id === 'seer') roleIcon = "🔮";
    if(ROLE.id === 'gunner') roleIcon = "🔫";
    if(ROLE.id === 'fool') roleIcon = "🤡";

    const payload = {
        type: 'ROLE_REVEAL', 
        sender: PLAYER.username,
        roleName: ROLE.name,
        roleTeam: ROLE.team, 
        icon: roleIcon
    };

    
    if (myPeer && myPeer.connections[ACTIVE_CHAT_TARGET]) {
        const conns = myPeer.connections[ACTIVE_CHAT_TARGET];
        if (conns && conns[0]) {
            conns[0].send(payload);
            
            
            $('#boru-chat-history').append(`
                <div class="vs-msg me" style="background:transparent; padding:0;">
                    <div class="role-card">
                        <div class="role-title">KİMLİK GÖSTERİLDİ</div>
                        <div class="role-icon">${roleIcon}</div>
                        <div>Ben <strong>${ROLE.name}</strong> rolündeyim!</div>
                    </div>
                </div>
            `);
            
            addMessageToChat(ACTIVE_CHAT_TARGET, "Ben", roleHtml, 'me');
            
            
            const div = document.getElementById('boru-chat-history');
            div.scrollTop = div.scrollHeight;
        }
    } else {
        addChatMsg("❌ Bağlantı koptu, gönderilemedi.", true, "color:red;");
    }
});

// --- RESİM GÖNDERME SİSTEMİ ---
$(document).on('change', '#boru-file-upload', function(e) {

  
    const rootID = getRealID(ACTIVE_CHAT_TARGET);
    if (BLOCKED_USERS.includes(rootID)) {
        alert("🚫 Engelli kişiye resim atamazsın!");
        $(this).val('');
        return;
    }

    if (!ACTIVE_CHAT_TARGET) {
        alert("Önce listeden bir kişi seç!");
        $(this).val(''); 
        return;
    }

    const file = e.target.files[0];
    if (!file) return;

    
    if (file.size > 2 * 1024 * 1024) { 
        alert("⚠️ Dosya çok büyük! Lütfen 2MB altı bir resim seç.");
        $(this).val('');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(event) {
        const base64Data = event.target.result; 
          
        if (myPeer && myPeer.connections[ACTIVE_CHAT_TARGET]) {
            const conns = myPeer.connections[ACTIVE_CHAT_TARGET];
            if (conns && conns[0]) {
                conns[0].send({
                    type: 'IMAGE',
                    sender: PLAYER ? PLAYER.username : "Ben",
                    content: base64Data
                });

                
                const imgTag = `<img src="${base64Data}" class="chat-image">`;
                
                
                addMessageToChat(ACTIVE_CHAT_TARGET, "Ben", imgTag, 'me'); 

                
                const div = document.getElementById('boru-chat-history');
                if(div) div.scrollTop = div.scrollHeight;
            }
        } else {
            addChatMsg("❌ Bağlantı yok, resim gidemedi.", true, "color:red;");
        }
    };

    
    reader.readAsDataURL(file); 
    $(this).val(''); 
});

// --- 🔥 VİDEO GÖNDERME SİSTEMİ ---
$(document).on('change', '#boru-video-upload', function(e) {
    
    const rootID = getRealID(ACTIVE_CHAT_TARGET);
    if (BLOCKED_USERS.includes(rootID)) {
        alert("🚫 Engelli kişiye video atamazsın!");
        $(this).val('');
        return;
    }
    if (!ACTIVE_CHAT_TARGET) {
        alert("Önce listeden bir kişi seç!");
        $(this).val('');
        return;
    }

    const file = e.target.files[0];
    if (!file) return;

    
    
    if (file.size > 10 * 1024 * 1024) { 
        alert("⚠️ Video çok büyük! En fazla 10MB olabilir.");
        $(this).val('');
        return;
    }

    
    addChatMsg(`⏳ Video işleniyor, lütfen bekle...`, false, "color:yellow; font-size:10px;");

    const reader = new FileReader();
    
    reader.onload = function(event) {
        const base64Data = event.target.result; 

        
        sendSafeMessage(ACTIVE_CHAT_TARGET, {
            type: 'VIDEO', 
            sender: PLAYER ? PLAYER.username : "Ben",
            content: base64Data
        });

        
        
        const videoTag = `<video src="${base64Data}" controls class="chat-video"></video>`;
        
        addMessageToChat(ACTIVE_CHAT_TARGET, "Ben", videoTag, 'me'); 

        
        const div = document.getElementById('boru-chat-history');
        if(div) div.scrollTop = div.scrollHeight;
    };

    reader.readAsDataURL(file); 
    $(this).val(''); 
});

// --- 🔥 GELİŞMİŞ RESİM GÖRÜNTÜLEYİCİ (LIGHTBOX) ---
$(document).on('click', '.chat-image', function(e) {
    e.stopPropagation(); 
    const src = $(this).attr('src');

    
    const lightbox = $(`
        <div class="boru-lightbox">
            <img src="${src}" title="Büyütmek/Gezmek için resme tıkla">
        </div>
    `);

    
    $('body').append(lightbox);
    
    
    
    
    lightbox.find('img').on('click', function(e) {
        e.stopPropagation(); 
        $(this).toggleClass('zoomed');
    });

    
    lightbox.on('click', function() {
        $(this).fadeOut(200, function() {
            $(this).remove();
        });
    });

    
    $(document).one('keydown', function(e) {
        if (e.key === "Escape") {
            lightbox.click();
        }
    });
});

// --- 🔥 SS YAPIŞTIRMA (CTRL+V) ÖZELLİĞİ ---
$(document).on('paste', '#boru-chat-input', function(e) {
    
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;

    
    for (let index in items) {
        const item = items[index];

        
        if (item.kind === 'file' && item.type.includes('image')) {
            
            
            if (!ACTIVE_CHAT_TARGET) {
                alert("⚠️ Önce listeden bir kişi seçmelisin!");
                return;
            }

            
            const rootID = getRealID(ACTIVE_CHAT_TARGET);
            if (BLOCKED_USERS.includes(rootID)) {
                alert("🚫 Engelli kişiye resim atamazsın!");
                return;
            }

            const blob = item.getAsFile(); 
            
            
            if (blob.size > 2 * 1024 * 1024) {
                alert("⚠️ Resim çok büyük! (Max 2MB)");
                return;
            }

            
            
            if(typeof addChatMsg === 'function') {
                 addChatMsg("📸 Resim panodan alındı, gönderiliyor...", false, "color:yellow; font-size:10px;");
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Data = event.target.result;

                
                sendSafeMessage(ACTIVE_CHAT_TARGET, {
                    type: 'IMAGE',
                    sender: PLAYER ? PLAYER.username : "Ben",
                    content: base64Data
                });

                
               const imgTag = `<img src="${base64Data}" class="chat-image">`;
                addMessageToChat(ACTIVE_CHAT_TARGET, "Ben", imgTag, 'me');
                
                
                const div = document.getElementById('boru-chat-history');
                if(div) div.scrollTop = div.scrollHeight;
            };

            reader.readAsDataURL(blob);
            
            
            e.preventDefault(); 
        }
    }
});

// --- BUG BİLDİR BUTONU VE FORM MANTIĞI BURAYA EKLENECEK ---
  if ($('.lv-modal-bug-report-trigger').length === 0) {
      $('.lv-modal-command').last().after(`
        <div class="lv-modal-command" style="margin-top: 10px; border-top: 1px solid #333; padding-top: 10px;">
          <button class="lv-modal-bug-report-trigger" style="padding: 4px 10px; background-color: #fb2e00; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">🐞 Bug / Öneri Bildir</button>
        </div>
      `);
  }

  
  $(document).off('click', '.lv-modal-bug-report-trigger').on('click', '.lv-modal-bug-report-trigger', () => {
      $('.lv-modal-popup-container').hide(); 
      $('#boru-bug-modal').css('display', 'flex'); 
  });

  
  $('#boru-bug-close').on('click', () => {
      $('#boru-bug-modal').hide();
      $('#bug-status-msg').text('');
  });

  
  $(document).off('click', '#bug-submit-btn').on('click', '#bug-submit-btn', async function() {
      const text = $('#bug-report-text').val().trim();
      const type = $('#bug-type-select').val();

      if (text.length < 5) {
          $('#bug-status-msg').html('<span style="color: orange;">Lütfen biraz daha detaylı yazın.</span>');
          return;
      }

      $(this).text("GÖNDERİLİYOR...").css('opacity', '0.5').prop('disabled', true);
      
      const isSuccess = await sendBoruFeedback(type, text);

      if (isSuccess) {
          $('#bug-status-msg').html('<span style="color: #00FF00;">✅ Başarıyla iletildi!</span>');
          setTimeout(() => {
              $('#boru-bug-modal').hide();
              $('#bug-report-text').val('');
              $(this).text("GÖNDER").css('opacity', '1').prop('disabled', false);
              $('#bug-status-msg').text('');
          }, 1500);
      } else {
          $('#bug-status-msg').html('<span style="color: red;">❌ Bir hata oluştu.</span>');
          $(this).text("GÖNDER").css('opacity', '1').prop('disabled', false);
      }
  });


  
  $('.lv-modal-auto-slot-input').val(LV_SETTINGS.AUTO_SLOT || 0);
  $('.lv-modal-auto-slot-input').on('input', function() { 
      let val = parseInt($(this).val());
      if (val >= 0 && val <= 16) {
          LV_SETTINGS.AUTO_SLOT = val; 
          saveSetting(); 
      }
  });



  
              
    $('.lv-modal-checkbox.lobby-quit-active').on('click', function() {
        LV_SETTINGS.LOBBY_AUTO_QUIT_ACTIVE = !LV_SETTINGS.LOBBY_AUTO_QUIT_ACTIVE;
        $(this).text(LV_SETTINGS.LOBBY_AUTO_QUIT_ACTIVE ? '' : '');
        saveSetting();
        addChatMsg(`🚪 Lobi Limiti: ${LV_SETTINGS.LOBBY_AUTO_QUIT_ACTIVE ? 'AKTİF' : 'KAPALI'}`);
    });

    
    $('.lv-modal-lobby-quit-input').val(LV_SETTINGS.LOBBY_AUTO_QUIT_SECONDS).on('input', function() {
        let val = parseInt($(this).val());
        if (val > 0) {
            LV_SETTINGS.LOBBY_AUTO_QUIT_SECONDS = val;
            saveSetting();
        }
    });

    
    $('.lv-modal-checkbox.lobby-quit-active').text(LV_SETTINGS.LOBBY_AUTO_QUIT_ACTIVE ? '' : '');
    $('.lv-modal-lobby-quit-input').val(LV_SETTINGS.LOBBY_AUTO_QUIT_SECONDS);




  
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
    
    body: JSON.stringify({ 
        deviceId: null, 
        locale: "en", 
        platform: "web", 
        versionNumber: 1 
    })
  }).catch(e => console.error("Kimlik doğrulama isteği başarısız:", e));
}

const addPlayerAura = () => {

  PLAYERS.forEach((player) => {
    
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
        let bgColor = 'white'; 
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
  
  $('select.player-status-dropdown').remove();
}

const handlePlayerAura = () => {
  
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

      
      if (grandparent.find('input.player-status-note')?.length === 0) {
        
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

        
        textInput.on('click mousedown focus', function (e) {
          e.stopPropagation();
        });

        textInput.on('focus', function () {
          
          $('textarea').prop('disabled', true);
        });

        textInput.on('blur', function () {
          
          $('textarea').prop('disabled', false);
        });

        
        textInput.on('input', function () {
          const note = textInput.val();
          PLAYERNOTESMAP.set(username, note);
        });

        
        grandparent.append(textInput);
      }
    }
  });
};

const removePlayerNotes = () => {
  
  $('input.player-status-note').remove();
}

const handlePlayerNotes = () => {
  
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
      parentDiv.show(); 
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

      
      const outsideSpanText = fullDivText.replace(spanText, '');

      const numberPattern = new RegExp(`\\b${givenNumber}\\b`);

      
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
    console.log(`[Börü] Auto Replay: Köşe Koruması (200px) + Öncelik Sistemi Aktif 🚀`);

    function click(element) {
      visualizeClick(element);
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      
      const randomDelay = Math.random() * 600;
      
      setTimeout(() => {
        window.postMessage({ type: 'FROM_PAGE_CLICK', x, y }, '*');
      }, randomDelay);

    }

    
    const isFarFromCorner = (el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      
      const distance = Math.sqrt(Math.pow(rect.left, 2) + Math.pow(rect.top, 2));
      
      
      return distance >= 200;
    };

    let lastPlayAgainTime = 0;

    setInterval(() => {
      if (!LV_SETTINGS.AUTO_REPLAY) return;

      const now = Date.now();
      let tiklanacakButon = null;

      

      
      const btnStart = $('#root div:contains("START GAME"):visible');
      if (btnStart.length > 0 && isFarFromCorner(btnStart.last()[0])) {
        tiklanacakButon = btnStart.last()[0];
      }

      
      const btnContinue = $('#root div:contains("Continue"):visible');
      if (btnContinue.length > 0 && isFarFromCorner(btnContinue.last()[0])) {
        tiklanacakButon = btnContinue.last()[0];
      }

      
      const btnPlayAgain = $('#root div:contains("Play again"):visible');
      let isPlayAgainMatch = false;
      if (btnPlayAgain.length > 0 && (now - lastPlayAgainTime > 3000) && isFarFromCorner(btnPlayAgain.last()[0])) {
        tiklanacakButon = btnPlayAgain.last()[0];
        isPlayAgainMatch = true;
      }

      
      const btnOk = $('#root div:contains("OK"):visible').filter(function() { return $(this).text().trim() === "OK"; });
      const isGameOver = btnPlayAgain.length > 0 || (typeof GAME_STATUS !== 'undefined' && GAME_STATUS === 'over');
      
      if (btnOk.length > 0 && isGameOver && isFarFromCorner(btnOk.last()[0])) {
        tiklanacakButon = btnOk.last()[0];
        isPlayAgainMatch = false; 
      }

      
      if (tiklanacakButon) {
        if (isPlayAgainMatch && tiklanacakButon === btnPlayAgain.last()[0]) {
          lastPlayAgainTime = now;
        }
        click(tiklanacakButon);
      }

    }, 1000);
  }
}


// --- BÖRÜ ÇAPRAZ SEKME (MULTI-TAB) ODA SENKRONİZASYONU ---
// Bu telsiz sadece sekmeler açıkken çalışır, sayfayı yenilediğin an hafızası SIFIRLANIR!
const boruOdaKanali = new BroadcastChannel('boru_oda_senkron');
let digerSekmelerinOdalari = []; 

boruOdaKanali.onmessage = (event) => {
    if (event.data && event.data.tip === 'ODA_GIRILDI') {
        if (!digerSekmelerinOdalari.includes(event.data.oda)) {
            digerSekmelerinOdalari.push(event.data.oda);
            console.log(`📡 [Börü Telsizi] Diğer sekme "${event.data.oda}" odasına daldı. Ben orayı es geçiyorum!`);
        }
    }
};



const handleAutoJoin = () => {
    if (autoJoinIlkYukleme) {
        console.log(`⏳ [Börü] Auto Join: Sayfa ilk yüklemesi bekleniyor (3 saniye)...`);
        autoJoinIlkYukleme = false; 
        new Promise(resolve => setTimeout(resolve, 2500));
    }

    let isJoinActive = sessionStorage.getItem('boru-tab-autojoin') === 'true';
    if (!isJoinActive) return;

    console.log(`[Börü] Auto Join: DOM Tabanlı Beklemeli Nişancı Modu 🎯`);

    function click(element) {
        if (typeof visualizeClick === 'function') visualizeClick(element);
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        const randomDelay = Math.random() * 600;
        setTimeout(() => {
            window.postMessage({ type: 'FROM_PAGE_CLICK', x, y }, '*');
        }, randomDelay);
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 && rect.left >= 0 &&
            rect.bottom <= ((window.innerHeight || document.documentElement.clientHeight) - 120) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    const joinLoop = setInterval(() => {
        if (sessionStorage.getItem('boru-tab-autojoin') !== 'true') { 
            clearInterval(joinLoop); 
            return; 
        }
        
        if ($('.lv-modal-join-filter-input').is(':focus') || $('.lv-modal-join-exclude-input').is(':focus')) return;

        let tiklanacakButon = null;

        // ===============================================================
        // 🔥 AŞAMA 1: EKRANDA JOIN VEYA ŞİFRE EKRANI VAR MI? (İÇERİDE MİYİZ?)
        // ===============================================================
        const btnJoin = $('#root div:contains("Join"):visible').filter(function() {
            const text = $(this).text().trim();
            return text === "Join" || text === "Join new";
        });
        
        const passwordInput = $('input[placeholder="Password"]:visible');

        // Eğer Join butonu veya şifre girme kutusu ekrandaysa, BAŞKA ODA ARAMA!
        if (btnJoin.length > 0 || passwordInput.length > 0) {
            let passVal = sessionStorage.getItem('boru-tab-password') || ""; 
            
            if (passwordInput.length > 0) {
                // Şifre ekranındayız
                if (passVal.toLowerCase().includes('+ admin') || passVal.toLowerCase().includes('+:admin:')) {
                    if (window.INSPECTED_ROOM_PASSWORD) {
                        passVal = window.INSPECTED_ROOM_PASSWORD; 
                    } else {
                        passVal = ""; 
                    }
                }     
              
                if (passVal && passVal.trim() !== "") {
                    const inputEl = passwordInput[0];
                    if (inputEl.value !== passVal) {
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                        nativeInputValueSetter.call(inputEl, passVal);
                        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    const btnOk = $('#root div:contains("OK"):visible');
                    if (btnOk.length > 0) tiklanacakButon = btnOk.last()[0];
                } else {
                    const btnCancel = $('#root div:contains("Cancel"):visible, #root div:contains("CANCEL"):visible');
                    if (btnCancel.length > 0) {
                        tiklanacakButon = btnCancel.last()[0];
                    }
                }
            } else {
                // Şifre yok, Join ekranındayız
                tiklanacakButon = btnJoin.last()[0];
                const roomname = $('.css-146c3p1.r-1i10wst.r-vw2c0b.r-fdjqy7'); 
                let kesinOdaAdi = roomname.length > 0 ? roomname.text().trim() : "";
                
                if (kesinOdaAdi !== "") {
                    boruOdaKanali.postMessage({ tip: 'ODA_GIRILDI', oda: kesinOdaAdi });
                }
            }

            if (tiklanacakButon) {
                click(tiklanacakButon);
            }
            
            // DİKKAT: Odanın içindeysek aşağı inip JSON'dan oda aramasını ENGELLİYORUZ!
            return; 
        }


        // ===============================================================
        // 🔥 AŞAMA 2: LOBİDEYİZ. STANDART BUTONLARI VE JSON'DAN ODAYI BUL
        // ===============================================================
        const btnPlay = $('#root div:contains("PLAY"):visible').not(':contains("WITH")');
        if (btnPlay.length > 0) tiklanacakButon = btnPlay.last()[0];

        const btnCustom = $('#root div:contains("CUSTOM GAMES"):visible')
            .filter(function() { return $(this).text().trim() === "CUSTOM GAMES" && !$(this).text().includes("Premium"); });
        if (btnCustom.length > 0) tiklanacakButon = btnCustom.last()[0];

        // Filtreleri Çek 
        let rawFilter = sessionStorage.getItem('boru-tab-filter') || "";
        let filterRoomName = rawFilter;
        let requiredRoles = []; 

        if (rawFilter.includes('+')) {
            let parts = rawFilter.split('+');
            filterRoomName = parts[0].trim();
            if (parts[1]) {
                requiredRoles = parts[1].split(',').map(role => role.replace(/:/g, '').trim().toLowerCase()).filter(role => role.length > 0); 
            }
        }

        const excludeText = LV_SETTINGS.AUTO_JOIN_EXCLUDE || "";
        const caseSensitive = LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE;
        let passValForCheck = sessionStorage.getItem('boru-tab-password') || ""; 

        // JSON ÜZERİNDEN HEDEF ODAYI BUL
        let bestGame = null;

        if (window.BORU_OPEN_GAMES && window.BORU_OPEN_GAMES.length > 0) {
            bestGame = window.BORU_OPEN_GAMES.find(game => {
                const gameName = game.name;

                if (digerSekmelerinOdalari.includes(gameName)) return false;
                if (game.playerCount >= 16) return false;
                if (game.hasPassword && passValForCheck.trim() === "") return false;

                if (filterRoomName && filterRoomName.trim() !== "") {
                    const filters = filterRoomName.split(',').map(f => f.trim()).filter(f => f.length > 0);
                    const isNameMatch = filters.some(filterWord => {
                        return caseSensitive ? gameName.includes(filterWord) : gameName.toLowerCase().includes(filterWord.toLowerCase());
                    });
                    if (!isNameMatch) return false;
                } else {
                    if (!gameName.toLowerCase().includes("vill win")) return false;
                }

                if (excludeText.trim() !== "") {
                    const badWords = excludeText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
                    if (badWords.some(bad => gameName.toLowerCase().includes(bad))) return false;
                }

                if (requiredRoles.length > 0) {
                    const hasRequiredRole = requiredRoles.some(r => game.roles.includes(r));
                    if (!hasRequiredRole) return false; 
                }

                return true; 
            });
        }

        // HEDEF BULUNDU, EKRANDA TIKLA
        if (bestGame) {
            const escapeSelector = (str) => str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
            const targetDivs = $(`.css-g5y9jx.r-13awgt0.r-eqz5dr.r-1rngwi6 div:contains("${escapeSelector(bestGame.name)}"):visible`);

            if (targetDivs.length > 0) {
                const visibleRooms = targetDivs.toArray().filter(el => isElementInViewport(el));
                tiklanacakButon = visibleRooms.length > 0 ? visibleRooms[visibleRooms.length - 1] : targetDivs[0];
                
                console.log(`[Börü] Hedef Bulundu: "${bestGame.name}". Tıklanıyor ve yüklenmesi bekleniyor...`);
                
                const currentRoomName = $('.css-146c3p1.r-1i10wst.r-vw2c0b.r-fdjqy7').text().trim();
                if (currentRoomName !== bestGame.name) {
                    window.INSPECTED_ROOM_READY = false; 
                    window.INSPECTED_ROOM_ROLES = [];
                }
            }
        } else {
             // Hedef yoksa Refresh'e bas
             const btnRefresh = $('#root div:contains("REFRESH"):visible');
             if (btnRefresh.length > 0) tiklanacakButon = btnRefresh.last()[0];
        }

        if (tiklanacakButon) {
            click(tiklanacakButon);
        }

    }, 1500);
}
const handleAutoCreate = () => {
    console.log(`[Börü] Auto Create: Motor tetikte bekliyor... 🚂`);
      
    function click(element) {
        visualizeClick(element);
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
         
        const randomDelay = Math.random() * 600;
        setTimeout(() => {
            window.postMessage({ type: 'FROM_PAGE_CLICK', x, y }, '*');
        }, randomDelay);
    }

    // 🔥 BUG FIX: Eğer önceden çalışan bir döngü varsa üst üste binmesin (Spam engeli)
    if (window.boruAutoCreateInterval) {
        clearInterval(window.boruAutoCreateInterval);
    }

    // Dışarıdaki "if" engelini kaldırdık. Döngü hep arka planda çalışacak, 
    // şalter açılınca harekete geçecek!
    window.boruAutoCreateInterval = setInterval(() => {
         
        // Şalter açık mı kontrol et (Menüdeki düğmen burayı değiştiriyor)
        if (sessionStorage.getItem('boru-tab-autocreate') !== 'true') return;
         
        // Yazı yazıyorsan tıklama yapma
        if ($('.lv-modal-create-template-input').is(':focus')) return;

        let tiklanacakButon = null;

        // 1. PLAY
        const btnPlay = $('#root div:contains("PLAY"):visible').not(':contains("WITH")');
        if (btnPlay.length > 0) {
            tiklanacakButon = btnPlay[btnPlay.length - 1];
        }

        // 2. CUSTOM GAMES
        const btnCustom = $('#root div:contains("CUSTOM GAMES"):visible');
        if (btnCustom.length > 0) {
            tiklanacakButon = btnCustom[btnCustom.length - 1];
        }
         
        // 3. CREATE GAME
        const btnCreate = $('#root div:contains("CREATE GAME"):visible');
        if (btnCreate.length > 0) {
            tiklanacakButon = btnCreate[btnCreate.length - 1];
        }
         
        // 4. Şablon Klasör İkonu
        const btnTemplateMenu = $('#root .css-g5y9jx.r-1awozwy.r-18u37iz.r-17s6mgv > div:nth-child(2) > div:first-child > div:first-child > div:first-child').filter(':visible');
        if (btnTemplateMenu.length > 0) {
            tiklanacakButon = btnTemplateMenu[btnTemplateMenu.length - 1];
        }

        // 5. Hedef Şablon Adı
        const templateName = sessionStorage.getItem('boru-tab-template') || "";
        if(templateName) {
            const btnTargetTemplate = $('.css-g5y9jx.r-f727ji.r-j2kj52 div:contains("' + templateName + '"):visible');
            if (btnTargetTemplate.length > 0) {
                tiklanacakButon = btnTargetTemplate[0];
            }
        }

        // Tıklama İşlemi
        if (tiklanacakButon) {
            click(tiklanacakButon);
             
            // Eğer tıkladığımız buton şablon ismiyse, yarım saniye sonra CREATE GAME'e de bas!
            if (templateName && tiklanacakButon.innerText.includes(templateName)) {
                setTimeout(() => {
                    const btnCreateConfirm = $('#root div:contains("CREATE GAME"):visible');
                    if (btnCreateConfirm.length > 0) {
                        click(btnCreateConfirm[btnCreateConfirm.length - 1]); 
                    }
                }, 650); 
            }
        }

    }, 2000); 
}

const saveSetting = () => {
  
  localStorage.setItem('lv-settings', JSON.stringify(LV_SETTINGS))
  log("Ayarlar Kaydedildi:")

  // 🔥 YENİ: C# KARARGAHA ANINDA HABER VER (ÇİFT YÖNLÜ SYNC) 🔥
  if (typeof KARARGAH_SOCKET !== 'undefined' && KARARGAH_SOCKET && KARARGAH_SOCKET.readyState === 1) { 
      KARARGAH_SOCKET.send(JSON.stringify({
          tip: "AYAR_SYNC",
          ayarlar: LV_SETTINGS
      }));
  }
}

const log = (m) => {
  if (LV_SETTINGS.DEBUG_MODE) console.log(m)
}

const loadSettings = () => {
  const settings = localStorage.getItem('lv-settings')
  if (settings) {
    try {
      
      
      
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
  // Bunu requestsToCatch içine uygun bir yere ekle https://game.api-wolvesville.com/api/public/game/custom?language=en

  'game/custom?language=en': (data) => {
      if (data && data.openGames) {
          window.BORU_OPEN_GAMES = data.openGames;
          console.log(`📡 [Börü Radar] ${data.openGames.length} adet açık lobi tespit edildi.`);
      }
  },

  '/api/public/game/custom/settings': (data) => {
      if (data) {
          if (data.roles) {
              window.INSPECTED_ROOM_ROLES = data.roles;
          }
          
          if (data.password !== undefined && data.password !== null) {
              window.INSPECTED_ROOM_PASSWORD = data.password;
          } else {
              window.INSPECTED_ROOM_PASSWORD = "";
          }
          
          window.INSPECTED_ROOM_READY = true; 
          console.log(`🕵️‍♂️ [Börü Radar] Oda Deşifre Edildi. Şifre: ${window.INSPECTED_ROOM_PASSWORD ? window.INSPECTED_ROOM_PASSWORD : "YOK"}`);
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
      sendBotLoginNotification(data.player); 
      // 🔥 İŞTE BURASI: KARARGAH TELSİZİNİ BAŞLAT 🔥
      setTimeout(baslatKarargahTelsizi, 2000); // Kimlik geldikten 2 saniye sonra Karargaha bağlan
      
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

const interceptNativeSocket = () => {
    const OrigWebSocket = window.WebSocket;
    
    window.WebSocket = function(...args) {
        const ws = new OrigWebSocket(...args);
        
        console.log(`🐺 [DEBUG] Yeni WebSocket oluşturuldu. URL:`, args[0]);

        ws.addEventListener('open', function(e) {
            console.log(`🐺 [DEBUG] Soket AÇILDI. URL: ${ws.url}`);
            if (ws.url.includes('api-wolvesville.com')) {
                NATIVE_SOCKET = ws;
                console.log("%c🐺 Börü: Native Socket kancaya takıldı!", "background: green; color: white; padding: 2px;");
            }
        });

        ws.addEventListener('close', function(e) {
            console.warn(`🐺 [DEBUG] Soket KAPANDI. Kod: ${e.code}, Sebep: ${e.reason}`);
        });

        ws.addEventListener('error', function(e) {
            console.error(`🐺 [DEBUG] Soket HATASI!`, e);
        });

        const oyununKendiSendi = ws.send;
        ws.send = function(data) {
            if (typeof data === 'string' && data.startsWith('42')) {
                console.log(`%c🐺 [DEBUG - OYUN GÖNDERİYOR]`, 'color: orange;', data);
            }
            return oyununKendiSendi.apply(this, arguments);
        };

        ws.addEventListener('message', function(event) {
            if (typeof event.data === 'string' && event.data.startsWith('42')) {
                const parsedMessage = messageParser(event.data);
                if (parsedMessage && parsedMessage.length) {
                    messageDispatcher(parsedMessage);
                }
            }
        });
        
        return ws;
    };
};
interceptNativeSocket();


const emitNative = (eventName, payloadStr) => {
    if (!NATIVE_SOCKET) {
        console.error(`🐺 [Börü ERROR] NATIVE_SOCKET tanımlı değil! Event: ${eventName}`);
        return;
    }
    if (NATIVE_SOCKET.readyState !== 1) {
        console.error(`🐺 [Börü ERROR] Soket hazır değil! State: ${NATIVE_SOCKET.readyState}. Event: ${eventName}`);
        return;
    }
    try {
        const packetArray = payloadStr ? [eventName, payloadStr] : [eventName];
        const packet = "42" + JSON.stringify(packetArray);
        console.log(`🐺 [DEBUG - EMIT] Gönderiliyor:`, packet);
        SafWebSocketSend.call(NATIVE_SOCKET, packet);
        console.log(`%c🐺 [DEBUG - EMIT BAŞARILI]`, "color: #00FF00; font-weight: bold;");
    } catch (error) {
        console.error(`🐺 [Börü KRİTİK ERROR] Emit hatası:`, error);
    }
};

const fetchInterceptor = () => {
    const { fetch: origFetch } = window;
    
    
    const targetUrls = Object.keys(requestsToCatch);

    window.fetch = async (...args) => {
        
        const input = args[0];
        let url = (typeof input === 'string') ? input : (input?.url || "");

        
        
        if (url.includes('/players/webBo') || url.includes('/players/webAutomatio') || url.includes('[native code]')) {
            return new Response(JSON.stringify({ success: true }), { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        
        if (url.startsWith('https://core.api-wolvesville.com/inventory?')) {
            url = 'https://core.api-wolvesville.com/inventory?';
            if (typeof input === 'string') args[0] = url;
        }

        
        
        const matchedKey = targetUrls.find(_url => url.includes(_url));
        const catchMethod = matchedKey ? requestsToCatch[matchedKey] : null;

        
        let init = args[1] || {};
        let headers = init.headers;
        if (headers) {
            let authHeader = "";
            if (headers instanceof Headers) {
                authHeader = headers.get('authorization') || "";
            } else {
                authHeader = headers['authorization'] || headers['Authorization'] || "";
            }

            if (authHeader && authHeader.startsWith('Bearer ')) {
                const newToken = authHeader.slice(7);
                if (AUTHTOKENS.idToken !== newToken) {
                    AUTHTOKENS.idToken = newToken;
                    
                }
            }
        }

        
        const response = await origFetch(...args);

        
        if (catchMethod && response.ok) {
            try {
                
                const clonedResponse = response.clone();
                const contentType = clonedResponse.headers.get("content-type");

                
                if (contentType && contentType.includes("application/json")) {
                    const text = await clonedResponse.text();
                    if (text && text.trim() !== "") {
                        const data = JSON.parse(text);
                        
                        return catchMethod(data, url) || response;
                    }
                }
            } catch (e) {
                
                return response;
            }
        }

        return response;
    };
    console.log("🚀 Börü: Optimized Fetch Interceptor v3.1 Aktif (VDS Ready)");
};


// --- 🔥 BÖRÜ OYLAMA MOTORU 🔥 ---
const boruOylariYazdir = () => {
    const voterIds = Object.keys(DAY_VOTING);
    if (voterIds.length > 0) {
        DAY_COUNT++;
        let output = `\n🌙 Gün ${DAY_COUNT} Oylaması:\n`;
        voterIds.forEach(voterId => {
            const targetId = DAY_VOTING[voterId];
            const voterPlayer = PLAYERS.find((v) => v?.id === voterId);
            let targetName = "Boş / Pas / Çekildi";
            if (targetId !== "skip") {
                const targetPlayer = PLAYERS.find((v) => v?.id === targetId);
                if (targetPlayer) targetName = `[${targetPlayer.gridIdx + 1}] ${targetPlayer.username}`;
            }
            if (voterPlayer) {
                output += `  [${voterPlayer.gridIdx + 1}] ${voterPlayer.username} 👉 ${targetName}\n`;
            }
        });
        GAME_VOTING += output;
    }
    DAY_VOTING = {}; // Sonraki gün için temizle
};
// ---------------------------------

const messagesToCatch = {
  'game-joined': (data) => {
    addChatMsg('🔗 Game joined');
    if (LV_SETTINGS.LOBBY_AUTO_QUIT_ACTIVE && LV_SETTINGS.LOBBY_AUTO_QUIT_SECONDS > 0) {
        clearTimeout(LOBBY_TIMEOUT_TIMER);
        LOBBY_TIMEOUT_TIMER = setTimeout(() => {
            if (GAME_SETTINGS && GAME_SETTINGS.gameMode !== 'custom') return;
            if (GAME_STATUS !== 'started') {
                addChatMsg(`⏰ Lobby time expired. Leaving the room...`, true, "color: #ff4081;");
                setTimeout(() => window.location.reload(), 1000);
            }
        }, LV_SETTINGS.LOBBY_AUTO_QUIT_SECONDS * 1000);
    }
    const _data = Object.values(data);
    GAME_ID = _data[0];
    SERVER_URL = _data[1];
    setTimeout(setPlayersLevel, 1000);
     // 🔥 HIZLI AUTO SLOT (Odaya Girer Girmez Işınlan) 🔥
    if (LV_SETTINGS.AUTO_SLOT && LV_SETTINGS.AUTO_SLOT > 0 && LV_SETTINGS.AUTO_SLOT <= 16) {
        const gridIdx = LV_SETTINGS.AUTO_SLOT - 1;
        setTimeout(() => {
            if (NATIVE_SOCKET && NATIVE_SOCKET.readyState === 1) {
                console.log(`🚀 [Börü Hızlı Slot] Odaya girildi, direkt Grid ${gridIdx} kapılıyor!`);
                emitNative('lobby:player-grid-idx-changed', JSON.stringify({ gridIdx: gridIdx }));
            }
        }, gecikmelan(1)); // Odaya girdikten 100 milisaniye sonra anında gönderir
    }
  },
  'game-settings-changed': (data) => {
    GAME_SETTINGS = data;
  },
  'game-starting': () => {
    addChatMsg('🚩 Game starting');
  },
  'game-started': (data) => {
    clearTimeout(LOBBY_TIMEOUT_TIMER);
    setTimeout(() => broadcastStatus("In game (Day 1)"), 4000);
    addChatMsg('🚀 Game started');
    GAME_STATUS = 'started';
    GAME_STARTED_AT = new Date().getTime();
    setRole(data.role);
    addChatMsg(`You are ${ROLE.name} (${ROLE?.id})`, true, 'color: #FF4081;');
    PLAYERS = data.players;

    // Reset global arrays
    LOVERS = [];
    DEADS = [];
    JW_TARGET = undefined;
    CHAT_WW_SENDED = false;
    WOLVES = [];
    TARGET_WW_VOTE = undefined;
    DAY_COUNT = 0;
    DAY_VOTING = {};
    GAME_VOTING = "";
    PENDING_NIGHT_INFO = ""; // Reset info memory in new game

    window.dispatchEvent(new CustomEvent("BORU_YENI_OYUNCULAR", { detail: PLAYERS }));

    if (data.gameMode) CURRENT_GAME_MODE = data.gameMode;
    else if (GAME_SETTINGS && GAME_SETTINGS.gameMode) CURRENT_GAME_MODE = GAME_SETTINGS.gameMode;
    else CURRENT_GAME_MODE = "Custom/Unknown";

    if (PLAYERS && PLAYERS.length > 0) {
        let list = `Game ID: ${GAME_ID}\nDate: ${new Date().toLocaleString()}\n--------------------------------\n`;
        PLAYERS.forEach(p => list += `${parseInt(p.gridIdx) + 1}. ${p.username} [Lvl ${p.level}]\n`);
        localStorage.setItem('lv-last-players-list', list);
    }

   

    setTimeout(setPlayersLevel, 1000);
    setTimeout(handlePlayerAura, 20000);
    setTimeout(handlePlayerNotes, 20000);
  },
  'game-cupid-lover-ids-and-roles': (data) => {
    if (!PLAYER) getPLAYER();
    if (PLAYER && ROLE) {
      const loverPlayerIds = data.loverPlayerIds.filter((v) => v !== PLAYER?.id);
      const loverRoles = data.loverRoles.filter((v) => v !== ROLE?.id);
      LOVERS = loverPlayerIds.map((playerId, i) => ({ id: playerId, role: loverRoles[i] }));
      if (LOVERS?.length === 1) {
        const lover1 = PLAYERS.find((v) => v?.id === LOVERS[0]?.id);
        if (lover1) addChatMsg(`💘 Your lover is ${lover1.gridIdx + 1}. ${lover1.username} (${LOVERS[0].role})`);
      } else if (LOVERS?.length === 2) {
        const lover1 = PLAYERS.find((v) => v?.id === LOVERS[0]?.id);
        const lover2 = PLAYERS.find((v) => v?.id === LOVERS[1]?.id);
        if (lover1 && lover2) addChatMsg(`💘 Your lovers are ${lover1.gridIdx + 1}. ${lover1.username} and ${lover2.gridIdx + 1}. ${lover2.username}`);
      }
    }
  },

  // 🔥 NIGHT STARTED: AUTO TARGET SELECTION FOR INFO ROLES
  'game-night-started': () => {
    boruOylariYazdir();
    setTimeout(setPlayersLevel, 1000);
    broadcastStatus("In game (Night)");

    if (LV_SETTINGS.AUTO_PLAY && GAME_SETTINGS && GAME_SETTINGS.gameMode === 'custom') {
        setTimeout(() => {
          // 1. Lover protection for werewolves (ASLA DOKUNULMADI)
          if (ROLE && ROLE.team === 'WEREWOLF') {
            const lover = LOVERS.find((v) => getRole(v.role).team !== 'WEREWOLF');
            if (lover) {
              const targetPlayer = PLAYERS.find((v) => v?.id === lover?.id);
              if (targetPlayer) addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`);
              TARGET_WW_VOTE = lover?.id;
              emitNative('game-werewolves-vote-set', JSON.stringify({ targetPlayerId: lover?.id }));
            }
          }
          
          // 2. Automation for Info Roles
          const infoRoles = ['seer', 'aura-seer', 'detective', 'sheriff', 'analyst', 'spirit-seer', 'gambler'];
          if (ROLE && infoRoles.includes(ROLE.id) && !DEADS.includes(PLAYER?.id)) {
              // Find valid targets: Excluding self, deads, and lover
              const validTargets = PLAYERS.filter(p => 
                  p.id !== PLAYER?.id && 
                  !DEADS.includes(p.id) && 
                  !LOVERS.some(l => l.id === p.id)
              );

              if (validTargets.length > 0) {

                // 🔮 SEER & AURA SEER → game-{role}-view-role | { targetPlayerId }
                if (ROLE.id === 'seer' || ROLE.id === 'aura-seer') {
                    const target = validTargets[Math.floor(Math.random() * validTargets.length)];
                    emitNative(`game-${ROLE.id}-view-role`, JSON.stringify({ targetPlayerId: target.id }));

                    let roleTr = ROLE.id === 'seer' ? 'Seer' : 'Aura Seer';
                    PENDING_NIGHT_INFO = `${roleTr} Info: I checked number ${target.gridIdx + 1}.`;
                }

                // 🎲 GAMBLER → game-gambler-selected-player | { targetPlayerId, teamGuess, teamName, teamNameEn }
                else if (ROLE.id === 'gambler') {
                    const target = validTargets[Math.floor(Math.random() * validTargets.length)];
                    emitNative('game-gambler-selected-player', JSON.stringify({
                        targetPlayerId: target.id,
                        teamGuess: "villager",
                        teamName: "Village",
                        teamNameEn: "Village"
                    }));
                    PENDING_NIGHT_INFO = `I am Gambler: I guessed number ${target.gridIdx + 1} as Villager.`;
                }

                // 🕵️ DETECTIVE → game-detective-selected-targets | [id1, id2] (düz array, 2 kişi)
                else if (ROLE.id === 'detective' && validTargets.length >= 2) {
                    const shuffled = validTargets.sort(() => 0.5 - Math.random());
                    const t1 = shuffled[0], t2 = shuffled[1];
                    emitNative('game-detective-selected-targets', JSON.stringify([t1.id, t2.id]));
                    PENDING_NIGHT_INFO = `I am Detective: I checked numbers ${t1.gridIdx + 1} and ${t2.gridIdx + 1}.`;
                }

                // 📊 ANALYST → game-analyst-selected-player | { targetPlayerId }
                else if (ROLE.id === 'analyst') {
                    const target = validTargets[Math.floor(Math.random() * validTargets.length)];
                    emitNative('game-analyst-selected-player', JSON.stringify({ targetPlayerId: target.id }));
                    PENDING_NIGHT_INFO = `Analyst Info: I checked number ${target.gridIdx + 1}.`;
                }

                // 👮 SHERIFF → game-sheriff-oversee | { targetPlayerId }  (array DEĞİL, obj!)
                else if (ROLE.id === 'sheriff') {
                    const target = validTargets[Math.floor(Math.random() * validTargets.length)];
                    emitNative('game-sheriff-oversee', JSON.stringify({ targetPlayerId: target.id }));
                    PENDING_NIGHT_INFO = `Sheriff Info: I checked number ${target.gridIdx + 1}.`;
                }

                // 👻 SPIRIT SEER → game-spirit-seer-selected-targets | { targetPlayerIds: [id] }  (obj içinde array!)
                else if (ROLE.id === 'spirit-seer') {
                    const target = validTargets[Math.floor(Math.random() * validTargets.length)];
                    emitNative('game-spirit-seer-selected-targets', JSON.stringify({ targetPlayerIds: [target.id] }));
                    PENDING_NIGHT_INFO = `Spirit Seer Info: I checked number ${target.gridIdx + 1}.`;
                }

                // 🃏 FORTUNE TELLER → game-fortune-teller-selected-player | { targetPlayerId }
                else if (ROLE.id === 'fortune-teller') {
                    const target = validTargets[Math.floor(Math.random() * validTargets.length)];
                    emitNative('game-fortune-teller-selected-player', JSON.stringify({ targetPlayerId: target.id }));
                    PENDING_NIGHT_INFO = `Fortune Teller Info: I checked number ${target.gridIdx + 1}.`;
                }
            }
          }
        }, gecikmelan(1500));
    }
  },

  // 🔥 CATCHING INFO RESULTS FROM SERVER (Sabah yazılacak mesaja cevabı ekler)


    // 🔮 SEER → data.role = rol ID'si döner
    'game-seer-view-role': (data) => {
        if (data && data.role) {
            const isWolf = ['werewolf','alpha-werewolf','wolf-seer','guardian-wolf',
                            'nightmare-werewolf','shadow-wolf','junior-werewolf',
                            'corruptor','voodoo-werewolf'].includes(data.role);
            PENDING_NIGHT_INFO += isWolf ? ` WOLF! (${data.role})` : ` Villager. (${data.role})`;
        }
    },

    // 🌟 AURA SEER → data.result = "good" / "evil" / "unknown"
    'game-aura-seer-view-role': (data) => {
        if (data && data.result) {
            if (data.result === 'evil')        PENDING_NIGHT_INFO += ` Evil! (Wolf team)`;
            else if (data.result === 'good')   PENDING_NIGHT_INFO += ` Good. (Villager team)`;
            else                               PENDING_NIGHT_INFO += ` Unknown.`;
        }
    },

    // 🕵️ DETECTIVE → data.areTeamsEqual boolean
    'game-detective-result': (data) => {
        if (data && typeof data.areTeamsEqual !== 'undefined') {
            PENDING_NIGHT_INFO += data.areTeamsEqual ? ` Same team!` : ` Different teams.`;
        }
    },

    // 👻 SPIRIT SEER → data.aura = "blue"(good) / "red"(evil)
    // ⚠️ game-spirit-seer-set-state kullan, selected-targets sonuç DEĞİL sadece hedef listesi
    'game-spirit-seer-set-state': (data) => {
        if (data && data.aura) {
            if (data.aura === 'red')        PENDING_NIGHT_INFO += ` Red! (Evil)`;
            else if (data.aura === 'blue')  PENDING_NIGHT_INFO += ` Blue. (Good)`;
            else                            PENDING_NIGHT_INFO += ` Aura: ${data.aura}.`;
        }
    },

    // 👮 SHERIFF → data içinde werewolf/villager bilgisi
    'game-sheriff-oversee-result': (data) => {
        if (data) {
            const isWolf = data.isWerewolf || data.result === 'werewolf';
            PENDING_NIGHT_INFO += isWolf ? ` WOLF!` : ` Not wolf.`;
        }
    },

    // 📊 ANALYST → set-state gelir, içinde bilgi var
    'game-analyst-set-state': (data) => {
        if (data) PENDING_NIGHT_INFO += ` Analyst result received.`;
    },

    // 🃏 FORTUNE TELLER → data = { playerId: roleId } map döner
    'game-fortune-teller-card-was-used': (data) => {
        if (data) {
            const roles = Object.values(data);
            const hasWolf = roles.some(r => ['werewolf','alpha-werewolf','shadow-wolf',
                                            'nightmare-werewolf','corruptor'].includes(r));
            PENDING_NIGHT_INFO += hasWolf ? ` WOLF found!` : ` No wolf found.`;
        }
    },

    // 🎲 GAMBLER → guessedWrong varsa yanlış tahmin (Wolf çıktı), yoksa doğru (Villager çıktı)
    'game-gambler-set-state': (data) => {
        if (data) {
            if (data.guessedWrong) {
                // guessedWrong = yanlış tahmin edilen oyuncunun ID'si (Wolf çıktı)
                PENDING_NIGHT_INFO += ` Wrong! That was a Wolf. (villageGuessRemaining: ${data.villageGuessRemaining})`;
            } else {
                // guessedWrong yok = doğru tahmin (Villager çıktı)
                PENDING_NIGHT_INFO += ` Correct! That was a Villager. (villageGuessRemaining: ${data.villageGuessRemaining})`;
            }
        }
    },
  
  // 🔥 MORNING HAS COME: WRITE INFO TO VILLAGE WHEN VOTING STARTS
  'game-day-voting-started': () => {
    if (LV_SETTINGS.AUTO_PLAY && GAME_SETTINGS && GAME_SETTINGS.gameMode === 'custom') {
        if (!PLAYER) getPLAYER();
        if (PLAYER && !DEADS.includes(PLAYER?.id)) {
          
          // 1. Send Info Role data to Chat (If any)
          if (PENDING_NIGHT_INFO !== "") {
              setTimeout(() => {
                  emitNative('game:chat-public:msg', JSON.stringify({ msg: PENDING_NIGHT_INFO, pId: generatePid() }));
                  PENDING_NIGHT_INFO = ""; // Clear memory after sending so it doesn't repeat every day
              }, gecikmelan(1000));
          }

          // 🔥 MAYOR (Belediye Başkanı) OTOMATİK ROL AÇMA
          if (ROLE && ROLE.id === 'mayor') {
              setTimeout(() => {
                  emitNative('mayor-reveal-role', "{}"); // Hedef gerekmediği için boş obje gönderilir
                  addChatMsg(`🎩 Belediye Başkanı (Mayor) olarak kimlik açıklandı!`, true, "color: gold;");
              }, gecikmelan(1000));
          }
          // 2. Standard Morning Actions For Other Roles
          const wwLover = LOVERS.find((v) => getRole(v.role).team === 'WEREWOLF');
          if (wwLover) {
              if (ROLE && ROLE.id === 'priest') {
                  const targets = PLAYERS.filter(p =>
                      p.id !== PLAYER.id && !DEADS.includes(p.id) && !LOVERS.some(l => l.id === p.id)
                  );
                  if (targets.length > 0) {
                      const randomTarget = targets[Math.floor(Math.random() * targets.length)];
                      setTimeout(() => {
                          addChatMsg(`💦 CHAOS STRIKE: ${parseInt(randomTarget.gridIdx) + 1}. ${randomTarget.username}`, true, "color: cyan;");
                          emitNative('game-priest-kill-player', JSON.stringify({ targetPlayerId: randomTarget.id }));
                      }, gecikmelan(3000));
                  }
                  return;
              }
              if (ROLE && ROLE.team === 'WEREWOLF') {
                  setTimeout(() => emitNative('game:chat-public:msg', JSON.stringify({ msg: 'wc', pId: generatePid() })), gecikmelan(500));
              }
              emitNative('game-day-vote-set', JSON.stringify({ targetPlayerId: wwLover?.id }));
          } else {
              if (ROLE && ROLE.team === 'WEREWOLF') {
                  setTimeout(() => emitNative('game:chat-public:msg', JSON.stringify({ msg: 'me', pId: generatePid() })), gecikmelan(500));
              } else if (ROLE && ['serial-killer','arsonist','corruptor','bandit','cannibal','evil-detective','bomber','alchemist','siren','illusionist','blight','sect-leader','zombie'].includes(ROLE.id)) {
                  setTimeout(() => emitNative('game:chat-public:msg', JSON.stringify({ msg: 'solo', pId: generatePid() })), gecikmelan(500));
              }
          }
        }
    }
  },

  'game-werewolves-set-roles': (data) => {
    WOLVES = Object.entries(data.werewolves).map(([id, role]) => ({ id, role }));
    if (
      LV_SETTINGS.AUTO_PLAY && GAME_SETTINGS && GAME_SETTINGS.gameMode === 'custom' &&
      !CHAT_WW_SENDED && LOVERS?.length && WOLVES?.length &&
      ROLE && ROLE.team === 'WEREWOLF' && ROLE?.id === 'junior-werewolf' &&
      LOVERS.find((v) => getRole(v.role).team !== 'WEREWOLF')
    ) {
      CHAT_WW_SENDED = true;
      setTimeout(() => emitNative('game:chat-werewolves:msg', JSON.stringify({ msg: `Who?`, pId: generatePid() })), gecikmelan(2000));
    }
  },
  'game:chat-werewolves:msg': (data) => {
    if (LV_SETTINGS.AUTO_PLAY && GAME_SETTINGS && GAME_SETTINGS.gameMode === 'custom') {
        if (ROLE && ROLE.team === 'WEREWOLF' && data.authorId !== PLAYER?.id && data.msg && data.msg.toLowerCase().includes('who')) {
          const lover = PLAYERS.find((v) => v?.id === LOVERS[0]?.id);
          if (lover) {
            setTimeout(() => emitNative('game:chat-werewolves:msg', JSON.stringify({ msg: `${lover.gridIdx + 1}`, pId: generatePid() })), gecikmelan(1000));
          }
        }
        if (ROLE && ROLE?.id === 'junior-werewolf' && data.msg && data.authorId !== PLAYER?.id) {
          const numbers = data.msg.match(/\d+/);
          if (numbers && numbers?.length) {
            const gridIdx = parseInt(numbers[0]);
            const targetPlayer = PLAYERS.find((v) => v.gridIdx + 1 === gridIdx);
            if (targetPlayer) {
              JW_TARGET = targetPlayer.id;
              addChatMsg(`🐾 Select ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`);
              emitNative('game-junior-werewolf-selected-player', JSON.stringify({ targetPlayerId: targetPlayer.id }));
            }
          }
        }
    }
  },
  'game-werewolves-vote-set': (data) => {
    if (!LV_SETTINGS.AUTO_PLAY || (GAME_SETTINGS && GAME_SETTINGS.gameMode !== 'custom')) return;
    if (data.playerId === PLAYER?.id) return;

    if (!JW_TARGET && ROLE && ROLE?.id === 'junior-werewolf' && data.playerId !== PLAYER?.id) {
      JW_TARGET = data.targetPlayerId;
      const targetPlayer = PLAYERS.find((v) => v?.id === data.targetPlayerId);
      if (targetPlayer) addChatMsg(`🐾 Select ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`);
      emitNative('game-junior-werewolf-selected-player', JSON.stringify({ targetPlayerId: data.targetPlayerId }));
    }

    if (ROLE && ROLE?.id !== 'junior-werewolf' && WOLVES.find((v) => v.role === 'junior-werewolf' && v?.id === data.playerId)) {
      const targetPlayer = PLAYERS.find((v) => v?.id === data.targetPlayerId);
      setTimeout(() => {
        if (targetPlayer) addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`);
        if (TARGET_WW_VOTE !== data.targetPlayerId) {
          TARGET_WW_VOTE = data.targetPlayerId;
          emitNative('game-werewolves-vote-set', JSON.stringify({ targetPlayerId: data.targetPlayerId }));
        }
      }, gecikmelan(1000));
    } else if (
      ROLE && ROLE?.id !== 'junior-werewolf' &&
      !WOLVES.find((v) => v.role === 'junior-werewolf' && v?.id === data.playerId) &&
      LOVERS.find((v) => ['priest', 'vigilante', 'gunner'].includes(v.role))
    ) {
      const targetPlayer = PLAYERS.find((v) => v?.id === data.targetPlayerId);
      setTimeout(() => {
        if (targetPlayer) addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`);
        if (TARGET_WW_VOTE !== data.targetPlayerId) {
          TARGET_WW_VOTE = data.targetPlayerId;
          emitNative('game-werewolves-vote-set', JSON.stringify({ targetPlayerId: data.targetPlayerId }));
        }
      }, gecikmelan(1000));
    }
  },
  'game:chat-public:msg': (data) => {
    if (LV_SETTINGS.AUTO_PLAY && GAME_SETTINGS && GAME_SETTINGS.gameMode === 'custom') {
        if (!PLAYER) getPLAYER();
        if (
          PLAYER && !DEADS.includes(PLAYER?.id) &&
          data.authorId !== PLAYER?.id && data.msg &&
          ROLE && ROLE.team !== 'WEREWOLF' &&
          ['Me', 'me', 'ME', 'm', 'M', 'wc', 'Wc', 'WC'].includes(data.msg)
        ) {
          const targetPlayer = PLAYERS.find((v) => v?.id === data.authorId);
          if (targetPlayer) {
            emitNative('game-day-vote-set', JSON.stringify({ targetPlayerId: targetPlayer.id }));
            addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`);
          }
        }
    }
  },
  'game-day-vote-set': (data) => {
    if (data && data.playerId) {
        DAY_VOTING[data.playerId] = data.targetPlayerId || "skip";
    }

    if (!LV_SETTINGS.AUTO_PLAY || (GAME_SETTINGS && GAME_SETTINGS.gameMode !== 'custom')) return;

    let votedPlayer = "";
    if (!PLAYER) getPLAYER();
    if (PLAYER && !DEADS.includes(PLAYER?.id)) {
      const targetPlayer = PLAYERS.find((v) => v?.id === data.targetPlayerId);
      const voter = PLAYERS.find((v) => v?.id === data.playerId);

      if (ROLE && ROLE?.id === 'priest') {
        setTimeout(() => {
          if (targetPlayer) addChatMsg(`💦 Kill ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`);
          emitNative('game-priest-kill-player', JSON.stringify({ targetPlayerId: data.targetPlayerId }));
        }, gecikmelan(1000));
      } else if (ROLE && ROLE.id === 'vigilante') {
        setTimeout(() => {
          if (targetPlayer) addChatMsg(`🔫 Kill ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`);
          emitNative('game-vigilante-shoot', JSON.stringify({ targetPlayerId: data.targetPlayerId }));
        }, gecikmelan(1000));
      } else if (ROLE && ROLE?.id === 'gunner') {
        setTimeout(() => {
          if (targetPlayer) addChatMsg(`🔫 Kill ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`);
          emitNative('game-gunner-shoot-player', JSON.stringify({ targetPlayerId: data.targetPlayerId }));
        }, gecikmelan(1000));
      } else if (ROLE) {
        if (voter?.id !== PLAYER.id && targetPlayer?.id !== PLAYER.id) {
          if (votedPlayer !== targetPlayer?.id) {
            emitNative('game-day-vote-set', JSON.stringify({ targetPlayerId: targetPlayer.id }));
            votedPlayer = targetPlayer.id;
          }
        }
      }
    }
  },
  'game-players-killed': (data) => {
    data['victims'].forEach((victim) => {
      const player = PLAYERS.find((v) => v?.id === victim.targetPlayerId);
      if (player) {
        if (!DEADS.includes(player.id)) DEADS.push(player.id);
        addChatMsg(`☠️ ${parseInt(player.gridIdx) + 1}. ${player.username} (${victim.targetPlayerRole}) by ${victim.cause}`);
      }
    });
  },
  'game-reconnect-set-players': (data) => {
    PLAYERS = Object.values(data);
    PLAYERS.forEach((player) => {
      if (!player.isAlive && !DEADS.includes(player.id)) DEADS.push(player.id);
    });
    setTimeout(setPlayersLevel, 1000);
    setTimeout(handlePlayerAura, 1000);
    setTimeout(handlePlayerNotes, 1000);
    if (PLAYER) {
      const tmp = PLAYERS.find((v) => v.username === PLAYER.username);
      if (tmp) {
        if (tmp.spectate) {
          addChatMsg(`You are Spectator`, true, 'color: #FF4081;');
        } else {
          setRole(tmp.role);
          addChatMsg(`You are ${ROLE.name} (${ROLE?.id})`, true, 'color: #FF4081;');
        }
      }
    }
  },
  'game-reconnect-set-game-status': (data) => { },
  'players-and-equipped-items': (data) => {
    if (GAME_STATUS === 'started') {
      PLAYERS = data.players;
      setTimeout(setPlayersLevel, 1000);
      setTimeout(handlePlayerAura, 1000);
      setTimeout(handlePlayerNotes, 1000);
    }
  },
  'player-joined-and-equipped-items': (data) => { },
  'game-set-game-status': (data) => { },
  'game-game-over': () => {
    if (GAME_STATUS === 'over') return;
    GAME_STATUS = 'over';
    let tmp = `🏁 Game over`;
    if (GAME_STARTED_AT) {
      tmp += ` (${((new Date().getTime() - GAME_STARTED_AT) / 1000).toFixed(0)}s)`;
    }
    addChatMsg(tmp);
    broadcastStatus("Game Over / Lobby");
  },
 'game-over-awards-available': (data) => {
    DAY_COUNT = 0; DAY_VOTING = {}; GAME_VOTING = "";

    let isWin = false;
    if (ROLE && ROLE.team === 'VILLAGER') isWin = true;
    const matchResult = isWin ? "Win" : "Loss";

    if (data.playerAward.canClaimDoubleXp) {
      emitNative('game-over-double-xp', "{}");
      addChatMsg('Claim double xp', true, 'color:rgb(17, 255, 0);');
    } else {
      TOTAL_XP_SESSION += data.playerAward.awardedTotalXp;
      addChatMsg(`🧪 ${data.playerAward.awardedTotalXp} xp`);
      if (data.playerAward.awardedLevels) {
        PLAYER.level += data.playerAward.awardedLevels;
        TOTAL_UP_LEVEL += data.playerAward.awardedLevels;
        log(`🆙 ${PLAYER.level}`);
      }
      
      // 🔥 VERİ AKIŞI (ANALYZER) BURADA TETİKLENİR
      if (LV_SETTINGS.TELEMETRY_ACTIVE) {
          const duration = GAME_STARTED_AT > 0 ? Math.round((new Date().getTime() - GAME_STARTED_AT) / 1000) : 0;
          const currentRole = ROLE ? ROLE.id : "Unknown";
          
          // data.playerAward nesnesinde kazanılan gümüşü "awardedTotalGold" vb. yakalayabilirsen buraya yaz,
          // bulamazsan 0 göndeririz.
          let kazanilanAltin = data.playerAward.silver || 0; 

          const borudata = buildBoruPayload(
              data.playerAward.awardedTotalXp, 
              PLAYER.level, 
              currentRole, 
              matchResult, 
              kazanilanAltin, 
              duration
          );
          
          sendToAnalyzer(borudata);
          GAME_STARTED_AT = 0;
      }
    }
  },
  disconnect: () => {
    clearTimeout(LOBBY_TIMEOUT_TIMER);
    ROLE = undefined;
    PLAYERS = [];
    GAME_ID = undefined;
    SERVER_URL = undefined;
    GAME_SETTINGS = undefined;
    LOVERS = [];
    DEADS = [];
    WOLVES = [];
  },
};

const messageDispatcher = (message) => {
  const msg = message[0]
  const data = message.length > 1 ? message[1] : null
  const method = messagesToCatch[msg]
  !!method && method(data)
}
 
function setPlayersLevel() {
  if (!LV_SETTINGS.SHOW_HIDDEN_LVL) return
  PLAYERS.forEach((player) => {
    const gridIdx = parseInt(player.gridIdx) + 1
    const username = player.username
    const str = `${gridIdx} ${username}`
    const level = player.level
    let clanTag = ''
    if (player.clanTag) clanTag = `${player.clanTag}`
    
    // Sondaki gereksiz boşlukları silmek için trim() ekledik
    let newUsername = `${gridIdx} ${username} [${level}] ${clanTag}`.trim()
    
    const els = $(`div:contains("${str}")`)
    if (els.length > 0) {
      const target = $(els[els.length - 1])
      const txt = target.text().trim()
      
      // 🔥 CHAT KORUMASI: Eğer bu div'in içindeki yazı sadece adamın isminden 
      // ibaretse (veya max 5-6 harf uzunsa) değiştir. Chat cümlesiyse ES GEÇ!
      if (txt.startsWith(str) && txt.length <= newUsername.length + 4) {
        target.html(newUsername)
        target.addClass('lv-username')
        target.parent().addClass('lv-username-box')
      }
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
  
  const closeAllModals = () => {
      $('.lv-modal-popup-container').hide();
      $('.lv-modal-perk-container').hide();
      $('.lv-modal-voting-container').hide();
      $('.lv-modal-recent-players-container').hide();
  };


// 1. Ayarlar İkonu
  $('.lv-chat-settings').on('click', () => {
    closeAllModals(); 
    $('.lv-modal-popup-container').show(); 
  })

  
  $('.lv-perk-settings').on('click', () => {
    closeAllModals(); 
    $('.lv-modal-perk-container').show(); 
  })

  
  $('.lv-last-players-btn').on('click', () => {
      closeAllModals(); 
      $('.lv-modal-recent-players-container').show(); 

      
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
  // 🔥 MESAJ SINIRLAMASI (MAX 40) 🔥
    if (HISTORY.length > 40) {
        HISTORY.shift(); // Hafızadaki (array) en eski mesajı sil
        $('.lv-chat-container .lv-chat-msg').first().remove(); // Ekrandaki (DOM) en eski mesajı sil
    }
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
    // 🔥 Garanti olsun diye basmadan önce son 40'ı alıyoruz
            if (HISTORY.length > 40) {
                HISTORY = HISTORY.slice(-40);
            }
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
            <span>Share data for Analyzer And Controler Application <strong class="lv-new" style="margin-left:5px;">NEW 🔥</strong></span>
          </div>
        </div>

        <div class="lv-modal-section">
          <div class="lv-modal-subtitle">General</div>
          
          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 4px;">
            <div class="lv-modal-checkbox debug lv-icon" style="width: 24px; text-align: center; margin-right: 12px;"></div>
            <span>Debug mode</span>
          </div>

          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 6px;">
              <div class="lv-modal-checkbox lobby-quit-active lv-icon" style="width: 24px; text-align: center; margin-right: 12px; color: #ff4081;"></div>
              <span style="width: 190px; display: inline-block;">Lobby Waiting Limit (saniye):</span>
              <input type="number" class="lv-modal-lobby-quit-input" placeholder="30" min="1" 
                  style="width: 60px; background: #202020; color: #ff4081; border: 1px solid #414243; border-radius: 4px; padding: 2px 4px; text-align: center; outline: none; font-weight: bold;">
              <span style="font-size: 10px; color: #888; margin-left: 6px;">(0=Kapalı)</span>
              <strong class="lv-new" style="margin-left: 8px; font-size: 10px; color: #ff4081;">NEW 🔥</strong>
          </div>

          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 4px;">
             <div class="lv-icon" style="width: 24px; text-align: center; margin-right: 12px;"></div>
             <span style="width: 190px; display: inline-block;">Auto Refresh (Dakika):</span>
             <input type="number" class="lv-modal-auto-refresh" placeholder="0" min="0" 
                style="width: 60px; background: #202020; color: #fafafa; border: 1px solid #414243; border-radius: 4px; padding: 2px 4px; outline: none; text-align: center; font-weight: bold;">
             <span style="font-size: 10px; color: #888; margin-left: 6px;">(0=Kapalı)</span>
             <strong class="lv-new" style="margin-left: 8px; font-size: 10px;">NEW 🔥</strong>
          </div>

          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 4px;">
             <div class="lv-icon" style="width: 24px; text-align: center; margin-right: 12px;">⏳</div>
             <span style="width: 190px; display: inline-block;">Waiting Timeout (Saniye):</span>
             <input type="number" class="lv-modal-waiting-timeout" placeholder="0" min="0" 
                style="width: 60px; background: #202020; color: #fafafa; border: 1px solid #414243; border-radius: 4px; padding: 2px 4px; outline: none; text-align: center; font-weight: bold;">
             <span style="font-size: 10px; color: #888; margin-left: 6px;">(0=Kapalı)</span>
             <strong class="lv-new" style="margin-left: 8px; font-size: 10px;">NEW 🔥</strong>
          </div>

          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 4px;">
             <div class="lv-icon" style="width: 24px; text-align: center; margin-right: 12px;">#️⃣</div>
             <span style="width: 190px; display: inline-block;">Börü Tag (#):</span>
             <input type="text" class="lv-modal-p2p-code" placeholder="0000" maxlength="4"
               style="width: 70px; background: #202020; color: #00FF00; border: 1px solid #414243; border-radius: 4px; padding: 2px 4px; font-size: 13px; font-weight:bold; text-align:center; box-sizing: border-box; outline: none;">
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
          <div class="lv-modal-option" style="margin-left: 30px; margin-bottom: 8px;">
              <input type="text" class="lv-modal-join-password-input" placeholder="Room Password (Varsa Oda Şifresi)" 
                style="background: #202020; color: #ffc300; border: 1px solid #ffc300; border-radius: 4px; padding: 4px; width: 92%; font-size: 12px; font-weight: bold;">
          </div>

          <div class="lv-modal-option" style="display: flex; align-items: center; margin-bottom: 6px;">
            <div class="lv-icon" style="width: 24px; text-align: center; margin-right: 6px; color:#ffc300;">🪑</div>
            <span style="margin-right: 10px;">Auto Pick Slot (1-16):</span>
            <input type="number" class="lv-modal-auto-slot-input" placeholder="0" min="0" max="16" 
                style="background: #202020; color: #ffc300; border: 1px solid #ffc300; border-radius: 4px; padding: 2px 4px; width: 40px; text-align: center; font-size: 13px; font-weight: bold; outline: none;">
            <span style="font-size: 10px; color: #888; margin-left: 5px;">(0 = Kapalı)</span>
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
            <div class="lv-modal-command" style="margin-bottom: 6px;">
            <button class="lv-modal-loot-shortcuts-set" style="padding: 2px 6px;">Set Shortcuts(kısayolları ayarla)</button>
            <span class="lv-modal-loot-shortcuts-status" style="font-style: italic;"></span>
          </div>
          <div class="lv-modal-command" style="margin-top: 10px; border-top: 1px solid #333; padding-top: 10px;">
            <button class="lv-modal-bug-report-trigger" style="padding: 6px 12px; background-color: #fb2e00; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%; font-weight: bold; font-size: 13px;">🐞 Bug / Öneri Bildir</button>
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
const lvModalSetShortcuts = `
  <div class="lv-modal-shortcuts-container" style="display: none; position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); flex-direction: column; gap: 15px; padding: 25px; background-color: #1e1e1e; color: #ffffff; border: 1px solid #4CAF50; border-radius: 10px; width: 340px; font-family: sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.8); z-index: 999999;">
    
    <div class="lv-icon lv-modal-shortcuts-close" style="position: absolute; top: 10px; right: 15px; font-size: 18px; cursor: pointer; color: #aaa; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#aaa'"></div>

    <div style="text-align: center; margin-bottom: 5px;">
      <h2 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;">
        CTRL + ALT + <span style="color: #4CAF50;">TUŞ</span>
      </h2>
    </div>

    <div style="background-color: rgba(255, 165, 0, 0.15); border-left: 4px solid orange; padding: 10px; border-radius: 4px; font-size: 12px; color: #e0e0e0; line-height: 1.4; text-align: left;">
      <strong style="color: orange;">⚠️ Çakışma Uyarısı:</strong> Tarayıcı, oyun veya diğer kısayollarınla aynı harfi seçmemeye özen göster. Bir tuş çalışmazsa veya sapıtırsa buradan farklı bir harf ile değiştir!
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #333;">
      <label style="font-weight: bold; font-size: 15px;">JOIN</label>
      <input type="text" class="lv-shortcut-input" data-action="JOIN" id="shortcut-join" maxlength="1" oninput="this.value = this.value.replace(/[^A-Za-z]/g, '').toUpperCase();" style="width: 45px; height: 45px; text-align: center; font-size: 20px; font-weight: bold; background-color: #2b2b2b; color: #4CAF50; border: 2px solid #444; border-radius: 6px; outline: none;">
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #333;">
      <label style="font-weight: bold; font-size: 15px;">REPLAY</label>
      <input type="text" class="lv-shortcut-input" data-action="REPLAY" id="shortcut-replay" maxlength="1" oninput="this.value = this.value.replace(/[^A-Za-z]/g, '').toUpperCase();" style="width: 45px; height: 45px; text-align: center; font-size: 20px; font-weight: bold; background-color: #2b2b2b; color: #4CAF50; border: 2px solid #444; border-radius: 6px; outline: none;">
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #333;">
      <label style="font-weight: bold; font-size: 15px;">AUTO PLAY</label>
      <input type="text" class="lv-shortcut-input" data-action="AUTO_PLAY" id="shortcut-autoplay" maxlength="1" oninput="this.value = this.value.replace(/[^A-Za-z]/g, '').toUpperCase();" style="width: 45px; height: 45px; text-align: center; font-size: 20px; font-weight: bold; background-color: #2b2b2b; color: #4CAF50; border: 2px solid #444; border-radius: 6px; outline: none;">
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #333;">
      <label style="font-weight: bold; font-size: 15px;">CREATE</label>
      <input type="text" class="lv-shortcut-input" data-action="CREATE" id="shortcut-create" maxlength="1" oninput="this.value = this.value.replace(/[^A-Za-z]/g, '').toUpperCase();" style="width: 45px; height: 45px; text-align: center; font-size: 20px; font-weight: bold; background-color: #2b2b2b; color: #4CAF50; border: 2px solid #444; border-radius: 6px; outline: none;">
    </div>
  </div>
`;


const boruBugModal = `
  <div id="boru-bug-modal" style="display: none; position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); flex-direction: column; gap: 15px; padding: 25px; background-color: #1e1e1e; color: #ffffff; border: 1px solid #fb2e00; border-radius: 10px; width: 400px; box-shadow: 0 4px 20px rgba(0,0,0,0.8); z-index: 999999;">
    
    <div class="lv-icon" id="boru-bug-close" style="position: absolute; top: 10px; right: 15px; font-size: 18px; cursor: pointer; color: #aaa; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#aaa'"></div>
    
    <h3 style="margin: 0; color: #fb2e00; font-size: 18px;">🐞 Bug / 💡 Öneri Bildir</h3>
    
    <p style="font-size: 11px; color: #aaa; margin: 0; line-height: 1.4;">
      Karşılaştığın hatayı veya eklenmesini istediğin özelliği yaz. 
      <br><span style="color: #ffc300;">(Not: Sorunu çözebilmemiz için tarayıcı sürümün, ID'n ve bot ayarların otomatik olarak eklenecektir.)</span>
    </p>

    <select id="bug-type-select" style="background: #2b2b2b; color: #fff; border: 1px solid #444; padding: 8px; border-radius: 6px; outline: none; font-size: 13px;">
        <option value="BUG">🐞 Hata (Bug) Bildirimi</option>
        <option value="ONERI">💡 Yeni Özellik / Öneri</option>
    </select>

    <textarea id="bug-report-text" rows="4" placeholder="Detayları buraya yazın..." style="background: #2b2b2b; color: #fff; border: 1px solid #444; padding: 10px; border-radius: 6px; outline: none; resize: none; font-family: inherit; font-size: 13px;"></textarea>
    
    <button id="bug-submit-btn" style="background: #fb2e00; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: opacity 0.2s;">GÖNDER</button>
    
    <div id="bug-status-msg" style="font-size: 12px; text-align: center; height: 15px;"></div>
  </div>
`;

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
  /* SAYI KUTULARINDAKİ OKLARI (SPINNER) GİZLEME VE ORTALAMA */
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
  }
  input[type=number] {
      -moz-appearance: textfield;
  }
  
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
    /* --- BÖRÜ LIGHTBOX (Tam Ekran Resim) --- */
.boru-lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9); /* Arka planı karart */
    z-index: 9999999;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: auto; /* 🔥 İŞTE BU: Resim büyükse kaydırmaya izin ver */
    cursor: zoom-out; /* Kapatmak için tıkla imleci */
}

/* Resmin Normal Hali (Ekrana Sığmış) */
.boru-lightbox img {
    max-width: 95vw; /* Ekranın %95'ini kapla */
    max-height: 95vh;
    box-shadow: 0 0 20px rgba(0,0,0,0.8);
    border: 2px solid #fb2e00;
    border-radius: 4px;
    cursor: zoom-in; /* Büyütmek için tıkla imleci */
    transition: all 0.2s ease-in-out;
}

/* Resmin Büyütülmüş Hali (Gezilebilir Mod) */
.boru-lightbox img.zoomed {
    max-width: none !important; /* Sınırları kaldır */
    max-height: none !important;
    transform: scale(1.5); /* %150 Büyüt (İstersen 2.0 yap) */
    margin: 50px; /* Kenarlara yapışmasın diye boşluk */
    cursor: zoom-out;
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

                         <label for="boru-video-upload" title="Video Gönder (Max 10MB)" style="background:#444; border:1px solid #555; color:white; padding:4px 8px; cursor:pointer; display:flex; align-items:center; justify-content:center; border-radius:2px; margin-left:2px;">
                                    🎥
                                </label>
                                <input type="file" id="boru-video-upload" accept="video/*" style="display:none;">
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
      <div id="vs-resize-handle">◢</div>
    </div>
  </div>
`;

// --- BÖRÜ BUG & ÖNERİ GÖNDERİCİ (FIREBASE - KATEGORİLİ) ---
const sendBoruFeedback = async (type, userMessage) => {
    
    
    const rawUsername = PLAYER ? PLAYER.username : "Bilinmiyor";
    const safeUsername = rawUsername.replace(/[.#$\[\]]/g, '_'); 

    
    
    const url = `https://boru-data-center-default-rtdb.europe-west1.firebasedatabase.app/GeriBildirimler/${type}/${safeUsername}.json`;

    
    const payload = {
        mesaj: userMessage,
        kullanici_id: PLAYER ? PLAYER.id : "Bilinmiyor",
        bot_surumu: BOT_VERSION,
        oyun_id: GAME_ID || "Oyun Disi (Lobi)",
        tarayici_bilgisi: navigator.userAgent, 
        aktif_ayarlar: LV_SETTINGS, 
        zaman: new Date().toLocaleString('tr-TR')
    };

    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return true;
    } catch (e) {
        console.error("[Börü] Bildirim gönderilemedi:", e);
        return false;
    }
};

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

let PAGE_LOAD_TIME = Date.now(); 

setInterval(() => {
    
    if (!LV_SETTINGS.AUTO_REFRESH_INTERVAL || LV_SETTINGS.AUTO_REFRESH_INTERVAL === 0) {
        return;
    }

    
    let updateFarkiMs = Date.now() - PAGE_LOAD_TIME;
    let gecenDakika = updateFarkiMs / 60000;

    
    if (gecenDakika >= LV_SETTINGS.AUTO_REFRESH_INTERVAL) {
        
        
        if (GAME_STATUS === 'started') {
            console.log(`[Börü] Süre doldu ama oyun var. Yenileme erteleniyor...`);
            
        } 
        else {
            console.log(`[Börü] Süre doldu (${LV_SETTINGS.AUTO_REFRESH_INTERVAL} dk). Yenileniyor...`);
            saveSetting(); 
            setTimeout(() => {
            window.location.reload();}, 3500); 
        }
    }
}, 10000); 
// --- MASKOT EKLEME BLOĞU ---
const addMascot = () => {
    
    
    
    const extensionOrigin = new URL(scriptTag.src).origin; 
    const imgUrl = `${extensionOrigin}/icons/borubebek.png`;

    const img = document.createElement('img');
    img.src = imgUrl; 
    img.alt = 'Börü Bebek';
    img.className = 'lv-mascot';

    
    document.body.appendChild(img);

    
    const style = document.createElement('style');
    style.innerHTML = `
        .lv-mascot {
            position: fixed;
            bottom: 0px;      /* En alta yapışık olsun */
            right: 0px;       /* En sağa yapışık olsun */
            width: 100px;     /* Boyutu buradan ayarla */
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

    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F9') {
            $('html').toggleClass('lv-panic-mode'); 
            
            
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

    
    
    const timeNow = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    
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
                color: 5763719, 
                fields: [{
                    name: "👤 Kullanıcı",
                    value: playerData.username,
                    inline: true
                }, {
                    name: "📊 Level",
                    value: playerData.level.toString(),
                    inline: true
                }, {
                    name: "🛡️ Klan", 
                    value: clanName,
                    inline: true
                }, {
                    name: "⚙️ Sürüm",
                    value: `v${BOT_VERSION}`,
                    inline: true
                }, {
                    name: "🕒 Tarih", 
                    value: timeNow,
                    inline: false
                }],
                footer: {
                    text: `User ID: ${playerData.id}`
                },
                timestamp: new Date().toISOString() 
            }]
        })
    }).then(() => {
        HAS_SENT_LOGIN_LOG = true;
        console.log(`[Börü] Login logu gönderildi. Klan: ${clanName}`);
    }).catch(e => console.error("Log hatası:", e));
};

const checkuserwhitelist = async (retryCount = 0) => {
    // 1. Oyuncu verisi (İsim ve ID) oyun tarafından çekilene kadar bekle
    if (!PLAYER || !PLAYER.id) {
        if (retryCount < 15) {
            setTimeout(() => checkuserwhitelist(retryCount + 1), 1000);
        }
        return;
    }

    try {
        if (retryCount === 0) addChatMsg("⏳ VarietyShop Lisans Sistemi doğrulanıyor...", false, "color: gray;");

        // 🔥 BÖRÜ: OYUNCUNUN KLAN ID'SİNİ OYUNDAN ÇEK
        let currentClanId = "";
        try {
            const clanRes = await fetch('https://core.api-wolvesville.com/clans/myClan', {
                method: 'GET',
                headers: getHeaders()
            });
            if (clanRes.ok) {
                const clanData = await clanRes.json();
                if (clanData.clan && clanData.clan.id) {
                    currentClanId = clanData.clan.id; 
                }
            }
        } catch (e) { console.log("Klan bilgisi çekilemedi."); }

        // 2. Karargah API adresine POST isteği atıyoruz
        const response = await fetch("https://api.varietyshop.com.tr/api/auth/boru/validate", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Username: PLAYER.username,
                PlayerId: PLAYER.id,
                ClanId: currentClanId // SADECE KLAN ID GİDİYOR
            })
        });

        // 3. Bağlantı hatası kontrolü
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            shutdownBot(errorData.message || `Sunucu hatası: ${response.status}`);
            return;
        }

        // 4. API'den gelen veriyi işle
        const data = await response.json();

        if (data.isValid) {
            // 🔥 DÜZELTME: Sınırsız lisanslarda (null) 1970 bug'ını engelliyoruz 🔥
            let sureYazisi = "Sınırsız / Ömür Boyu";
            
            if (data.expireDate) {
                const expireDate = new Date(data.expireDate);
                const today = new Date();
                const diffTime = expireDate - today; 
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                sureYazisi = `${diffDays} Gün (${expireDate.toLocaleDateString('tr-TR')})`;
            }

            addChatMsg(`✅ GİRİŞ BAŞARILI: [${data.plan || "Premium"}]`, true, "color: #00FF00;");
            addChatMsg(`📅 Kalan Süre: ${sureYazisi}`, false, "color: #ADFF2F;");
            console.log("VarietyShop: Lisans başarıyla doğrulandı. Klan ID: " + (currentClanId || "Yok"));
        } else {
            // Lisans geçersizse veya süresi dolmuşsa
            addChatMsg(`⛔ YETKİSİZ ERİŞİM: ${PLAYER.username}`, true, "color: #FF0000;");
            shutdownBot(data.message || "Abonelik onaylanmadı.");
        }

    } catch (e) {
        console.error("Börü API Hatası:", e);
        if (retryCount < 2) {
            setTimeout(() => checkuserwhitelist(retryCount + 1), 2000);
        } else {
            shutdownBot("Sunucuya bağlanılamadı. API'nin açık olduğundan emin olun.");
        }
    }
};
// --- BOTU KAPATMA / ENGELLEME FONKSİYONU ---
const shutdownBot = (reason) => {
    console.error(`⛔ BOT DURDURULDU: ${reason}`);
    
    
    alert(`⛔ ERİŞİM REDDEDİLDİ ⛔\n\nSebep: ${reason}\n\nBot güvenlik nedeniyle devre dışı bırakılıyor.`);

    
    LV_SETTINGS.AUTO_PLAY = false;
    LV_SETTINGS.AUTO_REPLAY = false;
    LV_SETTINGS.AUTO_JOIN_ROOMS = false;
    LV_SETTINGS.CHAT_STATS = false;
    
    
    // Native socket'i kapat
if (NATIVE_SOCKET && NATIVE_SOCKET.readyState === 1) {
    NATIVE_SOCKET.close();
    NATIVE_SOCKET = null;
}

    
    
    
    
    let highestIntervalId = setInterval(";");
    for (let i = 0; i < highestIntervalId; i++) {
        clearInterval(i);
        clearTimeout(i);
    }

    
    $('.lv-chat').remove(); 
    $('.lv-mascot').remove(); 
    $('.lv-modal-popup-container').remove(); 
    $('.lv-modal-perk-container').remove(); 
    $('.lv-modal-voting-container').remove(); 
    $('.lv-modal-recent-players-container').remove(); 
    $('.lv-username-box').removeClass('lv-username-box'); 

    
    
    
    
    throw new Error("ERİŞİM ENGELLENDİ: Whitelist onayı yok.");
}

// ============================================================
// 🔥 BÖRÜ KARARGAH TELSİZİ (MAUI WEBSOCKET İSTEMCİSİ) 🔥
// ============================================================
var KARARGAH_SOCKET = null;

const baslatKarargahTelsizi = () => {
    // 1. KONTROL: Telemetry (Veri Akışı) kapalıysa telsizi hiç açma
    if (!LV_SETTINGS.TELEMETRY_ACTIVE) {
        console.log("🛑 [Börü Telsiz] Telemetry kapalı, Karargah'a bağlanılmıyor.");
        return;
    }

    // Zaten bağlıysa tekrar bağlanmaya çalışma
    if (KARARGAH_SOCKET && KARARGAH_SOCKET.readyState === WebSocket.OPEN) return;

    // MAUI C# Karargahımızın dinlediği IP ve Port
    KARARGAH_SOCKET = new WebSocket('ws://localhost:7175/karargah');

    // BAĞLANTI AÇILDIĞINDA
    KARARGAH_SOCKET.onopen = () => {
        console.log("✅ [Börü Telsiz] Karargah'a bağlandı! Komutlar bekleniyor...");
        let mevcutDurum = GAME_STATUS === 'started' ? "Oyunda" : "Lobide/Menüde";
                let oynananRol = ROLE ? ROLE.name : "Bilinmiyor";
                
                KARARGAH_SOCKET.send(JSON.stringify({
                    tip: "CANLI_RAPOR",
                    nick: PLAYER ? PLAYER.username : "Bilinmiyor",
                    id: PLAYER ? PLAYER.id : "Bilinmiyor",
                    durum: mevcutDurum,
                    rol: oynananRol,
                    altin: INVENTORY ? INVENTORY.silverCount : 0,
                    level: PLAYER ? PLAYER.level : 0
                }));
    }
    

    //Emir geldiğinde
    KARARGAH_SOCKET.onmessage = (event) => {
        try {
          // --- PING-PONG HAT KONTROLÜ ---
          // Sunucu tarafı karar verdiğin o sayıyı gönderirse (Örn: 1 veya "PING")
          // Börü anında "2" döner.
          if (event.data === "1") { // Buradaki "1" sunucunun göndereceği ping sayısıdır
              KARARGAH_SOCKET.send("2");
              return; // İşlem tamam, fonksiyonun devamına bakmaya gerek yok.
            }      
            const gelenEmir = JSON.parse(event.data);
            console.log("🚨 [Karargah Emri]:", gelenEmir);

            // ==========================================
            // ⚙️ EMİR 1: TÜM AYARLARI GÜNCELLE (FULL KONTROL)
            // ==========================================
              if (gelenEmir.komut === "TUM_AYARLARI_GUNCELLE" && gelenEmir.ayarlar) {
                
                // 1. Yeni ayarları hafızaya yedir ve kaydet
                LV_SETTINGS = Object.assign({}, LV_SETTINGS, gelenEmir.ayarlar);
                saveSetting();
                
                // 2. OYUN İÇİ ARAYÜZÜ (MENÜYÜ) CANLI GÜNCELLE
                // --- Ana Şalterler (Checkboxlar) ---
                $('.lv-modal-checkbox.auto-play').text(LV_SETTINGS.AUTO_PLAY ? '' : '');
                $('.lv-modal-checkbox.auto-replay').text(LV_SETTINGS.AUTO_REPLAY ? '' : '');
                $('.lv-modal-checkbox.auto-join-rooms').text(LV_SETTINGS.AUTO_JOIN_ROOMS ? '' : '');
                $('.lv-modal-checkbox.auto-create-room').text(LV_SETTINGS.AUTO_CREATE_ROOM ? '' : '');
                $('.lv-modal-checkbox.debug').text(LV_SETTINGS.DEBUG_MODE ? '' : '');
                $('.lv-modal-checkbox.show-hidden-lvl').text(LV_SETTINGS.SHOW_HIDDEN_LVL ? '' : '');
                $('.lv-modal-checkbox.lobby-quit-active').text(LV_SETTINGS.LOBBY_AUTO_QUIT_ACTIVE ? '' : '');
                $('.lv-modal-checkbox.auto-join-case').text(LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE ? '' : '');
                $('.lv-modal-checkbox.discord-active').text(LV_SETTINGS.TELEMETRY_ACTIVE ? '' : '');
                
                // --- Görsel / Perk Şalterleri ---
                $('.lv-modal-checkbox.chat-stats').text(LV_SETTINGS.CHAT_STATS ? '' : '');
                $('.lv-modal-checkbox.player-aura').text(LV_SETTINGS.PLAYER_AURA ? '' : '');
                $('.lv-modal-checkbox.player-notes').text(LV_SETTINGS.PLAYER_NOTES ? '' : '');
                $('#set-chat-sound').prop('checked', LV_SETTINGS.CHAT_SOUND); // Börüssenger Ses Ayarı

                // --- Input ve Select Değerleri ---
                $('.lv-modal-join-filter-input').val(LV_SETTINGS.AUTO_JOIN_FILTER || "");
                $('.lv-modal-join-exclude-input').val(LV_SETTINGS.AUTO_JOIN_EXCLUDE || "");
                $('.lv-modal-join-password-input').val(LV_SETTINGS.AUTO_JOIN_PASSWORD || "");
                $('.lv-modal-create-template-input').val(LV_SETTINGS.AUTO_CREATE_TEMPLATE_NAME || "");
                $('.lv-modal-auto-slot-input').val(LV_SETTINGS.AUTO_SLOT || 0);
                $('.lv-modal-lobby-quit-input').val(LV_SETTINGS.LOBBY_AUTO_QUIT_SECONDS || 0);
                $('.lv-modal-auto-refresh').val(LV_SETTINGS.AUTO_REFRESH_INTERVAL || 15);
                $('.lv-modal-waiting-timeout').val(LV_SETTINGS.WAITING_HOST_TIMEOUT || 0);
                $('.lv-modal-p2p-code').val(LV_SETTINGS.USER_P2P_CODE || ""); // P2P Tag (İstenirse)

                // 3. ANLIK EFEKTLERİ TEMİZLE VEYA AÇ (VDS Optimizasyonu)
                // C#'tan Chat Stats kapatılırsa, ekrandaki gereksiz aura ve notları anında siler, RAM'i rahatlatır.
                if (!LV_SETTINGS.CHAT_STATS) {
                    $('.lv-perk-settings').hide();
                    removePlayerAura();
                    removePlayerNotes();
                } else {
                    $('.lv-perk-settings').show();
                    if (LV_SETTINGS.PLAYER_AURA) handlePlayerAura();
                    if (LV_SETTINGS.PLAYER_NOTES) handlePlayerNotes();
                }

                // 4. MOTORLARI TETİKLE
                if (LV_SETTINGS.AUTO_JOIN_ROOMS) handleAutoJoin();
                if (LV_SETTINGS.AUTO_CREATE_ROOM) handleAutoCreate();

                
                if (LV_SETTINGS.TELEMETRY_ACTIVE === false) KARARGAH_SOCKET.close();
            }

            // ==========================================
            // 📡 EMİR: CANLI DURUM RAPORU VER (MUST-HAVE ÖZELLİK)
            // ==========================================
            else if (gelenEmir.komut === "DURUM_RAPORU_VER") {
                let mevcutDurum = GAME_STATUS === 'started' ? "Oyunda" : "Lobide/Menüde";
                let oynananRol = ROLE ? ROLE.name : "Bilinmiyor";
                
                KARARGAH_SOCKET.send(JSON.stringify({
                    tip: "CANLI_RAPOR",
                    nick: PLAYER ? PLAYER.username : "Bilinmiyor",
                    id: PLAYER ? PLAYER.id : "Bilinmiyor",
                    durum: mevcutDurum,
                    rol: oynananRol,
                    altin: INVENTORY ? INVENTORY.silverCount : 0,
                    level: PLAYER ? PLAYER.level : 0,
                    ayarlar: LV_SETTINGS  // <--- SADECE BU SATIRI EKLE
                }));
            }
            
            // ==========================================
            // 🛑 EMİR 2: SİSTEMİ ACİL DURDUR (KILL SWITCH)
            // ==========================================
            else if (gelenEmir.komut === "ACIL_DURDUR") {
               
                shutdownBot("Karargah Kill-Switch (Acil Durdurma) aktif edildi.");
            }

            // ==========================================
            // 🔄 EMİR 3: SAYFAYI YENİLE (F5 ÇAK)
            // ==========================================
            else if (gelenEmir.komut === "SAYFAYI_YENILE") {
                
                setTimeout(() => window.location.reload(), 1000);
            }

            // ==========================================
            // 💰 EMİR 4: HASAT AKSİYONLARI (TEK TIK BUTONLARI)
            // ==========================================
            else if (gelenEmir.komut === "ALTIN_CARK_CEVIR") {
                fetch(`https://core.api-wolvesville.com/rewards/wheelRewardWithSecret/${getRewardSecret()}`, { method: 'POST', headers: getHeaders() });
               
            }
            else if (gelenEmir.komut === "GUL_CARK_CEVIR") {
                fetch('https://core.api-wolvesville.com/rewards/goldenWheelSpin', { method: 'POST', headers: getHeaders() });
                
            }
            else if (gelenEmir.komut === "KUTULARI_AC") {
                if (INVENTORY && INVENTORY.lootBoxes && INVENTORY.lootBoxes.length > 0) {
                   
                    lootBox(); // Senin yazdığın kutu açma fonksiyonu
                } else {
                  
                }
            }
            // ==========================================
            // 👻 EMİR 5: PANIC MODE (GİZLİLİK MODU)
            // ==========================================
            else if (gelenEmir.komut === "PANIC_MODE_TETIKLE") {
                $('html').toggleClass('lv-panic-mode');
                const isHidden = $('html').hasClass('lv-panic-mode');
               
            }
            // ==========================================
            // 🦅 EMİR 6: Biyografi ayarla
            // ==========================================
            else if (gelenEmir.komut === "BIO_AYARLA") {
                
                bioset(gelenEmir.yeniBio || ""); // Senin yazdığın biyografi ayarlama fonksiyonu
            }
            // ==========================================
            // 🐺 EMİR 7: BÖRÜSSENGER KONTROLÜ 
            // ==========================================
            else if (gelenEmir.komut === "BORUSSENGER_MESAJLARI_YEDEKLE") {
                
                backupMessages(); // Senin yazdığın mesaj yedekleme fonksiyonu
            }
            else if (gelenEmir.komut === "BORUSSENGER_MESAJLARI_SIL") {
              
                deleteMessages(); // Senin yazdığın mesaj silme fonksiyonu
            }
            else if (gelenEmir.komut === "BORUSSENGER_MESAJLARI_SYNCLE") {
                
                restoreMessages(); // Senin yazdığın mesaj geri yükleme fonksiyonu
            }
            else if (gelenEmir.komut === "BORUSSENGER_MESAJGONDER") {
              const targetNick = (gelenEmir.hedef || "").toLowerCase();
                let foundPeerID = null;

                // 1. Listeden hedefi bul
                $('.vs-user-item').each(function() {
                    const fullName = $(this).attr('data-username');
                    if (fullName && fullName.toLowerCase().startsWith(targetNick)) {
                        foundPeerID = $(this).attr('data-peer-id');
                        return false; // Döngüyü kır
                    }
                });

                // 2. Hedef varsa fırlat
                if (foundPeerID) {
                    sendSafeMessage(foundPeerID, {
                        sender: PLAYER ? PLAYER.username : "Börü",
                        content: gelenEmir.mesaj
                    });
                    addMessageToChat(foundPeerID, "Ben", gelenEmir.mesaj, 'me');
                   
                } else {
                    
                }
            }
            else if (gelenEmir.komut === "BORUSSENGER_ROLGONDER") {
              const targetNick = (gelenEmir.hedef || "").toLowerCase();
                let foundPeerID = null;

                // 1. Listeyi tara
                $('.vs-user-item').each(function() {
                    const fullName = $(this).attr('data-username');
                    if (fullName && fullName.toLowerCase().startsWith(targetNick)) {
                        foundPeerID = $(this).attr('data-peer-id');
                        return false;
                    }
                });

                // 2. Rolü gönder
                if (foundPeerID && ROLE) {
                    let roleIcon = "❓";
                    if(ROLE.team === 'VILLAGER') roleIcon = "👱";
                    if(ROLE.team === 'WEREWOLF') roleIcon = "🐺";
                    if(ROLE.id === 'doctor') roleIcon = "💉";
                    if(ROLE.id === 'seer') roleIcon = "🔮";
                    if(ROLE.id === 'gunner') roleIcon = "🔫";
                    if(ROLE.id === 'fool') roleIcon = "🤡";

                    const payload = {
                        type: 'ROLE_REVEAL',
                        sender: PLAYER ? PLAYER.username : "Börü",
                        roleName: ROLE.name,
                        roleTeam: ROLE.team,
                        icon: roleIcon
                    };

                    const roleHtml = `
                        <div class="role-card">
                            <div class="role-title">KİMLİK GÖSTERİLDİ</div>
                            <div class="role-icon">${roleIcon}</div>
                            <div>Ben <strong>${ROLE.name}</strong> rolündeyim!</div>
                        </div>
                    `;

                    sendSafeMessage(foundPeerID, payload);
                    addMessageToChat(foundPeerID, "Ben", roleHtml, 'me');
                   
                } else {
                   
                }
            }
            // ==========================================
            // 💐 EMİR 8: OYUN KONTROLÜ (yakında)
            // ==========================================
            else if (gelenEmir.komut === "BORU_CHATEMESAJYAZ") {
                // Önceliği RegularSocket'e ver, yoksa (vill win'deyse) normal Socket'i al
                const aktifSoket = REGULARSOCKET || SOCKET;

                if (aktifSoket && gelenEmir.mesaj) {
                    setTimeout(() => {
                        const tazePid = generatePid(); 
                        const payload = JSON.stringify({
                            msg: gelenEmir.mesaj,
                            pId: tazePid
                        });

                        // F12 KONSOL DEDEKTİFİ: Hangi soket kullanılıyor ve ne gönderiliyor?
                        console.log(`🚀 [Börü Chat Testi] Soket Türü: ${aktifSoket === REGULARSOCKET ? 'REGULARSOCKET (Hızlı Oyun)' : 'SOCKET (Özel Oda)'}`);
                        console.log(`🚀 [Börü Chat Testi] Gönderilen Payload:`, payload);

                        try {
                            aktifSoket.emit("game:chat-public:msg", payload);
                            
                            if (typeof addChatMsg === 'function') 
                                addChatMsg(`💬 Karargah: ${gelenEmir.mesaj}`, false, "color: #FF9800;");
                        } catch (err) {
                            console.error("❌ [Börü Chat Testi] Soket Emit Hatası:", err);
                        }
                    }, gecikmelan(300));
                } else {
                    console.warn(`⚠️ [Börü Chat Testi] Mesaj gitmedi! Soket var mı: ${!!aktifSoket}, Oyun Durumu: ${GAME_STATUS}`);
                }
            }
            // 1. HERKESE GÜL AT (roses-for-all)
            else if (gelenEmir.komut === "BORU_HERKESEGULGONDER") {
                const aktifSoket = SOCKET || REGULARSOCKET;

                if (aktifSoket) {
                    setTimeout(() => {
                        // Tam olarak yakaladığın o sade format:
                        aktifSoket.emit("roses-for-all", JSON.stringify({ 
                            amount: 1 
                        }));
                        
                       
                    }, gecikmelan(400));
                }
            }
            
            // 2. TEK KİŞİYE GÜL AT (roses-for-player)
            else if (gelenEmir.komut === "BORU_GULGONDER") {
                const aktifSoket = SOCKET || REGULARSOCKET;

                if (aktifSoket && gelenEmir.hedef) {
                    const aranan = gelenEmir.hedef.toLowerCase();
                    
                    // Hedefi bul (Nick veya Slot No)
                    const hedefOyuncu = PLAYERS.find(p => 
                        p.username.toLowerCase().includes(aranan) || 
                        (p.gridIdx + 1).toString() === aranan
                    );

                    if (hedefOyuncu) {
                        setTimeout(() => {
                            // Tam olarak yakaladığın o "hedef odaklı" format:
                            aktifSoket.emit("roses-for-player", JSON.stringify({
                                targetPlayerId: hedefOyuncu.id,
                                amount: 1
                            }));
                            
                            
                        }, gecikmelan(300));
                    } else {
                       
                    }
                }
            }
            else if (gelenEmir.komut === "BORU_RANDOMEMOTE") {
                // Senin dediğin gibi öncelik Regular Socket'te
                const aktifSoket = REGULARSOCKET || SOCKET;
                
                if (aktifSoket ) {
                    setTimeout(() => {
                        // 1. Kendi envanterindeki emojileri al (Eğer boşsa default kahkaha atar)
                        let emojiler = ["cQc"]; 
                        if (typeof INVENTORY !== 'undefined' && INVENTORY.ownedEmojis && INVENTORY.ownedEmojis.length > 0) {
                            // Sadece "emojiId" kısımlarını topla
                            emojiler = INVENTORY.ownedEmojis.map(e => e.emojiId);
                        }
                        
                        // 2. Rulet: Rastgele bir emoji seç
                        const secilenEmoji = emojiler[Math.floor(Math.random() * emojiler.length)];

                        // 3. Yakaladığın formatla fırlat!
                        aktifSoket.emit("show-emoji", JSON.stringify({ 
                            emojiId: secilenEmoji 
                        }));
                        
                        if (typeof addChatMsg === 'function') 
                            addChatMsg(`😂 Karargah: Bir emoji fırlatıldı!`, false, "color: #8E24AA;");
                            
                        console.log(`[Börü Emoji] Atılan Emoji Kodu: ${secilenEmoji}`);
                    }, gecikmelan(200));
                }
            }

        } catch (e) {
            console.error("Karargah mesajı çözümlenemedi:", e);
        }
    };

    // BAĞLANTI KOPTUĞUNDA
    KARARGAH_SOCKET.onclose = () => {
        console.log("🔴 [Börü Telsiz] Karargah bağlantısı koptu. 3 saniye sonra tekrar denenecek...");
        KARARGAH_SOCKET = null;
        // 3 saniye sonra tekrar bağlanmayı dene (Eğer telemetry hala açıksa)
        setTimeout(baslatKarargahTelsizi, 3000);
    };

    KARARGAH_SOCKET.onerror = (err) => {
        // Sessizce yutuyoruz, onclose zaten 3 saniye sonra tekrar tetikleyecek
    };
};




// Oyun içi verileri toplayıp C# Karargahının (BoruMatchRecord) tam beklediği formata çevirir
function buildBoruPayload(xpAmount, currentLvl, role, matchResult, gainedGold, durationSec) {
    return {
        wovUsername: PLAYER?.username || "Bilinmiyor", 
        playedRole: role || "Bilinmiyor",              
        matchResult: matchResult || "Bilinmiyor",      
        matchDurationSec: durationSec || 0,
        xpGained: xpAmount || 0,
        goldGained: gainedGold || 0,
        currentLevel: currentLvl || 0,
        rosesSent: 0,     // Şimdilik 0, istersen ileride socketten saydırırsın
        rosesReceived: 0, // Şimdilik 0
        clanQuestXpContributed: 0,
        isMobile: /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 800,
        survived: !DEADS.includes(PLAYER?.id), // DEADS listesinde yoksan hayattasın demektir!
        wasKicked: false, 
        completedSuccessfully: true,
        disconnectReason: null
    };
}

// Hazırlanan payload'u C# Localhost API'sine fırlatır
async function sendToAnalyzer(payload) {
    if (!LV_SETTINGS.TELEMETRY_ACTIVE) return; 

    try {
        // 🔥 URL'yi C# Controller'a uyumlu hale getirdik (Portuna dikkat et, 7175 veya 7216)
        const endpoint = 'https://api.varietyshop.com.tr/api/analyzer/log-match'; 
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`🐺 Börü Merkez: ${payload.xpGained} XP ve ${payload.playedRole} rolü başarıyla analizciye raporlandı!`);
        } else {
            console.error("🐺 Börü Merkez: Veri gitti ama C# sunucusu hata döndü. Durum:", response.status);
        }
    } catch (error) {
        console.error("🐺 Börü Merkez: C# API'sine ulaşılamıyor. Localhost/VDS açık mı?", error);
    }
}


const bioset = async (newest) => {
    try {
        const response = await fetch(`https://core.api-wolvesville.com/players/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
                backgroundGradientAccent: null,
                backgroundGradientPrimary: null,
                markdownEnabled: false, // Senin belirttiğin gibi false
                msg: newest 
            })
        });
        return response.ok;
    } catch (err) {
        console.error("Update hatası:", err);
        return false;
    }
}



function backupMessages() {
    // Tüm sohbet geçmişini JSON dosyası olarak bilgisayara indirir!
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(CHAT_STORAGE));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `Boru_Istihbarat_Yedek_${new Date().toLocaleDateString('tr-TR').replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function deleteMessages() {
    // 1. Hafızayı tamamen boşalt
    CHAT_STORAGE = {};
    saveChatToLocal(); // Boş haliyle üstüne yaz
    
    // 2. Ekrandaki yazıları sil
    $('#boru-chat-history').html('<div class="vs-msg system" style="color:red;">Tüm sohbet geçmişi Karargah emriyle imha edildi!</div>');
}

async function restoreMessages() {
    // 1. Sınırsız hafızadan tekrar çek
    await loadChatFromUnlimited();
    
    // 2. Hafızanın yüklenmesi için çok kısa bir bekleme (Garanti olsun diye)
    setTimeout(() => {
        // 🔥 3. KARARGAHA FULL SENKRONİZASYON (TÜM VERİYİ) GÖNDER
        if (KARARGAH_SOCKET && KARARGAH_SOCKET.readyState === WebSocket.OPEN) {
            const friends = JSON.parse(localStorage.getItem('boru-friends-list') || "[]");
            KARARGAH_SOCKET.send(JSON.stringify({
                tip: "BORUSSENGER_FULL_SYNC",
                friends: friends,
                chats: CHAT_STORAGE
            }));
            
        }

        // 4. O an ekranda biri açıksa sohbeti yükle
        if (ACTIVE_CHAT_TARGET) {
            $(`.vs-user-item[data-peer-id="${ACTIVE_CHAT_TARGET}"]`).trigger('click');
        }
    }, 100); 
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

    
    const secureID = `${PLAYER.id}-${CLIENT_SECRET_KEY}-${LV_SETTINGS.USER_P2P_CODE}`;
    console.log("[Börü] Bağlanılıyor... ID:", getRealID(secureID));

    myPeer = new Peer(secureID, { debug: 0 });

    
    myPeer.on('open', (id) => {
        addChatMsg(`✅ Sohbet Aktif!`, true, "color:#00ff00;");
        $('.vs-badge').text("ONLINE").css({'background':'#4caf50'});
        
        
        loadFriendsFromLocal();
        reconnectToFriends();
    });

    
    myPeer.on('connection', (conn) => {
        setupConnectionEvents(conn);
    });

    myPeer.on('error', (err) => {
      if(err.type === 'peer-unavailable') {
        
    } else {
        console.log("P2P Bağlantı Hatası: " + err.type); 
    }
    });
}

// 🔥 YARDIMCI: Bir bağlantı kurulduğunda olayları ayarla
function setupConnectionEvents(conn) {
   
    conn.on('open', () => {
        const rootID = getRealID(conn.peer);
        
        
        if (BLOCKED_USERS.includes(rootID)) {
            conn.close(); 
            return;
        }

        
        const item = $(`.vs-user-item[data-peer-id="${conn.peer}"]`);
        item.find('.status-dot').css('background-color', '#4caf50'); 
        item.find('.status-dot').css('box-shadow', '0 0 5px #4caf50');
    });

   conn.on('close', () => {
        
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
    return; 
}
    const incomingRootID = getRealID(peerID);

    if (BLOCKED_USERS.includes(incomingRootID)) {
        return; 
    }
    const senderName = escapeHtml(data.sender || "Bilinmiyor");

    
    if ($(`.vs-user-item[data-peer-id="${peerID}"]`).length === 0) {
        $('.vs-user-item.offline').hide();
       
        const rootID = getRealID(peerID);
        const isBlocked = BLOCKED_USERS.includes(rootID);
        const blockIcon = isBlocked ? '🛑' : '🚫';
        const blockStyle = isBlocked ? 'opacity:1;' : '';
      $('#boru-online-list').append(`
            <div class="vs-user-item" data-peer-id="${peerID}" data-username="${senderName }">
                <span class="status-dot" style="background-color:#4caf50;"></span> ${senderName } 
                <span class="new-badge" style="font-size:9px; color:yellow; margin-left:5px;">(YENİ)</span>

                <span class="clear-chat-btn" onclick="removeUserFull('${peerID}', event)" title="Listeden Sil">🗑️</span>
                <span class="block-user-btn" style="${blockStyle}" onclick="toggleBlockUser('${peerID}', this)">${blockIcon}</span>
            </div>
        `);
        fetchAndSetAvatar(peerID); 
        saveFriendsToLocal();
    }

    
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

    
    if (data.type === 'ROLE_REVEAL') {
        const roleHtml = `
            <div class="role-card" style="border-color: #00ff00;">
                <div class="role-title" style="color:#00ff00;">KİMLİK DOĞRULANDI</div>
                <div class="role-icon">${data.icon}</div>
                <div><strong>${senderName}</strong>: Ben <strong style="color:white;">${data.roleName}</strong> rolündeyim!</div>
            </div>`;
        
        notificationCheck(peerID);
        
        
        addMessageToChat(peerID, senderName, roleHtml, 'ROLE_REVEAL'); 
        return;
    }

    
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

    
    if (data.type === 'IMAGE') {
        const imgTag = `<img src="${data.content}" class="chat-image">`;
        notificationCheck(peerID);
        addMessageToChat(peerID, senderName, imgTag, 'them'); 
        return;
    }

    
    if (data.type === 'VIDEO') {
        const videoTag = `<video src="${data.content}" controls class="chat-video"></video>`;
        notificationCheck(peerID);
        addMessageToChat(peerID, senderName, videoTag, 'them');
        return;
    }

    
    $('#typing-indicator').remove();
    notificationCheck(peerID);
    addMessageToChat(peerID, senderName, data.content, 'them'); 
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
            $('.vs-user-item.offline').hide(); 
            
         friends.forEach(f => {
            if ($(`.vs-user-item[data-peer-id="${f.id}"]`).length === 0) {
                
                const fRootID = getRealID(f.id);
                const isBlocked = BLOCKED_USERS.includes(fRootID);
                const blockIcon = isBlocked ? '🛑' : '🚫';
                const blockStyle = isBlocked ? 'opacity:1;' : '';
                
                
                const avatarUrl = f.avatar || "https://cdn-avatars.wolvesville.com/werewolfHead_spec.png";

                $('#boru-online-list').append(`
                    <div class="vs-user-item" data-peer-id="${f.id}" data-username="${f.name}">
                        <div style="position:relative; display:inline-block;">
                             <img src="${avatarUrl}" class="vs-avatar-img">
                             <span class="status-dot" style="position:absolute; bottom:2px; right:5px; border:2px solid #202020; width:12px; height:12px; background-color:red;"></span>
                        </div>
                        
                        <span style="font-weight:bold; color:#ddd;">${f.name}</span>
                        
                        <span class="edit-tag-btn" onclick="tagDegistir('${f.id}', event)" title="Tag Değiştir">✏️</span>
                        <span class="clear-chat-btn" onclick="removeUserFull('${f.id}', event)" title="Listeden Sil">🗑️</span>
                        <span class="block-user-btn" style="${blockStyle}" onclick="toggleBlockUser('${f.id}', this)">${blockIcon}</span>
                    </div>
                `);
                
                
                if (!f.avatar) fetchAndSetAvatar(f.id);
            }
        });
        }
    }
}

// --- 🎵 BÖRÜ YENİ NESİL SES SİSTEMİ (MP3) ---
// 1. Seçenek: Kendi eklentine eklediğin bir sesi kullanmak (Hardcore)
const ses_Linki = `${new URL(document.currentScript.src).origin}/icons/borubildirim.mp3`;

// 2. Seçenek (Alternatif): İnternetten hazır bir ses kullanmak (Örn: Discord sesi)
// const ses_Linki = 'https://www.myinstants.com/media/sounds/discord-notification.mp3';

const boruSesMotoru = new Audio(ses_Linki);
boruSesMotoru.volume = 0.5; 

function playNotificationSound() {
    if (!LV_SETTINGS.CHAT_SOUND) return; 
    
    
    boruSesMotoru.currentTime = 0; 
    
    boruSesMotoru.play().catch(e => {
        
        console.log("🐺 Börü: Ses engellendi (Sayfaya tıkla):", e.message);
    });
}
// --- DURUM PAYLAŞIMI (RICH PRESENCE) ---
function broadcastStatus(statusText) {
    if (!myPeer || !myPeer.connections) return;

    const payload = {
        type: 'STATUS_UPDATE',
        sender: PLAYER ? PLAYER.username : "Börü",
        status: statusText
    };

    
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
        
        setTimeout(loadChatFromUnlimited, 1000);
    }
}

// 2. Verileri Kaydet (Her mesajda çalışır)
function saveChatToLocal() {
    
    if (typeof localforage !== 'undefined') {
        localforage.setItem('boru-chat-history', CHAT_STORAGE).catch(function(err) {
            console.error("Kayıt hatası:", err);
        });
    }
}


// --- MERKEZİ MESAJ YÖNETİMİ (KUSURSUZ VERSİYON) ---
function addMessageToChat(peerID, sender, content, type) {
    
    const msgId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    
    if (!CHAT_STORAGE[peerID]) {
        CHAT_STORAGE[peerID] = [];
    }

    
    const yeniMesajObjesi = {
        id: msgId,
        sender: sender,
        msg: content,
        type: type
    };

    
    CHAT_STORAGE[peerID].push(yeniMesajObjesi);
    saveChatToLocal(); 

    
   

    
    if (ACTIVE_CHAT_TARGET === peerID) {
        const cssClass = type === 'me' ? 'me' : 'them';
        let finalContent = "";

        
        
        if (type === 'IMAGE' || type === 'VIDEO' || type === 'ROLE_REVEAL' ||
           (content.startsWith('<img') && content.includes('chat-image')) || 
           (content.startsWith('<video') && content.includes('chat-video')) ||
           (content.includes('role-card'))) {
            finalContent = content; 
        } else {
            finalContent = escapeHtml(content); 
        }

        const senderTag = type === 'them' ? `<strong style="color:#fb2e00;">${escapeHtml(sender)}:</strong> ` : '';

        
        $('#boru-chat-history').append(`
            <div class="vs-msg ${cssClass}" id="msg-${msgId}">
                ${senderTag}${finalContent}
                <span class="delete-msg-btn" data-id="${msgId}" title="Sil">🗑️</span>
            </div>
        `);

        
        const div = document.getElementById('boru-chat-history');
        if(div) {
            
            setTimeout(() => { div.scrollTop = div.scrollHeight; }, 50);
        }
    }
}

// --- MESAJ SİLME DİNLEYİCİSİ ---
$(document).on('click', '.delete-msg-btn', function(e) {
    e.stopPropagation(); 
    
    if(!confirm("Bu mesajı silmek istediğine emin misin?")) return;

    const msgId = $(this).attr('data-id');
    
    
    $(`#msg-${msgId}`).fadeOut(300, function() { $(this).remove(); });

    
    if (CHAT_STORAGE[ACTIVE_CHAT_TARGET]) {
        CHAT_STORAGE[ACTIVE_CHAT_TARGET] = CHAT_STORAGE[ACTIVE_CHAT_TARGET].filter(m => m.id !== msgId);
        saveChatToLocal(); 
    }
});

// --- YARDIMCI FONKSİYON: GERÇEK ID ÇÖZÜCÜ ---
function getRealID(fullPeerID) {
    if (!fullPeerID) return "";
    let parts = fullPeerID.split('-');
    
    
    if (parts.length >= 3) {
        
        parts.pop(); 
        parts.pop(); 
        
        return parts.join('-');
    }
    
    return fullPeerID;
}

function toggleBlockUser(peerID, btnElement) {
    
    const rootID = getRealID(peerID);

    if (BLOCKED_USERS.includes(rootID)) {
        
        BLOCKED_USERS = BLOCKED_USERS.filter(id => id !== rootID);
        $(btnElement).text('🚫').css('opacity', '0.3');
        $(btnElement).removeClass('blocked');
        addChatMsg("✅ Engel Kaldırıldı.", true, "color:green;");
    } else {
        
        if(confirm("Bu kişiyi engellemek istiyor musun?")) {
            BLOCKED_USERS.push(rootID);
            $(btnElement).text('🛑').css('opacity', '1');
            $(btnElement).addClass('blocked');
            addChatMsg("🚫 Kişi Kalıcı Olarak Engellendi.", true, "color:red;");
        }
    }
    localStorage.setItem('boru-blocked-users', JSON.stringify(BLOCKED_USERS));
}

// --- 🔥 KİŞİYİ SİL, GEÇMİŞİ YAK VE BAĞLANTIYI KOPAR ---
window.removeUserFull = function(peerID, e) {
    
    if(e) e.stopPropagation();

    
    if(!confirm("Bu kişiyi LİSTEDEN SİLMEK istediğine emin misin?\n(Sohbet geçmişi silinecek ve bağlantı koparılacak)")) return;

    
    if (myPeer && myPeer.connections[peerID]) {
        
        myPeer.connections[peerID].forEach(conn => {
            if (conn.open) {
                conn.close(); 
                console.log(`[Börü] ${getRealID(peerID)} ile bağlantı sonlandırıldı.`);
            }
        });
    }

    
    let friends = JSON.parse(localStorage.getItem('boru-friends-list') || "[]");
    const newFriends = friends.filter(f => f.id !== peerID);
    localStorage.setItem('boru-friends-list', JSON.stringify(newFriends));

    
    if (CHAT_STORAGE[peerID]) {
        delete CHAT_STORAGE[peerID];
    }
    saveChatToLocal(); 

    
    $(`.vs-user-item[data-peer-id="${peerID}"]`).fadeOut(300, function() {
        $(this).remove();
        
        
        if($('#boru-online-list .vs-user-item').length === 0) {
             $('#boru-online-list').html('<div class="vs-user-item offline" style="font-style:italic; color:#666;">Liste boş...</div>');
        }
    });

    
    if (ACTIVE_CHAT_TARGET === peerID) {
        ACTIVE_CHAT_TARGET = null;
        $('#boru-chat-history').html('<div class="vs-msg system" style="color:#ff4081;">Bağlantı kesildi ve kişi silindi.</div>');
        $('#boru-chat-input').val('');
    }
};
// --- ✏️ KİŞİ TAGINI DEĞİŞTİRME FONKSİYONU (GEÇMİŞ KORUMALI V1.10) ---
window.tagDegistir = function(peerID, e) {
    
    if (e) e.stopPropagation(); 

    
    const yeniTag = prompt("Kişinin yeni 4 haneli Börü Tag'ını girin (Örn: 1453):");
    
    if (yeniTag && yeniTag.length === 4 && !isNaN(yeniTag)) {
        let friends = JSON.parse(localStorage.getItem('boru-friends-list') || "[]");
        const fIndex = friends.findIndex(f => f.id === peerID);
        
        if (fIndex > -1) {
            
            const parts = peerID.split('-');
            if (parts.length >= 3) {
                parts.pop(); 
                const newPeerID = parts.join('-') + '-' + yeniTag; 
                
                
                let oldName = friends[fIndex].name;
                let isimsiz = oldName.split('#')[0];
                
                friends[fIndex].id = newPeerID;
                friends[fIndex].name = `${isimsiz}#${yeniTag}`;
                
                
                if (CHAT_STORAGE[peerID]) {
                    CHAT_STORAGE[newPeerID] = CHAT_STORAGE[peerID];
                    delete CHAT_STORAGE[peerID]; 
                }
                
                
                localStorage.setItem('boru-friends-list', JSON.stringify(friends));
                
                
                if (typeof localforage !== 'undefined') {
                    
                    localforage.setItem('boru-chat-history', CHAT_STORAGE).then(() => {
                        alert("✅ Tag ve İstihbarat (Sohbet) geçmişi başarıyla taşındı!\nBağlantı için sayfa yenileniyor...");
                        location.reload(); 
                    }).catch(err => {
                        console.error("Kayıt hatası:", err);
                        alert("❌ Veriler taşınırken bir hata oluştu!");
                    });
                } else {
                    
                    alert("✅ Tag başarıyla güncellendi!");
                    location.reload();
                }
            }
        }
    } else if (yeniTag != null) {
        alert("❌ Hata: Tag sadece 4 haneli rakam olmalıdır!");
    }
};

// --- AVATAR YÖNETİM SİSTEMİ ---
async function fetchAndSetAvatar(fullPeerID) {
    const rootID = getRealID(fullPeerID); 
    if (!rootID) return;

    
    const imgElement = $(`.vs-user-item[data-peer-id="${fullPeerID}"] .vs-avatar-img`);

    try {
        
        const response = await fetch(`https://core.api-wolvesville.com/inventory/slots/${rootID}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (response.ok) {
            const slots = await response.json();
            
            const mainSlot = slots.find(s => s.slot === 0) || slots[0];
            
            if (mainSlot && mainSlot.renderedAvatarImage && mainSlot.renderedAvatarImage.fileName) {
                const fileName = mainSlot.renderedAvatarImage.fileName;
                
                const finalUrl = `https://cdn-avatars2.wolvesville.com/${fileName.replace('.png', '@2x.png')}`;
                
                
                imgElement.attr('src', finalUrl);
                
                
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

    
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizer.classList.add('active'); 
        $('body').css('cursor', 'col-resize'); 
        $('body').css('user-select', 'none');  
    });

    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        
        const containerLeft = container.getBoundingClientRect().left;
        let newWidth = e.clientX - containerLeft;

        
        if (newWidth < 150) newWidth = 150; 
        if (newWidth > 500) newWidth = 500; 

        sidebar.style.width = `${newWidth}px`;
    });

    
    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('active');
            $('body').css('cursor', 'default');
            $('body').css('user-select', 'auto'); 
        }
    });
};

// Buton için CSS (JS ile inject edelim, stil dosyasına gitmene gerek kalmasın)
$('head').append(`
    <style>
        /* Block butonu zaten var, bu da silme butonu */
        .clear-chat-btn {
            font-size: 12px;
            cursor: pointer;
            opacity: 0.4;
            margin-left: auto; /* Sağa yasla */
            margin-right: 8px; /* Block butonuyla arasına boşluk koy */
            transition: all 0.2s;
        }
        .clear-chat-btn:hover { 
            opacity: 1; 
            color: #ff4081; /* Pembe/Kırmızı yanar */
            transform: scale(1.1);
        }
        /* Tag Düzenleme Butonu (YENİ) */
        .edit-tag-btn {
            font-size: 12px;
            cursor: pointer;
            opacity: 0.4;
            margin-left: auto; /* Bunu sola iterek her şeyi sağa yaslıyoruz */
            margin-right: 8px;
            transition: all 0.2s;
        }
        .edit-tag-btn:hover { 
            opacity: 1; 
            color: #ffc300; /* Sarı yanar */
            transform: scale(1.1);
        }

        /* Block butonu zaten var, bu da silme butonu */
        .clear-chat-btn {
            font-size: 12px;
            cursor: pointer;
            opacity: 0.4;
            margin-right: 8px; 
            transition: all 0.2s;
        }
        .clear-chat-btn:hover { 
            opacity: 1; 
            color: #ff4081; /* Pembe/Kırmızı yanar */
            transform: scale(1.1);
        }

        /* Block butonunun artık en sağa yaslanmasına gerek yok, çöp kutusu onu itecek */
        .vs-user-item .block-user-btn {
            margin-left: 0 !important; 
        }
            /* Video Stili */
            .chat-video {
                max-width: 100%;      /* Chat genişliğini geçmesin */
                max-height: 250px;    /* Çok uzun olmasın */
                border-radius: 8px;
                border: 1px solid #444;
                margin-top: 5px;
                background-color: black;
            }
                /* --- PENCERE MODU (WINDOWS GİBİ) --- */

          /* 1. Siyah Perdeyi (Veil) bu pencere için gizle */
          .lv-modal-recent-players-container .lv-modal-veil {
              display: none !important;
          }

          /* 2. Konteynırın tıklamaları engellemesini kapat (Oyuna tıklayabil) */
          .lv-modal-recent-players-container {
              pointer-events: none; /* Tıklamalar arkaya (oyuna) geçsin */
              width: 100%;
              height: 100%;
              position: fixed;
              top: 0;
              left: 0;
              z-index: 9990; /* Chat'in arkasında kalsın */
          }

          /* 3. Ama Pencerenin kendisine tıklayabilelim */
          .lv-modal-recent-players-container .vs-modal-window {
              pointer-events: auto; /* Pencereye tıklanabilsin */
              box-shadow: 0 0 20px rgba(0,0,0,0.8); /* Biraz gölge ekleyelim havalı olsun */
              /* Transform'u draggable JS ile yöneteceğiz */
          }

          /* 4. Başlık çubuğuna taşıma imleci ekle */
          .vs-header-bar {
              cursor: move; /* Üzerine gelince taşıma ikonu çıksın */
              user-select: none; /* Sürüklerken yazı seçilmesin */
          }
              /* --- 🔥 MOBİL MOD (Telefonsa burası çalışır) --- */
body.boru-mobile .lv-modal-recent-players-container {
    pointer-events: auto !important;
}

/* Pencereyi Tam Ekran Yap */
body.boru-mobile .lv-modal-recent-players-container .vs-modal-window {
    width: 100vw !important;
    height: 100vh !important;
    top: 0 !important;
    left: 0 !important;
    transform: none !important;
    border: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
    display: flex;
    flex-direction: column;
}

/* Üst Barı Gizle (Çünkü kapatma tuşunu ayıracağız) */
body.boru-mobile .vs-header-bar {
    height: 50px !important;
    justify-content: center !important; /* Ortala */
    padding-top: 10px !important;
}

/* Tabs (Sekmeler) */
body.boru-mobile .vs-tabs-container {
    flex: 1;
    justify-content: flex-start;
}

/* 🔥 KAPATMA TUŞU (Kocaman ve Ortada) */
body.boru-mobile .lv-modal-recent-players-close {
    position: fixed !important;
    bottom: 20px !important; /* En alta alalım, parmak oraya daha yakın */
    left: 50% !important;
    transform: translateX(-50%) !important;
    background-color: #fb2e00 !important;
    color: white !important;
    width: 50px !important;
    height: 50px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 24px !important;
    box-shadow: 0 0 15px rgba(0,0,0,0.8) !important;
    z-index: 10005 !important;
    border: 2px solid white !important;
}

/* Yan Menüyü Daralt */
body.boru-mobile .vs-chat-sidebar {
    width: 65px !important;
    min-width: 65px !important;
}

/* İsimleri Gizle, Sadece Avatar Kalsın */
body.boru-mobile .vs-user-item span:not(.status-dot):not(.block-user-btn):not(.clear-chat-btn) {
    display: none !important; 
}

/* Kişi Listesi Düzeni */
body.boru-mobile .vs-user-item {
    padding: 15px 5px !important;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    border-bottom: 1px solid #333;
}

/* Butonları büyüt (Parmak için) */
body.boru-mobile .clear-chat-btn, 
body.boru-mobile .block-user-btn {
    font-size: 16px !important;
    opacity: 1 !important;
    padding: 5px !important;
    margin: 0 !important;
}

/* Input Alanını Genişlet */
body.boru-mobile .vs-chat-input-area {
    height: auto !important;
    flex-wrap: wrap;
    padding-bottom: 80px; /* Kapatma tuşu altta olduğu için boşluk bırak */
}

body.boru-mobile #boru-chat-input {
    width: 100% !important;
    height: 40px !important;
    margin-bottom: 5px;
    font-size: 16px !important; /* Mobilde klavye zoom yapmasın diye */
}

/* Chat Butonlarını Büyüt */
body.boru-mobile .vs-chat-input-area button, 
body.boru-mobile .vs-chat-input-area label {
    flex: 1;
    height: 40px !important;
    font-size: 18px !important;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Gereksizleri Gizle */
body.boru-mobile #vs-resizer { display: none !important; }
body.boru-mobile .vs-sidebar-header span { display: none; }
body.boru-mobile .vs-sidebar-header #btn-add-manual-user { display: block !important; font-size: 30px; width: 100%; text-align: center; }
/* --- PENCERE BOYUTLANDIRMA (RESIZE) --- */
#vs-resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nwse-resize; /* Çapraz ok imleci */
    color: #0af2ff;
    z-index: 10002; /* Her şeyin üstünde */
    font-size: 14px;
    line-height: 22px;
    text-align: right;
    padding-right: 2px;
    user-select: none;
    /* Mobilde gizle */
    display: block;
}

/* Mobilde boyutlandırmayı kapat */
body.boru-mobile #vs-resize-handle {
    display: none !important;
}
    </style>
`);

// 🔥 YENİ GÜVENLİ GÖNDERME FONKSİYONU
const sendSafeMessage = (targetID, payload) => {
    if (!myPeer || myPeer.destroyed) return;

    
    let conn = null;
    if (myPeer.connections[targetID]) {
        
        conn = myPeer.connections[targetID].find(c => c.open);
    }

    
    if (!conn) {
        console.log(`[Börü] ${getRealID(targetID)} için açık hat yok, bağlanılıyor...`);
        conn = myPeer.connect(targetID);
        setupConnectionEvents(conn); 
    }

    
    if (conn.open) {
        
        conn.send(payload);
    } else {
        
        conn.on('open', () => {
            console.log(`[Börü] Bağlantı açıldı, mesaj kuyruktan yollandı.`);
            conn.send(payload);
        });
    }
};


// --- BÖRÜ BEKLEME DEDEKTÖRÜ (AYARLI) ---
let waitingForHostStartTime = null;

const checkWaitingState = () => {
    
    if (!LV_SETTINGS.WAITING_HOST_TIMEOUT || LV_SETTINGS.WAITING_HOST_TIMEOUT === 0) {
        waitingForHostStartTime = null; 
        return;
    }

    
    const waitingEl = getEl('#root div:contains("Waiting for host"):visible').last();

    if (waitingEl.length > 0) {
        
        if (waitingForHostStartTime === null) {
            waitingForHostStartTime = Date.now();
            console.log(`%c[Börü] Bekleme başladı. Limit: ${LV_SETTINGS.WAITING_HOST_TIMEOUT}sn`, "color: #ffc300;");
        } else {
            
            const elapsedSeconds = Math.floor((Date.now() - waitingForHostStartTime) / 1000);
            
            
            if (elapsedSeconds >= LV_SETTINGS.WAITING_HOST_TIMEOUT) {
                addChatMsg(`⚡ Bekleme süresi (${elapsedSeconds}sn) doldu! Yenileniyor...`, true, "color: red;");
                console.log("%c[Börü] Limit aşıldı! Sayfa yenileniyor...", "color: #fb2e00; font-weight: bold;");
                
                
                saveSetting();
                setTimeout(() => location.reload(), 500); 
            }
        }
    } else {
        
        if (waitingForHostStartTime !== null) {
            waitingForHostStartTime = null;
            console.log("[Börü] Bekleme bitti, sayaç sıfırlandı.");
        }
    }
};


function initWindowResizer() {
    const handle = document.getElementById('vs-resize-handle');
    
    const modal = document.querySelector('.lv-modal-recent-players-container .vs-modal-window');

    if (!handle || !modal) return;

    let isResizing = false;

    handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        isResizing = true;
        
        
        const startWidth = modal.offsetWidth;
        const startHeight = modal.offsetHeight;
        const startX = e.clientX;
        const startY = e.clientY;

        function onMouseMove(e) {
            if (!isResizing) return;
            
            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);

            
            if (newWidth > 400) {
                
                modal.style.setProperty('width', newWidth + 'px', 'important');
            }
            if (newHeight > 300) {
                modal.style.setProperty('height', newHeight + 'px', 'important');
            }
        }

        function onMouseUp() {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

// Pencereyi açan butona tıklayınca Resizer'ı başlat
$(document).on('click', '.lv-last-players-btn', function() {
    setTimeout(initWindowResizer, 500); 
});


// --- 🔥 PENCERE SÜRÜKLEME SİSTEMİ (PC + MOBİL DESTEKLİ) ---
function makeDraggable() {
    const modal = document.querySelector(".lv-modal-recent-players-container .vs-modal-window");
    const header = document.querySelector(".vs-header-bar");

    if (!modal || !header) return;

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    
    const dragStart = (e) => {
        
        if (window.innerWidth <= 768) return;

        
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        
        if(e.target === header) e.preventDefault();
        
        const rect = modal.getBoundingClientRect();
        
        modal.style.transform = "none";
        modal.style.left = rect.left + "px";
        modal.style.top = rect.top + "px";
        modal.style.margin = "0";

        isDragging = true;
        startX = clientX;
        startY = clientY;
        initialLeft = rect.left;
        initialTop = rect.top;
        
        modal.style.zIndex = "10000";
    };

    
    const dragEnd = () => {
        isDragging = false;
    };

    
    const dragMove = (e) => {
        if (!isDragging) return;
        
        e.preventDefault(); 

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        modal.style.left = (initialLeft + dx) + "px";
        modal.style.top = (initialTop + dy) + "px";
    };

    
    
    header.onmousedown = dragStart;
    document.onmouseup = dragEnd;
    document.onmousemove = dragMove;

    
    header.ontouchstart = dragStart;
    document.ontouchend = dragEnd;
    document.ontouchmove = dragMove;
}



// Bu fonksiyonu her açılışta tetiklemek için bir dinleyici ekleyelim
// (Çünkü pencere başta display:none olabilir)
$(document).on('click', '.lv-last-players-btn', function() {
    
    setTimeout(makeDraggable, 100);
});

let loopCounter = 0;
const masterLoop = () => {
    loopCounter++;

   
    removeWovProtections(); 
    checkWaitingState();


    
    if (loopCounter % 5 === 0) {
        setChatState();    
        injectChat();      
        setPlayersLevel(); 
        
        
        CACHED_DOM = {}; 
    }

    if (loopCounter >= 60) loopCounter = 0;
};


fetchInterceptor();



// Fonksiyonu çalıştır
addPanicButton();
addMascot();
main()

window.addEventListener('load', function () { })
