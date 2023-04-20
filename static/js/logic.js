//////main arrays
timeArray=[];
amplitudeArray=[];
////equalized
modifiedtime=[];///???
modifiedamplitude=[];
spectogramfft=[];
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
        // console.log('Time array:', timeArray);
        // console.log('Amplitude array:', amplitudeArray);
        // spectogramtrial();

        console.log(amplitudeArray)

        // get_freq(amplitudeArray)
        // .then(data => {
        //   let freq = data.freq;
        //   let amp = data.amp;
        //   console.log("Frequency: ", freq);
        //   console.log("Magnitude: ", amp);

        //   plotSpectrogram('Specto', freq, timeArray, amp, plot1)



        // })
        .catch(error => {
          console.error(error);
        });
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



//function that returns frequency and magnitude for spectogram plot
function get_freq(amp_array) {
  return new Promise((resolve, reject) => {
    let array = [amp_array]
    $.ajax({
      type: "POST",
      url: "/generate_frequency",
      async: false,
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(array),
      dataType: "json",
      success: function(data) {
        let freq = data.freq;
        let amp = data.mag;
        resolve({freq, amp});
      },
      error: function(jqXHR, textStatus, errorThrown) {
        reject(errorThrown);
      }
    });
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
generateAudio();
// var audioElement = document.getElementById("audioPlayer2");
// audioElement.setAttribute("src", "/generate_audio");

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
  // $.ajax({
  //   url: '/generate_audio',
  //   type: 'GET',
  //   responseType: 'arraybuffer',
  //   // success: function(response) {
  //   //   var audioContext = new AudioContext();
  //   //   audioContext.decodeAudioData(response, function(buffer) {
  //   //     var source = audioContext.createBufferSource();
  //   //     source.buffer = buffer;
  //   //     source.connect(audioContext.destination);
  //   //     source.start();
  //   //   });
  //   // }
  // });
  var audioElement = document.getElementById("audioPlayer2");
audioElement.setAttribute("src", "/generate_audio");
}

// function spectogramtrial(){
//   // sample rate of the audio signal
// const sampleRate = 44100;

// // size of the FFT window
// const fftSize = 1024;

// // number of segments in the spectrogram
// const numSegments = 20;

// // duration of each segment in seconds
// const segmentDuration = 0.1;

// // create a canvas element
// const canvas = document.createElement('canvas');
// canvas.width = numSegments;
// canvas.height = fftSize / 2;
// document.body.appendChild(canvas);

// // get the 2D context of the canvas
// const ctx = canvas.getContext('2d');

// // calculate the hop size between segments
// const hopSize = Math.floor((segmentDuration * sampleRate) / fftSize);

// // iterate over each segment
// for (let i = 0; i < numSegments; i++) {
//   // calculate the starting sample index of the segment
//   const startIndex = i * hopSize;
  
//   // calculate the ending sample index of the segment
//   const endIndex = startIndex + fftSize;
  
//   // slice the amplitude array to obtain the segment
//   const segment = amplitudeArray.slice(startIndex, endIndex);
  
//   // apply the FFT to the segment to obtain the frequency domain signal
//   get_freq();
//   // const fft = new FFT(fftSize);
//   // fft.forward(segment);
//   const frequencyData = spectogramfft;
  
//   // calculate the power spectral density (PSD) of the segment
//   const psd = frequencyData.map(f => Math.pow(Math.abs(f), 2));
  
//   // plot the spectrogram of the segment
//   for (let j = 0; j < fftSize / 2; j++) {
//     // calculate the color of the rectangle based on the PSD value
//     const color = `rgb(${Math.floor(psd[j] * 255)}, 0, 0)`;
    
//     // draw the rectangle on the canvas
//     ctx.fillStyle = color;
//     ctx.fillRect(i, fftSize / 2 - j, 1, 1);
//   }
// }

// }
