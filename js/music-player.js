/**
 * 音乐播放器模块
 * 使用网易云音乐API
 * 支持封面同步、歌词显示（内嵌/侧边）
 */

window.MusicPlayer = (function() {
  // ===== 状态 =====
  let state = {
    isPlaying: false,
    currentSong: null,
    currentIndex: -1,
    playlist: [],
    volume: 0.7,
    isMuted: false,
    playMode: 'list',
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    isLoading: false,
    showLyrics: false,
    lyricsMode: 'inside', // inside 或 side
    lyrics: [],
    currentLyricIndex: -1,
  };

  let elements = {};
  let audio = new Audio();

  // ===== 网易云音乐API列表 =====
  const API_BASES = [
    'https://zm.armoe.cn',
    'http://dg-t.cn:3000',
    'http://45.152.64.114:3005',
  ];

  let currentApiIndex = 0;

  function getApi() {
    return API_BASES[currentApiIndex];
  }

  function switchApi() {
    currentApiIndex = (currentApiIndex + 1) % API_BASES.length;
  }

  // ===== 预置热门歌曲 =====
  const hotSongs = [
    { id: 190137, name: '七里香', artist: '周杰伦', album: '七里香', duration: '04:12' },
    { id: 190058, name: '晴天', artist: '周杰伦', album: '叶惠美', duration: '04:29' },
    { id: 185868, name: '稻香', artist: '周杰伦', album: '魔杰座', duration: '03:42' },
    { id: 190059, name: '青花瓷', artist: '周杰伦', album: '我很忙', duration: '03:59' },
    { id: 190060, name: '夜曲', artist: '周杰伦', album: '十一月的萧邦', duration: '04:35' },
    { id: 418603077, name: '告白气球', artist: '周杰伦', album: '周杰伦的床边故事', duration: '03:35' },
    { id: 190056, name: '简单爱', artist: '周杰伦', album: '范特西', duration: '04:30' },
    { id: 190062, name: '听妈妈的话', artist: '周杰伦', album: '依然范特西', duration: '04:18' },
    { id: 190057, name: '东风破', artist: '周杰伦', album: '叶惠美', duration: '05:00' },
    { id: 1330343056, name: '起风了', artist: '买辣椒也用券', album: '起风了', duration: '05:12' },
    { id: 449817956, name: '光年之外', artist: '邓紫棋', album: '光年之外', duration: '03:55' },
    { id: 1901373525, name: '孤勇者', artist: '陈奕迅', album: '孤勇者', duration: '04:16' },
    { id: 28190129, name: '平凡之路', artist: '朴树', album: '猎户星座', duration: '04:46' },
    { id: 68458, name: '富士山下', artist: '陈奕迅', album: 'What\'s Going On...?', duration: '04:21' },
    { id: 68462, name: '十年', artist: '陈奕迅', album: '黑白灰', duration: '03:25' },
    { id: 68460, name: '浮夸', artist: '陈奕迅', album: 'U87', duration: '04:33' },
    { id: 25883286, name: '泡沫', artist: '邓紫棋', album: 'Xposed', duration: '04:22' },
    { id: 1345752257, name: '像鱼', artist: '王贝贝', album: '像鱼', duration: '04:05' },
    { id: 190055, name: '双截棍', artist: '周杰伦', album: '范特西', duration: '03:23' },
    { id: 68456, name: '红玫瑰', artist: '陈奕迅', album: '认了吧', duration: '04:08' },
  ];

  // ===== 初始化 =====
  function init() {
    createPlayerDOM();
    bindEvents();
    loadPlaylist(hotSongs);
    audio.volume = state.volume;
    updateVolumeBar();
    console.log('音乐播放器初始化完成');
  }

  // ===== 创建DOM =====
  function createPlayerDOM() {
    const playerHTML = `
      <!-- 侧边歌词（独立面板） -->
      <div class="music-lyrics-side" id="music-lyrics-side">
        <div class="music-lyrics-side-header" id="music-lyrics-side-header">
          <span class="music-lyrics-side-title">
            <i class="fa fa-music"></i>
            <span class="song-name" id="music-lyrics-side-song">歌词</span>
          </span>
          <div class="music-lyrics-side-actions">
            <button class="music-lyrics-side-btn" id="music-lyrics-side-mode" title="切换到内嵌">
              <i class="fa fa-compress"></i>
            </button>
            <button class="music-lyrics-side-btn" id="music-lyrics-side-close" title="关闭">
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>
        <div class="music-lyrics-side-body" id="music-lyrics-side-body">
          <div class="music-lyrics-empty">
            <i class="fa fa-file-text-o"></i>
            <p>暂无歌词</p>
          </div>
        </div>
      </div>
      
      <div id="music-player" class="music-player">
        <div class="music-player-bg" id="music-bg"></div>
        
        <!-- 内嵌歌词（覆盖播放列表区域） -->
        <div class="music-lyrics-container" id="music-lyrics">
          <div class="music-lyrics-header">
            <span class="music-lyrics-title">歌词</span>
            <div class="music-lyrics-header-actions">
              <button class="music-lyrics-position" id="music-lyrics-mode" title="切换到侧边">
                <i class="fa fa-external-link"></i>
              </button>
              <button class="music-lyrics-close" id="music-lyrics-close">
                <i class="fa fa-times"></i>
              </button>
            </div>
          </div>
          <div class="music-lyrics-body" id="music-lyrics-body">
            <div class="music-lyrics-empty">
              <i class="fa fa-file-text-o"></i>
              <p>暂无歌词</p>
            </div>
          </div>
        </div>
        
        <div class="music-header" id="music-header">
          <div class="music-header-title">
            <i class="fa fa-music"></i>
            <span>音乐播放器</span>
            <span class="music-api-badge" id="music-api-badge">就绪</span>
          </div>
          <div class="music-header-actions">
            <button class="music-header-btn music-lyrics-btn" id="music-lyrics-btn" title="歌词">
              <i class="fa fa-file-text-o"></i>
            </button>
            <button class="music-header-btn" id="music-minimize-btn" title="最小化">
              <i class="fa fa-minus"></i>
            </button>
            <button class="music-header-btn" id="music-theme-btn" title="切换主题">
              <i class="fa fa-paint-brush"></i>
            </button>
            <button class="music-header-btn" id="music-close-btn" title="关闭">
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="music-body">
          <div class="music-left">
            <div class="music-cover" id="music-cover">
              <div class="music-cover-placeholder">
                <i class="fa fa-music"></i>
              </div>
            </div>
            <div class="music-info">
              <div class="music-title" id="music-title">未播放</div>
              <div class="music-artist" id="music-artist">选择一首歌曲开始播放</div>
            </div>
          </div>
          
          <div class="music-right">
            <div class="music-search">
              <div class="music-search-box">
                <i class="fa fa-search"></i>
                <input type="text" id="music-search-input" placeholder="搜索歌曲或歌手...">
                <button class="music-search-btn" id="music-search-btn" title="搜索">
                  <i class="fa fa-search"></i>
                </button>
                <button class="music-search-clear" id="music-search-clear" title="清除" style="opacity:0">
                  <i class="fa fa-times"></i>
                </button>
              </div>
            </div>
            
            <div class="music-list" id="music-list">
              <div class="music-list-header">
                <span>播放列表</span>
                <span id="music-list-count">0首歌曲</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="music-footer">
          <div class="music-progress">
            <span class="music-time" id="music-current-time">00:00</span>
            <div class="music-progress-bar" id="music-progress-bar">
              <div class="music-progress-fill" id="music-progress-fill" style="width: 0%"></div>
            </div>
            <span class="music-time" id="music-duration">00:00</span>
          </div>
          
          <div class="music-controls">
            <button class="music-btn" id="music-mode-btn" title="列表循环">
              <i class="fa fa-retweet"></i>
            </button>
            <button class="music-btn" id="music-prev-btn" title="上一首">
              <i class="fa fa-step-backward"></i>
            </button>
            <button class="music-btn music-btn-play" id="music-play-btn" title="播放">
              <i class="fa fa-play"></i>
            </button>
            <button class="music-btn" id="music-next-btn" title="下一首">
              <i class="fa fa-step-forward"></i>
            </button>
            <button class="music-btn" id="music-like-btn" title="收藏">
              <i class="fa fa-heart-o"></i>
            </button>
            
            <div class="music-volume">
              <button class="music-volume-btn" id="music-volume-btn" title="音量">
                <i class="fa fa-volume-up"></i>
              </button>
              <div class="music-volume-bar" id="music-volume-bar">
                <div class="music-volume-fill" id="music-volume-fill" style="width: 70%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', playerHTML);

    elements = {
      player: document.getElementById('music-player'),
      header: document.getElementById('music-header'),
      bg: document.getElementById('music-bg'),
      cover: document.getElementById('music-cover'),
      title: document.getElementById('music-title'),
      artist: document.getElementById('music-artist'),
      searchInput: document.getElementById('music-search-input'),
      searchBtn: document.getElementById('music-search-btn'),
      searchClear: document.getElementById('music-search-clear'),
      list: document.getElementById('music-list'),
      listCount: document.getElementById('music-list-count'),
      currentTime: document.getElementById('music-current-time'),
      duration: document.getElementById('music-duration'),
      progressBar: document.getElementById('music-progress-bar'),
      progressFill: document.getElementById('music-progress-fill'),
      playBtn: document.getElementById('music-play-btn'),
      prevBtn: document.getElementById('music-prev-btn'),
      nextBtn: document.getElementById('music-next-btn'),
      modeBtn: document.getElementById('music-mode-btn'),
      likeBtn: document.getElementById('music-like-btn'),
      volumeBtn: document.getElementById('music-volume-btn'),
      volumeBar: document.getElementById('music-volume-bar'),
      volumeFill: document.getElementById('music-volume-fill'),
      closeBtn: document.getElementById('music-close-btn'),
      minimizeBtn: document.getElementById('music-minimize-btn'),
      themeBtn: document.getElementById('music-theme-btn'),
      apiBadge: document.getElementById('music-api-badge'),
      lyricsBtn: document.getElementById('music-lyrics-btn'),
      // 内嵌歌词
      lyricsContainer: document.getElementById('music-lyrics'),
      lyricsClose: document.getElementById('music-lyrics-close'),
      lyricsBody: document.getElementById('music-lyrics-body'),
      lyricsMode: document.getElementById('music-lyrics-mode'),
      // 侧边歌词
      lyricsSide: document.getElementById('music-lyrics-side'),
      lyricsSideHeader: document.getElementById('music-lyrics-side-header'),
      lyricsSideClose: document.getElementById('music-lyrics-side-close'),
      lyricsSideBody: document.getElementById('music-lyrics-side-body'),
      lyricsSideMode: document.getElementById('music-lyrics-side-mode'),
      lyricsSideSong: document.getElementById('music-lyrics-side-song'),
    };
  }

  // ===== 绑定事件 =====
  function bindEvents() {
    elements.playBtn.addEventListener('click', togglePlay);
    elements.prevBtn.addEventListener('click', playPrev);
    elements.nextBtn.addEventListener('click', playNext);
    elements.modeBtn.addEventListener('click', toggleMode);
    elements.progressBar.addEventListener('click', seekTo);
    elements.volumeBar.addEventListener('click', setVolume);
    elements.volumeBtn.addEventListener('click', toggleMute);
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
    elements.searchInput.addEventListener('input', () => {
      elements.searchClear.style.opacity = elements.searchInput.value ? '1' : '0';
    });
    elements.searchClear.addEventListener('click', clearSearch);
    elements.closeBtn.addEventListener('click', hide);
    elements.minimizeBtn.addEventListener('click', hide);
    elements.themeBtn.addEventListener('click', cycleTheme);
    window.addEventListener('resize', syncInsideLyricsLayout);
    
    // 歌词按钮
    elements.lyricsBtn.addEventListener('click', toggleLyrics);
    elements.lyricsClose.addEventListener('click', closeLyrics);
    elements.lyricsSideClose.addEventListener('click', closeSideLyrics);
    elements.lyricsMode.addEventListener('click', () => switchLyricsMode('side'));
    elements.lyricsSideMode.addEventListener('click', () => switchLyricsMode('inside'));
    
    // 拖动功能
    initDrag();

    // 音频事件
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('play', () => updatePlayState(true));
    audio.addEventListener('pause', () => updatePlayState(false));
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('canplay', () => {
      state.isLoading = false;
      updateApiBadge('播放中');
    });
  }

  // ===== 拖动功能 =====
  function initDrag() {
    // 播放器拖动
    elements.header.addEventListener('mousedown', startDragPlayer);
    
    // 侧边歌词拖动
    elements.lyricsSideHeader.addEventListener('mousedown', startDragSide);
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // 触摸支持
    elements.header.addEventListener('touchstart', startDragPlayerTouch, { passive: true });
    elements.lyricsSideHeader.addEventListener('touchstart', startDragSideTouch, { passive: true });
    document.addEventListener('touchmove', dragTouch, { passive: false });
    document.addEventListener('touchend', endDrag);
  }

  function startDragPlayer(e) {
    if (e.target.closest('button')) return;
    state.isDragging = true;
    state.dragTarget = 'player';
    elements.player.classList.add('dragging');
    const rect = elements.player.getBoundingClientRect();
    state.dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    elements.player.style.left = rect.left + 'px';
    elements.player.style.top = rect.top + 'px';
    elements.player.style.right = 'auto';
    elements.player.style.bottom = 'auto';
  }

  function startDragPlayerTouch(e) {
    if (e.target.closest('button')) return;
    const touch = e.touches[0];
    state.isDragging = true;
    state.dragTarget = 'player';
    elements.player.classList.add('dragging');
    const rect = elements.player.getBoundingClientRect();
    state.dragOffset = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    elements.player.style.left = rect.left + 'px';
    elements.player.style.top = rect.top + 'px';
    elements.player.style.right = 'auto';
    elements.player.style.bottom = 'auto';
  }

  function startDragSide(e) {
    if (e.target.closest('button')) return;
    state.isDragging = true;
    state.dragTarget = 'side';
    const rect = elements.lyricsSide.getBoundingClientRect();
    state.dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    elements.lyricsSide.style.left = rect.left + 'px';
    elements.lyricsSide.style.top = rect.top + 'px';
    elements.lyricsSide.style.right = 'auto';
    elements.lyricsSide.style.transform = 'none';
  }

  function startDragSideTouch(e) {
    if (e.target.closest('button')) return;
    const touch = e.touches[0];
    state.isDragging = true;
    state.dragTarget = 'side';
    const rect = elements.lyricsSide.getBoundingClientRect();
    state.dragOffset = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    elements.lyricsSide.style.left = rect.left + 'px';
    elements.lyricsSide.style.top = rect.top + 'px';
    elements.lyricsSide.style.right = 'auto';
    elements.lyricsSide.style.transform = 'none';
  }

  function drag(e) {
    if (!state.isDragging) return;
    e.preventDefault();
    const x = e.clientX - state.dragOffset.x;
    const y = e.clientY - state.dragOffset.y;
    
    if (state.dragTarget === 'player') {
      const maxX = window.innerWidth - elements.player.offsetWidth;
      const maxY = window.innerHeight - elements.player.offsetHeight;
      elements.player.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
      elements.player.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    } else if (state.dragTarget === 'side') {
      const maxX = window.innerWidth - elements.lyricsSide.offsetWidth;
      const maxY = window.innerHeight - elements.lyricsSide.offsetHeight;
      elements.lyricsSide.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
      elements.lyricsSide.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    }
  }

  function dragTouch(e) {
    if (!state.isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const x = touch.clientX - state.dragOffset.x;
    const y = touch.clientY - state.dragOffset.y;
    
    if (state.dragTarget === 'player') {
      const maxX = window.innerWidth - elements.player.offsetWidth;
      const maxY = window.innerHeight - elements.player.offsetHeight;
      elements.player.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
      elements.player.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    } else if (state.dragTarget === 'side') {
      const maxX = window.innerWidth - elements.lyricsSide.offsetWidth;
      const maxY = window.innerHeight - elements.lyricsSide.offsetHeight;
      elements.lyricsSide.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
      elements.lyricsSide.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    }
  }

  function endDrag() {
    state.isDragging = false;
    state.dragTarget = null;
    elements.player.classList.remove('dragging');
  }

  // ===== 歌词功能 =====
  function toggleLyrics() {
    state.showLyrics = !state.showLyrics;
    elements.lyricsBtn.classList.toggle('active', state.showLyrics);
    
    if (state.showLyrics) {
      showLyrics();
    } else {
      closeLyrics();
    }
  }

  function showLyrics() {
    state.showLyrics = true;
    elements.lyricsBtn.classList.add('active');
    
    if (state.lyricsMode === 'inside') {
      syncInsideLyricsLayout();
      elements.lyricsContainer.classList.add('show');
      elements.lyricsSide.classList.remove('show');
    } else {
      elements.lyricsSide.classList.add('show');
      elements.lyricsContainer.classList.remove('show');
      updateSideSongName();
    }
    
    if (state.currentSong) {
      fetchLyrics(state.currentSong.id);
    }
  }

  function closeLyrics() {
    state.showLyrics = false;
    elements.lyricsContainer.classList.remove('show');
    elements.lyricsSide.classList.remove('show');
    elements.lyricsBtn.classList.remove('active');
  }

  function switchLyricsMode(mode) {
    state.lyricsMode = mode;
    
    if (state.showLyrics) {
      if (mode === 'inside') {
        syncInsideLyricsLayout();
        elements.lyricsContainer.classList.add('show');
        elements.lyricsSide.classList.remove('show');
      } else {
        elements.lyricsSide.classList.add('show');
        elements.lyricsContainer.classList.remove('show');
        updateSideSongName();
      }
    }
    
    showToast(mode === 'inside' ? '内嵌歌词' : '侧边歌词');
  }

  function updateSideSongName() {
    if (state.currentSong) {
      elements.lyricsSideSong.textContent = state.currentSong.name;
    } else {
      elements.lyricsSideSong.textContent = '歌词';
    }
  }

  // ===== 获取歌词 =====
  async function fetchLyrics(songId) {
    for (let i = 0; i < API_BASES.length; i++) {
      try {
        const api = getApi();
        const response = await fetch(`${api}/lyric?id=${songId}`);
        
        if (!response.ok) {
          switchApi();
          continue;
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.lrc && data.lrc.lyric) {
          const lyrics = parseLyrics(data.lrc.lyric);
          state.lyrics = lyrics;
          renderLyrics(lyrics);
          return;
        }
        
        switchApi();
      } catch (error) {
        console.log('获取歌词失败:', error);
        switchApi();
      }
    }
    
    state.lyrics = [];
    renderLyrics([]);
  }

  // ===== 解析LRC歌词 =====
  function parseLyrics(lrcText) {
    const lines = lrcText.split('\n');
    const lyrics = [];
    
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
    
    lines.forEach(line => {
      const matches = [...line.matchAll(timeRegex)];
      if (matches.length > 0) {
        const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
        if (text) {
          matches.forEach(match => {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const ms = parseInt(match[3]);
            const time = minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100);
            lyrics.push({ time, text });
          });
        }
      }
    });
    
    return lyrics.sort((a, b) => a.time - b.time);
  }

  // ===== 渲染歌词 =====
  function renderLyrics(lyrics) {
    const emptyHTML = `
      <div class="music-lyrics-empty">
        <i class="fa fa-file-text-o"></i>
        <p>暂无歌词</p>
      </div>
    `;
    
    if (lyrics.length === 0) {
      elements.lyricsBody.innerHTML = emptyHTML;
      elements.lyricsSideBody.innerHTML = emptyHTML;
      return;
    }
    
    const lyricsHTML = lyrics.map((line, index) => 
      `<div class="music-lyric-line" data-index="${index}">${line.text}</div>`
    ).join('');
    
    elements.lyricsBody.innerHTML = lyricsHTML;
    elements.lyricsSideBody.innerHTML = lyricsHTML;
  }

  // ===== 更新歌词高亮 =====
  function updateLyricsHighlight(currentTime) {
    if (state.lyrics.length === 0) return;
    
    let newIndex = -1;
    for (let i = state.lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= state.lyrics[i].time) {
        newIndex = i;
        break;
      }
    }
    
    if (newIndex !== state.currentLyricIndex) {
      state.currentLyricIndex = newIndex;
      
      // 更新内嵌歌词
      const lines = elements.lyricsBody.querySelectorAll('.music-lyric-line');
      lines.forEach((line, index) => {
        line.classList.remove('active', 'past');
        if (index === newIndex) {
          line.classList.add('active');
          line.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (index < newIndex) {
          line.classList.add('past');
        }
      });
      
      // 更新侧边歌词
      const sideLines = elements.lyricsSideBody.querySelectorAll('.music-lyric-line');
      sideLines.forEach((line, index) => {
        line.classList.remove('active', 'past');
        if (index === newIndex) {
          line.classList.add('active');
          line.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (index < newIndex) {
          line.classList.add('past');
        }
      });
    }
  }

  // ===== API状态 =====
  function updateApiBadge(text) {
    if (elements.apiBadge) {
      elements.apiBadge.textContent = text;
    }
  }

  // ===== 加载播放列表 =====
  function loadPlaylist(songs) {
    state.playlist = [...songs];
    renderPlaylist();
    elements.listCount.textContent = `${state.playlist.length}首歌曲`;
  }

  // ===== 渲染播放列表 =====
  function renderPlaylist() {
    const listHeader = elements.list.querySelector('.music-list-header');
    elements.list.innerHTML = '';
    elements.list.appendChild(listHeader);

    if (state.isLoading) {
      elements.list.innerHTML += `
        <div class="music-loading">
          <i class="fa fa-spinner fa-spin"></i>
          <span>加载中...</span>
        </div>
      `;
      return;
    }

    if (state.playlist.length === 0) {
      elements.list.innerHTML += `
        <div class="music-empty">
          <i class="fa fa-music"></i>
          <p>暂无歌曲</p>
        </div>
      `;
      return;
    }

    state.playlist.forEach((song, index) => {
      const isActive = state.currentSong && state.currentSong.id === song.id;
      const item = document.createElement('div');
      item.className = `music-item${isActive ? ' active' : ''}`;
      item.innerHTML = `
        <span class="music-item-index">${isActive && state.isPlaying ? '<i class="fa fa-volume-up"></i>' : (index + 1)}</span>
        <div class="music-item-info">
          <div class="music-item-name">${song.name}</div>
          <div class="music-item-artist">${song.artist || '未知歌手'}</div>
        </div>
        <span class="music-item-duration">${song.duration || '--:--'}</span>
      `;
      item.addEventListener('click', () => playSong(index));
      elements.list.appendChild(item);
    });
  }

  // ===== 搜索音乐 =====
  async function handleSearch() {
    const keyword = elements.searchInput.value.trim();
    if (!keyword) {
      showToast('请输入搜索关键词');
      return;
    }

    state.isLoading = true;
    updateApiBadge('搜索中...');
    renderPlaylist();

    for (let i = 0; i < API_BASES.length; i++) {
      try {
        const api = getApi();
        const response = await fetch(`${api}/search?keywords=${encodeURIComponent(keyword)}&limit=30`);
        
        if (!response.ok) {
          switchApi();
          continue;
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.result && data.result.songs) {
          const songs = data.result.songs.map(song => ({
            id: song.id,
            name: song.name,
            artist: song.artists?.map(a => a.name).join('/') || '未知歌手',
            album: song.album?.name || '',
            duration: formatDuration(song.duration),
            pic: song.album?.artist?.img1v1Url || song.album?.picUrl || null,
          }));
          
          state.isLoading = false;
          state.playlist = songs;
          renderPlaylist();
          elements.listCount.textContent = `${songs.length}首歌曲`;
          updateApiBadge('网易云');
          showToast(`找到 ${songs.length} 首歌曲`);
          return;
        }
        
        switchApi();
      } catch (error) {
        console.log('搜索失败:', error);
        switchApi();
      }
    }

    state.isLoading = false;
    updateApiBadge('搜索失败');
    showToast('搜索失败，请稍后重试');
    loadPlaylist(hotSongs);
  }

  // ===== 格式化时长 =====
  function formatDuration(ms) {
    if (!ms) return '--:--';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // ===== 播放歌曲 =====
  async function playSong(index) {
    if (index < 0 || index >= state.playlist.length) return;

    const song = state.playlist[index];
    state.currentSong = song;
    state.currentIndex = index;
    state.lyrics = [];
    state.currentLyricIndex = -1;

    // 更新UI
    elements.title.textContent = song.name;
    elements.artist.textContent = `${song.artist}${song.album ? ' · ' + song.album : ''}`;
    updateSideSongName();
    
    // 封面占位符
    elements.cover.innerHTML = `<div class="music-cover-placeholder"><i class="fa fa-music"></i></div>`;

    renderPlaylist();

    // 获取歌曲详情（封面）
    fetchSongDetail(song.id);
    
    // 获取播放链接
    await fetchAndPlay(song.id);
    
    // 获取歌词
    if (state.showLyrics) {
      fetchLyrics(song.id);
    }
  }

  // ===== 获取歌曲详情 =====
  async function fetchSongDetail(songId) {
    for (let i = 0; i < API_BASES.length; i++) {
      try {
        const api = getApi();
        const response = await fetch(`${api}/song/detail?ids=${songId}`);
        
        if (!response.ok) {
          switchApi();
          continue;
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.songs && data.songs.length > 0) {
          const songDetail = data.songs[0];
          const picUrl = songDetail.al?.picUrl;
          
          if (picUrl) {
            elements.cover.innerHTML = `<img src="${picUrl}?param=300y300" alt="封面" onerror="this.parentElement.innerHTML='<div class=\\'music-cover-placeholder\\'><i class=\\'fa fa-music\\'></i></div>'">`;
            if (state.currentSong) {
              state.currentSong.pic = picUrl;
            }
          }
          return;
        }
        
        switchApi();
      } catch (error) {
        console.log('获取歌曲详情失败:', error);
        switchApi();
      }
    }
  }

  // ===== 获取播放链接并播放 =====
  async function fetchAndPlay(songId) {
    state.isLoading = true;
    updateApiBadge('获取链接...');

    for (let i = 0; i < API_BASES.length; i++) {
      try {
        const api = getApi();
        const response = await fetch(`${api}/song/url?id=${songId}`);
        
        if (!response.ok) {
          switchApi();
          continue;
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.length > 0) {
          const url = data.data[0].url;
          
          if (url) {
            state.isLoading = false;
            playAudio(url);
            return;
          } else {
            state.isLoading = false;
            updateApiBadge('无版权/VIP');
            showToast('该歌曲需要VIP或暂无版权');
            return;
          }
        }
        
        switchApi();
      } catch (error) {
        console.log('获取播放链接失败:', error);
        switchApi();
      }
    }

    state.isLoading = false;
    updateApiBadge('获取失败');
    showToast('获取播放链接失败');
  }

  // ===== 播放音频 =====
  function playAudio(url) {
    if (!url) return;
    
    audio.src = url;
    audio.play().then(() => {
      console.log('开始播放');
    }).catch(err => {
      console.error('播放失败:', err);
      updateApiBadge('播放失败');
      showToast('播放失败');
    });
  }

  // ===== 播放/暂停 =====
  function togglePlay() {
    if (!state.currentSong) {
      if (state.playlist.length > 0) playSong(0);
      return;
    }

    if (state.isPlaying) {
      audio.pause();
      updateApiBadge('已暂停');
    } else {
      if (audio.src) {
        audio.play().catch(e => console.error('播放失败:', e));
      } else {
        playSong(state.currentIndex);
      }
    }
  }

  function updatePlayState(playing) {
    state.isPlaying = playing;
    elements.playBtn.innerHTML = playing ? '<i class="fa fa-pause"></i>' : '<i class="fa fa-play"></i>';
    elements.playBtn.title = playing ? '暂停' : '播放';
    renderPlaylist();
  }

  // ===== 上一首/下一首 =====
  function playPrev() {
    if (state.playlist.length === 0) return;
    let newIndex = state.currentIndex - 1;
    if (newIndex < 0) newIndex = state.playlist.length - 1;
    playSong(newIndex);
  }

  function playNext() {
    if (state.playlist.length === 0) return;
    let newIndex;
    if (state.playMode === 'random') {
      newIndex = Math.floor(Math.random() * state.playlist.length);
    } else {
      newIndex = state.currentIndex + 1;
      if (newIndex >= state.playlist.length) newIndex = 0;
    }
    playSong(newIndex);
  }

  // ===== 播放模式 =====
  function toggleMode() {
    const modes = ['list', 'random', 'single'];
    const icons = ['retweet', 'random', 'repeat'];
    const titles = ['列表循环', '随机播放', '单曲循环'];
    
    const currentIndex = modes.indexOf(state.playMode);
    const newIndex = (currentIndex + 1) % modes.length;
    
    state.playMode = modes[newIndex];
    elements.modeBtn.innerHTML = `<i class="fa fa-${icons[newIndex]}"></i>`;
    elements.modeBtn.title = titles[newIndex];
    audio.loop = state.playMode === 'single';
    
    showToast(titles[newIndex]);
  }

  // ===== 进度控制 =====
  function updateProgress() {
    const current = audio.currentTime || 0;
    const duration = audio.duration || 0;
    const percent = duration ? (current / duration) * 100 : 0;
    
    elements.progressFill.style.width = `${percent}%`;
    elements.currentTime.textContent = formatTime(current);
    elements.duration.textContent = formatTime(duration);
    
    if (state.showLyrics) {
      updateLyricsHighlight(current);
    }
  }

  function seekTo(e) {
    const rect = elements.progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audio.duration) {
      audio.currentTime = percent * audio.duration;
    }
  }

  // ===== 音量控制 =====
  function setVolume(e) {
    const rect = elements.volumeBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    state.volume = percent;
    audio.volume = percent;
    state.isMuted = false;
    audio.muted = false;
    updateVolumeBar();
    updateVolumeIcon();
  }

  function toggleMute() {
    state.isMuted = !state.isMuted;
    audio.muted = state.isMuted;
    updateVolumeIcon();
  }

  function updateVolumeBar() {
    elements.volumeFill.style.width = `${state.volume * 100}%`;
  }

  function updateVolumeIcon() {
    let icon = 'volume-up';
    if (state.isMuted || state.volume === 0) icon = 'volume-off';
    else if (state.volume < 0.5) icon = 'volume-down';
    elements.volumeBtn.innerHTML = `<i class="fa fa-${icon}"></i>`;
  }

  // ===== 清除搜索 =====
  function clearSearch() {
    elements.searchInput.value = '';
    elements.searchClear.style.opacity = '0';
    loadPlaylist(hotSongs);
    updateApiBadge('就绪');
    elements.searchInput.focus();
  }

  // ===== Audio事件 =====
  function handleLoaded() {
    elements.duration.textContent = formatTime(audio.duration);
  }

  function handleEnded() {
    if (state.playMode === 'single') {
      audio.currentTime = 0;
      audio.play();
    } else {
      playNext();
    }
  }

  function handleAudioError(e) {
    console.error('音频错误:', e);
    updateApiBadge('播放错误');
  }

  // ===== 主题切换 =====
  const themes = [
    { name: '默认', bg: '' },
    { name: '星空', bg: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800' },
    { name: '海洋', bg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' },
    { name: '森林', bg: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800' },
    { name: '城市', bg: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800' },
  ];
  let currentThemeIndex = 0;

  function cycleTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const theme = themes[currentThemeIndex];
    
    if (theme.bg) {
      elements.bg.style.backgroundImage = `url(${theme.bg})`;
      elements.bg.style.opacity = '0.25';
    } else {
      elements.bg.style.backgroundImage = '';
      elements.bg.style.opacity = '0';
    }
    
    showToast('主题: ' + theme.name);
  }

  // ===== 显示/隐藏 =====
  function syncInsideLyricsLayout() {
    if (!elements.player || !elements.list || !elements.lyricsContainer) return;

    const playerRect = elements.player.getBoundingClientRect();
    const listRect = elements.list.getBoundingClientRect();

    if (!listRect.width || !listRect.height) return;

    elements.lyricsContainer.style.top = `${Math.max(0, listRect.top - playerRect.top)}px`;
    elements.lyricsContainer.style.left = `${Math.max(0, listRect.left - playerRect.left)}px`;
    elements.lyricsContainer.style.right = `${Math.max(0, playerRect.right - listRect.right)}px`;
    elements.lyricsContainer.style.bottom = `${Math.max(0, playerRect.bottom - listRect.bottom)}px`;
  }

  function show() {
    elements.player.classList.add('show');
    requestAnimationFrame(syncInsideLyricsLayout);
  }

  function hide() {
    elements.player.classList.remove('show');
    // 只关闭内嵌歌词，保留侧边歌词
    if (state.lyricsMode === 'inside') {
      elements.lyricsContainer.classList.remove('show');
    }
    const musicBtn = document.getElementById('music-btn');
    if (musicBtn) musicBtn.classList.remove('active');
  }

  function toggle() {
    const isVisible = elements.player.classList.contains('show');
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }

  // 仅关闭歌词（不影响播放器）
  function closeLyrics() {
    state.showLyrics = false;
    elements.lyricsContainer.classList.remove('show');
    elements.lyricsSide.classList.remove('show');
    elements.lyricsBtn.classList.remove('active');
  }

  // 仅关闭侧边歌词
  function closeSideLyrics() {
    elements.lyricsSide.classList.remove('show');
    if (state.lyricsMode === 'side') {
      state.showLyrics = false;
      elements.lyricsBtn.classList.remove('active');
    }
  }

  // ===== 提示 =====
  function showToast(msg) {
    const toast = document.getElementById('copy-toast');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 1500);
    }
  }

  // ===== 工具函数 =====
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // ===== 公共API =====
  return {
    init,
    show,
    hide,
    toggle,
    play: togglePlay,
    next: playNext,
    prev: playPrev,
    setPlaylist: loadPlaylist,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  window.MusicPlayer.init();
});
