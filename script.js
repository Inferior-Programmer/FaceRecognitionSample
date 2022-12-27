import {getNumberOfFaces,writeUserData,getUserData,writeNumberOfFaces} from './firebase_connector.js'
import { getCookie } from './userUtilities.js';
feather.replace();


Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
  faceapi.loadFaceLandmarkModel('/models'),
  faceapi.loadFaceRecognitionModel('/models')
])

const controls = document.querySelector('.controls');
const cameraOptions = document.querySelector('.video-options>select');
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
const screenshotImage = document.querySelector('img');
const buttons = [...controls.querySelectorAll('button')];
let streamStarted = false;

const [play, pause, screenshot] = buttons;


const getCameraSelection = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  const options = videoDevices.map(videoDevice => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
  });
  cameraOptions.innerHTML = options.join('');
};

play.onclick = () => {
  if (streamStarted) {
    video.play();
    play.classList.add('d-none');
    pause.classList.remove('d-none');
    return;
  }
  if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
    startStream();
  }
};

const startStream = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  handleStream(stream);
};

const handleStream = (stream) => {
  video.srcObject = stream;
  play.classList.add('d-none');
  pause.classList.remove('d-none');
  screenshot.classList.remove('d-none');
  streamStarted = true;
};

async function loadTableImmediately(){
  let innerTableCode = ""; 
  var allDates = await getAllNumberOfFaces(getCookie("username"))
  innerTableCode += "<tr><th>Date</th><th style='width:300px; display: block;'>Number Of People</th></tr>"
  var keyss = Object.keys(allDates)
  for(let k = 0; k<keyss.length; k++){
    innerTableCode += "<tr><th>" + keyss[k] + "</th><th>" + allDates[keyss[k]].numPeople + "</th></tr>"
  }
  document.getElementById("table-holder").style.width = '25px';
  document.getElementById("table-holder").style.border = '1px solid black';
  document.getElementById("table-holder").innerHTML = innerTableCode;
}


var storer = []
let currDate = new Date().toJSON().slice(0, 10);
var lastNumberOfDetections = 0;
var oldFaces = 0;

var changed = false; 
video.addEventListener('play',  async () => {
  oldFaces = await getNumberOfFaces(currDate,getCookie("username"));
  if((typeof oldFaces) === 'undefined'){
    writeNumberOfFaces(currDate, getCookie("username"), 0);
    oldFaces = 0
  }
  else{
    oldFaces = parseInt(oldFaces.numPeople,10)
  }
  setInterval(async () => {
    let newDate = new Date().toJSON().slice(0, 10);
    if(newDate !== currDate){
      
      writeNumberOfFaces(newDate,getCookie("username"), 0);
      currDate = newDate;
      oldFaces = 0;
    }
    const videoEl = document.getElementById('video')
    const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptors()
    var newFaces = 0;
    if(detections.length > lastNumberOfDetections){
      newFaces = detections.length - lastNumberOfDetections;
    }
    lastNumberOfDetections = detections.length;
    const canvas = document.getElementById('canvas')
    canvas.width = video.offsetWidth; 
    canvas.height =  video.offsetHeight;
    const displaySize = { width: video.offsetWidth, height: video.offsetHeight }
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    console.log((oldFaces + newFaces))
    document.getElementById("updateText").innerText = "Number of people entered: " + (oldFaces + newFaces).toString()
    let innerTableCode = ""; 
    var allDates = await getAllNumberOfFaces(getCookie("username"))
    innerTableCode += "<tr><th>Date</th><th style='width:300px; display: block;'>Number Of People</th></tr>"
    var keyss = Object.keys(allDates)
    for(let k = 0; k<keyss.length; k++){
      innerTableCode += "<tr><th>" + keyss[k] + "</th><th>" + allDates[keyss[k]].numPeople + "</th></tr>"
    }
    document.getElementById("table-holder").style.width = '25px';
    document.getElementById("table-holder").style.border = '1px solid black';
    document.getElementById("table-holder").innerHTML = innerTableCode;
    if(newFaces > 0){
      oldFaces += newFaces;
      writeNumberOfFaces(currDate,getCookie("username") ,oldFaces)
    }   
  }, 50)
})

getCameraSelection();

loadTableImmediately();

document.getElementById("welcomes").innerText = "Welcome " + getCookie("username");
