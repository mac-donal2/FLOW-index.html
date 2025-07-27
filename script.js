const playerInstance = jwplayer("player");
jwplayer.key = "XSuP4qMl+9tK17QNb+4+th2Pm9AWgMO/cYH8CI0HGGr7bdjo"
let currentChannel = channelList[0];
let indexActivo = 0;
const platform = window.navigator.platform
const crossIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform: ;msFilter:;"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg>'
const listIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" style="fill: rgba(255 , 255  , 255 , 1);transform: ;msFilter:;"><path d="M5.282 12.064c-.428.328-.72.609-.875.851-.155.24-.249.498-.279.768h2.679v-.748H5.413c.081-.081.152-.151.212-.201.062-.05.182-.142.361-.27.303-.218.511-.42.626-.604.116-.186.173-.375.173-.578a.898.898 0 0 0-.151-.512.892.892 0 0 0-.412-.341c-.174-.076-.419-.111-.733-.111-.3 0-.537.038-.706.114a.889.889 0 0 0-.396.338c-.094.143-.159.346-.194.604l.894.076c.025-.188.074-.317.147-.394a.375.375 0 0 1 .279-.108c.11 0 .2.035.272.108a.344.344 0 0 1 .108.258.55.55 0 0 1-.108.297c-.074.102-.241.254-.503.453zm.055 6.386a.398.398 0 0 1-.282-.105c-.074-.07-.128-.195-.162-.378L4 18.085c.059.204.142.372.251.506.109.133.248.235.417.306.168.069.399.103.692.103.3 0 .541-.047.725-.14a1 1 0 0 0 .424-.403c.098-.175.146-.354.146-.544a.823.823 0 0 0-.088-.393.708.708 0 0 0-.249-.261 1.015 1.015 0 0 0-.286-.11.943.943 0 0 0 .345-.299.673.673 0 0 0 .113-.383.747.747 0 0 0-.281-.596c-.187-.159-.49-.238-.909-.238-.365 0-.648.072-.847.219-.2.143-.334.353-.404.626l.844.151c.023-.162.067-.274.133-.338s.151-.098.257-.098a.33.33 0 0 1 .241.089c.059.06.087.139.087.238 0 .104-.038.193-.117.27s-.177.112-.293.112a.907.907 0 0 1-.116-.011l-.045.649a1.13 1.13 0 0 1 .289-.056c.132 0 .237.041.313.126.077.082.115.199.115.352 0 .146-.04.266-.119.354a.394.394 0 0 1-.301.134zm.948-10.083V5h-.739a1.47 1.47 0 0 1-.394.523c-.168.142-.404.262-.708.365v.754a2.595 2.595 0 0 0 .937-.48v2.206h.904zM9 6h11v2H9zm0 5h11v2H9zm0 5h11v2H9z"></path></svg>'
let audioChanged = false

// Configura el reproductor
async function setupPlayer() {
  try {
    var mpd = await getValidMpd();

    jwplayer("player").setup({
      playlist: [{
        sources: [{
          default: true,
          type: "dash",
          file: mpd,
          drm: {
            clearkey: { keyId: channelList[0].keyId, key: channelList[0].key }
          }
        }]
      }],
      width: "100%",
      height: "100vh",
      aspectratio: "16:9",
      autostart: "true",
      cast: {},
      sharing: {}
    });

    playerInstance.on("firstFrame", function () {
      setProgramInfo(currentChannel)
    })

    playerInstance.on('audioTracks', (e) => {
      const currentTrack = playerInstance.getCurrentAudioTrack()
      if (currentTrack !== 1 && !audioChanged) playerInstance.setCurrentAudioTrack(1)
    })

    playerInstance.on('audioTrackChanged', (e) => {
      audioChanged = true
    })
      
    playerInstance.on("play", function () {
      // playerInstance.setCurrentAudioTrack(1);
      // Setea calidad maxima disponible
      if (playerInstance.getQualityLevels().length > 1) playerInstance.setCurrentQuality(1)
      // Muestra bitrate de las calidades en PC
      if (platform == 'Win32'){
        let bitrates = playerInstance.getQualityLevels()
        let qualities = document.querySelectorAll('#jw-player-settings-submenu-quality button')
        qualities.forEach(e => bitrates.forEach(f => f.label == e.innerText ? e.innerText += ` (${Math.round(f.bitrate / 1000)}kbps)` : ''))
      }
    });

    playerInstance.on("error", (e) => {
      // mt2.splice(0, 1)
      // changeChannel(null, null, currentChannel.getURL)
    })

    playerInstance.on("ready", () => {
      // Fix live tabindex
      const liveInterval = setInterval(() => {
        const live = document.querySelector("#player").querySelector(".jw-text-live");
        if (live) {
          clearInterval(liveInterval);
          document.querySelector("#player").querySelector(".jw-text-live").setAttribute("tabindex", -1);
        }
      }, 500);
      // Desactiva interaccion con el reproductor
      document.querySelector("#player").querySelectorAll("*:not(div.channelList)").forEach((e) => e.setAttribute("tabindex", -1));
      document.querySelector("#player").setAttribute("tabindex", -1);

      // Desactiva keybinds, desmutea reproductor y pantalla completa
      if (!localStorage.getItem("jwplayer.enableShortcuts")) {
        localStorage.setItem("jwplayer.enableShortcuts", "false");
        localStorage.setItem("jwplayer.bitrateSelection", "5145136");
        localStorage.setItem("jwplayer.qualityLabel", "1080p");
        location.reload()
      }
      localStorage.setItem("jwplayer.qualityLabel", "1080p");
      playerInstance.setMute(0);
      playerInstance.setVolume(100);
      if (platform != 'Win32') playerInstance.setFullscreen(true);
      // Crea contenedor de canales
      const channelListElement = document.createElement("div");
      channelListElement.classList = "channelList";
      channelListElement.style.display = 'block'
      channelListElement.addEventListener("click", changeChannel);
      player.prepend(channelListElement);

      // Crea pop-up seleccion numero de canal
      const channelNumberElement = document.createElement("div");
      const channelNumberElementText = document.createElement("span");
      channelNumberElement.classList = "channelNumber";
      channelNumberElement.append(channelNumberElementText);
      player.prepend(channelNumberElement);

      // Crea info del programa
      const programInfoElement = document.createElement("div");
      programInfoElement.classList = "programInfo";
      const programImageContainer = document.createElement("div")
      programImageContainer.classList = 'programImage'
      const programImage = document.createElement("img");
      programImage.classList = 'programImageBanner'
      programImageContainer.append(programImage)
      const channelImage = document.createElement("img");
      channelImage.classList = 'channelImage'
      programImageContainer.append(channelImage)
      const programInfoTitleContainer = document.createElement("div");
      programInfoTitleContainer.classList = 'programDescription'
      const programInfoTitle = document.createElement("h1");
      const programInfoDescription = document.createElement("p");
      const programInfoHour = document.createElement("span");
      programInfoTitleContainer.append(programInfoTitle)
      programInfoTitleContainer.append(programInfoDescription)
      programInfoTitleContainer.append(programInfoHour)
      programInfoElement.append(programImageContainer)
      programInfoElement.append(programInfoTitleContainer)
      player.append(programInfoElement)
      

      // Crea todos los botones de los canales
      channelList.forEach((e, i) => {
        const btn = document.createElement("button");
        const cnImage = document.createElement("img");
        cnImage.src = '/canales/canales/logos/' + (e.img || 'canal.webp')
        const cnName = document.createElement("span");
        cnName.innerText = e.name || atob(e.getURL).replaceAll("_", " ");
        const cnNumber = document.createElement("span");
        cnNumber.innerText = i + 1;
        btn.appendChild(cnImage);
        btn.appendChild(cnName);
        btn.appendChild(cnNumber);
        btn.setAttribute("getURL", e.getURL);
        btn.setAttribute("tabindex", 0);
        document.querySelector(".channelList").appendChild(btn);
      });

      // Cambiar canales con flechas (↑) (↓)
      const getChannelList = document.querySelector(".channelList");
      const elementos = document.querySelectorAll('[tabindex="0"]'); // Selecciona todos los elementos con tabindex="0"

      // Función para enfocar el siguiente/anterior elemento
      function enfocarElemento(index) {
        if (index >= 0 && index < elementos.length) {
          elementos[index].focus();
        }
      }
      enfocarElemento(indexActivo);

      document.addEventListener("keydown", (e) => {

        if (platform == 'Win32' && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
          document.querySelector('.channelArrow').innerHTML = crossIcon
          document.querySelector('.channelArrow').classList.remove('fs')
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          changeLeftPos()
          getChannelList.style.display = "block";
          // Flecha abajo, mover al siguiente elemento
          indexActivo = (indexActivo + 1) % elementos.length;
          enfocarElemento(indexActivo);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          changeLeftPos()
          getChannelList.style.display = "block";
          // Flecha arriba, mover al anterior elemento
          indexActivo = (indexActivo - 1 + elementos.length) % elementos.length;
          enfocarElemento(indexActivo);
        } else if (e.key === "ArrowLeft") {
          platform == 'Win32' && getChannelList.style.display == "block" && hideArrow();
          getChannelList.style.display = "none";
          document.querySelector(':root').style.setProperty('--leftPos', '0px')
        } else if (e.key === "ArrowRight") {
          platform == 'Win32' && getChannelList.style.display == "none" && hideArrow();
          getChannelList.style.display = "block";
          changeLeftPos()
          enfocarElemento(indexActivo);
        }
      });

      const changeLeftPos = () => {
        document.querySelector(':root').style.setProperty('--leftPos', getChannelList.offsetWidth + 'px')
        document.querySelector(':root').style.removeProperty('--leftPos')
      }

      
      if (platform == 'Win32') {
        const listArrow = document.createElement("span")
        listArrow.classList = "channelArrow";
        listArrow.innerHTML = crossIcon
        // listArrow.innerHTML = 
        listArrow.addEventListener("click", hideArrow);
        // listArrow.style.left = channelListElement.offsetWidth + 'px'
        player.prepend(listArrow)

        function hideArrow () {
          const getChannelList = document.querySelector(".channelList");
          let visible = getChannelList.style.display
          if (visible == 'block'){
            getChannelList.style.display = 'none'
            document.querySelector(':root').style.setProperty('--leftPos', '0px')
            listArrow.innerHTML = listIcon
            listArrow.classList.add('fs')
          } else {
            getChannelList.style.display = 'block'
            changeLeftPos()
            listArrow.innerHTML = crossIcon
            listArrow.classList.remove('fs')
            enfocarElemento(indexActivo)
          }
        }
      }
      

    });
  } catch (error) {
    console.error("Failed to setup player:", error);
    console.error("No se encontraron URLs válidas.");
  }
}

// Funcion cambiar canales
const changeChannel = async (e, channelNumber, refreshList) => {
  const selectedChannel = e?.target.getAttribute("getURL") || e?.target.parentElement.getAttribute("getURL") || channelList[channelNumber - 1]?.getURL || refreshList;
  const channelInfo = channelList.find((f) => f.getURL == selectedChannel);
  const mpd = await getValidMpd(channelInfo);
  
  if (platform == 'Win32') {
    const currentChannelNum = channelList.findIndex((f) => f.getURL == selectedChannel)
    indexActivo = currentChannelNum
    
    // Temporal
    const elementos = document.querySelectorAll('[tabindex="0"]')
    function enfocarElemento(index) {
      if (index >= 0 && index < elementos.length) {
        elementos[index].focus();
      }
    }
    enfocarElemento(currentChannelNum);
  }

  if (channelInfo.type != 'external') {
    playerInstance.load({
      sources: [
        {
          default: true,
          type: "dash",
          file: mpd,
          drm: {
            clearkey: { keyId: channelInfo.keyId, key: channelInfo.key },
          },
        },
      ],
    });
  } else {
    playerInstance.load({
      sources: [
        {
          default: true,
          type: "hls",
          file: mpd
        },
      ],
    });
  }


  playerInstance.stop()
  playerInstance.play()
  playerInstance.setMute(0);
  playerInstance.setVolume(100);
  // playerInstance.setCurrentQuality(1);
};

// Muestra informacion del programa actual
let programTimer;
const runProgramTimer = () => programTimer = setTimeout(() => {document.querySelector('.programInfo').style.visibility = 'hidden'}, 6000);
const setProgramInfo = async (channelInfo) => {
  if (!channelInfo.pid) return
  const programInfoElement = document.querySelector('.programInfo')

  const updateProgramInfo = (programInfo) => {
    const { Title, Description, Start, End } = programInfo
    const { Url } = programInfo.Images.VideoFrame[0]

    clearTimeout(programTimer)
    runProgramTimer()
    programInfoElement.querySelector('.programImage .programImageBanner').src = `https://spotlight-ar.cdn.telefonica.com/customer/v1/source?image=${encodeURIComponent(Url)}?width=240&height=135&resize=CROP&format=WEBP`
    programInfoElement.querySelector('.programImage .channelImage').src = `/canales/canales/logos/${(channelInfo.img || 'canal.webp')}`
    programInfoElement.querySelector('.programDescription h1').innerText = Title
    programInfoElement.querySelector('.programDescription p').innerText = Description
    programInfoElement.querySelector('.programDescription span').innerText = `${new Date(Start * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(End * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    programInfoElement.style.visibility = 'visible'
  }

  try {
    let response = await fetch(`https://contentapi-ar.cdn.telefonica.com/29/default/es-AR/schedules?fields=Pid,Title,Description,ChannelName,CallLetter,Start,End,LiveChannelPid,LiveProgramPid,images.videoFrame,AgeRatingPid&starttime=${Math.floor(Date.now()/1000)}&endtime=${Math.floor(Date.now()/1000)}&livechannelpids=${channelInfo.pid || 'LCH3267'}`);
    
    if (response.ok) {
      let data = await response.json()
      data.Content[0] && updateProgramInfo(data.Content[0])
    } else {
      console.log("Invalid URL, status:", response.statusText);
    }
  } catch (error) {
    console.log("Error fetching URL:", error);
  }
}

// Dominios
let mt = [
  "chromecast",
  // "cdn"
  
  //No funciona
  // "edge1-ccast-sl",
  // "edge-live01-mun",
  // "edge-live11-hr",
  // "edge-live12-hr",
  // "edge-live13-hr",
  // "edge-live14-hr",
  // "edge-live15-hr",
  // "edge-live16-hr",
  // "edge-live17-hr",
  // "edge-live31-hr",
  // "edge-live32-hr",
  // "edge-live34-hr",
  // "edge-live11-sl",
  // "edge-live12-sl",
  // "edge-live13-sl",
  // "edge-live15-sl",
  // "edge-live17-sl",
  // "edge-live31-sl",
  // "edge-vod02-sl",
  // "edge-vod04-sl",
  // "edge-vod06-sl",
  // "edge9-sl",
  // "edge10-sl",
  // "edge-live14-sl",
  // "edge-vod01-hr",
  // "edge-vod03-hr",
  // "edge-vod04-hr",
  // "edge6-ccast-sl",
  // "edge-live01-cen",
  // "edge-live03-cen",
  // "edge-vod01-cen",
  // "edge-live01-coe",
  // "edge-mix01-coe",
  // "edge-mix02-coe",
  // "edge-mix03-coe",
  // "edge-mix01-ird",
  // "edge-mix02-ird",
  // "edge-mix01-mus",
  // "edge-mix03-mus",
]

async function getURLwithToken() {
  let token = sessionStorage.getItem('token')
  if (!token) {
    const url = 'https://chromecast.cvattv.com.ar/live/c7eds/La_Nacion/SA_Live_dash_enc/La_Nacion.m3u8';
    let response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (response.redirected) {
      const regex = /(https:\/\/.+?)(?=\/live)/;
      const match = response.url.match(regex);
      if (match) {
        token = match[0]
        sessionStorage.setItem('token', match[0])
      }
    }
  }
  return token
}

// Comprueba dominios y lo asigna
let mt2 = [...mt];
async function getValidMpd(channelInfo) {
  const channelToLoad = channelInfo || channelList[0];
  currentChannel = channelToLoad;
  if (channelToLoad.type == 'external') return channelToLoad.getURL
  let getMPDTries = 0
  // while (mt2.length > 0) {
  while (getMPDTries < 5) {
    getMPDTries++
    let urlWithToken = await getURLwithToken()
    let url = `${urlWithToken}/live/c${channelToLoad.number || 3}eds/${atob(channelToLoad.getURL)}/SA_Live_dash_enc/${atob(channelToLoad.getURL)}.mpd`;

    async function readStream(streamMPD) {
      return streamMPD.read().then(({ value }) => {
        const decoder = new TextDecoder();
        const mpdProcessed = decoder.decode(value, { stream: true });
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(mpdProcessed, 'application/xml');
        const adaptationSets = xmlDoc.getElementsByTagName('AdaptationSet');
        const repId = adaptationSets[1].getElementsByTagName('Representation')[0].getAttribute('id')
        const baseURL = adaptationSets[1].getElementsByTagName('SegmentTemplate')[0].getAttribute('initialization')
        const segmentUrl = baseURL.replace('$RepresentationID$', repId);
        return segmentUrl
      }).catch(error => {
        console.error('Error reading mpd:', error);
      });
    }

    try {
      let response = await fetch(url, { signal: AbortSignal.timeout(5000) }); // Cancel at 5s if response timeout
      if (!response.ok || response.status !== 200) throw new Error('MPD token caido')
      const mpd_MP4 = await readStream(response.body.getReader())
      const mpd_MP4_url = `${response.url.slice(0, response.url.indexOf('SA_Live_dash_enc')+17)}${mpd_MP4}`
      let MP4_response = await fetch(mpd_MP4_url)
      if (MP4_response.ok) {
        getMPDTries = 0
        audioChanged = false
        return url
      } else {
        console.log(`Link caido. Error: ${MP4_response.status}. Reintentando... (${getMPDTries})`);
        throw new Error('MPD Caido')
      }
    } catch (error) {
      console.log("Error fetching URL:", error);
    }

    // let randomIndex = Math.floor(Math.random() * mt2.length);
    // let url = `https://${mt2[randomIndex]}.cvattv.com.ar/live/c${channelToLoad.number || 3}eds/${atob(channelToLoad.getURL)}/SA_Live_dash_enc/${atob(channelToLoad.getURL)}.m3u8`;
    
    // let url = `https://${mt2[0]}.cvattv.com.ar/live/c${channelToLoad.number || 3}eds/${atob(channelToLoad.getURL)}/SA_Live_dash_enc/${atob(channelToLoad.getURL)}.mpd`;
    // let url = `https://edge-live15-sl.cvattv.com.ar/tok_eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNzUxMzE3NzgxIiwic2lwIjoiMjAxLjE3Ny45OC4xNzgiLCJwYXRoIjoiL2xpdmUvYzdlZHMvTGFfTmFjaW9uL1NBX0xpdmVfZGFzaF9lbmMvIiwic2Vzc2lvbl9jZG5faWQiOiI1Yjc0N2E0NGU2ZjMxNjM3Iiwic2Vzc2lvbl9pZCI6IiIsImNsaWVudF9pZCI6IiIsImRldmljZV9pZCI6IiIsIm1heF9zZXNzaW9ucyI6MCwic2Vzc2lvbl9kdXJhdGlvbiI6MCwidXJsIjoiaHR0cHM6Ly8yMDEuMjM1LjY2LjEyMiIsImF1ZCI6IjEwOCIsInNvdXJjZXMiOls4NSwxNDQsMTg0LDg2LDg4XX0=.b9ImLm941UoCmyftDMI-9nq1LrIQ7G7cJAJdMupPGGO2MHr0-PLYPGQpD4lbwbuWIpNV-TKaueJRz7_GPKdOrA==/live/c${channelToLoad.number || 3}eds/${atob(channelToLoad.getURL)}/SA_Live_dash_enc/${atob(channelToLoad.getURL)}.mpd`;
    // let url = 'https://qn-01282-hor-1-07-1---7169-magk.http.global.dns.qwilted-cds.cqloud.com/tok_eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNzQ3NTMxNjMzIiwic2lwIjoiMTkwLjQ4LjY5LjE3MiIsInBhdGgiOiIvbGl2ZS9jN2Vkcy9MYV9OYWNpb24vU0FfTGl2ZV9kYXNoX2VuYy8iLCJzZXNzaW9uX2Nkbl9pZCI6ImYwMmJmM2ZjNGUxMDMxOWMiLCJzZXNzaW9uX2lkIjoiIiwiY2xpZW50X2lkIjoiIiwiZGV2aWNlX2lkIjoiIiwibWF4X3Nlc3Npb25zIjowLCJzZXNzaW9uX2R1cmF0aW9uIjowLCJ1cmwiOiJodHRwczovLzE4MS4xMi4zNi4xNTAiLCJhdWQiOiIyNzciLCJzb3VyY2VzIjpbODZdfQ==.UeeKkrGxIjaLtmDVTnN8ErJcA4-Ypi8tTf-85nfdnICkr6JIa3FX3iMNmOy9DD16gIN_wKYBd4TxgcdSCcWf3Q==/live/c3eds/La_Nacion/SA_Live_dash_enc/La_Nacion.mpd'
    // let url = `https://${mt2[0]}.cvattv.com.ar/tok_eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNzMzMjExMTYxIiwic2lwIjoiMjAxLjE3Ny43My4yMTYiLCJwYXRoIjoiL2xpdmUvYzdlZHMvTGFfTmFjaW9uL1NBX0xpdmVfZGFzaF9lbmMvIiwic2Vzc2lvbl9jZG5faWQiOiI3ZGYwNzMyYWY5MmE3ZTA1Iiwic2Vzc2lvbl9pZCI6IiIsImNsaWVudF9pZCI6IiIsImRldmljZV9pZCI6IiIsIm1heF9zZXNzaW9ucyI6MCwic2Vzc2lvbl9kdXJhdGlvbiI6MCwidXJsIjoiaHR0cHM6Ly8yMDEuMjM1LjY2LjExNCIsImF1ZCI6IjgxIiwic291cmNlcyI6Wzg1LDE0NCw4Niw4OF19.-8iWhQwMfdW6lhZp52d_MlCPr9PWiZ1UnUK460IkCVvQCunasIODmekjgjJlD6T-IwDEKfQBk1ZANWUZxbTHHA==/live/c${channelToLoad.number || 3}eds/${atob(channelToLoad.getURL)}/SA_Live_dash_enc/${atob(channelToLoad.getURL)}.mpd`;
    
    /*
    try {
      let response = await fetch(url, { signal: AbortSignal.timeout(5000) }); // Cancel at 5s if response timeout
      if (!response.ok) throw new Error('MPD Caido')
      
      console.log('Antes: ', response)

      const MPDUrl = response.url.replace('m3u8', 'mpd')
      const MPDresponse = await fetch(MPDUrl)
      const mpd_MP4 = await readStream(MPDresponse.body.getReader())
      // console.log(`${response.url.slice(0, response.url.indexOf('SA_Live_dash_enc')+17)}${mpd_MP4}`)
      
      
      const urlFromMpd = await readStream(response.body.getReader())
      // console.log(urlFromMpd)
      const streamUrl = (response.redirected) ? `${response.url.slice(0, response.url.indexOf('SA_Live_dash_enc')+17)}${urlFromMpd}` : `https://edge-live15-sl.cvattv.com.ar/tok_eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNzUxMzE3NzgxIiwic2lwIjoiMjAxLjE3Ny45OC4xNzgiLCJwYXRoIjoiL2xpdmUvYzdlZHMvTGFfTmFjaW9uL1NBX0xpdmVfZGFzaF9lbmMvIiwic2Vzc2lvbl9jZG5faWQiOiI1Yjc0N2E0NGU2ZjMxNjM3Iiwic2Vzc2lvbl9pZCI6IiIsImNsaWVudF9pZCI6IiIsImRldmljZV9pZCI6IiIsIm1heF9zZXNzaW9ucyI6MCwic2Vzc2lvbl9kdXJhdGlvbiI6MCwidXJsIjoiaHR0cHM6Ly8yMDEuMjM1LjY2LjEyMiIsImF1ZCI6IjEwOCIsInNvdXJjZXMiOls4NSwxNDQsMTg0LDg2LDg4XX0=.b9ImLm941UoCmyftDMI-9nq1LrIQ7G7cJAJdMupPGGO2MHr0-PLYPGQpD4lbwbuWIpNV-TKaueJRz7_GPKdOrA==/live/c${channelToLoad.number || 3}eds/${atob(channelToLoad.getURL)}/SA_Live_dash_enc/${urlFromMpd}`;
      // const streamUrl = `https://${mt2[0]}.cvattv.com.ar/tok_eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNzMzMjExMTYxIiwic2lwIjoiMjAxLjE3Ny43My4yMTYiLCJwYXRoIjoiL2xpdmUvYzdlZHMvTGFfTmFjaW9uL1NBX0xpdmVfZGFzaF9lbmMvIiwic2Vzc2lvbl9jZG5faWQiOiI3ZGYwNzMyYWY5MmE3ZTA1Iiwic2Vzc2lvbl9pZCI6IiIsImNsaWVudF9pZCI6IiIsImRldmljZV9pZCI6IiIsIm1heF9zZXNzaW9ucyI6MCwic2Vzc2lvbl9kdXJhdGlvbiI6MCwidXJsIjoiaHR0cHM6Ly8yMDEuMjM1LjY2LjExNCIsImF1ZCI6IjgxIiwic291cmNlcyI6Wzg1LDE0NCw4Niw4OF19.-8iWhQwMfdW6lhZp52d_MlCPr9PWiZ1UnUK460IkCVvQCunasIODmekjgjJlD6T-IwDEKfQBk1ZANWUZxbTHHA==/live/c${channelToLoad.number || 3}eds/${atob(channelToLoad.getURL)}/SA_Live_dash_enc/${urlFromMpd}`
      let response2 = await fetch(streamUrl)
    } catch (error) {
      console.log("Error fetching URL:", error);
      //mt2.splice(0, 1);
    }
    */
  }
  mt2 = [...mt]
  const errorMsg = document.querySelector('.homeScreen #appError'); errorMsg && (errorMsg.style.display = 'block');
  const animLoader = document.querySelector('.homeScreen .loader'); animLoader && (animLoader.style.display = 'none');
  throw new Error("No valid MPD URL found. Reloading list...");
}

setupPlayer();

// Deteccion controles TV
let pressed = "";
let timer;
const runTimer = () => {
  timer = setTimeout(() => {
    indexActivo = Number(pressed) - 1;
    changeChannel(null, pressed, null);
    pressed = "";
    document.querySelector(".channelNumber").style.visibility = "hidden";
  }, 2000);
};

document.addEventListener("keypress", (e) => {
  if (!(e.keyCode >= 48 && e.keyCode <= 57)) return;
  if (pressed.length > 2) return;
  document.querySelector(".channelNumber").style.visibility = "visible";
  const channelNumberBox = document.querySelector(".channelNumber span");
  pressed += e.key;
  channelNumberBox.innerText = pressed;
  if (pressed.length >= 1) {
    clearTimeout(timer);
    runTimer();
  }
});

// Touch slide canales android
const debounceDelay = 50;
let debounceTimeout;
let startX = 0;

document.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

document.addEventListener('touchmove', (e) => {
  const chnList = document.querySelector(".channelList")
  const currentX = e.touches[0].clientX; 

  if (!e.target.className.match("jw-reset")) return;
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
        if (currentX < startX) {
          chnList.style.transform = `translateX(-${chnList.offsetWidth}px)`
          document.querySelector(':root').style.setProperty('--leftPos', '0px')
        } else {
          chnList.style.transform = "translateX(0px)"
          document.querySelector(':root').style.setProperty('--leftPos', `${chnList.offsetWidth}px`)

        }
  }, debounceDelay);
});