//////main arrays
timeArray=[];
amplitudeArray=[];
modifiedamplitude=[];////equalized

signalfile=false; //flag
const img = document.getElementById('img');//html for specto 1
const img2 = document.getElementById('img2');//html for specto 2
var audioElement = document.getElementById("audioPlayer2");


///////////////////////////////////////USER INTERFACE//////////////////////////////////////////////////////////

const dropdownMenu = document.getElementById("dropdownMenu2");
const options = dropdownMenu.getElementsByTagName("button");
const selectedOption = document.getElementById("selected-option");
const frequencyRangeBtn = document.getElementById('frequency-range-btn');
const musicalInstrumentsBtn = document.getElementById('musical-instruments-btn');
const vowelsBtn = document.getElementById('vowels-btn');
const medicalBtn = document.getElementById('medical-btn');
const generateBtn = document.getElementById('change');

let music = false;
let vowel = false;
let med =false;

frequencyRangeBtn.addEventListener('click', () => {
  dropdownMenu.innerText = "Frequency Range";
  document.getElementById("sliders_1").style.display = "block";
  document.getElementById("sliders_2").style.display = "none";
  document.getElementById("sliders_3").style.display = "none";
  document.getElementById("sliders_4").style.display = "none";

  document.getElementById('sig').style.display = "block";
  generateBtn.style.display = "block";
  music = false;
  vowel = false;
  med=false;
});

musicalInstrumentsBtn.addEventListener('click', () => {
  dropdownMenu.innerText = "Musical Instruments";
  generateBtn.style.display = "block";
  document.getElementById('sig').style.display = "block";
  document.getElementById("sliders_1").style.display = "none";
  document.getElementById("sliders_2").style.display = "block";
  document.getElementById("sliders_3").style.display = "none";
  document.getElementById("sliders_4").style.display = "none";

  music = true;
  vowel = false;
  med=false;

});

vowelsBtn.addEventListener('click', () => {
  dropdownMenu.innerText = "Vowels";
  generateBtn.style.display = "block";
  document.getElementById('sig').style.display = "block";
  document.getElementById("sliders_1").style.display = "none";
  document.getElementById("sliders_2").style.display = "none";
  document.getElementById("sliders_3").style.display = "block";
  document.getElementById("sliders_4").style.display = "none";

  music = false;
  vowel = true;
  med=false;

});

medicalBtn.addEventListener('click', () => {
  dropdownMenu.innerText = "Medical";
  generateBtn.style.display = "block";
  document.getElementById('sig').style.display = "block";
  document.getElementById("sliders_1").style.display = "none";
  document.getElementById("sliders_2").style.display = "none";
  document.getElementById("sliders_3").style.display = "none";
  document.getElementById("sliders_4").style.display = "block";
  music = false;
  vowel = false;
  med=true;

});








///////////////////////////////PLOTS/////////////////////////////////////////////////
var trace1 = { x: [], y: [], mode: 'lines', line: { color: 'blue' }, visible: true };
var trace2 = { x: [], y: [], mode: 'lines', line: { color: 'blue' }, visible: true };
const layout = { title: 'Original Signal', yaxis: { title: 'Amplitude', fixedrange: true }, xaxis: { title: 'Time', fixedrange: true, rangemode: 'tozero'}, width : 700 }; // fixedrange -> No pan when there is no signal
const plotDiv = document.getElementById('graph1');
const config = {
    displayModeBar: true, //disable plotlytool bar when there is no signal
}
Plotly.newPlot(plotDiv, [trace1], layout, config);

const layout2 = { title: 'equalized Signal', yaxis: { title: 'Amplitude', fixedrange: true }, xaxis: { title: 'Time', fixedrange: true, rangemode: 'tozero'}, width : 700 }; // fixedrange -> No pan when there is no signal
const plotDiv2 = document.getElementById('graph2');
const config2 = {
    displayModeBar: true, //disable plotlytool bar when there is no signal
}
Plotly.newPlot(plotDiv2, [trace2], layout2, config2);

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
freq_music=[1,1];

var sliders1 = document.querySelectorAll('.slider1');
sliders1.forEach(function(slider, index) {
  // Add an event listener to listen for changes in the slider value
  slider.addEventListener('change', function() {
    freq_music[index] = parseInt(this.value);
    
  });
});
freq_vowels=[1,1,1];

var sliders2 = document.querySelectorAll('.slider2');
sliders2.forEach(function(slider, index) {
  // Add an event listener to listen for changes in the slider value
  slider.addEventListener('change', function() {
    freq_vowels[index] = parseInt(this.value);
    
  });
});
freq_med=[1];

var sliders3 = document.querySelectorAll('.slider3');
sliders3.forEach(function(slider, index) {
  // Add an event listener to listen for changes in the slider value
  slider.addEventListener('change', function() {
    freq_med[index] = parseInt(this.value);
    
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
        img.setAttribute("src",'/spectogram?' +  new Date().getTime());
        //audioElement.setAttribute("src", "/generate_audio?" + new Date().getTime());
         trace1={
          x: timeArray,
          y: amplitudeArray,name:"original",
          type: 'scatter',
          mode: 'lines',
          line: {
              color: 'blue'
          },
        };
        Plotly.newPlot(plotDiv, [trace1], layout, config);

        
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


  // Check if the musical instruments button is selected
if (music) {
  equalizemusic();
}

else if(vowel){
  equalize_vowels();
}

else if(med){
  equalize_med();}

else{
equalize();}
img2.setAttribute("src",'/specto2?' +  new Date().getTime());
//img2.src = '/specto2';
 trace2={
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

  audioElement.setAttribute("src", "/generate_audio?" + new Date().getTime()); //forcing the browser to make a new request to the server for the audio file.
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function equalizemusic(callback){
  ///////

  let array = [freq_music];
  $.ajax({
    type: "POST",
    url: "/music",
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function equalize_vowels(callback){
  let array = [freq_vowels];
  $.ajax({
    type: "POST",
    url: "/vowels",
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function equalize_med(callback){
  let array = [freq_med];
  $.ajax({
    type: "POST",
    url: "/medical",
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const hideb = document.getElementById('Show/Hide');
        const labl1 = document.getElementById('show_lbl1');


        hideb.addEventListener('change', (event) => {
            if(event.currentTarget.checked){
              document.getElementById("spectogram").style.display = "none";
              // document.getElementById("show_lbl1").style.display = "none";


            }
            else
            {
              document.getElementById("spectogram").style.display = "block";
              // document.getElementById("show_lbl1").style.display = "block";

            }
        })


        //define a boolean that changes if rewind is checked to execute it for plot2
        const hideb2 = document.getElementById('Show/Hide2');

        hideb2.addEventListener('change', (event) => {
            if(event.currentTarget.checked){
              document.getElementById("spectogram2").style.display = "none";
              // document.getElementById("show_lbl2").style.display = "none";

            }
            else
            {
              document.getElementById("spectogram2").style.display = "block";
              // document.getElementById("show_lbl2").style.display = "block";

            }
        })

////////

const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopbtn = document.getElementById('stop');
const speedSlider = document.getElementById('cinespeed');
var cinespeed = speedSlider.defaultValue; //initial value for speed
var playAnim = false;
var i = 0;
var interval;

playBtn.addEventListener('click', function() {
  // Plotly.deleteTraces(plotDiv, 1);Plotly.deleteTraces(plotDiv2, 0);
  if(!playAnim)
  {
    // Plotly.deleteTraces(plotDiv, 0);
    // Plotly.deleteTraces(plotDiv2, 0);
      playAnim = true;
      interval = setInterval(() => {
      trace1.x.push(timeArray[i]);
      trace1.y.push(amplitudeArray[i]);
      trace2.x.push(timeArray[i]);
      trace2.y.push(modifiedamplitude[i]);

      Plotly.redraw(plotDiv);
      Plotly.redraw(plotDiv2);

      i++;

      //if animation has ended reset i to 0 to start it again
      if (i >= timeArray.length) {
          clearInterval(interval);
        }
      
      Plotly.relayout(plotDiv, { xaxis: { range: [timeArray[Math.max(0, i - 100)], timeArray[i]] }});
      Plotly.relayout(plotDiv2, { xaxis: { range: [timeArray[Math.max(0, i - 100)], timeArray[i]] }});

    }, cinespeed-50);


  }
})

pauseBtn.addEventListener('click', function() {
    if(playAnim)
    {
        playAnim = false;
        clearInterval(interval);

    }
    
});

speedSlider.addEventListener('input', function() {
  cinespeed = speedSlider.max - this.value;  //slider max value - new value to reverse
  if(playAnim) {
      clearInterval(interval);
      interval = setInterval(() => {
        trace1.x.push(timeArray[i]);
        trace1.y.push(amplitudeArray[i]);
        trace2.x.push(timeArray[i]);
        trace2.y.push(modifiedamplitude[i]);
  
        Plotly.redraw(plotDiv);
        Plotly.redraw(plotDiv2);
          i++;
          
          if (i >= Time.length) {
          clearInterval(interval);
      }

      Plotly.relayout(plotDiv, { xaxis: { range: [timeArray[Math.max(0, i - 100)], timeArray[i]] }});
      Plotly.relayout(plotDiv2, { xaxis: { range: [timeArray[Math.max(0, i - 100)], timeArray[i]] }});
  }, cinespeed-50);
  }
});

stopbtn.addEventListener('click', function() {

  if(playAnim)
  {
      playAnim = false;
      clearInterval(interval);
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
  }


})

let isRelayouting = false;         //define a flag to avoid infinite loop

plotDiv.on('plotly_relayout', function(eventData) {
  if ( !isRelayouting) {
    isRelayouting = true;
    Plotly.relayout(plotDiv2, eventData)
    .then(() => {
        isRelayouting = false;
    });
}
});

plotDiv2.on('plotly_relayout', function(eventData) {
  if ( !isRelayouting) {
    isRelayouting = true;
    Plotly.relayout(plotDiv, eventData)
    .then(() => {
        isRelayouting = false;
    });
}
});       