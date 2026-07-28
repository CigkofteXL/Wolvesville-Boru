console.log('Börü Bot injected')

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
  DEBUG_MODE: false,
  SHOW_HIDDEN_LVL: true,
  AUTO_REPLAY: true,
  AUTO_PLAY: true,
  CHAT_STATS: true,
  PLAYER_NOTES: true,
  PLAYER_AURA: true,
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
  setInterval(injectChat, 1000)
  fetchInterceptor()
  socketInterceptor(onMessage)
  setInterval(setChatState, 1000)
}

const injectSettings = () => {
  $('html').append(lvModal)
  $('html').append(lvModalPerk)
  $('html').append(votingHistory)
  $('.lv-modal-close').on('click', () => {
    $('.lv-modal-popup-container').css({ display: 'none' })
  })
  $('.lv-modal-veil').on('click', () => {
    $('.lv-modal-popup-container').css({ display: 'none' })
  })
  $('.lv-perk-settings').css({ display: (LV_SETTINGS.CHAT_STATS ? 'block' : 'none') })
  $('.lv-modal-perk-close').on('click', () => {
    $('.lv-modal-perk-container').css({ display: 'none' })
  })
  $('.lv-modal-voting-close').on('click', () => {
    $('.lv-modal-voting-container').css({ display: 'none' })
  })
  $('.lv-modal-veil').on('click', () => {
    $('.lv-modal-popup-container').css({ display: 'none' })
    $('.lv-modal-perk-container').css({ display: 'none' })
    $('.lv-modal-voting-container').css({ display: 'none' })
  })
  $('.lv-modal-rose-wheel-btn').on('click', () => {
    fetch('https://core.api-wolvesville.com/rewards/goldenWheelSpin', {
      method: 'POST',
      headers: getHeaders(),
    })
  })
  $('.lv-modal-gold-wheel-btn').on('click', () => {
    fetch(`https://core.api-wolvesville.com/rewards/wheelRewardWithSecret/${getRewardSecret()}`, {
      method: 'POST',
      headers: getHeaders(),
    });
  });
  $('.lv-modal-loot-boxes-btn').on('click', () => {
    if (INVENTORY.lootBoxes?.length) lootBox()
  })
  $('.lv-modal-checkbox.debug').on('click', () => {
    LV_SETTINGS.DEBUG_MODE = !LV_SETTINGS.DEBUG_MODE
    $('.lv-modal-checkbox.debug').text(LV_SETTINGS.DEBUG_MODE ? '' : '')
    saveSetting()
  })
  $('.lv-modal-checkbox.show-hidden-lvl').on('click', () => {
    LV_SETTINGS.SHOW_HIDDEN_LVL = !LV_SETTINGS.SHOW_HIDDEN_LVL
    $('.lv-modal-checkbox.show-hidden-lvl').text(LV_SETTINGS.SHOW_HIDDEN_LVL ? '' : '')
    saveSetting()
  })
  $('.lv-modal-checkbox.auto-replay').on('click', () => {
    LV_SETTINGS.AUTO_REPLAY = !LV_SETTINGS.AUTO_REPLAY
    $('.lv-modal-checkbox.auto-replay').text(LV_SETTINGS.AUTO_REPLAY ? '' : '')
    handleAutoReplay()
    saveSetting()
  })
  $('.lv-modal-checkbox.auto-play').on('click', () => {
    LV_SETTINGS.AUTO_PLAY = !LV_SETTINGS.AUTO_PLAY
    $('.lv-modal-checkbox.auto-play').text(LV_SETTINGS.AUTO_PLAY ? '' : '')
    saveSetting()
  })
  $('.lv-modal-checkbox.auto-join-rooms').on('click', () => {
    LV_SETTINGS.AUTO_JOIN_ROOMS = !LV_SETTINGS.AUTO_JOIN_ROOMS
    $('.lv-modal-checkbox.auto-join-rooms').text(LV_SETTINGS.AUTO_JOIN_ROOMS ? '' : '')
    handleAutoJoin()
    saveSetting()

    console.log("LETS PLAY SERİOUS!");
    // Kaydetme veya işlem yapma kodu...
})
  $('.lv-modal-checkbox.chat-stats').on('click', () => {
    LV_SETTINGS.CHAT_STATS = !LV_SETTINGS.CHAT_STATS
    $('.lv-modal-checkbox.chat-stats').text(LV_SETTINGS.CHAT_STATS ? '' : '')
    const settingsDiv = document.querySelector('.lv-perk-settings');
    if (LV_SETTINGS.CHAT_STATS) {
      settingsDiv.style.display = 'block';
    } else {
      settingsDiv.style.display = 'none';
    }
    saveSetting()
  })
  $('.lv-modal-checkbox.debug').text(LV_SETTINGS.DEBUG_MODE ? '' : '')
  $('.lv-modal-checkbox.show-hidden-lvl').text(LV_SETTINGS.SHOW_HIDDEN_LVL ? '' : '')
  $('.lv-modal-checkbox.auto-replay').text(LV_SETTINGS.AUTO_REPLAY ? '' : '')
  $('.lv-modal-checkbox.auto-play').text(LV_SETTINGS.AUTO_PLAY ? '' : '')
  $('.lv-modal-checkbox.chat-stats').text(LV_SETTINGS.CHAT_STATS ? '' : '')

  // perk menu
  $('.lv-modal-checkbox.player-aura').on('click', () => {
    LV_SETTINGS.PLAYER_AURA = !LV_SETTINGS.PLAYER_AURA
    $('.lv-modal-checkbox.player-aura').text(LV_SETTINGS.PLAYER_AURA ? '' : '')
    handlePlayerAura()
    saveSetting()
  })
  $('.lv-modal-checkbox.player-notes').on('click', () => {
    LV_SETTINGS.PLAYER_NOTES = !LV_SETTINGS.PLAYER_NOTES
    $('.lv-modal-checkbox.player-notes').text(LV_SETTINGS.PLAYER_NOTES ? '' : '')
    handlePlayerNotes()
    saveSetting()
  })

  $('.lv-modal-checkbox.player-aura').text(LV_SETTINGS.PLAYER_AURA ? '' : '')
  $('.lv-modal-checkbox.player-notes').text(LV_SETTINGS.PLAYER_NOTES ? '' : '')

  $('.lv-modal-perk-refresh-aura').on('click', () => {
    updateAllPlayerAura()
  })
  $('.lv-modal-voting-history').on('click', () => {
    $('.lv-modal-voting-container').css({ display: 'block' })
    $('.lv-modal-perk-container').css({ display: 'none' })
    const voteLogDiv = document.getElementById('vote-log');
    voteLogDiv.textContent = GAME_VOTING;
  })
  $('.lv-modal-perk-refresh-notes').on('click', () => {
    updatePlayerNotes()
  })

  $('.lv-modal-perk-message-input').on('focus', function () {
    // Disable all textareas
    $('textarea').prop('disabled', true);
  });

  $('.lv-modal-perk-message-input').on('blur', function () {
    $('textarea').prop('disabled', false);
  });

  $('.lv-modal-perk-message-btn').on('click', () => {
    const numToDel = parseInt($('.lv-modal-perk-message-input').val())
    playerChatHiding(numToDel);
  })
  $('.lv-modal-perk-message-btn-undo').on('click', () => {
    undoChatHiding();
  })

  $('.lv-modal-perk-message-mention-input').on('focus', function () {
    // Disable all textareas
    $('textarea').prop('disabled', true);
  });

  $('.lv-modal-perk-message-mention-input').on('blur', function () {
    $('textarea').prop('disabled', false);
  });


  $('.lv-modal-perk-message-mention-btn').on('click', () => {
    const numToDel = parseInt($('.lv-modal-perk-message-mention-input').val())
    playerChatHidingMention(numToDel);
  })
  $('.lv-modal-perk-message-mention-btn-undo').on('click', () => {
    undoChatHidingMention();
  })

  handleAutoReplay()
  handleAutoJoin()

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
  if (LV_SETTINGS.PLAYER_AURA) {
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
  if (LV_SETTINGS.PLAYER_NOTES) {
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
  // Eski zamanlayıcıyı temizle
  if (window.AUTO_REPLAY_INTERVAL) clearInterval(window.AUTO_REPLAY_INTERVAL);

  if (LV_SETTINGS.AUTO_REPLAY) {
    console.log("[BÖRÜ] Auto Replay Aktif (Firefox/Chrome Uyumlu)");

    function click(element, name = "Element") {
      const rect = element.getBoundingClientRect();
      
      // Görünürlük ve boyut kontrolü
      if (rect.width <= 0 || rect.height <= 0) return;

      // 1. Elementin sayfa içindeki merkezi
      const elementX = rect.left + (rect.width / 2);
      const elementY = rect.top + (rect.height / 2);

      // 2. Tarayıcı çerçeve payı (Firefox için kritik, Chrome için 0 gelir)
      const screenOffsetX = window.mozInnerScreenX || 0; 
      const screenOffsetY = window.mozInnerScreenY || 0;

      // 3. Gerçek ekran koordinatı
      const finalX = elementX + screenOffsetX;
      const finalY = elementY + screenOffsetY;

      console.log(`[BÖRÜ] 🎯 ${name} Tıklandı -> X:${Math.round(finalX)} Y:${Math.round(finalY)}`);
      
      // Arka plana gönder
      window.postMessage({ type: 'FROM_PAGE_CLICK', x: finalX, y: finalY }, '*');
    }

    window.AUTO_REPLAY_INTERVAL = setInterval(() => {
      if (!LV_SETTINGS.AUTO_REPLAY) return;
      
      // Buton tanımları
      const startGame = $('div:contains("START GAME"):visible');
      const Continue = $('div:contains("Continue"):visible');
      const playAgain = $('div:contains("Play again"):visible');
      const ok = $('div:contains("OK"):visible');

      if (startGame?.length) click(startGame[startGame.length - 1], "Start Game");
      if (Continue?.length) click(Continue[Continue.length - 1], "Continue");

      if (playAgain?.length) {
        click(playAgain[playAgain.length - 1], "Play Again");
        
        setTimeout(() => {
          if (ok?.length) click(ok[ok.length - 1], "OK");
        }, 1000);
      } 
    }, 1000);
  }
}
const handleAutoJoin = () => {
  if (LV_SETTINGS.AUTO_JOIN_ROOMS) {
    
    // Firefox uyumlu click fonksiyonu (Scope içinde tanımladık)
    function click(element, name = "Join Element") {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const elementX = rect.left + (rect.width / 2);
      const elementY = rect.top + (rect.height / 2);

      // Firefox || Chrome ayrımı
      const screenOffsetX = window.mozInnerScreenX || 0;
      const screenOffsetY = window.mozInnerScreenY || 0;

      const finalX = elementX + screenOffsetX;
      const finalY = elementY + screenOffsetY;

      window.postMessage({ type: 'FROM_PAGE_CLICK', x: finalX, y: finalY }, '*');
    }

    setInterval(() => {
      if (!LV_SETTINGS.AUTO_JOIN_ROOMS) return;

      const Play = $('div:contains("PLAY"):visible').not(':contains("WITH")');
      if (Play?.length) click(Play[Play.length - 1], "PLAY");

      const CGames = $('div:contains("CUSTOM GAMES"):visible');
      if (CGames?.length) click(CGames[CGames.length - 1], "CUSTOM GAMES");

      const Villwinrooms = $('div:contains("VILL WIN"):visible');
      if (Villwinrooms?.length) click(Villwinrooms[Villwinrooms.length - 1], "VILL WIN ROOM");

      setTimeout(() => {
          const join = $('div:contains("Join"):visible');
          if (join?.length) click(join[join.length - 1], "Join Button");
      }, 1000);

    }, 1000);
  }
}
const saveSetting = () => {
  let settings = {
    AUTO_JOIN_ROOMS: LV_SETTINGS.AUTO_JOIN_ROOMS,
    DEBUG_MODE: LV_SETTINGS.DEBUG_MODE,
    SHOW_HIDDEN_LVL: LV_SETTINGS.SHOW_HIDDEN_LVL,
    AUTO_REPLAY: LV_SETTINGS.AUTO_REPLAY,
    AUTO_PLAY: LV_SETTINGS.AUTO_PLAY,
    CHAT_STATS: LV_SETTINGS.CHAT_STATS,
    PLAYER_NOTES: LV_SETTINGS.PLAYER_NOTES,
    PLAYER_AURA: LV_SETTINGS.PLAYER_AURA,
  }
  localStorage.setItem('lv-settings', JSON.stringify(settings))
  log("settings saved")
  log(settings)
}

const log = (m) => {
  if (LV_SETTINGS.DEBUG_MODE) console.log(m)
}

const loadSettings = () => {
  const settings = localStorage.getItem('lv-settings')
  if (settings) {
    LV_SETTINGS = JSON.parse(settings)
  } else {
    saveSetting()
  }
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

  REGULARSOCKET.on('disconnect', () => {
    addChatMsg('🤖 Parallel socket disconnected')
    REGULARSOCKET = undefined
  })
  REGULARSOCKET.on('game-joined', () => {
    addChatMsg('🤖 Parallel socket connected')
  })

  REGULARSOCKET.on('game-over-awards-available', (_data) => {
    DAY_COUNT = 0;
    DAY_VOTING = [];
    GAME_VOTING = "";
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
      setTimeout(() => {
        REGULARSOCKET.disconnect()
      }, 500)
    }
  })
  REGULARSOCKET.onAny((...args) => {
    log(args)
  })
}

const connectSocket = () => {
  console.log("mr socket called");
  var LOVERS = []
  var DEADS = []
  var JW_TARGET = undefined
  var CHAT_WW_SENDED = false
  var WOLVES = []
  var TARGET_WW_VOTE = undefined
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
    if (!PLAYER) {
      getPLAYER();
    }
    if (PLAYER && !DEADS.includes(PLAYER?.id)) {
      const wwLover = LOVERS.find((v) => getRole(v.role).team === 'WEREWOLF')
      if (wwLover) {
        if (ROLE && ROLE.team === 'WEREWOLF') {
          SOCKET.emit('game:chat-public:msg', JSON.stringify({ msg: 'wc' }))
        }
        const targetPlayer = PLAYERS.find((v) => v?.id === wwLover?.id)
        if (targetPlayer) {
          addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
        }
        SOCKET.emit('game-day-vote-set', JSON.stringify({ targetPlayerId: wwLover?.id }))
      } else if (ROLE && ROLE.team === 'WEREWOLF') {
        SOCKET.emit('game:chat-public:msg', JSON.stringify({ msg: 'me' }))
      } else if (
        ROLE &&
        [
          'serial-killer',
          'arsonist',
          'corruptor',
          'bandit',
          'cannibal',
          'evil-detective',
          'bomber',
          'alchemist',
          'siren',
          'illusionist',
          'blight',
          'sect-leader',
          'zombie',
        ].includes(ROLE.id)
      ) {
        SOCKET.emit('game:chat-public:msg', JSON.stringify({ msg: 'solo' }))
      }
    }
  })
  // Case nobody vote the wolf, and someone writes "me"
  // to - do
  SOCKET.on('game:chat-public:msg', (_data) => {
    const data = JSON.parse(_data)
    if (!PLAYER) {
      getPLAYER();
    }
    if (
      PLAYER &&
      !DEADS.includes(PLAYER?.id) &&
      data.authorId !== PLAYER?.id &&
      data.msg &&
      ROLE &&
      ROLE.team === 'VILLAGER' &&
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
    setTimeout(setPlayersLevel, 1000)
    setTimeout(handlePlayerAura, 20000)
    setTimeout(handlePlayerNotes, 20000)
    setTimeout(() => {
      if (
        !SOCKET &&
        LV_SETTINGS.AUTO_PLAY &&
        GAME_SETTINGS.gameMode === 'custom' &&
        GAME_SETTINGS.allCoupled &&
        GAME_ID &&
        SERVER_URL
      ) {
        connectSocket()
      }
      if (!REGULARSOCKET && !(GAME_SETTINGS.gameMode === 'custom') && GAME_ID && SERVER_URL) {
        connectRegularSocket()
      }
    }, 1000)
  },
  'player-joined-and-equipped-items': (data) => { },
  'game-set-game-status': (data) => { },
  'game-reconnect-set-game-status': (data) => {
    setTimeout(() => {
      if (
        !SOCKET &&
        LV_SETTINGS.AUTO_PLAY &&
        GAME_SETTINGS.gameMode === 'custom' &&
        GAME_SETTINGS.allCoupled &&
        GAME_ID &&
        SERVER_URL
      ) {
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
  $('.lv-chat-settings').on('click', () => {
    $('.lv-modal-popup-container').css({ display: 'block' })
  })
  $('.lv-perk-settings').on('click', () => {
    $('.lv-modal-perk-container').css({ display: 'block' })
  })
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
        <div class="lv-modal-section">
          <div class="lv-modal-subtitle">General</div>
          <div class="lv-modal-option">
            <div class="lv-modal-checkbox debug lv-icon"></div>
            <span>Debug mode</span>
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
            <span>Auto replay when game is over (your game must be in english)</span>
          </div>
          <div class="lv-modal-option">
            <div class="lv-modal-checkbox auto-play lv-icon"></div>
            <span>Auto play in custom games (couples settings) 
          </div>
          <div class="lv-modal-option">
            <div class="lv-modal-checkbox auto-join-rooms lv-icon"></div>
            <span>Auto join rooms (for guests)</span> <strong class="lv-new">EXPERIMENTAL 🔥</strong></span></span>
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
            <span style="font-style: italic;">(cost 30 🌹/spin)</span>
            <span class="lv-modal-rose-wheel-status"></span>
          </div>
          <div class="lv-modal-command">
            <button class="lv-modal-loot-boxes-btn">Open all loot boxes</button>
            <span class="lv-modal-loot-boxes-status" style="font-style: italic;"></span>
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
    position: absolute;
    left: 50%;
    top: 40%;
    width: 500px;
    transform: translate(-50%, -50%);
    background-color: #181818;
    border: thin solid #414243;
    border-radius: .5rem;
    font: 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #fafafa;
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

main()

window.addEventListener('load', function () { })


