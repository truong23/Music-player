const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const cdSoundWave = $('.cd-soundwave');
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist')
const time_start = $('.controls_time--left');
const time_count = $('.controls_time--right');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom : false,
    isRepeat: false,
    arrOldIndexes: [],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
          name: "Bad Liar",
          singer: "Imagine Dragons",
          path: "./music/Bad_liar.mp3",
          image: "./img/img1.png"
        },
        {
            name: "Bất Nhiễm",
            singer: "Mao Bất Dịch",
            path: "./music/Bat_nhiem.mp3",
            image: "./img/img2.png"
        },
        {
            name: "Con Đường Bình Phàm",
            singer: "Hoa Thần Vũ",
            path: "./music/Con_duong_binh_pham.mp3",
            image: "./img/img3.png"
        },
        {
            name: "Dancing With Your Ghost",
            singer: "Sasha Sloan",
            path: "./music/Dancing_with_your_ghost.mp3",
            image: "./img/img4.png"
        },
        {
            name: "Dòng Thác Thời Gian",
            singer: "Trịnh Hưởng",
            path: "./music/Dong_thac_thoi_gian.mp3",
            image: "./img/img5.png"
        },
        {
            name: "Havana",
            singer: "Camila Cabello,Young Thug",
            path: "./music/Havana.mp3",
            image: "./img/img6.png"
        },
        {
            name: "Let Me Down Slowly",
            singer: "Alec Benjamin",
            path: "./music/Let_me_down_slowly.mp3",
            image: "./img/img7.png"
        },
        {
            name: "Monster",
            singer: "Imagine Dragons",
            path: "./music/Monster.mp3",
            image: "./img/img1.png"
        },
        {
            name: "Senõrita",
            singer: "Shawn Mendes, Camila Cabello",
            path: "./music/Senõrita.mp3",
            image: "./img/img8.png"
        },
        {
            name: "Tay Trái Chỉ Trăng",
            singer: "Tát Đỉnh Đỉnh",
            path: "./music/Tay_trai_chi_trang.mp3",
            image: "./img/img9.png"
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map((song ,index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="equalizer-container">
                    <ol class="equalizer-column">
                        <li class="colour-bar"></li>
                    </ol>
                    <ol class="equalizer-column">
                        <li class="colour-bar"></li>
                    </ol>
                    <ol class="equalizer-column">
                        <li class="colour-bar"></li>
                    </ol>
                    <ol class="equalizer-column">
                        <li class="colour-bar"></li>
                    </ol>
                    <ol class="equalizer-column">
                        <li class="colour-bar"></li>
                    </ol>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>                 
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this,'currentSong', {
            get :function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function(){
        const _this = this
        const cdWidth = cd.offsetWidth
        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ],{
           duration: 10000,// 10 seconds
           iterations: Infinity 
        })
        cdThumbAnimate.pause()
        // Xử lý phóng to thu nhỏ cd
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth >0 ? newCdWidth  + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
            cdSoundWave.style.opacity = newCdWidth / cdWidth
        },

        // Xử lý khi click play 
        playBtn.onclick = function(){
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi song được play 
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdSoundWave.classList.add('active');
            cdThumbAnimate.play()
        }

        // Khi song bị pause
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdSoundWave.classList.remove('active');
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đối
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xử lý khi tua song
        progress.oninput = function(e){
            audio.pause()
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
            progress.onchange = function(){
              audio.play()
            }
        }

        // Khi next song
        nextBtn.onclick = function(){
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function(){
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
        }

        // Xử lý bật / tắt random song
        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom)
        }

        // Xử lý lặp lại một song
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }

        // Xử lý next song ki audio ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            } else(
                nextBtn.click()
            )
        }
        
        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {               
                // Xử lý khi click vào song
                if (songNode) {
                  _this.currentIndex = Number(songNode.dataset.index)
                  _this.loadCurrentSong()
                  _this.render()
                  audio.play()  
                }
                // Xử lý khi click vào song option
                // if (e.target.closest('.option')) {
                // }
            }
        }
        audio.ontimeupdate = function () {
            //Hiển thị thời gian trên thanh progress
            if (audio.duration) {
              const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
              progress.value = progressPercent;
              progress.style.background = 'linear-gradient(to right, #00cfff 0%, #00cfff ' + progressPercent + '%, #d3d3d3 ' + progressPercent + '%, #d3d3d3 100%)'; //progress bar filled from 0 to current time
              
              // Đếm thời gian của thời gian hiện tại
              var e = Math.floor(audio.currentTime);
              var d = e % 60; // Số giây
              var b = Math.floor(e / 60); // Số phút
              if (d < 10) {
                var c = 0;
              } else {
                c = "";
              }
              time_start.textContent = '0' + b + ":" + c + d;
      
              // Đếm thời gian của thời lượng âm thanh
              var ee = Math.floor(audio.duration);
              var dd = ee % 60; //số giây
              var bb = Math.floor(ee / 60); //số phút
              if (dd < 10) {
                var cc = 0;
              } else {
                cc = "";
              }
             
              time_count.textContent = '0' + bb + ":" + cc + dd;
            }
      
            if(!audio.duration) {
              time_start.textContent = '-' + ":" + "-";
              time_count.textContent = '-' + ":" + "-";
            }
          }   
    },
    scrollToActiveSong :function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                bahavior: 'smooth',
                block: 'end'
            })
        },300)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function(){
        this.currentIndex++
        if (this.currentIndex >= this.songs.length ){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--
        if (this.currentIndex < 0 ){
            this.currentIndex = this.songs.length - 1 
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
    
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function(){
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe và sử lý các sự kiện (DOM event)
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render Playlist
        this.render()
        
        // Hiển thị trạng thái bạn đầu của button repeat và random
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)

    }
}

app.start()