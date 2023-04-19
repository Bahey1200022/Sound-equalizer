//////main arrays
timeArray=[];
amplitudeArray=[];
////equalized
modifiedtime=[];///???
modifiedamplitude=[];

// Get all the sliders
var sliders = document.querySelectorAll('.slider');

//Change frequency when slider value changes
// Create an array to store the frequency values
freq_1=[1,1,1,1,1,1,1,1,1,1];
freq_ranges=[440,880,1320,1760,2200,2640,3080,3520,3960,4400]

// Loop through each slider
sliders.forEach(function(slider, index) {
  // Add an event listener to listen for changes in the slider value
  slider.addEventListener('change', function() {
    // Update the corresponding frequency value in the array
    freq_1[index] = parseInt(this.value);
    // Output the updated array to the console
    // console.log(freq_1);
  });
});



//Function to plot spectogram
function plotSpectrogram(name, freq, time, amplitude, id) {
  // Define the trace for the spectrogram
  var spectrogramTrace = {
    x: time,
    y: freq,
    z: amplitude,
    type: 'heatmap',
    colorscale: 'Viridis',
  };

  // Define the layout for the plot
  var layout = {
    title: name,
    xaxis: {
      title: 'Time (seconds)',
    },
    yaxis: {
      title: 'Frequency (Hz)',
      autorange: 'reversed',
    },
  };

  // Create the plot
  Plotly.newPlot(id, [spectrogramTrace], layout);
}



const inputElement = document.getElementById('sig');

// Add event listener for file input change
inputElement.addEventListener('change', (event) => {
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

        // Use timeArray and amplitudeArray for further processing
        console.log('Time array:', timeArray);
        console.log('Amplitude array:', amplitudeArray);
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
      console.log(modifiedamplitude);
      
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
generateAudio();
// convert_to_audio(timeArray,modifiedamplitude);

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

// function convert_to_audio(modifiedt,modifiedamp){
//   var audioContext = new AudioContext();
//   var length = modifiedt.length;
//   var sampleRate = audioContext.sampleRate;
//   var buffer = audioContext.createBuffer(1, length, sampleRate);
//   var bufferData = buffer.getChannelData(0);

//   for (var i = 0; i < length; i++) {
//     bufferData[i] = modifiedamp[i];
// }

// var wavData = WavEncoder.encode(buffer);
// var wavBlob = new Blob([wavData], { type: 'audio/wav' });
// var wavUrl = URL.createObjectURL(wavBlob);
// var audio = document.getElementById('audioPlayer2');
// audio.src = wavUrl;
// audio.play();

// }
function generateAudio() {
  $.ajax({
    url: '/generate_audio',
    type: 'GET',
    responseType: 'arraybuffer',
    success: function(response) {
      var audioContext = new AudioContext();
      audioContext.decodeAudioData(response, function(buffer) {
        var source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      });
    }
  });
}