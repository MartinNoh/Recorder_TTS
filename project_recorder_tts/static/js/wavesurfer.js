// microphone : 실시간 waveform 그림

var wavesurfer_realtime = WaveSurfer.create({
  container     : '#waveform_realtime',
  waveColor     : '03a9f4',
  interact      : false,
  cursorWidth   : 0,
  plugins: [
    WaveSurfer.microphone.create()
  ]
});

wavesurfer_realtime.microphone.on('deviceReady', function(stream) {
    console.log('Device ready!', stream);
});
wavesurfer_realtime.microphone.on('deviceError', function(code) {
    console.warn('Device error: ' + code);
});

// start the microphone
wavesurfer_realtime.microphone.start();






// wav로 저장된 waveform 그림
// How to generate Audio Waves (Audio wavsfr) from an Audio File in JavaScript using Wavesurfer.js
// https://ourcodeworld.com/articles/read/519/how-to-generate-audio-waves-audio-spectrum-from-an-audio-file-in-javascript-using-wavesurfer-js
// http://wavesurfer-js.org/docs/

// Create an instance of wave surfer with its configuration
var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#03a9f4',
    progressColor: "blue",
    plugins: [

        // 커서표시 플러그인
        WaveSurfer.cursor.create({
            showTime: true,
            opacity: 1,
            customShowTimeStyle: {
                'background-color': '#000',
                color: '#fff',
                padding: '2px',
                'font-size': '10px'
            }
        }),

        // playhead 플러그인
        WaveSurfer.playhead.create({
            returnOnPause: true,
            moveOnSeek: true,
            draw: true
        }),

        // timeline 플러그인
        WaveSurfer.timeline.create({
            container: "#timeline"
        }),

        // region 플러그인
        WaveSurfer.regions.create({
            dragSelection: {
                slop: 5
            }
        })
    ]
});





// 음원 로딩 - Load the audio file from your domain !
// 테스트음원 : wavsfr.load('http://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3');
// 다음 이미지 경로는 사용할 수 없음 : wavsfr.load('C:/Users/ehdru/PycharmProjects/backup_tts/project_backup_tts/media/output_2.wav');
// 좋은 예시 : wavsfr.load('../media/output_2.wav');

var filepath = document.getElementById("hidden_filepath").value;
if (filepath.length > 0){
    // alert(filepath)
    console.log(filepath);
    wavesurfer.load(filepath);
}
else {
    wavesurfer.load('http://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3');
}







// Zoom slider 값 waveform 반영
let slider = document.querySelector('[data-action="zoom"]');

slider.value = wavesurfer.params.minPxPerSec;
slider.min = wavesurfer.params.minPxPerSec;
// Allow extreme zoom-in, to see individual samples
slider.max = 1000;

slider.addEventListener('input', function() {
    wavesurfer.zoom(Number(this.value));
});

// set initial zoom to match slider value
wavesurfer.zoom(slider.value);







// Play 버튼 클릭처리
let btn = document.querySelector('[data-action="play"]');

btn.addEventListener('click', wavesurfer.playPause.bind(wavesurfer));


/* Toggle play/pause btns. */
let playBtn = document.querySelector('#play');
let pauseBtn = document.querySelector('#pause');
wavesurfer.on('play', function() {
    playBtn.style.display = 'none';
    pauseBtn.style.display = '';
});
wavesurfer.on('pause', function() {
    playBtn.style.display = '';
    pauseBtn.style.display = 'none';
});









// 콘솔 Error 표시
wavesurfer.on('error', function(e) {
    console.warn(e);
});









/* Regions */
wavesurfer.on('ready', function() {
    wavesurfer.enableDragSelection({
        color: randomColor(0.1)
    });
});
wavesurfer.on('region-click', function(region, e) {
    e.stopPropagation();
    // Play on click, loop on shift click
    e.shiftKey ? region.playLoop() : region.play();
});
wavesurfer.on('region-click', editForm, );
wavesurfer.on('region-play', function(region) {
    region.once('out', function() {
        wavesurfer.play(region.start);
        wavesurfer.pause();
    });
});


// Region 삭제버튼
document.querySelector(
    '[data-action="delete-region"]'
).addEventListener('click', function() {
    let form = document.forms.edit;
    let regionId = form.dataset.region;
    if (regionId) {
        wavesurfer.regions.list[regionId].remove();
        form.reset();
    }
});








// 반응형 모드
// If you want a responsive mode (so when the user resizes the window)
// the wavsfr will be still playable
window.addEventListener("resize", function(){
    // Get the current progress according to the cursor position
    var currentProgress = wavesurfer.getCurrentTime() / wavesurfer.getDuration();

    // Reset graph
    wavesurfer.empty();
    wavesurfer.drawBuffer();
    // Set original position
    wavesurfer.seekTo(currentProgress);

    // Enable/Disable respectively btns
}, false);








/**
 * Random RGBA color.
 */
function randomColor(alpha) {
    return (
        'rgba(' +
        [
            ~~(Math.random() * 255),
            ~~(Math.random() * 255),
            ~~(Math.random() * 255),
            alpha || 1
        ] +
        ')'
    );
}







/**
 * Edit annotation for a region.
 */
function editForm(region) {
    let form = document.forms.edit;
    form.style.opacity = 1;
    (form.elements.start.value = region.start),
    (form.elements.end.value = region.end);
    form.onsubmit = function(e) {
        e.preventDefault();
        region.update({
            start: form.elements.start.value,
            end: form.elements.end.value,
        });
        form.style.opacity = 0;
    };
    form.onreset = function() {
        form.style.opacity = 0;
        form.dataset.region = null;
    };
    form.dataset.region = region.id;

    document.getElementById("hidden_start").value = region.start;
    document.getElementById("hidden_end").value = region.end;
}




function valueToViews(){
    var start_sec = document.getElementById("hidden_start").value;
    var end_sec = document.getElementById("hidden_end").value;
    var wav_filepath = document.getElementById("hidden_filepath").value;

    $.ajax({
       type: "GET",
        url: "{% url 'recording' status='now' %}",
        data: {
           "start_sec": start_sec,
            "end_sec": end_sec,
            "wav_filepath": wav_filepath,
        },
        dataType: "json",
        success: function (data){
           alert("성공적으로 wav파일이 덮어쓰여졌습니다.");
        },
        failure: function (){
           alert("선택 영역 저장 실패");
        }
    });
}
