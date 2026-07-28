console.log('🐺 Börü Bot V1.2.0 (Native Hook Edition) injected');

// ─────────────────────────────────────────────
// 🔥 1. BÖRÜ NATIVE SOCKET HOOK (ANA DAMAR)
// ─────────────────────────────────────────────
var GAME_WS = undefined;

;(function patchWebSocket() {
  const OrigWS = window.WebSocket;
  window.WebSocket = function (url, protocols) {
    const ws = protocols ? new OrigWS(url, protocols) : new OrigWS(url);
    if (url && url.includes('api-wolvesville.com')) {
      ws.addEventListener('open', () => {
        GAME_WS = ws;
        addChatMsg('🔌 Oyun socketi yakalandı! (Native Hook)', false, 'color:#00FF00;');
      });
      ws.addEventListener('close', () => {
        if (GAME_WS === ws) {
          GAME_WS = undefined;
          addChatMsg('🔌 Oyun socketi kapandı.', false, 'color:#ff603b;');
        }
      });
    }
    return ws;
  };
  
  // 🔥 HAYAT KURTARAN KISIM: Orijinal WebSocket özelliklerini klonla
  window.WebSocket.prototype = OrigWS.prototype;
  window.WebSocket.CONNECTING = OrigWS.CONNECTING;
  window.WebSocket.OPEN       = OrigWS.OPEN;
  window.WebSocket.CLOSING    = OrigWS.CLOSING;
  window.WebSocket.CLOSED     = OrigWS.CLOSED;
})();

/**
 * Oyunun kendi socketi üzerinden komut fırlatır
 */
function gameEmit(eventName, dataObj) {
  if (!GAME_WS || GAME_WS.readyState !== window.WebSocket.OPEN) {
    log(`[gameEmit] Socket hazır değil – event: ${eventName}`);
    return;
  }
  
  if (dataObj === undefined) {
      GAME_WS.send('42["' + eventName + '"]');
  } else {
      let payloadStr = typeof dataObj === 'string' ? dataObj : JSON.stringify(dataObj);
      GAME_WS.send('42["' + eventName + '",' + payloadStr + ']');
  }
}

// ─────────────────────────────────────────────
// 🔥 2. GLOBAL DEĞİŞKENLER VE AYARLAR
// ─────────────────────────────────────────────
const scriptTag = document.currentScript;
var BOT_VERSION = scriptTag?.getAttribute('data-version') || "1.2.0";
var HAS_UPDATE = scriptTag?.getAttribute('data-has-update') === 'true';
var NEW_VERSION = scriptTag?.getAttribute('data-new-version');
var UPDATE_MSG = scriptTag?.getAttribute('data-update-message');

var AUTHTOKENS = { idToken: '', refreshToken: '', 'Cf-JWT': '' }
var PLAYER      = undefined
var INVENTORY   = undefined
var HISTORY     = []
var PLAYERS     = []
var ROLE        = undefined
var GAME_STATUS = undefined
var IS_CONSOLE_EXPAND = false
var IS_CONSOLE_CLOSE  = false
var GOLD_WHEEL_SPINS_COUNTER  = 0
var GOLD_WHEEL_SILVER_SESSION = 0
var TOTAL_XP_SESSION = 0
var TOTAL_UP_LEVEL   = 0
var GAME_STARTED_AT  = 0
var LV_SETTINGS = {
  AUTO_JOIN_ROOMS: false,
  DEBUG_MODE:      false,
  SHOW_HIDDEN_LVL: true,
  AUTO_REPLAY:     true,
  AUTO_PLAY:       true,
  CHAT_STATS:      true,
  PLAYER_NOTES:    true,
  PLAYER_AURA:     true,
}
const PLAYERAURAMAP  = new Map();
const PLAYERNOTESMAP = new Map();
var AUTO_REPLAY_INTERVAL = undefined
var GAME_ID       = undefined
var SERVER_URL    = undefined
var GAME_SETTINGS = undefined
let DAY_COUNT  = 0;
let DAY_VOTING = [];
let GAME_VOTING = "";

// --- AUTO-PLAY (BOT BEYNİ) DEĞİŞKENLERİ ---
var AP_LOVERS          = []
var AP_DEADS           = []
var AP_JW_TARGET       = undefined
var AP_CHAT_WW_SENDED  = false
var AP_WOLVES          = []
var AP_TARGET_WW_VOTE  = undefined
let votedPlayer        = ""; // Global oylama takibi

function resetAutoPlayState() {
  AP_LOVERS         = [];
  AP_DEADS          = [];
  AP_JW_TARGET      = undefined;
  AP_CHAT_WW_SENDED = false;
  AP_WOLVES         = [];
  AP_TARGET_WW_VOTE = undefined;
  votedPlayer       = "";
}

// ─────────────────────────────────────────────
// GÜNCELLEME KONTROLÜ
// ─────────────────────────────────────────────
function checkForUpdates() {
  if (HAS_UPDATE) {
    setTimeout(() => {
      addChatMsg(`📢 GÜNCELLEME VAR: v${NEW_VERSION}`, true, 'color: #00FF00; font-size: 14px;');
      addChatMsg(`Yenilikler: ${UPDATE_MSG}`, false, 'color: #ADFF2F;');
      addChatMsg(`Şu anki sürüm: v${BOT_VERSION}`, false, 'font-size: 11px; color: #aaa;');
      $('.lv-chat-title').html(`Börü v${BOT_VERSION} <span style="color:#00FF00;font-weight:bold;animation:blink 1s infinite;">(GÜNCELLE!)</span>`);
      $('.lv-chat').css({ border: '2px solid #00FF00', 'box-shadow': '0 0 10px #00FF00' });
      $('.lv-chat-toggle').css('color', '#00FF00');
    }, 3000);
  } else {
    console.log(`[Börü] Sürüm güncel: v${BOT_VERSION}`);
    addChatMsg(`✅ Bot sürümünüz güncel: v${BOT_VERSION}`, false, 'color: #00FF00; font-size: 12px;');
  }
}

// ─────────────────────────────────────────────
// KORUMA KALDIRICI
// ─────────────────────────────────────────────
const removeWovProtections = () => {
  const startGame = $('div:contains("START GAME")')
  const ok        = $('div:contains("OK")')
  const inventory = $('div:contains("INVENTORY")')
  if (startGame?.length && ok?.length && inventory?.length) {
    startGame[startGame.length - 1].remove()
    ok[ok.length - 1].remove()
  }
}
setInterval(removeWovProtections, 1000)

// ─────────────────────────────────────────────
// BAŞLANGIÇ (MAIN)
// ─────────────────────────────────────────────
const main = async () => {
  getAuthtokens()
  loadSettings()
  injectChat()
  injectSettings()
  injectStyles()
  checkForUpdates()
  setInterval(injectChat, 1000)
  fetchInterceptor()
  socketInterceptor(onMessage)
  setInterval(setChatState, 1000)
}

// ─────────────────────────────────────────────
// UI AYARLARI VE PENCERELER
// ─────────────────────────────────────────────
const injectSettings = () => {
  $('html').append(lvModal)
  $('html').append(lvModalPerk)
  $('html').append(votingHistory)
  $('.lv-modal-close').on('click', () => { $('.lv-modal-popup-container').css({ display: 'none' }) })
  $('.lv-modal-veil').on('click', () => {
    $('.lv-modal-popup-container').css({ display: 'none' })
    $('.lv-modal-perk-container').css({ display: 'none' })
    $('.lv-modal-voting-container').css({ display: 'none' })
  })
  $('.lv-perk-settings').css({ display: (LV_SETTINGS.CHAT_STATS ? 'block' : 'none') })
  $('.lv-modal-perk-close').on('click', () => { $('.lv-modal-perk-container').css({ display: 'none' }) })
  $('.lv-modal-voting-close').on('click', () => { $('.lv-modal-voting-container').css({ display: 'none' }) })

  $('.lv-modal-rose-wheel-btn').on('click', () => {
    fetch('https://core.api-wolvesville.com/rewards/goldenWheelSpin', { method: 'POST', headers: getHeaders() })
  })
  $('.lv-modal-gold-wheel-btn').on('click', () => {
    fetch(`https://core.api-wolvesville.com/rewards/wheelRewardWithSecret/${getRewardSecret()}`, { method: 'POST', headers: getHeaders() })
  })
  $('.lv-modal-loot-boxes-btn').on('click', () => { if (INVENTORY?.lootBoxes?.length) lootBox() })

  const mkCheck = (cls, key, extra) => {
    $('.lv-modal-checkbox.' + cls).on('click', () => {
      LV_SETTINGS[key] = !LV_SETTINGS[key]
      $('.lv-modal-checkbox.' + cls).text(LV_SETTINGS[key] ? '' : '')
      extra && extra()
      saveSetting()
    })
    $('.lv-modal-checkbox.' + cls).text(LV_SETTINGS[key] ? '' : '')
  }
  
  mkCheck('debug',           'DEBUG_MODE')
  mkCheck('show-hidden-lvl', 'SHOW_HIDDEN_LVL')
  mkCheck('auto-replay',     'AUTO_REPLAY',  handleAutoReplay)
  mkCheck('auto-play',       'AUTO_PLAY')
  mkCheck('auto-join-rooms', 'AUTO_JOIN_ROOMS', () => {
    handleAutoJoin()
  })
  mkCheck('chat-stats', 'CHAT_STATS', () => {
    const s = document.querySelector('.lv-perk-settings')
    if(s) s.style.display = LV_SETTINGS.CHAT_STATS ? 'block' : 'none'
  })
  mkCheck('player-aura',  'PLAYER_AURA',  handlePlayerAura)
  mkCheck('player-notes', 'PLAYER_NOTES', handlePlayerNotes)

  $('.lv-modal-perk-refresh-aura').on('click', updateAllPlayerAura)
  $('.lv-modal-perk-refresh-notes').on('click', updatePlayerNotes)

  $('.lv-modal-voting-history').on('click', () => {
    $('.lv-modal-voting-container').css({ display: 'block' })
    $('.lv-modal-perk-container').css({ display: 'none' })
    document.getElementById('vote-log').textContent = GAME_VOTING;
  })

  $('.lv-modal-perk-message-input').on('focus', () => { $('textarea').prop('disabled', true) })
  $('.lv-modal-perk-message-input').on('blur',  () => { $('textarea').prop('disabled', false) })
  $('.lv-modal-perk-message-btn').on('click', () => {
    playerChatHiding(parseInt($('.lv-modal-perk-message-input').val()))
  })
  $('.lv-modal-perk-message-btn-undo').on('click', undoChatHiding)

  $('.lv-modal-perk-message-mention-input').on('focus', () => { $('textarea').prop('disabled', true) })
  $('.lv-modal-perk-message-mention-input').on('blur',  () => { $('textarea').prop('disabled', false) })
  $('.lv-modal-perk-message-mention-btn').on('click', () => {
    playerChatHidingMention(parseInt($('.lv-modal-perk-message-mention-input').val()))
  })
  $('.lv-modal-perk-message-mention-btn-undo').on('click', undoChatHidingMention)

  handleAutoReplay()
  handleAutoJoin()
}

// ─────────────────────────────────────────────
// PLAYER AURA & NOTES
// ─────────────────────────────────────────────
function updateAllPlayerAura() {
  PLAYERS.forEach((player) => {
    const el = $(`div:contains("${parseInt(player.gridIdx) + 1} ${player.username}")`);
    if (el?.length) {
      const grandparent = $(el[el.length - 1].parentElement.parentElement);
      const dropdown = grandparent.find('select.player-status-dropdown');
      dropdown.val(PLAYERAURAMAP.has(player.username) ? PLAYERAURAMAP.get(player.username) : 'none');
    }
  });
}

const addPlayerAura = () => {
  PLAYERS.forEach((player) => {
    const str = `${parseInt(player.gridIdx) + 1} ${player.username}`
    const el  = $(`div:contains("${str}")`)
    const username = player.username
    if (!el?.length || !username) return;
    const grandparent = $(el[el.length - 1].parentElement.parentElement.parentElement);
    if (grandparent.find('select.player-status-dropdown').length) return;

    const dropdown = $('<select></select>').addClass('player-status-dropdown').css({
      width: '40px', height: '20px', padding: '0px', marginLeft: '4px',
      marginRight: '4px', border: 'none', appearance: 'none', zIndex: '10000',
    });
    ['none','good','bad','unk'].forEach(o => dropdown.append($('<option>').val(o).text(o.charAt(0).toUpperCase()+o.slice(1))));
    dropdown.on('click mousedown focus', e => e.stopPropagation());
    grandparent.append(dropdown);
    dropdown.on('change', function () {
      const v = dropdown.val();
      $(this).css('background-color', v==='good'?'green':v==='bad'?'red':v==='unk'?'yellow':'white');
      PLAYERAURAMAP.set(username, v);
    });
  });
}
const removePlayerAura = () => $('select.player-status-dropdown').remove();
const handlePlayerAura = () => {
  if (LV_SETTINGS.PLAYER_AURA) { addChatMsg(' 🍂 Adding player aura'); PLAYERAURAMAP.clear(); addPlayerAura(); }
  else removePlayerAura();
}

const updatePlayerNotes = () => {
  PLAYERS.forEach((player) => {
    const el = $(`div:contains("${parseInt(player.gridIdx)+1} ${player.username}")`);
    if (!el?.length) return;
    const inp = $(el[el.length-1].parentElement.parentElement.parentElement).find('input.player-status-note');
    if (inp?.length && PLAYERNOTESMAP.has(player.username)) inp.val(PLAYERNOTESMAP.get(player.username));
  });
};
const addPlayerNotes = () => {
  PLAYERS.forEach((player) => {
    const str = `${parseInt(player.gridIdx)+1} ${player.username}`
    const el  = $(`div:contains("${str}")`)
    const username = player.username
    if (!el?.length || !username) return;
    const grandparent = $(el[el.length-1].parentElement.parentElement.parentElement);
    if (grandparent.find('input.player-status-note')?.length) return;
    const inp = $('<input type="text"/>').addClass('player-status-note').css({
      display:'block',width:'60px',height:'20px',fontSize:'14px',marginBottom:'2px',
      marginLeft:'4px',zIndex:'10000',position:'relative',pointerEvents:'auto',
    });
    inp.on('click mousedown focus', e => e.stopPropagation());
    inp.on('focus', () => $('textarea').prop('disabled', true));
    inp.on('blur',  () => $('textarea').prop('disabled', false));
    inp.on('input', () => PLAYERNOTESMAP.set(username, inp.val()));
    grandparent.append(inp);
  });
};
const removePlayerNotes = () => $('input.player-status-note').remove();
const handlePlayerNotes = () => {
  if (LV_SETTINGS.PLAYER_NOTES) { addChatMsg(' 🍂 Adding player notes'); PLAYERNOTESMAP.clear(); addPlayerNotes(); }
  else removePlayerNotes();
}

// ─────────────────────────────────────────────
// CHAT HIDING
// ─────────────────────────────────────────────
function _lastDayClass() {
  const el = $('div:contains("Day ")');
  const lastEl = el.last()[0];
  if (!lastEl?.className) return '';
  const cl = lastEl.className.trim().split(/\s+/);
  return cl[cl.length - 1];
}
const playerChatHiding = (givenNumber) => {
  const lc = _lastDayClass(); if (!lc) return;
  $('span.' + lc).each(function () {
    const first = $(this).text().trim().split(" ")[0];
    if (/^\d/.test(first) && first !== givenNumber.toString())
      $(this).closest('div').hide();
  });
};
const undoChatHiding = () => {
  const lc = _lastDayClass(); if (!lc) return;
  $('span.' + lc).each(function () { $(this).closest('div').show(); });
};
const playerChatHidingMention = (givenNumber) => {
  const lc = _lastDayClass(); if (!lc) return;
  $('span.' + lc).each(function () {
    const parentDiv = $(this).closest('div');
    const outside   = parentDiv.text().replace($(this).text(), '');
    if (!new RegExp(`\\b${givenNumber}\\b`).test(outside)) parentDiv.hide();
  });
};
const undoChatHidingMention = () => {
  const lc = _lastDayClass(); if (!lc) return;
  $('span.' + lc).each(function () { $(this).closest('div').show(); });
};

// ─────────────────────────────────────────────
// AUTO REPLAY / AUTO JOIN
// ─────────────────────────────────────────────
const handleAutoReplay = () => {
  if (!LV_SETTINGS.AUTO_REPLAY) return;
  function click(el) {
    const r = el.getBoundingClientRect();
    window.postMessage({ type: 'FROM_PAGE_CLICK', x: r.left + r.width/2, y: r.top + r.height/2 }, '*');
  }
  setInterval(() => {
    if (!LV_SETTINGS.AUTO_REPLAY) return;
    const startGame = $('div:contains("START GAME"):visible');
    if (startGame?.length) click(startGame[startGame.length-1]);
    const cont = $('div:contains("Continue"):visible');
    if (cont?.length) click(cont[cont.length-1]);
    const pa = $('div:contains("Play again"):visible');
    if (pa?.length) {
      click(pa[pa.length-1]);
      setTimeout(() => { const ok=$('div:contains("OK"):visible'); if(ok?.length) click(ok[ok.length-1]); }, 1000);
    }
  }, 1000);
}

const handleAutoJoin = () => {
  if (!LV_SETTINGS.AUTO_JOIN_ROOMS) return;
  function click(el) {
    const r = el.getBoundingClientRect();
    window.postMessage({ type: 'FROM_PAGE_CLICK', x: r.left + r.width/2, y: r.top + r.height/2 }, '*');
  }
  setInterval(() => {
    if (!LV_SETTINGS.AUTO_JOIN_ROOMS) return;
    const Play = $('div:contains("PLAY"):visible').not(':contains("WITH")');
    if (Play?.length) click(Play[Play.length-1]);
    const CG = $('div:contains("CUSTOM GAMES"):visible');
    if (CG?.length) click(CG[CG.length-1]);
    const VW = $('div:contains("VILL WIN"):visible');
    if (VW?.length) click(VW[VW.length-1]);
    setTimeout(() => { const j=$('div:contains("Join"):visible'); if(j?.length) click(j[j.length-1]); }, 1000);
  }, 1000);
}

// ─────────────────────────────────────────────
// SETTINGS PERSISTENCE
// ─────────────────────────────────────────────
const saveSetting = () => {
  localStorage.setItem('lv-settings', JSON.stringify(LV_SETTINGS));
  log("settings saved"); 
}
const log = (m) => { if (LV_SETTINGS.DEBUG_MODE) console.log(m) }
const loadSettings = () => {
  const s = localStorage.getItem('lv-settings');
  if (s) LV_SETTINGS = JSON.parse(s); else saveSetting();
}
const delay = (t=500) => new Promise(r => setTimeout(r, t))

const lootBox = async (c=0) => {
  if (c===40) { addChatMsg(`⏳ wait 1 min before opening again`); await delay(60000); c=0; }
  await fetch(`https://core.api-wolvesville.com/inventory/lootBoxes/${INVENTORY.lootBoxes[0].id}`, {
    method:'POST', headers: getHeaders()
  }).then(rep => {
    if (rep.status===200) {
      INVENTORY.lootBoxes.shift();
      $('.lv-modal-loot-boxes-status').text(`(${INVENTORY.lootBoxes.length} 🎁 available)`);
      if (INVENTORY.lootBoxes?.length) return lootBox(c+1);
    }
  });
}

// ─────────────────────────────────────────────
// ROLE & AUTH HELPERS
// ─────────────────────────────────────────────
const getRole = (id) => JSON.parse(localStorage.getItem('roles-meta-data'))?.roles[id]
const setRole = (id) => { ROLE = getRole(id) }

const getAuthtokens = () => {
  try {
    const a = JSON.parse(localStorage.getItem('authtokens'));
    if (a) { AUTHTOKENS.idToken = a.idToken||''; AUTHTOKENS.refreshToken = a.refreshToken||''; }
  } catch(e) { console.log('Failed to parse authtokens', e); }
}

// 🔥 BÖRÜ AJAN TAKVİYESİ (OYUNU KANDIRAN KİMLİK SORGUSU) 🔥
const getPLAYER = () => {
  log('getPLAYER called')
  fetch('https://core.api-wolvesville.com/players/meAndCheckAppVersion', { 
    method:'PUT', 
    headers:getHeaders(),
    body: JSON.stringify({ deviceId: null, locale: "en", platform: "web", versionNumber: 1 })
  }).catch(e => console.error("Kimlik doğrulama isteği başarısız:", e));
}

// ─────────────────────────────────────────────
// FETCH INTERCEPTOR (ZAFİYETLER DÜZELTİLDİ)
// ─────────────────────────────────────────────
const requestsToCatch = {
  'https://auth.api-wolvesville.com/players/signUpWithEmailAndPassword': (data) => {
    if (data?.idToken) { AUTHTOKENS.idToken=data.idToken; AUTHTOKENS.refreshToken=data.refreshToken; }
  },
  'https://auth.api-wolvesville.com/players/createIdToken': (data) => {
    if (data?.idToken) { AUTHTOKENS.idToken=data.idToken; AUTHTOKENS.refreshToken=data.refreshToken; }
  },
  'https://auth.api-wolvesville.com/cloudflareTurnstile/verify': (data) => {
    if (data.jwt) { AUTHTOKENS['Cf-JWT']=data.jwt; addChatMsg('🛡️ Cloudflare token intercepted'); }
  },
  'https://core.api-wolvesville.com/players/meAndCheckAppVersion': (data) => {
    if (data.player) {
      const { username, level } = data.player;
      !PLAYER && addChatMsg(`👋 ${username} (lvl ${level})`);
      PLAYER = data.player;
    }
  },
  'https://core.api-wolvesville.com/inventory/lootBoxes/': (data) => {
    if (data.items?.length) {
      let silver=0, loots=[];
      data.items.forEach(item => {
        loots.push(item.type);
        if (item.duplicateItemCompensationInSilver) silver+=item.duplicateItemCompensationInSilver;
        else if (item.type==='SILVER_PILE') silver+=item.silverPile.silverCount;
      });
      INVENTORY.silverCount+=silver;
      addChatMsg(`🎁 ${loots.join(', ')} and 🪙${silver}`);
    }
  },
  'https://core.api-wolvesville.com/inventory?': (data) => {
    if (data.silverCount) INVENTORY=data;
    if (data.lootBoxes!==undefined) {
      const { lootBoxes } = data;
      if (lootBoxes?.length) {
        const cb = lootBoxes.filter(v=>v.event==='LEVEL_UP_CARD').length;
        addChatMsg(`🎁 ${lootBoxes.length} boxes available ${cb?`(including ${cb} role cards)`:''}`);
      }
      $('.lv-modal-loot-boxes-status').text(`(${lootBoxes.length||0} 🎁 available)`);
    }
  },
  'https://game.api-wolvesville.com/api/public/game/running': () => {
    return new Response(JSON.stringify({ running: false }))
  },
  'https://core.api-wolvesville.com/rewards/goldenWheelSpin': (data) => {
    if (data?.length) {
      const w=data.find(v=>v.winner);
      if (w) {
        addChatMsg(`${w.silver>0?`🪙${w.silver}`:w.type} looted from 🌹 wheel`);
        INVENTORY.silverCount+=w.silver; INVENTORY.roseCount-=30; setChatState();
      }
    }
  },
  'https://core.api-wolvesville.com/rewards/wheelRewardWithSecret/': (data) => {
    if (data.code) {
      addChatMsg(`Error: spins limit hit ${JSON.stringify(data)}`, true, 'color:#ff603b;');
      $('.lv-modal-gold-wheel-status').text(`Unavailable`).css({color:'#ff603b'});
    } else if (data?.length) {
      const w=data.find(v=>v.winner);
      if (w) {
        INVENTORY.silverCount+=w.silver; GOLD_WHEEL_SPINS_COUNTER++; GOLD_WHEEL_SILVER_SESSION+=w.silver; PLAYER.silverCount+=w.silver;
        addChatMsg(`#${GOLD_WHEEL_SPINS_COUNTER}: ${w.silver>0?`🪙${w.silver}`:w.type} looted from 🪙 wheel (session: 🪙${GOLD_WHEEL_SILVER_SESSION})`);
        setChatState();
      }
    }
  },
  'https://core.api-wolvesville.com/rewards/wheelItems/v2': (data) => {
    if (data.nextRewardAvailableTime) {
      $('.lv-modal-gold-wheel-status').text(`Unavailable until ${new Date(data.nextRewardAvailableTime).toLocaleString('en-US',{timeZoneName:'short'})}`).css({color:'#ff603b'});
    } else {
      $('.lv-modal-gold-wheel-status').text(`Available`).css({color:'#67c23a'});
    }
  },
}

const fetchInterceptor = () => {
  const { fetch: origFetch } = window;
  window.fetch = async (...args) => {
    let url = args[0];
    if (typeof url !== 'string' && url && url.url) { url = url.url; }
    
    // 🔥 BAĞLANTIYI KOPARAN HATA BURADAYDI! return yerine Sahte Response dönüyoruz.
    if (url && (url.includes('/players/webBo') || url.includes('/players/webAutomatio') || url.includes('[native code]'))) {
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (url && url.startsWith('https://core.api-wolvesville.com/inventory?')) args[0]='https://core.api-wolvesville.com/inventory?';

    let req;
    if (args[0] instanceof Request) { req = args[0].clone(); }
    else { req = new Request(args[0], args[1]||{}); }
    
    for (const [k,v] of req.headers.entries()) {
      if (k.toLowerCase()==='authorization' && v.startsWith('Bearer ')) AUTHTOKENS.idToken=v.slice(7);
      if (k.toLowerCase()==='cf-jwt') AUTHTOKENS['Cf-JWT']=v;
    }

    const catchKey = Object.keys(requestsToCatch).find(_u => url && url.startsWith(_u));
    const catchMethod = catchKey ? requestsToCatch[catchKey] : null;
    
    if (catchMethod) {
      const response = await origFetch(...args);
      const mocked = await response.clone().json().then(data => { return catchMethod(data); }).catch(()=>null);
      return mocked || response;
    }
    return origFetch(...args);
  };
}

// ─────────────────────────────────────────────
// SOCKET INTERCEPTOR (GELEN PAKETLERİ OKUMA)
// ─────────────────────────────────────────────
function socketInterceptor(fn) {
  fn = fn || log;
  let property = Object.getOwnPropertyDescriptor(MessageEvent.prototype, 'data');
  const data = property.get;
  property.get = function () {
    if (!(this.currentTarget instanceof WebSocket)) return data.call(this);
    const msg = data.call(this);
    Object.defineProperty(this, 'data', { value: msg });
    fn({ data: msg, socket: this.currentTarget, event: this });
    return msg;
  };
  Object.defineProperty(MessageEvent.prototype, 'data', property);
}

const onMessage = (message) => {
  if (message.data && typeof message.data === 'string' && message.data.slice(0,2) === '42') {
    const parsed = messageParser(message.data);
    if (parsed?.length) messageDispatcher(parsed);
  }
}

function messageParser(message) {
  let tmp = message.slice(2).replaceAll('"{','{').replaceAll('}"','}').replaceAll('\\"','"');
  try { return JSON.parse(tmp); } catch { return undefined; }
}

// ─────────────────────────────────────────────
// MESSAGE DISPATCHER (OYUNUN BEYNİ - NATIVE HOOK KULLANIR)
// ─────────────────────────────────────────────
const messagesToCatch = {
  'game-joined': (data) => {
    addChatMsg('🔗 Game joined');
    const _d = Object.values(data);
    GAME_ID    = _d[0];
    SERVER_URL = _d[1];
    setTimeout(setPlayersLevel, 1000);
  },
  'game-settings-changed': (data) => { GAME_SETTINGS = data; },
  'game-starting': () => { addChatMsg('🚩 Game starting'); },

  'game-started': (data) => {
    addChatMsg('🚀 Game started');
    GAME_STATUS     = 'started';
    GAME_STARTED_AT = new Date().getTime();
    setRole(data.role);
    addChatMsg(`You are ${ROLE.name} (${ROLE?.id})`, true, 'color: #FF4081;');
    PLAYERS = data.players;
    resetAutoPlayState();
    setTimeout(setPlayersLevel, 1000);
    setTimeout(handlePlayerAura, 20000);
    setTimeout(handlePlayerNotes, 20000);
  },

  // ── GECE BAŞLADI ──────────────────────────
  'game-night-started': () => {
    setTimeout(setPlayersLevel, 1000);
    if (!LV_SETTINGS.AUTO_PLAY) return;
    setTimeout(() => {
      if (ROLE && ROLE.team === 'WEREWOLF') {
        const lover = AP_LOVERS.find(v => getRole(v.role)?.team !== 'WEREWOLF');
        if (lover) {
          const tp = PLAYERS.find(v => v?.id === lover?.id);
          if (tp) addChatMsg(`👉 Vote ${tp.gridIdx+1}. ${tp.username}`);
          AP_TARGET_WW_VOTE = lover?.id;
          gameEmit('game-werewolves-vote-set', { targetPlayerId: lover?.id });
        }
      }
    }, 1000);
  },

  // ── KURT ROLLER PAYLAŞIMI ─────────────────
  'game-werewolves-set-roles': (data) => {
    if (!LV_SETTINGS.AUTO_PLAY) return;
    AP_WOLVES = Object.entries(data.werewolves).map(([id, role]) => ({ id, role }));
    if (
      !AP_CHAT_WW_SENDED &&
      AP_LOVERS?.length &&
      AP_WOLVES?.length &&
      ROLE?.team === 'WEREWOLF' &&
      ROLE?.id   === 'junior-werewolf' &&
      AP_LOVERS.find(v => getRole(v.role)?.team !== 'WEREWOLF')
    ) {
      AP_CHAT_WW_SENDED = true;
      setTimeout(() => { gameEmit('game:chat-werewolves:msg', { msg: `Who?` }); }, 2000);
    }
  },

  // ── KURT CHAT ─────────────────────────────
  'game:chat-werewolves:msg': (data) => {
    if (!LV_SETTINGS.AUTO_PLAY) return;
    // Biri "Who?" yazarsa cevapla
    if (
      ROLE?.team === 'WEREWOLF' &&
      data.authorId !== PLAYER?.id &&
      data.msg?.toLowerCase().includes('who')
    ) {
      const lover = PLAYERS.find(v => v?.id === AP_LOVERS[0]?.id);
      if (lover) {
        setTimeout(() => { gameEmit('game:chat-werewolves:msg', { msg: `${lover.gridIdx+1}` }); }, 1000);
      }
    }
    // Junior wolf: başkasının verdiği numarayı al
    if (ROLE?.id === 'junior-werewolf' && data.msg && data.authorId !== PLAYER?.id) {
      const nums = data.msg.match(/\d+/);
      if (nums?.length) {
        const tp = PLAYERS.find(v => v.gridIdx+1 === parseInt(nums[0]));
        if (tp) {
          AP_JW_TARGET = tp.id;
          addChatMsg(`🐾 Select ${tp.gridIdx+1}. ${tp.username}`);
          gameEmit('game-junior-werewolf-selected-player', { targetPlayerId: tp.id });
        }
      }
    }
  },

  // ── KURT OY ───────────────────────────────
  'game-werewolves-vote-set': (data) => {
    if (!LV_SETTINGS.AUTO_PLAY) return;
    if (data.playerId === PLAYER?.id) return;
    const tp = PLAYERS.find(v => v?.id === data.targetPlayerId);

    // Junior wolf değilsen, jr-wolf oy verdiyse takip et
    if (
      ROLE?.id !== 'junior-werewolf' &&
      AP_WOLVES.find(v => v.role==='junior-werewolf' && v?.id===data.playerId)
    ) {
      setTimeout(() => {
        if (tp) addChatMsg(`👉 Vote ${tp.gridIdx+1}. ${tp.username}`);
        if (AP_TARGET_WW_VOTE !== data.targetPlayerId) {
          AP_TARGET_WW_VOTE = data.targetPlayerId;
          gameEmit('game-werewolves-vote-set', { targetPlayerId: data.targetPlayerId });
        }
      }, 1000);
    } else if (
      ROLE?.id !== 'junior-werewolf' &&
      !AP_WOLVES.find(v => v.role==='junior-werewolf' && v?.id===data.playerId) &&
      AP_LOVERS.find(v => ['priest','vigilante','gunner'].includes(v.role))
    ) {
      setTimeout(() => {
        if (tp) addChatMsg(`👉 Vote ${tp.gridIdx+1}. ${tp.username}`);
        if (AP_TARGET_WW_VOTE !== data.targetPlayerId) {
          AP_TARGET_WW_VOTE = data.targetPlayerId;
          gameEmit('game-werewolves-vote-set', { targetPlayerId: data.targetPlayerId });
        }
      }, 1000);
    }

    // Junior wolf: başkası oy verdiyse sen de hedefle
    if (!AP_JW_TARGET && ROLE?.id === 'junior-werewolf' && data.playerId !== PLAYER?.id) {
      AP_JW_TARGET = data.targetPlayerId;
      if (tp) addChatMsg(`🐾 Select ${tp.gridIdx+1}. ${tp.username}`);
      gameEmit('game-junior-werewolf-selected-player', { targetPlayerId: data.targetPlayerId });
    }
  },

  // ── AŞIK ROLLER ───────────────────────────
  'game-cupid-lover-ids-and-roles': (data) => {
    if (!PLAYER) getPLAYER();
    if (PLAYER && ROLE) {
      const ids   = data.loverPlayerIds.filter(v => v !== PLAYER?.id);
      const roles = data.loverRoles.filter(v => v !== ROLE?.id);
      AP_LOVERS = ids.map((id,i) => ({ id, role: roles[i] }));
      if (AP_LOVERS.length===1) {
        const l = PLAYERS.find(v => v?.id===AP_LOVERS[0]?.id);
        if(l) addChatMsg(`💘 Your lover is ${l.gridIdx+1}. ${l.username} (${AP_LOVERS[0].role})`);
      } else if (AP_LOVERS.length===2) {
        const l1=PLAYERS.find(v=>v?.id===AP_LOVERS[0]?.id), l2=PLAYERS.find(v=>v?.id===AP_LOVERS[1]?.id);
        if(l1 && l2) addChatMsg(`💘 Your lovers are ${l1.gridIdx+1}. ${l1.username} (${AP_LOVERS[0].role}) and ${l2.gridIdx+1}. ${l2.username} (${AP_LOVERS[1].role})`);
      }
    }
  },

  // ── GÜN OYU BAŞLADI ───────────────────────
  'game-day-voting-started': () => {
    if (!PLAYER) getPLAYER();
    if (!PLAYER || AP_DEADS.includes(PLAYER?.id)) return;
    if (!LV_SETTINGS.AUTO_PLAY) return;

    const wwLover = AP_LOVERS.find(v => getRole(v.role)?.team==='WEREWOLF');
    if (wwLover) {
      if (ROLE?.team==='WEREWOLF') gameEmit('game:chat-public:msg', { msg:'wc' });
      const tp = PLAYERS.find(v => v?.id===wwLover?.id);
      if (tp) addChatMsg(`👉 Vote ${tp.gridIdx+1}. ${tp.username}`);
      gameEmit('game-day-vote-set', { targetPlayerId: wwLover?.id });
    } else if (ROLE?.team==='WEREWOLF') {
      gameEmit('game:chat-public:msg', { msg:'me' });
    } else if (ROLE && [
      'serial-killer','arsonist','corruptor','bandit','cannibal',
      'evil-detective','bomber','alchemist','siren','illusionist',
      'blight','sect-leader','zombie'
    ].includes(ROLE.id)) {
      gameEmit('game:chat-public:msg', { msg:'solo' });
    }
  },

  // ── PUBLIC CHAT ───────────────────────────
  'game:chat-public:msg': (data) => {
    if (!PLAYER) getPLAYER();
    if (!LV_SETTINGS.AUTO_PLAY) return;

    if (
      PLAYER &&
      !AP_DEADS.includes(PLAYER?.id) &&
      data.authorId !== PLAYER?.id &&
      data.msg &&
      ROLE?.team === 'VILLAGER' &&
      ['Me','me','ME','m','M','wc','Wc','WC'].includes(data.msg)
    ) {
      const tp = PLAYERS.find(v => v?.id===data.authorId);
      if (tp) {
        gameEmit('game-day-vote-set', { targetPlayerId: tp.id });
        addChatMsg(`👉 Vote ${tp.gridIdx+1}. ${tp.username}`);
      }
    }
  },

  // ── GÜN OYU AYARLANDI ─────────────────────
  'game-day-vote-set': (data) => {
    if (!PLAYER) getPLAYER();
    if (!PLAYER || AP_DEADS.includes(PLAYER?.id)) return;
    if (!LV_SETTINGS.AUTO_PLAY) return;

    const tp = PLAYERS.find(v => v?.id===data.targetPlayerId);
    if(tp) {
        DAY_VOTING.push(PLAYER.id, tp.id);
    }

    if (ROLE?.id==='priest') {
      setTimeout(() => {
        if (tp) addChatMsg(`💦 Kill ${tp.gridIdx+1}. ${tp.username}`);
        gameEmit('game-priest-kill-player', { targetPlayerId: data.targetPlayerId });
      }, 1000);
    } else if (ROLE?.id==='vigilante') {
      setTimeout(() => {
        if (tp) addChatMsg(`🔫 Kill ${tp.gridIdx+1}. ${tp.username}`);
        gameEmit('game-vigilante-shoot', { targetPlayerId: data.targetPlayerId });
      }, 1000);
    } else if (ROLE?.id==='gunner') {
      setTimeout(() => {
        if (tp) addChatMsg(`🔫 Kill ${tp.gridIdx+1}. ${tp.username}`);
        gameEmit('game-gunner-shoot-player', { targetPlayerId: data.targetPlayerId });
      }, 1000);
    }
  },

  // ── ÖLÜMLER ───────────────────────────────
  'game-players-killed': (data) => {
    data.victims.forEach(victim => {
      const player = PLAYERS.find(v => v?.id===victim.targetPlayerId);
      if (player) {
        AP_DEADS.push(player.id);
        addChatMsg(`☠️ ${parseInt(player.gridIdx)+1}. ${player.username} (${victim.targetPlayerRole}) by ${victim.cause}`);
      }
    });
  },

  // ── RECONNECT ─────────────────────────────
  'game-reconnect-set-game-status': () => { /* Native soket çalışıyor */ },
  'game-reconnect-set-players': (data) => {
    PLAYERS = Object.values(data);
    PLAYERS.forEach(p => { if (!p.isAlive) AP_DEADS.push(p.id); });
    setTimeout(setPlayersLevel, 1000);
    setTimeout(handlePlayerAura, 1000);
    setTimeout(handlePlayerNotes, 1000);
    if (PLAYER) {
      const tmp = PLAYERS.find(v => v.username===PLAYER.username);
      if (tmp) {
        if (tmp.spectate) addChatMsg(`You are Spectator`, true, 'color:#FF4081;');
        else { setRole(tmp.role); addChatMsg(`You are ${ROLE.name} (${ROLE?.id})`, true, 'color:#FF4081;'); }
      }
    }
  },

  // ── OYUN SONU ─────────────────────────────
  'game-game-over': () => {
    if (GAME_STATUS==='over') return;
    GAME_STATUS='over';
    let tmp=`🏁 Game over`;
    if (GAME_STARTED_AT) { tmp+=` (${((new Date().getTime()-GAME_STARTED_AT)/1000).toFixed(0)}s)`; GAME_STARTED_AT=0; }
    addChatMsg(tmp);
    DAY_COUNT=0; DAY_VOTING=[]; GAME_VOTING='';
    resetAutoPlayState();
  },
  'game-over-awards-available': (data) => {
    if (data.playerAward.canClaimDoubleXp) {
      gameEmit('game-over-double-xp');
      addChatMsg('Claim double xp', true, 'color:rgb(17,255,0);');
    } else {
      TOTAL_XP_SESSION += data.playerAward.awardedTotalXp;
      addChatMsg(`🧪 ${data.playerAward.awardedTotalXp} xp`);
      if (data.playerAward.awardedLevels) {
        PLAYER.level += data.playerAward.awardedLevels;
        TOTAL_UP_LEVEL += data.playerAward.awardedLevels;
        log(`🆙 ${PLAYER.level}`);
      }
    }
  },

  'disconnect': () => {
    ROLE=undefined; PLAYERS=[]; GAME_ID=undefined; SERVER_URL=undefined; GAME_SETTINGS=undefined;
    resetAutoPlayState();
  },
}

const messageDispatcher = (message) => {
  const msg    = message[0];
  const data   = message.length > 1 ? message[1] : null;
  const method = messagesToCatch[msg];
  if(method) method(data);
}

// ─────────────────────────────────────────────
// CHAT UI & GÖRÜNÜM
// ─────────────────────────────────────────────
function setPlayersLevel() {
  if (!LV_SETTINGS.SHOW_HIDDEN_LVL) return;
  PLAYERS.forEach((player) => {
    const str = `${parseInt(player.gridIdx)+1} ${player.username}`;
    const el  = $(`div:contains("${str}")`);
    const newName = `${parseInt(player.gridIdx)+1} ${player.username} [${player.level}] ${player.clanTag||''}`;
    if (el?.length) {
      el[el.length-1].innerHTML = newName;
      el[el.length-1].className = 'lv-username';
      el[el.length-1].parentElement.className = 'lv-username-box';
    }
  });
}

const addChatEvents = () => {
  $('.lv-chat-toggle').on('click', () => { IS_CONSOLE_EXPAND=!IS_CONSOLE_EXPAND; if(IS_CONSOLE_EXPAND) IS_CONSOLE_CLOSE=false; onToggleChat(); });
  $('.lv-chat-close').on('click',  () => { IS_CONSOLE_CLOSE=!IS_CONSOLE_CLOSE; if(IS_CONSOLE_CLOSE) IS_CONSOLE_EXPAND=false; onToggleChat(); });
  $('.lv-chat-settings').on('click', () => { $('.lv-modal-popup-container').css({display:'block'}); });
  $('.lv-perk-settings').on('click',  () => { $('.lv-modal-perk-container').css({display:'block'}); });
}

function injectChat() {
  const lvChat   = $('.lv-chat');
  const gameChat = $('div[style="flex: 1 1 0%; margin-top: 16px;"]');
  const endScreen= $('div[style="font-size: 28px; color: rgba(255, 255, 255, 0.87); font-family: FontAwesome6_Pro_Solid; font-weight: normal; font-style: normal;"]');
  if (!lvChat.length) {
    $('html').append(lvChatEl); onToggleChat(); addChatEvents(); injectHistory();
  } else {
    if (!endScreen.length && gameChat.length) {
      if (!lvChat.hasClass('game')) { lvChat.appendTo(gameChat); lvChat.removeClass().addClass('lv-chat game'); scrollToBottom(); }
    } else {
      if (!lvChat.hasClass('abs')) { lvChat.appendTo('html'); lvChat.removeClass().addClass('lv-chat abs'); scrollToBottom(); }
    }
    if (lvChat.hasClass('game')) {
      $('.lv-chat.game').css({width:'100%'});
      $('.lv-chat-title, .lv-chat-state').css({display:'block'});
    }
    if (lvChat.hasClass('abs')) {
      $('.lv-chat.abs').css({width: IS_CONSOLE_CLOSE?'80px':'500px'});
      $('.lv-chat-title, .lv-chat-state').css({display: IS_CONSOLE_CLOSE?'none':'block'});
    }
  }
}

function addChatMsg(message, strong=false, style='') {
  log(`[Börü] ${message}`);
  if (strong) message=`<strong>${message}</strong>`;
  const inner=`<div class="lv-chat-msg" style="${style}">[${formatTime(new Date(Date.now()))}] ${message}</div>`;
  HISTORY.push(inner);
  $('.lv-chat-container').append(inner);
  scrollToBottom();
}
function addOldChatMsg(inner) { $('.lv-chat-container').append(inner); scrollToBottom(); }
function injectHistory() {
  const lvChat = $('.lv-chat');
  if (!lvChat.length) return;
  if (HISTORY.length) { if (!$('.lv-chat-msg').length) HISTORY.forEach(addOldChatMsg); }
  else addChatMsg(`🔥 Wolvesville v${BOT_VERSION} injected !`, true, 'color: #ffe31f;');
}
function injectStyles() { $('html').append(lvStyles); }

function formatTime(d) {
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}.${d.getMilliseconds().toString().padStart(3,'0')}`;
}
function scrollToBottom() {
  const elems = document.getElementsByClassName('lv-chat-container');
  if (elems?.length) elems[0].scrollTop = elems[0].scrollHeight;
}
const onToggleChat = () => {
  $('.lv-chat-toggle').text(IS_CONSOLE_EXPAND ? '' : '');
  $('.lv-chat-container').css({
    height: IS_CONSOLE_EXPAND?'180px':'0',
    padding: IS_CONSOLE_EXPAND?'.25rem .5rem':'0',
    'border-top': IS_CONSOLE_EXPAND?'thin solid #414243':'0',
  });
  $('.lv-chat').css({opacity: IS_CONSOLE_EXPAND?'1':'.5'});
  $('.lv-chat.abs').css({width: IS_CONSOLE_CLOSE?'80px':'500px'});
  $('.lv-chat-title, .lv-chat-state').css({display: IS_CONSOLE_CLOSE?'none':'block'});
}
const setChatState = () => {
  if (INVENTORY) {
    $('.lv-chat-state').text(`🪙${INVENTORY.silverCount} 🌹${INVENTORY.roseCount} 🧪${TOTAL_XP_SESSION} 🆙${TOTAL_UP_LEVEL}`);
  }
}

// ─────────────────────────────────────────────
// HTML TEMPLATES
// ─────────────────────────────────────────────
const lvChatEl = `
<div class="lv-chat abs">
  <div class="lv-chat-header">
    <div style="display:flex;align-items:center">
      <div class="lv-chat-toggle lv-icon"></div>
      <div class="lv-chat-title">Börü v${BOT_VERSION}</div>
    </div>
    <div class="lv-chat-state"></div>
    <div style="display:flex;align-items:center">
      <div class="lv-chat-close lv-icon"></div>
      <div class="lv-chat-settings lv-icon"></div>
      <div class="lv-perk-settings lv-icon" style="padding-left:6px">+</div>
    </div>
  </div>
  <div class="lv-chat-container"></div>
</div>`

const lvModal = `
<div class="lv-modal-popup-container">
  <div class="lv-modal-veil"></div>
  <div class="lv-modal">
    <div class="lv-modal-header">
      <div style="display:flex;align-items:center"><div class="lv-icon"></div><span class="lv-modal-title">Settings</span></div>
      <div class="lv-icon lv-modal-close"></div>
    </div>
    <div class="lv-modal-container">
      <div class="lv-modal-section">
        <div class="lv-modal-subtitle">General</div>
        <div class="lv-modal-option"><div class="lv-modal-checkbox debug lv-icon"></div><span>Debug mode</span></div>
      </div>
      <div class="lv-modal-section">
        <div class="lv-modal-subtitle">In Game</div>
        <div class="lv-modal-option"><div class="lv-modal-checkbox show-hidden-lvl lv-icon"></div><span>Show hidden level</span></div>
        <div class="lv-modal-option"><div class="lv-modal-checkbox auto-replay lv-icon"></div><span>Auto replay</span></div>
        <div class="lv-modal-option"><div class="lv-modal-checkbox auto-play lv-icon"></div><span>Auto play (custom/couples)</span></div>
        <div class="lv-modal-option"><div class="lv-modal-checkbox auto-join-rooms lv-icon"></div><span>Auto join rooms</span> <strong class="lv-new">EXPERIMENTAL 🔥</strong></div>
        <div class="lv-modal-option"><div class="lv-modal-checkbox chat-stats lv-icon"></div><span>Chat stats perk</span></div>
      </div>
      <div class="lv-modal-section">
        <div class="lv-modal-subtitle">Commands</div>
        <div class="lv-modal-command"><button class="lv-modal-gold-wheel-btn">Spin Gold Wheel</button><span class="lv-modal-gold-wheel-status"></span></div>
        <div class="lv-modal-command"><button class="lv-modal-rose-wheel-btn">Spin Rose Wheel</button><span style="font-style:italic">(cost 30 🌹/spin)</span></div>
        <div class="lv-modal-command"><button class="lv-modal-loot-boxes-btn">Open all loot boxes</button><span class="lv-modal-loot-boxes-status" style="font-style:italic"></span></div>
      </div>
      <div class="lv-modal-footer">Made by ❤️ <strong>&nbsp;Varietyshopware&nbsp;</strong> | Special thanks to Arsen</div>
    </div>
  </div>
</div>`

const lvModalPerk = `
<div class="lv-modal-perk-container">
  <div class="lv-modal-veil"></div>
  <div class="lv-modal">
    <div class="lv-modal-header">
      <div style="display:flex;align-items:center"><div class="lv-icon"></div><span class="lv-modal-title">Perks</span></div>
      <div class="lv-icon lv-modal-perk-close"></div>
    </div>
    <div class="lv-modal-container">
      <div class="lv-modal-section">
        <div class="lv-modal-subtitle">Perk settings</div>
        <div class="lv-modal-option"><div class="lv-modal-checkbox player-aura lv-icon"></div><span>Player Aura</span><button class="lv-modal-perk-refresh-aura" style="margin-left:10px;">Refresh</button></div>
        <div class="lv-modal-option"><div class="lv-modal-checkbox player-notes lv-icon"></div><span>Player Notes</span></div>
        <div class="lv-modal-option"><button class="lv-modal-voting-history">Show</button><span>Voting History</span></div>
      </div>
      <div class="lv-modal-section">
        <div class="lv-modal-subtitle">Commands</div>
        <div class="lv-modal-command"><span>See messages by player #: </span><input type="text" class="lv-modal-perk-message-input"><button class="lv-modal-perk-message-btn">Do</button><button class="lv-modal-perk-message-btn-undo">Undo</button></div>
        <div class="lv-modal-command"><span>See messages mentioning #: </span><input type="text" class="lv-modal-perk-message-mention-input"><button class="lv-modal-perk-message-mention-btn">Do</button><button class="lv-modal-perk-message-mention-btn-undo">Undo</button></div>
      </div>
      <div class="lv-modal-footer">Made by ❤️ <strong>&nbsp;Varietyshopware&nbsp;</strong> | Special thanks to Arsen</div>
    </div>
  </div>
</div>`

const votingHistory = `
<div class="lv-modal-voting-container">
  <div class="lv-modal-veil"></div>
  <div class="lv-modal">
    <div class="lv-modal-header">
      <div style="display:flex;align-items:center"><div class="lv-icon"></div><span class="lv-modal-title">Voting History</span></div>
      <div class="lv-icon lv-modal-voting-close"></div>
    </div>
    <div class="lv-modal-container">
      <div class="lv-modal-section"><div class="lv-modal-option"><div id="vote-log" style="white-space:pre-wrap;"></div></div></div>
      <div class="lv-modal-footer">Made by ❤️ <strong>&nbsp;Varietyshopware&nbsp;</strong> | Special thanks to Arsen</div>
    </div>
  </div>
</div>`

const lvStyles = `
<style>
@keyframes blink { 0%{opacity:1}50%{opacity:0}100%{opacity:1} }
div { user-select: auto !important; }
.lv-chat {
  width:100%;margin-top:1rem;box-sizing:border-box;background-color:#181818;
  border:thin solid #414243;border-radius:.5rem;
  font:13px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#fafafa;
}
.lv-chat-header { height:28px;background-color:#181818;border-radius:.5rem;padding:0 6px;font-size:13px;display:flex;align-items:center;justify-content:space-between; }
.lv-modal-close,.lv-chat-toggle,.lv-chat-close,.lv-chat-settings { font-size:18px;cursor:pointer;user-select:none!important; }
.lv-perk-settings { font-size:18px;cursor:pointer;user-select:none!important;display:block; }
.lv-chat-close,.lv-chat-toggle { margin-right:6px; }
.lv-chat-state { font-weight:500;display:flex;align-items:center; }
.lv-chat-container { overflow-y:scroll;height:180px;transition:height .25s ease-out;scrollbar-color:#fafafa rgba(0,0,0,0)!important;display:flex;flex-direction:column; }
.lv-chat.abs { position:absolute;bottom:4rem;left:1rem;z-index:1041;width:500px;transition:width .25s ease-out; }
.lv-chat-msg { display:inline;text-align:inherit;text-decoration:none;white-space:pre-wrap;overflow-wrap:break-word; }
.lv-username { color:#fafafa;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-weight:500; }
.lv-username-box { background-color:#181818;padding:2px 8px 4px 8px;border-radius:8px; }
.lv-modal-popup-container,.lv-modal-perk-container,.lv-modal-voting-container { display:none; }
.lv-modal { z-index:1042;position:absolute;left:50%;top:40%;width:500px;transform:translate(-50%,-50%);background-color:#181818;border:thin solid #414243;border-radius:.5rem;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#fafafa; }
.lv-modal-veil { position:absolute;top:0;width:100%;height:100%;background-color:rgb(17,23,31);opacity:0.7;z-index:1040; }
.lv-modal-header { height:2rem;font-size:18px;gap:1rem;padding:0.5rem 1rem;border-bottom:thin solid #414243;display:flex;align-items:center;justify-content:space-between; }
.lv-modal-title { font-weight:bold;margin-left:.5rem; }
.lv-modal-container { padding:1rem 1.25rem; }
.lv-modal-section { padding-bottom:.75rem;margin-bottom:.75rem;border-bottom:thin solid #414243; }
.lv-modal-subtitle { font-size:16px;font-weight:bold;margin-bottom:.5rem; }
.lv-modal-command { margin-bottom:.25rem;display:flex;align-items:center; }
.lv-modal-command button { font-size:14px;cursor:pointer;margin-right:.5rem; }
.lv-modal-gold-wheel-status { font-weight:bold; }
.lv-modal-option { display:flex;align-items:center;margin-bottom:.25rem; }
.lv-modal-option .lv-modal-checkbox { margin-right:.5rem;font-size:18px;cursor:pointer; }
.lv-modal-option .lv-new { color:rgb(255,2,2)!important; }
.lv-modal-option span { font-size:14px; }
.lv-modal-footer { width:100%;display:flex;align-items:center;justify-content:center;font-size:12px; }
.lv-icon { font-family:FontAwesome6_Pro_Regular; }
</style>`

// ─────────────────────────────────────────────
// PATCH LOCALSTORAGE
// ─────────────────────────────────────────────
const patchLocalStorage = () => {
  var orig = localStorage.setItem;
  localStorage.setItem = function(k,v) {
    if (k==='open-page') { localStorage.removeItem(k); return; }
    orig.apply(this, arguments);
  };
}

patchLocalStorage();
main();