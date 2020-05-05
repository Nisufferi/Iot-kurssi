let five = require('johnny-five')
let forwardTimes = []

function updateTimeStats(timeInMs) {
  forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
  const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
  $('#time').val(`${Math.round(avgTimeInMs)} ms`)
  $('#fps').val(`${faceapi.round(1000 / avgTimeInMs)}`)
}

async function onPlay() {
  const videoEl = $('#inputVideo').get(0)
  videoEl.crossOrigin = 'anonymous';

  const playPromise = videoEl.play();
  if (playPromise !== null) {
    playPromise.catch(() => { videoEl.play(); })
  }

  if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
    return setTimeout(() => onPlay())


  const options = getFaceDetectorOptions()

  const ts = Date.now()

  const result = await faceapi.detectSingleFace(videoEl, options)

  updateTimeStats(Date.now() - ts)

  if (result) {
    const canvas = $('#overlay').get(0)
    const dims = faceapi.matchDimensions(canvas, videoEl, true)
    faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims))

    playTune();
  }
  setTimeout(() => onPlay())
}

let btn = document.querySelector('#btn');
btn.addEventListener('click', playTune)

function playTune() {
  five = require("johnny-five");
  var board = new five.Board();

  board.on("ready", function () {

    // Create a standard `piezo` instance on pin 3
    var piezo = new five.Piezo(3);

    // Plays a song
    piezo.play({
      // song is composed by an array of pairs of notes and beats
      // The first argument is the note (null means "no note")
      // The second argument is the length of time (beat) of the note (or non-note)
      song: [
        ["C4", 1 / 4],
        ["D4", 1 / 4],
        ["F4", 1 / 4],
        ["D4", 1 / 4],
        ["A4", 1 / 4],
        [null, 1 / 4],
        ["A4", 1],
        ["G4", 1],
        [null, 1 / 2],
        ["C4", 1 / 4],
        ["D4", 1 / 4],
        ["F4", 1 / 4],
        ["D4", 1 / 4],
        ["G4", 1 / 4],
        [null, 1 / 4],
        ["G4", 1],
        ["F4", 1],
        [null, 1 / 2]
      ],
      tempo: 100
    });
  });
}

async function run() {
  // load face detection model
  await changeFaceDetector(TINY_FACE_DETECTOR)
  changeInputSize(128)

  // try to access users webcam and stream the images
  // to the video element
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
  const videoEl = $('#inputVideo').get(0)
  videoEl.srcObject = stream
}

function updateResults() { }

$(document).ready(function () {

  initFaceDetectionControls()
  run()
})