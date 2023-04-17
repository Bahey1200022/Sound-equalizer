//////main arrays
timeArray=[];
amplitudeArray=[];
////equalized
modifiedtime=[];///???
modifiedamplitude=[];

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
        const timeArray = new Float32Array(numSamples);
        const amplitudeArray = new Float32Array(numSamples);

        // Populate time and amplitude arrays
        for (let i = 0; i < numSamples; i++) {
          timeArray[i] = i / sampleRate;
          amplitudeArray[i] = channelData[i];
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


btn440.onclick = async ()=>{
let change440=document.getElementById("slider440").value;
freq=440;
function equalize(callback){
  let array = [timeArray, amplitudeArray,change440,freq];
  $.ajax({
    type: "POST",
    url: "/calculate-equalized_sig",
    async: false,
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(array),
    dataType: "json",
    success: function(data) {
      fmaxviafft = data.fftMaxMagnitude;
      if(fmaxviafft==0){fmaxviafft=18}
      console.log(fmaxviafft);
      
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
}
