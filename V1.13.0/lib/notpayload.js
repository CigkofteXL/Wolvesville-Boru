console.log('Börü Bot injected')

var NATIVE_SOCKET = null
const SafWebSocketSend = window.WebSocket.prototype.send

const interceptNativeSocket = () => {
  const OrigWebSocket = window.WebSocket

  window.WebSocket = function (...args) {
    const ws = new OrigWebSocket(...args)

    console.log(`🐺 [DEBUG] Yeni WebSocket oluşturuldu. URL:`, args[0])

    ws.addEventListener('open', function (e) {
      console.log(`🐺 [DEBUG] Soket AÇILDI. URL: ${ws.url}`)
      if (ws.url.includes('api-wolvesville.com')) {
        NATIVE_SOCKET = ws
        console.log('%c🐺 Börü: Native Socket kancaya takıldı!', 'background: green; color: white; padding: 2px;')
      }
    })

    ws.addEventListener('close', function (e) {
      console.warn(`🐺 [DEBUG] Soket KAPANDI. Kod: ${e.code}, Sebep: ${e.reason}`)
    })

    ws.addEventListener('error', function (e) {
      console.error(`🐺 [DEBUG] Soket HATASI!`, e)
    })

    const oyununKendiSendi = ws.send
    ws.send = function (data) {
      if (typeof data === 'string' && data.startsWith('42')) {
        console.log(`%c🐺 [DEBUG - OYUN GÖNDERİYOR]`, 'color: orange;', data)
      }
      return oyununKendiSendi.apply(this, arguments)
    }

    ws.addEventListener('message', function (event) {
      if (typeof event.data === 'string' && event.data.startsWith('42')) {
        const parsedMessage = messageParser(event.data)
        if (parsedMessage && parsedMessage.length) {
          messageDispatcher(parsedMessage)
        }
      }
    })

    return ws
  }
}
interceptNativeSocket()


if (
  document.title === 'Just a moment...' ||
  document.getElementById('challenge-form') ||
  document.title.includes('Cloudflare')
) {
  console.log('🐺 Börü: Cloudflare koruma ekranı algılandı. Bot devre dışı bırakılıyor.')

  throw new Error('Börü: Cloudflare Bypass Bekleniyor...')
}

let CACHED_DOM = {}
const getEl = (selector) => {
  if (!CACHED_DOM[selector] || CACHED_DOM[selector].length === 0) {
    CACHED_DOM[selector] = $(selector)
  }
  return CACHED_DOM[selector]
}
window.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'BORU_TAB_ID_GELDI') {
    CURRENT_TAB_ID = event.data.tabId
    console.log(`🐺 Börü: Bu sekmenin ID'si [${CURRENT_TAB_ID}] olarak kaydedildi.`)
  }
})

const visualizeClick = (element) => {
  if (!LV_SETTINGS.DEBUG_MODE) return

  try {
    const rect = element.getBoundingClientRect()

    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    const hitmarker = document.createElement('div')
    hitmarker.style.position = 'fixed'
    hitmarker.style.left = x - 10 + 'px'
    hitmarker.style.top = y - 10 + 'px'
    hitmarker.style.width = '20px'
    hitmarker.style.height = '20px'
    hitmarker.style.border = '2px solid red'
    hitmarker.style.borderRadius = '50%'
    hitmarker.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'
    hitmarker.style.zIndex = '9999999'
    hitmarker.style.pointerEvents = 'none'
    hitmarker.style.transform = 'scale(0)'
    hitmarker.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'

    hitmarker.innerHTML =
      '<div style="position:absolute; top:50%; left:50%; width:4px; height:4px; background:white; transform:translate(-50%, -50%); border-radius:50%;"></div>'

    document.body.appendChild(hitmarker)

    requestAnimationFrame(() => {
      hitmarker.style.transform = 'scale(1)'
    })

    setTimeout(() => {
      hitmarker.style.opacity = '0'
      setTimeout(() => hitmarker.remove(), 300)
    }, 500)
  } catch (e) {
    console.error('Görselleştirme hatası:', e)
  }
}

var AUTHTOKENS = {
  idToken: '',
  refreshToken: '',
  'Cf-JWT': '',
}
var LOBBY_TIMEOUT_TIMER = null
var PLAYER = undefined
var INVENTORY = undefined
var PLAYERS = []
var ROLE = undefined
var GAME_STATUS = undefined
var GOLD_WHEEL_SPINS_COUNTER = 0
var GOLD_WHEEL_SILVER_SESSION = 0
var TOTAL_XP_SESSION = 0
var TOTAL_UP_LEVEL = 0
var GAME_STARTED_AT = 0
var LV_SETTINGS = {
  AUTO_JOIN_ROOMS: false,
  AUTO_JOIN_FILTER: '',
  AUTO_JOIN_CASE_SENSITIVE: false,
  AUTO_JOIN_EXCLUDE: '',
  LOBBY_AUTO_QUIT_ACTIVE: false,
  LOBBY_AUTO_QUIT_SECONDS: 0,
  AUTO_JOIN_PASSWORD: '',
  AUTO_SLOT: 0,
  DEBUG_MODE: false,
  SHOW_HIDDEN_LVL: true,
  AUTO_REPLAY: true,
  AUTO_PLAY: true,
  AUTO_REFRESH_INTERVAL: 0,
  AUTO_CREATE_ROOM: false,
  AUTO_CREATE_TEMPLATE_NAME: '',
  TELEMETRY_ACTIVE: true,
  WAITING_HOST_TIMEOUT: 0,
}
var GAME_ID = undefined
var SERVER_URL = undefined
var GAME_SETTINGS = undefined
let DAY_COUNT = 0
let DAY_VOTING = {}
let GAME_VOTING = ''
var LOVERS = []
var DEADS = []
var JW_TARGET = undefined
var CHAT_WW_SENDED = false
var WOLVES = []
var TARGET_WW_VOTE = undefined
var PENDING_NIGHT_INFO = '' // İnfocu rollerin sabah vereceği bilgiyi tutar
const gecikmelan = (bankoBekleme = 0, rastgelePay = 600) => {
    return bankoBekleme + Math.floor(Math.random() * rastgelePay);
}
const generatePid = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const removeWovProtections = () => {
  const startGame = getEl('#root div:contains("START GAME")')
  const ok = getEl('#root div:contains("OK")')
  const inventory = getEl('#root div:contains("INVENTORY")')

  if (startGame?.length && ok?.length && inventory?.length) {
    startGame[startGame.length - 1].remove()
    ok[ok.length - 1].remove()
  }
}

const main = async () => {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 800

  if (isMobile) {
    $('body').addClass('boru-mobile')
    console.log('📱 Börü: Mobil Mod Aktif Edildi (Responsive)')
  }
  getAuthtokens()
  loadSettings()
  setTimeout(() => {
    if (!PLAYER || !PLAYER.username) {
      console.log('🐺 Börü: Oyun kimliği geciktirdi. Sistem zorla doğrulama yapıyor...')
      getPLAYER()
    }
  }, 2000)
  setTimeout(checkuserwhitelist, 5000)
  setInterval(masterLoop, 1000)
}

const getPLAYER = () => {
  log('getPLAYER called')
  fetch('https://core.api-wolvesville.com/players/meAndCheckAppVersion', {
    method: 'PUT',
    headers: getHeaders(),

    body: JSON.stringify({
      deviceId: null,
      locale: 'en',
      platform: 'web',
      versionNumber: 1,
    }),
  }).catch((e) => console.error('Kimlik doğrulama isteği başarısız:', e))
}

const handleAutoReplay = () => {
  if (LV_SETTINGS.AUTO_REPLAY) {
    console.log(`[Börü] Auto Replay: Köşe Koruması (200px) + Öncelik Sistemi Aktif 🚀`)

    function click(element) {
      visualizeClick(element)
      const rect = element.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2

      const randomDelay = Math.random() * 600

      setTimeout(() => {
        window.postMessage({ type: 'FROM_PAGE_CLICK', x, y }, '*')
      }, randomDelay)
    }

    const isFarFromCorner = (el) => {
      if (!el) return false
      const rect = el.getBoundingClientRect()

      const distance = Math.sqrt(Math.pow(rect.left, 2) + Math.pow(rect.top, 2))

      return distance >= 200
    }

    let lastPlayAgainTime = 0

    setInterval(() => {
      if (!LV_SETTINGS.AUTO_REPLAY) return

      const now = Date.now()
      let tiklanacakButon = null

      const btnStart = $('#root div:contains("START GAME"):visible')
      if (btnStart.length > 0 && isFarFromCorner(btnStart.last()[0])) {
       emitNative('host-start-game');
      }

      const btnContinue = $('#root div:contains("Continue"):visible')
      if (btnContinue.length > 0 && isFarFromCorner(btnContinue.last()[0])) {
        tiklanacakButon = btnContinue.last()[0]
      }

      const btnPlayAgain = $('#root div:contains("Play again"):visible')
      let isPlayAgainMatch = false
      if (btnPlayAgain.length > 0 && now - lastPlayAgainTime > 3000 && isFarFromCorner(btnPlayAgain.last()[0])) {
        tiklanacakButon = btnPlayAgain.last()[0]
        isPlayAgainMatch = true
      }

      const btnOk = $('#root div:contains("OK"):visible').filter(function () {
        return $(this).text().trim() === 'OK'
      })
      const isGameOver = btnPlayAgain.length > 0 || (typeof GAME_STATUS !== 'undefined' && GAME_STATUS === 'over')

      if (btnOk.length > 0 && isGameOver && isFarFromCorner(btnOk.last()[0])) {
        tiklanacakButon = btnOk.last()[0]
        isPlayAgainMatch = false
      }

      if (tiklanacakButon) {
        if (isPlayAgainMatch && tiklanacakButon === btnPlayAgain.last()[0]) {
          lastPlayAgainTime = now
        }
        click(tiklanacakButon)
      }
    }, 1000)
  }
}

// --- BÖRÜ ÇAPRAZ SEKME (MULTI-TAB) ODA SENKRONİZASYONU ---
// Bu telsiz sadece sekmeler açıkken çalışır, sayfayı yenilediğin an hafızası SIFIRLANIR!
const boruOdaKanali = new BroadcastChannel('boru_oda_senkron')
let digerSekmelerinOdalari = []

boruOdaKanali.onmessage = (event) => {
  if (event.data && event.data.tip === 'ODA_GIRILDI') {
    if (!digerSekmelerinOdalari.includes(event.data.oda)) {
      digerSekmelerinOdalari.push(event.data.oda)
      console.log(`📡 [Börü Telsizi] Diğer sekme "${event.data.oda}" odasına daldı. Ben orayı es geçiyorum!`)
    }
  }
}

const handleAutoJoin = () => {
  console.log(`[Börü] Auto Join: Motor tetikte bekliyor... 🎯`)

  function click(element) {
    if (typeof visualizeClick === 'function') visualizeClick(element)
    const rect = element.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    const randomDelay = Math.random() * 600
    setTimeout(() => {
      window.postMessage({ type: 'FROM_PAGE_CLICK', x, y }, '*')
    }, randomDelay)
  }

  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - 120 &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  // 🔥 BUG FIX: Eski döngüyü temizle, motor üst üste binmesin
  if (window.boruAutoJoinInterval) {
    clearInterval(window.boruAutoJoinInterval)
  }

  // 🔥 BUG FIX: Döngü BAŞLATILDI. Şalteri içeride kontrol edecek.
  window.boruAutoJoinInterval = setInterval(() => {
    // Şalter kapalıysa bu turu pas geç (Motoru öldürme!)
    if (sessionStorage.getItem('boru-tab-autojoin') !== 'true') {
      return
    }

    // 🔥 YENİ: DÖNEN YUVARLAK (SPINNER) KORUMASI 🔥
    // Oyunun yüklenme yuvarlağını yakalar. Eğer ekrandaysa hiçbir şeye tıklamayıp bekler!
    const spinner = document.querySelector('[role="progressbar"]');
    if (spinner && spinner.offsetParent !== null) {
      // Yuvarlak dönüyor, bu turu pas geç!
      return; 
    }

    let tiklanacakButon = null

    // ===============================================================
    // 🔥 AŞAMA 1: EKRANDA JOIN VEYA ŞİFRE EKRANI VAR MI? (İÇERİDE MİYİZ?)
    // ===============================================================
    const btnJoin = $('#root div:contains("Join"):visible').filter(function () {
       // 4.5. DURAK: RECONNECT UYARISI (Oyun devam ediyorsa iptal et)
      const rejoinMessage = $('#root div:contains("Your game is still running"):visible');
      if (rejoinMessage.length > 0) {
          console.log("🐺 [Börü] 'Oyun devam ediyor' uyarısı çıktı, Cancel'a basılıyor...");
          
        
          const btnRejoinCancel = $('#root div:contains("Cancel"):visible');
          
          if (btnRejoinCancel.length > 0) {
              click(btnRejoinCancel.last()[0]);
          }
          
          return; // Bu turun devamını (Join aramayı, şifre girmeyi vs.) İPTAL ET.
      }
      const text = $(this).text().trim()
      return text === 'Join' || text === 'Join new'
    })

    const passwordInput = $('input[placeholder="Password"]:visible')

    if (btnJoin.length > 0 || passwordInput.length > 0) {
      let passVal = sessionStorage.getItem('boru-tab-password') || ''

      if (passwordInput.length > 0) {
        
        // 🔥 ADMIN BYPASS KISMI BURADAN TAMAMEN SİLİNDİ 🔥

        if (passVal && passVal.trim() !== '') {
          const inputEl = passwordInput[0]
          if (inputEl.value !== passVal) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              'value'
            ).set
            nativeInputValueSetter.call(inputEl, passVal)
            inputEl.dispatchEvent(new Event('input', { bubbles: true }))
          }
          const btnOk = $('#root div:contains("OK"):visible')
          if (btnOk.length > 0) tiklanacakButon = btnOk.last()[0]
        } else {
          const btnCancel = $('#root div:contains("Cancel"):visible, #root div:contains("CANCEL"):visible')
          if (btnCancel.length > 0) {
            tiklanacakButon = btnCancel.last()[0]
          }
        }
      } else {
        tiklanacakButon = btnJoin.last()[0]
        const roomname = $('.css-146c3p1.r-1i10wst.r-vw2c0b.r-fdjqy7')
        let kesinOdaAdi = roomname.length > 0 ? roomname.text().trim() : ''

        if (kesinOdaAdi !== '') {
          boruOdaKanali.postMessage({ tip: 'ODA_GIRILDI', oda: kesinOdaAdi })
        }
      }

      if (tiklanacakButon) {
        click(tiklanacakButon)
      }

      return
    }

    // ===============================================================
    // 🔥 AŞAMA 2: LOBİDEYİZ. STANDART BUTONLARI VE JSON'DAN ODAYI BUL
    // ===============================================================
    const btnPlay = $('#root div:contains("PLAY"):visible').not(':contains("WITH")')
    if (btnPlay.length > 0) { 
      // Tıklanacak butonu hemen atamıyoruz, 2 saniye sonra tetikleyeceğiz
      console.log("🎯 [Börü] PLAY butonu yakalandı, 2 saniye bekleniyor...");
      
      // Kasma önleyici: PLAY'e basacağımız kesinleştiği için listeyi sıfırlıyoruz
      window.BORU_OPEN_GAMES = []; 

      setTimeout(() => {
        // 2 saniye dolunca butonu tekrar kontrol et (Hala ekrandaysa tıkla)
        const tazeBtnPlay = $('#root div:contains("PLAY"):visible').not(':contains("WITH")');
        if (tazeBtnPlay.length > 0) {
          console.log("🚀 [Börü] 2 saniye doldu, PLAY butonuna basılıyor!");
          click(tazeBtnPlay.last()[0]);
        }
      }, gecikmelan(300)); 

      return; // Bu turun devamındaki diğer lobi kodlarını (Custom, Refresh vs.) pas geç!
    }

    const btnCustom = $('#root div:contains("CUSTOM GAMES"):visible').filter(function () {
      return $(this).text().trim() === 'CUSTOM GAMES' && !$(this).text().includes('Premium')
    })
   if (btnCustom.length > 0) {
      console.log("🎯 [Börü] CUSTOM GAMES menüsü tespit edildi, 200ms bekleniyor...");
      
      // Kasma önleyici temizlik
      window.BORU_OPEN_GAMES = []; 

      setTimeout(() => {
        // 200ms dolunca butonu taze olarak tekrar bul ve tıkla
        const tazeBtnCustom = $('#root div:contains("CUSTOM GAMES"):visible').filter(function () {
          return $(this).text().trim() === 'CUSTOM GAMES' && !$(this).text().includes('Premium')
        })
        
        if (tazeBtnCustom.length > 0) {
          click(tazeBtnCustom.last()[0])
        }
      }, gecikmelan(200, 100)) // İstersen buraya gecikmelan(200, 100) tarzı bir şey de yazabilirsin.

      return // 🔥 ÇOK KRİTİK: Butona tıklama emrini verdik, aşağı inip filtreleri taramasına gerek yok!
    }

    let rawFilter = sessionStorage.getItem('boru-tab-filter') || ''
    let filterRoomName = rawFilter
    let requiredRoles = []

    if (rawFilter.includes('+')) {
      let parts = rawFilter.split('+')
      filterRoomName = parts[0].trim()
      if (parts[1]) {
        requiredRoles = parts[1]
          .split(',')
          .map((role) => role.replace(/:/g, '').trim().toLowerCase())
          .filter((role) => role.length > 0)
      }
    }

    const excludeText = LV_SETTINGS.AUTO_JOIN_EXCLUDE || ''
    const caseSensitive = LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE
    let passValForCheck = sessionStorage.getItem('boru-tab-password') || '';
    let targetHostNames = sessionStorage.getItem('boru-tab-host') || '';

    // 🔥 YENİ EKLENEN FİLTRELER (E/A ve T/NT) 🔥
    const regionFilter = LV_SETTINGS.AUTO_JOIN_REGION || 'All';
    const talismanFilter = LV_SETTINGS.AUTO_JOIN_TALISMAN || 'All';

    let bestGame = null

    if (window.BORU_OPEN_GAMES && window.BORU_OPEN_GAMES.length > 0) {
      bestGame = window.BORU_OPEN_GAMES.find((game) => {
        const gameName = game.name

        if (digerSekmelerinOdalari.includes(gameName)) return false
        if (game.playerCount >= 16) return false
        if (game.hasPassword && passValForCheck.trim() === '') return false
        // 🔥 YENİ: HOST (Kurucu) İSMİNE GÖRE FİLTRELEME 🔥
        if (targetHostNames && targetHostNames.trim() !== '') {
            const hostList = targetHostNames.toLowerCase().split(',').map(h => h.trim()).filter(h => h.length > 0);
            
            // Eğer odanın kurucusunu bilemiyorsak ve filtre girildiyse odayı es geç
            if (!game._boruHostName) return false;
            
            // Girilen isimlerden HİÇBİRİ kurucunun isminde geçmiyorsa odayı es geç
            const isHostMatch = hostList.some(hName => game._boruHostName.includes(hName));
            if (!isHostMatch) return false;
        }

        // 🔥 BÖLGE (REGION) KONTROLÜ 🔥
        if (regionFilter === 'E' && game._boruRegion !== 'E') return false;
        if (regionFilter === 'A' && game._boruRegion !== 'A') return false;

        // 🔥 TALİSMAN KONTROLÜ 🔥
        const hasTalisman = game.talismansEnabled === true;
        if (talismanFilter === 'T' && !hasTalisman) return false;
        if (talismanFilter === 'NT' && hasTalisman) return false;

        if (filterRoomName && filterRoomName.trim() !== '') {
          const filters = filterRoomName
            .split(',')
            .map((f) => f.trim())
            .filter((f) => f.length > 0)
          const isNameMatch = filters.some((filterWord) => {
            return caseSensitive
              ? gameName.includes(filterWord)
              : gameName.toLowerCase().includes(filterWord.toLowerCase())
          })
          if (!isNameMatch) return false
        } else {
          if (!gameName.toLowerCase().includes('vill win')) return false
        }

        if (excludeText.trim() !== '') {
          const badWords = excludeText
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 0)
          if (badWords.some((bad) => gameName.toLowerCase().includes(bad))) return false
        }

        if (requiredRoles.length > 0) {
          const hasRequiredRole = requiredRoles.some((r) => game.roles && game.roles.includes(r))
          if (!hasRequiredRole) return false
        }

        return true
      })
    }

    if (bestGame) {
      console.log(`[Börü] Hedef Bulundu: "${bestGame.name}". Sayfanın oturması bekleniyor... 🎯`)
      
      // 🔥 KASMA ÖNLEYİCİ: Hedefi bulduğumuz an arka plandaki açık oyunlar listesini TEMİZLİYORUZ ki döngü boşa dönmesin!
      window.BORU_OPEN_GAMES = [];

     
      setTimeout(() => {
        // 🔥 BÖRÜ ÇAKALLIĞI: Süre dolduktan sonra odanın YENİ yerini tekrar arıyoruz!
        const escapeSelector = (str) => str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&')
        const targetDivs = $(
          `.css-g5y9jx.r-13awgt0.r-eqz5dr.r-1rngwi6 div:contains("${escapeSelector(bestGame.name)}"):visible`
        )

        if (targetDivs.length > 0) {
          const visibleRooms = targetDivs.toArray().filter((el) => isElementInViewport(el))
          const guncelTiklanacak = visibleRooms.length > 0 ? visibleRooms[visibleRooms.length - 1] : targetDivs[0]

          const currentRoomName = $('.css-146c3p1.r-1i10wst.r-vw2c0b.r-fdjqy7').text().trim()
          if (currentRoomName !== bestGame.name) {
            window.INSPECTED_ROOM_READY = false
            window.INSPECTED_ROOM_ROLES = []
          }
          
          console.log(`[Börü] Hedefe kilitlenildi, tıklanıyor! 🚀`)
          click(guncelTiklanacak) // Güncel kordinata tıkla
        } else {
          console.log(`[Börü] Hedef oda kaydı veya doldu, pas geçiliyor.`)
        }
      }, gecikmelan(100,300)) // Gecikme süresi 100-400 ms
      return // 🔥 ÇOK KRİTİK: Bu turun devamını (Refresh butonuna basmayı vs) pas geç!
    } else {
      const btnRefresh = $('#root div:contains("REFRESH"):visible')
      if (btnRefresh.length > 0){ 
        // 2. Eski oda inceleme kalıntılarını (şifre, rol durumu) çöpe at
         window.INSPECTED_ROOM_READY = false;
         window.INSPECTED_ROOM_ROLES = [];
         window.INSPECTED_ROOM_PASSWORD = '';
         window.BORU_OPEN_GAMES = [];
         
        tiklanacakButon = btnRefresh.last()[0]
      }
    }

    if (tiklanacakButon) {
      click(tiklanacakButon)
    }
  }, 1500)
}
const handleAutoCreate = () => {
  console.log(`[Börü] Auto Create: Motor tetikte bekliyor... 🚂`)

  function click(element) {
    visualizeClick(element)
    const rect = element.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    const randomDelay = Math.random() * 600
    setTimeout(() => {
      window.postMessage({ type: 'FROM_PAGE_CLICK', x, y }, '*')
    }, randomDelay)
  }

  // 🔥 BUG FIX: Eğer önceden çalışan bir döngü varsa üst üste binmesin (Spam engeli)
  if (window.boruAutoCreateInterval) {
    clearInterval(window.boruAutoCreateInterval)
  }

  // Dışarıdaki "if" engelini kaldırdık. Döngü hep arka planda çalışacak,
  // şalter açılınca harekete geçecek!
  window.boruAutoCreateInterval = setInterval(() => {
    // Şalter açık mı kontrol et (Menüdeki düğmen burayı değiştiriyor)
    if (sessionStorage.getItem('boru-tab-autocreate') !== 'true') return

    let tiklanacakButon = null

    // 1. PLAY
    const btnPlay = $('#root div:contains("PLAY"):visible').not(':contains("WITH")')
    if (btnPlay.length > 0) {
      tiklanacakButon = btnPlay[btnPlay.length - 1]
    }

    // 2. CUSTOM GAMES
    const btnCustom = $('#root div:contains("CUSTOM GAMES"):visible')
    if (btnCustom.length > 0) {
      tiklanacakButon = btnCustom[btnCustom.length - 1]
    }

    // 3. CREATE GAME
    const btnCreate = $('#root div:contains("CREATE GAME"):visible')
    if (btnCreate.length > 0) {
      tiklanacakButon = btnCreate[btnCreate.length - 1]
    }

    // 4. Şablon Klasör İkonu
    const btnTemplateMenu = $(
      '#root .css-g5y9jx.r-1awozwy.r-18u37iz.r-17s6mgv > div:nth-child(2) > div:first-child > div:first-child > div:first-child'
    ).filter(':visible')
    if (btnTemplateMenu.length > 0) {
      tiklanacakButon = btnTemplateMenu[btnTemplateMenu.length - 1]
    }

    // 5. Hedef Şablon Adı
    const templateName = sessionStorage.getItem('boru-tab-template') || ''
    if (templateName) {
      const btnTargetTemplate = $('.css-g5y9jx.r-f727ji.r-j2kj52 div:contains("' + templateName + '"):visible')
      if (btnTargetTemplate.length > 0) {
        tiklanacakButon = btnTargetTemplate[0]
      }
    }

    // Tıklama İşlemi
    if (tiklanacakButon) {
      click(tiklanacakButon)

      // Eğer tıkladığımız buton şablon ismiyse, yarım saniye sonra CREATE GAME'e de bas!
      if (templateName && tiklanacakButon.innerText.includes(templateName)) {
        setTimeout(() => {
          const btnCreateConfirm = $('#root div:contains("CREATE GAME"):visible')
          if (btnCreateConfirm.length > 0) {
            click(btnCreateConfirm[btnCreateConfirm.length - 1])
          }
        }, 650)
      }
    }
  }, 2000)
}

const saveSetting = () => {
  localStorage.setItem('lv-settings', JSON.stringify(LV_SETTINGS))
  log('Ayarlar Kaydedildi:')

  // 🔥 YENİ: C# KARARGAHA ANINDA HABER VER (ÇİFT YÖNLÜ SYNC) 🔥
  if (typeof KARARGAH_SOCKET !== 'undefined' && KARARGAH_SOCKET && KARARGAH_SOCKET.readyState === 1) {
    KARARGAH_SOCKET.send(
      JSON.stringify({
        tip: 'AYAR_SYNC',
        ayarlar: LV_SETTINGS,
      })
    )
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
      console.log('Ayarlar bozuktu, varsayılanlar yüklendi.')
      saveSetting()
    }
  } else {
    saveSetting()
  }
  log('Yüklenen Ayarlar:')
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
    const authtokens = JSON.parse(localStorage.getItem('authtokens'))
    if (authtokens) {
      console.log('authtokenleri buldum')
      AUTHTOKENS.idToken = authtokens.idToken || ''
      AUTHTOKENS.refreshToken = authtokens.refreshToken || ''
    } else {
      console.log('authtokens not found', authtokens)
    }
  } catch (e) {
    console.log('Failed to parse authtokens from localStorage', e)
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

  'game/custom?language=en': (data, url) => {
    if (data && data.openGames) {
      const isAsia = url && url.includes('asia');
      const bolge = isAsia ? 'A' : 'E';

      data.openGames.forEach(game => {
          game._boruRegion = bolge;
          
          // 🔥 DÜZELTME: API'den gelen veriye göre host ismini yakala!
          let hostName = '';
          if (game.hostName) hostName = game.hostName; // Senin attığın payload'daki asıl değer!
          else if (game.creator && game.creator.username) hostName = game.creator.username;
          else if (game.owner && game.owner.username) hostName = game.owner.username;
          
          game._boruHostName = hostName.toLowerCase();
      });

      window.BORU_OPEN_GAMES = [];
      window.BORU_OPEN_GAMES = data.openGames
      console.log(`📡 [Börü Radar] ${data.openGames.length} adet açık lobi tespit edildi. (Bölge: ${bolge})`)
    }
  },

  '/api/public/game/custom/settings': (data) => {
    if (data) {
      if (data.roles) {
        window.INSPECTED_ROOM_ROLES = data.roles
      }

      if (data.password !== undefined && data.password !== null) {
        window.INSPECTED_ROOM_PASSWORD = data.password
      } else {
        window.INSPECTED_ROOM_PASSWORD = ''
      }

      window.INSPECTED_ROOM_READY = true
      console.log(
        `🕵️‍♂️ [Börü Radar] Oda Deşifre Edildi. Şifre: ${window.INSPECTED_ROOM_PASSWORD ? window.INSPECTED_ROOM_PASSWORD : 'YOK'}`
      )
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
      sendBotLoginNotification(data.player)
      // 🔥 İŞTE BURASI: KARARGAH TELSİZİNİ BAŞLAT 🔥
      setTimeout(baslatKarargahTelsizi, 2000) // Kimlik geldikten 2 saniye sonra Karargaha bağlan
      setTimeout(baslatSwarmTelsizi, 2000) // Kimlik geldikten 2 saniye sonra Karargaha bağlan
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
      }
    }
  },
  'https://core.api-wolvesville.com/rewards/wheelRewardWithSecret/': (data) => {
    if (data.code) {
      addChatMsg(`Error: You probably hit the spins limit for today ${JSON.stringify(data)}`, true, 'color: #ff603b;')
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
      }
    }
  },
  'https://core.api-wolvesville.com/rewards/wheelItems/v2': (data) => {
    if (data.nextRewardAvailableTime) {
    } else {
    }
  },
}


const emitNative = (eventName, payloadStr) => {
  if (!NATIVE_SOCKET) {
    console.error(`🐺 [Börü ERROR] NATIVE_SOCKET tanımlı değil! Event: ${eventName}`)
    return
  }
  if (NATIVE_SOCKET.readyState !== 1) {
    console.error(`🐺 [Börü ERROR] Soket hazır değil! State: ${NATIVE_SOCKET.readyState}. Event: ${eventName}`)
    return
  }
  try {
    const packetArray = payloadStr ? [eventName, payloadStr] : [eventName]
    const packet = '42' + JSON.stringify(packetArray)
    console.log(`🐺 [DEBUG - EMIT] Gönderiliyor:`, packet)
    SafWebSocketSend.call(NATIVE_SOCKET, packet)
    console.log(`%c🐺 [DEBUG - EMIT BAŞARILI]`, 'color: #00FF00; font-weight: bold;')
  } catch (error) {
    console.error(`🐺 [Börü KRİTİK ERROR] Emit hatası:`, error)
  }
}

const fetchInterceptor = () => {
  const { fetch: origFetch } = window

  const targetUrls = Object.keys(requestsToCatch)

  window.fetch = async (...args) => {
    const input = args[0]
    let url = typeof input === 'string' ? input : input?.url || ''

    if (url.includes('/players/webBo') || url.includes('/players/webAutomatio') || url.includes('[native code]')) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (url.startsWith('https://core.api-wolvesville.com/inventory?')) {
      url = 'https://core.api-wolvesville.com/inventory?'
      if (typeof input === 'string') args[0] = url
    }

    const matchedKey = targetUrls.find((_url) => url.includes(_url))
    const catchMethod = matchedKey ? requestsToCatch[matchedKey] : null

    let init = args[1] || {}
    let headers = init.headers
    if (headers) {
      let authHeader = ''
      if (headers instanceof Headers) {
        authHeader = headers.get('authorization') || ''
      } else {
        authHeader = headers['authorization'] || headers['Authorization'] || ''
      }

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const newToken = authHeader.slice(7)
        if (AUTHTOKENS.idToken !== newToken) {
          AUTHTOKENS.idToken = newToken
        }
      }
    }

    const response = await origFetch(...args)

    if (catchMethod && response.ok) {
      try {
        const clonedResponse = response.clone()
        const contentType = clonedResponse.headers.get('content-type')

        if (contentType && contentType.includes('application/json')) {
          const text = await clonedResponse.text()
          if (text && text.trim() !== '') {
            const data = JSON.parse(text)

            return catchMethod(data, url) || response
          }
        }
      } catch (e) {
        return response
      }
    }

    return response
  }
  console.log('🚀 Börü: Optimized Fetch Interceptor v3.1 Aktif (VDS Ready)')
}

// --- 🔥 BÖRÜ OYLAMA MOTORU 🔥 ---
const boruOylariYazdir = () => {
  const voterIds = Object.keys(DAY_VOTING)
  if (voterIds.length > 0) {
    DAY_COUNT++
    let output = `\n🌙 Gün ${DAY_COUNT} Oylaması:\n`
    voterIds.forEach((voterId) => {
      const targetId = DAY_VOTING[voterId]
      const voterPlayer = PLAYERS.find((v) => v?.id === voterId)
      let targetName = 'Boş / Pas / Çekildi'
      if (targetId !== 'skip') {
        const targetPlayer = PLAYERS.find((v) => v?.id === targetId)
        if (targetPlayer) targetName = `[${targetPlayer.gridIdx + 1}] ${targetPlayer.username}`
      }
      if (voterPlayer) {
        output += `  [${voterPlayer.gridIdx + 1}] ${voterPlayer.username} 👉 ${targetName}\n`
      }
    })
    GAME_VOTING += output
  }
  DAY_VOTING = {} // Sonraki gün için temizle
}

const messagesToCatch = {
  'game-joined': (data) => {
    addChatMsg('🔗 Game joined')
    if (LV_SETTINGS.LOBBY_AUTO_QUIT_ACTIVE && LV_SETTINGS.LOBBY_AUTO_QUIT_SECONDS > 0) {
      clearTimeout(LOBBY_TIMEOUT_TIMER)
      LOBBY_TIMEOUT_TIMER = setTimeout(() => {
        if (GAME_SETTINGS && GAME_SETTINGS.gameMode !== 'custom') return
        if (GAME_STATUS !== 'started') {
          addChatMsg(`⏰ Lobby time expired. Leaving the room...`, true, 'color: #ff4081;')
          setTimeout(() => window.location.reload(), 1000)
        }
      }, LV_SETTINGS.LOBBY_AUTO_QUIT_SECONDS * 1000)
    }
    const _data = Object.values(data)
    GAME_ID = _data[0]
    SERVER_URL = _data[1]
    setTimeout(setPlayersLevel, 1000)
    // 🔥 HIZLI AUTO SLOT (Odaya Girer Girmez Işınlan) 🔥
    if (LV_SETTINGS.AUTO_SLOT && LV_SETTINGS.AUTO_SLOT > 0 && LV_SETTINGS.AUTO_SLOT <= 16) {
      const gridIdx = LV_SETTINGS.AUTO_SLOT - 1
      setTimeout(() => {
        if (NATIVE_SOCKET && NATIVE_SOCKET.readyState === 1) {
          console.log(`🚀 [Börü Hızlı Slot] Odaya girildi, direkt Grid ${gridIdx} kapılıyor!`)
          emitNative('lobby:player-grid-idx-changed', JSON.stringify({ gridIdx: gridIdx }))
        }
      }, gecikmelan(50)) // Odaya girdikten 100 milisaniye sonra anında gönderir
    }
  },
  'game-settings-changed': (data) => {
    GAME_SETTINGS = data
  },
  'game-starting': () => {
    addChatMsg('🚩 Game starting')
  },
  'game-started': (data) => {
    clearTimeout(LOBBY_TIMEOUT_TIMER)
    addChatMsg('🚀 Game started')
    GAME_STATUS = 'started'
    GAME_STARTED_AT = new Date().getTime()
    setRole(data.role)
    addChatMsg(`You are ${ROLE.name} (${ROLE?.id})`, true, 'color: #FF4081;')
    PLAYERS = data.players

    // Reset global arrays
    LOVERS = []
    DEADS = []
    JW_TARGET = undefined
    CHAT_WW_SENDED = false
    WOLVES = []
    TARGET_WW_VOTE = undefined
    DAY_COUNT = 0
    DAY_VOTING = {}
    GAME_VOTING = ''
    PENDING_NIGHT_INFO = '' // Reset info memory in new game

    window.dispatchEvent(new CustomEvent('BORU_YENI_OYUNCULAR', { detail: PLAYERS }))

    if (data.gameMode) CURRENT_GAME_MODE = data.gameMode
    else if (GAME_SETTINGS && GAME_SETTINGS.gameMode) CURRENT_GAME_MODE = GAME_SETTINGS.gameMode
    else CURRENT_GAME_MODE = 'Custom/Unknown'

    if (PLAYERS && PLAYERS.length > 0) {
      let list = `Game ID: ${GAME_ID}\nDate: ${new Date().toLocaleString()}\n--------------------------------\n`
      PLAYERS.forEach((p) => (list += `${parseInt(p.gridIdx) + 1}. ${p.username} [Lvl ${p.level}]\n`))
      localStorage.setItem('lv-last-players-list', list)
    }

    setTimeout(setPlayersLevel, 1000)
  },
  'game-cupid-lover-ids-and-roles': (data) => {
    if (!PLAYER) getPLAYER()
    if (PLAYER && ROLE) {
      const loverPlayerIds = data.loverPlayerIds.filter((v) => v !== PLAYER?.id)
      const loverRoles = data.loverRoles.filter((v) => v !== ROLE?.id)
      LOVERS = loverPlayerIds.map((playerId, i) => ({ id: playerId, role: loverRoles[i] }))
      if (LOVERS?.length === 1) {
        const lover1 = PLAYERS.find((v) => v?.id === LOVERS[0]?.id)
        if (lover1) addChatMsg(`💘 Your lover is ${lover1.gridIdx + 1}. ${lover1.username} (${LOVERS[0].role})`)
      } else if (LOVERS?.length === 2) {
        const lover1 = PLAYERS.find((v) => v?.id === LOVERS[0]?.id)
        const lover2 = PLAYERS.find((v) => v?.id === LOVERS[1]?.id)
        if (lover1 && lover2)
          addChatMsg(
            `💘 Your lovers are ${lover1.gridIdx + 1}. ${lover1.username} and ${lover2.gridIdx + 1}. ${lover2.username}`
          )
      }
    }
  },

  // 🔥 NIGHT STARTED: AUTO TARGET SELECTION FOR INFO ROLES
  'game-night-started': () => {
    setTimeout(setPlayersLevel, 1000)

    if (LV_SETTINGS.AUTO_PLAY && GAME_SETTINGS && GAME_SETTINGS.gameMode === 'custom') {
      setTimeout(() => {
        // 1. Lover protection for werewolves (ASLA DOKUNULMADI)
        if (ROLE && ROLE.team === 'WEREWOLF') {
          const lover = LOVERS.find((v) => getRole(v.role).team !== 'WEREWOLF')
          if (lover) {
            const targetPlayer = PLAYERS.find((v) => v?.id === lover?.id)
            if (targetPlayer) addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
            TARGET_WW_VOTE = lover?.id
            emitNative('game-werewolves-vote-set', JSON.stringify({ targetPlayerId: lover?.id }))
          }
        }

        // 2. Automation for Info Roles
        const infoRoles = ['seer', 'aura-seer', 'detective', 'analyst', 'gambler']
        if (ROLE && infoRoles.includes(ROLE.id) && !DEADS.includes(PLAYER?.id)) {
          // Find valid targets: Excluding self, deads, and lover
          const validTargets = PLAYERS.filter(
            (p) => p.id !== PLAYER?.id && !DEADS.includes(p.id) && !LOVERS.some((l) => l.id === p.id)
          )

          if (validTargets.length > 0) {
            // 🔮 SEER & AURA SEER → game-{role}-view-role | { targetPlayerId }
            // 🔮 SEER & AURA SEER
            if (ROLE.id === 'seer' || ROLE.id === 'aura-seer') {
              const target = validTargets[Math.floor(Math.random() * validTargets.length)]
              emitNative(`game-${ROLE.id}-view-role`, JSON.stringify({ targetPlayerId: target.id }))
              PENDING_NIGHT_INFO = `${target.gridIdx + 1}`
            }

            // 🎲 GAMBLER
            else if (ROLE.id === 'gambler') {
              const target = validTargets[Math.floor(Math.random() * validTargets.length)]
              emitNative(
                'game-gambler-selected-player',
                JSON.stringify({ targetPlayerId: target.id, teamGuess: 'villager', teamName: 'Village', teamNameEn: 'Village' })
              )
              PENDING_NIGHT_INFO = `${target.gridIdx + 1}`
            }

            // 🕵️ DETECTIVE
            else if (ROLE.id === 'detective' && validTargets.length >= 2) {
              const shuffled = validTargets.sort(() => 0.5 - Math.random())
              const t1 = shuffled[0], t2 = shuffled[1]
              emitNative('game-detective-selected-targets', JSON.stringify([t1.id, t2.id]))
              PENDING_NIGHT_INFO = `${t1.gridIdx + 1} and ${t2.gridIdx + 1}`
            }

            // 📊 ANALYST → game-analyst-selected-player | (2 KİŞİ SEÇER - ÜST ÜSTE İKİ PAKET ATILIR)
            else if (ROLE.id === 'analyst' && validTargets.length >= 2) {
              // Rastgele 2 farklı hedef belirle
              const shuffled = validTargets.sort(() => 0.5 - Math.random())
              const t1 = shuffled[0], t2 = shuffled[1]
              
              // 1. Adamı seç
              emitNative('game-analyst-selected-player', JSON.stringify({ targetPlayerId: t1.id }))
              
              // 2. Adamı seç (Oyunun beyni yanmasın diye 200ms arayla atıyoruz)
              setTimeout(() => {
                emitNative('game-analyst-selected-player', JSON.stringify({ targetPlayerId: t2.id }))
              }, 200)

             
            }

          }
        }
      }, gecikmelan(1500))
    }
  },

  // 🔥 CATCHING INFO RESULTS FROM SERVER (Sabah yazılacak mesaja cevabı ekler)

  // 🔮 SEER → data.role = rol ID'si döner
  'game-seer-view-role': (data) => {
    if (data && data.role) {
      const isWolf = [
        'werewolf',
        'alpha-werewolf',
        'wolf-seer',
        'guardian-wolf',
        'nightmare-werewolf',
        'shadow-wolf',
        'junior-werewolf',
        'corruptor',
        'voodoo-werewolf',
      ].includes(data.role)
      PENDING_NIGHT_INFO += isWolf ? ` WOLF! (${data.role})` : ` Villager. (${data.role})`
    }
  },

 // 🌟 AURA SEER → "4 is Evil aura here"
  'game-aura-seer-view-role': (data) => {
    if (data && data.result) {
      const team = data.result === 'BAD' ? 'Evil' : (data.result === 'GOOD' ? 'Good' : 'Unk')
      PENDING_NIGHT_INFO += ` is ${team} aura here`
    }
  },

 // 🕵️ DETECTIVE → "3 and 5 same team det here"
  'game-detective-result': (data) => {
    if (data && typeof data.areTeamsEqual !== 'undefined') {
      PENDING_NIGHT_INFO += data.areTeamsEqual ? ` same team det here` : ` NOT same team det here`
    }
  },


  // 📊 ANALYST → game-analyst-set-state
  'game-analyst-set-state': (data) => {
    if (data && data.targetAura1 && data.targetAura2) {
      const a1 = data.targetAura1 === 'BAD' ? 'Evil' : (data.targetAura1 === 'GOOD' ? 'Good' : 'Unk');
      const a2 = data.targetAura2 === 'BAD' ? 'Evil' : (data.targetAura2 === 'GOOD' ? 'Good' : 'Unk');

      let num1 = "1"; let num2 = "2";
      if (typeof PLAYERS !== 'undefined') {
        const p1 = PLAYERS.find((p) => p.id === data.targetPlayerId1);
        const p2 = PLAYERS.find((p) => p.id === data.targetPlayerId2);
        if (p1) num1 = p1.gridIdx + 1;
        if (p2) num2 = p2.gridIdx + 1;
      }

      // 🔥 Aynı da olsa farklı da olsa acımadan ayrı ayrı yazdırıyoruz
      PENDING_NIGHT_INFO += ` ${num1} is ${a1}, ${num2} is ${a2}.`;
    }
  },


  // 🎲 GAMBLER → "6 is NOT villager gambler here"
  'game-gambler-set-state': (data) => {
    if (data) {
      PENDING_NIGHT_INFO += data.guessedWrong ? ` is NOT villager gambler here` : ` is villager gambler here`
    }
  },

  // 🔥 MORNING HAS COME: WRITE INFO TO VILLAGE WHEN VOTING STARTS
  'game-day-voting-started': () => {
    if (LV_SETTINGS.AUTO_PLAY && GAME_SETTINGS && GAME_SETTINGS.gameMode === 'custom') {
      if (!PLAYER) getPLAYER()
      if (PLAYER && !DEADS.includes(PLAYER?.id)) {
        // 1. Send Info Role data to Chat (If any)
        if (PENDING_NIGHT_INFO !== '') {
          setTimeout(() => {
            emitNative('game:chat-public:msg', JSON.stringify({ msg: PENDING_NIGHT_INFO, pId: generatePid() }))
            PENDING_NIGHT_INFO = '' // Clear memory after sending so it doesn't repeat every day
          }, gecikmelan(1000))
        }

        // 🔥 MAYOR (Belediye Başkanı) OTOMATİK ROL AÇMA
        if (ROLE && ROLE.id === 'mayor') {
          setTimeout(() => {
            emitNative('mayor-reveal-role', '{}') // Hedef gerekmediği için boş obje gönderilir
            addChatMsg(`🎩 Belediye Başkanı (Mayor) olarak kimlik açıklandı!`, true, 'color: gold;')
          }, gecikmelan(1000))
        }
        // 2. Standard Morning Actions For Other Roles
        const wwLover = LOVERS.find((v) => getRole(v.role).team === 'WEREWOLF')
        if (wwLover) {
          if (ROLE && ROLE.id === 'priest') {
            const targets = PLAYERS.filter(
              (p) => p.id !== PLAYER.id && !DEADS.includes(p.id) && !LOVERS.some((l) => l.id === p.id)
            )
            if (targets.length > 0) {
              const randomTarget = targets[Math.floor(Math.random() * targets.length)]
              setTimeout(() => {
                addChatMsg(
                  `💦 CHAOS STRIKE: ${parseInt(randomTarget.gridIdx) + 1}. ${randomTarget.username}`,
                  true,
                  'color: cyan;'
                )
                emitNative('game-priest-kill-player', JSON.stringify({ targetPlayerId: randomTarget.id }))
              }, gecikmelan(3000))
            }
            return
          }
          if (ROLE && ROLE.team === 'WEREWOLF') {
            setTimeout(
              () => emitNative('game:chat-public:msg', JSON.stringify({ msg: 'wc', pId: generatePid() })),
              gecikmelan(500)
            )
          }
          emitNative('game-day-vote-set', JSON.stringify({ targetPlayerId: wwLover?.id }))
        } else {
          if (ROLE && ROLE.team === 'WEREWOLF') {
            setTimeout(
              () => emitNative('game:chat-public:msg', JSON.stringify({ msg: 'me', pId: generatePid() })),
              gecikmelan(500)
            )
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
              'deep-sea-terror',
              'zombie',
            ].includes(ROLE.id)
          ) {
            setTimeout(
              () => emitNative('game:chat-public:msg', JSON.stringify({ msg: 'solo', pId: generatePid() })),
              gecikmelan(500)
            )
          }
        }
      }
    }
  },

  'game-werewolves-set-roles': (data) => {
    WOLVES = Object.entries(data.werewolves).map(([id, role]) => ({ id, role }))
    if (
      LV_SETTINGS.AUTO_PLAY &&
      GAME_SETTINGS &&
      GAME_SETTINGS.gameMode === 'custom' &&
      !CHAT_WW_SENDED &&
      LOVERS?.length &&
      WOLVES?.length &&
      ROLE &&
      ROLE.team === 'WEREWOLF' &&
      ROLE?.id === 'junior-werewolf' &&
      LOVERS.find((v) => getRole(v.role).team !== 'WEREWOLF')
    ) {
      CHAT_WW_SENDED = true
      setTimeout(
        () => emitNative('game:chat-werewolves:msg', JSON.stringify({ msg: `Who?`, pId: generatePid() })),
        gecikmelan(2000)
      )
    }
  },
  'game:chat-werewolves:msg': (data) => {
    if (LV_SETTINGS.AUTO_PLAY && GAME_SETTINGS && GAME_SETTINGS.gameMode === 'custom') {
      if (
        ROLE &&
        ROLE.team === 'WEREWOLF' &&
        data.authorId !== PLAYER?.id &&
        data.msg &&
        data.msg.toLowerCase().includes('who')
      ) {
        const lover = PLAYERS.find((v) => v?.id === LOVERS[0]?.id)
        if (lover) {
          setTimeout(
            () =>
              emitNative(
                'game:chat-werewolves:msg',
                JSON.stringify({ msg: `${lover.gridIdx + 1}`, pId: generatePid() })
              ),
            gecikmelan(1000)
          )
        }
      }
      if (ROLE && ROLE?.id === 'junior-werewolf' && data.msg && data.authorId !== PLAYER?.id) {
        const numbers = data.msg.match(/\d+/)
        if (numbers && numbers?.length) {
          const gridIdx = parseInt(numbers[0])
          const targetPlayer = PLAYERS.find((v) => v.gridIdx + 1 === gridIdx)
          if (targetPlayer) {
            JW_TARGET = targetPlayer.id
            addChatMsg(`🐾 Select ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
            emitNative('game-junior-werewolf-selected-player', JSON.stringify({ targetPlayerId: targetPlayer.id }))
          }
        }
      }
    }
  },
  'game-werewolves-vote-set': (data) => {
    if (!LV_SETTINGS.AUTO_PLAY || (GAME_SETTINGS && GAME_SETTINGS.gameMode !== 'custom')) return
    if (data.playerId === PLAYER?.id) return

    if (!JW_TARGET && ROLE && ROLE?.id === 'junior-werewolf' && data.playerId !== PLAYER?.id) {
      JW_TARGET = data.targetPlayerId
      const targetPlayer = PLAYERS.find((v) => v?.id === data.targetPlayerId)
      if (targetPlayer) addChatMsg(`🐾 Select ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
      emitNative('game-junior-werewolf-selected-player', JSON.stringify({ targetPlayerId: data.targetPlayerId }))
    }

    if (
      ROLE &&
      ROLE?.id !== 'junior-werewolf' &&
      WOLVES.find((v) => v.role === 'junior-werewolf' && v?.id === data.playerId)
    ) {
      const targetPlayer = PLAYERS.find((v) => v?.id === data.targetPlayerId)
      setTimeout(() => {
        if (targetPlayer) addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
        if (TARGET_WW_VOTE !== data.targetPlayerId) {
          TARGET_WW_VOTE = data.targetPlayerId
          emitNative('game-werewolves-vote-set', JSON.stringify({ targetPlayerId: data.targetPlayerId }))
        }
      }, gecikmelan(1000))
    } else if (
      ROLE &&
      ROLE?.id !== 'junior-werewolf' &&
      !WOLVES.find((v) => v.role === 'junior-werewolf' && v?.id === data.playerId) &&
      LOVERS.find((v) => ['priest', 'vigilante', 'gunner'].includes(v.role))
    ) {
      const targetPlayer = PLAYERS.find((v) => v?.id === data.targetPlayerId)
      setTimeout(() => {
        if (targetPlayer) addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
        if (TARGET_WW_VOTE !== data.targetPlayerId) {
          TARGET_WW_VOTE = data.targetPlayerId
          emitNative('game-werewolves-vote-set', JSON.stringify({ targetPlayerId: data.targetPlayerId }))
        }
      }, gecikmelan(1000))
    }
  },
  'game:chat-public:msg': (data) => {
    if (LV_SETTINGS.AUTO_PLAY && GAME_SETTINGS && GAME_SETTINGS.gameMode === 'custom') {
      if (!PLAYER) getPLAYER()
      
      // Mesajı atanın kim olduğunu if'ten önce buluyoruz ki numarasını bilelim
      const targetPlayer = PLAYERS.find((v) => v?.id === data.authorId)

      if (
        PLAYER &&
        !DEADS.includes(PLAYER?.id) &&
        data.authorId !== PLAYER?.id &&
        data.msg &&
        ROLE &&
        ROLE.team !== 'WEREWOLF' &&
        targetPlayer && // Mesajı atan adam bulunduysa
        (
          ['Me', 'me', 'ME', 'm', 'M', 'wc', 'Wc', 'WC'].includes(data.msg) || // Eski kelimelerin
          data.msg.trim() === (targetPlayer.gridIdx + 1).toString() // VEYA kendi sayısını yazdıysa
        )
      ) {
        emitNative('game-day-vote-set', JSON.stringify({ targetPlayerId: targetPlayer.id }))
        addChatMsg(`👉 Vote ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
      }
    }
  },
  'game-day-vote-set': (data) => {
    if (data && data.playerId) {
      DAY_VOTING[data.playerId] = data.targetPlayerId || 'skip'
    }

    if (!LV_SETTINGS.AUTO_PLAY || (GAME_SETTINGS && GAME_SETTINGS.gameMode !== 'custom')) return

    let votedPlayer = ''
    if (!PLAYER) getPLAYER()
    if (PLAYER && !DEADS.includes(PLAYER?.id)) {
      const targetPlayer = PLAYERS.find((v) => v?.id === data.targetPlayerId)
      const voter = PLAYERS.find((v) => v?.id === data.playerId)

      if (ROLE && ROLE?.id === 'priest') {
        setTimeout(() => {
          if (targetPlayer) addChatMsg(`💦 Kill ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
          emitNative('game-priest-kill-player', JSON.stringify({ targetPlayerId: data.targetPlayerId }))
        }, gecikmelan(1000))
      } else if (ROLE && ROLE.id === 'vigilante') {
        setTimeout(() => {
          if (targetPlayer) addChatMsg(`🔫 Kill ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
          emitNative('game-vigilante-shoot', JSON.stringify({ targetPlayerId: data.targetPlayerId }))
        }, gecikmelan(1000))
      } else if (ROLE && ROLE?.id === 'gunner') {
        setTimeout(() => {
          if (targetPlayer) addChatMsg(`🔫 Kill ${targetPlayer.gridIdx + 1}. ${targetPlayer.username}`)
          emitNative('game-gunner-shoot-player', JSON.stringify({ targetPlayerId: data.targetPlayerId }))
        }, gecikmelan(1000))
      } else if (ROLE) {
        if (voter?.id !== PLAYER.id && targetPlayer?.id !== PLAYER.id) {
          if (votedPlayer !== targetPlayer?.id) {
            emitNative('game-day-vote-set', JSON.stringify({ targetPlayerId: targetPlayer.id }))
            votedPlayer = targetPlayer.id
          }
        }
      }
    }
  },
  'game-players-killed': (data) => {
    data['victims'].forEach((victim) => {
      const player = PLAYERS.find((v) => v?.id === victim.targetPlayerId)
      if (player) {
        if (!DEADS.includes(player.id)) DEADS.push(player.id)
        addChatMsg(
          `☠️ ${parseInt(player.gridIdx) + 1}. ${player.username} (${victim.targetPlayerRole}) by ${victim.cause}`
        )
      }
    })
  },
  'game-reconnect-set-players': (data) => {
    PLAYERS = Object.values(data)
    PLAYERS.forEach((player) => {
      if (!player.isAlive && !DEADS.includes(player.id)) DEADS.push(player.id)
    })
    setTimeout(setPlayersLevel, 1000)
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
  'game-reconnect-set-game-status': (data) => {},
  'players-and-equipped-items': (data) => {
    if (GAME_STATUS === 'started') {
      PLAYERS = data.players
      setTimeout(setPlayersLevel, 1000)
    }
  },
  'player-joined-and-equipped-items': (data) => {},
  'game-set-game-status': (data) => {},
  'game-game-over': () => {
    if (GAME_STATUS === 'over') return
    GAME_STATUS = 'over'
    let tmp = `🏁 Game over`
    if (GAME_STARTED_AT) {
      tmp += ` (${((new Date().getTime() - GAME_STARTED_AT) / 1000).toFixed(0)}s)`
    }
    addChatMsg(tmp)
  },
  'game-over-awards-available': (data) => {
    DAY_COUNT = 0
    DAY_VOTING = {}
    GAME_VOTING = ''

    let isWin = false
    if (ROLE && ROLE.team === 'VILLAGER') isWin = true
    const matchResult = isWin ? 'Win' : 'Loss'

    if (data.playerAward.canClaimDoubleXp) {
      emitNative('game-over-double-xp', '{}')
      addChatMsg('Claim double xp', true, 'color:rgb(17, 255, 0);')
    } else {
      TOTAL_XP_SESSION += data.playerAward.awardedTotalXp
      addChatMsg(`🧪 ${data.playerAward.awardedTotalXp} xp`)
      if (data.playerAward.awardedLevels) {
        PLAYER.level += data.playerAward.awardedLevels
        TOTAL_UP_LEVEL += data.playerAward.awardedLevels
        log(`🆙 ${PLAYER.level}`)
      }

      // 🔥 VERİ AKIŞI (ANALYZER) BURADA TETİKLENİR
      if (true) {
        const duration = GAME_STARTED_AT > 0 ? Math.round((new Date().getTime() - GAME_STARTED_AT) / 1000) : 0
        const currentRole = ROLE ? ROLE.id : 'Unknown'

        // data.playerAward nesnesinde kazanılan gümüşü "awardedTotalGold" vb. yakalayabilirsen buraya yaz,
        // bulamazsan 0 göndeririz.
        let kazanilanAltin = data.playerAward.silver || 0

        const borudata = buildBoruPayload(
          data.playerAward.awardedTotalXp,
          PLAYER.level,
          currentRole,
          matchResult,
          kazanilanAltin,
          duration
        )

        sendToAnalyzer(borudata)
        GAME_STARTED_AT = 0
      }
    }
  },
  disconnect: () => {
    clearTimeout(LOBBY_TIMEOUT_TIMER)
    ROLE = undefined
    PLAYERS = []
    GAME_ID = undefined
    SERVER_URL = undefined
    GAME_SETTINGS = undefined
    LOVERS = []
    DEADS = []
    WOLVES = []
  },
}

const messageDispatcher = (message) => {
  const msg = message[0]
  const data = message.length > 1 ? message[1] : null
  const method = messagesToCatch[msg]
  !!method && method(data)
}

function setPlayersLevel() {
  PLAYERS.forEach((player) => {
    const gridIdx = parseInt(player.gridIdx) + 1;
    const username = player.username;
    const baseStr = `${gridIdx} ${username}`; // Orijinal hali
    const level = player.level;
    let clanTag = player.clanTag ? `${player.clanTag}` : '';
    
    // Level eklenmiş tam hali
    let leveledName = `${gridIdx} ${username} [${level}] ${clanTag}`.trim();

    const els = $(`div:contains("${baseStr}")`);
    if (els.length > 0) {
      const target = $(els[els.length - 1]);
      const txt = target.text().trim();

      // ŞALTER AÇIKSA -> Level Ekle
      if (LV_SETTINGS.SHOW_HIDDEN_LVL) {
        if (txt.startsWith(baseStr) && txt.length <= leveledName.length + 4) {
          target.html(leveledName);
          target.addClass('lv-username');
          target.parent().addClass('lv-username-box');
        }
      } 
      // ŞALTER KAPALIYSA -> Bizim eklediğimiz levelleri geri sil
      else {
        if (target.hasClass('lv-username')) {
          target.html(baseStr); // İsmi orijinal haline döndür
          target.removeClass('lv-username');
          target.parent().removeClass('lv-username-box');
        }
      }
    }
  });
}

function addChatMsg(message, strong = false, style = '') {
  log(`[Börü] ${message}`)
}

function messageParser(message) {
  let tmp = message.slice(2)
  tmp = tmp.replaceAll('"{', '{')
  tmp = tmp.replaceAll('}"', '}')
  tmp = tmp.replaceAll('\\"', '"')
  let parsedMessage = undefined
  try {
    parsedMessage = JSON.parse(tmp)
  } catch {}
  return parsedMessage
}

function formatTime(d) {
  const HH = d.getHours().toString().padStart(2, '0')
  const MM = d.getMinutes().toString().padStart(2, '0')
  const SS = d.getSeconds().toString().padStart(2, '0')
  const mmm = d.getMilliseconds().toString().padStart(3, '0')
  return `${HH}:${MM}:${SS}.${mmm}`
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

let PAGE_LOAD_TIME = Date.now()

setInterval(() => {
  if (!LV_SETTINGS.AUTO_REFRESH_INTERVAL || LV_SETTINGS.AUTO_REFRESH_INTERVAL === 0) {
    return
  }

  let updateFarkiMs = Date.now() - PAGE_LOAD_TIME
  let gecenDakika = updateFarkiMs / 60000

  if (gecenDakika >= LV_SETTINGS.AUTO_REFRESH_INTERVAL) {
    if (GAME_STATUS === 'started') {
      console.log(`[Börü] Süre doldu ama oyun var. Yenileme erteleniyor...`)
    } else {
      console.log(`[Börü] Süre doldu (${LV_SETTINGS.AUTO_REFRESH_INTERVAL} dk). Yenileniyor...`)
      saveSetting()
      setTimeout(() => {
        window.location.reload()
      }, 3500)
    }
  }
}, 10000)

// --- 🕵️ BÖRÜ TAKİP SİSTEMİ (Sadece Giriş Logu) ---
var HAS_SENT_LOGIN_LOG = false
const sendBotLoginNotification = async (playerData) => {
  const LOG_WEBHOOK_URL =
    'https://discord.com/api/webhooks/1463591449810571437/BcOajJlIKOWZgepl1l70Myg0r1nkdO1T44yA9DKYwNWrPGwB0uF7_2AomQm4Lz3xLOBJ'

  if (HAS_SENT_LOGIN_LOG || !LOG_WEBHOOK_URL) return

  let clanName = 'Klan Yok / Bağımsız'
  try {
    const clanRes = await fetch('https://core.api-wolvesville.com/clans/myClan', {
      method: 'GET',
      headers: getHeaders(),
    })
    if (clanRes.ok) {
      const clanData = await clanRes.json()
      if (clanData.clan.name) {
        clanName = clanData.clan.name
      }
    }
  } catch (e) {
    console.log('Klan bilgisi çekilemedi, devam ediliyor...')
  }

  const timeNow = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })

  fetch(LOG_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'Börü Security',
      avatar_url: 'https://i.imgur.com/4M34hi2.png',
      embeds: [
        {
          title: '🟢 Yeni Kullanıcı Giriş Yaptı (Börü)',
          color: 5763719,
          fields: [
            {
              name: '👤 Kullanıcı',
              value: playerData.username,
              inline: true,
            },
            {
              name: '📊 Level',
              value: playerData.level.toString(),
              inline: true,
            },
            {
              name: '🛡️ Klan',
              value: clanName,
              inline: true,
            },
            {
              name: '⚙️ Sürüm',
              value: `v1.13.0 final`,
              inline: true,
            },
            {
              name: '🕒 Tarih',
              value: timeNow,
              inline: false,
            },
          ],
          footer: {
            text: `User ID: ${playerData.id}`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  })
    .then(() => {
      HAS_SENT_LOGIN_LOG = true
      console.log(`[Börü] Login logu gönderildi. Klan: ${clanName}`)
    })
    .catch((e) => console.error('Log hatası:', e))
}

const checkuserwhitelist = async (retryCount = 0) => {
  // 1. Oyuncu verisi (İsim ve ID) oyun tarafından çekilene kadar bekle
  if (!PLAYER || !PLAYER.id) {
    if (retryCount < 15) {
      setTimeout(() => checkuserwhitelist(retryCount + 1), 1000)
    }
    return
  }

  try {
    if (retryCount === 0) addChatMsg('⏳ VarietyShop Lisans Sistemi doğrulanıyor...', false, 'color: gray;')

    // 🔥 BÖRÜ: OYUNCUNUN KLAN ID'SİNİ OYUNDAN ÇEK
    let currentClanId = ''
    try {
      const clanRes = await fetch('https://core.api-wolvesville.com/clans/myClan', {
        method: 'GET',
        headers: getHeaders(),
      })
      if (clanRes.ok) {
        const clanData = await clanRes.json()
        if (clanData.clan && clanData.clan.id) {
          currentClanId = clanData.clan.id
        }
      }
    } catch (e) {
      console.log('Klan bilgisi çekilemedi.')
    }

    // 2. Karargah API adresine POST isteği atıyoruz
    const response = await fetch('https://api.varietyshop.com.tr/api/auth/boru/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Username: PLAYER.username,
        PlayerId: PLAYER.id,
        ClanId: currentClanId, // SADECE KLAN ID GİDİYOR
      }),
    })

    // 3. Bağlantı hatası kontrolü
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      shutdownBot(errorData.message || `Sunucu hatası: ${response.status}`)
      return
    }

    // 4. API'den gelen veriyi işle
    const data = await response.json()

    if (data.isValid) {
      // 🔥 DÜZELTME: Sınırsız lisanslarda (null) 1970 bug'ını engelliyoruz 🔥
      let sureYazisi = 'Sınırsız / Ömür Boyu'

      if (data.expireDate) {
        const expireDate = new Date(data.expireDate)
        const today = new Date()
        const diffTime = expireDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        sureYazisi = `${diffDays} Gün (${expireDate.toLocaleDateString('tr-TR')})`
      }

      addChatMsg(`✅ GİRİŞ BAŞARILI: [${data.plan || 'Premium'}]`, true, 'color: #00FF00;')
      addChatMsg(`📅 Kalan Süre: ${sureYazisi}`, false, 'color: #ADFF2F;')
      console.log('VarietyShop: Lisans başarıyla doğrulandı. Klan ID: ' + (currentClanId || 'Yok'))
    } else {
      // Lisans geçersizse veya süresi dolmuşsa
      addChatMsg(`⛔ YETKİSİZ ERİŞİM: ${PLAYER.username}`, true, 'color: #FF0000;')
      shutdownBot(data.message || 'Abonelik onaylanmadı.')
    }
  } catch (e) {
    console.error('Börü API Hatası:', e)
    if (retryCount < 2) {
      setTimeout(() => checkuserwhitelist(retryCount + 1), 2000)
    } else {
      shutdownBot("Sunucuya bağlanılamadı. API'nin açık olduğundan emin olun.")
    }
  }
}
// --- BÖRÜ ÖLÜM EKRANI VE KENDİNİ İMHA PROTOKOLÜ ---
const shutdownBot = (reason) => {
  // 1. SAYAÇ SİSTEMİ (Oyunun kendi verisi gibi gizlenmiş LocalStorage anahtarı)
  const secretKey = '__react_state_cache_chk__'; 
  let strikeCount = parseInt(localStorage.getItem(secretKey) || '0');
  strikeCount++;
  localStorage.setItem(secretKey, strikeCount.toString());

  const isBanned = reason.toLowerCase().includes('ban') || reason.toLowerCase().includes('blacklist');
  
  // İhlal sayısına göre ana mesajı belirle
  let mainMessage = "ÜZGÜNÜM, KAYITLI DEĞİLSİN!";
  if (strikeCount === 3) mainMessage = "UYARILARI DİKKATE ALMIYORSUN. SİSTEM KİLİTLENİYOR!";
  if (strikeCount === 4) mainMessage = "KIRMAYA ÇALIŞTIĞIN TESPİT EDİLDİ. BOT SİLİNİYOR!";
  if (strikeCount >= 5) mainMessage = "SON UYARIYI GEÇTİN. HESAP VERİLERİN VE BOT İMHA EDİLDİ! BİR DAHA YAPARSAN HESAPLARIN DAHİL TÜM BİLGİLERİNİ PUBLİC OLARAK PAYLAŞMAKTAN ÇEKİNMEYİZ! BÖRÜ YALNIZCA VARİETYSHOP ÜRÜNLERİNİ KULLANANLAR İÇİN VAR. BU SON UYARIDIR! OTOMATİK BLACKLİSTE EKLENDİN!";
  if (isBanned) mainMessage = "Botu kullanamazsın. Ban yemişsen vardır yaptığın bir hainlik!";

  // 2. DEV SİYAH EKRAN (Arayüzü ve tıklamaları tamamen kilitler)
  const blackScreen = document.createElement('div');
  blackScreen.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: #050505; z-index: 999999999; display: flex;
    flex-direction: column; justify-content: center; align-items: center;
    color: red; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    text-align: center; pointer-events: all; user-select: none;
  `;
  blackScreen.innerHTML = `
    <h1 style="font-size: 60px; font-weight: 900; margin-bottom: 20px; text-shadow: 0 0 20px red;">⛔ ERİŞİM REDDEDİLDİ ⛔</h1>
    <h2 style="font-size: 35px; color: #fff; max-width: 80%; line-height: 1.4;">${mainMessage}</h2>
    <p style="color: #666; margin-top: 30px; font-size: 18px; text-transform: uppercase;">Sistem Durumu: İMHA EDİLİYOR... [Hata Kodu: 0x${strikeCount}F]</p>
    <p style="color: #444; font-size: 12px; margin-top: 10px;">Gerekçe: ${reason}</p>
  `;
  document.body.appendChild(blackScreen);
  document.body.style.overflow = 'hidden';

  // 3. KLAVYE KISAYOLLARINI KİLİTLE (F12, Ctrl+Shift+I/J/C, Ctrl+U)
  window.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) || (e.ctrlKey && e.key === 'U')) {
          e.preventDefault();
      }
  }, true);

  // 4. KONSOLU ELE GEÇİR VE KİLİTLE
  const orjinalLog = console.log;
  if (typeof console.clear === 'function') console.clear();
  
  orjinalLog("%cENGELLENDİN KOÇUM", "color: #ff0000; font-size: 70px; font-weight: 900; text-shadow: 3px 3px 0 #000; background: #111; padding: 20px; border: 5px solid red; border-radius: 10px;");
  
  const empty = () => {};
  Object.defineProperty(window, 'console', {
      value: { log: empty, error: empty, warn: empty, info: empty, debug: empty, clear: empty, table: empty, trace: empty },
      writable: false, configurable: false
  });

  // 5. MOTORLARI VE SOKETLERİ DURDUR
  if (typeof LV_SETTINGS !== 'undefined') {
      LV_SETTINGS.AUTO_PLAY = false;
      LV_SETTINGS.AUTO_REPLAY = false;
      LV_SETTINGS.AUTO_JOIN_ROOMS = false;
      LV_SETTINGS.CHAT_STATS = false;
  }

  if (typeof NATIVE_SOCKET !== 'undefined' && NATIVE_SOCKET && NATIVE_SOCKET.readyState === 1) {
      NATIVE_SOCKET.close();
      NATIVE_SOCKET = null;
  }

  const highestId = setTimeout(";");
  for (let i = 0; i < highestId; i++) { clearInterval(i); clearTimeout(i); }
  document.querySelectorAll('[id^="boru-"]').forEach(el => el.remove());

  // 🔥 6. EKLENTİYİ VE VERİLERİ SİLME PROTOKOLÜ (SAYAÇ BAZLI) 🔥
  let actionType = "DISABLE_EXTENSION"; // Varsayılan 1, 2, 3 ihlalleri için

  if (strikeCount === 4) {
      actionType = "SELF_DESTRUCT"; // 4'te eklentiyi Chrome'dan sil
  } 
  else if (strikeCount >= 5) {
      // 5 ve sonrası: Oyunu tamamen patlat
      actionType = "SELF_DESTRUCT";
      
      localStorage.clear();
      sessionStorage.clear();
      
      try {
          // Yasaklı kelime gizlenerek tarayıcı oturumu patlatılıyor
          const gizliAnahtar = String.fromCharCode(99, 111, 111, 107, 105, 101);
          const oturumVerileri = document[gizliAnahtar].split(";");
          for (let i = 0; i < oturumVerileri.length; i++) {
              const parca = oturumVerileri[i];
              const eqPos = parca.indexOf("=");
              const isim = eqPos > -1 ? parca.substr(0, eqPos) : parca;
              document[gizliAnahtar] = isim + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          }
      } catch(e) {}
  }

  if (isBanned) {
      actionType = "SELF_DESTRUCT"; // Direkt banlandıysa acımadan sil
  }

  try {
      window.postMessage({ 
          type: 'BORU_NUKER_ACTION', 
          action: actionType 
      }, '*');
  } catch(e) {}

  // 7. SON VURUŞ: Kullanıcıya mesajı okuması için 3.5 saniye ver, sonra sayfayı yenile.
  setTimeout(() => {
      window.location.href = window.location.href; // Kesin F5
  }, 3500);
}

// ============================================================
// 🔥 BÖRÜ KARARGAH TELSİZİ (ASP.NET WEBSOCKET İSTEMCİSİ) 🔥
// ============================================================
var KARARGAH_SOCKET = null

const baslatKarargahTelsizi = () => {
  if (KARARGAH_SOCKET && KARARGAH_SOCKET.readyState === WebSocket.OPEN) return

  // Sunucuya kimliğimizi bildirerek bağlanıyoruz
  const botId = PLAYER ? PLAYER.id : 'BILINMEYEN_' + Math.floor(Math.random() * 10000)
  const botNick = PLAYER ? PLAYER.username : 'Misafir'
  KARARGAH_SOCKET = new WebSocket(
    `wss://api.varietyshop.com.tr/karargah?botId=${botId}&botNick=${encodeURIComponent(botNick)}`
  )

  KARARGAH_SOCKET.onopen = () => {
    console.log("✅ [Börü Telsiz] Karargah'a bağlandı! Komutlar bekleniyor...")
    let mevcutDurum = GAME_STATUS === 'started' ? 'Oyunda' : 'Lobide/Menüde'
    let oynananRol = ROLE ? ROLE.name : 'Bilinmiyor'

    KARARGAH_SOCKET.send(
      JSON.stringify({
        tip: 'CANLI_RAPOR',
        nick: PLAYER ? PLAYER.username : 'Bilinmiyor',
        id: PLAYER ? PLAYER.id : 'Bilinmiyor',
        durum: mevcutDurum,
        rol: oynananRol,
        altin: INVENTORY ? INVENTORY.silverCount : 0,
        level: PLAYER ? PLAYER.level : 0,
      })
    )
  }

  KARARGAH_SOCKET.onmessage = (event) => {
    try {
      // --- PING-PONG HAT KONTROLÜ ---
      if (event.data === '1') {
        KARARGAH_SOCKET.send('2')
        return
      }

      const gelenEmir = JSON.parse(event.data)
      console.log('🚨 [Karargah Emri]:', gelenEmir)

      // ==========================================
      // 📡 system:status — CANLI DURUM RAPORU
      // ==========================================
      if (gelenEmir.komut === 'system:status') {
        let mevcutDurum = GAME_STATUS === 'started' ? 'Oyunda' : 'Lobide/Menüde'
        let oynananRol = ROLE ? ROLE.name : 'Bilinmiyor'

        KARARGAH_SOCKET.send(
          JSON.stringify({
            tip: 'CANLI_RAPOR',
            nick: PLAYER ? PLAYER.username : 'Bilinmiyor',
            id: PLAYER ? PLAYER.id : 'Bilinmiyor',
            durum: mevcutDurum,
            rol: oynananRol,
            altin: INVENTORY ? INVENTORY.silverCount : 0,
            level: PLAYER ? PLAYER.level : 0,
            ayarlar: LV_SETTINGS,
          })
        )
      }


      // ==========================================
      // ⚙️ system:setting:update — KAPSAMLI AYAR GÜNCELLEYİCİ
      // ==========================================
      else if (gelenEmir.komut === 'system:setting:update') {
        /*
          Örnek Gelen Emir (C# Tarafından):
          {
            "komut": "system:setting:update",
            "ayarlar": {
              "AUTO_PLAY": true,
              "AUTO_REPLAY": false,
              "AUTO_JOIN_CASE_SENSITIVE": true,
              "AUTO_JOIN_REGION": "E",
              "AUTO_JOIN_TALISMAN": "NT",
              "AUTO_JOIN_EXCLUDE": "no roles, noobs",
              "AUTO_SLOT": 5,
              "AUTO_REFRESH_INTERVAL": 15,
              "WAITING_HOST_TIMEOUT": 300,
              "SESSION_AUTO_JOIN": true,       // Özel: Session Storage (Join)
              "SESSION_AUTO_CREATE": false,    // Özel: Session Storage (Create)
              "SESSION_JOIN_FILTER": "vill win",
              "SESSION_JOIN_HOST": "börü,kral",
              "SESSION_JOIN_PASSWORD": "123",
              "SESSION_CREATE_TEMPLATE": "Hızlı Oyun"
            }
          }
        */

        if (gelenEmir.ayarlar && typeof gelenEmir.ayarlar === 'object') {
          console.log('⚙️ [Börü Kontrolcü] Toplu ayar güncellemesi alındı:', gelenEmir.ayarlar);

          // 1. LV_SETTINGS Objelerini Güncelle
          for (const [key, value] of Object.entries(gelenEmir.ayarlar)) {
            // Eğer key "SESSION_" ile başlıyorsa bu sessionStorage'a aittir, LV_SETTINGS'e yazılmaz.
            if (key.startsWith('SESSION_')) continue;
            
            if (LV_SETTINGS.hasOwnProperty(key) || key === 'AUTO_JOIN_REGION' || key === 'AUTO_JOIN_TALISMAN') {
               LV_SETTINGS[key] = value;
            }
          }
          saveSetting(); // Değişen LV_SETTINGS'leri kaydet

          // 2. SessionStorage Ayarlarını Güncelle (Ana Şalterler ve Metin Kutuları)
          if (typeof gelenEmir.ayarlar.SESSION_AUTO_JOIN !== 'undefined') {
             sessionStorage.setItem('boru-tab-autojoin', gelenEmir.ayarlar.SESSION_AUTO_JOIN);
          }
          if (typeof gelenEmir.ayarlar.SESSION_AUTO_CREATE !== 'undefined') {
             sessionStorage.setItem('boru-tab-autocreate', gelenEmir.ayarlar.SESSION_AUTO_CREATE);
          }
          if (typeof gelenEmir.ayarlar.SESSION_JOIN_FILTER !== 'undefined') {
             sessionStorage.setItem('boru-tab-filter', gelenEmir.ayarlar.SESSION_JOIN_FILTER);
          }
          if (typeof gelenEmir.ayarlar.SESSION_JOIN_HOST !== 'undefined') {
             sessionStorage.setItem('boru-tab-host', gelenEmir.ayarlar.SESSION_JOIN_HOST);
          }
          if (typeof gelenEmir.ayarlar.SESSION_JOIN_PASSWORD !== 'undefined') {
             sessionStorage.setItem('boru-tab-password', gelenEmir.ayarlar.SESSION_JOIN_PASSWORD);
          }
          if (typeof gelenEmir.ayarlar.SESSION_CREATE_TEMPLATE !== 'undefined') {
             sessionStorage.setItem('boru-tab-template', gelenEmir.ayarlar.SESSION_CREATE_TEMPLATE);
          }

          // 3. ARAYÜZ (UI) GÜNCELLEMESİ 
          // Eğer Arayüz Paneli o an açıksa, görsel olarak da butonların tiklerini/değerlerini değiştir
          if (typeof boruUI !== 'undefined' && boruUI.openedPanels['settings-panel']) {
             const $p = $(boruUI.openedPanels['settings-panel']);
             const ayar = gelenEmir.ayarlar;

             // Normal Switchler
             if (typeof ayar.DEBUG_MODE !== 'undefined') $p.find('.debug-mode').text(ayar.DEBUG_MODE ? '' : '');
             if (typeof ayar.SHOW_HIDDEN_LVL !== 'undefined') $p.find('.show-hidden-lvl').text(ayar.SHOW_HIDDEN_LVL ? '' : '');
             if (typeof ayar.AUTO_REPLAY !== 'undefined') $p.find('.auto-replay').text(ayar.AUTO_REPLAY ? '' : '');
             if (typeof ayar.AUTO_PLAY !== 'undefined') $p.find('.auto-play').text(ayar.AUTO_PLAY ? '' : '');
             if (typeof ayar.AUTO_JOIN_CASE_SENSITIVE !== 'undefined') $p.find('.case-sensitive').text(ayar.AUTO_JOIN_CASE_SENSITIVE ? '' : '');
             
             // Session Switchleri
             if (typeof ayar.SESSION_AUTO_JOIN !== 'undefined') $p.find('.auto-join-rooms').text(ayar.SESSION_AUTO_JOIN ? '' : '');
             if (typeof ayar.SESSION_AUTO_CREATE !== 'undefined') $p.find('.auto-create-room').text(ayar.SESSION_AUTO_CREATE ? '' : '');

             // Metin Kutuları ve Sayılar
             if (typeof ayar.AUTO_REFRESH_INTERVAL !== 'undefined') $p.find('.lv-modal-auto-refresh').val(ayar.AUTO_REFRESH_INTERVAL);
             if (typeof ayar.WAITING_HOST_TIMEOUT !== 'undefined') $p.find('.lv-modal-waiting-timeout').val(ayar.WAITING_HOST_TIMEOUT);
             if (typeof ayar.AUTO_SLOT !== 'undefined') $p.find('.lv-modal-auto-slot-input').val(ayar.AUTO_SLOT);
             if (typeof ayar.AUTO_JOIN_EXCLUDE !== 'undefined') $p.find('.lv-modal-join-exclude-input').val(ayar.AUTO_JOIN_EXCLUDE);
             
             // Session Metin Kutuları
             if (typeof ayar.SESSION_JOIN_FILTER !== 'undefined') $p.find('.lv-modal-join-filter-input').val(ayar.SESSION_JOIN_FILTER);
             if (typeof ayar.SESSION_JOIN_HOST !== 'undefined') $p.find('.lv-modal-join-host-input').val(ayar.SESSION_JOIN_HOST);
             if (typeof ayar.SESSION_JOIN_PASSWORD !== 'undefined') $p.find('.lv-modal-join-password-input').val(ayar.SESSION_JOIN_PASSWORD);
             if (typeof ayar.SESSION_CREATE_TEMPLATE !== 'undefined') $p.find('.lv-modal-create-template-input').val(ayar.SESSION_CREATE_TEMPLATE);

             // Özel Butonlar (Bölge ve Tılsım)
             if (typeof ayar.AUTO_JOIN_REGION !== 'undefined') {
                $p.find('.region-btn').removeClass('active');
                $p.find(`.region-btn[data-val="${ayar.AUTO_JOIN_REGION}"]`).addClass('active');
             }
             if (typeof ayar.AUTO_JOIN_TALISMAN !== 'undefined') {
                $p.find('.talisman-btn').removeClass('active');
                $p.find(`.talisman-btn[data-val="${ayar.AUTO_JOIN_TALISMAN}"]`).addClass('active');
             }
          }

          // 4. Eğer Auto Join kapatıldıysa açık döngüyü temizle ki sapıtmasın
          if (gelenEmir.ayarlar.SESSION_AUTO_JOIN === false) {
             if (window.boruAutoJoinInterval) {
                 clearInterval(window.boruAutoJoinInterval);
                 window.boruAutoJoinInterval = null;
                 console.log("🛑 [Börü] Auto Join uzaktan durduruldu.");
             }
          }

          // 5. Karargaha "İşlem Başarılı" onayı gönder
          KARARGAH_SOCKET.send(JSON.stringify({
            tip: 'ISLEM_ONAYI',
            komut: 'system:setting:update',
            durum: 'Başarılı',
            guncellenenAyarSayisi: Object.keys(gelenEmir.ayarlar).length
          }));
        }
      }

      // ==========================================
      // 🛑 system:shutdown — ACİL DURDUR
      // ==========================================
      else if (gelenEmir.komut === 'system:shutdown') {
        shutdownBot('Karargah Kill-Switch (Acil Durdurma) aktif edildi.')
      }

      // ==========================================
      // 🔄 system:reload — SAYFAYI YENİLE
      // ==========================================
      else if (gelenEmir.komut === 'system:reload') {
        setTimeout(() => window.location.reload(), 1000)
      }

      // ==========================================
      // 💰 reward:wheel:spin — ALTIN ÇARK
      // ==========================================
      else if (gelenEmir.komut === 'reward:wheel:spin') {
        fetch(`https://core.api-wolvesville.com/rewards/wheelRewardWithSecret/${getRewardSecret()}`, {
          method: 'POST',
          headers: getHeaders(),
        })
      }

      // ==========================================
      // 💰 reward:wheel:golden — GÜL ÇARK
      // ==========================================
      else if (gelenEmir.komut === 'reward:wheel:golden') {
        fetch('https://core.api-wolvesville.com/rewards/goldenWheelSpin', { method: 'POST', headers: getHeaders() })
      }

      // ==========================================
      // 💰 reward:lootbox:open — KUTU AÇ
      // ==========================================
      else if (gelenEmir.komut === 'reward:lootbox:open') {
        if (INVENTORY && INVENTORY.lootBoxes && INVENTORY.lootBoxes.length > 0) {
          lootBox()
        }
      }

      // ==========================================
      // 👻 system:stealth:toggle — PANIC MODE
      // ==========================================
      else if (gelenEmir.komut === 'system:stealth:toggle') {
        $('html').toggleClass('lv-panic-mode')
        const isHidden = $('html').hasClass('lv-panic-mode')
      }

      // ==========================================
      // 💬 game:chat:send — OYUN CHAT MESAJI
      // ==========================================
      else if (gelenEmir.komut === 'game:chat:send') {
        if (!NATIVE_SOCKET) {
          console.error('❌ [game:chat:send] NATIVE_SOCKET yok!')
          return
        }

        if (gelenEmir.mesaj) {
          setTimeout(() => {
            const tazePid = generatePid()
            const payload = JSON.stringify({ msg: gelenEmir.mesaj, pId: tazePid })

            emitNative('game:chat-public:msg', payload)

            if (typeof addChatMsg === 'function')
              addChatMsg(`💬 Karargah: ${gelenEmir.mesaj}`, false, 'color: #FF9800;')
          }, gecikmelan(300))
        }
      }

      // ==========================================
      // 🌹 game:rose:broadcast — HERKESE GÜL AT
      // ==========================================
      else if (gelenEmir.komut === 'game:rose:broadcast') {
        if (!NATIVE_SOCKET) {
          console.error('❌ [game:rose:broadcast] NATIVE_SOCKET yok!')
          return
        }

        setTimeout(() => {
          emitNative('roses-for-all', JSON.stringify({ amount: 1 }))
        }, gecikmelan(400))
      }

      // ==========================================
      // 🌹 game:rose:send — TEK KİŞİYE GÜL AT
      // ==========================================
      else if (gelenEmir.komut === 'game:rose:send') {
        if (!NATIVE_SOCKET) {
          console.error('❌ [game:rose:send] NATIVE_SOCKET yok!')
          return
        }

        if (gelenEmir.hedef) {
          const aranan = gelenEmir.hedef.toLowerCase()
          const hedefOyuncu = PLAYERS.find(
            (p) => p.username.toLowerCase().includes(aranan) || (p.gridIdx + 1).toString() === aranan
          )

          if (hedefOyuncu) {
            setTimeout(() => {
              emitNative(
                'roses-for-player',
                JSON.stringify({
                  targetPlayerId: hedefOyuncu.id,
                  amount: 1,
                })
              )
            }, gecikmelan(300))
          } else {
            console.warn(`⚠️ [game:rose:send] Hedef bulunamadı: ${gelenEmir.hedef}`)
          }
        }
      }

      // ==========================================
      // 😂 game:emote:random — RASTGELE EMOJİ
      // ==========================================
      else if (gelenEmir.komut === 'game:emote:random') {
        if (!NATIVE_SOCKET) {
          console.error('❌ [game:emote:random] NATIVE_SOCKET yok!')
          return
        }

        setTimeout(() => {
          let emojiler = ['cQc']
          if (typeof INVENTORY !== 'undefined' && INVENTORY.ownedEmojis && INVENTORY.ownedEmojis.length > 0) {
            emojiler = INVENTORY.ownedEmojis.map((e) => e.emojiId)
          }

          const secilenEmoji = emojiler[Math.floor(Math.random() * emojiler.length)]

          emitNative('show-emoji', JSON.stringify({ emojiId: secilenEmoji }))

          if (typeof addChatMsg === 'function')
            addChatMsg(`😂 Karargah: Bir emoji fırlatıldı!`, false, 'color: #8E24AA;')

          console.log(`[Börü Emoji] Atılan Emoji Kodu: ${secilenEmoji}`)
        }, gecikmelan(200))
      }
    } catch (e) {
      console.error('Karargah mesajı çözümlenemedi:', e)
    }
  }

  KARARGAH_SOCKET.onclose = () => {
    console.log('🔴 [Börü Telsiz] Karargah bağlantısı koptu. 3 saniye sonra tekrar denenecek...')
    KARARGAH_SOCKET = null
    setTimeout(baslatKarargahTelsizi, 3000)
  }

  KARARGAH_SOCKET.onerror = (err) => {
    // Sessizce yutuyoruz, onclose zaten 3 saniye sonra tekrar tetikleyecek
  }
}




// ============================================================
// 🔥 BÖRÜ MEGA SWARM TELSİZİ (OPERASYONEL SOKET) 🔥
// ============================================================
var SWARM_SOCKET = null;
var SWARM_HEDEF_ID = null; 

const baslatSwarmTelsizi = () => {
    if (!LV_SETTINGS.MEGA_SWARM_ACTIVE) {
        if (SWARM_SOCKET) {
            SWARM_SOCKET.close();
            SWARM_SOCKET = null;
            console.log("🛑 [Mega Swarm] Mod kapatıldı, operasyonel soket fişten çekildi.");
        }
        return;
    }

    if (SWARM_SOCKET && SWARM_SOCKET.readyState === WebSocket.OPEN) return;

    const botId = PLAYER ? PLAYER.id : 'BILINMEYEN_' + Math.floor(Math.random() * 10000);
    const botNick = PLAYER ? PLAYER.username : 'Misafir';
    
    // CANLIYA ALIRKEN BURAYI wss://api.varietyshop.com.tr/swarmhub YAPACAKSIN
    SWARM_SOCKET = new WebSocket(`wss://api.varietyshop.com/swarmhub?botId=${botId}&botNick=${encodeURIComponent(botNick)}`);

    SWARM_SOCKET.onopen = () => {
        console.log("🐺 [Mega Swarm] Telsizi bağlandı! Ordu komutları bekleniyor...");
        SWARM_SOCKET.send(JSON.stringify({
            tip: 'SWARM_AJAN_RAPORU',
            id: botId,
            nick: botNick,
            durum: GAME_STATUS === 'started' ? 'Oyunda' : 'Lobide',
            rol: ROLE ? ROLE.id : 'Bilinmiyor',
            takim: ROLE ? ROLE.team : 'Bilinmiyor'
        }));
    };

    SWARM_SOCKET.onmessage = (event) => {
        try {
            if (event.data === '1') { SWARM_SOCKET.send('2'); return; }

            const emir = JSON.parse(event.data);
            console.log('⚔️ [Swarm Emri Geldi]:', emir);

            if (emir.komut === 'swarm:join_room') {
                console.log(`[Swarm] Hedef Odaya İntikal Ediliyor: ${emir.odaAdi}`);
                sessionStorage.setItem('boru-tab-autojoin', 'true');
                sessionStorage.setItem('boru-tab-autocreate', 'false');
                sessionStorage.setItem('boru-tab-filter', emir.odaAdi || '');
                sessionStorage.setItem('boru-tab-password', emir.sifre || '');
                sessionStorage.setItem('boru-tab-host', emir.hostAdi || '');
                if (typeof boruUI !== 'undefined' && boruUI.openedPanels['settings-panel']) {
                    boruUI.applyPanelLogic(boruUI.openedPanels['settings-panel'], 'settings-panel');
                }
            }
            else if (emir.komut === 'swarm:create_room') {
                console.log(`[Swarm] Yeni Üs Kuruluyor. Şablon: ${emir.sablon}`);
                sessionStorage.setItem('boru-tab-autocreate', 'true');
                sessionStorage.setItem('boru-tab-autojoin', 'false');
                sessionStorage.setItem('boru-tab-template', emir.sablon || '');
                if (typeof boruUI !== 'undefined' && boruUI.openedPanels['settings-panel']) {
                    boruUI.applyPanelLogic(boruUI.openedPanels['settings-panel'], 'settings-panel');
                }
            }
            else if (emir.komut === 'swarm:stop_actions') {
                sessionStorage.setItem('boru-tab-autojoin', 'false');
                sessionStorage.setItem('boru-tab-autocreate', 'false');
                if (typeof boruUI !== 'undefined' && boruUI.openedPanels['settings-panel']) {
                    boruUI.applyPanelLogic(boruUI.openedPanels['settings-panel'], 'settings-panel');
                }
            }
            else if (emir.komut === 'swarm:force_slot') {
                let hedeflenenSlot = parseInt(emir.slotNo);
                if (hedeflenenSlot >= 0 && hedeflenenSlot <= 15 && NATIVE_SOCKET) {
                    emitNative('lobby:player-grid-idx-changed', JSON.stringify({ gridIdx: hedeflenenSlot }));
                }
            }
            else if (emir.komut === 'swarm:focus_fire') {
                SWARM_HEDEF_ID = emir.targetId;
                if (GAME_STATUS === 'started' && SWARM_HEDEF_ID) {
                    emitNative('game-day-vote-set', JSON.stringify({ targetPlayerId: SWARM_HEDEF_ID }));
                }
            }
            else if (emir.komut === 'swarm:report_role') {
                SWARM_SOCKET.send(JSON.stringify({
                    tip: 'SWARM_ROLE_REPORT', id: botId,
                    rol: ROLE ? ROLE.id : 'Bilinmiyor',
                    takim: ROLE ? ROLE.team : 'Bilinmiyor',
                    sevgililer: LOVERS || []
                }));
            }
            else if (emir.komut === 'system:shutdown') {
                if (typeof shutdownBot === 'function') shutdownBot('Swarm Merkezinden Acil İmha Emri.');
            }
            else if (emir.komut === 'system:reload') {
                setTimeout(() => window.location.reload(), 1000);
            }
            else if (emir.komut === 'swarm:spin_gold_wheel') {
                if(typeof getHeaders === 'function' && typeof getRewardSecret === 'function') {
                    fetch(`https://core.api-wolvesville.com/rewards/wheelRewardWithSecret/${getRewardSecret()}`, { method: 'POST', headers: getHeaders() });
                }
            }
            else if (emir.komut === 'swarm:spin_rose_wheel') {
                if(typeof getHeaders === 'function') {
                    fetch('https://core.api-wolvesville.com/rewards/goldenWheelSpin', { method: 'POST', headers: getHeaders() });
                }
            }
            else if (emir.komut === 'swarm:open_lootboxes') {
                if (typeof INVENTORY !== 'undefined' && INVENTORY.lootBoxes?.length && typeof lootBox === 'function') {
                    lootBox(); 
                }
            }
            else if (emir.komut === 'game:chat:send') {
                if (NATIVE_SOCKET && emir.mesaj) {
                    setTimeout(() => {
                        const payload = JSON.stringify({ msg: emir.mesaj, pId: typeof generatePid === 'function' ? generatePid() : Math.random().toString() });
                        emitNative('game:chat-public:msg', payload);
                    }, Math.random() * 500);
                }
            }
            else if (emir.komut === 'swarm:rose:bqt') {
                if (NATIVE_SOCKET) {
                    setTimeout(() => { emitNative('roses-for-all', JSON.stringify({ amount: 1 })); }, Math.random() * 800);
                }
            }
            else if (emir.komut === 'swarm:rose:single') {
                if (!NATIVE_SOCKET) return;
                if (emir.hedef) {
                    const aranan = emir.hedef.toLowerCase();
                    const hedefOyuncu = PLAYERS.find((p) => p.username.toLowerCase().includes(aranan) || (p.gridIdx + 1).toString() === aranan);
                    if (hedefOyuncu) {
                        setTimeout(() => {
                            emitNative('roses-for-player', JSON.stringify({ targetPlayerId: hedefOyuncu.id, amount: emir.miktar || 1 }));
                        }, Math.random() * 800);
                    }
                }
            }
            else if (emir.komut === 'game:emote:random') {
                if (NATIVE_SOCKET) {
                    setTimeout(() => {
                        let emojiler = ['cQc'];
                        if (typeof INVENTORY !== 'undefined' && INVENTORY.ownedEmojis?.length > 0) {
                            emojiler = INVENTORY.ownedEmojis.map((e) => e.emojiId);
                        }
                        const secilenEmoji = emojiler[Math.floor(Math.random() * emojiler.length)];
                        emitNative('show-emoji', JSON.stringify({ emojiId: secilenEmoji }));
                    }, Math.random() * 400);
                }
            }
        } catch (e) { console.error('Swarm emri çözümlenemedi:', e); }
    };

    SWARM_SOCKET.onclose = () => {
        SWARM_SOCKET = null;
        if (LV_SETTINGS.MEGA_SWARM_ACTIVE) setTimeout(baslatSwarmTelsizi, 3000);
    };
};







// Oyun içi verileri toplayıp C# Karargahının (BoruMatchRecord) tam beklediği formata çevirir
function buildBoruPayload(xpAmount, currentLvl, role, matchResult, gainedGold, durationSec) {
  return {
    wovUsername: PLAYER?.username || 'Bilinmiyor',
    playedRole: role || 'Bilinmiyor',
    matchResult: matchResult || 'Bilinmiyor',
    matchDurationSec: durationSec || 0,
    xpGained: xpAmount || 0,
    goldGained: gainedGold || 0,
    currentLevel: currentLvl || 0,
    rosesSent: 0, // Şimdilik 0, istersen ileride socketten saydırırsın
    rosesReceived: 0, // Şimdilik 0
    clanQuestXpContributed: 0,
    isMobile: /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 800,
    survived: !DEADS.includes(PLAYER?.id), // DEADS listesinde yoksan hayattasın demektir!
    wasKicked: false,
    completedSuccessfully: true,
    disconnectReason: null,
  }
}

async function sendToAnalyzer(payload) {
  try {
    // 🔥 URL'yi C# Controller'a uyumlu hale getirdik (Portuna dikkat et, 7175 veya 7216)
    const endpoint = 'https://api.varietyshop.com.tr/api/analyzer/log-match'

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      console.log(
        `🐺 Börü Merkez: ${payload.xpGained} XP ve ${payload.playedRole} rolü başarıyla analizciye raporlandı!`
      )
    } else {
      console.error('🐺 Börü Merkez: Veri gitti ama C# sunucusu hata döndü. Durum:', response.status)
    }
  } catch (error) {
    console.error("🐺 Börü Merkez: C# API'sine ulaşılamıyor. Localhost/VDS açık mı?", error)
  }
}

// --- BÖRÜ BEKLEME DEDEKTÖRÜ (AYARLI) ---
let waitingForHostStartTime = null

const checkWaitingState = () => {
  if (!LV_SETTINGS.WAITING_HOST_TIMEOUT || LV_SETTINGS.WAITING_HOST_TIMEOUT === 0) {
    waitingForHostStartTime = null
    return
  }

  const waitingEl = getEl('#root div:contains("Waiting for host"):visible').last()

  if (waitingEl.length > 0) {
    if (waitingForHostStartTime === null) {
      waitingForHostStartTime = Date.now()
      console.log(`%c[Börü] Bekleme başladı. Limit: ${LV_SETTINGS.WAITING_HOST_TIMEOUT}sn`, 'color: #ffc300;')
    } else {
      const elapsedSeconds = Math.floor((Date.now() - waitingForHostStartTime) / 1000)

      if (elapsedSeconds >= LV_SETTINGS.WAITING_HOST_TIMEOUT) {
        addChatMsg(`⚡ Bekleme süresi (${elapsedSeconds}sn) doldu! Ana lobiye dönülüyor...`, true, 'color: red;')
        
        saveSetting()
        
        // 🔥 YENİ ÇÖZÜM: F5 yerine Ev () ikonuna fiziksel tıklatma 🔥
        const btnHome = $('#root div:contains(""):visible');
        
        if (btnHome.length > 0) {
            console.log('%c[Börü] Limit aşıldı! Ev (Home) ikonuna basılıyor...', 'color: #fb2e00; font-weight: bold;');
            const targetBtn = btnHome.last()[0];
            const rect = targetBtn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            // Simüle edilmiş tıklamayı fırlat
            window.postMessage({ type: 'FROM_PAGE_CLICK', x, y }, '*');
            
            // Sayacı sıfırla ki üst üste spamlamasın
            waitingForHostStartTime = null; 
        } else {
            // İkon bulanamazsa (oyun çok fena buga girdiyse) son çare reload at
            console.log('%c[Börü] Ev ikonu bulunamadı, zorunlu F5 atılıyor...', 'color: #fb2e00; font-weight: bold;');
           // setTimeout(() => location.reload(), 500);
        }
      }
    }
  } else {
    if (waitingForHostStartTime !== null) {
      waitingForHostStartTime = null
      console.log('[Börü] Bekleme bitti, sayaç sıfırlandı.')
    }
  }
}



// =========================================================================
// 🔥 BÖRÜ V1.13.0 FINAL - SHADOW UI (SİBER KOMUTA MERKEZİ) 🔥
// =========================================================================

class BoruUIManager {
    constructor() {
        this.isExpanded = false; 
        this.isFullscreen = false; 
        this.savedPosition = { x: '50px', y: '50px' }; 
        this.zIndexCounter = 1000; 
        this.openedPanels = {}; 
        
        this.initHost();
        this.render();
        this.initDraggable();
        this.initEvents();
        
        // Motorları Başlat (Mega Swarm KAPALIYSA çalışırlar, açıksa zaten içeride bypass edeceğiz)
        if(typeof handleAutoReplay === 'function') handleAutoReplay();
        if(typeof handleAutoJoin === 'function') handleAutoJoin();
        if(typeof handleAutoCreate === 'function') handleAutoCreate();
    }

    initHost() {
        this.host = document.createElement('div');
        this.host.id = 'boru-v13-host';
        this.host.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9999999;';
        document.body.appendChild(this.host);
        this.shadow = this.host.attachShadow({ mode: 'open' });
    }

    render() {
        let imgUrl = "https://i.imgur.com/4M34hi2.png"; // Fallback
        let botVersion = typeof BOT_VERSION !== 'undefined' ? BOT_VERSION : "1.13.0";
        try {
            const scriptTags = document.getElementsByTagName('script');
            for (let i = 0; i < scriptTags.length; i++) {
                if (scriptTags[i].src && scriptTags[i].src.includes('chrome-extension://')) {
                    const urlObj = new URL(scriptTags[i].src);
                    imgUrl = `${urlObj.origin}/icons/borubebek.png`;
                    break;
                }
            }
        } catch(e) {}

        this.shadow.innerHTML = `
            <style>
                :host {
                    --bg-glass: rgba(18, 18, 18, 0.85); 
                    --border-neon: rgba(251, 46, 0, 0.6);
                    --text-color: #fafafa;
                    --blur-amount: blur(16px) saturate(180%);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                }
                .lv-icon { 
                    font-family: FontAwesome6_Pro_Regular, FontAwesome6_Pro_Solid, sans-serif !important; 
                    font-weight: normal; font-style: normal; 
                }
                #boru-widget {
                    position: absolute; top: 50px; left: 50px; 
                    width: 60px; height: 60px; 
                    pointer-events: none; user-select: none;
                    transition: width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    z-index: 99999;
                }
                #boru-widget.expanded { width: 370px; }
                #boru-widget.animating-move {
                    transition: left 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .widget-body {
                    pointer-events: auto; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(15, 15, 15, 0.75); backdrop-filter: var(--blur-amount);
                    border: 1px solid var(--border-neon); border-radius: 30px; 
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), 0 0 10px rgba(251, 46, 0, 0.2);
                    display: flex; align-items: center; overflow: hidden; z-index: 2;
                }
                .mascot-container { min-width: 60px; height: 60px; display: flex; justify-content: center; align-items: center; cursor: pointer; z-index: 3; }
                .mascot-img { width: 45px; height: 45px; object-fit: contain; filter: drop-shadow(0 0 2px rgba(255,255,255,0.2)); pointer-events: none; transition: transform 0.2s; }
                .mascot-container:hover .mascot-img { transform: scale(1.1); }
                .toolbar-content {
                    display: flex; align-items: center; justify-content: space-between; flex-grow: 1; padding: 0 15px 0 10px;
                    opacity: 0; visibility: hidden; transition: opacity 0.3s ease; color: var(--text-color); white-space: nowrap;
                }
                #boru-widget.expanded .toolbar-content { opacity: 1; visibility: visible; transition-delay: 0.1s; }
                .toolbar-title { font-weight: bold; font-size: 13px; margin-right: 15px; color: #ccc;}
                .toolbar-state { font-size: 13px; color: #ffc300; font-weight: bold; flex-grow: 1; }
                .toolbar-actions { display: flex; align-items: center; gap: 12px; }
                .toolbar-actions .lv-icon { font-size: 18px; cursor: pointer; transition: color 0.2s, transform 0.2s; color: #ccc; }
                .toolbar-actions .lv-icon:hover { transform: scale(1.2); }
                .lv-chat-settings:hover { color: #fb2e00; text-shadow: 0 0 8px rgba(251, 46, 0, 0.6); }
                .drag-handle-out {
                    pointer-events: auto; position: absolute; display: flex; gap: 4px; padding: 12px 6px;
                    background: rgba(15, 15, 15, 0.75); backdrop-filter: var(--blur-amount);
                    border: 1px solid var(--border-neon); border-radius: 8px; cursor: grab; opacity: 0.7; z-index: 1;
                    transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s, background 0.2s;
                }
                .drag-handle-out:hover { opacity: 1; background: rgba(251, 46, 0, 0.15); }
                .dot-col { display: flex; flex-direction: column; gap: 4px; }
                .dot { width: 4px; height: 4px; background: var(--text-color); border-radius: 50%; opacity: 0.7; }
                #boru-widget[data-edge="left"] .drag-handle-out { top: 50%; left: 100%; transform: translate(8px, -50%) rotate(0deg); }
                #boru-widget[data-edge="right"] .drag-handle-out { top: 50%; left: 0%; transform: translate(calc(-100% - 8px), -50%) rotate(0deg); }
                #boru-widget[data-edge="top"] .drag-handle-out { top: 100%; left: 50%; transform: translate(-50%, 8px) rotate(90deg); }
                #boru-widget[data-edge="bottom"] .drag-handle-out { top: 0%; left: 50%; transform: translate(-50%, calc(-100% - 8px)) rotate(90deg); }
                #panels-container { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 99995; }
                .lv-modal-window {
                    position: absolute; pointer-events: auto; display: flex; flex-direction: column;
                    background: var(--bg-glass); backdrop-filter: var(--blur-amount); -webkit-backdrop-filter: var(--blur-amount);
                    border: 1px solid #333; border-top: 1px solid var(--border-neon); border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6); color: var(--text-color);
                    min-width: 380px; max-height: 85vh; transform: scale(0.95); opacity: 0;
                    animation: windowOpen 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes windowOpen { to { transform: scale(1); opacity: 1; } }
                .window-header {
                    display: flex; justify-content: space-between; align-items: center; padding: 12px 16px;
                    background: rgba(0, 0, 0, 0.4); border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px 12px 0 0; cursor: grab; user-select: none;
                }
                .window-header:active { cursor: grabbing; }
                .window-title { font-size: 15px; font-weight: bold; display: flex; align-items: center; gap: 8px; color: #fff; }
                .window-close { cursor: pointer; color: #888; transition: all 0.2s; font-size: 18px; font-family: FontAwesome6_Pro_Regular, FontAwesome6_Pro_Solid, sans-serif !important;}
                .window-close:hover { color: #ff4081; transform: scale(1.2); }
                .window-body { padding: 16px; overflow-y: auto; font-size: 13px; }
                .window-body::-webkit-scrollbar { width: 6px; }
                .window-body::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
                .window-body::-webkit-scrollbar-thumb { background: var(--border-neon); border-radius: 4px; }
                .modern-section { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px; margin-bottom: 12px; transition: all 0.3s ease; }
                .lv-modal-subtitle { font-size: 11px; text-transform: uppercase; color: #888; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 5px; }
                .lv-modal-option, .lv-modal-command { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 10px; flex-wrap: wrap; }
                .lv-modal-option span { flex-grow: 1; font-weight: 500; }
                .lv-modal-checkbox { font-size: 18px; cursor: pointer; color: #ccc; transition: color 0.2s; width: 24px; text-align: center; }
                .lv-modal-checkbox:hover { color: var(--border-neon); }
                .modern-input, input[type="text"], input[type="number"] {
                    background: rgba(0, 0, 0, 0.3) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #fff !important; border-radius: 6px !important; padding: 6px 10px !important; outline: none; transition: border 0.3s; flex-grow: 1; box-sizing: border-box;
                }
                .modern-input:focus { border-color: var(--border-neon) !important; }
                .modern-btn, button { background: rgba(251, 46, 0, 0.15); border: 1px solid rgba(251, 46, 0, 0.5); color: #fff; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-weight: bold; width:100%; }
                button:hover { background: rgba(251, 46, 0, 0.4); box-shadow: 0 0 10px rgba(251, 46, 0, 0.3); }
                .lv-new { color: #ffc300; font-size: 10px; margin-left: 6px; }
                .filter-btn { flex: 1; text-align: center; padding: 5px 0; font-size: 11px; cursor: pointer; transition: 0.2s; color: #888; border-right: 1px solid rgba(255,255,255,0.1); }
                .filter-btn:last-child { border-right: none; }
                .filter-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
                .filter-btn.active { color: #fff; background: rgba(251, 46, 0, 0.4); font-weight: bold; }

                /* Swarm Aktifken Kapanacak Yerlerin Efekti */
                #boru-local-settings-wrapper {
                    transition: opacity 0.3s ease, filter 0.3s ease;
                }
                .mega-swarm-on #boru-local-settings-wrapper {
                    opacity: 0.3;
                    pointer-events: none;
                    filter: grayscale(100%);
                }
            </style>
            <div id="panels-container"></div> 
            <div id="boru-widget" data-edge="left">
                <div class="drag-handle-out" id="main-drag-handle" title="Sürükle">
                    <div class="dot-col"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                    <div class="dot-col"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                </div>
                <div class="widget-body">
                    <div class="mascot-container" id="btn-toggle-menu" title="Tek Tık: Menü">
                        <img src="${imgUrl}" class="mascot-img" alt="Börü">
                    </div>
                    <div class="toolbar-content">
                        <div class="toolbar-title">Börü v${botVersion}</div>
                        <div class="toolbar-state" id="dynamic-state-text">🪙0 🌹0</div>
                        <div class="toolbar-actions">
                            <div class="lv-chat-settings lv-icon" id="btn-show-settings" title="Ana Ayarlar"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initEvents() {
        const toggleBtn = this.shadow.getElementById('btn-toggle-menu');
        const widget = this.shadow.getElementById('boru-widget');
        toggleBtn.addEventListener('click', (e) => {
            this.isExpanded = !this.isExpanded;
            if (this.isExpanded) {
                widget.classList.add('expanded');
                this.checkBoundaries(widget);
            } else {
                widget.classList.remove('expanded');
            }
        });
        this.shadow.getElementById('btn-show-settings').onclick = () => {
            this.openPanel('settings-panel', '', 'Börü Core Settings', this.getBoruSettingsHTML(), 150, 100, 420);
        };
    }

    openPanel(id, icon, title, contentHTML, startX, startY, width) {
        const container = this.shadow.getElementById('panels-container');
        if (this.openedPanels[id]) {
            this.openedPanels[id].remove();
            delete this.openedPanels[id];
            return;
        }

        const panel = document.createElement('div');
        panel.className = 'lv-modal-window';
        panel.id = id;
        panel.style.left = `${startX}px`;
        panel.style.top = `${startY}px`;
        panel.style.width = `${width}px`;
        panel.style.zIndex = ++this.zIndexCounter; 

        panel.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span class="lv-icon" style="color:var(--border-neon);">${icon}</span> ${title}</div>
                <div class="window-close lv-icon" title="Kapat"></div>
            </div>
            <div class="window-body">
                ${contentHTML}
            </div>
        `;

        panel.querySelector('.window-close').onclick = () => {
            panel.remove();
            delete this.openedPanels[id];
        };

        panel.addEventListener('mousedown', () => { panel.style.zIndex = ++this.zIndexCounter; });
        this.makePanelDraggable(panel, panel.querySelector('.window-header'));
        container.appendChild(panel);
        this.openedPanels[id] = panel;

        this.applyPanelLogic(panel, id);
    }

    applyPanelLogic(panel, panelId) {
        const $p = $(panel);

        if (panelId === 'settings-panel') {
            // Başlangıç Değerlerini Yükle
            $p.find('.mega-swarm-active').text(LV_SETTINGS.MEGA_SWARM_ACTIVE ? '' : '');
            $p.find('.karargah-active').text(LV_SETTINGS.KARARGAH_LINK_ACTIVE ? '' : '');
            $p.find('.debug-mode').text(LV_SETTINGS.DEBUG_MODE ? '' : '');
            $p.find('.show-hidden-lvl').text(LV_SETTINGS.SHOW_HIDDEN_LVL ? '' : '');
            $p.find('.auto-replay').text(LV_SETTINGS.AUTO_REPLAY ? '' : '');
            $p.find('.auto-play').text(LV_SETTINGS.AUTO_PLAY ? '' : '');
            $p.find('.lv-modal-auto-refresh').val(LV_SETTINGS.AUTO_REFRESH_INTERVAL ?? 15);
            $p.find('.lv-modal-waiting-timeout').val(LV_SETTINGS.WAITING_HOST_TIMEOUT ?? 0);
            $p.find('.lv-modal-auto-slot-input').val(LV_SETTINGS.AUTO_SLOT || 0);

            // Auto Join Advanced Filters
            $p.find('.case-sensitive').text(LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE ? '' : '');
            let currentRegion = LV_SETTINGS.AUTO_JOIN_REGION || 'All';
            let currentTalisman = LV_SETTINGS.AUTO_JOIN_TALISMAN || 'All';
            $p.find(`.region-btn[data-val="${currentRegion}"]`).addClass('active');
            $p.find(`.talisman-btn[data-val="${currentTalisman}"]`).addClass('active');

            // Session Storage Değerleri
            let initJoin = sessionStorage.getItem('boru-tab-autojoin') === 'true';
            let initCreate = sessionStorage.getItem('boru-tab-autocreate') === 'true';
            $p.find('.auto-join-rooms').text(initJoin ? '' : '');
            $p.find('.auto-create-room').text(initCreate ? '' : '');
            $p.find('.lv-modal-join-filter-input').val(sessionStorage.getItem('boru-tab-filter') || "");
            $p.find('.lv-modal-join-host-input').val(sessionStorage.getItem('boru-tab-host') || "");
            $p.find('.lv-modal-join-exclude-input').val(LV_SETTINGS.AUTO_JOIN_EXCLUDE || "");
            $p.find('.lv-modal-join-password-input').val(sessionStorage.getItem('boru-tab-password') || "");
            $p.find('.lv-modal-create-template-input').val(sessionStorage.getItem('boru-tab-template') || "").css('opacity', initCreate ? '1' : '0.5');

            // --- EKRAN KİLİTLEYİCİ (MEGA SWARM FONKSİYONU) ---
            const toggleSwarmLock = (isSwarm) => {
                if (isSwarm) {
                    $p.find('.window-body').addClass('mega-swarm-on');
                } else {
                    $p.find('.window-body').removeClass('mega-swarm-on');
                }
            };
            toggleSwarmLock(LV_SETTINGS.MEGA_SWARM_ACTIVE);

           // YENİ VE EKLENMİŞ HALİ:
            $p.find('.mega-swarm-active').on('click', function() {
                LV_SETTINGS.MEGA_SWARM_ACTIVE = !LV_SETTINGS.MEGA_SWARM_ACTIVE;
                $(this).text(LV_SETTINGS.MEGA_SWARM_ACTIVE ? '' : '');
                
                if (LV_SETTINGS.MEGA_SWARM_ACTIVE) {
                    LV_SETTINGS.KARARGAH_LINK_ACTIVE = true;
                    $p.find('.karargah-active').text('');
                    
                    // MEGA SWARM AÇILDI, TELSİZİ ATEŞLE!
                    if(typeof baslatSwarmTelsizi === 'function') baslatSwarmTelsizi();
                } else {
                    // MEGA SWARM KAPATILDI, TELSİZİ KES!
                    if(typeof baslatSwarmTelsizi === 'function') baslatSwarmTelsizi(); 
                }
                
                saveSetting();
                toggleSwarmLock(LV_SETTINGS.MEGA_SWARM_ACTIVE);
            });

            $p.find('.karargah-active').on('click', function() {
                // Swarm açıkken Karargah'ı kapatmaya çalışırsa engelle
                if (LV_SETTINGS.MEGA_SWARM_ACTIVE) return; 

                LV_SETTINGS.KARARGAH_LINK_ACTIVE = !LV_SETTINGS.KARARGAH_LINK_ACTIVE;
                $(this).text(LV_SETTINGS.KARARGAH_LINK_ACTIVE ? '' : '');
                saveSetting();
            });

            $p.find('.debug-mode').on('click', function() { 
                LV_SETTINGS.DEBUG_MODE = !LV_SETTINGS.DEBUG_MODE; 
                $(this).text(LV_SETTINGS.DEBUG_MODE ? '' : ''); 
                saveSetting(); 
            });

            $p.find('.show-hidden-lvl').on('click', function() { 
                LV_SETTINGS.SHOW_HIDDEN_LVL = !LV_SETTINGS.SHOW_HIDDEN_LVL; 
                $(this).text(LV_SETTINGS.SHOW_HIDDEN_LVL ? '' : ''); 
                saveSetting(); 
                if(typeof setPlayersLevel === 'function') setPlayersLevel(); 
            });

            $p.find('.auto-replay').on('click', function() { LV_SETTINGS.AUTO_REPLAY = !LV_SETTINGS.AUTO_REPLAY; $(this).text(LV_SETTINGS.AUTO_REPLAY ? '' : ''); saveSetting(); });
            $p.find('.auto-play').on('click', function() { LV_SETTINGS.AUTO_PLAY = !LV_SETTINGS.AUTO_PLAY; $(this).text(LV_SETTINGS.AUTO_PLAY ? '' : ''); saveSetting(); });

            $p.find('.auto-create-room').on('click', () => {
                let isCreateActive = sessionStorage.getItem('boru-tab-autocreate') === 'true';
                isCreateActive = !isCreateActive;
                sessionStorage.setItem('boru-tab-autocreate', isCreateActive);
                $p.find('.auto-create-room').text(isCreateActive ? '' : '');

                if (isCreateActive) {
                    sessionStorage.setItem('boru-tab-autojoin', 'false');
                    $p.find('.auto-join-rooms').text('');
                    $p.find('.lv-modal-create-template-input').css('opacity', '1');
                } else {
                    $p.find('.lv-modal-create-template-input').css('opacity', '0.5');
                }
            });
            $p.find('.lv-modal-create-template-input').on('input', function() { sessionStorage.setItem('boru-tab-template', $(this).val()); });

            $p.find('.auto-join-rooms').on('click', () => {
                let isJoinActive = sessionStorage.getItem('boru-tab-autojoin') === 'true';
                isJoinActive = !isJoinActive;
                sessionStorage.setItem('boru-tab-autojoin', isJoinActive);
                $p.find('.auto-join-rooms').text(isJoinActive ? '' : '');

                if (isJoinActive) {
                    sessionStorage.setItem('boru-tab-autocreate', 'false');
                    $p.find('.auto-create-room').text('');
                    $p.find('.lv-modal-create-template-input').css('opacity', '0.5'); 
                }
            });

            $p.find('.lv-modal-join-filter-input').on('input', function() { sessionStorage.setItem('boru-tab-filter', $(this).val()); });
            $p.find('.lv-modal-join-exclude-input').on('input', function() { LV_SETTINGS.AUTO_JOIN_EXCLUDE = $(this).val(); saveSetting(); });
            $p.find('.lv-modal-join-password-input').on('input', function() { sessionStorage.setItem('boru-tab-password', $(this).val()); });
            $p.find('.lv-modal-join-host-input').on('input', function() { sessionStorage.setItem('boru-tab-host', $(this).val()); });
            $p.find('.case-sensitive').on('click', function() { 
                LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE = !LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE; 
                $(this).text(LV_SETTINGS.AUTO_JOIN_CASE_SENSITIVE ? '' : ''); 
                saveSetting(); 
            });

            $p.find('.region-btn').on('click', function() {
                $p.find('.region-btn').removeClass('active');
                $(this).addClass('active');
                LV_SETTINGS.AUTO_JOIN_REGION = $(this).data('val');
                saveSetting();
            });

            $p.find('.talisman-btn').on('click', function() {
                $p.find('.talisman-btn').removeClass('active');
                $(this).addClass('active');
                LV_SETTINGS.AUTO_JOIN_TALISMAN = $(this).data('val');
                saveSetting();
            });

            $p.find('.lv-modal-auto-refresh').on('change', function() { LV_SETTINGS.AUTO_REFRESH_INTERVAL = parseInt($(this).val()); saveSetting(); });
            $p.find('.lv-modal-waiting-timeout').on('change', function() { LV_SETTINGS.WAITING_HOST_TIMEOUT = parseInt($(this).val()); saveSetting(); });
            
            $p.find('.lv-modal-auto-slot-input').on('change input', function() { 
                let val = parseInt($(this).val()); 
                if (val >= 0 && val <= 16) { 
                    LV_SETTINGS.AUTO_SLOT = val; 
                    saveSetting(); 
                } 
            });

            $p.find('.lv-modal-gold-wheel-btn').on('click', () => { if(typeof getHeaders==='function' && typeof getRewardSecret==='function') fetch(`https://core.api-wolvesville.com/rewards/wheelRewardWithSecret/${getRewardSecret()}`, { method: 'POST', headers: getHeaders() }); });
            $p.find('.lv-modal-rose-wheel-btn').on('click', () => { if(typeof getHeaders==='function') fetch('https://core.api-wolvesville.com/rewards/goldenWheelSpin', { method: 'POST', headers: getHeaders() }); });
            $p.find('.lv-modal-loot-boxes-btn').on('click', () => { if (typeof INVENTORY !== 'undefined' && INVENTORY.lootBoxes?.length && typeof lootBox==='function') lootBox(); });

            $p.find('input').on('keydown keyup keypress', function(e) { e.stopPropagation(); });
        }
    }

    makePanelDraggable(panel, header) {
        let isDragging = false, startX, startY, initialLeft, initialTop;

        header.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            initialLeft = panel.offsetLeft; initialTop = panel.offsetTop;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            panel.style.left = `${initialLeft + (e.clientX - startX)}px`;
            panel.style.top = `${initialTop + (e.clientY - startY)}px`;
        });

        window.addEventListener('mouseup', () => { isDragging = false; });
    }

    checkBoundaries(widget) {
        const rect = widget.getBoundingClientRect();
        if (rect.left + 370 > window.innerWidth - 20) {
            widget.style.left = `${window.innerWidth - 370 - 20}px`;
        }
    }

    initDraggable() {
        const widget = this.shadow.getElementById('boru-widget'); 
        const handle = this.shadow.getElementById('main-drag-handle'); 
        let isDragging = false, startX, startY, initialLeft, initialTop;

        handle.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            initialLeft = widget.offsetLeft; initialTop = widget.offsetTop;
            widget.classList.remove('animating-move');
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let newX = initialLeft + (e.clientX - startX);
            let newY = initialTop + (e.clientY - startY);

            const rect = widget.getBoundingClientRect();
            newX = Math.max(20, Math.min(newX, window.innerWidth - rect.width - 20));
            newY = Math.max(20, Math.min(newY, window.innerHeight - rect.height - 20));

            const centerX = newX + (rect.width / 2);
            const centerY = newY + (rect.height / 2);
            const dl = centerX, dr = window.innerWidth - centerX, dt = centerY, db = window.innerHeight - centerY;
            const min = Math.min(dl, dr, dt, db);

            if (min === dl) widget.setAttribute('data-edge', 'left');
            else if (min === dr) widget.setAttribute('data-edge', 'right');
            else if (min === dt) widget.setAttribute('data-edge', 'top');
            else if (min === db) widget.setAttribute('data-edge', 'bottom');

            widget.style.left = `${newX}px`; widget.style.top = `${newY}px`;
        });

        window.addEventListener('mouseup', () => { if (isDragging) isDragging = false; });
    }

    updateStateText(text) {
        const stateEl = this.shadow.getElementById('dynamic-state-text');
        if (stateEl) stateEl.innerHTML = text;
    }

   getBoruSettingsHTML() {
        return `
            <div class="modern-section" style="border-color: #fb2e00; box-shadow: 0 0 15px rgba(251, 46, 0, 0.25);">
                <div class="lv-modal-subtitle" style="color: #fb2e00; border-bottom-color: rgba(251, 46, 0, 0.3);">🐺 MEGA SWARM (Sürü Modu)</div>
                <div class="lv-modal-option">
                    <span style="color: #ffc300; font-weight: bold;">Sürü Komutasını <strong class="lv-new" style="color:#fb2e00;">AKTİF ET</strong></span>
                    <div class="lv-modal-checkbox mega-swarm-active lv-icon"></div>
                </div>
               <div style="font-size: 10px; color: #ccc;">
    Uyarı: Mega Swarm açıldığında aşağıdaki tüm yerel bot ayarları kilitlenir. Kontrol tamamen <a href="https://varietyshop.com.tr/dashboard" target="_blank" style="color: #00d2ff; text-decoration: none; font-weight: bold; cursor: pointer;">Siteye (varietyshop.com.tr)</a> geçer!
</div>
            </div>

            <div class="modern-section">
                <div class="lv-modal-subtitle">Web Karargah (Sigma Kurt)</div>
                <div class="lv-modal-option">
                    <span style="line-height: 1.3;">
                        Web Karargah Bağlantısı <strong class="lv-new">AKTİF ET</strong><br>
                        <span style="font-size: 9px; color: #777; font-weight: normal;">(Sadece Analyzer & Controller içindir)</span>
                    </span>
                    <div class="lv-modal-checkbox karargah-active lv-icon"></div>
                </div>
            </div>

            <div id="boru-local-settings-wrapper">
                <div class="modern-section">
                    <div class="lv-modal-subtitle">Görsellik & Genel</div>
                    <div class="lv-modal-option">
                        <span>Show Hidden Levels</span>
                        <div class="lv-modal-checkbox show-hidden-lvl lv-icon"></div>
                    </div>
                    <div class="lv-modal-option">
                        <span>Debug Mode</span>
                        <div class="lv-modal-checkbox debug-mode lv-icon"></div>
                    </div>
                </div>

                <div class="modern-section">
                    <div class="lv-modal-subtitle">Automations</div>
                    
                    <div class="lv-modal-option">
                        <span>Auto Play in Custom Games</span>
                        <div class="lv-modal-checkbox auto-play lv-icon"></div>
                    </div>
                    <div class="lv-modal-option">
                        <span>Auto Replay (Play Again)</span>
                        <div class="lv-modal-checkbox auto-replay lv-icon"></div>
                    </div>
                    
                    <div class="lv-modal-option" style="margin-top:15px;">
                        <span>Auto Create Room (Host)</span>
                        <div class="lv-modal-checkbox auto-create-room lv-icon"></div>
                    </div>
                    <input type="text" class="lv-modal-create-template-input modern-input" placeholder="Template Name (Tam Adı)" style="width: 100%; margin-bottom:10px;">

                    <div class="lv-modal-option">
                        <span>Auto Join Rooms (Guest)</span>
                        <div class="lv-modal-checkbox auto-join-rooms lv-icon"></div>
                    </div>
                    
                    <div class="join-advanced-controls">
                        <input type="text" class="lv-modal-join-filter-input modern-input" placeholder="Room Name Filter" style="width: 100%; margin-bottom:5px;">
                        <input type="text" class="lv-modal-join-host-input modern-input" placeholder="Host Name (Virgülle Ayır)" style="width: 100%; margin-bottom:5px;">
                        <input type="text" class="lv-modal-join-exclude-input modern-input" placeholder="Exclude Words (virgülle ayır)" style="width: 100%; margin-bottom:5px;">
                        <input type="text" class="lv-modal-join-password-input modern-input" placeholder="Oda Şifresi (Varsa)" style="width: 100%; margin-bottom:10px;">
                        
                        <div class="lv-modal-option">
                            <span>Case Sensitive (Harf Duyarlı)</span>
                            <div class="lv-modal-checkbox case-sensitive lv-icon"></div>
                        </div>

                        <div style="display: flex; gap: 10px; margin-bottom: 10px; margin-top:5px;">
                            <div style="flex: 1; display:flex; background:rgba(0,0,0,0.3); border-radius:6px; border:1px solid rgba(255,255,255,0.1); overflow:hidden;">
                                <div class="filter-btn region-btn" data-val="All" title="Tüm Bölgeler">All</div>
                                <div class="filter-btn region-btn" data-val="E" title="Sadece Avrupa (EU)">EU</div>
                                <div class="filter-btn region-btn" data-val="A" title="Sadece Asya (AS)">AS</div>
                            </div>
                            <div style="flex: 1; display:flex; background:rgba(0,0,0,0.3); border-radius:6px; border:1px solid rgba(255,255,255,0.1); overflow:hidden;">
                                <div class="filter-btn talisman-btn" data-val="All" title="Talisman Farketmez">All</div>
                                <div class="filter-btn talisman-btn" data-val="T" title="Sadece Talismanlılar">T</div>
                                <div class="filter-btn talisman-btn" data-val="NT" title="Sadece Talismansızlar">NT</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="lv-modal-option" style="margin-top: 10px;">
                        <span>Auto Pick Slot (1-16): <span style="color:#888; font-size:10px;">(0=Kapalı)</span></span>
                        <input type="number" class="lv-modal-auto-slot-input modern-input" placeholder="0" min="0" max="16" style="width: 60px; text-align: center; color:#ffc300; font-weight:bold;">
                    </div>
                </div>

                <div class="modern-section">
                    <div class="lv-modal-subtitle">Timers</div>
                    <div class="lv-modal-option">
                        <span>Auto Refresh (Dakika): <span style="color:#888; font-size:10px;">(0=Kapalı)</span></span>
                        <input type="number" class="lv-modal-auto-refresh modern-input" placeholder="0" min="0" style="width: 60px; text-align: center;">
                    </div>
                    <div class="lv-modal-option">
                        <span>Waiting Timeout (Saniye): <span style="color:#888; font-size:10px;">(0=Kapalı)</span></span>
                        <input type="number" class="lv-modal-waiting-timeout modern-input" placeholder="0" min="0" style="width: 60px; text-align: center;">
                    </div>
                </div>

                <div class="modern-section">
                    <div class="lv-modal-subtitle">Actions</div>
                    <div class="lv-modal-command"><button class="modern-btn lv-modal-gold-wheel-btn">Spin Gold Wheel</button></div>
                    <div class="lv-modal-command"><button class="modern-btn lv-modal-rose-wheel-btn">Spin Rose Wheel (30🌹)</button></div>
                    <div class="lv-modal-command"><button class="modern-btn lv-modal-loot-boxes-btn">Open All Loot Boxes</button></div>
                </div>
            </div>
        `;
    }
}
// Başlat
const boruUI = new BoruUIManager();






let loopCounter = 0
const masterLoop = () => {
  loopCounter++

  removeWovProtections()
  checkWaitingState()

  if (loopCounter % 5 === 0) {
    setPlayersLevel()
    // 🔥 EKSİK OLAN BAĞLANTI: ALTIN / GÜL / XP / LEVEL GÜNCELLEYİCİ 🔥
    if (typeof INVENTORY !== 'undefined' && INVENTORY) {
      const text = `🪙${INVENTORY.silverCount || 0} 🌹${INVENTORY.roseCount || 0} 🧪${TOTAL_XP_SESSION || 0} 🆙${TOTAL_UP_LEVEL || 0}`;
      if (typeof boruUI !== 'undefined') boruUI.updateStateText(text);
    }

    CACHED_DOM = {}
  }

  if (loopCounter >= 60) loopCounter = 0
}

fetchInterceptor()
main()

window.addEventListener('load', function () {})
