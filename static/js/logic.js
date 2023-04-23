//////main arrays
timeArray=[];
amplitudeArray=[];
modifiedamplitude=[];////equalized

signalfile=false; //flag
const img = document.getElementById('img');//html for specto 1
const img2 = document.getElementById('img2');//html for specto 2
var audioElement = document.getElementById("audioPlayer2");


///////////////////////////////PLOTS/////////////////////////////////////////////////
const layout = { title: 'Original Signal', yaxis: { title: 'Amplitude', fixedrange: true }, xaxis: { title: 'Time', fixedrange: true, rangemode: 'tozero'}, width : 1200 }; // fixedrange -> No pan when there is no signal
const plotDiv = document.getElementById('graph1');
const config = {
    displayModeBar: false, //disable plotlytool bar when there is no signal
}
Plotly.newPlot(plotDiv, [], layout, config);

const layout2 = { title: 'equalized Signal', yaxis: { title: 'Amplitude', fixedrange: true }, xaxis: { title: 'Time', fixedrange: true, rangemode: 'tozero'}, width : 1200 }; // fixedrange -> No pan when there is no signal
const plotDiv2 = document.getElementById('graph2');
const config2 = {
    displayModeBar: false, //disable plotlytool bar when there is no signal
}
Plotly.newPlot(plotDiv2, [], layout2, config2);
////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
// Get all the sliders
var sliders = document.querySelectorAll('.slider');

//Change frequency when slider value changes
// Create an array to store the frequency values
freq_1=[1,1,1,1,1,1,1,1,1,1];
freq_ranges=[85,102,146,190,234,278,322,366,410,454]

// Loop through each slider
sliders.forEach(function(slider, index) {
  // Add an event listener to listen for changes in the slider value
  slider.addEventListener('change', function() {
    freq_1[index] = parseInt(this.value);
    
  });
});


const inputElement = document.getElementById('sig');
// Add event listener for file input change
inputElement.addEventListener('change', (event) => {

  if (signalfile)  ////if we already uploaded a sig
    {timeArray=[];
      amplitudeArray=[]; 
      modifiedamplitude=[];
      img.setAttribute('src', '');
      img2.setAttribute('src', '');
      audioElement.src = '';

      signalfile=false;

    }



  const file = event.target.files[0];

  // Create file reader
  const reader = new FileReader();

  // Add onload event listener for when file is read
  reader.onload = (e) => {
    const fileData = e.target.result;

    
    // Decode audio data
    decodeAudioData(fileData)
      .then(buffer => {
        // Extract audio data from buffer
        const channelData = buffer.getChannelData(0); // Assuming mono audio
        const sampleRate = buffer.sampleRate;

        // Create time and amplitude arrays
        const duration = buffer.duration;
        const numSamples = Math.floor(duration * sampleRate);
      

        // Populate time and amplitude arrays
        for (let i = 0; i < numSamples; i++) {
          timeArray.push(parseFloat(i / sampleRate));
          amplitudeArray.push( parseFloat(channelData[i]));
        }
         signalfile=true;
        sendsig();
        img.src = '/spectogram'; ////drawing spectogram
        const trace={
          x: timeArray,
          y: amplitudeArray,name:"original",
          type: 'scatter',
          mode: 'lines',
          line: {
              color: 'blue'
          },
        };
        Plotly.newPlot(plotDiv, [trace], layout, config);

        
      })
      .catch(error => {
        console.error('Error decoding audio data:', error);
      });
  };

  // Read file as array buffer
  reader.readAsArrayBuffer(file);

  
  
});

function decodeAudioData(data) {
  return new Promise((resolve, reject) => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    context.decodeAudioData(data, resolve, reject);
  });
}


const Change = document.getElementById('change');

Change.onclick = async ()=>{

function equalize(callback){
  let array = [timeArray, amplitudeArray,freq_1,freq_ranges];
  $.ajax({
    type: "POST",
    url: "/calculate-equalized_sig",
    async: false,
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(array),
    dataType: "json",
    success: function(data) {
      modifiedamplitude = data.equalized_sig;
      console.log('equalized array:',modifiedamplitude);
      
      if (typeof callback === "function") {
        callback();
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    }
  });
}
equalize();
img2.src = '/spectogram2';
const trace2={
  x: timeArray,
  y: modifiedamplitude,name:"original",
  type: 'scatter',
  mode: 'lines',
  line: {
      color: 'blue'
  },
};
Plotly.newPlot(plotDiv2, [trace2], layout, config);
generateAudio();
}

function previewAudio(input) { ////playing the audio 
  var audio = document.getElementById('audioPlayer');
  var file = input.files[0];
  var reader = new FileReader();
  reader.onload = function() {
      audio.src = reader.result;
  };
  reader.readAsDataURL(file);
}


function generateAudio() {
  audioElement.src = '';

audioElement.setAttribute("src", "/generate_audio");
}





function sendsig(callback){
  let array = [timeArray, amplitudeArray];
  $.ajax({
    type: "POST",
    url: "/send_signal",
    async: false,
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(array),
    dataType: "json",
    success: function(data) {
      console.log('signal array:',data.sig);
      
      if (typeof callback === "function") {
        callback();
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    }
  });
}